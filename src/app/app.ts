import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavigationComponent } from './modules/shared/side-navigation/side-navigation.component';
import { HeaderComponent } from './modules/shared/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavigationComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('asset-management-system');
}
