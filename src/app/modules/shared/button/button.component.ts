import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '../icon/icon.component';
import { Size, Variant } from '../../../models/ui/common-config.model';
import { ButtonAppearance, ButtonShade, ButtonWidth } from '../../../models/ui/button-config.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-button',
  imports: [CommonModule, MatIconModule, IconComponent, MatTooltipModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() action: string = '';
  @Input() variant: Variant = 'neutral';
  @Input() appearance: ButtonAppearance = 'tonal';
  @Input() size: Size = 'sm';
  @Input() type: 'submit' | 'button' | 'reset' = 'button';
  @Input() shade: ButtonShade = 'default';
  @Input() width: ButtonWidth = 'width-auto';
  @Input() icon: string = '';
  @Input() tooltip: string = ''
  @Input() disabled: boolean = false;
  @Output() btnclicked: EventEmitter<string> = new EventEmitter<string>();

  onClicked(): void {
    this.btnclicked.emit(this.action);
  }
}
