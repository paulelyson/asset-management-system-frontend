import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ButtonComponent } from '../button/button.component';
import { AutocompleteComponent, IAutocompleteOption } from '../autocomplete/autocomplete.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Params, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { EquipmentService } from '../../../services/equipment.service';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-equipment-filter-dialog',
  imports: [ButtonComponent, FormsModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './equipment-filter-dialog.component.html',
  styleUrl: './equipment-filter-dialog.component.css',
})
export class EquipmentFilterDialogComponent implements OnInit {
  filterForm: FormGroup;
  url: string = '';
  equipment_types: IAutocompleteOption[];
  categories: IAutocompleteOption[] = [];
  brands: IAutocompleteOption[] = [];
  equipmentTypes: IAutocompleteOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<EquipmentFilterDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private equipmentService: EquipmentService,
    private autocompleteService: AutocompleteService
  ) {
    this.url = this.router.url.split('?')[0];

    this.filterForm = this.fb.group({
      categories: [''],
      brand: [''],
      equipmentType: [''],
      location: [''],
    });

    this.equipment_types = this.autocompleteService.mapIntoAutocompleteOption([
      'bar',
      'foo',
      'waa',
    ]);
  }

  ngOnInit(): void {
    forkJoin({
    categories: this.equipmentService.getDistinctValues('categories', 'computer_engineering'),
    brands: this.equipmentService.getDistinctValues('brand', 'computer_engineering'),
    equipmentTypes: this.equipmentService.getDistinctValues('equipmentType', 'computer_engineering'),
  })
    .pipe(map(({ categories, brands, equipmentTypes }) => ({
        categories: this.autocompleteService.mapIntoAutocompleteOption(categories),
        brands: this.autocompleteService.mapIntoAutocompleteOption(brands),
        equipmentTypes: this.autocompleteService.mapIntoAutocompleteOption(equipmentTypes),
      }))
    )
    .subscribe(result => {
      this.categories = result.categories;
      this.brands = result.brands;
      this.equipmentTypes = result.equipmentTypes;
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

    this.dialogRef.close();
  }
}
