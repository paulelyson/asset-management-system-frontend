import { FilterDisplay } from "../../../models/ui/common-config.model";

export const getFilterDisplay = (filter: Record<string, any>, dontShow: string[] = ['page'], unClosed: string[] = []): FilterDisplay[] => {
  return Object.entries(filter)
    .map(([key, val]) => ({
      field: key,
      value: val,
      show: !dontShow.includes(key),
      canClose: !unClosed.includes(key),
      // canClose: false
    }))
    .filter((item) => item.value);
};
