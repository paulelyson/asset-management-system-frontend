import { Component } from '@angular/core';
import { ToggleButtonGroupComponent } from '../../shared/toggle-button-group/toggle-button-group.component';
import { MatDividerModule } from '@angular/material/divider';
import { IconComponent } from '../../shared/icon/icon.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ToggleComponent } from '../../shared/toggle/toggle.component';
import { last } from 'rxjs';

@Component({
  selector: 'app-download-report-dialog',
  imports: [ToggleButtonGroupComponent, MatDividerModule, IconComponent, ToggleComponent],
  templateUrl: './download-report-dialog.component.html',
  styleUrl: './download-report-dialog.component.css',
})
export class DownloadReportDialogComponent {
  equipmentFields = [
    {
      label: 'Serial No.',
      value: 'serialNo',
      checked: true,
    },
    {
      label: 'Name',
      value: 'name',
      checked: true,
    },
    {
      label: 'Model',
      value: 'modelNo',
      checked: true,
    },
    {
      label: 'Type',
      value: 'type',
      checked: true,
    },
    {
      label: 'Category',
      value: 'category',
      checked: true,
    },
    {
      label: 'Brand',
      value: 'brand',
      checked: true,
    },
    {
      label: 'Color',
      value: 'color',
      checked: false,
    },
    {
      label: 'Matter',
      value: 'matter',
      checked: false,
    },
    {
      label: 'Unit',
      value: 'unit',
      checked: true,
    },
    {
      label: 'Has Tag',
      value: 'hasTag',
      checked: false,
    },
    {
      label: 'Location',
      value: 'location',
      checked: true,
    },
    {
      label: 'Department',
      value: 'department',
      checked: true,
    },
    {
      label: 'Last Updated By',
      value: 'updatedBy',
      checked: false,
    },
  ];
  constructor(private dialogRef: MatDialogRef<DownloadReportDialogComponent>) {}

  onClose() {
    this.dialogRef.close();
  }
}
