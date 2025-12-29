import { Injectable } from '@angular/core';
import { IAutocompleteOption } from '../modules/shared/autocomplete/autocomplete.component';

@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  getBorrowedStatusOptions(): IAutocompleteOption[] {
    return [
      {
        value: 'requested',
        view: 'Request',
      },
      {
        value: 'faculty_approved',
        view: 'Approve as faculty',
      },
      {
        value: 'oic_approved',
        view: 'Approve as LIC',
      },
      {
        value: 'released',
        view: 'Release',
      },
      {
        value: 'mark_returned',
        view: 'Mark as Returned',
      },
      {
        value: 'returned',
        view: 'Confirm Return',
      },
    ];
  }
}
