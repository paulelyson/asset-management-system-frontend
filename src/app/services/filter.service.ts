import { Injectable } from '@angular/core';
import User from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  
  getFilterDisplay(filter: Record<string, any>, excludeFields: string[], user: User) {
    return Object.entries(filter)
      .map(([key, val]) => {
        if (key === 'department') {
          const department = user.roles.find(role => role.department._id === val)?.department;
          return { field: key, value: department ? department.code : '' };
        }
        return { field: key, value: val };
      })
      .filter((x) => x.value && !excludeFields.includes(x.field));
  }
}
