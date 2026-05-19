import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  {
    path: 'remote-1',
    loadComponent: () =>
      loadRemoteModule('remote-1', './Component').then((m) => m.App),
  },
  {
    path: 'remote-2',
    loadComponent: () =>
      loadRemoteModule('remote-2', './Component').then((m) => m.App),
  },
  {
    path: 'remote-3',
    loadComponent: () =>
      loadRemoteModule('remote-3', './Component').then((m) => m.App),
  },
];
