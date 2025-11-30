import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Params } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';
import { IEquipment } from '../../../models/Equipment';
import { IAddedEquipment } from '../../shared/added-equipment-card/added-equipment-card.component';



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
    private equipmentService: EquipmentService
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
    this.addedEquipment.push(addedEqmnt);
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.getEquipment();
  }
}
