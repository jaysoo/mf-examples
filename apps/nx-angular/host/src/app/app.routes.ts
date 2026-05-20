import { Route } from '@angular/router';
import { Home } from './home/home';

export const appRoutes: Route[] = [
  { path: '', component: Home, pathMatch: 'full' },
  {
    path: 'ng_remote1',
    loadChildren: () => import('ng_remote1/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'ng_remote2',
    loadChildren: () => import('ng_remote2/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'ng_remote3',
    loadChildren: () => import('ng_remote3/Routes').then((m) => m.remoteRoutes),
  },
];
