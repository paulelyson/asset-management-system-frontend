import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BorrowedEquipment, BorrowedEquipmentStatusType } from '../../../models/BorrowedEquipment';
import { BorrowedEquipmentStatusExt, BorrowService } from '../../../services/borrow.service';
import { IEquipment } from '../../../models/Equipment';
import { RowDisplayContent } from '../../shared/row-display/row-display.component';

@Component({
  selector: 'app-borrowed-equipment',
  templateUrl: './borrowed-equipment.component.html',
  styleUrl: './borrowed-equipment.component.css',
  standalone: false,
})
export class BorrowedEquipmentComponent implements OnInit {
  borrowed_equipment: WritableSignal<BorrowedEquipment[]> = signal([]);

  constructor(private activatedRoute: ActivatedRoute, private borrowService: BorrowService) {}

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
    status: BorrowedEquipmentStatusType
  ): void {
    let updated: BorrowedEquipmentStatusExt[] = [
      {
        id: borrowedEquipment._id,
        equipment: borrowedEquipment.equipment._id,
        status: status,
        quantity: 1,
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
      this.updateBorrowedEquipmentStatus(borrowedEquipment, 'pending_return');
    }
  }

  queryParamsHandling(params: Params): void {
    this.getBorrowedEquipment();
  }
}
