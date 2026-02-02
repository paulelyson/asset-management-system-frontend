import { BorrowedEquipmentPurpose, BorrowedEquipmentStatusType } from './BorrowedEquipment';
import { Department } from './User';

export interface IBorrowedEquimentFilter {
  page?: number;
  department?: Department;
  search?: string;
  status?: BorrowedEquipmentStatusType;
  purpose?: BorrowedEquipmentPurpose;
  needed_action?: boolean;
  info_and_history?: boolean;
}
