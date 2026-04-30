import { EquipmentCondition } from "../Equipment";

export class EquipmentFilter {
  page: number = 1;
  department: string = '';
  search: string = '';
  categories: string[] = [];
  brand: string = '';
  equipmentType: string = '';
  condition?: EquipmentCondition;
  // borrow: boolean;

  constructor(partial?: Partial<EquipmentFilter>) {
    Object.assign(this, partial);
  }
}
