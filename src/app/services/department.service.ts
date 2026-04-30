import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/ApiResponse';
import { IDepartment } from '../models/Department';
import { Department } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getDepartments() {
    return this.http
      .get<ApiResponse<IDepartment[]>>(environment.api_url + '/api/department', {})
      .pipe(catchError(this.handleError));
  }

  getDepartmentById(id: string) {
    return this.http.get<ApiResponse<IDepartment>>(environment.api_url + '/api/department/' + id).pipe(catchError(this.handleError));
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
