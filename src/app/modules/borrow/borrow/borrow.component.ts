import { Component } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-borrow',
  imports: [],
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
})
export class BorrowComponent {
  constructor(private dialogService: DialogService) {}
  sidenav_opened: boolean = true;

  openDialog() {
    console.log('dancing queen');
    this.dialogService.openDialog();
  }
}
