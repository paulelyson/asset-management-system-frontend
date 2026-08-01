import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const expired = token && authService.isTokenExpired(token);
  if (token && !expired) {
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  } else if (expired) {
    authService.logout();
  }

  return next(req);
};
