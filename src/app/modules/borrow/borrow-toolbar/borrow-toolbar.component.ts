import {
  Component,
  computed,
  EventEmitter,
  input,
  Input,
  Output,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { SideMenuService } from '../../../services/side-menu.service';
import { FilterDisplay } from '../../../models/EquipmentFilter';

@Component({
  selector: 'app-borrow-toolbar',
  templateUrl: './borrow-toolbar.component.html',
  styleUrl: './borrow-toolbar.component.css',
  standalone: false,
})
export class BorrowToolbarComponent {
  filters = input<FilterDisplay[]>([]);
  @Input() department: string = '';
  @Output() toggleBorrowForm: EventEmitter<boolean> = new EventEmitter<boolean>();

  searchControl = new FormControl('');
  url: string = '';
  showClearFilter = computed(() => this.filters().some((x) => x['field'] !== 'department'));

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  openFilterDialog() {
    this.dialogService.openEquipmentFilterDialog(this.department);
  }

  clearFilter(): void {
    this.router.navigate([this.url]);
  }

  onBadgeClosed(filter: FilterDisplay): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { [filter['field']]: null },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onToggleBorrowForm() {
    this.toggleBorrowForm.emit(true);
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
