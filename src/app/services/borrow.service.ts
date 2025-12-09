import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BorrowedEquipment,
  BorrowedEquipmentStatus,
  BorrowedEquipmentStatusType,
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
    const status = `${_status.quantity} ${this.getBorrowStatusPlaceholder(_status.status)}`;
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

  getNextBorrowStatus(current: BorrowedEquipmentStatusType) {
    const statusTransitions: Record<BorrowedEquipmentStatusType, BorrowedEquipmentStatusType[]> = {
      requested: ['faculty_approved', 'faculty_rejected', 'oic_approved', 'oic_rejected'],
      faculty_approved: ['released'],
      oic_approved: ['released'],
      faculty_rejected: [], // no next state
      oic_rejected: [], // no next state
      released: ['mark_returned'],
      mark_returned: ['returned'],
      returned: [], // final state,
      unreturned: [],
      system_reset: [],
    };
    return statusTransitions[current] ?? [];
  }

  getBorrowStatusPlaceholder(status: BorrowedEquipmentStatusType) {
    const statusPlaceHolder: Record<BorrowedEquipmentStatusType, string> = {
      requested: 'For Approval',
      faculty_approved: 'For Release',
      oic_approved: 'For Release',
      faculty_rejected: 'Rejected by Instructor',
      oic_rejected: 'Rejected by LIC',
      released: 'Release',
      mark_returned: 'Mark as Returned',
      returned: 'Return Confirmed',
      unreturned: '',
      system_reset: '',
    };

    return statusPlaceHolder[status] ?? '';
  }

  computeCurrentQtyStatus(
    borrowedEquipmentStatus: BorrowedEquipmentStatus[]
  ): Record<BorrowedEquipmentStatusType, number> {
    const result: Record<BorrowedEquipmentStatusType, number> = {
      requested: 0,
      faculty_approved: 0,
      faculty_rejected: 0,
      oic_approved: 0,
      oic_rejected: 0,
      released: 0,
      mark_returned: 0,
      returned: 0,
      unreturned: 0,
      system_reset: 0,
    };

    // Accumulate initial counts
    // for (const tx of transactions) {
    //   result[tx.status] += tx.item;
    // }

    // // Subtract transitions (previous → next)
    // for (let i = 0; i < transactions.length - 1; i++) {
    //   const current = transactions[i];
    //   const next = transactions[i + 1];

    //   // Any next transaction reduces the current bucket
    //   result[current.status] -= next.item;
    // }

    return result;
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
