import { ICourse } from './Course';
import { IMongoDocument } from './MongoDocument';
import User, { IUser } from './User';

interface CourseOfferingSchedule {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface ICourseOffering extends IMongoDocument {
  code: string;
  course: ICourse;
  instructor: User;
  schedule: CourseOfferingSchedule[];
}

class CourseOffering implements ICourseOffering {
  code: string;
  course: ICourse;
  instructor: User;
  schedule: CourseOfferingSchedule[];
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;

  constructor(courseOffering: ICourseOffering) {
    this.code = courseOffering.code;
    this.course = courseOffering.course;
    this.instructor = courseOffering.instructor;
    this.schedule = courseOffering.schedule;
    this._id = courseOffering._id;
    this.createdAt = courseOffering.createdAt;
    this.updatedAt = courseOffering.updatedAt;
    this.__v = 0;
  }

  get displayName() {
    return this.code + ' ' + 'bakit di nalang';
  }
}

export default CourseOffering;
