import { Component, Inject, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import {
  EQUIPMENT_STATUS_VARIANT,
  EquipmentCondition,
  IEquipment,
} from '../../../models/Equipment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConditionQuantityPipe } from '../../../pipes/condition-quantity.pipe';
import { BadgeComponent } from '../badge/badge.component';
import { DisplayNamePipe } from '../../../pipes/displayname.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-equipment-detail-dialog',
  imports: [
    MatDividerModule,
    ConditionQuantityPipe,
    BadgeComponent,
    DisplayNamePipe,
    IconComponent,
  ],
  templateUrl: './equipment-detail-dialog.component.html',
  styleUrl: './equipment-detail-dialog.component.css',
})
export class EquipmentDetailDialogComponent implements OnInit {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';
  constructor(
    public dialogRef: MatDialogRef<EquipmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IEquipment,
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  getVariant(cond: EquipmentCondition) {
    return EQUIPMENT_STATUS_VARIANT[cond];
  }

  onClose() {
    this.dialogRef.close()
  }
}
