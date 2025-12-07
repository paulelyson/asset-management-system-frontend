import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ISnackBarConfig, SnackbarComponent } from '../modules/shared/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}
  openSnackbar(data: ISnackBarConfig) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      panelClass: ['snackbar-override'],
      data: data,
      verticalPosition: 'top',
      duration: data.duration ?? 10 * 1000
    });
  }
}
