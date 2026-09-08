import { Injectable } from '@angular/core';
import { AutocompleteOption } from '@paulelyson/elyui';
import { BorrowedEquipmentStatusType } from '../models/BorrowedEquipment';

@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  /**
   * "Approve as faculty" and "Approve as LIC" used to be two separate options,
   * because approving as an instructor and as an OIC were two different
   * statuses. They're one status now — who approved is recorded on the
   * transaction, not in the state — so offering two would filter identically.
   */
  getBorrowedStatusOptions(): AutocompleteOption[] {
    const actions: Partial<Record<BorrowedEquipmentStatusType, string>> = {
      requested: 'Request',
      approved: 'Approve',
      released: 'Release',
      mark_returned: 'Mark as Returned',
      returned: 'Confirm Return',
      cancelled: 'Cancel',
    };

    return Object.entries(actions).map(([value, label]) => ({ value, label }));
  }
}
