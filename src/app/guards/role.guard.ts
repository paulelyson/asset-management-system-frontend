import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AssignmentRole } from '../models/data/user-profile.model';

/**
 * Returns an Observable rather than a boolean: roles now live on the server and
 * arrive over HTTP, so on a hard refresh the profile has to be fetched before
 * the question can be answered. Deciding synchronously would report "no roles"
 * for every direct navigation and bounce the user to login.
 */
export const roleGuard = (allowedRoles: AssignmentRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);

    if (!authService.hasToken()) {
      authService.logout();
      return false;
    }

    return authService.ensureProfile().pipe(
      map((profile) => {
        // No profile means the token is present but unusable (expired or
        // revoked) — the server refused to describe its own caller.
        if (!profile || !authService.hasRole(allowedRoles)) {
          authService.logout();
          return false;
        }
        return true;
      }),
    );
  };
};
