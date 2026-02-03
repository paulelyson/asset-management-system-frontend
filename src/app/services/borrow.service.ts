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
import { IBorrowedEquipmentHistory } from '../models/BorrowedEquipmentHistory';

interface ApiResponse {
  data: BorrowedEquipment[];
  message: string;
  success: boolean;
}

interface ProgressLogsApiResponse {
  data: IBorrowedEquipmentHistory[];
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
  token: string;
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private authService: AuthService,
  ) {
    this.token = localStorage.getItem('token')!;
  }

  createBorrowedEquipment(body: IBorrowingDetails): Observable<ApiResponse> {
    const headers = { Authorization: this.token };
    return this.http
      .post<ApiResponse>(environment.api_url + '/api/borrowequipment', body, { headers })
      .pipe(catchError(this.handleError));
  }

  updateBorrowedEquipmentStatus(body: BorrowedEquipmentStatusExt[]) {
    const headers = { Authorization: this.token };
    return this.http
      .patch<ApiResponse>(environment.api_url + '/api/borrowequipment/updatestatus', body, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  isEquipmentRequested(equipmentid: string) {
    const headers = { Authorization: this.token };
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/borrowequipment/isrequested/' + equipmentid, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getBorrowedEquipment(filter: IBorrowedEquimentFilter): Observable<BorrowedEquipment[]> {
    let params = new HttpParams();
    const headers = { Authorization: this.token };

    params = params.append('page', filter.page ?? '');
    params = params.append('search', filter.search ?? '');
    params = params.append('purpose', filter.purpose ?? '');
    params = params.append('status', filter.status ?? '');
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/borrowequipment', { params, headers })
      .pipe(
        map((resp) => resp.data),
        catchError(this.handleError),
      );
  }

  getProgressLogs(borrowId: string, equipment: string): Observable<IBorrowedEquipmentHistory[]> {
    let params = new HttpParams();
    const headers = { Authorization: this.token };
    params = params.append('borrowId', borrowId ?? '');
    params = params.append('equipment', equipment ?? '');
    return this.http
      .get<ProgressLogsApiResponse>(environment.api_url + '/api/borrowequipment/history', {
        params,
        headers,
      })
      .pipe(
        map((resp) => resp.data),
        catchError(this.handleError),
      );
  }

  getRowDisplayContent(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    const statuses = borrowedEquipment.latestStatus;
    const date = this.datePipe.transform(borrowedEquipment.dateOfUseStart, 'mediumDate');
    const name = getDisplayName(borrowedEquipment.borrower);
    const faculty = getDisplayName(borrowedEquipment.faculty);
    let contents: RowDisplayContent[] = [
      { id: 0, type: 'text', content: [borrowedEquipment.equipment.name], span: 'wide' },
      { id: 1, type: 'text', content: [borrowedEquipment.className], span: 'mid' },
      { id: 2, type: 'text', content: [name], span: 'mid' },
      { id: 3, type: 'text', content: [borrowedEquipment.quantity.toString()], span: 'narrow' },
      { id: 4, type: 'badge', content: statuses, span: 'mid' },
      { id: 5, type: 'text', content: [date as string], span: 'narrow' },
    ];
    return contents;
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
      cancelled: 'cancelled',
    };

    return statusPlaceHolder[status] ?? '';
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
      cancelled: [],
    };
    return statusTransitions[current] ?? [];
  }

  getCurrentStatus(latestStatus: string[]): BorrowedEquipmentStatusType[] {
    const status_only= latestStatus.map(status => status.split(' ')[1]) as BorrowedEquipmentStatusType[]
    return status_only
  }

  getRowDisplayActions(
    user: IUser,
    borrowedEquipment: BorrowedEquipment,
    displayInfoAndHistory?: boolean,
  ): RowDisplayActionConfig[] {
    let actions: RowDisplayActionConfig[] = [];
    let isDeptChair = this.authService.isDepartmentChair(user, borrowedEquipment.classDepartment);
    let isDeptOIC = this.authService.isDepartmentOIC(user, borrowedEquipment.classDepartment);
    //  approver | class faculty / oic / chairman of the borrowed equipment
    if (
      (user._id == borrowedEquipment.faculty._id || isDeptChair || isDeptOIC) &&
      this.getCurrentStatus(borrowedEquipment.latestStatus).includes('requested')
    ) {
      actions.push({
        name: 'Approve',
        tooltip: 'Approve Request',
        type: 'primary',
        size: 'md',
        icon: 'thumb_up',
      });
    }

    // can release as reads
    if (
      user.assignedTo.includes(borrowedEquipment.classDepartment) &&
      this.getCurrentStatus(borrowedEquipment.latestStatus).some((x) =>
        ['oic_approved', 'faculty_approved'].includes(x),
      )
    ) {
      actions.push({
        icon: 'lock_open',
        name: 'Release',
        tooltip: 'Release',
        type: 'primary',
        size: 'md',
      });
    }

    // mark as return
    if (
      user._id == borrowedEquipment.borrower._id &&
      this.getCurrentStatus(borrowedEquipment.latestStatus).includes('released')
    ) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Return Equipment',
        tooltip: 'Return Equipment',
        type: 'primary',
        size: 'md',
      });
    }

    // confirm returns
    if (
      // user.assignedTo.includes(borrowedEquipment.classDepartment) &&
      this.getCurrentStatus(borrowedEquipment.latestStatus).some((x) =>
        ['mark_returned'].includes(x),
      )
    ) {
      actions.push({
        name: 'Confirm Return',
        tooltip: 'Confirm Return',
        type: 'primary',
        size: 'md',
        icon: 'check',
      });
    }

    // cancelled

    actions.push({
      name: 'Cancel Request',
      tooltip: 'Cancel Request',
      type: 'primary',
      size: 'sm',
      icon: 'cancel',
    });

    // add view details
    if (displayInfoAndHistory) {
      actions.push({
        name: 'View Detail',
        tooltip: 'View Detail',
        type: 'primary',
        size: 'md',
        icon: 'info',
      });

      // add progress logs
      actions.push({
        name: 'Progress Logs',
        tooltip: 'Progress Logs',
        type: 'primary',
        size: 'md',
        icon: 'history',
      });
    }

    return actions;
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
