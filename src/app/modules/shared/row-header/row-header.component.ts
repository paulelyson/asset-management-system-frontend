import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface IRowHeader {
  id: number; // fix track by identity warning
  type: 'badge' | 'text';
  text: string;
  span: 'wide' | 'mid' | 'narrow';
}

@Component({
  selector: 'app-row-header',
  imports: [CommonModule],
  templateUrl: './row-header.component.html',
  styleUrl: './row-header.component.css',
})
export class RowHeaderComponent {
  @Input() headers: IRowHeader[] = [
    {
      id: 0,
      type: 'text',
      text: 'Equipment',
      span: 'wide',
    },
    {
      id: 1,
      type: 'text',
      text: 'Class',
      span: 'mid',
    },
    {
      id: 2,
      type: 'text',
      text: 'Borrower',
      span: 'mid',
    },
     {
      id: 2,
      type: 'text',
      text: 'Total # Requested',
      span: 'narrow',
    },
    {
      id: 3,
      type: 'text',
      text: 'Status',
      span: 'mid',
    },
    {
      id: 4,
      type: 'text',
      text: 'Date Requested',
      span: 'narrow',
    },
     {
      id: 5,
      type: 'text',
      text: 'Action',
      span: 'narrow',
    },
  ];
}
