import { IConditionAndQuantity, IEquipment } from './Equipment';
import { Department, IUser } from './User';

export type BorrowedEquipmentStatusType =
  | 'requested'
  | 'faculty_approved'
  | 'faculty_rejected'
  | 'oic_approved'
  | 'oic_rejected'
  | 'released'
  | 'pending_return'
  | 'returned'
  | 'unreturned'
  | 'system_reset';

export interface BorrowedEquipmentStatus extends IConditionAndQuantity {
  status: BorrowedEquipmentStatusType;
  remarks?: string;
}

export interface IBorrowedEquipment {
  _id?: string;
  equipment: string;
  quantity: number;
  borrowedEquipmentStatus: BorrowedEquipmentStatus[];
}

export interface IBorrowingDetails {
  borrower: string;
  classDepartment: Department;
  faculty: string;
  purpose: string;
  classCode: string;
  className: string;
  dateOfUseStart: Date;
  dateOfUseEnd: Date;
  timeOfUseStart: string;
  timeOfUseEnd: string;
  borrowedEquipment: IBorrowedEquipment[];
  dis: boolean;
}


export interface BorrowedEquipment {
	borrower: IUser;
  classDepartment: Department;
  faculty: IUser;
  purpose: string;
  classCode: string;
  className: string;
  dateOfUseStart: Date;
  dateOfUseEnd: Date;
  timeOfUseStart: string;
  timeOfUseEnd: string;
  equipment: IEquipment;
  quantity: number;
  borrowedEquipmentStatus: BorrowedEquipmentStatus[];
  remarks: string;
}