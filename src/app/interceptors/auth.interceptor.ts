import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const expired = token && authService.isTokenExpired(token);
  if (token && !expired) {
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  } else {
    authService.logout();
  }

  return next(req);
};
