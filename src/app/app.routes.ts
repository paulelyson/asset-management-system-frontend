import { Routes } from '@angular/router';

export const routes: Routes = [
   {
    path: 'borrow',
    loadChildren: () => import('./modules/borrow/borrow-module').then((m) => m.BorrowModule),
  },
  {
    path: 'inventory',
    loadChildren: () => import('./modules/inventory/inventory-module').then((m) => m.InventoryModule),
  },
  {
    path: 'borrowed-equipment',
    loadChildren: () => import('./modules/borrowed-equipment/borrowed-equipment.module').then((m) => m.BorrowedEquipmentModule),
  },
];
