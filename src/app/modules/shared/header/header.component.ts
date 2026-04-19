import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent } from '../menu/menu.component';
import { AuthService, TokenData } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, RouterLink, AvatarComponent, MenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  sidenav_opened: boolean = false;
  showAvatarMenu: boolean = false;
  isLoggedIn: WritableSignal<boolean> = signal(false);
  user: WritableSignal<TokenData | null> = signal(null);

  subtitles = computed(() => {
    return this.user()?.roles.map((role) => `${role.role.toUpperCase()} - ${role.department.code}`);
  });

  constructor(
    private dialogService: DialogService,
    private authService: AuthService,
  ) {
    this.authService.isLoggedIn().subscribe((resp) => {
      this.onLogin(resp);
    });
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  login(): void {
    this.dialogService.openLoginDialog().subscribe((resp) => {
      if (resp == 'login_success') {
        this.onLogin(true);
      }
    });
  }

  onLogin(isLoggedIn: boolean = false) {
    this.isLoggedIn.set(isLoggedIn);
    this.user.set(this.authService.getUser());
  }

  onAvatarClicked() {
    this.showAvatarMenu = !this.showAvatarMenu;
  }

  onActionClicked(event: string) {
    if (event === 'logout') {
      this.showAvatarMenu = false;
      this.isLoggedIn.set(false);
      this.authService.logout();
    }
  }
}
