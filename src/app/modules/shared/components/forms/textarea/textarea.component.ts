import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-textarea',
  imports: [],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
})
export class TextareaComponent {
  @Input() label: string = 'Remarks';
  @Input() placeholder: string = 'Add note..';
  @Input() tag: string = '(Optional)';
}
