import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-borrowed-equipment-toolbar',
  templateUrl: './borrowed-equipment-toolbar.component.html',
  styleUrl: './borrowed-equipment-toolbar.component.css',
  standalone: false,
})
export class BorrowedEquipmentToolbarComponent {
  searchControl = new FormControl('');

  constructor(private dialogService: DialogService) {}

  openFilterDialog() {
    this.dialogService.openBorrowedEquipmentFilterDialog();
  }
}
