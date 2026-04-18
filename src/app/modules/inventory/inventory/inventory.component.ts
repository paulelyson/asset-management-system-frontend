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
import { EquipmentFilter, IEquipmentFilter } from '../../../models/EquipmentFilter';
import { AuthService } from '../../../services/auth.service';
import User from '../../../models/User';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  standalone: false,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit {
  sidenav_opened: boolean = true;
  equipmentFilter: EquipmentFilter;
  disable_showmore: boolean = false;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  user: User;
  filterDisplay: Record<string, string>[] = [];
  constructor( 
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private filterService: FilterService,
  ) {
    this.user = this.authService.getUser();
    this.equipmentFilter = new EquipmentFilter({ department: this.user.roles[0].department._id });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
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
        this.disable_showmore = !resp.hasNextPage;
        this.equipment.update((eqpmnt) =>
          [...eqpmnt]
            .concat(resp.data as IEquipment[])
            .filter((item, index, arr) => index === arr.findIndex((x) => x._id === item._id)),
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
        page: this.equipmentFilter.page + 1,
        // limit: event.pageSize,
      },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/inventory'], navigationExtras);
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.equipmentFilter.search = params['search'] ?? '';
    this.equipmentFilter.brand = params['brand'];
    this.equipmentFilter.categories = params['categories'];
    this.equipmentFilter.equipmentType = params['equipmentType'];
    // this.filterDisplay = this.filterService.getFilterDisplay(this.equipmentFilter, ['page'], this.user);
    this.getEquipment();
  }
}
