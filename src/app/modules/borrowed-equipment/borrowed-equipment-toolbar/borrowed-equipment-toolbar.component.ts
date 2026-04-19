import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { FilterDisplay } from '../../../models/EquipmentFilter';

@Component({
  selector: 'app-borrowed-equipment-toolbar',
  templateUrl: './borrowed-equipment-toolbar.component.html',
  styleUrl: './borrowed-equipment-toolbar.component.css',
  standalone: false,
})
export class BorrowedEquipmentToolbarComponent implements OnChanges {
  @Input() filters: FilterDisplay[] = [];
  searchControl = new FormControl('');
  url: string = '';
  infoAndHistory: boolean = false;

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      const found = this.filters.find((filter) => filter['field'] == 'info_and_transaction');
      this.infoAndHistory = found ? JSON.parse(found['value']) : false;
    }
  }

  openFilterDialog() {
    this.dialogService.openBorrowedEquipmentFilterDialog();
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

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onShowInfoAndHistoryToggle(event: boolean): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, info_and_transaction: event },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
