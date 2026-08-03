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
  // Reads the profile signal, not the token: roles left the JWT. A signal is
  // what lets this recompute on its own once the profile request lands.
  subtitles = computed(() => {
    const profile = this.authService.profile();
    // Was `'ID NUMBER: ' + idNumber || ''` — the `||` bound to the whole
    // concatenation, so a missing id rendered "ID NUMBER: undefined".
    const contents: string[] = ['ID NUMBER: ' + (profile?.idNumber ?? '')];

    for (const assignment of profile?.assignments ?? []) {
      // Department-scoped roles show their department; lab_in_charge and
      // assistant are scoped to a location instead.
      const scope = assignment.department?.code ?? assignment.location?.name;
      const role = assignment.role.toUpperCase();
      contents.push(scope ? `${role} - ${scope}` : role);
    }
    return contents;
  });

  canAccessInventory = computed(()=> {
    return this.isLoggedIn() && this.authService.hasRole(['lab_in_charge', 'chairman', 'instructor', 'assistant', 'administrator', 'dean'])
  })

  constructor(
    private dialogService: DialogService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((resp) => {
      if (resp) this.onLogin(resp);
      else this.onLogout()
    });
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
    // The header renders on routes with no guard (login, homepage), so it can't
    // rely on a guard having warmed the profile for it.
    this.authService.ensureProfile().subscribe();
    this.isTransparent = false;
  }

  onLogout() {
    this.isTransparent = true;
    this.isLoggedIn.set(false);
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
