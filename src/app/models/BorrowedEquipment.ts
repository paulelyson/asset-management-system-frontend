import CourseOffering from './CourseOffering';
import { IConditionAndQuantity, IEquipment } from './Equipment';
import { IMongoDocument } from './MongoDocument';
import { Variant } from '@paulelyson/elyui';
import User, { Department, IUser } from './User';

/**
 * Lifecycle states, mirroring the backend enum.
 *
 * The actor used to be baked into the status (`instructor_approved` vs
 * `oic_approved`, and the matching `_rejected` pair). That conflated *what
 * happened* with *who did it* — who did it is on the transaction's
 * `actedAsRole`. Render "cancelled by the instructor" from that, not from the
 * status. `system_reset` is gone entirely; it was never a reachable state.
 */
export type BorrowedEquipmentStatusType =
  | 'requested'
  | 'approved'
  | 'released'
  | 'mark_returned'
  | 'returned'
  | 'cancelled'
  | 'unreturned';

export type BorrowedEquipmentPurpose = 'class_use' | 'research' | 'instructional' | 'others';

export const BORROWED_EQUIPMENT_PURPOSE: BorrowedEquipmentPurpose[] = [
  'class_use',
  'research',
  'instructional',
  'others',
];

export const BORROWED_EQUIPMENT_STATUS: BorrowedEquipmentStatusType[] = [
  'requested',
  'approved',
  'released',
  'mark_returned',
  'returned',
  'cancelled',
  'unreturned',
];

export type BorrowedEquipmentStatusTypeAndQuantity = { 
  status: BorrowedEquipmentStatusType;
  quantity: number 
};

/** Still out with the borrower — i.e. not yet returned, cancelled or written off. */
export const IN_CIRCULATION_STATUS: BorrowedEquipmentStatusType[] = [
  'requested',
  'approved',
  'released',
  'mark_returned',
];

export const BORROW_STATUS_VARIANT: Record<BorrowedEquipmentStatusType, Variant> = {
  requested: 'neutral',
  approved: 'accent',
  released: 'warning',
  mark_returned: 'warning',
  returned: 'success',
  cancelled: 'danger',
  unreturned: 'danger',
};

export const BORROW_STATUS_DISPLAY: Record<BorrowedEquipmentStatusType, string> = {
  requested: 'Requested',
  approved: 'Approved',
  released: 'Released',
  mark_returned: 'Marked Returned',
  returned: 'Returned',
  cancelled: 'Cancelled',
  unreturned: 'Unreturned',
};


export interface BorrowedEquipmentTransaction extends Partial<IMongoDocument> {
  quantity: number;
  condition: string;
  status: BorrowedEquipmentStatusType;
  updatedBy?: IUser;
  remarks?: string;
}

/**
 * A row of the borrow list — the *joined* shape the aggregation produces, not a
 * stored document.
 *
 * `borrower`, `courseOffering` and `equipment` are optional because they
 * genuinely can be absent: those `$unwind`s use `preserveNullAndEmptyArrays`, so
 * a reference that no longer resolves blanks one field instead of deleting the
 * whole record from the list *and from the total count*. Rendering has to cope
 * with that rather than assume the join succeeded.
 */
export interface IBorrowedEquipment extends IMongoDocument {
  trackId: string;
  borrower?: User;
  purpose: BorrowedEquipmentPurpose;
  courseOffering?: CourseOffering;
  dateOfUse: {
    start: Date;
    end: Date;
  };
  equipment?: IEquipment;
  quantity: number;
  transactions: BorrowedEquipmentTransaction[];
  accumulatedStatus: Pick<BorrowedEquipmentTransaction, 'quantity' | 'status'>[];
  deleted?: boolean;
}

// Only what the caller actually decides. `borrower` is stamped from the token,
// and `instructor`/`department` are resolved server-side from the course
// offering — the backend DTO no longer declares any of the three, so sending
// them just gets them stripped.
export interface BorrowedEquipmentPayload {
  purpose: BorrowedEquipmentPurpose;
  courseOffering: string;
  dateOfUse: {
    start: Date | string;
    end: Date | string;
  };
  borrowedEquipment: {
    equipment: string;
    quantity: number;
    transactions: Pick<BorrowedEquipmentTransaction, 'quantity' | 'condition' | 'status'>[];
  }[];
}

class BorrowedEquipment implements IBorrowedEquipment {
  trackId: string;
  borrower?: User;
  purpose: BorrowedEquipmentPurpose;
  courseOffering?: CourseOffering;
  dateOfUse: { start: Date; end: Date };
  equipment?: IEquipment;
  quantity: number;
  transactions: BorrowedEquipmentTransaction[];
  accumulatedStatus: Pick<BorrowedEquipmentTransaction, 'quantity' | 'status'>[];
  deleted?: boolean | undefined;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;

  constructor(borrowedEquipment: IBorrowedEquipment) {
    this.trackId = borrowedEquipment.trackId;
    this.borrower = borrowedEquipment.borrower;
    this.purpose = borrowedEquipment.purpose;
    this.courseOffering = borrowedEquipment.courseOffering;
    this.dateOfUse = borrowedEquipment.dateOfUse;
    this.equipment = borrowedEquipment.equipment;
    this.quantity = borrowedEquipment.quantity;
    this.transactions = borrowedEquipment.transactions;
    this._id = borrowedEquipment._id;
    this.accumulatedStatus = borrowedEquipment.accumulatedStatus;
    this.createdAt = borrowedEquipment.createdAt;
    this.updatedAt = borrowedEquipment.updatedAt;
    this.__v = borrowedEquipment.__v;
  }
}

export default BorrowedEquipment;
