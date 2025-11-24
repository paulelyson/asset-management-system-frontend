import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';


const DEFAULT_IMG = './assets/equipment_default_image.png';

@Component({
  selector: 'app-equipment-detail-dialog',
  imports: [MatDividerModule],
  templateUrl: './equipment-detail-dialog.component.html',
  styleUrl: './equipment-detail-dialog.component.css',
})
export class EquipmentDetailDialogComponent {
}
