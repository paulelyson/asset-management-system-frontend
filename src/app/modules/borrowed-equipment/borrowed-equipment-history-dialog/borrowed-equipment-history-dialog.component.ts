import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBorrowedEquipmentHistory } from '../../../models/BorrowedEquipmentHistory';
import { VerticalStepperComponent } from '../../shared/vertical-stepper/vertical-stepper.component';
import { getDisplayName } from '../../../utils/string.util';
import { DatePipe } from '@angular/common';
import { BORROW_STATUS_DISPLAY, BORROW_STATUS_VARIANT, BorrowedEquipmentTransaction } from '../../../models/BorrowedEquipment';
import { IUser } from '../../../models/User';
import { VerticalStepperConfig } from '../../../models/ui/vertical-stepper-config';
import { MatDividerModule } from '@angular/material/divider';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-borrowed-equipment-history-dialog',
  templateUrl: './borrowed-equipment-history-dialog.component.html',
  styleUrl: './borrowed-equipment-history-dialog.component.css',
  imports: [VerticalStepperComponent, MatDividerModule, IconComponent],
})
export class BorrowedEquipmentHistoryDialogComponent {
  transaction: VerticalStepperConfig[];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BorrowedEquipmentTransaction[],
    private datePipe: DatePipe,
    private dialogRef: MatDialogRef<BorrowedEquipmentHistoryDialogComponent>
  ) {
    this.transaction = data.map(
      (dt, ndx) =>
        new VerticalStepperConfig({
          title: BORROW_STATUS_DISPLAY[dt.status],
          variant: BORROW_STATUS_VARIANT[dt.status],
          badgeContent: `${BORROW_STATUS_DISPLAY[dt.status]} x${dt.quantity}`,
          showLine: ndx !== (data.length - 1),
          time: dt.createdAt
              ? (this.datePipe.transform(dt.createdAt, 'short') ?? dt.createdAt.toISOString())
              : '',
          contents: [
            dt.updatedBy ? getDisplayName(dt.updatedBy) : '',
            dt.quantity,
            dt.remarks ?? '',
            (dt.updatedBy?.firstName[0] || '') + (dt.updatedBy?.lastName[0] || '')
          ],
        }),
    );
  }

  onClose() {
    this.dialogRef.close()
  }
}
