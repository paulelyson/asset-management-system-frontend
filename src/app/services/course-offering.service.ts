import { Injectable } from '@angular/core';
import CourseOffering from '../models/CourseOffering';
import { environment } from '../../environments/environment';
import { catchError, map, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface ApiResponse {
  data: CourseOffering[];
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CourseOfferingService {
  constructor(private http: HttpClient) {}

  getCourseOfferings() {
    return this.http.get<ApiResponse>(environment.api_url + '/api/course-offering', {}).pipe(
      map((resp) => resp.data),
      catchError(this.handleError),
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
