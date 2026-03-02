import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './modules/shared/header/header.component';
import { SideNavigationComponent } from './modules/shared/side-navigation/side-navigation.component';
import { SideMenuComponent } from './modules/shared/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SideMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('asset-management-system');
}
