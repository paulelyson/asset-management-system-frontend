import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowedEquipmentRoutingModule } from './borrowed-equipment-routing.module';
import { BorrowedEquipmentComponent } from './borrowed-equipment/borrowed-equipment.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { RowDisplayComponent } from '../shared/row-display/row-display.component';

@NgModule({
  declarations: [BorrowedEquipmentComponent],
  imports: [CommonModule, BorrowedEquipmentRoutingModule, TitleSectionComponent, RowDisplayComponent],
})
export class BorrowedEquipmentModule {}
