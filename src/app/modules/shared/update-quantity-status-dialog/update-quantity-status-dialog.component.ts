import { Component, Inject, Input } from '@angular/core';
import { EQUIPMENT_CONDITION } from '../../../models/Equipment';
import { ButtonComponent, IButtonConfig } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

export type BorrowedEquipmentStatusFields = 'quantity' | 'status' | 'condition' | 'remarks';
export interface IQuantityStatusDialogConfig {
  fields: BorrowedEquipmentStatusFields[];
  actions: IButtonConfig[];
}

 

@Component({
  selector: 'app-update-quantity-status-dialog',
  imports: [
    ButtonComponent,
    InputComponent,
    AutocompleteComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-quantity-status-dialog.component.html',
  styleUrl: './update-quantity-status-dialog.component.css',
})
export class UpdateQuantityStatusDialogComponent {
  conditions = EQUIPMENT_CONDITION;
  borrowedEquipmentStatusForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateQuantityStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IQuantityStatusDialogConfig,
    private fb: FormBuilder
  ) {
    this.borrowedEquipmentStatusForm = this.fb.group({
      quantity: [''],
      status: [''],
      condition: [''],
      remarks: [''],
    });
  }

  onClicked(action: string) {
    if (action !== 'Cancel') {
      this.dialogRef.close(this.borrowedEquipmentStatusForm.value);
    }
  }
}
