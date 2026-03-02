import { IDepartment } from "./Department";
import { IMongoDocument } from "./MongoDocument";

// type UserRole = 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
type UserStatus = 'pending_approval' | 'active' | 'deactivated' | 'rejected';

interface UserRole {
  role: 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
  department: IDepartment
}

export type Department =
  | 'civil_engineering'
  | 'computer_engineering'
  | 'electrical_engineering'
  | 'electronics_and_communications_engineering'
  | 'industrial_engineering'
  | 'mechanical_engineering'
  | 'dmsep'
  | 'ecl';

export const DEPARTMENTS: Department[] = [
  'civil_engineering',
  'computer_engineering',
  'electrical_engineering',
  'electronics_and_communications_engineering',
  'industrial_engineering',
  'mechanical_engineering',
  'dmsep',
  'ecl',
];


export interface IUser extends IMongoDocument{
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  email: string;
  idNumber: string;
  roles: UserRole[];
  activated: boolean;
  account_status: UserStatus;
  deleted?: boolean;
}
