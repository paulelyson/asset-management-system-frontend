import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryComponent } from './inventory/inventory.component';
import { EquipmentCardComponent } from '../shared/equipment-card/equipment-card.component';
import { EquipmentFilterComponent } from '../shared/equipment-filter/equipment-filter.component';
import { MatSidenavModule } from '@angular/material/sidenav';


@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    MatSidenavModule,
    EquipmentCardComponent,
    EquipmentFilterComponent,
  ]
})
export class InventoryModule { }
