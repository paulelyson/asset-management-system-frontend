import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent, IconSize } from '../icon/icon.component';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { IconType } from '@angular/material/icon/testing';

export interface RowDisplayContent {
  id: number; // fix track by identity warning
  type: 'badge' | 'text';
  content: string[];
}

export interface ActionConfig {
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
  @Input() actions: ActionConfig[] = [];
  @Output() actionclicked: EventEmitter<string> = new EventEmitter<string>();

  onActionClicked(event: any): void {
    this.actionclicked.emit(event);
  }
}
