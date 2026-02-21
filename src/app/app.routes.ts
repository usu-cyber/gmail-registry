import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'account' },
      { path: 'account', loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent) },
      { path: 'sources', loadComponent: () => import('./pages/sources/sources.component').then(m => m.SourcesComponent) },
      { path: 'sources/:id', loadComponent: () => import('./pages/source-detail/source-detail.component').then(m => m.SourceDetailComponent) },
    ],
  },
  { path: '**', redirectTo: 'account' },
];
