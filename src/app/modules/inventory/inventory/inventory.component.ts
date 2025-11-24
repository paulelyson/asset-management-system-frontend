import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  standalone: false,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  constructor(private dialogService: DialogService) {}
  sidenav_opened: boolean = true;

  openDialog() {
    console.log('dancing queen')
    this.dialogService.openDialog('equipment-detail');
  }
}
