import { ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute, Params } from '@angular/router';
import { IEquipment } from '../../../models/Equipment';
import { RowDisplayContent } from '../../shared/row-display/row-display.component';

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
  contents: RowDisplayContent[] = [
    {
      type: 'text',
      content: 'allen keys/wrenches',
    },
    {
      type: 'text',
      content: 'Inventory',
    },
    {
      type: 'badge',
      content: '1 Functional',
    },
    {
      type: 'badge',
      content: '1 Functional',
    },
  ];
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
    this.getEquipment();
  }
}
