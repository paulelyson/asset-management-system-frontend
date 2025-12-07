import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEquipment } from '../models/Equipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IEquipmentFilter } from '../models/EquipmentFilter';

interface ApiResponse {
  data: IEquipment[];
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
      },
    });
    return this.http.get<ApiResponse>(environment.api_url + '/api/equipment', { params }).pipe(
      map((resp) => resp.data),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.message || err.error));
  }
}
