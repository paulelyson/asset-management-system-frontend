import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipmentChangeLogComponent } from './equipment-change-log/equipment-change-log.component';

const routes: Routes = [
  {
    path: '',
    component: EquipmentChangeLogComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquipmentChangeLogRoutingModule {}
