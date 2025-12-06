import { Component } from '@angular/core';
import { EQUIPMENT_CONDITION } from '../../../models/Equipment';

@Component({
  selector: 'app-update-borrowed-equipment-dialog',
  templateUrl: './update-borrowed-equipment-dialog.component.html',
  styleUrl: './update-borrowed-equipment-dialog.component.css',
  standalone: false,
})
export class UpdateBorrowedEquipmentDialogComponent {
  conditions = EQUIPMENT_CONDITION
}
