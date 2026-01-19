import { Component, Inject } from '@angular/core';
import { BorrowedEquipment } from '../../../models/BorrowedEquipment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getDisplayName } from '../../../utils/string.util';

@Component({
  selector: 'app-borrowed-equipment-detail-dialog',
  templateUrl: './borrowed-equipment-detail-dialog.component.html',
  styleUrl: './borrowed-equipment-detail-dialog.component.css',
  standalone: false,
})
export class BorrowedEquipmentDetailDialogComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  constructor(@Inject(MAT_DIALOG_DATA) public data: BorrowedEquipment) {}

  get borrowerName(): string {
    return getDisplayName(this.data.borrower);
  }

  get instructorName(): string {
    return getDisplayName(this.data.faculty);
  }
}
