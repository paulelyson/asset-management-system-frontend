import { FilterDisplay, Variant } from "../../../models/ui/common-config.model";

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


export function getVariantFromBorrowStatus(status: string): Variant {
  const normalized = status.replace(/^\d+\s*/, '').trim().toLowerCase();

  const map: Record<string, Variant> = {
    requested: 'neutral',
    instructor_approved: 'accent',
    oic_approved: 'accent',
    released: 'warning',
    instructor_rejected: 'neutral',
    oic_rejected: 'neutral',
    mark_returned: 'warning',
    returned: 'success',
    unreturned: 'neutral',
    cancelled: 'neutral',
    system_reset: 'neutral'
  };

  return map[normalized] ?? 'neutral';
}