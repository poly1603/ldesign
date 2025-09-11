import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// 全局样式
import './styles/global.scss';

bootstrapApplication(AppComponent, {
  providers: [
    // 路由配置
    provideRouter(routes),
    // 动画模块
    importProvidersFrom(BrowserAnimationsModule),
  ]
}).catch(err => console.error(err));
