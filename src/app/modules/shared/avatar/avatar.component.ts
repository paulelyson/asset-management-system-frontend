import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, input, Input, Output } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input() size: AvatarSize = 'md';
  // @Input() label: string = ''
  label = input('');
  @Output() avatarclicked: EventEmitter<string> = new EventEmitter();

  image = computed(() => {
    const parts = this.label().split(' ');
    const result = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return `https://placehold.co/60?text=${result}&font=poppins`;
  }); 

  onAvatarClicked() {
    this.avatarclicked.emit('');
  }
}
