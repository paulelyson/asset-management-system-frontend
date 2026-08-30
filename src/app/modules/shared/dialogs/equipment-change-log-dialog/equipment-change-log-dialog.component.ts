import { Component, Inject, OnInit } from '@angular/core';
import { Badge, Button, Icon, Textarea, VerticalStepper } from '@paulelyson/elyui';
import { BorrowedEquipmentHistoryDialogComponent } from '../../../borrowed-equipment/borrowed-equipment-history-dialog/borrowed-equipment-history-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import {
  ChangeAction,
  CHANGELOG_STATUS_VARIANT,
  ChangeStatus,
  EquipmentChangeLog,
} from '../../../../models/data/equipment-change-logs.model';
import { VerticalStepperConfig } from '../../../../models/ui/vertical-stepper-config.model';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '../../../../utils/string.util';
import { EmptyPlaceholderComponent } from '../../empty-placeholder/empty-placeholder.component';
import { DisplayNamePipe } from '../../../../pipes/displayname.pipe';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipment-change-log-dialog',
  imports: [
    Icon,
    VerticalStepper,
    MatDividerModule,
    Badge,
    EmptyPlaceholderComponent,
    DisplayNamePipe,
    Button,
    Textarea,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './equipment-change-log-dialog.component.html',
  styleUrl: './equipment-change-log-dialog.component.css',
})
export class EquipmentChangeLogDialogComponent {
  ChangeStatus = ChangeStatus;
  equipmentName: string = '';
  serialNo: string = '';
  total: number = 0;
  changeLogs: VerticalStepperConfig[] = [];
  performedBy: string = '';
  showAction: boolean = false;
  remarksControl = new FormControl('');
  constructor(
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: EquipmentChangeLog[],
    private dialogRef: MatDialogRef<BorrowedEquipmentHistoryDialogComponent>,
  ) {
    this.equipmentName = this.data[0]?.equipment?.name ?? '';
    this.serialNo = this.data[0]?.equipment?.serialNo ?? '';
    this.total = this.data?.length;
    this.showAction = this.data.some((dt)=> dt.status == ChangeStatus.PENDING)
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
            (dt.action == ChangeAction.CREATE ? 'Added by ' : 'Updated by ') +
              getDisplayName(dt?.performedBy),
            (dt.performedBy?.firstName[0] || '') + (dt.performedBy?.lastName[0] || ''),
          ],
        }),
    );
  }

  asArray(content: string | any[] | undefined): string[] {
    if (!content) return ["N/A"];
    return Array.isArray(content) ? content : [content];
  }

  onResolve(status: ChangeStatus) {
    const pendingIds = this.data.filter(dt => dt.status == ChangeStatus.PENDING).map(cl => cl._id);
    console.log({pendingIds})
    const update = {
      _id: pendingIds[0],
      status: status,
      resolverRemarks: this.remarksControl.value
    }
    this.dialogRef.close(update);
  }

  onClose() {
    this.dialogRef.close();
  }
}
