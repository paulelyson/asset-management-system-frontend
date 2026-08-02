import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EQUIPMENT_STATUS_VARIANT, IConditionAndQuantity, IEquipment } from '../models/Equipment';
import { catchError, last, lastValueFrom, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { EquipmentFilter } from '../models/filters/equipment-filter.model';
import {
  BorrowedEquipmentStatusTypeAndQuantity,
} from '../models/BorrowedEquipment';
import { ApiResponse } from '../models/ApiResponse';
import { RowActionConfig, RowColumnConfig } from '../models/ui/data-row.model';
import { IUser } from '../models/User';
import { CHANGELOG_STATUS_VARIANT, EquipmentChangeLog } from '../models/data/equipment-change-logs.model';
import { getDisplayName } from '../utils/string.util';
import { PDFFormatConfig } from '../models/ui/pdf-format-config.model';
import { ExceptionService } from './exception.service';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  constructor(private http: HttpClient, private exceptionService: ExceptionService) {}

  getEquipment(filter: EquipmentFilter) {
    let params = new HttpParams({ fromObject: { page: filter.page, limit: filter.limit } });
    filter.search && (params = params.append('search', filter.search));
    filter.department && (params = params.append('department', filter.department));
    filter.brand && (params = params.append('brand', filter.brand));
    filter.condition && (params = params.append('condition', filter.condition));
    filter.pending && (params = params.append('confirmed', !filter.pending));
    filter.canBeBorrowed !== undefined && (params = params.append('canBeBorrowed', filter.canBeBorrowed));

    // `data` is the equipment array now; the pending-approval count moved to
    // `meta.pendingApprovalCount` (it was `data[1]` of a tuple).
    return this.http
      .get<ApiResponse<IEquipment[]>>(environment.api_url + '/api/equipment', { params })
      .pipe(catchError(this.exceptionService.handleError));
  }

  getStatus(equipmentId: string) {
    return this.http.get<ApiResponse<BorrowedEquipmentStatusTypeAndQuantity[]>>(environment.api_url + `/api/equipment/${equipmentId}/status`)
      .pipe(catchError(this.exceptionService.handleError));
  }

  getDistinct(field: string, department?: string) {
    let params = new HttpParams();
    department && (params = params.append('department', department));
    return this.http.get<ApiResponse<string[]>>(environment.api_url + '/api/equipment/distinct/' + field, { params })
      .pipe(catchError(this.exceptionService.handleError));
  }

  createEquipment(equipment: IEquipment) {
    return this.http.post<ApiResponse<IEquipment>>(environment.api_url + '/api/equipment/', equipment)
      .pipe(catchError(this.exceptionService.handleError));
  }

  updateEquipment(equipment: IEquipment) {
    return this.http.patch<ApiResponse<IEquipment>>(environment.api_url + '/api/equipment/' + equipment._id, equipment)
      .pipe(catchError(this.exceptionService.handleError));
  }

  getChangeLogs() {
    return this.http.get<ApiResponse<EquipmentChangeLog[]>>(environment.api_url + '/api/equipment-change-log')
      .pipe(catchError(this.exceptionService.handleError));
  }

  getChangeLogsByEquipment(equipmentId: string) {
     return this.http.get<ApiResponse<EquipmentChangeLog[]>>(environment.api_url + `/api/equipment/${equipmentId}/change-logs`)
      .pipe(catchError(this.exceptionService.handleError));
  }

  resolveChangeLog(resolve: Pick<EquipmentChangeLog, '_id' | 'status' | 'resolverRemarks'>) {
    const {_id, status, resolverRemarks} = resolve
    const body = {status: status, resolverRemarks }
    return this.http.patch<ApiResponse<EquipmentChangeLog[]>>(environment.api_url + `/api/equipment-change-log/${_id}/resolve`, body)
      .pipe(catchError(this.exceptionService.handleError));
  }

  getRowData(equipment: IEquipment, canAccessEquipment: boolean): RowColumnConfig[] {
    const actions: RowActionConfig[] = [{
      type: 'button',
      name: 'Details',
      icon: 'info_outlined',
      size: 'xs'
    },
    {
      type: 'button',
      name: 'Changes History',
      icon: 'history',
      size: 'xs'
    }]
    if(canAccessEquipment) {
      actions.push({
        type: 'button',
        name: 'Update',
        icon: 'edit',
        size: 'xs'
      })
      actions.push({
        type: 'button',
        name: 'Create a Copy',
        icon: 'content_copy',
        size: 'xs',
        tooltip: 'Create a new equipment with the same details as this one'
      })
    }
    const conditions: RowActionConfig[] = equipment.conditionAndQuantity.map((x) => ({
      name: x.condition + ' ×' + x.quantity,
      tooltip: '',
      type: 'badge',
      size: 'sm',
      icon: '',
      variant: EQUIPMENT_STATUS_VARIANT[x.condition]
    }));
    return [
      { id: 0, type: 'image', header: '', image: equipment.images[0]?.thumbnail, weight: 0.5 },
      { id: 1, type: 'title', header: 'Name', content: [equipment.name], weight: 2 },
      { id: 2, type: 'text', header: 'Categories', content: equipment.categories, weight: 0.5 },
      { id: 3, type: 'text', header: 'Brand', content: [equipment.brand], weight: 0.5 },
      { id: 4, type: 'action', header: 'Condition', actions: conditions, weight: 0.5 },
      { id: 5, type: 'action', header: '', actions: actions, weight: 1 },
    ];
  }

  getChangeLogRowData(log: EquipmentChangeLog): RowColumnConfig[]  {
    const performedBy = getDisplayName(log.performedBy);
    const status: RowActionConfig[] = [new RowActionConfig({
      name: log.status,
      type: 'badge',
      variant: CHANGELOG_STATUS_VARIANT[log.status]
    })]
    const changes = log.changes.map(ch=> `${ch.field}: \n ${ch.previousValue} → ${ch.newValue} `)
     return [
      { id: 0, type: 'image', header: '', weight: 0.5 },
      { id: 1, type: 'title', header: 'Name', content: [log.equipment.name], subtitle: log.action, weight: 1.5 },
      { id: 2, type: 'text', header: 'Changes', content: changes, weight: 2.5 },
      { id: 3, type: 'text', header: 'Performed By', content: [performedBy], weight: 1 },
      { id: 4, type: 'action', header: 'Condition', actions: status, weight: 0.5 },
      { id: 5, type: 'action', header: '', actions: [], weight: 1 },
    ];
  }

  downloadReport(filter: EquipmentFilter, pdfConfig: PDFFormatConfig) {
    let params = new HttpParams({ fromObject: { page: filter.page, limit: filter.limit } });
    filter.search && (params = params.append('search', filter.search));
    filter.department && (params = params.append('department', filter.department));
    filter.brand && (params = params.append('brand', filter.brand));
    filter.condition && (params = params.append('condition', filter.condition));
    filter.pending && (params = params.append('confirmed', !filter.pending));

    const body =  {
      paperSize:   pdfConfig.pageSize,
      orientation: pdfConfig.orientation,
      fields:      pdfConfig.columns,
      // department:  selectedDepartment,
      schoolName: environment.school_name,
      collegeName: pdfConfig.header?.college || '',
      departmentName: pdfConfig.header?.department || '',
      logoUrl: environment.logo_url,
      confirmed:   false,
    }
    return  this.http.post(environment.api_url + `/api/equipment/report/download`, body, {params, responseType: 'blob'})
      .pipe(catchError((err) => this.exceptionService.handleError(err)));
  }
}
