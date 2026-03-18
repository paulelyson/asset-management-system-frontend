import { Department } from "./User";

export interface IEquipmentFilter {
  page: number;
  department: Department | string;
  search: string;
  categories: string;
  brand: string;
  equipmentType: string;
  borrow: boolean;
}

export class EquipmentFilter implements IEquipmentFilter {
  page: number;
  department: string;
  search: string;
  categories: string;
  brand: string;
  equipmentType: string;
  borrow: boolean;

  constructor(filter?: Partial<IEquipmentFilter>) {
    this.page = filter?.page || 1;
    this.department = filter?.department || '';
    this.search = filter?.search || '';
    this.categories = filter?.categories || '';
    this.brand = filter?.brand || '';
    this.equipmentType = filter?.equipmentType || '';
    this.borrow = false;
  }
}