import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-menu',
  imports: [ButtonComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent{
  @Input() show: boolean = false;


}
