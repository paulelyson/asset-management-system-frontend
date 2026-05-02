import { IEquipment } from '../Equipment';
import { IMongoDocument } from '../MongoDocument';
import { Variant } from '../ui/common-config.model';
import { IUser } from '../User';

export enum ChangeAction {
  CREATE = 'create',
  UPDATE = 'update',
}

export enum ChangeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const CHANGELOG_STATUS_VARIANT: Record<ChangeStatus, Variant> = {
  [ChangeStatus.PENDING]: 'warning',
  [ChangeStatus.APPROVED]: 'success',
  [ChangeStatus.REJECTED]: 'danger',
};

interface FieldChange {
  field: string;
  previousValue: any;
  newValue: any;
}

export interface EquipmentChangeLogs extends IMongoDocument {
  equipment: IEquipment;
  action: ChangeAction;
  changes: FieldChange[];
  performedBy: IUser;
  status: ChangeStatus;
  resolvedBy: IUser | null;
  resolvedAt: Date | null;
  resolverRemarks: string | null;
}
