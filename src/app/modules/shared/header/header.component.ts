import { Component, computed, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent } from '../menu/menu.component';
import { AuthService, TokenData } from '../../../services/auth.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, RouterLink, AvatarComponent, MenuComponent, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input() isTransparent: boolean = true;

  sidenav_opened: boolean = false;
  showAvatarMenu: boolean = false;
  isLoggedIn: WritableSignal<boolean> = signal(false);
  user: WritableSignal<TokenData | null> = signal(null);
  subtitles = computed(() => {
    let contents: string[] = [];
    const roles =
      this.user()?.roles.map((role) => `${role.role.toUpperCase()} - ${role.department.code}`) ||
      [];
    contents.push('ID NUMBER: ' + this.user()?.idNumber || '');
    contents = contents.concat(roles);
    return contents;
  });

  constructor(
    private dialogService: DialogService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn() == true) {
      this.authService.isLoggedIn().subscribe((resp) => {
        this.onLogin(resp);
      });
    }
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
    this.isTransparent = false;
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
