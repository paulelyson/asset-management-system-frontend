import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideMenuService {
  openSideMenu = new BehaviorSubject<boolean>(false);

  onOpenSideMenu() {
    return this.openSideMenu.asObservable();
  }
}
