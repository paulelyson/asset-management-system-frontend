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
import { EQUIPMENT_CONDITION, EquipmentUnit, IConditionAndQuantity, IEquipment } from '../../../models/Equipment';
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
import { Department, IUser } from '../../../models/User';
import { DepartmentService } from '../../../services/department.service';
import { AuthService, TokenData } from '../../../services/auth.service';
import { getDisplayName } from '../../../utils/string.util';
import { SnackbarService } from '../../../services/snackbar.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { MatDividerModule } from '@angular/material/divider';
import { DropdownComponent } from '../../shared/dropdown/dropdown.component';
import { ToggleComponent } from '../../shared/toggle/toggle.component';
import { TextareaComponent } from '../../shared/components/forms/textarea/textarea.component';

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
    IconComponent,
    MatDividerModule,
    DropdownComponent,
    ToggleComponent,
    TextareaComponent,
  ],
})
export class CreateEquipmentDialogComponent implements OnInit {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  image: string | undefined;
  equipmentForm: FormGroup;
  conditions;
  matter: string[] = ['solid', 'liquid', 'gas'];
  inventoryTypes: string[] = ['inventory', 'non_inventory'];
  units: string[] = Object.values(EquipmentUnit);
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

  categories: WritableSignal<string[]> = signal([]);
  categorylist = computed((): IAutocompleteOption[] =>
    this.categories().map((x) => ({ value: x, view: x })),
  );

  user: TokenData;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateEquipmentDialogComponent>,
    private autocompleteService: AutocompleteService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: IEquipment | null,
  ) {
    this.user = this.authService.getUser();
    // this.matter = this.autocompleteService.mapIntoAutocompleteOption(['solid', 'liquid', 'gas']);
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
      unit: [data?.unit ?? EquipmentUnit.PC],
      matter: [data?.matter ?? 'solid'],
      description: [data?.description ?? ''],
      remarks: [data?.remarks ?? ''],
      inventorytype: [data?.inventorytype ?? 'inventory'],
      location: [data?.location?._id ?? ''],
      dateAcquired: [data?.dateAcquired ?? new Date()],
      warrantyPeriod: [data?.warrantyPeriod ?? new Date()],
      department: [data?.department?._id ?? this.user.roles[0].department._id],
      updatedBy: [data?.updatedBy?._id ?? this.user._id],
      images: this.fb.array([]),
      conditionAndQuantity: this.fb.array([]),
      canBeBorrowed: [data?.canBeBorrowed ?? true],
      hasTag: [data?.hasTag ?? false],
      totalQuantity: [0],
    });
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (resp) => this.locations.set(resp.data),
    });

    this.equipmentService.getDistinct('brand', this.data?.department?._id).subscribe({
      next: (resp) => this.brands.set(resp.data),
    });

    this.equipmentService.getDistinct('type', this.data?.department?._id).subscribe({
      next: (resp) => this.equipmenttypes.set(resp.data),
    });

    this.equipmentService.getDistinct('categoriesss').subscribe({
      next: (resp) => this.categories.set(resp.data),
    });

    this.departmentService.getDepartments().subscribe({
      next: (resp) => this.departments.set(resp.data),
    });

    this.conditionAndQuantity.valueChanges.subscribe({
      next: (rows: { condition: string; quantity: number }[]) => {
        const total = rows.reduce((sum, row) => sum + (Number(row.quantity) ?? 0), 0);
        this.equipmentForm.controls['totalQuantity'].patchValue(total);
      },
    });

    this.populateForm(this.data?.conditionAndQuantity || []);

    if (!this.data?.conditionAndQuantity) {
      this.conditionAndQuantity.push(this.createConditionAndQuantityForm());
    }
  }

  get images(): FormArray {
    return this.equipmentForm.get('images') as FormArray;
  }

  get conditionAndQuantity(): FormArray {
    return this.equipmentForm.get('conditionAndQuantity') as FormArray;
  }

  getUpdatedByDisplayName() {
    let displayName = '';
    if (this.data) {
      displayName = this.data?.updatedBy ? getDisplayName(this.data?.updatedBy) : '';
    } else {
      displayName = this.user.name;
    }
    return displayName;
  }

  populateForm(data: IConditionAndQuantity[]): void {
    data.forEach((item) => {
      const row = this.createConditionAndQuantityForm();
      row.patchValue(item);
      this.conditionAndQuantity.push(row);
    });
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
    this.equipmentForm.controls['updatedBy'].patchValue(this.user._id);
    const payload = {
      ...this.equipmentForm.value,
    };

    // new equipment
    if (!this.data) {
      delete payload._id;
      this.equipmentService.createEquipment(payload).subscribe({
        next: (resp) => {
          this.snackBarService.openSnackbar({
            type: 'success',
            message: [resp.message],
            icon: '',
          });
          this.dialogRef.close(resp.data);
        },
        error: (err) =>
          this.snackBarService.openSnackbar({
            type: 'error',
            message: [err],
            icon: '',
          }),
      });
    } else {
      this.equipmentService.updateEquipment(payload).subscribe({
        next: (resp) => {
          this.snackBarService.openSnackbar({
            type: 'success',
            message: [resp.message],
            icon: '',
          });
          this.dialogRef.close(resp.data);
        },
        error: (err) =>
          this.snackBarService.openSnackbar({
            type: 'error',
            message: [err],
            icon: '',
          }),
      });
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
