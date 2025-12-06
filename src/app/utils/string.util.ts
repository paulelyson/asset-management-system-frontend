import { IUser } from "../models/User";

export const getDisplayName = (user: IUser): string => user.firstName + ' ' + user.lastName;