import { Component, Input } from '@angular/core';
import { Variant } from '../../../models/ui/common-config.model';
import { CommonModule } from '@angular/common';
import { Badge } from '@paulelyson/elyui';

@Component({
  selector: 'app-vertical-stepper',
  imports: [CommonModule, Badge],
  templateUrl: './vertical-stepper.component.html',
  styleUrl: './vertical-stepper.component.css',
})
export class VerticalStepperComponent {
  @Input() variant: Variant = 'neutral';
  @Input() title: string = '';
  @Input() badgeContent: string = ''
  @Input() time = ''
  @Input() showLine: boolean = true;
}
