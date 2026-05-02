import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipmentChangeLogDialogComponent } from '../shared/dialogs/equipment-change-log-dialog/equipment-change-log-dialog.component';

const routes: Routes = [
  {
    path: 'equipment-change-log',
    component: EquipmentChangeLogDialogComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipmentChangeLogRoutingModule { }
