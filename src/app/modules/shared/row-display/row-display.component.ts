import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent, IconSize, IconType } from '../icon/icon.component';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';


export interface RowDisplayContent {
  id: number; // fix track by identity warning
  type: 'badge' | 'text';
  content: string[];
}

export interface RowDisplayActionConfig {
  name: string;
  tooltip: string;
  type: IconType;
  size: IconSize;
}

@Component({
  selector: 'app-row-display',
  imports: [MatDividerModule, IconComponent, BadgeComponent, CommonModule],
  templateUrl: './row-display.component.html',
  styleUrl: './row-display.component.css',
})
export class RowDisplayComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  @Input() image: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() contents: RowDisplayContent[] = [];
  @Input() actions: RowDisplayActionConfig[] = [];
  @Output() actionclicked: EventEmitter<string> = new EventEmitter<string>();

  onActionClicked(icon: string): void {
    this.actionclicked.emit(icon);
  }
}
