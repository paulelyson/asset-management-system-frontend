import { Injectable } from '@angular/core';
import User from '../models/User';
import { IDepartment } from '../models/Department';
import { FilterDisplay } from '../models/ui/common-config.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  getFilterDisplay(
    filter: Record<string, any>,
    excludeFields: string[],
    departments: IDepartment[],
  ): FilterDisplay[] {
    // return Object.entries(filter)
    //   .map(([key, val]) => {
    //     if (key === 'department' && val) {
    //       const dept = departments.find((d) => d._id === val);
    //       return { field: key, value: dept?.code ?? 'Loading...' };
    //     }
    //     return { field: key, value: val s };
    //   })
    //   .filter((x) => x.value && !excludeFields.includes(x.field));

    return [];
  }
}
