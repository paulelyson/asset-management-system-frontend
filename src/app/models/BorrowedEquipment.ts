import CourseOffering from './CourseOffering';
import { IConditionAndQuantity, IEquipment } from './Equipment';
import { IMongoDocument } from './MongoDocument';
import User, { Department, IUser } from './User';

export type BorrowedEquipmentStatusType =
  | 'requested'
  | 'faculty_approved'
  | 'faculty_rejected'
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
  'faculty_approved',
  'faculty_rejected',
  'oic_approved',
  'oic_rejected',
  'released',
  'mark_returned',
  'returned',
  'unreturned',
  'cancelled',
  'system_reset',
];

export const IN_CIRCULATION_STATUS: BorrowedEquipmentStatusType[] = ['requested', 'faculty_approved', 'oic_approved', 'released', 'mark_returned'];


interface BorrowedEquipmentTransaction extends IMongoDocument {
  quantity: number;
  condition: string;
  status: string;
}

export interface IBorrowedEquipment extends IMongoDocument {
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

export interface BorrowedEquipmentPayload {
  borrower: string;
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
