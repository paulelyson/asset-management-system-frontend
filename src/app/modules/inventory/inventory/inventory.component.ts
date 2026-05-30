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
import { SnackbarService } from '../../../services/snackbar.service';
import { PDFFormatConfig } from '../../../models/ui/pdf-format-config.model';
import { Department, IDepartment } from '../../../models/Department';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  imports: [ButtonComponent, TitleSectionComponent, DataRowComponent, InventoryToolbarComponent],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit {
  hasMore: boolean = false;
  equipment: WritableSignal<IEquipment[]> = signal([]);
  user: User;
  filter = signal<EquipmentFilter>(new EquipmentFilter());
  filterDisplay = computed(() => getFilterDisplay(this.filter(), ['department']));
  selectedDept: WritableSignal<IDepartment> = signal(new Department());
  pendingApproval: WritableSignal<number> = signal(0);
  filterEffect = effect(() => {
    const dept = this.filter().department;
    if (dept && isObjectId(dept)) {
      this.departmentService.getDepartmentById(dept).subscribe((resp) => {
        this.filter.update(({ department, ...rest }) => ({ department: resp.data.code, ...rest }));
        this.selectedDept.set(resp.data);
      });
    }
  });
  canAccessEquipment = computed(() => {
    return (
      this.filter() &&
      this.authService.hasRole(['lab_in_charge', 'chairman', 'assistant', 'administrator', 'dean'])
    );
  });
  isLoading: boolean = false;
  constructor(
    private dialogService: DialogService,
    private equipmentService: EquipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private snackBarService: SnackbarService,
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
        this.equipment.update((eqpmnt) => [...eqpmnt, ...resp.data[0]]);
        this.pendingApproval.set(resp.data[1]);
        if(resp.total > 25) {
          this.filter.update((f) => ({ ...f, limit: resp.total }));
        }
      },
    });
  }

  getRowData(equipment: IEquipment) {
    return this.equipmentService.getRowData(equipment, this.canAccessEquipment());
  }

  onActionClicked(action: string, equipment: IEquipment) {
    if (action == 'Details') {
      this.dialogService.openEquipmentDetailDialog(equipment);
    } else if (action == 'Update') {
      this.onUpdateEquipment(equipment);
    } else if (action == 'Changes History') {
      this.onDisplayChangeLogs(equipment);
    } else if (action == 'Create a Copy') {
      this.onCloneEquipment(equipment);
    }
  }

  onCloneEquipment(equipment: IEquipment) {
    this.dialogService.openUpdateEquipmentDialog(equipment, 'create').subscribe((resp: IEquipment | null) => {
      if (resp) {}
    });
  }

  onUpdateEquipment(equipment: IEquipment) {
    this.dialogService.openUpdateEquipmentDialog(equipment, 'update').subscribe((resp: IEquipment | null) => {
      if (resp) {
        this.equipment.update((eqpmnt) => {
          const filtered = eqpmnt.filter((item) => item._id !== resp._id);
          return [resp, ...filtered];
        });
      }
    });
  }

  onDisplayChangeLogs(equipment: IEquipment) {
    this.equipmentService.getChangeLogsByEquipment(equipment._id).subscribe({
      next: (resp) => {
        this.dialogService.openEquipmentChangeLogDialog(resp.data).subscribe((resp) => {
          if (resp) {
            this.equipmentService.resolveChangeLog(resp).subscribe({
              next: (resp) =>
                this.snackBarService.openSnackbar({
                  icon: 'info',
                  message: [resp.message],
                  type: 'success',
                }),
              error: (err) =>
                this.snackBarService.openSnackbar({
                  icon: 'info',
                  message: [err],
                  type: 'success',
                }),
            });
          }
        });
      },
    });
  }

  onDownloadReport(event: PDFFormatConfig) {
    this.isLoading = true;
    this.snackBarService.openSnackbar({
      icon: 'info',
      message: ['Generating report...'],
      type: 'warning',
    });
    const config = {
      ...event,
      header: {
        title: environment.school_name,
        // logoUrl: '/assets/images/logo.png',
        college: this.selectedDept().school.name,
        department: this.selectedDept().name,
      }
    };
    const filter = {
      ...this.filter(),
      department: this.selectedDept()._id,
    }
    this.equipmentService
      .downloadReport(filter, config)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'equipment-report.pdf';
          a.click();
          URL.revokeObjectURL(url);
          this.snackBarService.openSnackbar({
            icon: 'success',
            message: ['Report downloaded successfully'],
            type: 'success',
          });
        },
        error: (err) =>
          this.snackBarService.openSnackbar({
            icon: 'error',
            message: [err],
            type: 'error',
          }),
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
      pending: params['pending'] ? JSON.parse(params['pending']) : false,
    });
    this.getEquipment();
  }
}
