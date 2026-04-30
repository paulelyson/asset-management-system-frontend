import { IDepartment } from "../Department";
import { IMongoDocument } from "../MongoDocument";

export enum LocationType {
  ROOM = 'room',
  GYM = 'gym',
  LABORATORY = 'laboratory',
  FIELD = 'field',
  AUDITORIUM = 'auditorium',
  OFFICE = 'office',
}


export interface ClassLocation extends IMongoDocument {
 name: string;
 type: LocationType;
 department: IDepartment
}