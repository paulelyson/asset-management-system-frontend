import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-borrowed-equipment-toolbar',
  templateUrl: './borrowed-equipment-toolbar.component.html',
  styleUrl: './borrowed-equipment-toolbar.component.css',
  standalone: false,
})
export class BorrowedEquipmentToolbarComponent {
  searchControl = new FormControl('');
}
