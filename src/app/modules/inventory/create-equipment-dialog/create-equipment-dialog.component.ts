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
import { EQUIPMENT_CONDITION, EquipmentUnit, getLocationId, IConditionAndQuantity, IEquipment, IEquipmentImage } from '../../../models/Equipment';
import { Button, Icon, SnackbarService, Textarea, Toggle } from '@paulelyson/elyui';
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
import { MatDividerModule } from '@angular/material/divider';
import { DropdownComponent } from '../../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-create-equipment-dialog',
  templateUrl: './create-equipment-dialog.component.html',
  styleUrl: './create-equipment-dialog.component.css',
  imports: [
    Button,
    InputComponent,
    AutocompleteComponent,
    FileInputComponent,
    ReactiveFormsModule,
    FormsModule,
    DatepickerComponent,
    Icon,
    MatDividerModule,
    DropdownComponent,
    Toggle,
    Textarea,
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
    @Inject(MAT_DIALOG_DATA) public data: {action: string, equipment?: IEquipment},
  ) {
    this.user = this.authService.getUser();
    // this.matter = this.autocompleteService.mapIntoAutocompleteOption(['solid', 'liquid', 'gas']);
    this.conditions = this.autocompleteService.mapIntoAutocompleteOption(EQUIPMENT_CONDITION);
    this.equipmentForm = this.fb.nonNullable.group({
      _id: [data?.equipment?._id ?? ''],
      name: [data?.equipment?.name ?? ''],
      type: [data?.equipment?.type ?? ''],
      serialNo: [data?.equipment?.serialNo && data?.action === 'update' ? data?.equipment?.serialNo : ''],
      modelNo: [data?.equipment?.modelNo ?? ''],
      categories: [data?.equipment?.categories ?? ''],
      brand: [data?.equipment?.brand ?? ''],
      color: [data?.equipment?.color ?? ''],
      unit: [data?.equipment?.unit ?? EquipmentUnit.PC],
      matter: [data?.equipment?.matter ?? 'solid'],
      description: [data?.equipment?.description ?? ''],
      remarks: [data?.equipment?.remarks ?? ''],
      inventoryType: [data?.equipment?.inventoryType ?? 'inventory'],
      location: [getLocationId(data?.equipment?.location) ?? ''],
      dateAcquired: [data?.equipment?.dateAcquired ?? new Date()],
      warrantyPeriod: [data.action === 'update' ? data?.equipment?.warrantyPeriod : new Date()],
      department: [data?.equipment?.department?._id ?? this.authService.primaryDepartmentId() ?? ''],
      updatedBy: [data?.equipment?.updatedBy?._id ?? this.user._id],
      images: this.fb.array([]),
      conditionAndQuantity: this.fb.array([]),
      canBeBorrowed: [data?.equipment?.canBeBorrowed ?? true],
      hasTag: [data?.equipment?.hasTag ?? false],
      totalQuantity: [0],
    });
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (resp) => this.locations.set(resp.data),
    });

    this.equipmentService.getDistinct('brand', this.data?.equipment?.department?._id).subscribe({
      next: (resp) => this.brands.set(resp.data),
    });

    this.equipmentService.getDistinct('type', this.data?.equipment?.department?._id).subscribe({
      next: (resp) => this.equipmenttypes.set(resp.data),
    });

    this.equipmentService.getDistinct('categories').subscribe({
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

    this.populateForm(this.data?.equipment?.conditionAndQuantity || []);
    this.populateImages(this.data?.equipment?.images || []);

    if (!this.data?.equipment?.conditionAndQuantity) {
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
      displayName = this.data?.equipment?.updatedBy ? getDisplayName(this.data?.equipment?.updatedBy) : '';
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

  populateImages(data: IEquipmentImage[]): void {
    data.forEach((item) => {
      const imageForm = this.fb.group({
        thumbnail: [item.thumbnail],
        midsize: [item.midsize],
        original: [item.original],
      });
      this.images.push(imageForm);
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

    // new equipment or make a copy
    if (!this.data || this.data?.action === 'create') {
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
    } else if (this.data && this.data.action === 'update') {
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

  onToggleCanBeBorrowed(event: boolean) { 
    this.equipmentForm.get('canBeBorrowed')?.setValue(event);
  }

  onToggleHasTag(event: boolean) {
    this.equipmentForm.get('hasTag')?.setValue(event);
  }

  onClose() {
    this.dialogRef.close();
  }
}
