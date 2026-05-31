import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ToggleComponent } from '../../shared/toggle/toggle.component';
import { InputComponent } from '../../shared/input/input.component';
import { FilterDisplay } from '../../../models/ui/common-config.model';

@Component({
  selector: 'app-borrowed-equipment-toolbar',
  templateUrl: './borrowed-equipment-toolbar.component.html',
  styleUrl: './borrowed-equipment-toolbar.component.css',
  imports: [BadgeComponent, ButtonComponent, ToggleComponent, InputComponent, ReactiveFormsModule]
})
export class BorrowedEquipmentToolbarComponent implements OnChanges {
  @Input() filters: FilterDisplay[] = [];
  searchControl = new FormControl('');
  url: string = '';
  infoAndHistory: boolean = false;
  enableCancel: boolean = false;

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      const info_and_trans = this.filters.find((filter) => filter.field == 'advanced');
      this.infoAndHistory = info_and_trans ? JSON.parse(info_and_trans.value) : false;

      const enableCancel = this.filters.find((filter) => filter.field == 'enable_cancel');
      this.enableCancel = enableCancel ? JSON.parse(enableCancel.value) : false;
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
      queryParams: { [filter.field]: null },
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
      queryParams: { page: 1, advanced: event },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onEnableCancelToggle(event: boolean): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, enable_cancel: event },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
