import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Badge, Button, SnackbarService } from '@paulelyson/elyui';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEquipment } from '../../../models/Equipment';
import { IconComponent } from '../../shared/icon/icon.component';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { BorrowService } from '../../../services/borrow.service';
import { EquipmentService } from '../../../services/equipment.service';
import {
  BorrowedEquipmentStatusType,
  BorrowedEquipmentStatusTypeAndQuantity,
  IN_CIRCULATION_STATUS,
} from '../../../models/BorrowedEquipment';
import { ButtonConfig } from '../../../models/ui/button-config.model';

type CardSize = 'sm' | 'md' | 'lg';
type CardType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type CardShade = 'default' | 'light';

@Component({
  selector: 'app-equipment-card',
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.css',
  imports:[Button, IconComponent, Badge, CommonModule]
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
    if (this.totalAvailable <= 0) {
      this.snackbarService.openSnackbar({
        type: 'error',
        message: ['This equipment is currently unavailable.'],
        icon: '',
      });
      return;
    }

    if (this.totalAvailable > 1) {
      const fields: BorrowedEquipmentStatusFields[] = ['quantity'];
      const actions: ButtonConfig[] = [new ButtonConfig({ name: 'Add' })];
      this.dialogService.openUpdateQuantityStatusDialog(fields, actions, ['requested'], this.equipment).subscribe((resp) => {
        if (resp) {
          let quantity = Math.min(
            Math.max(parseInt(resp.quantity, 10) || 1, 1),
            this.totalAvailable,
          );
          const addedEqmnt: IAddedEquipment = {
            equipment: this.equipment,
            quantity: quantity,
            transactions: [
              {
                remarks: resp.remarks,
                quantity: quantity,
                condition: 'functional',
                status: 'requested',
              },
            ],
          };
          this.addEquipment(addedEqmnt);

          this.snackbarService.openSnackbar({
            type: 'success',
            message: ['Equipment added to the list.'],
            icon: '',
          });
        }
      });
    } else {
      const addedEqmnt: IAddedEquipment = {
        equipment: this.equipment,
        quantity: 1,
        transactions: [
          {
            quantity: 1,
            condition: 'functional',
            status: 'requested',
          },
        ],
      };
      this.addEquipment(addedEqmnt);

      this.snackbarService.openSnackbar({
        type: 'success',
        message: ['Equipment added to the list.'],
        icon: '',
      });
    }
  }

  addEquipment(equipment: IAddedEquipment) {
    this.equipmentService.getStatus(equipment.equipment._id).subscribe({
      next: (resp) => {
        const totalBorrowed = this.getTotalBorrowed(resp.data);
        const availableQuantity = this.equipment.totalQuantity - totalBorrowed;
        if (availableQuantity > 0) {
          this.addequipment.emit(equipment);
        } else {
          this.snackbarService.openSnackbar({
            type: 'error',
            message: [
              'This equipment is already unavailable. Refesh the page to get the updated availability.',
            ],
            icon: '',
          });
        }
      },
    });
  }

  onViewEquipmentInfo(): void {
    this.dialogService.openEquipmentDetailDialog(this.equipment);
  }

  getTotalBorrowed(data: BorrowedEquipmentStatusTypeAndQuantity[]) {
    return data.reduce((acc, curr) => {
      if (IN_CIRCULATION_STATUS.includes(curr.status)) {
        return acc + curr.quantity;
      }
      return acc;
    }, 0);
  }

  get image() {
    const img = this.equipment.images[0]?.thumbnail;
    return img ? img : this.default_img;
  }

  get totalAvailable() {
    const totalQuantity = this.equipment.totalQuantity;
    const totalBorrowed = this.getTotalBorrowed(this.equipment.accumulatedStatus);
    return totalQuantity - totalBorrowed;
  }

  get availability() {
    return this.totalAvailable > 0 ? this.totalAvailable + ' Available' : 'Unavailable';
  }
}
