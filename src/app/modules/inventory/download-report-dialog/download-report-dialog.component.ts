import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import {
  Button,
  Icon,
  SegmentedControl,
  SegmentedControlOption,
  Toggle,
} from '@paulelyson/elyui';
import { MatDialogRef } from '@angular/material/dialog';
import { PDFFormatConfig } from '../../../models/ui/pdf-format-config.model';

@Component({
  selector: 'app-download-report-dialog',
  imports: [
    MatDividerModule,
    Icon,
    Toggle,
    SegmentedControl,
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

  /**
   * Page setup. `PDFFormatConfig`'s own declared defaults are the source of truth for
   * the initial selection — reading them off an instance rather than repeating 'LEGAL'
   * and 'landscape' here means the dialog cannot drift from the model.
   *
   * Both values already travel all the way to the API (`EquipmentService.downloadReport`
   * maps them to `paperSize` / `orientation`); until now nothing set them, so every
   * report came out LEGAL/landscape.
   */
  private readonly formatDefaults = new PDFFormatConfig();

  pageSize: PDFFormatConfig['pageSize'] = this.formatDefaults.pageSize;
  orientation: PDFFormatConfig['orientation'] = this.formatDefaults.orientation;

  paperSizes: SegmentedControlOption[] = [
    { value: 'A4', label: 'A4' },
    { value: 'LETTER', label: 'Letter' },
    { value: 'LEGAL', label: 'Legal' },
  ];

  orientations: SegmentedControlOption[] = [
    { value: 'portrait', label: 'Portrait', icon: 'crop_portrait' },
    { value: 'landscape', label: 'Landscape', icon: 'crop_landscape' },
  ];

  constructor(private dialogRef: MatDialogRef<DownloadReportDialogComponent>) {}

  onDownloadPDF() {
    const pdfConfg = new PDFFormatConfig({
      pageSize: this.pageSize,
      orientation: this.orientation,
      columns: this.equipmentFields.filter((x) => x.checked).map((x) => x.value),
    });
    this.dialogRef.close(pdfConfg);
  }
  onClose() {
    this.dialogRef.close();
  }

  /**
   * `valueChange` is typed `string | string[]` because the control also supports
   * multi-select. Both of these are single-select, so the array case cannot occur.
   */
  onPageSizeChange(value: string | string[]): void {
    this.pageSize = value as PDFFormatConfig['pageSize'];
  }

  onOrientationChange(value: string | string[]): void {
    this.orientation = value as PDFFormatConfig['orientation'];
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
