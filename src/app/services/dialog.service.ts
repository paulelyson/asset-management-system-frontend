import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EquipmentDetailDialogComponent } from '../modules/shared/equipment-detail-dialog/equipment-detail-dialog.component';
import { EquipmentFilterDialogComponent } from '../modules/shared/equipment-filter-dialog/equipment-filter-dialog.component';
import { IEquipment } from '../models/Equipment';
import { CreateEquipmentDialogComponent } from '../modules/inventory/create-equipment-dialog/create-equipment-dialog.component';
import { UpdateBorrowedEquipmentDialogComponent } from '../modules/borrowed-equipment/update-borrowed-equipment-dialog/update-borrowed-equipment-dialog.component';

type DialogComponent = 'equipment-detail' | 'equipment-filter';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}
  openDialog(component: DialogComponent, equipment: IEquipment): void {
    const dialogComponent: any =
      component == 'equipment-detail'
        ? EquipmentDetailDialogComponent
        : EquipmentFilterDialogComponent;
    const dialogRef = this.dialog.open(dialogComponent, { data: equipment });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  openBorrowedEquipmentUpdateDialog(): void {
    const dialogRef = this.dialog.open(UpdateBorrowedEquipmentDialogComponent, {});
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The filter dialog was closed');
    });
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
