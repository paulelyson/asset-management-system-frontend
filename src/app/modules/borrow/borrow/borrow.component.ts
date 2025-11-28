import { Component } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
  standalone: false
})
export class BorrowComponent {
  constructor(private dialogService: DialogService) {}
  sidenav_opened: boolean = true;

  openDialog() {
    console.log('dancing queen');
    // this.dialogService.openDialog('equipment-detail');
  }
}
