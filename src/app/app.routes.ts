import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/homepage/homepage.module').then((m) => m.HomepageModule),
  },
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
