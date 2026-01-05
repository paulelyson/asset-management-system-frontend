import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-borrow-toolbar',
  templateUrl: './borrow-toolbar.component.html',
  styleUrl: './borrow-toolbar.component.css',
  standalone: false,
})
export class BorrowToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  searchControl = new FormControl('');
}
