import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BorrowedEquipment, IBorrowingDetails } from '../models/BorrowedEquipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../modules/shared/row-display/row-display.component';

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

  getBorrowedEquipment(): Observable<BorrowedEquipment[]> {
    let params = new HttpParams({});
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/borrowequipment', { params })
      .pipe(
        map((resp) => resp.data),
        catchError(this.handleError)
      );
  }

  getRowDisplayContent(): RowDisplayContent[] {
    let contents: RowDisplayContent[] = [];
    contents.push(
      {
        id: 1,
        type: 'text',
        content: ['Lorem Ipsum'],
      },
      {
        id: 2,
        type: 'text',
        content: ['Lorem Ipsum'],
      },
      {
        id: 3,
        type: 'badge',
        content: ['Lorem Ipsum'],
      },
      {
        id: 4,
        type: 'text',
        content: ['Lorem Ipsum'],
      }
    );
    return contents;
  }

  getRowDisplayActions(): RowDisplayActionConfig[] {
    return [
      {
        name: 'lock_open',
        tooltip: 'Release',
        type: 'primary',
        size: 'md',
      },
    ];
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
