import { Component } from '@angular/core';
import {
  BORROWED_EQUIPMENT_PURPOSE,
  BORROWED_EQUIPMENT_STATUS,
} from '../../../models/BorrowedEquipment';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';

@Component({
  selector: 'app-borrowed-equipment-filter-dialog',
  templateUrl: './borrowed-equipment-filter-dialog.component.html',
  styleUrl: './borrowed-equipment-filter-dialog.component.css',
  standalone: false,
})
export class BorrowedEquipmentFilterDialogComponent {
  purposes: IAutocompleteOption[] = [];
  status: IAutocompleteOption[] = [];

  constructor(private autocompleteService: AutocompleteService) {
    this.purposes = this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_PURPOSE);
    this.status = this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_STATUS);
  }
}
