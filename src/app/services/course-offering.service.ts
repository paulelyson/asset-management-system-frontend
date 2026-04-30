import { Injectable } from '@angular/core';
import CourseOffering from '../models/CourseOffering';
import { environment } from '../../environments/environment';
import { catchError, map, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class CourseOfferingService {
  constructor(private http: HttpClient) {}

  getCourseOfferings() {
    let params = new HttpParams();
    params = params.append('limit', 1000)
    return this.http.get<ApiResponse<CourseOffering[]>>(environment.api_url + '/api/course-offering', { params }).pipe(
      map((resp) => resp.data),
      catchError(this.handleError),
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
