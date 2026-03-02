import { Department } from "./User";

export interface IEquipmentFilter {
  page: number;
  department: Department | string;
  search?: string;
  categories?: string;
  brand?: string;
  equipmentType?: string;
  borrow?: boolean;
}
