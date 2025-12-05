import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBorrowingDetails } from '../models/BorrowedEquipment';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse {
  data: null;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(private http: HttpClient) {}

  createBorrowedEquipment(body: IBorrowingDetails): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(environment.api_url + '/api/borrowequipment', body, {})
      .pipe(catchError(this.handleError));
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
