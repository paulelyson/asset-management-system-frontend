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
import BorrowedEquipment, {
  BorrowedEquipmentStatusType,
  BorrowedEquipmentTransaction,
} from '../models/BorrowedEquipment';
import { BorrowedEquipmentFilterDialogComponent } from '../modules/borrowed-equipment/borrowed-equipment-filter-dialog/borrowed-equipment-filter-dialog.component';
import { BorrowedEquipmentDetailDialogComponent } from '../modules/borrowed-equipment/borrowed-equipment-detail-dialog/borrowed-equipment-detail-dialog.component';
import { BorrowedEquipmentHistoryDialogComponent } from '../modules/borrowed-equipment/borrowed-equipment-history-dialog/borrowed-equipment-history-dialog.component';
import { IBorrowedEquipmentHistory } from '../models/BorrowedEquipmentHistory';
import { LoginDialogComponent } from '../modules/shared/login-dialog/login-dialog.component';
import { ChangePasswordDialogComponent } from '../modules/shared/change-password-dialog/change-password-dialog.component';
import { ButtonConfig } from '../models/ui/button-config.model';

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

  openUpdateQuantityStatusDialog(
    fields: BorrowedEquipmentStatusFields[],
    actions: ButtonConfig[],
    status?: BorrowedEquipmentStatusType[],
  ) {
    const dialogRef = this.dialog.open(UpdateQuantityStatusDialogComponent, {
      data: { fields, actions, statusOptions: status },
    });
    return dialogRef.afterClosed();
  }

  openEquipmentFilterDialog(department: string): void {
    const dialogRef = this.dialog.open(EquipmentFilterDialogComponent, {
      data: { department },
    });
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

  openUpdateEquipmentDialog(equipment: IEquipment) {
    const dialogRef = this.dialog.open(CreateEquipmentDialogComponent, { data: equipment });
    return dialogRef.afterClosed();
  }

  openBorrowedEquipmentFilterDialog(): void {
    const dialogRef = this.dialog.open(BorrowedEquipmentFilterDialogComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The borrowed equipment filter dialog was closed');
    });
  }

  openBorrowedEquipmentDetailDialog(borrowedEquipment: BorrowedEquipment): void {
    const dialogRef = this.dialog.open(BorrowedEquipmentDetailDialogComponent, {
      data: borrowedEquipment,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The borrowed equipment detail dialog was closed');
    });
  }

  openBorrowedEquipmentTransactionsDialog(transactions: BorrowedEquipmentTransaction[]): void {
    const dialogRef = this.dialog.open(BorrowedEquipmentHistoryDialogComponent, {
      data: transactions,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The borrowed equipment history dialog was closed');
    });
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {});
    return dialogRef.afterClosed()
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {});
    return dialogRef.afterClosed();
  }
}
