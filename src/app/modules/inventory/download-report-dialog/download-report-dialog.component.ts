import { Component } from '@angular/core';
import { ToggleButtonGroupComponent } from '../../shared/toggle-button-group/toggle-button-group.component';
import { MatDividerModule } from '@angular/material/divider';
import { Button, Icon, Toggle } from '@paulelyson/elyui';
import { MatDialogRef } from '@angular/material/dialog';
import { PDFFormatConfig } from '../../../models/ui/pdf-format-config.model';

@Component({
  selector: 'app-download-report-dialog',
  imports: [
    MatDividerModule,
    Icon,
    Toggle,
    Button,
  ],
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
      value: 'categories',
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
      label: 'Condition and Quantity',
      value: 'conditionAndQuantity',
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
    }
  ];

  constructor(private dialogRef: MatDialogRef<DownloadReportDialogComponent>) {}

  onDownloadPDF() {
    const pdfConfg = new PDFFormatConfig({
      columns: this.equipmentFields.filter((x) => x.checked).map((x) => x.value),
    });
    this.dialogRef.close(pdfConfg);
  }
  onClose() {
    this.dialogRef.close();
  }

  onToggleAll(event: boolean) {
    this.equipmentFields.forEach((field) => (field.checked = event));
  }

  onToggleField(event: boolean, fieldValue: string) {
    const field = this.equipmentFields.find((f) => f.value === fieldValue);
    if (field) {
      field.checked = event;
    }
  }
}
