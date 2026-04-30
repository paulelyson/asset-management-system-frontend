import { Injectable } from '@angular/core';
import { ClassLocation } from '../models/data/location.model';
import { ApiResponse } from '../models/ApiResponse';
import { environment } from '../../environments/environment';
import { ExceptionService } from './exception.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
  ) {}
  getLocations() {
    return this.http
      .get<ApiResponse<ClassLocation[]>>(environment.api_url + '/api/location')
      .pipe(catchError(this.exceptionService.handleError));
  }
}
