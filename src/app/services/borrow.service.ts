import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BorrowedEquipment, IBorrowingDetails } from '../models/BorrowedEquipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse {
  data: BorrowedEquipment[];
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

  getBorrowedEquipment(): Observable<BorrowedEquipment[]>  {
    let params = new HttpParams({});
    return this.http.get<ApiResponse>(environment.api_url + '/api/borrowequipment', { params }).pipe(
      map((resp) => resp.data),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
