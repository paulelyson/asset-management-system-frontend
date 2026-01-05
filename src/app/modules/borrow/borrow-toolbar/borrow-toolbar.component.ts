import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

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

  onToggleBorrowForm() {
    this.sidenav_opened = !this.sidenav_opened;
    this.toggleSideNav.emit(this.sidenav_opened);
  }
}
