import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BorrowRoutingModule } from './borrow-routing-module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EquipmentCardComponent } from '../shared/equipment-card/equipment-card.component';
import { ButtonComponent } from '../shared/button/button.component';
import { TitleSectionComponent } from '../shared/title-section/title-section.component';
import { SideNavigationComponent } from '../shared/side-navigation/side-navigation.component';
import { AddedEquipmentCardComponent } from './added-equipment-card/added-equipment-card.component';
import { BorrowComponent } from './borrow/borrow.component';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';
import { AutocompleteComponent } from '../shared/autocomplete/autocomplete.component';
import { InputComponent } from '../shared/input/input.component';
import { DatepickerComponent } from '../shared/datepicker/datepicker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';

@NgModule({
  declarations: [BorrowComponent, ClassScheduleComponent, AddedEquipmentCardComponent],
  imports: [
    CommonModule,
    BorrowRoutingModule,
    MatSidenavModule,
    EquipmentCardComponent,
    ButtonComponent,
    TitleSectionComponent,
    SideNavigationComponent,
    EmptyPlaceholderComponent,
    AutocompleteComponent,
    InputComponent,
    DatepickerComponent,
    FormsModule,
    ReactiveFormsModule,
    IconComponent
  ],
})
export class BorrowModule {}
