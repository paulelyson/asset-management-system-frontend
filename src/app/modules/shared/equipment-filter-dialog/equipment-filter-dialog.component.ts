import { Component } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ButtonComponent } from '../button/button.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [DropdownComponent, ButtonComponent, AutocompleteComponent],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent {
  equipment_types: string[]= ['bar', 'foo', 'waa']
}
