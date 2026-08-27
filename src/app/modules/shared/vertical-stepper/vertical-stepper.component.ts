import { Component, Input } from '@angular/core';
import { Badge, Variant } from '@paulelyson/elyui';
import { CommonModule } from '@angular/common';

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
