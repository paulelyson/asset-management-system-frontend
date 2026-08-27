import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Button } from '@paulelyson/elyui';
import { MatDividerModule } from '@angular/material/divider';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-menu',
  imports: [Button, MatDividerModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  constructor(private dialogService: DialogService) {}

  @Input() show: boolean = false;
  @Input() title: string = '';
  @Input() subtitles: string[] = [];
  @Output() onActionClicked: EventEmitter<string> = new EventEmitter<string>();
  logout() {
    this.onActionClicked.emit('logout');
  }

  onChangePassword() {
    this.dialogService.openChangePasswordDialog()
  }
}
