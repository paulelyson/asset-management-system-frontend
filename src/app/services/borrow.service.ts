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
import { DisplayNamePipe } from '../pipes/displayname.pipe';
import { ApiResponse } from '../models/ApiResponse';
import { RowColumnConfig } from '../models/ui/data-row.model';

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private displayNamePipe: DisplayNamePipe,
  ) {}

  createBorrowedEquipment(body: BorrowedEquipmentPayload) {
    return this.http
      .post<ApiResponse<BorrowedEquipment>>(environment.api_url + '/api/borrowed-equipment', body)
      .pipe(catchError(this.handleError));
  }

  addTransaction(body: BorrowedEquipmentTransaction, borrowId: string, equipmentId: string) {
    return this.http
      .patch<
        ApiResponse<BorrowedEquipmentTransaction>
      >(environment.api_url + `/api/borrowed-equipment/${borrowId}/equipment/${equipmentId}/transactions`, body)
      .pipe(catchError(this.handleError));
  }

  getBorrowedEquipment(filter: IBorrowedEquimentFilter) {
    let params = new HttpParams();
    // params = params.append('page', filter.page ?? '');
    // params = params.append('search', filter.search ?? '');
    // params = params.append('purpose', filter.purpose ?? '');
    filter.status && (params = params.append('status', filter.status ?? ''));
    return this.http
      .get<
        ApiResponse<BorrowedEquipment[]>
      >(environment.api_url + '/api/borrowed-equipment', { params })
      .pipe(catchError(this.handleError));
  }

  getRowData(borrowedEquipment: BorrowedEquipment): RowColumnConfig[] {
    const eqpmntName = borrowedEquipment.equipment.name;
    const course = this.displayNamePipe.transform(borrowedEquipment.courseOffering.course, 'code', 'title');
    const borrower = getDisplayName(borrowedEquipment.borrower);
    const quantity = borrowedEquipment.quantity.toString();
    const status = borrowedEquipment.accumulatedStatus.map((x) => x.quantity + ' ' + x.status);
    const dateOfUse = this.datePipe.transform(borrowedEquipment.dateOfUse.start, 'mediumDate');
    return [
      { id: 0, type: 'image', header: '', weight: 0.5 },
      { id: 1, type: 'title', header: 'Equipment', content: [eqpmntName], weight: 2 },
      { id: 2, type: 'text', header: 'Course', content: course, weight: 1 },
      { id: 3, type: 'text', header: 'Borrower', content: borrower, weight: 1.5 },
      { id: 4, type: 'text', header: 'Quantity', content: quantity, weight: 0.5 },
      { id: 5, type: 'text', header: 'Status', content: status, weight: 1 },
      { id: 6, type: 'text', header: 'Date of Use', content: dateOfUse as string, weight: 1 },

    ]
  }

  getRowDisplayContent(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    const status = borrowedEquipment.accumulatedStatus.map((x) => x.quantity + ' ' + x.status);
    const course = this.displayNamePipe.transform(
      borrowedEquipment.courseOffering.course,
      'code',
      'title',
    );
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
    enableCancel: boolean = false,
  ): RowDisplayActionConfig[] {
    let actions: RowDisplayActionConfig[] = [];
    const isBorrower = borrowedEquipment.borrower._id == user._id;
    const isFaculty = borrowedEquipment.courseOffering.instructor._id === user._id;
    const isLabInCharge = user.roles.some((role) => {
      const dept = borrowedEquipment.courseOffering.course.department._id;
      return role.department._id == dept && role.role == 'lab_in_charge';
    });
    const isChairman = user.roles.some((role) => {
      const dept = borrowedEquipment.courseOffering.course.department._id;
      return role.department._id == dept && role.role == 'chairman';
    });
    const isLabAssistant = user.roles.some((role) => {
      const dept = borrowedEquipment.courseOffering.course.department._id;
      return role.department._id == dept && role.role == 'assistant';
    });
    const canApprove = borrowedEquipment.accumulatedStatus.some((x) =>
      ['requested'].includes(x.status),
    );
    const canRelease = borrowedEquipment.accumulatedStatus.some((x) =>
      ['instructor_approved', 'oic_approved'].includes(x.status),
    );
    const canReturn = borrowedEquipment.accumulatedStatus.some((x) =>
      ['released'].includes(x.status),
    );
    const confirmReturns = borrowedEquipment.accumulatedStatus.some((x) =>
      ['mark_returned'].includes(x.status),
    );
    //  approver | class faculty / oic / chairman of the borrowed equipment
    if ((isChairman || isLabInCharge || isFaculty) && canApprove) {
      actions.push({
        name: 'Approve',
        tooltip: 'Approve Request',
        type: 'primary',
        size: 'md',
        icon: 'thumb_up',
      });

      if (enableCancel) {
        actions.push({
          name: 'Cancel Request',
          tooltip: 'Cancel Request',
          type: 'primary',
          size: 'sm',
          icon: 'cancel',
        });
      }
    }

    // can release as lab assistant
    if (isLabAssistant && canRelease) {
      actions.push({
        name: 'Release',
        tooltip: 'Release Equipment',
        type: 'primary',
        size: 'md',
        icon: 'lock_open',
      });
    }

    // // mark as return
    if (isBorrower && canReturn) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Return',
        tooltip: 'Return Equipment',
        type: 'primary',
        size: 'md',
      });
    }

    // confirm returns
    if (isLabAssistant && confirmReturns) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Confirm Returns',
        tooltip: 'Confirm Returns',
        type: 'primary',
        size: 'md',
      });
    }

    // add view details
    if (displayInfoAndHistory) {
      actions.push({
        name: 'View Detail',
        tooltip: 'View Detail',
        type: 'primary',
        size: 'md',
        icon: 'info',
      });

      // add Transactions
      actions.push({
        name: 'Transactions',
        tooltip: 'Transactions',
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
