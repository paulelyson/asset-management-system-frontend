import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { BorrowedEquipment, BorrowedEquipmentStatusType } from '../../../models/BorrowedEquipment';
import { BorrowedEquipmentStatusExt, BorrowService } from '../../../services/borrow.service';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../../shared/row-display/row-display.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { AuthService, TokenData } from '../../../services/auth.service';
import { IBorrowedEquimentFilter } from '../../../models/BorrowedEquipmentFilter';
import ButtonConfig from '../../../models/ButtonConfig';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-borrowed-equipment',
  templateUrl: './borrowed-equipment.component.html',
  styleUrl: './borrowed-equipment.component.css',
  standalone: false,
})
export class BorrowedEquipmentComponent implements OnInit {
  borrowed_equipment: WritableSignal<BorrowedEquipment[]> = signal([]);
  disable_showmore: boolean = false;
  user: TokenData;
  filter: IBorrowedEquimentFilter = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private borrowService: BorrowService,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackbarService,
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  get filterValues(): Record<string, string>[] {
    const notIncludeFields = ['page'];
    return Object.entries(this.filter)
      .map(([key, val]) => ({ field: key, value: val }))
      .filter((x) => x.value && !notIncludeFields.includes(x.field));
  }

  getBorrowedEquipment(): void {
    if (this.filter.page == 1) {
      this.borrowed_equipment.set([]);
    }
    this.borrowService.getBorrowedEquipment(this.filter).subscribe({
      next: (resp) => {
        if (resp.length < 1) {
          this.filter.page = (this.filter.page as number) - 1;
        }
        this.disable_showmore = resp.length < 15;
        this.borrowed_equipment.update((eqpmnt) =>
          [...eqpmnt]
            .concat(resp)
            .filter(
              (item, index, arr) =>
                index ===
                arr.findIndex((x) => x._id === item._id && x.equipment === item.equipment),
            ),
        );
      },
    });
  }

  updateBorrowedEquipmentStatus(
    borrowedEquipment: BorrowedEquipment,
    status: BorrowedEquipmentStatusType,
    quantity: number,
  ): void {
    let updated: BorrowedEquipmentStatusExt[] = [
      {
        id: borrowedEquipment._id,
        equipment: borrowedEquipment.equipment._id,
        status: status,
        quantity: quantity,
        condition: 'functional',
        remarks: '',
      },
    ];
    this.borrowService.updateBorrowedEquipmentStatus(updated).subscribe({
      next: (resp) => {
        this.snackBarService.openSnackbar({ icon: 'info', type: 'success', message: [resp.message] }),
        this.getBorrowedEquipment();
      },
      error: (err) =>
        this.snackBarService.openSnackbar({ icon: 'info', type: 'error', message: [err] }),
    });
  }

  getBorrowedEquipmentContents(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    return this.borrowService.getRowDisplayContent(borrowedEquipment);
  }

  getBorrowedEquipmentActions(borrowedEquipment: BorrowedEquipment): RowDisplayActionConfig[] {
    return this.borrowService.getRowDisplayActions(
      this.user,
      borrowedEquipment,
      this.filter.info_and_history,
    );
  }

  onActionClicked(action: string, borrowedEquipment: BorrowedEquipment) {
    if (action == 'Approve') {
      this.onApproveByFaculty(borrowedEquipment);
    }
    // } else if (action == 'lock_open' && borrowedEquipment.quantity == 1) {
    //   this.updateBorrowedEquipmentStatus(borrowedEquipment, 'released', borrowedEquipment.quantity);
    // } else if (action == 'lock_open' && borrowedEquipment.quantity > 1) {
    //   const actions: ButtonConfig[] = [new ButtonConfig({ name: 'Release' })];
    //   this.dialogService.openUpdateQuantityStatusDialog(fields, actions).subscribe((resp) => {
    //     this.updateBorrowedEquipmentStatus(borrowedEquipment, resp.status, resp.quantity);
    //   });
    // } else if (action == 'keyboard_return' && borrowedEquipment.quantity == 1) {
    //   const status = 'mark_returned';
    //   this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    // } else if (action == 'keyboard_return' && borrowedEquipment.quantity > 1) {
    //   const actions: ButtonConfig[] = [new ButtonConfig({ name: 'Return' })];
    //   this.dialogService.openUpdateQuantityStatusDialog(fields, actions).subscribe((resp) => {
    //     this.updateBorrowedEquipmentStatus(borrowedEquipment, resp.status, resp.quantity);
    //   });
    // }
    // cancelled
    else if (action == 'Cancel Request' && borrowedEquipment.quantity == 1) {
      const status = 'cancelled';
      this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    } else if (action == 'Cancel Request' && borrowedEquipment.quantity > 1) {
      // TODO
      const status = 'cancelled';
      this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    }
    // view info
    else if (action == 'View Detail') {
      this.dialogService.openBorrowedEquipmentDetailDialog(borrowedEquipment);
    }
    // view
    else if (action == 'Progress Logs') {
      const borrowId = borrowedEquipment._id;
      const equipment = borrowedEquipment.equipment._id;
      // this.dialogService.openBorrowedEquipmentHistoryDialog();
      this.onDisplayProgressLogs(borrowId, equipment);
    }
  }

  onApproveByFaculty(borrowedEquipment: BorrowedEquipment) {
    const status = 'faculty_approved';
    const fields: BorrowedEquipmentStatusFields[] = ['quantity', 'status'];
    const actions: ButtonConfig[] = [new ButtonConfig({ name: 'Approve' })];
    if (borrowedEquipment.quantity == 1) {
      this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    } else {
      this.dialogService
        .openUpdateQuantityStatusDialog(fields, actions, [status])
        .subscribe((resp) => {
          if (resp) {
            this.updateBorrowedEquipmentStatus(borrowedEquipment, resp.status, resp.quantity);
          }
        });
    }
  }

  onDisplayProgressLogs(borrowId: string, equipment: string): void {
    this.borrowService.getProgressLogs(borrowId, equipment).subscribe({
      next: (resp) => {
        this.dialogService.openBorrowedEquipmentHistoryDialog(resp);
      },
    });
  }

  loadMoreBorrowedEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: (this.filter.page as number) + 1 },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/borrowed-equipment'], navigationExtras);
  }

  queryParamsHandling(params: Params): void {
    this.filter.page = params['page'] ? parseInt(params['page']) : 1;
    this.filter.search = params['search'];
    this.filter.purpose = params['purpose'];
    this.filter.status = params['status'];
    this.filter.info_and_history = params['info_and_history']
      ? params['info_and_history'] === 'true'
      : false;
    this.getBorrowedEquipment();
  }
}
