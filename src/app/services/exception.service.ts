import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExceptionService {
  handleError(err: HttpErrorResponse) {
    return throwError(() => new Error(err.error.errors || err.error.message));
  }
}
