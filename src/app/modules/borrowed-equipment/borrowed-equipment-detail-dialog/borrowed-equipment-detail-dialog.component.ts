import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getDisplayName } from '../../../utils/string.util';
import BorrowedEquipment from '../../../models/BorrowedEquipment';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-borrowed-equipment-detail-dialog',
  templateUrl: './borrowed-equipment-detail-dialog.component.html',
  styleUrl: './borrowed-equipment-detail-dialog.component.css',
  imports: [MatDividerModule]
})
export class BorrowedEquipmentDetailDialogComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  constructor(@Inject(MAT_DIALOG_DATA) public data: BorrowedEquipment) {}

  get borrowerName(): string {
    return getDisplayName(this.data.borrower);
  }

  get instructorName(): string {
    return getDisplayName(this.data.courseOffering.instructor);
  }
}
