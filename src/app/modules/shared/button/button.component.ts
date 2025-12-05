import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type ButtonShade = 'default' | 'light';
type ButtonWidth = 'width-filled' | 'width-auto'

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() size: ButtonSize = 'sm';
  @Input() type: ButtonType = 'default';
  @Input() shade: ButtonShade = 'default';
  @Input() width: ButtonWidth = 'width-auto';
  @Input() btnType: 'submit' | 'button' | 'reset' = 'button';
  @Output() btnclicked: EventEmitter<string> = new EventEmitter<string>();

  onClicked(): void {
    this.btnclicked.emit();
  }
}
