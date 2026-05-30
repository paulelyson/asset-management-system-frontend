import { EquipmentCondition } from "../Equipment";

export class EquipmentFilter {
  page: number = 1;
  limit: number = 25;
  department: string = '';
  search: string = '';
  categories: string[] = [];
  brand: string = '';
  equipmentType: string = '';
  condition?: EquipmentCondition;
  pending: boolean = false;
  canBeBorrowed?: boolean;
  // borrow: boolean;

  constructor(partial?: Partial<EquipmentFilter>) {
    Object.assign(this, partial);
  }
}
