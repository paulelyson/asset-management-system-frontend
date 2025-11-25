import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryComponent } from './inventory/inventory.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { EquipmentDetailRowComponent } from '../shared/equipment-detail-row/equipment-detail-row.component';
import { MatDividerModule } from '@angular/material/divider';
import { InventoryToolbarComponent } from './inventory-toolbar/inventory-toolbar.component';
import { InputComponent } from '../shared/input/input.component';
import { ButtonComponent } from '../shared/button/button.component';
import { BadgeComponent } from '../shared/badge/badge.component';
import { RowDisplayComponent } from '../shared/row-display/row-display.component';


@NgModule({
  declarations: [InventoryComponent, InventoryToolbarComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    TitleSectionComponent,
    EquipmentDetailRowComponent,
    MatDividerModule,
    InputComponent,
    ButtonComponent,
    BadgeComponent,
    RowDisplayComponent
  ]
})
export class InventoryModule { }
