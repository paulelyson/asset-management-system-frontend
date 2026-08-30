import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import BorrowedEquipment, {
  BorrowedEquipmentStatusType,
  BorrowedEquipmentTransaction,
} from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { AuthService } from '../../../services/auth.service';
import {
  BorrowedEquimentFilter,
  IBorrowedEquimentFilter,
} from '../../../models/BorrowedEquipmentFilter';
import {
  Button,
  ButtonConfig,
  SnackbarService,
  TitleSection,
} from '@paulelyson/elyui';
import { DataRowComponent } from '../../shared/layout/data-row/data-row.component';
import { BorrowedEquipmentToolbarComponent } from '../borrowed-equipment-toolbar/borrowed-equipment-toolbar.component';
import { FilterDisplay } from '../../../models/ui/common-config.model';
import { getFilterDisplay } from '../../shared/utils/filter.util';

@Component({
  selector: 'app-borrowed-equipment',
  templateUrl: './borrowed-equipment.component.html',
  styleUrl: './borrowed-equipment.component.css',
  imports: [
    TitleSection,
    DataRowComponent,
    Button,
    BorrowedEquipmentToolbarComponent,
  ],
})
export class BorrowedEquipmentComponent implements OnInit {
  borrowed_equipment: WritableSignal<BorrowedEquipment[]> = signal([]);
  hasMore: boolean = false;
  filter = signal<BorrowedEquimentFilter>(new BorrowedEquimentFilter());
  filterDisplay = computed((): FilterDisplay[] => getFilterDisplay(this.filter()));

  constructor(
    private activatedRoute: ActivatedRoute,
    private borrowService: BorrowService,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => this.queryParamsHandling(params));
  }

  getBorrowedEquipment(): void {
    if (this.filter().page == 1) this.borrowed_equipment.set([]);
    this.borrowService.getBorrowedEquipment(this.filter()).subscribe({
      next: (resp) => {
        this.hasMore = resp.hasNextPage;
        this.borrowed_equipment.update((eqpmnt) => [...eqpmnt, ...resp.data]);
      },
    });
  }

  addTransaction(
    borrowedEquipment: BorrowedEquipment,
    status: BorrowedEquipmentStatusType,
    quantity: number,
    remarks?: string,
  ): void {
    // TODO add functional
    const equipmentId = borrowedEquipment.equipment?._id;
    if (!equipmentId) {
      // The row is showing, but its equipment reference no longer resolves —
      // there is nothing to post a transaction against.
      this.snackBarService.openSnackbar({
        icon: 'info',
        type: 'error',
        message: ['This record’s equipment no longer exists; it cannot be updated.'],
      });
      return;
    }
    const borrowId = borrowedEquipment._id;
    let updated: BorrowedEquipmentTransaction = {
      quantity: quantity,
      condition: 'functional',
      status: status,
      remarks: remarks
    };
    this.borrowService.addTransaction(updated, borrowId, equipmentId).subscribe({
      next: (resp) => {
        (this.snackBarService.openSnackbar({
          icon: 'info',
          type: 'success',
          message: [resp.message],
        }),
          this.getBorrowedEquipment());
      },
      error: (err) =>
        this.snackBarService.openSnackbar({ icon: 'info', type: 'error', message: [err] }),
    });
  }

  getRowData(borrowedEquipment: BorrowedEquipment) {
    const profile = this.authService.profile();
    // authGuard warms the profile before this route activates, so this is only
    // null in the window before it resolves — render no action buttons rather
    // than guessing at permissions.
    if (!profile) return [];
    return this.borrowService.getRowData(borrowedEquipment, profile, this.filter());
  }

  onActionClicked(action: string, borrowedEquipment: BorrowedEquipment) {
    if (action == 'Approve') {
      // The status records what happened, not who did it — the server stamps
      // the approver's role onto the transaction as `actedAsRole`.
      this.onUpdateStatus(borrowedEquipment, 'approved', 'Approve');
    } else if (action == 'Release') {
      this.onUpdateStatus(borrowedEquipment, 'released', 'Release');
    } else if (action == 'Return') {
      this.onUpdateStatus(borrowedEquipment, 'mark_returned', 'Return');
    } else if (action == 'Confirm Returns') {
      this.onUpdateStatus(borrowedEquipment, 'returned', 'Confirm Returns');
    } else if (action == 'Cancel') {
      this.onUpdateStatus(borrowedEquipment, 'cancelled', 'Cancel Request', true);
    }
    // view info
    else if (action == 'View Detail') {
      console.log('View Detail');
      this.dialogService.openBorrowedEquipmentDetailDialog(borrowedEquipment);
    }
    // view
    else if (action == 'Transactions') {
      const transactions = borrowedEquipment.transactions.sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
      this.onDisplayTransactions(transactions);
    }
  }

  onUpdateStatus(
    borrowedEquipment: BorrowedEquipment,
    status: BorrowedEquipmentStatusType,
    action: string,
    openDialog: boolean = false,
  ) {
    const fields: BorrowedEquipmentStatusFields[] = ['quantity', 'status'];
    const actions: ButtonConfig[] = [new ButtonConfig({ name: action })];
    if (!openDialog) {
      this.addTransaction(borrowedEquipment, status, borrowedEquipment.quantity);
    } else {
      this.dialogService
        .openUpdateQuantityStatusDialog(fields, actions, [status], borrowedEquipment.equipment)
        .subscribe((resp) => {
          if (resp) {
            this.addTransaction(borrowedEquipment, resp.status, resp.quantity, resp.remarks);
          }
        });
    }
  }

  onDisplayTransactions(transactions: BorrowedEquipmentTransaction[]): void {
    this.dialogService.openBorrowedEquipmentTransactionsDialog(transactions);
  }

  loadMoreBorrowedEquipment() {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: (this.filter().page as number) + 1 },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/borrowed-equipment'], navigationExtras);
  }

  queryParamsHandling(params: Params): void {
    this.filter.set({
      ...this.filter(),
      page: params['page'] ? parseInt(params['page']) : 1,
      search: params['search'] ?? '',
      status: params['status'] ?? undefined,
      purpose: params['purpose'] ?? undefined,
      advanced: params['advanced'] && JSON.parse(params['advanced']) == true ? true : undefined,
      enable_cancel: params['enable_cancel'] ? params['enable_cancel'] === 'true' : false,
    });
    this.getBorrowedEquipment();
  }
}
