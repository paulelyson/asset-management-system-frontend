type UserRole = 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
type UserStatus = 'pending_approval' | 'active' | 'deactivated' | 'rejected';

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


export interface IUser {
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  email: string;
  schoolId: string;
  department: Department[];
  role: UserRole[];
  password: string;
  activated: boolean;
  account_status: UserStatus;
  dis: boolean;
}
