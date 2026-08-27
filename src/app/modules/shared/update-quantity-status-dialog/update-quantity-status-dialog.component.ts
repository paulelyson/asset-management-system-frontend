import { Component, Inject, Input } from '@angular/core';
import { EQUIPMENT_CONDITION, EquipmentCondition } from '../../../models/Equipment';
import { Button } from '@paulelyson/elyui';
import { InputComponent } from '../input/input.component';
import { AutocompleteComponent, IAutocompleteOption } from '../autocomplete/autocomplete.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { BorrowedEquipmentStatusType } from '../../../models/BorrowedEquipment';
import { ButtonConfig } from '../../../models/ui/button-config.model';
import { MatDividerModule } from '@angular/material/divider';
import { IconComponent } from '../icon/icon.component';
import { TextareaComponent } from '../components/forms/textarea/textarea.component';

export type BorrowedEquipmentStatusFields = 'quantity' | 'status' | 'condition' | 'remarks';
export interface IQuantityStatusDialogConfig {
  fields: BorrowedEquipmentStatusFields[];
  actions: ButtonConfig[];
  statusOptions?: BorrowedEquipmentStatusType[];
  equipmentName?: string;
  equipmentSerialNo?: string;
}

@Component({
  selector: 'app-update-quantity-status-dialog',
  imports: [
    Button,
    InputComponent,
    AutocompleteComponent,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    IconComponent,
    TextareaComponent,
  ],
  templateUrl: './update-quantity-status-dialog.component.html',
  styleUrl: './update-quantity-status-dialog.component.css',
})
export class UpdateQuantityStatusDialogComponent {
  conditions: EquipmentCondition[] = EQUIPMENT_CONDITION;
  borrowedEquipmentStatusForm: FormGroup;
  statuses: IAutocompleteOption[];
  constructor(
    public dialogRef: MatDialogRef<UpdateQuantityStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IQuantityStatusDialogConfig,
    private fb: FormBuilder,
    private autocompleteService: AutocompleteService,
  ) {
    this.statuses = data.statusOptions
      ? this.autocompleteService.mapIntoAutocompleteOption(data.statusOptions)
      : this.autocompleteService.getBorrowedStatusOptions();
    this.borrowedEquipmentStatusForm = this.fb.group({
      quantity: [1],
      status: data.statusOptions ? [data.statusOptions[0]] : [''],
      condition: [''],
      remarks: [''],
    });
  }

  onClicked(action: string) {
    const quantity = this.borrowedEquipmentStatusForm.get('quantity')?.value;
    this.borrowedEquipmentStatusForm.get('quantity')?.setValue(Number(quantity));
    if (action !== 'Cancel') {
      this.dialogRef.close(this.borrowedEquipmentStatusForm.value);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
