import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { INVENTORY_ROLES } from './models/data/user-profile.model';

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
    canActivate: [authGuard, roleGuard(INVENTORY_ROLES)]
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
  {
    path: '**',
    redirectTo: '/borrow',
    pathMatch: 'full'
  },
];
