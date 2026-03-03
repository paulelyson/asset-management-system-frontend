import { IDepartment } from "./Department";
import { IMongoDocument } from "./MongoDocument";

export interface ICourse extends IMongoDocument {
 code: string;
 title: string;
 department: IDepartment;
}