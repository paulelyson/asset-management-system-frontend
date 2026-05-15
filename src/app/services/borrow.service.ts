import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import BorrowedEquipment, {
  BORROW_STATUS_DISPLAY,
  BORROW_STATUS_VARIANT,
  BorrowedEquipmentPayload,
  BorrowedEquipmentTransaction,
} from '../models/BorrowedEquipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '../utils/string.util';
import { BorrowedEquimentFilter, IBorrowedEquimentFilter } from '../models/BorrowedEquipmentFilter';
import { IUser } from '../models/User';
import { DisplayNamePipe } from '../pipes/displayname.pipe';
import { ApiResponse } from '../models/ApiResponse';
import { RowActionConfig, RowColumnConfig } from '../models/ui/data-row.model';
import { getVariantFromBorrowStatus } from '../modules/shared/utils/filter.util';
import { ExceptionService } from './exception.service';

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private displayNamePipe: DisplayNamePipe,
    private exceptionService: ExceptionService,
  ) {}

  createBorrowedEquipment(body: BorrowedEquipmentPayload) {
    return this.http
      .post<ApiResponse<BorrowedEquipment>>(environment.api_url + '/api/borrowed-equipment', body)
      .pipe(catchError((err) => this.exceptionService.handleError(err)));
  }

  addTransaction(body: BorrowedEquipmentTransaction, borrowId: string, equipmentId: string) {
    return this.http
      .patch<
        ApiResponse<BorrowedEquipmentTransaction>
      >(environment.api_url + `/api/borrowed-equipment/${borrowId}/equipment/${equipmentId}/transactions`, body)
      .pipe(catchError((err) => this.exceptionService.handleError(err)));
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
      .pipe(catchError((err) => this.exceptionService.handleError(err)));
  }

  getRowData(
    borrowedEquipment: BorrowedEquipment,
    user: IUser,
    filter: BorrowedEquimentFilter,
  ): RowColumnConfig[] {
    const eqpmntName = borrowedEquipment.equipment.name;
    const course = this.displayNamePipe.transform(
      borrowedEquipment.courseOffering.course,
      'code',
      'title',
    );
    const borrower = getDisplayName(borrowedEquipment.borrower);
    const quantity = borrowedEquipment.quantity.toString();
    const status: RowActionConfig[] = borrowedEquipment.accumulatedStatus.map((x) => {
      return {
        name: BORROW_STATUS_DISPLAY[x.status] + ' x' + x.quantity,
        tooltip: '',
        type: 'badge',
        size: 'sm',
        icon: '',
        variant: BORROW_STATUS_VARIANT[x.status],
      };
    });
    const dateOfUse = this.datePipe.transform(borrowedEquipment.dateOfUse.start, 'mediumDate');
    const actions = this.getRowActions(user, borrowedEquipment, filter);
    const purpose = borrowedEquipment.purpose;
    return [
      { id: 0, type: 'image', header: '', weight: 0.5 },
      {
        id: 1,
        type: 'title',
        header: 'Equipment',
        content: [eqpmntName],
        subtitle: purpose,
        weight: 2,
      },
      { id: 2, type: 'text', header: 'Course', content: course, weight: 1 },
      { id: 3, type: 'text', header: 'Borrower', content: borrower, weight: 1.5 },
      { id: 4, type: 'text', header: 'Qty', content: quantity, weight: 0.3 },
      { id: 5, type: 'action', header: 'Status', actions: status, weight: 1 },
      { id: 6, type: 'text', header: 'Date of Use', content: dateOfUse as string, weight: 0.8 },
      { id: 7, type: 'action', header: '', actions: actions, weight: 1 },
    ];
  }

  getRowActions(
    user: IUser,
    borrowedEquipment: BorrowedEquipment,
    filter: BorrowedEquimentFilter,
  ): RowActionConfig[] {
    let actions: RowActionConfig[] = [];
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
    const canCancel = borrowedEquipment.accumulatedStatus.some((x) =>
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
    // enable cancel if the borrowed equipment is still in requested status
    if (filter.enable_cancel && canCancel) {
      actions.push({
        name: 'Cancel',
        tooltip: 'Cancel Request',
        type: 'button',
        size: 'sm',
        icon: 'cancel_outlined',
      });
    }

    //  approver | class faculty / oic / chairman of the borrowed equipment
    if ((isChairman || isLabInCharge || isFaculty) && canApprove) {
      actions.push({
        name: 'Approve',
        tooltip: 'Approve Request',
        type: 'button',
        size: 'sm',
        icon: 'thumb_up',
      });
    }

    // can release as lab assistant
    if (isLabAssistant && canRelease) {
      actions.push({
        name: 'Release',
        tooltip: 'Release Equipment',
        type: 'button',
        size: 'sm',
        icon: 'lock_open',
      });
    }

    // // mark as return
    if (isBorrower && canReturn) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Return',
        tooltip: 'Return Equipment',
        type: 'button',
        size: 'sm',
      });
    }

    // confirm returns
    if (isLabAssistant && confirmReturns) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Confirm Returns',
        tooltip: 'Confirm Returns',
        type: 'button',
        size: 'sm',
      });
    }

    // add view details
    if (filter.info_and_transaction) {
      actions.push({
        name: 'View Detail',
        tooltip: 'View Detail',
        type: 'button',
        size: 'sm',
        icon: 'info_outlined',
      });

      // add Transactions
      actions.push({
        name: 'Transactions',
        tooltip: 'Transactions',
        type: 'button',
        size: 'sm',
        icon: 'history',
      });
    }

    return actions;
  }
}
