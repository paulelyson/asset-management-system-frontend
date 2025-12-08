import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent, IButtonConfig } from '../../shared/button/button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEquipment } from '../../../models/Equipment';
import { IconComponent } from '../../shared/icon/icon.component';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';

type CardSize = 'sm' | 'md' | 'lg';
type CardType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type CardShade = 'default' | 'light';

@Component({
  selector: 'app-equipment-card',
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.css',
  standalone: false,
})
export class EquipmentCardComponent {
  @Input() equipment!: IEquipment;
  @Input() size: CardSize = 'md';
  @Input() type: CardType = 'primary';
  @Input() shade: CardShade = 'default';
  @Input() title: string = '';
  @Input() descriptions: string[] = [];
  @Input() icon: string = 'calendar_today';
  @Output() addequipment: EventEmitter<IAddedEquipment> = new EventEmitter<IAddedEquipment>();
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  constructor(private dialogService: DialogService) {}
  onAddEquipment(): void {
    if (this.equipment.totalQuantity > 1) {
      const fields: BorrowedEquipmentStatusFields[] = ['quantity'];
      const actions: IButtonConfig[] = [
        {
          id: 0,
          name: 'Update and Add',
          size: 'sm',
          type: 'default',
          shade: 'default',
          width: 'width-filled',
          btnType: 'submit',
        },
      ];
      this.dialogService.openUpdateQuantityStatusDialog(fields, actions);
    }
    const addedEqmnt: IAddedEquipment = { ...this.equipment, borrowedQty: 4 };
    this.addequipment.emit(addedEqmnt);
  }

  get image() {
    const img = this.equipment.images[0]?.thumbnail;
    return img ? img : this.default_img;
  }
}
