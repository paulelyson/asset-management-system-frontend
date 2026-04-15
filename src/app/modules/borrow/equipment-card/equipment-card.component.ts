import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent, IButtonConfig } from '../../shared/button/button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEquipment } from '../../../models/Equipment';
import { IconComponent } from '../../shared/icon/icon.component';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import ButtonConfig from '../../../models/ButtonConfig';
import { BorrowService } from '../../../services/borrow.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { EquipmentService } from '../../../services/equipment.service';
import { IN_CIRCULATION_STATUS } from '../../../models/BorrowedEquipment';

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
  @Input() size: CardSize = 'lg';
  @Input() type: CardType = 'primary';
  @Input() shade: CardShade = 'default';
  @Input() title: string = '';
  @Input() descriptions: string[] = [];
  @Input() icon: string = 'calendar_today';
  @Output() addequipment: EventEmitter<IAddedEquipment> = new EventEmitter<IAddedEquipment>();
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  constructor(
    private dialogService: DialogService,
    private borrowService: BorrowService,
    private snackbarService: SnackbarService,
    private equipmentService: EquipmentService,
  ) {}

  onAddEquipment(): void {
    if (this.equipment.totalQuantity > 1) {
      const fields: BorrowedEquipmentStatusFields[] = ['quantity'];
      const actions: ButtonConfig[] = [new ButtonConfig({ name: 'Add' })];
      this.dialogService.openUpdateQuantityStatusDialog(fields, actions).subscribe((resp) => {
        if (resp) {
          let quantity = parseInt(resp.quantity);
          const addedEqmnt: IAddedEquipment = {
            ...this.equipment,
            borrowedQty: quantity
              ? quantity > this.equipment.totalQuantity
                ? this.equipment.totalQuantity
                : quantity
              : 1,
          };
          this.addEquipment(addedEqmnt);
        }
      });
    } else {
      const addedEqmnt: IAddedEquipment = { ...this.equipment, borrowedQty: 1 };
      this.addEquipment(addedEqmnt);
    }
  }

  addEquipment(addedEqmnt: IAddedEquipment) {
    // this.borrowService.isEquipmentRequested(addedEqmnt._id).subscribe({
    //   next: (resp) => this.addequipment.emit(addedEqmnt),
    //   error: (err) =>
    //     this.snackbarService.openSnackbar({ type: 'error', message: [err.message], icon: '' }),
    // });

    this.equipmentService.getStatus(addedEqmnt._id).subscribe({
      next: (resp) => {
        const totalBorrowed = resp.data.reduce((acc, curr) => {
          if (IN_CIRCULATION_STATUS.includes(curr.status)) {
            return acc + curr.quantity;
          }
          return acc;
        }, 0);

        const availableQuantity = addedEqmnt.totalQuantity - totalBorrowed;

        if (availableQuantity > 0) {
          this.addequipment.emit(addedEqmnt);
        }
      },
    });
  }

  onViewEquipmentInfo(): void {
    this.dialogService.openEquipmentDetailDialog(this.equipment);
  }

  get image() {
    const img = this.equipment.images[0]?.thumbnail;
    return img ? img : this.default_img;
  }
}
