import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryComponent } from './inventory/inventory.component';
import { EquipmentCardComponent } from '../shared/equipment-card/equipment-card.component';


@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    EquipmentCardComponent
  ]
})
export class InventoryModule { }
