import { BorrowedEquipmentPurpose, BorrowedEquipmentStatusType } from './BorrowedEquipment';
import { EquipmentFilter } from './filters/equipment-filter.model';

export interface IBorrowedEquimentFilter {
  page: number;
  search?: string;
  status?: BorrowedEquipmentStatusType;
  purpose?: BorrowedEquipmentPurpose;
  advanced?: boolean;
  enable_cancel?: boolean;
}

export class BorrowedEquimentFilter implements IBorrowedEquimentFilter {
  page: number = 1;
  search?: string;
  status?: BorrowedEquipmentStatusType;
  purpose?: BorrowedEquipmentPurpose;
  advanced?: boolean;
  enable_cancel?: boolean;
  constructor(partial?: Partial<IBorrowedEquimentFilter>) {
    Object.assign(this, partial);
  }

}
