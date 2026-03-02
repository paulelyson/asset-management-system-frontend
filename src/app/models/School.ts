import { IMongoDocument } from "./MongoDocument";

export interface ISchool extends IMongoDocument {
 code: string;
 name: string;
 deleted?: boolean;
}