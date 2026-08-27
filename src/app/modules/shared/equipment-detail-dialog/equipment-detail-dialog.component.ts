import { Component, Inject, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import {
  EQUIPMENT_STATUS_VARIANT,
  EquipmentCondition,
  getLocationName,
  IEquipment,
} from '../../../models/Equipment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConditionQuantityPipe } from '../../../pipes/condition-quantity.pipe';
import { Badge, Icon } from '@paulelyson/elyui';
import { DisplayNamePipe } from '../../../pipes/displayname.pipe';

@Component({
  selector: 'app-equipment-detail-dialog',
  imports: [
    MatDividerModule,
    ConditionQuantityPipe,
    Badge,
    DisplayNamePipe,
    Icon,
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

  get locationName(): string | undefined {
    return getLocationName(this.data.location);
  }

  getVariant(cond: EquipmentCondition) {
    return EQUIPMENT_STATUS_VARIANT[cond];
  }

  onClose() {
    this.dialogRef.close()
  }
}
