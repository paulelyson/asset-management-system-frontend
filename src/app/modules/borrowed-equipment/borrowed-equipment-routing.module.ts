import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BorrowedEquipmentComponent } from './borrowed-equipment/borrowed-equipment.component';

const routes: Routes = [{
  path: '',
  component: BorrowedEquipmentComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowedEquipmentRoutingModule { }
