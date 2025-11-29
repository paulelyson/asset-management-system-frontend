import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-equipment-dialog',
  templateUrl: './create-equipment-dialog.component.html',
  styleUrl: './create-equipment-dialog.component.css',
  standalone: false,
})
export class CreateEquipmentDialogComponent {
  equipmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.equipmentForm = this.fb.group({
      name: [''],
      equipmentType: ['']
    });
  }

  test() {
    console.log(this.equipmentForm.value);
  }
}
