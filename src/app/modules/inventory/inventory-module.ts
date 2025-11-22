import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryComponent } from './inventory/inventory.component';
import { EquipmentCardComponent } from '../shared/equipment-card/equipment-card.component';
import { EquipmentFilterComponent } from '../shared/equipment-filter/equipment-filter.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AddedEquipmentCardComponent } from '../shared/added-equipment-card/added-equipment-card.component';
import { ButtonComponent } from '../shared/button/button.component';


@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    MatSidenavModule,
    EquipmentCardComponent,
    EquipmentFilterComponent,
    AddedEquipmentCardComponent,
    ButtonComponent
  ]
})
export class InventoryModule { }
