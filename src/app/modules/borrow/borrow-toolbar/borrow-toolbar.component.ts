import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { SideMenuService } from '../../../services/side-menu.service';

@Component({
  selector: 'app-borrow-toolbar',
  templateUrl: './borrow-toolbar.component.html',
  styleUrl: './borrow-toolbar.component.css',
  standalone: false,
})
export class BorrowToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter<boolean>();
  searchControl = new FormControl('');
  url: string = '';

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private sideMenuService: SideMenuService,
  ) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  openFilterDialog() {
    this.dialogService.openEquipmentFilterDialog();
  }

  clearFilter(): void {
    this.router.navigate([this.url]);
  }

  onBadgeClosed(filter: Record<string, string>): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { [filter['field']]: null },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onToggleBorrowForm() {
    this.sideMenuService.openSideMenu.next({
      opened: true,
      template: 'borrow-request-form'
    });
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
