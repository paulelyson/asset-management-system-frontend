import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowedEquipmentRoutingModule } from './borrowed-equipment-routing.module';
import { BorrowedEquipmentComponent } from './borrowed-equipment/borrowed-equipment.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { RowDisplayComponent } from '../shared/row-display/row-display.component';
import { InputComponent } from '../shared/input/input.component';
import { AutocompleteComponent } from '../shared/autocomplete/autocomplete.component';
import { UpdateBorrowedEquipmentDialogComponent } from './update-borrowed-equipment-dialog/update-borrowed-equipment-dialog.component';
import { ButtonComponent } from '../shared/button/button.component';

@NgModule({
  declarations: [BorrowedEquipmentComponent, UpdateBorrowedEquipmentDialogComponent],
  imports: [
    CommonModule,
    BorrowedEquipmentRoutingModule,
    TitleSectionComponent,
    RowDisplayComponent,
    InputComponent,
    AutocompleteComponent,
    ButtonComponent,
  ],
})
export class BorrowedEquipmentModule {}
