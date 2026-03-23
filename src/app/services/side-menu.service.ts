import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface SideMenuConfig {
  opened: boolean;
  template: 'borrow-request-form' | string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SideMenuService {
  openSideMenu = new BehaviorSubject<SideMenuConfig>({
    opened: false,
    template: '',
  });

  onOpenSideMenu() {
    return this.openSideMenu.asObservable();
  }
}
