import { ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute, Params } from '@angular/router';
import { IEquipment } from '../../../models/Equipment';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  standalone: false,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit {
  sidenav_opened: boolean = true;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  constructor(
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getEquipment(): void {
    this.equipmentService.getEquipment().subscribe({
      next: (resp) => {
        this.equipment.set(resp);
        console.log('ressspp', this.equipment());
      },
    });
  }

  openDialog() {
    this.dialogService.openDialog('equipment-detail');
  }

  queryParamsHandling(params: Params): void {
    this.getEquipment()
  }
}
