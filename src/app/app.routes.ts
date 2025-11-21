import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inventory',
    loadChildren: () => import('./modules/inventory/inventory-module').then((m) => m.InventoryModule),
  },
];
