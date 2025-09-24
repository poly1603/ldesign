/**
 * Angular 应用路由配置
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/basic', pathMatch: 'full' },
  {
    path: 'basic',
    loadComponent: () => import('./components/basic-example.component').then(m => m.BasicExampleComponent)
  },
  {
    path: 'advanced',
    loadComponent: () => import('./components/advanced-example.component').then(m => m.AdvancedExampleComponent)
  },
  {
    path: 'style',
    loadComponent: () => import('./components/style-example.component').then(m => m.StyleExampleComponent)
  },
  {
    path: 'datatype',
    loadComponent: () => import('./components/data-type-example.component').then(m => m.DataTypeExampleComponent)
  },
  {
    path: 'performance',
    loadComponent: () => import('./components/performance-example.component').then(m => m.PerformanceExampleComponent)
  }
];
