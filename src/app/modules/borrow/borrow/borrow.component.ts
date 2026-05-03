import { Component, computed, effect, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { EquipmentFilter } from '../../../models/filters/equipment-filter.model';
import { IEquipment } from '../../../models/Equipment';
import {
  AddedEquipmentCardComponent,
  IAddedEquipment,
} from '../added-equipment-card/added-equipment-card.component';
import { FormBuilder } from '@angular/forms';
import BorrowedEquipment, {
  BorrowedEquipmentPayload,
  IBorrowedEquipment,
} from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
import { AuthService, TokenData } from '../../../services/auth.service';
import { Department } from '../../../models/User';
import { SnackbarService } from '../../../services/snackbar.service';
import { SideMenuService } from '../../../services/side-menu.service';
import { IDepartment } from '../../../models/Department';
import { DepartmentService } from '../../../services/department.service';
import { FilterDisplay } from '../../../models/ui/common-config.model';
import { TitleSectionComponent } from '../../shared/title-section/title-section.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ButtonComponent } from '../../shared/button/button.component';
import { EquipmentCardComponent } from '../equipment-card/equipment-card.component';
import { ClassScheduleComponent } from '../class-schedule/class-schedule.component';
import { InventoryToolbarComponent } from '../../inventory/inventory-toolbar/inventory-toolbar.component';
import { BorrowToolbarComponent } from '../borrow-toolbar/borrow-toolbar.component';
import { getFilterDisplay } from '../../shared/utils/filter.util';
import { isObjectId } from '../../../utils/string.util';

@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
  imports: [
    TitleSectionComponent,
    MatSidenavModule,
    ButtonComponent,
    EquipmentCardComponent,
    ClassScheduleComponent,
    AddedEquipmentCardComponent,
    BorrowToolbarComponent
  ],
})
export class BorrowComponent implements OnInit {
  sidenav_opened: boolean = false;
  disable_showmore: boolean = false;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  addedEquipment: IAddedEquipment[] = [];
  resetForm: WritableSignal<boolean> = signal(false);
  user: TokenData;
  departments: WritableSignal<IDepartment[]> = signal([]);


  filter = signal<EquipmentFilter>(new EquipmentFilter());
  filterDisplay = computed(() => getFilterDisplay(this.filter(), ['department']));
  filterEffect = effect(() => {
    const dept = this.filter().department;
    if (dept && isObjectId(dept)) {
      this.departmentService.getDepartmentById(dept).subscribe((resp) => {
        this.filter.update(({ department, ...rest }) => ({ department: resp.data.code, ...rest }));
      });
    }
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
    private borrowService: BorrowService,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    private router: Router,
    private sideMenuService: SideMenuService,
    private departmentService: DepartmentService,
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: (resp) => {
        this.departments.set(resp.data);
      },
    });
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getEquipment(): void {
    if (this.filter().page == 1) {
      this.equipment.set([]);
    }
    this.equipmentService.getEquipment(this.filter()).subscribe({
      next: (resp) => {
        this.disable_showmore = !resp.hasNextPage;
        this.equipment.update((eqpmnt) => [...eqpmnt].concat(resp.data[0]));
      },
    });
  }

  loadMoreEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: this.filter().page + 1 },
      queryParamsHandling: 'merge',
    };
    this.router.navigate(['/borrow'], navigationExtras);
  }

  onAddEquipment(addedEqmnt: IAddedEquipment) {
    const found = this.addedEquipment.some((eqpmnt) => eqpmnt.equipment == addedEqmnt.equipment);
    if (!found) this.addedEquipment.push(addedEqmnt);
  }

  onRemoveEquipment(equipment: IAddedEquipment) {
    this.addedEquipment = this.addedEquipment.filter(
      (eqpmnt) => eqpmnt.equipment !== equipment.equipment,
    );
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
    this.filter.set({
      ...this.filter(),
      page: params['page'] ? parseInt(params['page']) : 1,
      search: params['search'],
      brand: params['brand'],
      categories: params['categories'],
      equipmentType: params['equipmentType'],
      condition: params['condition'],
      department: params['department'] ?? this.user.roles[0].department._id,
    });
    this.getEquipment();
  }
}
