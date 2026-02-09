import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEquipment } from '../models/Equipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IEquipmentFilter } from '../models/EquipmentFilter';
import { Department } from '../models/User';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../modules/shared/row-display/row-display.component';

interface ApiResponse {
  data: IEquipment[] | string[];
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  constructor(private http: HttpClient) {}

  getEquipment(filter: IEquipmentFilter): Observable<IEquipment[]> {
    let params = new HttpParams({
      fromObject: {
        page: filter.page,
        search: filter.search ?? '',
        department: filter.department ?? '',
        brand: filter.brand ?? '',
        categories: filter.categories ?? '',
        equipmentType: filter.equipmentType ?? '',
        borrow: filter.borrow ?? '',
      },
    });
    return this.http.get<ApiResponse>(environment.api_url + '/api/equipment', { params }).pipe(
      map((resp) => resp.data as IEquipment[]),
      catchError(this.handleError),
    );
  }

  getDistinctValues(field: string, department: Department): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('field', field);
    params = params.append('department', department);
    return this.http
      .get<ApiResponse>(environment.api_url + '/api/equipment/distinct', { params })
      .pipe(
        map((resp) => resp.data as string[]),
        catchError(this.handleError),
      );
  }

  getRowDisplayContent(equipment: IEquipment) {
    const conditions = equipment.conditionAndQuantity.map((x) => x.quantity + ' ' + x.condition);
    let contents: RowDisplayContent[] = [
      { id: 0, type: 'text', content: [equipment.name], span: 'wide' },
      { id: 1, type: 'text', content: equipment.categories, span: 'mid' },
      { id: 2, type: 'text', content: [equipment.brand], span: 'mid' },
      { id: 3, type: 'text', content: [equipment.totalQuantity.toString()], span: 'narrow' },
      { id: 4, type: 'badge', content: conditions, span: 'mid' },
      { id: 5, type: 'text', content: [equipment.location], span: 'narrow' },
    ];
    return contents;
  }

  getRowDisplayActions(): RowDisplayActionConfig[] {
    return [
      {
        name: 'Details',
        tooltip: 'View Details',
        type: 'primary',
        size: 'sm',
        icon: 'info',
      },
      {
        name: 'Update',
        tooltip: 'Update equipment',
        type: 'primary',
        size: 'sm',
        icon: 'edit',
      },
    ];
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
