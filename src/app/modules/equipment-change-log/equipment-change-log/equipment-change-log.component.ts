import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { TitleSectionComponent } from '../../shared/title-section/title-section.component';
import { TabComponent } from '../../shared/layout/tab/tab.component';
import { InventoryToolbarComponent } from '../../inventory/inventory-toolbar/inventory-toolbar.component';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute, Params } from '@angular/router';
import { EquipmentChangeLog } from '../../../models/data/equipment-change-logs.model';
import { DataRowComponent } from '../../shared/layout/data-row/data-row.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-equipment-change-log',
  imports: [
    TitleSectionComponent,
    TabComponent,
    InventoryToolbarComponent,
    DataRowComponent,
  ],
  templateUrl: './equipment-change-log.component.html',
  styleUrl: './equipment-change-log.component.css',
})
export class EquipmentChangeLogComponent implements OnInit {
  changeLogs: WritableSignal<EquipmentChangeLog[]> = signal([]);
  constructor(
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
  ) {}
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getRowData(log: EquipmentChangeLog) {
    return this.equipmentService.getChangeLogRowData(log);
  }

  getChangeLogs() {
    this.equipmentService.getChangeLogs().subscribe({
      next: (resp) => {
        this.changeLogs.update((logs) => [...logs, ...resp.data]);
      },
    });
  }

  onActionClicked(event: string, log: EquipmentChangeLog) {}

  queryParamsHandling(params: Params): void {
    this.getChangeLogs()
  }
}
