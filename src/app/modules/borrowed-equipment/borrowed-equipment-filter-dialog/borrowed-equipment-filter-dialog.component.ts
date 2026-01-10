import { Component } from '@angular/core';
import {
  BORROWED_EQUIPMENT_PURPOSE,
  BORROWED_EQUIPMENT_STATUS,
} from '../../../models/BorrowedEquipment';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-borrowed-equipment-filter-dialog',
  templateUrl: './borrowed-equipment-filter-dialog.component.html',
  styleUrl: './borrowed-equipment-filter-dialog.component.css',
  standalone: false,
})
export class BorrowedEquipmentFilterDialogComponent {
  purposes: IAutocompleteOption[] = [];
  status: IAutocompleteOption[] = [];
  filterForm: FormGroup;
  url: string = '';
  constructor(
    public dialogRef: MatDialogRef<BorrowedEquipmentFilterDialogComponent>,
    private autocompleteService: AutocompleteService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      purpose: [''],
      status: [''],
    });
    this.purposes = this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_PURPOSE);
    this.status = this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_STATUS);
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
