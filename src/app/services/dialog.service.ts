import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EquipmentDetailDialogComponent } from '../modules/shared/equipment-detail-dialog/equipment-detail-dialog.component';
import { EquipmentFilterDialogComponent } from '../modules/shared/equipment-filter-dialog/equipment-filter-dialog.component';
import { IEquipment } from '../models/Equipment';
import { CreateEquipmentDialogComponent } from '../modules/inventory/create-equipment-dialog/create-equipment-dialog.component';
import {
  BorrowedEquipmentStatusFields,
  UpdateQuantityStatusDialogComponent,
} from '../modules/shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { IButtonConfig } from '../modules/shared/button/button.component';
import { Observable } from 'rxjs';
import { BorrowedEquipmentStatus } from '../models/BorrowedEquipment';

type DialogComponent = 'equipment-detail' | 'equipment-filter';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}
  openEquipmentDetailDialog(equipment: IEquipment): void {
    const dialogRef = this.dialog.open(EquipmentDetailDialogComponent, { data: equipment });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  openUpdateQuantityStatusDialog(fields: BorrowedEquipmentStatusFields[], actions: IButtonConfig[]){
    const dialogRef = this.dialog.open(UpdateQuantityStatusDialogComponent, { data: { fields, actions } });
    return dialogRef.afterClosed()
  }

  openEquipmentFilterDialog(): void {
    const dialogRef = this.dialog.open(EquipmentFilterDialogComponent, {});
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The filter dialog was closed');
    });
  }

  openCreateEquipmentDialog(): void {
    const dialogRef = this.dialog.open(CreateEquipmentDialogComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The create dialog was closed');
    });
  }
}
