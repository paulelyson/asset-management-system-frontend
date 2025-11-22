import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-side-navigation',
  imports: [IconComponent],
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.css',
})
export class SideNavigationComponent {
  sidenav_opened: boolean = false;
}
