import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-menu',
  imports: [ButtonComponent, MatDividerModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  @Input() show: boolean = false;
  @Input() title: string  = ''
  @Input() subtitle: string  = 'computer engineering'
  @Output() onActionClicked: EventEmitter<string> = new EventEmitter<string>();
  logout() {
    this.onActionClicked.emit('logout');
  }
}
