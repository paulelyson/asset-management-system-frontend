import {
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  input,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { EquipmentService } from '../../../services/equipment.service';
import { Badge, Button, TextInput, Toggle } from '@paulelyson/elyui';
import { FilterDisplay } from '../../../models/ui/common-config.model';
import { IEquipment } from '../../../models/Equipment';
import { PDFFormatConfig } from '../../../models/ui/pdf-format-config.model';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  imports: [Badge, Button, ReactiveFormsModule, TextInput, Toggle],
})
export class InventoryToolbarComponent {
  filters = input<FilterDisplay[]>([]);
  @Input() department: string = '';
  @Input() canAccessEquipment: boolean = false;
  @Input() pendingApprovalCount: number = 0;
  searchControl = new FormControl('');
  url: string = '';
  showClearFilter = computed((): boolean => this.filters().some((x) => x.canClose && x.show));
  isPending = computed((): boolean => this.filters().find((x) => x.field == 'pending')?.value);
  @Output() addEquipment = new EventEmitter<IEquipment>();
  @Output() downloadReport = new EventEmitter<PDFFormatConfig>();
  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.url = this.router.url.split('?')[0];
    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe(() => this.onSearch());
  }

  openFilterDialog() {
    this.dialogService.openEquipmentFilterDialog(this.department);
  }

  clearFilter(): void {
    this.router.navigate([this.url]);
  }

  onBadgeClosed(filter: FilterDisplay): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { [filter.field]: null },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onSearch(): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, search: this.searchControl.value },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  onPendingToggle(event: boolean) {
    let navigationExtras: NavigationExtras = {
      queryParams: { page: 1, pending: event },
      queryParamsHandling: 'merge',
    };
    this.router.navigate([this.url], navigationExtras);
  }

  addNewEquipment(): void {
    this.dialogService.openCreateEquipmentDialog().subscribe({
      next: (resp) => this.addEquipment.emit(resp)
    });
  }

  onDownloadReport() {
    this.dialogService.openDownloadReportDialog().subscribe((resp) => {
      if (resp) {
        this.downloadReport.emit(resp);
      }
    });
  }
}
