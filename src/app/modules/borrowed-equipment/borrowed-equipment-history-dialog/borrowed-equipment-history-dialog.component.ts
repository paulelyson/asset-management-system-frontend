import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IBorrowedEquipmentHistory } from '../../../models/BorrowedEquipmentHistory';
import { IVerticalStepper } from '../../shared/vertical-stepper/vertical-stepper.component';
import { getDisplayName } from '../../../utils/string.util';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-borrowed-equipment-history-dialog',
  templateUrl: './borrowed-equipment-history-dialog.component.html',
  styleUrl: './borrowed-equipment-history-dialog.component.css',
  standalone: false,
})
export class BorrowedEquipmentHistoryDialogComponent {
  histories: IVerticalStepper[];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IBorrowedEquipmentHistory[],
    private datePipe: DatePipe,
  ) {
    this.histories = data.map((dt) => ({
      title: dt.updatedStatus,
      contents: [
        'Qty: ' + dt.updatedConditionQuantity.quantity,
        getDisplayName(dt.responsibleUser),
        this.datePipe.transform(dt.createdAt, 'medium') ?? dt.createdAt,
        dt.remarks,
      ],
    }));
  }
}
