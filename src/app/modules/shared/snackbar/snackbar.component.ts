import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IconComponent } from '../icon/icon.component';

type SnackBarType = 'primary' | 'success' | 'warning' | 'error' | 'dafault';

export interface ISnackBarConfig {
  type: SnackBarType;
  message: string[];
  header?: string;
  action?: string[];
  icon: string;
  duration?: number;
}

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule, IconComponent],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.css',
})
export class SnackbarComponent {
  isList: boolean = false;
  hasHeader: boolean = false;
  type = 'primary';
  constructor(@Inject(MAT_SNACK_BAR_DATA) public config: ISnackBarConfig) {}
}
