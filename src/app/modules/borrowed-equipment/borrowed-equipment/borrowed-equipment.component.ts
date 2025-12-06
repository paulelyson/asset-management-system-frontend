import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BorrowedEquipment } from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
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

  borrowedEquipmentContents(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    return this.borrowService.getRowDisplayContent();
  }

  borrowedEquipmentActions() {
    return this.borrowService.getRowDisplayActions();
  }

  openDialog() {}

  queryParamsHandling(params: Params): void {
    this.getBorrowedEquipment();
  }
}
