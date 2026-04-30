import {
  ChangeDetectorRef,
  Component,
  computed,
  input,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { NavigationExtras, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { EquipmentService } from '../../../services/equipment.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { FilterDisplay } from '../../../models/ui/common-config.model';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.css',
  imports: [BadgeComponent, ButtonComponent, ReactiveFormsModule, InputComponent],
})
export class InventoryToolbarComponent {
  filters = input<FilterDisplay[]>([]);
  @Input() department: string = '';
  searchControl = new FormControl('');
  url: string = '';
  showClearFilter = computed((): boolean => this.filters().some((x) => x.canClose && x.show));
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

  addNewEquipment(): void {
    this.dialogService.openCreateEquipmentDialog();
  }
}
