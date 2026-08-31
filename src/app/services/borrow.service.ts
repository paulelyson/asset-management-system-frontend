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
import { getLocationId } from '../models/Equipment';
import { BorrowedEquimentFilter, IBorrowedEquimentFilter } from '../models/BorrowedEquipmentFilter';
import { AssignmentRole, UserProfile } from '../models/data/user-profile.model';
import { DisplayNamePipe } from '../pipes/displayname.pipe';
import { ApiResponse } from '../models/ApiResponse';
import { RowActionConfig, RowColumnConfig } from '@paulelyson/elyui';
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
    let params = new HttpParams({ fromObject: { page: filter.page } });
    filter.search && (params = params.append('search', filter.search));
    filter.purpose && (params = params.append('purpose', filter.purpose));
    filter.status && (params = params.append('status', filter.status ?? ''));
    return this.http
      .get<
        ApiResponse<BorrowedEquipment[]>
      >(environment.api_url + '/api/borrowed-equipment', { params })
      .pipe(catchError((err) => this.exceptionService.handleError(err)));
  }

  getRowData(
    borrowedEquipment: BorrowedEquipment,
    user: UserProfile,
    filter: BorrowedEquimentFilter,
  ): RowColumnConfig[] {
    // Every joined field below is optional — see IBorrowedEquipment. A row whose
    // reference no longer resolves still belongs in the list; it just renders blank.
    const eqpmntName = borrowedEquipment.equipment?.name ?? 'Unknown equipment';
    const course = this.displayNamePipe.transform(
      borrowedEquipment.courseOffering?.course,
      'code',
      'title',
    );
    const borrower = getDisplayName(borrowedEquipment.borrower);
    const quantity = borrowedEquipment.quantity.toString();
    const status: RowActionConfig[] = borrowedEquipment.accumulatedStatus.map((x) => {
      return {
        name: BORROW_STATUS_DISPLAY[x.status] + ' ×' + x.quantity,
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
      {
        id: 0,
        type: 'image',
        header: '',
        image: borrowedEquipment.equipment?.images?.[0]?.thumbnail ?? '',
        weight: 0.5,
      },
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

  /**
   * Decides which buttons to render. This mirrors the server's approval policy
   * rather than being it — the server re-checks everything and 403s if this is
   * wrong. Longer term the API should return what the caller may do per row so
   * there is only one copy of these rules; until then, changes here have to be
   * kept in step with `approval.policy.ts`.
   */
  getRowActions(
    user: UserProfile,
    borrowedEquipment: BorrowedEquipment,
    filter: BorrowedEquimentFilter,
  ): RowActionConfig[] {
    const actions: RowActionConfig[] = [];
    const dept = borrowedEquipment.courseOffering?.course?.department?._id;
    // Where this item is kept. Lab-staff authority is the room, not the
    // department — an assistant in another lab of the same department may not
    // hand it out.
    const equipmentLocation = getLocationId(borrowedEquipment.equipment?.location);

    const holdsRoleInDept = (role: AssignmentRole) =>
      // No resolvable department means no department-scoped role can match it.
      !!dept && user.assignments.some((a) => a.role === role && a.department?._id === dept);

    const staffsEquipmentLocation = (role: AssignmentRole) =>
      !!equipmentLocation &&
      user.assignments.some((a) => a.role === role && a.location?._id === equipmentLocation);

    const isBorrower = borrowedEquipment.borrower?._id === user._id;
    const isFaculty = borrowedEquipment.courseOffering?.instructor?._id === user._id;
    const isChairman = holdsRoleInDept('chairman');
    const isLabInCharge = staffsEquipmentLocation('lab_in_charge');
    const isLabAssistant = staffsEquipmentLocation('assistant');

    const canApprove = borrowedEquipment.accumulatedStatus.some((x) =>
      ['requested'].includes(x.status),
    );
    const canCancel = borrowedEquipment.accumulatedStatus.some((x) =>
      ['requested'].includes(x.status),
    );
    // Was ['instructor_approved', 'oic_approved'] — both deleted when the
    // status model collapsed, so the Release button never appeared.
    const canRelease = borrowedEquipment.accumulatedStatus.some((x) =>
      ['approved'].includes(x.status),
    );
    const canReturn = borrowedEquipment.accumulatedStatus.some((x) =>
      ['released'].includes(x.status),
    );
    const confirmReturns = borrowedEquipment.accumulatedStatus.some((x) =>
      ['mark_returned'].includes(x.status),
    );
    // Either party to the request may end it: the borrower withdraws, an
    // approver rejects. `canCancel` already limits this to units still sitting
    // in `requested` — the server enforces the same window via CANCELLABLE_FROM.
    const isApprover = isChairman || isLabInCharge || isFaculty;
    if (filter.enable_cancel && canCancel && (isBorrower || isApprover)) {
      actions.push({
        name: 'Cancel',
        tooltip: 'Cancel Request',
        type: 'button',
        size: 'sm',
        icon: 'cancel_outlined',
      });
    }

    //  approver | class faculty / oic / chairman of the borrowed equipment
    if (isApprover && canApprove) {
      actions.push({
        name: 'Approve',
        tooltip: 'Approve Request',
        type: 'button',
        size: 'sm',
        icon: 'thumb_up',
      });
    }

    // Lab staff hand equipment out. Was `isLabAssistant` alone, which locked
    // out a lab-in-charge working the counter with no assistant on shift.
    const isLabStaff = isLabInCharge || isLabAssistant;
    if (isLabStaff && canRelease) {
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

    // Confirming receipt is the lab side of the return handshake — the borrower
    // declares, staff confirms. Same staff set as release.
    if (isLabStaff && confirmReturns) {
      actions.push({
        icon: 'keyboard_return',
        name: 'Confirm Returns',
        tooltip: 'Confirm Returns',
        type: 'button',
        size: 'sm',
      });
    }

    // add view details
    if (filter.advanced) {
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
