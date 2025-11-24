import { Component } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [DropdownComponent],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent {
  equipment_types: string[]= ['bar', 'foo', 'waa']
}
