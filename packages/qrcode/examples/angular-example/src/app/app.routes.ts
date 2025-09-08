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
  }
];
