import { IUser } from '../models/User';

export const getDisplayName = (user: IUser): string =>
  user ? user.firstName + ' ' + user.lastName : '';

export const isObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);
