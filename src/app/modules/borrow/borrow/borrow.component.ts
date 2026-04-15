import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { EquipmentFilter, IEquipmentFilter } from '../../../models/EquipmentFilter';
import { IEquipment } from '../../../models/Equipment';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { FormBuilder } from '@angular/forms';
import BorrowedEquipment, {
  BorrowedEquipmentPayload,
  IBorrowedEquipment,
} from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
import { AuthService, TokenData } from '../../../services/auth.service';
import { Department } from '../../../models/User';
import { SnackbarService } from '../../../services/snackbar.service';
import { FilterService } from '../../../services/filter.service';
import { SideMenuService } from '../../../services/side-menu.service';

@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
  standalone: false,
})
export class BorrowComponent implements OnInit {
  sidenav_opened: boolean = false;
  disable_showmore: boolean = false;
  equipmentFilter: EquipmentFilter;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  addedEquipment: IAddedEquipment[] = [];
  resetForm: WritableSignal<boolean> = signal(false);
  user: TokenData;
  filterDisplay: Record<string, any>[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
    private borrowService: BorrowService,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    private router: Router,
    private filterService: FilterService,
    private sideMenuService: SideMenuService,
  ) {
    this.user = this.authService.getUser();
    this.equipmentFilter = new EquipmentFilter({
      department: this.user.roles[0].department._id,
      borrow: true,
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getEquipment(): void {
    if (this.equipmentFilter.page == 1) {
      this.equipment.set([]);
    }
    this.equipmentService.getEquipment(this.equipmentFilter).subscribe({
      next: (resp) => {
        this.disable_showmore = !resp.hasNextPage;
        this.equipment.update((eqpmnt) => [...eqpmnt].concat(resp.data));
      },
    });
  }

  loadMoreEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: this.equipmentFilter.page + 1 },
      queryParamsHandling: 'merge',
    };
    this.router.navigate(['/borrow'], navigationExtras);
  }

  onAddEquipment(addedEqmnt: IAddedEquipment) {
    const found = this.addedEquipment.some((eqpmnt) => eqpmnt.equipment == addedEqmnt.equipment);
    if (!found) this.addedEquipment.push(addedEqmnt);
  }

  onRemoveEquipment(equipment: IAddedEquipment) {
    this.addedEquipment = this.addedEquipment.filter((eqpmnt) => eqpmnt.equipment !== equipment.equipment);
  }

  onSubmitRequest(event: BorrowedEquipmentPayload): void {

    event.borrowedEquipment = this.addedEquipment.map((eqpmnt) => ({
      equipment: eqpmnt.equipment._id,
      quantity: eqpmnt.quantity,
      transactions: eqpmnt.transactions,
    }));


    console.log('payload', event);

    this.borrowService.createBorrowedEquipment(event).subscribe({
      next: (resp) => {
        this.snackBarService.openSnackbar({
          type: 'success',
          message: [resp.message],
          icon: '',
        });
        this.addedEquipment = [];
        this.resetForm.set(true);
      },
      error: (err) =>
        this.snackBarService.openSnackbar({
          type: 'error',
          message: [err.message],
          icon: '',
        }),
    });
  }

  onToggleBorrowForm(event: boolean): void {
    this.sidenav_opened = !this.sidenav_opened;
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.equipmentFilter.search = params['search'] ?? '';
    this.equipmentFilter.brand = params['brand'];
    this.equipmentFilter.categories = params['categories'];
    this.equipmentFilter.equipmentType = params['equipmentType'];
    this.equipmentFilter.department = params['department'] ?? this.equipmentFilter.department;
    this.equipmentFilter.borrow = Boolean(params['borrow']) ?? true;
    this.filterDisplay = this.filterService.getFilterDisplay(
      this.equipmentFilter,
      ['page'],
      this.user,
    );
    this.getEquipment();
  }
}
