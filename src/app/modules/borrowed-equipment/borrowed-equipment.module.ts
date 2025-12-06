import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowedEquipmentRoutingModule } from './borrowed-equipment-routing.module';
import { BorrowedEquipmentComponent } from './borrowed-equipment/borrowed-equipment.component';

@NgModule({
  declarations: [BorrowedEquipmentComponent],
  imports: [CommonModule, BorrowedEquipmentRoutingModule],
})
export class BorrowedEquipmentModule {}
