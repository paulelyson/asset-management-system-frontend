import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-menu',
  imports: [ButtonComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent{
  @Input() show: boolean = false;
  @Output() onActionClicked: EventEmitter<string> = new EventEmitter<string>()
  logout() {
    this.onActionClicked.emit('logout')
  }
}
