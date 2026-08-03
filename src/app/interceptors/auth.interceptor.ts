import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * The endpoints that mint or destroy tokens. They must never carry an access
 * token, and a 401 from them must never trigger a refresh — refreshing in
 * response to a failed refresh is an infinite loop.
 */
const TOKEN_ENDPOINTS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

const isTokenEndpoint = (req: HttpRequest<unknown>): boolean =>
  TOKEN_ENDPOINTS.some((path) => req.url.includes(path));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (isTokenEndpoint(req)) return next(req);

  const token = localStorage.getItem('token');
  if (!token) return next(req);

  const withToken = (accessToken: string) =>
    next(req.clone({ setHeaders: { Authorization: 'Bearer ' + accessToken } }));

  // Give up and log out — but only after a refresh attempt has already failed,
  // never as the first response to a 401.
  const abandon = (err: unknown) => {
    authService.logout();
    return throwError(() => err);
  };

  // Already expired: refresh first rather than spending a request we know will
  // be rejected. This used to call logout() outright, which is why a 15-minute
  // access token meant being kicked out every 15 minutes.
  if (authService.isTokenExpired(token)) {
    return authService.refreshAccessToken().pipe(switchMap(withToken), catchError(abandon));
  }

  return withToken(token).pipe(
    catchError((err: HttpErrorResponse) => {
      // A 401 on a token we believed was valid means the server disagrees —
      // revoked, or signed with a secret that has since changed. Worth one
      // refresh attempt; anything else is a real error and belongs to the caller.
      if (err.status !== 401) return throwError(() => err);

      return authService.refreshAccessToken().pipe(switchMap(withToken), catchError(abandon));
    }),
  );
};
