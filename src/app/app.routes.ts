import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/homepage/homepage.module').then((m) => m.HomepageModule),
  },
   {
    path: 'borrow',
    loadChildren: () => import('./modules/borrow/borrow-module').then((m) => m.BorrowModule),
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadChildren: () => import('./modules/inventory/inventory-module').then((m) => m.InventoryModule),
    canActivate: [authGuard]
  },
  {
    path: 'borrowed-equipment',
    loadChildren: () => import('./modules/borrowed-equipment/borrowed-equipment.module').then((m) => m.BorrowedEquipmentModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/borrow',
    pathMatch: 'full'
  },
];
