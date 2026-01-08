import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-borrowed-equipment-toolbar',
  templateUrl: './borrowed-equipment-toolbar.component.html',
  styleUrl: './borrowed-equipment-toolbar.component.css',
  standalone: false,
})
export class BorrowedEquipmentToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  searchControl = new FormControl('');
  url: string = '';

  constructor(private dialogService: DialogService, private router: Router) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  openFilterDialog() {
    this.dialogService.openBorrowedEquipmentFilterDialog();
  }

  onBadgeClosed(filter: Record<string, string>): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { [filter['field']]: null },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
