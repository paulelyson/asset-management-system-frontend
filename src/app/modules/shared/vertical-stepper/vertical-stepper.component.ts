import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vertical-stepper',
  imports: [],
  templateUrl: './vertical-stepper.component.html',
  styleUrl: './vertical-stepper.component.css',
})
export class VerticalStepperComponent {
 @Input() contents: string[] = ['asdfs', 'bar', 'foo', 'bear']
}
