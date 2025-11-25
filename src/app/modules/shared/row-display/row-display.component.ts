import { Component, Input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

export interface RowDisplayContent {
  type: 'badge' | 'text';
  content: string[];
}

@Component({
  selector: 'app-row-display',
  imports: [MatDividerModule, IconComponent, BadgeComponent, CommonModule],
  templateUrl: './row-display.component.html',
  styleUrl: './row-display.component.css',
})
export class RowDisplayComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins'
  @Input() image: string = ''
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() contents: RowDisplayContent[] = [];
}
