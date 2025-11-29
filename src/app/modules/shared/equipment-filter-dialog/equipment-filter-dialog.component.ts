import { Component } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ButtonComponent } from '../button/button.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [DropdownComponent, ButtonComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent {
  filterForm: FormGroup;
  url: string = '';
  equipment_types: string[] = ['bar', 'foo', 'waa'];
  constructor(
    public dialogRef: MatDialogRef<EquipmentFilterDialogComponent>,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.url = this.router.url.split('?')[0];

    this.filterForm = this.fb.group({
      categories: [''],
      brand: [''],
      equipmentType: [''],
      location: [''],
    });
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

    this.dialogRef.close()
  }
}
