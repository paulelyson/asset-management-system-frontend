import { Variant } from './common-config.model';

export class VerticalStepperConfig {
  title: string = '';
  badgeContent: string = '';
  icon: string = '';
  time: string = '';
  variant: Variant = 'success';
  showLine: boolean = false;
  contents: any[] = [];
  constructor(partial?: Partial<VerticalStepperConfig>) {
    Object.assign(this, partial);
  }
}
