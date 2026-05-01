import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/User';

export const roleGuard = (allowedRoles: UserRole['role'][]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const user = authService.getUser();

    if (!authService.hasToken()) {
      authService.logout();
      return false;
    }

    // check if any of the user's roles match the allowed roles
    const hasRole = authService.hasRole(allowedRoles, user);

    if (!hasRole) {
      authService.logout();
      return false;
    }

    return true;
  };
};
