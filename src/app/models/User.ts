import { IDepartment } from './Department';
import { IMongoDocument } from './MongoDocument';

// type UserRole = 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
type UserStatus = 'pending_approval' | 'active' | 'deactivated' | 'rejected';

interface UserRole {
  role: 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
  department: IDepartment;
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

export interface IUser extends IMongoDocument {
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

class User implements IUser {
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  email: string;
  idNumber: string;
  roles: UserRole[];
  activated: boolean;
  account_status: UserStatus;
  deleted?: boolean | undefined;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  displayName: string;
  

  constructor(user: IUser) {
    this.firstName = user.firstName;
    this.middleName = user.middleName;
    this.lastName = user.lastName;
    this.age = user.age;
    this.email = user.email;
    this.idNumber = user.idNumber;
    this.roles = user.roles;
    this.activated = user.activated;
    this.account_status = user.account_status;
    this._id = user._id;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.__v = 0;
    this.displayName = user.firstName + ' ' + user.lastName
  }
}

export default User;
