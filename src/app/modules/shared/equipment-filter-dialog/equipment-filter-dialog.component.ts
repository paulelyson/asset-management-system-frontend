import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { Button } from '@paulelyson/elyui';
import { AutocompleteComponent, IAutocompleteOption } from '../autocomplete/autocomplete.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EquipmentService } from '../../../services/equipment.service';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { forkJoin, map, of } from 'rxjs';
import { DEPARTMENTS } from '../../../models/User';
import { DepartmentService } from '../../../services/department.service';
import { IDepartment } from '../../../models/Department';
import { IQuantityStatusDialogConfig } from '../update-quantity-status-dialog/update-quantity-status-dialog.component';
import { EQUIPMENT_CONDITION } from '../../../models/Equipment';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [Button, FormsModule, ReactiveFormsModule, AutocompleteComponent, DropdownComponent],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent implements OnInit {
  filterForm: FormGroup;
  url: string = '';
  categories: IAutocompleteOption[] = [];
  brands: IAutocompleteOption[] = [];
  equipmentTypes: IAutocompleteOption[] = [];
  departments: IAutocompleteOption[] = [];
  equipmentCondition;

  constructor(
    public dialogRef: MatDialogRef<EquipmentFilterDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private departmentService: DepartmentService,
    private equipmentService: EquipmentService,
    private autocompleteService: AutocompleteService,
    @Inject(MAT_DIALOG_DATA) public data: { department: string },
  ) {
    this.url = this.router.url.split('?')[0];
    this.equipmentCondition = this.autocompleteService.mapIntoAutocompleteOption(EQUIPMENT_CONDITION)
    this.filterForm = this.fb.group({
      department: [this.data.department],
      categories: [''],
      brand: [''],
      equipmentType: [''],
      location: [''],
      condition: [''],
      canBeBorrowed: ['']
    });
  }

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.getDepartments(),
      brands: this.equipmentService.getDistinct('brand', this.data.department),
    })
      .pipe(
        map(({ departments, brands }) => ({
          departments: departments.data.map((dept) => ({ value: dept._id, view: dept.code })),
          brands: brands.data.map((brand) => ({ value: brand, view: brand })),
        })),
      )
      .subscribe((result) => {
        this.departments = result.departments;
        this.brands = result.brands;
      });
  }

  onCanBeBorrowedChange(event: any) {
    console.log(event);
    this.filterForm.get('canBeBorrowed')?.setValue(event === 'Yes' ? true : event === 'No' ? false : '');
    console.log(this.filterForm.value);
  }

  navigate() {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    };
    Object.entries(this.filterForm.value).forEach(([key, val]) => {
      if (val || typeof val === 'boolean') (navigationExtras.queryParams as Params)[key] = val;
    });
    this.router.navigate([this.url], navigationExtras);

    this.dialogRef.close();
  }
}
