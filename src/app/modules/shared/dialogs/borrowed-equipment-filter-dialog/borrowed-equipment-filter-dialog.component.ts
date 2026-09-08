import { Component } from '@angular/core';
import {
  BORROWED_EQUIPMENT_PURPOSE,
  BORROWED_EQUIPMENT_STATUS,
  BorrowedEquipmentPurpose,
  BorrowedEquipmentStatusType,
} from '../../../../models/BorrowedEquipment';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Autocomplete, AutocompleteOption, Button } from '@paulelyson/elyui';

@Component({
  selector: 'app-borrowed-equipment-filter-dialog',
  templateUrl: './borrowed-equipment-filter-dialog.component.html',
  styleUrl: './borrowed-equipment-filter-dialog.component.css',
  imports: [Button, Autocomplete, ReactiveFormsModule]
})
export class BorrowedEquipmentFilterDialogComponent {
  purposes: BorrowedEquipmentPurpose[] = [];
  status: BorrowedEquipmentStatusType[] = [];
  departments: AutocompleteOption[] = [];
  filterForm: FormGroup;
  url: string = '';
  constructor(
    public dialogRef: MatDialogRef<BorrowedEquipmentFilterDialogComponent>,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      purpose: [''],
    });
    this.purposes = BORROWED_EQUIPMENT_PURPOSE;
    this.status = BORROWED_EQUIPMENT_STATUS;
    this.url = this.router.url.split('?')[0];
  }

  navigate() {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    };
    Object.entries(this.filterForm.value).forEach(([key, val]) => {
      if (val) (navigationExtras.queryParams as Params)[key] = val;
    });
    this.router.navigate([this.url], navigationExtras);
    this.dialogRef.close();
  }
}
