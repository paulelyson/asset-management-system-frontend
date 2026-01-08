import { Injectable } from '@angular/core';
import { Department, IUser } from '../models/User';
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

  isDepartmentChair(user: IUser, department: Department) {
    return user.role.includes('chairman') && user.department.includes(department);
  }

  isDepartmentOIC(user: IUser, department: Department) {
    return user.role.includes('oic') && user.department.includes(department);
  }
}
