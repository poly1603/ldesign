/**
 * Angular + TypeScript 示例应用入口文件
 * 展示 @ldesign/qrcode 在 Angular 环境中的使用
 */

import 'zone.js';
import '@angular/compiler'; // 添加JIT编译器支持

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import './styles.css';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
