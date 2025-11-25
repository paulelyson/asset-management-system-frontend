import { Department } from "./User";

type EquipmentCondition = 'functional' | 'defective' | 'obsolete' | 'lost' | 'for_checkup' | 'turned_over';
type EquipmentStatus = 'acquired' | 'returned';
type EquipmentAvailability = 'available' | 'borrowed' | 'unreturned';
type EquipmentInventoryType = 'inventory' | 'non_inventory';
type Matter = 'solid' | 'liquid' | 'gas';

interface IConditionAndQuantity {
  condition: EquipmentCondition;
  quantity: number;
}

interface IEquipmentImage {
  thumbnail: string;
  midsize: string;
  original: string;
}

export interface IEquipment {
  _id: string;
  serialNo: string;
  equipmentType: string;
  categories: string[];
  name: string;
  brand: string;
  color: string;
  modelNo: string;
  totalQuantity: number;
  conditionAndQuantity: IConditionAndQuantity[];
  unit: string;
  matter: Matter;
  description: string;
  status: EquipmentStatus;
  dateAcquired: Date;
  images: IEquipmentImage[];
  remarks: string;
  inventorytag: boolean;
  checkedBy: string;
  department: Department;
  inventorytype: EquipmentInventoryType;
  location: string;
  confirmed: boolean;
  warrantyPeriod: Date;
  availability: EquipmentAvailability;
  dis: boolean;
}
