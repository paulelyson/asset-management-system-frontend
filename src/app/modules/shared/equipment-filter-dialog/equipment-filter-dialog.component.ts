import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ButtonComponent } from '../button/button.component';
import { AutocompleteComponent, IAutocompleteOption } from '../autocomplete/autocomplete.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { EquipmentService } from '../../../services/equipment.service';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { forkJoin, map, of } from 'rxjs';
import { DEPARTMENTS } from '../../../models/User';
import { DepartmentService } from '../../../services/department.service';
import { IDepartment } from '../../../models/Department';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [ButtonComponent, FormsModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent implements OnInit, OnChanges {
  filterForm: FormGroup;
  url: string = '';
  categories: IAutocompleteOption[] = [];
  brands: IAutocompleteOption[] = [];
  equipmentTypes: IAutocompleteOption[] = [];
  departments: IAutocompleteOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<EquipmentFilterDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private equipmentService: EquipmentService,
    private autocompleteService: AutocompleteService,
    private departmentService: DepartmentService,
  ) {
    this.url = this.router.url.split('?')[0];

    this.filterForm = this.fb.group({
      department: [''],
      categories: [''],
      brand: [''],
      equipmentType: [''],
      location: [''],
    });
  }
 

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.getDepartments(),
    })
      .pipe(
        map(({ departments }) => ({
          departments: departments.data.map((dept) => ({ value: dept._id, view: dept.name })),
        })),
      )
      .subscribe((result) => {
        this.departments = result.departments;
      });
  }

   ngOnChanges(changes: SimpleChanges): void {
    if(changes['department']) {

    }
  }

  navigate() {
    let navigationExtras: NavigationExtras = {
      queryParams: {},
      queryParamsHandling: 'merge',
    };
    Object.entries(this.filterForm.value).forEach(([key, val]) => {
      if (val) (navigationExtras.queryParams as Params)[key] = val;
    });
    this.router.navigate([this.url], navigationExtras);

    this.dialogRef.close();
  }
}
