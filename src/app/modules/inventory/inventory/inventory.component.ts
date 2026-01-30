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
  equipmentFilter: IEquipmentFilter;
  disable_showmore: boolean = false;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  constructor(
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.equipmentFilter = { page: 1, department: 'computer_engineering' };
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  get filterValues(): Record<string, string>[] {
    const notIncludeFields = ['page'];
    return Object.entries(this.equipmentFilter)
      .map(([key, val]) => ({ field: key, value: val }))
      .filter((x) => x.value && !notIncludeFields.includes(x.field));
  }

  get rowDisplayActions() {
    return this.equipmentService.getRowDisplayActions();
  }

  getEquipment(): void {
    if (this.equipmentFilter.page == 1) {
      this.equipment.set([]);
    }
    this.equipmentService.getEquipment(this.equipmentFilter).subscribe({
      next: (resp) => {
        this.disable_showmore = resp.length < 15;
        this.equipment.update((eqpmnt) =>
          [...eqpmnt]
            .concat(resp)
            .filter((item, index, arr) => index === arr.findIndex((x) => x._id === item._id))
        );
      },
    });
  }

  equipmentContents(equipment: IEquipment): RowDisplayContent[] {
    return this.equipmentService.getRowDisplayContent(equipment);
  }

  onActionClicked(action: string, equipment: IEquipment) {
    if (action == 'Details') {
      this.dialogService.openEquipmentDetailDialog(equipment);
    } else if (action == 'edit') {
      // TO DO
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
    this.getEquipment();
  }
}
