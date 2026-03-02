import { Injectable } from '@angular/core';
import { Department, IUser } from '../models/User';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse {
  data: string;
  message: string;
  success: boolean;
}

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

  isDepartmentChair(user: IUser, deptCode: string) {
    const found = user.roles.find(u=> u.role == 'chairman' && u.department.code == deptCode);
    return !!found
  }

  isDepartmentOIC(user: IUser, deptCode: string) {
      const found = user.roles.find(u=> u.role == 'chairman' && u.department.code == deptCode);
    return !!found
  }

  login(accoundId: string, password: string) {
    const body = { schoolId: accoundId, password };
    return this.http.post<ApiResponse>(environment.api_url + '/api/login', body).pipe(
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

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
