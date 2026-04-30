import { ButtonAppearance } from './button-config.model';
import { Size, Variant } from './common-config.model';

export type RowContentType = 'image' | 'title' | 'text' | 'badge' | 'action';

export class RowActionConfig {
  type: 'icon' | 'button' | 'badge' = 'button';
  name: string = '';
  icon: string = '';
  size: Size = 'md';
  variant?: Variant = 'neutral';
  tooltip?: string;
  appearance?: ButtonAppearance = 'filled';

  constructor(partial?: Partial<RowActionConfig>) {
    Object.assign(this, partial);
  }
}

export interface RowColumnConfig {
  id: number;
  type: RowContentType;
  header: string; // drives the header row
  content?: string | string[]; // text or badge array
  subtitle?: string; // only for type: 'title'
  image?: string; // only for type: 'image'
  weight?: number; // relative column width, default 1
  variant?: Variant;
  actions?: RowActionConfig[]; // only for type: 'action'
}
