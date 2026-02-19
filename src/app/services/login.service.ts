import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Subject, throwError } from 'rxjs';

interface ApiResponse {
  data: string;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  loggedInSubject = new BehaviorSubject<boolean>(this.hasToken())
  constructor(private http: HttpClient) {}

  login(accoundId: string, password: string) {
    const body = { schoolId: accoundId, password };
    return this.http.post<ApiResponse>(environment.api_url + '/api/login', body).pipe(
      map((resp) => resp.data),
      catchError(this.handleError),
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.loggedInSubject.asObservable()
  }
}
