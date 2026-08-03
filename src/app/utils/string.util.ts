import { IUser } from '../models/User';

// Accepts undefined: joined refs on a borrow row can legitimately be absent.
export const getDisplayName = (user?: IUser | null): string =>
  user ? user.firstName + ' ' + user.lastName : '';

export const isObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);
