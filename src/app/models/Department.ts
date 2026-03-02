import { IMongoDocument } from "./MongoDocument";
import { ISchool } from "./School";

export interface IDepartment extends IMongoDocument {
 code: string;
 name: string;
 school: ISchool;
 deleted?: boolean;
}