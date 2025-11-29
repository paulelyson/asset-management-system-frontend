import { Component, Inject, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { IEquipment } from '../../../models/Equipment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const DEFAULT_IMG = './assets/equipment_default_image.png';

@Component({
  selector: 'app-equipment-detail-dialog',
  imports: [MatDividerModule],
  templateUrl: './equipment-detail-dialog.component.html',
  styleUrl: './equipment-detail-dialog.component.css',
})
export class EquipmentDetailDialogComponent implements OnInit {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  constructor(
    public dialogRef: MatDialogRef<EquipmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IEquipment
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
