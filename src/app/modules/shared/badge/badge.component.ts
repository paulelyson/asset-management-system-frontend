import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  iconlist: IconType[] = [];
}
