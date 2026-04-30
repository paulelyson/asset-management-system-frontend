import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { IEquipment } from '../../../models/Equipment';
import { EquipmentFilter } from '../../../models/filters/equipment-filter.model';
import { AuthService } from '../../../services/auth.service';
import User from '../../../models/User';
import { ButtonComponent } from '../../shared/button/button.component';
import { TitleSectionComponent } from '../../shared/title-section/title-section.component';
import { InventoryToolbarComponent } from '../inventory-toolbar/inventory-toolbar.component';
import { DataRowComponent } from '../../shared/layout/data-row/data-row.component';
import { TabComponent } from '../../shared/layout/tab/tab.component';
import { getFilterDisplay } from '../../shared/utils/filter.util';
import { isObjectId } from '../../../utils/string.util';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  imports: [
    ButtonComponent,
    TitleSectionComponent,
    DataRowComponent,
    InventoryToolbarComponent,
    TabComponent,
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit {
  hasMore: boolean = false;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  user: User;
  filter = signal<EquipmentFilter>(new EquipmentFilter());
  filterDisplay = computed(() => getFilterDisplay(this.filter(), ['department']));
  selectedDept:  WritableSignal<string> = signal('');
  filterEffect = effect(() => {
    const dept = this.filter().department;
    if (dept && isObjectId(dept)) {
      this.departmentService.getDepartmentById(dept).subscribe((resp) => {
        this.filter.update(({ department, ...rest }) => ({ department: resp.data.code, ...rest }));
        this.selectedDept.set(resp.data._id)
      });
    }
  });

  constructor(
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private departmentService: DepartmentService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getEquipment(): void {
    if (this.filter().page == 1) this.equipment.set([]);
    this.equipmentService.getEquipment(this.filter()).subscribe({
      next: (resp) => {
        this.hasMore = resp.hasNextPage;
        this.equipment.update((eqpmnt) => [...eqpmnt, ...resp.data]);
      },
    });
  }

  getRowData(equipment: IEquipment) {
    return this.equipmentService.getRowData(equipment);
  }

  onActionClicked(action: string, equipment: IEquipment) {
    if (action == 'Details') {
      this.dialogService.openEquipmentDetailDialog(equipment);
    } else if (action == 'Update') {
      this.onUpdateEquipment(equipment);
    }
  }

  onUpdateEquipment(equipment: IEquipment) {
    this.dialogService.openUpdateEquipmentDialog(equipment).subscribe((resp: IEquipment | null) => {
      if (resp) {
        this.equipmentService.updateEquipment(resp).subscribe({
          next: (resp) => console.log(resp),
          error: (err) => console.error(err),
        });
      }
    });
  }

  loadMoreEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        page: this.filter().page + 1,
        // limit: event.pageSize,
      },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/inventory'], navigationExtras);
  }

  queryParamsHandling(params: Params): void {
    this.filter.set({
      ...this.filter(),
      page: params['page'] ? parseInt(params['page']) : 1,
      search: params['search'],
      brand: params['brand'],
      categories: params['categories'],
      equipmentType: params['equipmentType'],
      condition: params['condition'],
      department: this.user.roles[0].department._id,
    });
    this.getEquipment();
  }
}
