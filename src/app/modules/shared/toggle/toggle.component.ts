import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-toggle',
  imports: [MatSlideToggleModule, FormsModule, MatTooltipModule],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
})
export class ToggleComponent {
  @Input() isChecked: boolean = false;
  @Input() label: string = '';
  @Input() labelPosition: 'before' | 'after' = 'before';
  @Input() tooltip: string = ''
  @Output() toggle = new EventEmitter<boolean>();

  onToggleChange(event: boolean) {
    this.toggle.emit(event);
  }
}
