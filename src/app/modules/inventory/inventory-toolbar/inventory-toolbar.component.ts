import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  standalone: false,
})
export class InventoryToolbarComponent {
  @Input() filters: Record<string, string>[] = [];
  url: string = '';
  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.url = this.router.url.split('?')[0];
  }

  openFilterDialog() {
    this.dialogService.openEquipmentFilterDialog();
  }

  onBadgeClosed(filter:  Record<string, string>): void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        [filter['field']]: null,
      },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }
}
