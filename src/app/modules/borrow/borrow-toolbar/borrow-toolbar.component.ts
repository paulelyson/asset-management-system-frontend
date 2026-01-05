import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-borrow-toolbar',
  templateUrl: './borrow-toolbar.component.html',
  styleUrl: './borrow-toolbar.component.css',
  standalone: false,
})
export class BorrowToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  @Input() sidenav_opened: boolean = false;
  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter<boolean>();
  searchControl = new FormControl('');
  url: string = '';

  constructor(private dialogService: DialogService, private router: Router) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  onToggleBorrowForm() {
    this.sidenav_opened = !this.sidenav_opened;
    this.toggleSideNav.emit(this.sidenav_opened);
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
