import { Injectable } from '@angular/core';
import { Department, IUser } from '../models/User';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/ApiResponse';

type AccessToken = { access_token: string };

export interface TokenData extends IUser {
  name: string;
  iat: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  getUser(): TokenData {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token as string) as TokenData;
    return decoded;
  }

  login(accoundId: string, password: string) {
    const body = { username: accoundId, password };
    return this.http.post<ApiResponse<AccessToken>>(environment.api_url + '/api/auth/login', body).pipe(
      map((resp) => resp.data),
      catchError(this.handleError),
    );
  }

  isLoggedIn() {
    return this.loggedInSubject.asObservable();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['']);
  }

  changePassword(idNumber: string, currentPassword: string, newPassword: string) {
    const body = { username: idNumber, currentPassword, newPassword };
    return this.http.patch<ApiResponse<AccessToken>>(environment.api_url + '/api/auth/change-password', body).pipe(
      catchError(this.handleError),
    );
  }

  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.errors || err.error));
  }
}
