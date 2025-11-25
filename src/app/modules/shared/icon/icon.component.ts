import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconType = 'primary' | 'success' | 'warning' | 'danger';
@Component({
  selector: 'app-icon',
  imports: [MatIconModule, CommonModule, MatTooltipModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  @Input() name: string = 'numbers';
  @Input() size: IconSize = 'sm';
  @Input() type: IconType = 'primary';
  @Input() clickable: boolean = true;
  @Output() iconclicked: EventEmitter<string> = new EventEmitter<string>();

  onClicked(): void {
    this.iconclicked.emit(this.name);
  }

}

