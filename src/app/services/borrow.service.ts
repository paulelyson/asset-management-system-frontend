import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import BorrowedEquipment, {
  BorrowedEquipmentPayload,
  BorrowedEquipmentTransaction,
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

interface ApiResponse {
  data: BorrowedEquipment[];
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
  ) {
  }

  createBorrowedEquipment(body: BorrowedEquipmentPayload): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(environment.api_url + '/api/borrowed-equipment', body)
      .pipe(catchError(this.handleError));
  }

  addTransaction(body: BorrowedEquipmentTransaction, borrowId: string, equipmentId: string) {
    return this.http
      .patch<ApiResponse>(environment.api_url + `/api/borrowed-equipment/${borrowId}/equipment/${equipmentId}/transactions`, body)
      .pipe(catchError(this.handleError));
  }

  isEquipmentRequested(equipmentid: string) {
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/borrowequipment/isrequested/' + equipmentid)
      .pipe(catchError(this.handleError));
  }

  getBorrowedEquipment(filter: IBorrowedEquimentFilter): Observable<BorrowedEquipment[]> {
    let params = new HttpParams();
    params = params.append('page', filter.page ?? '');
    params = params.append('search', filter.search ?? '');
    params = params.append('purpose', filter.purpose ?? '');
    params = params.append('status', filter.status ?? '');
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/borrowed-equipment')
      .pipe(
        map((resp) => resp.data),
        catchError(this.handleError),
      );
  }

  // getProgressLogs(borrowId: string, equipment: string): Observable<IBorrowedEquipmentHistory[]> {
  //   let params = new HttpParams();
  //   params = params.append('borrowId', borrowId ?? '');
  //   params = params.append('equipment', equipment ?? '');
  //   return this.http
  //     .get<ProgressLogsApiResponse>(environment.api_url + '/api/borrowequipment/history', {
  //       params,
  //       headers,
  //     })
  //     .pipe(
  //       map((resp) => resp.data),
  //       catchError(this.handleError),
  //     );
  // }

  getRowDisplayContent(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    const status = borrowedEquipment.accumulatedStatus.map((x) => x.quantity + ' ' + x.status);
    const course = borrowedEquipment.courseOffering.code;
    const borrower = getDisplayName(borrowedEquipment.borrower);
    const dateOfUse = this.datePipe.transform(borrowedEquipment.dateOfUse.start, 'mediumDate');

    let contents: RowDisplayContent[] = [
      { id: 0, type: 'text', content: [borrowedEquipment.equipment.name], span: 'wide' },
      { id: 1, type: 'text', content: [course], span: 'mid' },
      { id: 2, type: 'text', content: [borrower], span: 'mid' },
      { id: 3, type: 'text', content: [borrowedEquipment.quantity.toString()], span: 'narrow' },
      { id: 4, type: 'badge', content: status, span: 'mid' },
      { id: 5, type: 'text', content: [dateOfUse as string], span: 'narrow' },
    ];
    return contents;
  }

  getRowDisplayActions(
    user: IUser,
    borrowedEquipment: BorrowedEquipment,
    displayInfoAndHistory?: boolean,
  ): RowDisplayActionConfig[] {
    let actions: RowDisplayActionConfig[] = [];

    let isFaculty = borrowedEquipment.courseOffering.instructor._id === user._id;
    //  approver | class faculty / oic / chairman of the borrowed equipment
    // TODO add is Chairman / IsOIC for override approvals
    if (isFaculty && borrowedEquipment.transactions.some((x) => ['requested'].includes(x.status))) {
      actions.push({
        name: 'Approve',
        tooltip: 'Approve Request',
        type: 'primary',
        size: 'md',
        icon: 'thumb_up',
      });
    }

    // // can release as reads
    // if (
    //   // user.assignedTo.includes(borrowedEquipment.classDepartment) &&
    //   this.getCurrentStatus(borrowedEquipment.latestStatus).some((x) =>
    //     ['oic_approved', 'instructor_approved'].includes(x),
    //   )
    // ) {
    //   actions.push({
    //     name: 'Release',
    //     tooltip: 'Release Equipment',
    //     type: 'primary',
    //     size: 'md',
    //     icon: 'lock_open',
    //   });
    // }

    // // mark as return
    // if (
    //   user._id == borrowedEquipment.borrower._id &&
    //   this.getCurrentStatus(borrowedEquipment.latestStatus).includes('released')
    // ) {
    //   actions.push({
    //     icon: 'keyboard_return',
    //     name: 'Return',
    //     tooltip: 'Return Equipment',
    //     type: 'primary',
    //     size: 'md',
    //   });
    // }

    // // confirm returns
    // if (
    //   // user.assignedTo.includes(borrowedEquipment.classDepartment) &&
    //   this.getCurrentStatus(borrowedEquipment.latestStatus).some((x) =>
    //     ['mark_returned'].includes(x),
    //   )
    // ) {
    //   actions.push({
    //     icon: 'keyboard_return',
    //     name: 'Confirm Returns',
    //     tooltip: 'Confirm Returns',
    //     type: 'primary',
    //     size: 'md',
    //   });
    // }

    // // cancelled
    // // actions.push({
    // //   name: 'Cancel Request',
    // //   tooltip: 'Cancel Request',
    // //   type: 'primary',
    // //   size: 'sm',
    // //   icon: 'cancel',
    // // });

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
