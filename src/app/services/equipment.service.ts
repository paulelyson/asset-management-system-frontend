import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEquipment } from '../models/Equipment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

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

  getEquipment(): Observable<IEquipment[]> {
    return this.http.get<ApiResponse>(environment.api_url + '/api/equipment').pipe(
      map((resp) => resp.data),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.message));
  }
}
