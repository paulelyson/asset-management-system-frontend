import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { IEquipmentFilter } from '../../../models/EquipmentFilter';
import { IEquipment } from '../../../models/Equipment';
import { IAddedEquipment } from '../added-equipment-card/added-equipment-card.component';
import { FormBuilder } from '@angular/forms';
import { IBorrowedEquipment, IBorrowingDetails } from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
import { AuthService, TokenData } from '../../../services/auth.service';
import { Department } from '../../../models/User';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrl: './borrow.component.css',
  standalone: false,
})
export class BorrowComponent implements OnInit {
  sidenav_opened: boolean = false;
  disable_showmore: boolean = false;
  equipmentFilter: IEquipmentFilter;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  addedEquipment: IAddedEquipment[] = [];
  resetForm: WritableSignal<boolean> = signal(false);
  user: TokenData;

  constructor(
    private activatedRoute: ActivatedRoute,
    private equipmentService: EquipmentService,
    private borrowService: BorrowService,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
    this.equipmentFilter = { page: 1, department: 'computer_engineering' };
  }

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

  loadMoreEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: this.equipmentFilter.page + 1 },
      queryParamsHandling: 'merge',
    };
    this.router.navigate(['/borrow'], navigationExtras);
  }

  onAddEquipment(addedEqmnt: IAddedEquipment) {
    const found = this.addedEquipment.some((eqpmnt) => eqpmnt._id == addedEqmnt._id);
    if (!found) this.addedEquipment.push(addedEqmnt);
  }

  onRemoveEquipment(equipment: IAddedEquipment) {
    this.addedEquipment = this.addedEquipment.filter((eqpmnt) => eqpmnt._id !== equipment._id);
  }

  onSubmitRequest(event: IBorrowingDetails): void {
    const borrowedEquipment: IBorrowedEquipment[] = this.addedEquipment.map((eqpmnt) => ({
      equipment: eqpmnt._id,
      quantity: eqpmnt.borrowedQty,
      borrowedEquipmentStatus: [],
      remarks: '',
    }));

    let body: IBorrowingDetails = { ...event, borrowedEquipment: borrowedEquipment };
    this.borrowService.createBorrowedEquipment(body).subscribe({
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

  onToggleSideNav(event: boolean) {
    this.sidenav_opened = event;
  }

  queryParamsHandling(params: Params): void {
    this.equipmentFilter.page = params['page'] ? parseInt(params['page']) : 1;
    this.equipmentFilter.search = params['search'] ? params['search'] : '';
    this.equipmentFilter.department = params['department'] ?? this.equipmentFilter.department;
    this.getEquipment();
  }
}
