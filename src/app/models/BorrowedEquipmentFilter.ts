import { BorrowedEquipmentPurpose, BorrowedEquipmentStatusType } from './BorrowedEquipment';

export interface IBorrowedEquimentFilter {
  page: number;
  search: string;
  status?: BorrowedEquipmentStatusType;
  purpose?: BorrowedEquipmentPurpose;
  info_and_transaction: boolean;
  enable_cancel: boolean;
}

export class BorrowedEquimentFilter implements IBorrowedEquimentFilter {
  page: number;
  search: string;
  status?: BorrowedEquipmentStatusType;
  purpose?: BorrowedEquipmentPurpose;
  info_and_transaction: boolean;
  enable_cancel: boolean;

  constructor(filter?: Partial<IBorrowedEquimentFilter>) {
    this.page = filter?.page || 1;
    this.search = filter?.search || '';
    this.status = filter?.status;
    this.purpose = filter?.purpose;
    this.info_and_transaction = filter?.info_and_transaction || false;
    this.enable_cancel = filter?.enable_cancel || false;
  }
}
