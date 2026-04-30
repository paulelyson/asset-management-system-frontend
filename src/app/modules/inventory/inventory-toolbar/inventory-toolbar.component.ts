import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { IEquipmentFilter } from '../../../models/filters/EquipmentFilter';
import { NavigationExtras, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { EquipmentService } from '../../../services/equipment.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  imports: [BadgeComponent, ButtonComponent, ReactiveFormsModule, InputComponent]
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
    // this.dialogService.openEquipmentFilterDialog();
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

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  addNewEquipment(): void {
    this.dialogService.openCreateEquipmentDialog();
  }
}
