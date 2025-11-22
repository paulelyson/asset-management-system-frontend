import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavigationComponent } from './modules/shared/side-navigation/side-navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('asset-management-system');
}
