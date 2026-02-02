import { BorrowedEquipmentStatusType } from "./BorrowedEquipment";
import { IConditionAndQuantity } from "./Equipment";
import { IUser } from "./User";

export interface IBorrowedEquipmentHistory {
  _id: string;
  borrowId: string;
  equipment: string;
  updatedStatus: BorrowedEquipmentStatusType;
  updatedConditionQuantity: IConditionAndQuantity;
  responsibleUser: IUser;
  remarks: string;
  createdAt: string,
  updatedAt: string,
  dis: boolean;
}