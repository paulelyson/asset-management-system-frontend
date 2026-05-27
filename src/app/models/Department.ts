import { IMongoDocument } from "./MongoDocument";
import { ISchool } from "./School";

export interface IDepartment extends IMongoDocument {
 code: string;
 name: string;
 school: ISchool;
 deleted?: boolean;
}

export class Department implements IDepartment {
  code: string = '';
  name: string = '';
  school: ISchool = { _id: '', code: '', name: '', createdAt: new Date(), updatedAt: new Date(), __v: 0 };
  deleted?: boolean | undefined;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  __v: number = 0;
  _id: string = '';

  constructor(partial?: Partial<IDepartment>) {
    Object.assign(this, partial);
  }
}