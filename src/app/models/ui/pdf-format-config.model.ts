export class PDFFormatConfig {
  pageSize: 'A4' | 'Letter' | 'Legal' = 'A4';
  orientation: 'portrait' | 'landscape' = 'landscape';
  columns: string[] = [];

  constructor(partial?: Partial<PDFFormatConfig>) {
    Object.assign(this, partial);
  }
}