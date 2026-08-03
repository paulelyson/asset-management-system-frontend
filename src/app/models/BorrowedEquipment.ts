import CourseOffering from './CourseOffering';
import { IConditionAndQuantity, IEquipment } from './Equipment';
import { IMongoDocument } from './MongoDocument';
import { Variant } from './ui/common-config.model';
import User, { Department, IUser } from './User';

export type BorrowedEquipmentStatusType =
  | 'requested'
  | 'instructor_approved'
  | 'instructor_rejected'
  | 'oic_approved'
  | 'oic_rejected'
  | 'released'
  | 'mark_returned'
  | 'returned'
  | 'unreturned'
  | 'cancelled'
  | 'system_reset';

export type BorrowedEquipmentPurpose = 'class_use' | 'research' | 'instructional' | 'others';

export const BORROWED_EQUIPMENT_PURPOSE: BorrowedEquipmentPurpose[] = [
  'class_use',
  'research',
  'instructional',
  'others',
];

export const BORROWED_EQUIPMENT_STATUS: BorrowedEquipmentStatusType[] = [
  'requested',
  'instructor_approved',
  'instructor_rejected',
  'oic_approved',
  'oic_rejected',
  'released',
  'mark_returned',
  'returned',
  'unreturned',
  'cancelled',
  'system_reset',
];

export type BorrowedEquipmentStatusTypeAndQuantity = { 
  status: BorrowedEquipmentStatusType;
  quantity: number 
};

export const IN_CIRCULATION_STATUS: BorrowedEquipmentStatusType[] = ['requested', 'instructor_approved', 'oic_approved', 'released', 'mark_returned'];

export const BORROW_STATUS_VARIANT: Record<BorrowedEquipmentStatusType, Variant> = {
    requested: 'neutral',
    instructor_approved: 'accent',
    oic_approved: 'accent',
    released: 'warning',
    oic_rejected: 'danger',
    mark_returned: 'warning',
    returned: 'success',
    unreturned: 'danger',
    system_reset: 'danger',
    cancelled: 'danger',
    instructor_rejected: 'danger',
  }; {
}

export const BORROW_STATUS_DISPLAY: Record<BorrowedEquipmentStatusType, string> = {
    requested: 'Requested',
    instructor_approved: 'Approved',
    oic_approved: 'Approved',
    released: 'Released',
    oic_rejected: 'Cancelled',
    mark_returned: 'Marked Returned',
    returned: 'Returned',
    unreturned: 'Unreturend',
    system_reset: 'System Reset',
    cancelled: 'Cancelled',
    instructor_rejected: 'Cancelled',
  }; {
}


export interface BorrowedEquipmentTransaction extends Partial<IMongoDocument> {
  quantity: number;
  condition: string;
  status: BorrowedEquipmentStatusType;
  updatedBy?: IUser;
  remarks?: string;
}

export interface IBorrowedEquipment extends IMongoDocument {
  trackId: string;
  borrower: User;
  purpose: BorrowedEquipmentPurpose;
  courseOffering: CourseOffering;
  dateOfUse: {
    start: Date;
    end: Date;
  };
  equipment: IEquipment;
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
  borrower: User;
  purpose: BorrowedEquipmentPurpose;
  courseOffering: CourseOffering;
  dateOfUse: { start: Date; end: Date };
  equipment: IEquipment;
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
