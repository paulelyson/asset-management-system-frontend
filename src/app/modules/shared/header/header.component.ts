import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  sidenav_opened: boolean = false;

}
