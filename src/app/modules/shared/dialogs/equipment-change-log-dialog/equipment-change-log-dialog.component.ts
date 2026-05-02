import { Component, Inject } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { BorrowedEquipmentHistoryDialogComponent } from '../../../borrowed-equipment/borrowed-equipment-history-dialog/borrowed-equipment-history-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VerticalStepperComponent } from '../../vertical-stepper/vertical-stepper.component';
import { MatDividerModule } from '@angular/material/divider';
import {
  ChangeAction,
  CHANGELOG_STATUS_VARIANT,
  EquipmentChangeLogs,
} from '../../../../models/data/equipment-change-logs.model';
import { VerticalStepperConfig } from '../../../../models/ui/vertical-stepper-config';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '../../../../utils/string.util';
import { BadgeComponent } from '../../badge/badge.component';
import { EmptyPlaceholderComponent } from '../../empty-placeholder/empty-placeholder.component';

@Component({
  selector: 'app-equipment-change-log-dialog',
  imports: [IconComponent, VerticalStepperComponent, MatDividerModule, BadgeComponent, EmptyPlaceholderComponent],
  templateUrl: './equipment-change-log-dialog.component.html',
  styleUrl: './equipment-change-log-dialog.component.css',
})
export class EquipmentChangeLogDialogComponent {
  equipmentName: string = '';
  serialNo: string = '';
  total: number = 0;
  changeLogs: VerticalStepperConfig[] = [];
  performedBy: string = '';
  constructor(
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: EquipmentChangeLogs[],
    private dialogRef: MatDialogRef<BorrowedEquipmentHistoryDialogComponent>,
  ) {
    this.equipmentName = this.data[0]?.equipment?.name ?? '';
    this.serialNo = this.data[0]?.equipment?.serialNo ?? '';
    this.total = this.data?.length;
    this.changeLogs = this.data.map(
      (dt) =>
        new VerticalStepperConfig({
          title: dt.action,
          variant: CHANGELOG_STATUS_VARIANT[dt.status],
          badgeContent: dt.status,
          time: dt.createdAt
            ? (this.datePipe.transform(dt.createdAt, 'short') ?? dt.createdAt.toISOString())
            : '',
          contents: [
            (dt.action == ChangeAction.CREATE
              ? 'Added by '
              : 'Updated by ') + getDisplayName(dt?.performedBy), 
            (dt.performedBy?.firstName[0] || '') + (dt.performedBy?.lastName[0] || ''),
            
          ],
        }),
    );
  }

  onClose() {
    this.dialogRef.close();
  }
}
