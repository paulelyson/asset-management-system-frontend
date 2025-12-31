import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '../icon/icon.component';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type ButtonShade = 'default' | 'light';
type ButtonWidth = 'width-filled' | 'width-auto';
type ButtonVariant = 'default' | 'link';

export interface IButtonConfig {
  id: number;
  name: string;
  size: ButtonSize;
  type: ButtonType;
  shade: ButtonShade;
  width: ButtonWidth;
  btnType: 'submit' | 'button' | 'reset';
}

@Component({
  selector: 'app-button',
  imports: [CommonModule, MatIconModule, IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'md';
  @Input() type: ButtonType = 'default';
  @Input() shade: ButtonShade = 'default';
  @Input() width: ButtonWidth = 'width-auto';
  @Input() btnType: 'submit' | 'button' | 'reset' = 'button';
  @Input() icon: string = 'none';
  @Input() disabled: boolean = false;
  @Output() btnclicked: EventEmitter<string> = new EventEmitter<string>();

  onClicked(): void {
    this.btnclicked.emit();
  }
}
