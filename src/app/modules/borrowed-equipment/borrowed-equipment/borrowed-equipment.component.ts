import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import BorrowedEquipment, {
  BorrowedEquipmentStatusType,
  BorrowedEquipmentTransaction,
} from '../../../models/BorrowedEquipment';
import { BorrowService } from '../../../services/borrow.service';
import {
  RowDisplayActionConfig,
  RowDisplayContent,
} from '../../shared/row-display/row-display.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { AuthService, TokenData } from '../../../services/auth.service';
import {
  BorrowedEquimentFilter,
  IBorrowedEquimentFilter,
} from '../../../models/BorrowedEquipmentFilter';
import { SnackbarService } from '../../../services/snackbar.service';
import { FilterService } from '../../../services/filter.service';
import { FilterDisplay } from '../../../models/EquipmentFilter';
import { ButtonConfig } from '../../../models/ui/button-config.model';
import { TitleSectionComponent } from '../../shared/title-section/title-section.component';
import { DataRowComponent } from '../../shared/layout/data-row/data-row.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { BorrowedEquipmentToolbarComponent } from '../borrowed-equipment-toolbar/borrowed-equipment-toolbar.component';

@Component({
  selector: 'app-borrowed-equipment',
  templateUrl: './borrowed-equipment.component.html',
  styleUrl: './borrowed-equipment.component.css',
  imports: [TitleSectionComponent, DataRowComponent, ButtonComponent, BorrowedEquipmentToolbarComponent]
})
export class BorrowedEquipmentComponent implements OnInit {
  borrowed_equipment: WritableSignal<BorrowedEquipment[]> = signal([]);
  hasMore: boolean = false;
  user: TokenData;

  filter = signal<BorrowedEquimentFilter>(new BorrowedEquimentFilter());
  filterDisplay = computed((): FilterDisplay[] => {
    const excluded = ['page'];
    return this.filterService.getFilterDisplay(this.filter(), excluded, []);
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private borrowService: BorrowService,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackbarService,
    private filterService: FilterService,
  ) {
    this.user = this.authService.getUser();
  }

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
  ): void {
    // TODO add functional
    const equipmentId = borrowedEquipment.equipment._id;
    const borrowId = borrowedEquipment._id;
    let updated: BorrowedEquipmentTransaction = {
      quantity: quantity,
      condition: 'functional',
      status: status,
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
    return this.borrowService.getRowData(borrowedEquipment)
  }

  getBorrowedEquipmentContents(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    return this.borrowService.getRowDisplayContent(borrowedEquipment);
  }

  getBorrowedEquipmentActions(borrowedEquipment: BorrowedEquipment): RowDisplayActionConfig[] {
    return this.borrowService.getRowDisplayActions(
      this.user,
      borrowedEquipment,
      this.filter().info_and_transaction,
    );
  }

  onActionClicked(action: string, borrowedEquipment: BorrowedEquipment) {
    if (action == 'Approve') {
      this.onUpdateStatus(borrowedEquipment, 'instructor_approved', 'Approve');
    } else if (action == 'Release') {
      this.onUpdateStatus(borrowedEquipment, 'released', 'Release');
    } else if (action == 'Return') {
      this.onUpdateStatus(borrowedEquipment, 'mark_returned', 'Return');
    } else if (action == 'Confirm Returns') {
      this.onUpdateStatus(borrowedEquipment, 'returned', 'Confirm Returns');
    }

    // cancelled
    // else if (action == 'Cancel Request' && borrowedEquipment.quantity == 1) {
    //   const status = 'cancelled';
    //   this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    // } else if (action == 'Cancel Request' && borrowedEquipment.quantity > 1) {
    //   // TODO
    //   const status = 'cancelled';
    //   this.updateBorrowedEquipmentStatus(borrowedEquipment, status, borrowedEquipment.quantity);
    // }
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
  ) {
    const fields: BorrowedEquipmentStatusFields[] = ['quantity', 'status'];
    const actions: ButtonConfig[] = [new ButtonConfig({ name: action })];
    if (borrowedEquipment.quantity == 1) {
      this.addTransaction(borrowedEquipment, status, borrowedEquipment.quantity);
    } else {
      this.dialogService
        .openUpdateQuantityStatusDialog(fields, actions, [status])
        .subscribe((resp) => {
          if (resp) {
            this.addTransaction(borrowedEquipment, resp.status, resp.quantity);
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
      info_and_transaction: params['info_and_transaction']
        ? params['info_and_transaction'] === 'true'
        : false,
      enable_cancel: params['enable_cancel']
        ? params['enable_cancel'] === 'true'
        : false,
    });
    this.getBorrowedEquipment();
  }
}
