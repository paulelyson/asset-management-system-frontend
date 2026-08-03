import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
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
        tap((tokens) => {
          localStorage.setItem('token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }),
        switchMap((tokens) => this.loadProfile().pipe(map(() => tokens))),
        tap(() => this.loggedInSubject.next(true)),
        catchError(this.handleError),
      );
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
    localStorage.clear();
    this.profileSignal.set(null);
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
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
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
