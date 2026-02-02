import { Component, Input } from '@angular/core';

export interface IVerticalStepper {
  title: string;
  contents: string[];
}

@Component({
  selector: 'app-vertical-stepper',
  imports: [],
  templateUrl: './vertical-stepper.component.html',
  styleUrl: './vertical-stepper.component.css',
})
export class VerticalStepperComponent {
  @Input() contents: IVerticalStepper[] = [
    {
      title: 'Requested',
      contents: ['Jan. 31, 2026'],
    },
  ];
}
