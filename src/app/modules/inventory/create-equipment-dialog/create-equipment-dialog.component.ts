import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-equipment-dialog',
  templateUrl: './create-equipment-dialog.component.html',
  styleUrl: './create-equipment-dialog.component.css',
  standalone: false,
})
export class CreateEquipmentDialogComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  image: string | undefined;
  equipmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.equipmentForm = this.fb.group({
      name: [''],
      equipmentType: [''],
      images: this.fb.array([]),
    });
  }

  get images(): FormArray {
    return this.equipmentForm.get('images') as FormArray;
  }

  test() {
    console.log(this.equipmentForm.value);
  }

  addImage(event: string): void {
    const imageForm = this.fb.group({
      thumbnail: [''],
      midsize: [''],
      original: [event],
    });
    this.images.push(imageForm);
  }
}
