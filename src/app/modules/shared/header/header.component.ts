import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { MenuComponent } from '../menu/menu.component';
import { AuthService } from '../../../services/auth.service';
import { INVENTORY_ROLES } from '../../../models/data/user-profile.model';
import { environment } from '../../../../environments/environment';
import { Avatar, Button } from '@paulelyson/elyui';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Avatar, MenuComponent, Button],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // `inject()` rather than constructor parameters because the fields below are
  // initializers that need authService. With useDefineForClassFields on (target
  // ES2022), field initializers run before the constructor body, so a
  // constructor-injected dependency would still be undefined at that point.
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  /**
   * The single source of logged-in state. This used to be a local signal fed
   * from three places (the subscription, the login dialog's result, and the
   * logout handler), which ran onLogin twice per login.
   *
   * `initialValue` reads the token synchronously so a hard refresh renders the
   * logged-in header immediately instead of flashing Login/Register.
   */
  isLoggedIn = toSignal(this.authService.isLoggedIn(), {
    initialValue: this.authService.hasToken(),
  });

  // Was an @Input() no parent bound, mutated from a subscription. As a plain
  // field in a zoneless app it only re-rendered because isLoggedIn changed in
  // the same tick.
  isTransparent = computed(() => !this.isLoggedIn());

  /**
   * From the profile, not the token: decoding the JWT wasn't reactive and threw
   * on a malformed token. Empty until the profile lands, which ely-avatar
   * handles by falling back to its person icon.
   */
  userName = computed(() => this.authService.profile()?.name ?? '');

  showAvatarMenu = signal(false);

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

  canAccessInventory = computed(() => {
    return this.isLoggedIn() && this.authService.hasRole(INVENTORY_ROLES);
  });

  constructor() {
    // The header renders on routes with no guard (login, homepage), so it can't
    // rely on a guard having warmed the profile for it. `untracked` because
    // ensureProfile reads the profile signal, and this should rerun on login
    // state only, not every time the profile changes.
    effect(() => {
      if (this.isLoggedIn()) {
        untracked(() => this.authService.ensureProfile().subscribe());
      }
    });
  }

  // The dialog navigates on success and AuthService emits the new login state,
  // so there's nothing to do with the result here.
  login(): void {
    this.dialogService.openLoginDialog();
  }

  // Registration is owned by the CMS, so this leaves the app rather than routing.
  register(): void {
    window.location.assign(environment.cms_url + '/register');
  }

  onAvatarClicked(): void {
    this.showAvatarMenu.update((show) => !show);
  }

  onActionClicked(event: string): void {
    if (event === 'logout') {
      this.showAvatarMenu.set(false);
      this.authService.logout();
    }
  }
}
