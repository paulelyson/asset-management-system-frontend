import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input() size: AvatarSize = 'md';
  @Output() avatarclicked: EventEmitter<string> = new EventEmitter();
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  get image() {
    return this.default_img;
  }

  onAvatarClicked() {
    this.avatarclicked.emit('');
  }
}
