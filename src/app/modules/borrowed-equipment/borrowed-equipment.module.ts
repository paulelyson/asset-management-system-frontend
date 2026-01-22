import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowedEquipmentRoutingModule } from './borrowed-equipment-routing.module';
import { BorrowedEquipmentComponent } from './borrowed-equipment/borrowed-equipment.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { RowDisplayComponent } from '../shared/row-display/row-display.component';
import { InputComponent } from '../shared/input/input.component';
import { AutocompleteComponent } from '../shared/autocomplete/autocomplete.component';
import { ButtonComponent } from '../shared/button/button.component';
import { BorrowedEquipmentToolbarComponent } from './borrowed-equipment-toolbar/borrowed-equipment-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';
import { RowHeaderComponent } from '../shared/row-header/row-header.component';
import { BadgeComponent } from '../shared/badge/badge.component';
import { BorrowedEquipmentFilterDialogComponent } from './borrowed-equipment-filter-dialog/borrowed-equipment-filter-dialog.component';
import { BorrowedEquipmentDetailDialogComponent } from './borrowed-equipment-detail-dialog/borrowed-equipment-detail-dialog.component';
import { BorrowedEquipmentHistoryDialogComponent } from './borrowed-equipment-history-dialog/borrowed-equipment-history-dialog.component';
import { VerticalStepperComponent } from '../shared/vertical-stepper/vertical-stepper.component';
import { MatDividerModule } from '@angular/material/divider';
import { ToggleComponent } from '../shared/toggle/toggle.component';

@NgModule({
  declarations: [
    BorrowedEquipmentComponent,
    BorrowedEquipmentToolbarComponent,
    BorrowedEquipmentFilterDialogComponent,
    BorrowedEquipmentDetailDialogComponent,
    BorrowedEquipmentHistoryDialogComponent
  ],
  imports: [
    CommonModule,
    BorrowedEquipmentRoutingModule,
    TitleSectionComponent,
    RowDisplayComponent,
    InputComponent,
    AutocompleteComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    EmptyPlaceholderComponent,
    RowHeaderComponent,
    BadgeComponent,
    ButtonComponent,
    VerticalStepperComponent,
    MatDividerModule,
    ToggleComponent

  ],
})
export class BorrowedEquipmentModule {}
