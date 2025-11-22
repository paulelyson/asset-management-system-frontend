import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
type IconSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-icon',
  imports: [MatIconModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  @Input() name: string = 'numbers';
  @Input() size: IconSize = 'sm';
}
