import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Size, Variant } from '../../../models/ui/common-config.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-badge',
  imports: [CommonModule, IconComponent],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  @Input() size: Size = 'sm';
  @Input() variant: Variant = 'neutral';
  @Input() hasBadgeIcon: boolean = false;
  @Input() hasCloseIcon: boolean = false;
  @Input() clickable: boolean = true;
  @Output() closed: EventEmitter<string> = new EventEmitter<string>();

  onClosed(): void {
    this.closed.emit();
  }
}
