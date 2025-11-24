import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EquipmentDetailDialogComponent } from '../modules/shared/equipment-detail-dialog/equipment-detail-dialog.component';
import { EquipmentFilterComponent } from '../modules/shared/equipment-filter/equipment-filter.component';

type DialogComponent = 'equipment-detail' | 'equipment-filter';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}
  openDialog(component: DialogComponent): void {
    const dialogComponent = component == 'equipment-detail' ? EquipmentDetailDialogComponent : EquipmentFilterComponent;
    const dialogRef = this.dialog.open(dialogComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
}
