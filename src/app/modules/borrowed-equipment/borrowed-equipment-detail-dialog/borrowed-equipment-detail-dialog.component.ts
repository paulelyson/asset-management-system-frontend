import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getDisplayName } from '../../../utils/string.util';
import BorrowedEquipment, {
  BORROW_STATUS_VARIANT,
  BorrowedEquipmentTransaction,
} from '../../../models/BorrowedEquipment';
import { MatDividerModule } from '@angular/material/divider';
import { Badge, Icon } from '@paulelyson/elyui';
import { EquipmentCondition } from '../../../models/Equipment';
import { DisplayNamePipe } from '../../../pipes/displayname.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-borrowed-equipment-detail-dialog',
  templateUrl: './borrowed-equipment-detail-dialog.component.html',
  styleUrl: './borrowed-equipment-detail-dialog.component.css',
  imports: [MatDividerModule, Icon, Badge, DisplayNamePipe, DatePipe],
})
export class BorrowedEquipmentDetailDialogComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  constructor(
    public dialogRef: MatDialogRef<BorrowedEquipmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BorrowedEquipment,
  ) {}

  get borrowerName(): string {
    return getDisplayName(this.data.borrower);
  }

  get instructorName(): string {
    return getDisplayName(this.data.courseOffering?.instructor);
  }

  getVariant(cond: Pick<BorrowedEquipmentTransaction, 'quantity' | 'status'>) {
    return BORROW_STATUS_VARIANT[cond.status];
  }

  onClose() {
    this.dialogRef.close();
  }
}
