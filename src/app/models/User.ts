import { IDepartment } from './Department';
import { IMongoDocument } from './MongoDocument';

// type UserRole = 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';
type UserStatus = 'pending_approval' | 'active' | 'deactivated' | 'rejected';

/**
 * @deprecated Roles no longer live on the user document — they moved to the
 * Assignment collection, which supports location scoping and multiple
 * assignments per user. Read them from `GET /api/auth/profile` via
 * `AuthService.profile()`; see `UserAssignment` in
 * `models/data/user-profile.model.ts`.
 *
 * Kept only because the login/registration screens still reference the role
 * names for display.
 */
export interface UserRole {
  role: 'administrator' | 'dean' | 'chairman' | 'lab_in_charge' | 'instructor' | 'assistant' | 'student';
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
  // `roles` used to be here. The API stopped returning it when assignments
  // moved to their own collection — it was reading as `undefined` on every user
  // object, not merely unused.
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
  activated: boolean;
  account_status: UserStatus;
  deleted?: boolean | undefined;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;

  constructor(user: IUser) {
    this.firstName = user.firstName;
    this.middleName = user.middleName;
    this.lastName = user.lastName;
    this.age = user.age;
    this.email = user.email;
    this.idNumber = user.idNumber;
    this.activated = user.activated;
    this.account_status = user.account_status;
    this._id = user._id;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.__v = 0;
  }
}

export default User;
