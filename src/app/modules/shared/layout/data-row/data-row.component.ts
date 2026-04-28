import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RowColumnConfig } from '../../../../models/ui/data-row.model';
import { MatDividerModule } from '@angular/material/divider';
import { BadgeComponent } from '../../badge/badge.component';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-data-row',
  imports: [BadgeComponent, ButtonComponent, MatDividerModule],
  templateUrl: './data-row.component.html',
  styleUrl: './data-row.component.css',
})
export class DataRowComponent {
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  @Input() columns: RowColumnConfig[] = [];
  @Input() showHeader: boolean = false;
  @Output() actionclicked = new EventEmitter<string>();

  get gridTemplateColumns(): string {
    return this.columns.map((c) => `${c.weight ?? 1}fr`).join(' ');
  }

  asArray(content: string | string[] | undefined): string[] {
    if (!content) return [];
    return Array.isArray(content) ? content : [content];
  }

  onActionClicked(name: string): void {
    this.actionclicked.emit(name);
  }
}
