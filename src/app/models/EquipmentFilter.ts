import { Department } from "./User";

export interface IEquipmentFilter {
  page: number;
  department?: Department
  search?: string;
  categories?: string;
  brand?: string;
  equipmentType?: string;
}
