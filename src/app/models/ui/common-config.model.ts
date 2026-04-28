export type Size = 'xs' | 'sm' | 'md' | 'lg';
export type Variant = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export interface FilterDisplay {
  field: string;
  value: any;
  show: boolean;
  canClose: boolean;
}
