import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/ApiResponse';
import { AssignmentRole, UserAssignment, UserProfile } from '../models/data/user-profile.model';

type TokenPair = { access_token: string; refresh_token: string };

/**
 * What the access token actually carries now — identity only. `roles` used to
 * be in here and is gone: the server loads assignments fresh on every request
 * so that revoking someone's role takes effect immediately rather than whenever
 * their token happens to expire. Read roles from `profile()`, never from this.
 */
export interface TokenData {
  _id: string;
  idNumber: string;
  name: string;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  /**
   * Cached because the call sites that need roles — route guards, `computed()`
   * in templates, form defaults — are all synchronous, while the profile itself
   * is an HTTP call. A signal rather than a plain field so that `computed()`
   * consumers recompute when it lands.
   */
  private profileSignal = signal<UserProfile | null>(null);
  readonly profile = this.profileSignal.asReadonly();

  /** The in-flight token exchange, shared by every caller — see refreshAccessToken. */
  private refreshInFlight: Observable<string> | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  /** Identity straight off the token. Does NOT include roles — see TokenData. */
  getUser(): TokenData {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token as string) as TokenData;
    return decoded;
  }

  login(accoundId: string, password: string) {
    const body = { username: accoundId, password };
    return this.http
      .post<ApiResponse<TokenPair>>(environment.api_url + '/api/auth/login', body)
      .pipe(
        map((resp) => resp.data),
        // Token storage lives here rather than in the login dialog so that the
        // profile can be fetched as part of logging in — everything downstream
        // reads roles synchronously and would see an empty profile otherwise.
        tap((tokens) => this.storeTokens(tokens)),
        switchMap((tokens) => this.loadProfile().pipe(map(() => tokens))),
        tap(() => this.loggedInSubject.next(true)),
        catchError(this.handleError),
      );
  }

  private storeTokens(tokens: TokenPair): void {
    localStorage.setItem('token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  /**
   * Exchanges the refresh token for a new pair.
   *
   * Shared while in flight: a page that fires several requests at once would
   * otherwise send several refreshes, and since the server *rotates* on every
   * exchange, the second one would present an already-used token — which it
   * treats as theft and responds to by revoking the entire token family. So
   * deduplicating here isn't an optimization, it's what stops a burst of
   * parallel requests from logging the user out.
   */
  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    this.refreshInFlight = this.http
      .post<ApiResponse<TokenPair>>(environment.api_url + '/api/auth/refresh', {
        refresh_token: refreshToken,
      })
      .pipe(
        map((resp) => resp.data),
        tap((tokens) => this.storeTokens(tokens)),
        map((tokens) => tokens.access_token),
        // Before shareReplay, so it runs once when the request settles rather
        // than once per subscriber. Clearing the handle here means the *next*
        // 401 starts a fresh exchange instead of replaying a spent one.
        finalize(() => (this.refreshInFlight = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshInFlight;
  }

  /** Fetches and caches the caller's assignments. */
  loadProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<UserProfile>>(environment.api_url + '/api/auth/profile')
      .pipe(
        map((resp) => resp.data),
        tap((profile) => this.profileSignal.set(profile)),
      );
  }

  /**
   * Resolves to the cached profile, fetching it first if this is a fresh page
   * load. Guards must await this — on a hard refresh the token is in
   * localStorage but the profile is not, and a synchronous `hasRole` would
   * report "no roles" and bounce the user to login.
   */
  ensureProfile(): Observable<UserProfile | null> {
    const cached = this.profileSignal();
    if (cached) return of(cached);
    if (!this.hasToken()) return of(null);
    return this.loadProfile().pipe(catchError(() => of(null)));
  }

  isLoggedIn() {
    return this.loggedInSubject.asObservable();
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Fire-and-forget: revoke the refresh token server-side so it can't be
      // replayed. Errors are swallowed on purpose — clearing the session
      // locally must happen whether or not the server can be reached.
      this.http
        .post(environment.api_url + '/api/auth/logout', { refresh_token: refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    localStorage.clear();
    this.profileSignal.set(null);
    this.refreshInFlight = null;
    this.loggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // No account identifier: the backend scopes the change to the authenticated
  // caller (req.user._id). Passing one used to let you change someone else's
  // password.
  changePassword(currentPassword: string, newPassword: string) {
    const body = { currentPassword, newPassword };
    return this.http
      .patch<ApiResponse<TokenPair>>(environment.api_url + '/api/auth/change-password', body)
      .pipe(catchError(this.handleError));
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      // No `exp` means we can't reason about it — treat as expired rather than
      // as valid forever.
      if (!decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      // Unparseable token in localStorage. The interceptor calls this on every
      // request, so throwing here would break the whole app rather than just
      // this session.
      return true;
    }
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  assignments(): UserAssignment[] {
    return this.profileSignal()?.assignments ?? [];
  }

  hasRole(allowedRoles: AssignmentRole[]): boolean {
    return this.assignments().some((a) => allowedRoles.includes(a.role));
  }

  /**
   * The department to default list filters to. Takes the first assignment that
   * has one, regardless of role — a student's department is an affiliation
   * fact, which is exactly the right default for "show me my department's
   * equipment". It grants nothing; the server decides what they can see.
   *
   * Returns undefined for users with no department-scoped assignment at all,
   * which the old `roles[0].department._id` would have thrown on.
   */
  primaryDepartmentId(): string | undefined {
    return this.assignments().find((a) => a.department?._id)?.department?._id;
  }

  private handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error?.errors || err.error?.message || err.message));
  }
}
