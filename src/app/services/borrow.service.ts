import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BorrowedEquipment,
  BorrowedEquipmentStatus,
  IBorrowingDetails,
} from '../models/BorrowedEquipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../modules/shared/row-display/row-display.component';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '../utils/string.util';

interface ApiResponse {
  data: BorrowedEquipment[];
  message: string;
  success: boolean;
}

export interface BorrowedEquipmentStatusExt extends BorrowedEquipmentStatus {
  id: string;
  equipment: string;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  createBorrowedEquipment(body: IBorrowingDetails): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(environment.api_url + '/api/borrowequipment', body, {})
      .pipe(catchError(this.handleError));
  }

  updateBorrowedEquipmentStatus(body: BorrowedEquipmentStatusExt[]) {
    return this.http
      .patch<ApiResponse>(environment.api_url + '/api/borrowequipment/updatestatus', body)
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

  getRowDisplayContent(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    const length = borrowedEquipment.borrowedEquipmentStatus.length;
    const _status = borrowedEquipment.borrowedEquipmentStatus[length - 1];
    const status = `${_status.quantity} ${_status.status} ${_status.condition}`;
    const date = this.datePipe.transform(borrowedEquipment.dateOfUseStart, 'mediumDate');
    const name = getDisplayName(borrowedEquipment.borrower);
    let contents: RowDisplayContent[] = [
      { id: 1, type: 'text', content: [borrowedEquipment.className] },
      { id: 2, type: 'text', content: [name] },
      { id: 3, type: 'badge', content: [status] },
      { id: 4, type: 'text', content: [date as string] },
    ];
    return contents;
  }

  getRowDisplayActions(): RowDisplayActionConfig[] {
    return [
      { name: 'lock_open', tooltip: 'Release', type: 'primary', size: 'md' },
      { name: 'edit', tooltip: 'Update qty, condition, & status', type: 'primary', size: 'md' },
    ];
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
