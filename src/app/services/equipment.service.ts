import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConditionAndQuantity, IEquipment } from '../models/Equipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { EquipmentFilter } from '../models/filters/equipment-filter.model';
import {
  BorrowedEquipmentStatusTypeAndQuantity,
} from '../models/BorrowedEquipment';
import { ApiResponse } from '../models/ApiResponse';
import { RowColumnConfig } from '../models/ui/data-row.model';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  constructor(private http: HttpClient) {}

  getEquipment(filter: EquipmentFilter) {
    let params = new HttpParams({
      fromObject: {
        page: filter.page,
        search: filter.search,
        department: filter.department,
        brand: filter.brand ?? ''
      },
    });
    return this.http
      .get<ApiResponse<IEquipment[]>>(environment.api_url + '/api/equipment', { params })
      .pipe(catchError(this.handleError));
  }

  getStatus(equipmentId: string) {
    return this.http.get<ApiResponse<BorrowedEquipmentStatusTypeAndQuantity[]>>(environment.api_url + `/api/equipment/${equipmentId}/status`)
      .pipe(catchError(this.handleError));
  }

  getDistinct(field: string, department?: string): Observable<string[]> {
    let params = new HttpParams();
    department && (params = params.append('department', department));
    return this.http.get<ApiResponse<string[]>>(environment.api_url + '/api/equipment/distinct/' + field, { params })
      .pipe(
        map((resp) => resp.data as string[]),
        catchError(this.handleError),
      );
  }

  updateEquipment(equipment: IEquipment) {
    return this.http.patch<ApiResponse<IEquipment>>(environment.api_url + '/api/equipment/' + equipment._id, equipment)
      .pipe(
        map((resp) => resp.data),
        catchError(this.handleError),
      );
  }

  getRowData(equipment: IEquipment): RowColumnConfig[] {
    const conditions = equipment.conditionAndQuantity.map((x) => x.quantity + ' ' + x.condition);
    return [
      { id: 0, type: 'image', header: '', weight: 0.5 },
      { id: 1, type: 'title', header: 'Name', content: [equipment.name], weight: 2 },
      { id: 2, type: 'text', header: 'Categories', content: equipment.categories, weight: 0.5 },
      { id: 3, type: 'text', header: 'Brand', content: [equipment.brand], weight: 0.5 },
      { id: 4, type: 'badge', header: 'Condition', content: conditions, weight: 0.5 },
      // { id: 5, type: 'action', header: '', actions: actions, weight: 1 },
    ];
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
