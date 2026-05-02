import { Component, Input } from '@angular/core';
import { Variant } from '../../../models/ui/common-config.model';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-vertical-stepper',
  imports: [CommonModule, BadgeComponent],
  templateUrl: './vertical-stepper.component.html',
  styleUrl: './vertical-stepper.component.css',
})
export class VerticalStepperComponent {
  @Input() variant: Variant = 'success';
  @Input() title: string = '';
  @Input() badgeContent: string = ''
  @Input() time = ''
  @Input() showLine: boolean = true;
}
