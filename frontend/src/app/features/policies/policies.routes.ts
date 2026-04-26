import { Routes } from '@angular/router';

export const policiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./policy-list/policy-list.component').then(m => m.PolicyListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./policy-form/policy-form.component').then(m => m.PolicyFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./policy-form/policy-form.component').then(m => m.PolicyFormComponent),
  },
];
