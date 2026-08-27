import { Variant } from '@paulelyson/elyui';
import { FilterDisplay } from '../../../models/ui/common-config.model';
import { BORROW_STATUS_VARIANT, BorrowedEquipmentStatusType } from "../../../models/BorrowedEquipment";

export const getFilterDisplay = (filter: Record<string, any>, unClosed: string[] = [] ,dontShow: string[] = ['page', 'limit']): FilterDisplay[] => {
  return Object.entries(filter)
    .map(([key, val]) => ({
      field: key,
      value: val,
      show: !dontShow.includes(key),
      canClose: !unClosed.includes(key),
      // canClose: false
    }))
    .filter((item) => item.value || typeof item.value === 'boolean');
};


/**
 * Delegates to BORROW_STATUS_VARIANT rather than keeping its own table. It used
 * to hold a second copy that had already drifted — `cancelled` and `unreturned`
 * rendered 'neutral' here but 'danger' there, so the same status was coloured
 * differently depending on which component drew it.
 */
export function getVariantFromBorrowStatus(status: string): Variant {
  // Callers sometimes pass a display string with a leading count ("3 released").
  const normalized = status
    .replace(/^\d+\s*/, '')
    .trim()
    .toLowerCase() as BorrowedEquipmentStatusType;

  return BORROW_STATUS_VARIANT[normalized] ?? 'neutral';
}