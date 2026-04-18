import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConditionAndQuantity, IEquipment } from '../models/Equipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { EquipmentFilter, IEquipmentFilter } from '../models/EquipmentFilter';
import { Department } from '../models/User';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../modules/shared/row-display/row-display.component';
import { BorrowedEquipmentStatusType, BorrowedEquipmentStatusTypeAndQuantity } from '../models/BorrowedEquipment';
import { ApiResponse } from '../models/ApiResponse';


@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  constructor(private http: HttpClient) {}

  getEquipment(filter: EquipmentFilter) {
    console.log({filter});
    let params = new HttpParams({
      fromObject: {
        page: filter.page,
        search: filter.search,
        department: filter.department,
        // brand: filter.brand ?? '',
        // categories: filter.categories ?? '',
        // equipmentType: filter.equipmentType ?? '',
        // borrow: filter.borrow ?? '',
      },
    });
    return this.http.get<ApiResponse<IEquipment[]>>(environment.api_url + '/api/equipment', { params }).pipe(
      catchError(this.handleError),
    );
  }

  getStatus(equipmentId: string) {
    return this.http.get<ApiResponse<BorrowedEquipmentStatusTypeAndQuantity[]>>(environment.api_url + `/api/equipment/${equipmentId}/status`).pipe(
      catchError(this.handleError),
    );
  }

  getDistinctValues(field: string, department: Department): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('field', field);
    params = params.append('department', department);
    return this.http
      .get<ApiResponse<string[]>>(environment.api_url + '/api/equipment/distinct', { params })
      .pipe(
        map((resp) => resp.data as string[]),
        catchError(this.handleError),
      );
  }

  updateEquipment(equipment: IEquipment) {
    return this.http
      .patch<ApiResponse<IEquipment>>(environment.api_url + '/api/equipment/' + equipment._id, equipment, {})
      .pipe(
        map((resp) => resp.data),
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
