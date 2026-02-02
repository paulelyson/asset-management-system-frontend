import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IBorrowedEquipmentHistory } from '../../../models/BorrowedEquipmentHistory';

@Component({
  selector: 'app-borrowed-equipment-history-dialog',
  templateUrl: './borrowed-equipment-history-dialog.component.html',
  styleUrl: './borrowed-equipment-history-dialog.component.css',
  standalone: false,
})
export class BorrowedEquipmentHistoryDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: IBorrowedEquipmentHistory[]) {}
}
