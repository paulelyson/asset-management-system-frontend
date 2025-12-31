import { Injectable } from '@angular/core';
import { IUser } from '../models/User';
import { jwtDecode } from 'jwt-decode';

export interface TokenData extends IUser {
  name: string;
  iat: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUser(): TokenData {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token as string) as TokenData;
    return decoded;
  }
}
