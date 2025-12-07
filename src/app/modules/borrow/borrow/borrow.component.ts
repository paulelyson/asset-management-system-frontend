import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Params } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';
import { IEquipment } from '../../../models/Equipment';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { FormBuilder } from '@angular/forms';
import { IBorrowedEquipment, IBorrowingDetails } from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';

@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
  standalone: false,
})
export class BorrowComponent implements OnInit {
  sidenav_opened: boolean = true;
  equipmentFilter: IEquipmentFilter = { page: 1 };
  equipment: WritableSignal<IEquipment[]> = signal([]);
  addedEquipment: IAddedEquipment[] = [];

  constructor(
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
    private borrowService: BorrowService
  ) {}
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getEquipment(): void {
    this.equipmentService.getEquipment(this.equipmentFilter).subscribe({
      next: (resp) => {
        this.equipment.update((eqpmnt) => [...eqpmnt].concat(resp));
      },
    });
  }

  onAddEquipment(equipment: IEquipment) {
    const addedEqmnt: IAddedEquipment = { ...equipment, borrowedCount: 1 };
    const found = this.addedEquipment.some((eqpmnt) => eqpmnt._id == equipment._id);
    if (!found) this.addedEquipment.push(addedEqmnt);
  }

  onRemoveEquipment(equipment: IAddedEquipment) {
    this.addedEquipment = this.addedEquipment.filter((eqpmnt) => eqpmnt._id !== equipment._id);
  }

  onSubmitRequest(event: IBorrowingDetails): void {
    const borrowedEquipment: IBorrowedEquipment[] = this.addedEquipment.map((eqpmnt) => ({
      equipment: eqpmnt._id,
      quantity: eqpmnt.borrowedCount,
      borrowedEquipmentStatus: [],
      remarks: '',
    }));

    let body: IBorrowingDetails = { ...event, borrowedEquipment: borrowedEquipment };
    this.borrowService.createBorrowedEquipment(body).subscribe({
      next: (resp) => console.log(resp),
      error: (err) => console.error(err),
    });
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.getEquipment();
  }
}
