import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, IconComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  sidenav_opened: boolean = false;

  constructor(private dialogService: DialogService) {}
  login(): void {
    this.dialogService.openLoginDialog();
  }
}
