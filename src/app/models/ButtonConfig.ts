import { IButtonConfig } from '../modules/shared/button/button.component';

type ButtonConfigOptions = Partial<IButtonConfig> & Pick<IButtonConfig, 'name'>;

class ButtonConfig implements IButtonConfig {
  id: number;
  name: string;
  size: 'md' | 'sm' | 'lg';
  type: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'accent';
  shade: 'default' | 'light';
  width: 'width-filled' | 'width-auto';
  btnType: 'button' | 'submit' | 'reset';

 constructor({
    id = 0,
    name,
    size = 'sm',
    type = 'default',
    shade = 'default',
    width = 'width-auto',
    btnType = 'button',
  }: ButtonConfigOptions) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.type = type;
    this.shade = shade;
    this.width = width;
    this.btnType = btnType;
  }
}

export default ButtonConfig;
