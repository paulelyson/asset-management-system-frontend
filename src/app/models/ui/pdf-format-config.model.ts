interface HeaderConfig {
  title?: string;
  logoUrl?: string;
  college?: string;
  department?: string;
}

export class PDFFormatConfig {
  pageSize: 'A4' | 'Letter' | 'Legal' = 'A4';
  orientation: 'portrait' | 'landscape' = 'landscape';
  columns: string[] = [];
  header?: HeaderConfig; 

  constructor(partial?: Partial<PDFFormatConfig>) {
    Object.assign(this, partial);
  }
}