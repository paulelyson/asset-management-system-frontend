import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { BorrowedEquipment, BorrowedEquipmentStatusType } from '../../../models/BorrowedEquipment';
import { BorrowedEquipmentStatusExt, BorrowService } from '../../../services/borrow.service';
import { RowDisplayContent } from '../../shared/row-display/row-display.component';
import { DialogService } from '../../../services/dialog.service';
import { BorrowedEquipmentStatusFields } from '../../shared/update-quantity-status-dialog/update-quantity-status-dialog.component';
import { IButtonConfig } from '../../shared/button/button.component';
import { AuthService, TokenData } from '../../../services/auth.service';
import { IBorrowedEquimentFilter } from '../../../models/BorrowedEquipmentFilter';

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
    private router: Router
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
        this.disable_showmore = resp.length < 15;
        this.borrowed_equipment.update((eqpmnt) => [...eqpmnt].concat(resp));
        console.log(resp);
      },
    });
  }

  updateBorrowedEquipmentStatus(
    borrowedEquipment: BorrowedEquipment,
    status: BorrowedEquipmentStatusType,
    quantity: number
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
      next: (resp) => this.getBorrowedEquipment(),
      error: (err) => console.error(err),
    });
  }

  borrowedEquipmentContents(borrowedEquipment: BorrowedEquipment): RowDisplayContent[] {
    return this.borrowService.getRowDisplayContent(borrowedEquipment);
  }

  get borrowedEquipmentActions() {
    return this.borrowService.getRowDisplayActions();
  }

  onActionClicked(action: string, borrowedEquipment: BorrowedEquipment) {
    if (action == 'lock_open') {
    } else if (action == 'edit') {
      const fields: BorrowedEquipmentStatusFields[] = ['quantity', 'status'];
      const actions: IButtonConfig[] = [
        {
          id: 0,
          name: 'Update',
          size: 'sm',
          type: 'default',
          shade: 'default',
          width: 'width-filled',
          btnType: 'button',
        },
      ];
      this.dialogService.openUpdateQuantityStatusDialog(fields, actions).subscribe((resp) => {
        this.updateBorrowedEquipmentStatus(borrowedEquipment, resp.status, resp.quantity);
      });
    }
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
    this.getBorrowedEquipment();
  }
}
