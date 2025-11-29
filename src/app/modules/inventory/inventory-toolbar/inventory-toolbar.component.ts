import { Component } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  standalone: false,
})
export class InventoryToolbarComponent {
  constructor(private dialogService: DialogService) {}

  openFilterDialog() {
    this.dialogService.openEquipmentFilterDialog();
  }
}
