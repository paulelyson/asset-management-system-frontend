import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeType = 'primary' | 'success' | 'warning' | 'danger';
interface IconType {
  type: BadgeType;
  icon: string;
}

interface BadgeTypeSetting {
  value: string;
  type: BadgeType;
}

@Component({
  selector: 'app-badge',
  imports: [CommonModule, MatIconModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  @Input() size: BadgeSize = 'sm';
  @Input() type: BadgeType = 'primary';
  @Input() hasBadgeIcon: boolean = false;
  @Input() hasCloseIcon: boolean = false;
  @Input() clickable: boolean = true;
  @Output() closed: EventEmitter<string> = new EventEmitter<string>();
  iconlist: IconType[] = [];

  onClosed(): void {
    this.closed.emit();
  }
}
