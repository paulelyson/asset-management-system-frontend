import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryComponent } from './inventory/inventory.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { EquipmentDetailRowComponent } from '../shared/equipment-detail-row/equipment-detail-row.component';
import { MatDividerModule } from '@angular/material/divider';
import { InventoryToolbarComponent } from './inventory-toolbar/inventory-toolbar.component';


@NgModule({
  declarations: [InventoryComponent, InventoryToolbarComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    TitleSectionComponent,
    EquipmentDetailRowComponent,
    MatDividerModule
  ]
})
export class InventoryModule { }
