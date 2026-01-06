import { Department } from "./User";

export interface IBorrowedEquimentFilter {
  page?: number;
  department?: Department
  search?: string;
}