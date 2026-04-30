import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IBorrowedEquipmentHistory } from '../../../models/BorrowedEquipmentHistory';
import { IVerticalStepper, VerticalStepperComponent } from '../../shared/vertical-stepper/vertical-stepper.component';
import { getDisplayName } from '../../../utils/string.util';
import { DatePipe } from '@angular/common';
import { BorrowedEquipmentTransaction } from '../../../models/BorrowedEquipment';
import { IUser } from '../../../models/User';

@Component({
  selector: 'app-borrowed-equipment-history-dialog',
  templateUrl: './borrowed-equipment-history-dialog.component.html',
  styleUrl: './borrowed-equipment-history-dialog.component.css',
  imports: [VerticalStepperComponent]
})
export class BorrowedEquipmentHistoryDialogComponent {
  transaction: IVerticalStepper[];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BorrowedEquipmentTransaction[],
    private datePipe: DatePipe,
  ) {
    this.transaction = data.map((dt) => ({
      title: dt.status,
      contents: [
        'Qty: ' + dt.quantity,
        dt.updatedBy ? getDisplayName(dt.updatedBy) : '',
        dt.createdAt
          ? (this.datePipe.transform(dt.createdAt, 'medium') ?? dt.createdAt.toISOString())
          : '',
        dt.remarks ?? '',
      ],
    }));
  }
}
