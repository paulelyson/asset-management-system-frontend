import { BorrowedEquipmentStatusType } from "./BorrowedEquipment";
import { IConditionAndQuantity } from "./Equipment";

export interface IBorrowedEquipmentHistory {
  _id: string;
  borrowId: string;
  equipment: string;
  updatedStatus: BorrowedEquipmentStatusType;
  updatedConditionQuantity: IConditionAndQuantity;
  responsibleUser: string;
  remarks: string;
  dis: boolean;
}