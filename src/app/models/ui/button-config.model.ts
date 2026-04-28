import { Size, Variant } from "./common-config.model";

export type ButtonShade = 'default' | 'light';
export type ButtonWidth = 'width-filled' | 'width-auto';
export type ButtonAppearance =
  | 'filled'
  | 'outlined'
  | 'ghost' // visual style
  | 'link'
  | 'icon'
  | 'tonal';


export class ButtonConfig {
  id: number = 0;
  name: string = '';
  size: Size = 'md';
  variant: Variant = 'neutral';
  appearance: ButtonAppearance = 'filled';
  shade: ButtonShade = 'default';
  width: ButtonWidth = 'width-auto';
  type: 'submit' | 'button' | 'reset' = 'button';

  constructor(partial?: Partial<ButtonConfig>) {
    Object.assign(this, partial);
  }
}
