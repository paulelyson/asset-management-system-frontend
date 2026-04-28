import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IEquipment } from '../../../models/Equipment';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { AutocompleteComponent } from '../../shared/autocomplete/autocomplete.component';
import { FileInputComponent } from '../../shared/file-input/file-input.component';

@Component({
  selector: 'app-create-equipment-dialog',
  templateUrl: './create-equipment-dialog.component.html',
  styleUrl: './create-equipment-dialog.component.css',
  imports: [
    ButtonComponent,
    InputComponent,
    AutocompleteComponent,
    FileInputComponent,
    ReactiveFormsModule,
  ],
})
export class CreateEquipmentDialogComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  image: string | undefined;
  equipmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateEquipmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IEquipment | null,
  ) {
    this.equipmentForm = this.fb.nonNullable.group({
      _id: [data?._id ?? ''],
      name: [data?.name ?? ''],
      equipmentType: [data?.equipmentType ?? ''],
      serialNo: [data?.serialNo ?? ''],
      modelNo: [data?.modelNo ?? ''],
      categories: [data?.categories ?? ''],
      brand: [data?.brand ?? ''],
      color: [data?.color ?? ''],
      unit: [data?.unit ?? ''],
      matter: [data?.matter ?? ''],
      description: [data?.description ?? ''],
      remarks: [data?.remarks ?? ''],
      inventorytype: [data?.inventorytype ?? ''],
      location: [data?.location ?? ''],
      dateAcquired: [data?.dateAcquired ?? ''],
      images: this.fb.array([]),
    });
  }

  get images(): FormArray {
    return this.equipmentForm.get('images') as FormArray;
  }

  addImage(event: string): void {
    const imageForm = this.fb.group({
      thumbnail: [''],
      midsize: [''],
      original: [event],
    });
    this.images.push(imageForm);
  }

  submit() {
    this.dialogRef.close(this.equipmentForm.value);
  }
}
