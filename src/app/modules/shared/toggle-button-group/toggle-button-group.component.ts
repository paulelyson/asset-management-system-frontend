import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toggle-button-group',
  imports: [],
  templateUrl: './toggle-button-group.component.html',
  styleUrl: './toggle-button-group.component.css',
})
export class ToggleButtonGroupComponent {
  @Input() options: string[] = [];
  @Input() label: string = '';
}
