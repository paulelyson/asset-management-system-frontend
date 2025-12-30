import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { IEquipment } from '../../../models/Equipment';
import { RowDisplayContent } from '../../shared/row-display/row-display.component';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  standalone: false,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit {
  sidenav_opened: boolean = true;
  equipmentFilter: IEquipmentFilter = { page: 1 };
  equipment: WritableSignal<IEquipment[]> = signal([]);
  test: string[] = [];
  constructor(
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  get filterValues(): Record<string, string>[] {
    const notIncludeFields = ['page'];
    return Object.entries(this.equipmentFilter)
      .map(([key, val]) => ({ field: key, value: val }))
      .filter((x) => x.value && !notIncludeFields.includes(x.field));
  }

  getEquipment(): void {
    if (this.equipmentFilter.page == 1) {
      this.equipment.set([]);
    }
    this.equipmentService.getEquipment(this.equipmentFilter).subscribe({
      next: (resp) => {
        this.equipment.update((eqpmnt) => [...eqpmnt].concat(resp));
      },
    });
  }

  equipmentContents(equipment: IEquipment): RowDisplayContent[] {
    const fields = ['equipmentType', 'inventorytype', 'conditionAndQuantity', 'location'];
    let contents: RowDisplayContent[] = [];
    contents.push(
      {
        id: 1,
        type: 'text',
        content: [equipment.equipmentType],
      },
      {
        id: 2,
        type: 'text',
        content: [equipment.inventorytype],
      },
      {
        id: 3,
        type: 'badge',
        content: equipment.conditionAndQuantity.map((x) => x.quantity + ' ' + x.condition),
      },
      {
        id: 4,
        type: 'text',
        content: [equipment.location],
      }
    );
    return contents;
  }

  openDialog(action: string, equipment: IEquipment) {
    if (action == 'edit') {
      this.dialogService.openCreateEquipmentDialog();
    } else {
      this.dialogService.openDialog('equipment-detail', equipment);
    }
  }

  loadMoreEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        page: this.equipmentFilter.page + 1,
        // limit: event.pageSize,
      },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/inventory'], navigationExtras);
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.equipmentFilter.search = params['search'];
    this.equipmentFilter.brand = params['brand'];
    this.equipmentFilter.categories = params['categories'];
    this.equipmentFilter.equipmentType = params['equipmentType'];
    console.log(this.equipmentFilter);

    this.test = Object.keys(this.equipmentFilter);
    this.getEquipment();
  }
}
