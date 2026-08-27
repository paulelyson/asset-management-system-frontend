import { Component } from '@angular/core';
import { Icon } from '@paulelyson/elyui';

@Component({
  selector: 'app-side-navigation',
  imports: [Icon],
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.css',
})
export class SideNavigationComponent {
  sidenav_opened: boolean = false;
}
