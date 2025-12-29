import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BorrowedEquipment, BorrowedEquipmentStatusType } from '../../../models/BorrowedEquipment';
import { BorrowedEquipmentStatusExt, BorrowService } from '../../../services/borrow.service';
import { RowDisplayContent } from '../../shared/row-display/row-display.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { IButtonConfig } from '../../shared/button/button.component';

@Component({
  selector: 'app-borrowed-equipment',
  templateUrl: './borrowed-equipment.component.html',
  styleUrl: './borrowed-equipment.component.css',
  standalone: false,
})
export class BorrowedEquipmentComponent implements OnInit {
  borrowed_equipment: WritableSignal<BorrowedEquipment[]> = signal([]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private borrowService: BorrowService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getBorrowedEquipment(): void {
    this.borrowService.getBorrowedEquipment().subscribe({
      next: (resp) => {
        this.borrowed_equipment.update((eqpmnt) => [...eqpmnt].concat(resp));
        console.log(resp);
      },
    });
  }

  updateBorrowedEquipmentStatus(
    borrowedEquipment: BorrowedEquipment,
    status: BorrowedEquipmentStatusType,
    quantity: number
  ): void {
    let updated: BorrowedEquipmentStatusExt[] = [
      {
        id: borrowedEquipment._id,
        equipment: borrowedEquipment.equipment._id,
        status: status,
        quantity: quantity,
        condition: 'functional',
        remarks: '',
      },
    ];
    this.borrowService.updateBorrowedEquipmentStatus(updated).subscribe({
      next: (resp) => console.log(resp),
      error: (err) => console.error(err),
    });
  }

  borrowedEquipmentContents(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    return this.borrowService.getRowDisplayContent(borrowedEquipment);
  }

  borrowedEquipmentActions() {
    return this.borrowService.getRowDisplayActions();
  }

  onActionClicked(action: string, borrowedEquipment: BorrowedEquipment) {
    if (action == 'lock_open') {
    } else if (action == 'edit') {
      const fields: BorrowedEquipmentStatusFields[] = ['quantity', 'status'];
      const actions: IButtonConfig[] = [
        {
          id: 0,
          name: 'Update',
          size: 'sm',
          type: 'default',
          shade: 'default',
          width: 'width-filled',
          btnType: 'button',
        },
      ];
      this.dialogService.openUpdateQuantityStatusDialog(fields, actions).subscribe((resp) => {
        this.updateBorrowedEquipmentStatus(borrowedEquipment, resp.status, resp.quantity);
      });
    }
  }

  queryParamsHandling(params: Params): void {
    this.getBorrowedEquipment();
  }
}
