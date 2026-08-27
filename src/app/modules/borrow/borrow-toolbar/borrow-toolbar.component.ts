import { Component, computed, EventEmitter, input, Input, Output } from '@angular/core';
import { FilterDisplay } from '../../../models/ui/common-config.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { Badge } from '@paulelyson/elyui';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-borrow-toolbar',
  imports: [Badge, ButtonComponent, ReactiveFormsModule, InputComponent],
  templateUrl: './borrow-toolbar.component.html',
  styleUrl: './borrow-toolbar.component.css',
})
export class BorrowToolbarComponent {
  filters = input<FilterDisplay[]>([]);
  @Input() department: string = '';
  @Output() toggleBorrowForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  searchControl = new FormControl('');
  showClearFilter = computed((): boolean => this.filters().some((x) => x.canClose && x.show));
  url: string = '';
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
      queryParams: { [filter.field]: null },
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
