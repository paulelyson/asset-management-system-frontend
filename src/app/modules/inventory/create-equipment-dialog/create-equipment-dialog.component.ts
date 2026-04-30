import { Component, computed, Inject, OnInit, signal, WritableSignal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EQUIPMENT_CONDITION, IEquipment } from '../../../models/Equipment';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import {
  AutocompleteComponent,
  IAutocompleteOption,
} from '../../shared/autocomplete/autocomplete.component';
import { FileInputComponent } from '../../shared/file-input/file-input.component';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { LocationService } from '../../../services/location.service';
import { ClassLocation } from '../../../models/data/location.model';
import { EquipmentService } from '../../../services/equipment.service';
import { IDepartment } from '../../../models/Department';
import { Department } from '../../../models/User';
import { DepartmentService } from '../../../services/department.service';

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
    FormsModule,
    DatepickerComponent,
  ],
})
export class CreateEquipmentDialogComponent implements OnInit {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  image: string | undefined;
  equipmentForm: FormGroup;
  conditions;
  matter;
  locations: WritableSignal<ClassLocation[]> = signal([]);
  locationlist = computed((): IAutocompleteOption[] =>
    this.locations().map((loc) => ({ view: loc.name, value: loc._id })),
  );
  brands: WritableSignal<string[]> = signal([]);
  brandlist = computed((): IAutocompleteOption[] =>
    this.brands().map((x) => ({ value: x, view: x })),
  );

  equipmenttypes: WritableSignal<string[]> = signal([]);
  equipmenttypelist = computed((): IAutocompleteOption[] =>
    this.equipmenttypes().map((x) => ({ value: x, view: x })),
  );

  departments: WritableSignal<IDepartment[]> = signal([]);
  departmentlist = computed((): IAutocompleteOption[] =>
    this.departments().map((dept) => ({ value: dept._id, view: dept.code })),
  );
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateEquipmentDialogComponent>,
    private autocompleteService: AutocompleteService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    private equipmentService: EquipmentService,
    @Inject(MAT_DIALOG_DATA) public data: IEquipment | null,
  ) {
    this.matter = this.autocompleteService.mapIntoAutocompleteOption(['solid', 'liquid', 'gas']);
    this.conditions = this.autocompleteService.mapIntoAutocompleteOption(EQUIPMENT_CONDITION);
    this.equipmentForm = this.fb.nonNullable.group({
      _id: [data?._id ?? ''],
      name: [data?.name ?? ''],
      type: [data?.type ?? ''],
      serialNo: [data?.serialNo ?? ''],
      modelNo: [data?.modelNo ?? ''],
      categories: [data?.categories ?? ''],
      brand: [data?.brand ?? ''],
      color: [data?.color ?? ''],
      unit: [data?.unit ?? ''],
      matter: [data?.matter ?? 'solid'],
      description: [data?.description ?? ''],
      remarks: [data?.remarks ?? ''],
      inventorytype: [data?.inventorytype ?? ''],
      location: [data?.location ?? ''],
      dateAcquired: [data?.dateAcquired ?? new Date()],
      department: [{ value: data?.department ?? '', disabled: true }],
      images: this.fb.array([]),
      conditionAndQuantity: this.fb.array([]),
    });
    this.conditionAndQuantity.push(this.createConditionAndQuantityForm());
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (resp) => this.locations.set(resp.data),
    });

    this.equipmentService.getDistinct('brand', this.data?.department).subscribe({
      next: (resp) => this.brands.set(resp.data),
    });

    this.equipmentService.getDistinct('type', this.data?.department).subscribe({
      next: (resp) => this.equipmenttypes.set(resp.data),
    });

    this.departmentService.getDepartments().subscribe({
      next: (resp) => this.departments.set(resp.data),
    });
  }

  get images(): FormArray {
    return this.equipmentForm.get('images') as FormArray;
  }

  get conditionAndQuantity(): FormArray {
    return this.equipmentForm.get('conditionAndQuantity') as FormArray;
  }

  createConditionAndQuantityForm(): FormGroup {
    return this.fb.group({
      condition: ['functional', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addConditionAndQuantity(): void {
    this.conditionAndQuantity.push(this.createConditionAndQuantityForm());
  }

  removeConditionAndQuantity(index: number): void {
    if (this.conditionAndQuantity.length > 1) {
      this.conditionAndQuantity.removeAt(index);
    } else {
      // Optionally handle the case where there is only one form group remaining
      console.warn('Cannot remove the last condition and quantity');
    }
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
