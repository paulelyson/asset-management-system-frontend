import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent } from '../menu/menu.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, IconComponent, RouterLink, AvatarComponent, MenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  sidenav_opened: boolean = false;
  showAvatarMenu: boolean = false;
  isLoggedIn: WritableSignal<boolean> = signal(false)

  constructor(
    private dialogService: DialogService,
    private authService: AuthService,
  ) {
    this.authService.isLoggedIn().subscribe((resp) => (this.isLoggedIn.set(resp)));
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  login(): void {
    this.dialogService.openLoginDialog().subscribe((resp) => {
      if(resp == 'login_success') {
        this.isLoggedIn.set(true);
      }
    });
  }

  onAvatarClicked() {
    this.showAvatarMenu = !this.showAvatarMenu;
  }

  onActionClicked(event: string) {
    console.log(event);
    if (event === 'logout') {
      this.showAvatarMenu = false;
      this.authService.logout();
    }
  }
}
