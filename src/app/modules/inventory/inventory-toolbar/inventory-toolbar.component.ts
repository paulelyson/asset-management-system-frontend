import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';
import { NavigationExtras, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  standalone: false,
})
export class InventoryToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  searchControl = new FormControl('');
  url: string = '';
  constructor(private dialogService: DialogService, private router: Router) {
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
      queryParams: {
        [filter['field']]: null,
      },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        search: this.searchControl.value,
      },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
