import { Component, Input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { MatDividerModule } from '@angular/material/divider';

export interface RowDisplayContent {
  type: 'badge' | 'text';
  content: string;
}

@Component({
  selector: 'app-row-display',
  imports: [MatDividerModule, IconComponent, BadgeComponent],
  templateUrl: './row-display.component.html',
  styleUrl: './row-display.component.css',
})
export class RowDisplayComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() contents: RowDisplayContent[] = [];
}
