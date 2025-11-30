import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BorrowRoutingModule } from './borrow-routing-module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EquipmentCardComponent } from '../shared/equipment-card/equipment-card.component';
import { ButtonComponent } from '../shared/button/button.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { SideNavigationComponent } from '../shared/side-navigation/side-navigation.component';
import { AddedEquipmentCardComponent } from '../shared/added-equipment-card/added-equipment-card.component';
import { BorrowComponent } from './borrow/borrow.component';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';

@NgModule({
  declarations: [BorrowComponent, ClassScheduleComponent],
  imports: [
    CommonModule,
    BorrowRoutingModule,
    MatSidenavModule,
    EquipmentCardComponent,
    AddedEquipmentCardComponent,
    ButtonComponent,
    TitleSectionComponent,
    SideNavigationComponent,
    EmptyPlaceholderComponent
  ],
})
export class BorrowModule {}
