import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (!authService.hasToken()) {
    authService.logout();
    return false;
  }

  // Warm the profile here, not just in roleGuard: components behind this guard
  // read roles synchronously (default department, "can I see this button"), and
  // on a hard refresh nothing else would have loaded it for them.
  return authService.ensureProfile().pipe(map(() => true));
};
