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
import { IBorrowedEquimentFilter } from '../models/BorrowedEquipmentFilter';
import { IUser } from '../models/User';
import { AuthService } from './auth.service';

interface ApiResponse {
  data: BorrowedEquipment[];
  message: string;
  success: boolean;
}

const STATUS_FLOW: BorrowedEquipmentStatusType[] = [
  'requested',
  'faculty_approved',
  'oic_approved',
  'released',
  'mark_returned',
  'returned',
];

export interface BorrowedEquipmentStatusExt extends BorrowedEquipmentStatus {
  id: string;
  equipment: string;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

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

  getBorrowedEquipment(filter: IBorrowedEquimentFilter): Observable<BorrowedEquipment[]> {
    let params = new HttpParams();
    params = params.append('page', filter.page ?? '');
    params = params.append('search', filter.search ?? '');
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
    const statuses = this.computeCurrentQtyStatus(borrowedEquipment.borrowedEquipmentStatus);
    const date = this.datePipe.transform(borrowedEquipment.dateOfUseStart, 'mediumDate');
    const name = getDisplayName(borrowedEquipment.borrower);
    let contents: RowDisplayContent[] = [
      { id: 1, type: 'text', content: [borrowedEquipment.className] },
      { id: 2, type: 'text', content: [name] },
      { id: 3, type: 'badge', content: statuses },
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

  computeCurrentQtyStatus(borrowedEquipmentStatus: BorrowedEquipmentStatus[]) {
    if (!borrowedEquipmentStatus?.length) return [];

    // sort chronologically
    const sorted = [...borrowedEquipmentStatus].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // initialize counters
    const counts = new Map<BorrowedEquipmentStatusType, number>();
    STATUS_FLOW.forEach((s) => counts.set(s, 0));

    for (const tx of sorted) {
      const index = STATUS_FLOW.indexOf(tx.status);

      // add to current status
      counts.set(tx.status, counts.get(tx.status)! + tx.quantity);

      // subtract from previous status (if any)
      if (index > 0) {
        const prev = STATUS_FLOW[index - 1];
        counts.set(prev, counts.get(prev)! - tx.quantity);
      }
    }

    // return only non-zero statuses
    const result = Array.from(counts.entries())
      .filter(([_, qty]) => qty > 0)
      .map(([status, quantity]) => ({ status, quantity }));
    return result
      .filter((x) => x.quantity > 0)
      .map((x) => `${x.quantity} ${this.getBorrowStatusPlaceholder(x.status)}`);
  }

  getCurrentStatus(
    borrowedEquipmentStatus: BorrowedEquipmentStatus[]
  ): BorrowedEquipmentStatusType[] {
    if (!borrowedEquipmentStatus?.length) return [];

    // sort chronologically
    const sorted = [...borrowedEquipmentStatus].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // initialize counters
    const counts = new Map<BorrowedEquipmentStatusType, number>();
    STATUS_FLOW.forEach((s) => counts.set(s, 0));

    for (const tx of sorted) {
      const index = STATUS_FLOW.indexOf(tx.status);

      // add to current status
      counts.set(tx.status, counts.get(tx.status)! + tx.quantity);

      // subtract from previous status (if any)
      if (index > 0) {
        const prev = STATUS_FLOW[index - 1];
        counts.set(prev, counts.get(prev)! - tx.quantity);
      }
    }

    // return only non-zero statuses
    const result = Array.from(counts.entries())
      .filter(([_, qty]) => qty > 0)
      .map(([status, quantity]) => ({ status, quantity }));

    return result.filter((x) => x.quantity > 0).map((x) => x.status);
  }

  getRowDisplayActions(
    user: IUser,
    borrowedEquipment: BorrowedEquipment
  ): RowDisplayActionConfig[] {
    console.log(this.computeCurrentQtyStatus(borrowedEquipment.borrowedEquipmentStatus));
    let actions: RowDisplayActionConfig[] = [];
    let isDeptChair = this.authService.isDepartmentChair(user, borrowedEquipment.classDepartment);
    let isDeptOIC = this.authService.isDepartmentOIC(user, borrowedEquipment.classDepartment);
    //  approver | class faculty / oic / chairman of the borrowed equipment
    if (
      user._id == borrowedEquipment.faculty._id ||
      isDeptChair ||
      (isDeptOIC &&
        this.getCurrentStatus(borrowedEquipment.borrowedEquipmentStatus).includes('requested'))
    ) {
      actions.push({ name: 'thumb_up', tooltip: 'Approve', type: 'primary', size: 'md' });
    }

    return actions;
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
