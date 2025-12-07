import { Component, Input } from '@angular/core';
import { EQUIPMENT_CONDITION } from '../../../models/Equipment';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';



@Component({
  selector: 'app-update-quantity-status-dialog',
  imports: [ButtonComponent, InputComponent, AutocompleteComponent],
  templateUrl: './update-quantity-status-dialog.component.html',
  styleUrl: './update-quantity-status-dialog.component.css',
})
export class UpdateQuantityStatusDialogComponent {
  conditions = EQUIPMENT_CONDITION;
}
