/**
 * Angular + TypeScript 示例应用主组件
 * 展示 @ldesign/qrcode 在 Angular 环境中的完整功能
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div id="app">
      <!-- 页面头部 -->
      <header class="header">
        <div class="container">
          <h1 class="title">&#64;ldesign/qrcode Angular 示例</h1>
          <p class="subtitle">展示二维码生成库在 Angular + TypeScript 环境中的完整功能</p>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="main">
        <div class="container">
          <!-- 导航标签 -->
          <nav class="nav-tabs">
            <a routerLink="/basic" routerLinkActive="active" class="nav-tab">基础示例</a>
            <a routerLink="/advanced" routerLinkActive="active" class="nav-tab">高级功能</a>
            <a routerLink="/style" routerLinkActive="active" class="nav-tab">样式定制</a>
            <a routerLink="/datatype" routerLinkActive="active" class="nav-tab">数据类型</a>
            <a routerLink="/performance" routerLinkActive="active" class="nav-tab">性能测试</a>
          </nav>

          <!-- 路由内容 -->
          <div class="tab-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>

      <!-- 页面底部 -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2025 LDesign Team. 基于 &#64;ldesign/qrcode v1.0.0</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* 导航标签样式 */
    .nav-tabs {
      display: flex;
      gap: var(--ls-spacing-xs);
      margin-bottom: var(--ls-spacing-lg);
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
      overflow-x: auto;
      padding-bottom: var(--ls-spacing-xs);
    }

    .nav-tab {
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: none;
      background: transparent;
      color: var(--ldesign-text-color-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: var(--ls-border-radius-base) var(--ls-border-radius-base) 0 0;
      transition: all 0.2s ease;
      white-space: nowrap;
      position: relative;
      text-decoration: none;
    }

    .nav-tab:hover {
      color: var(--ldesign-brand-color-6);
      background: var(--ldesign-brand-color-1);
    }

    .nav-tab.active {
      color: var(--ldesign-brand-color-6);
      background: var(--ldesign-brand-color-1);
      font-weight: 600;
    }

    .nav-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--ldesign-brand-color-6);
    }

    /* 标签内容区域 */
    .tab-content {
      min-height: 500px;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .nav-tabs {
        gap: 0;
      }
      
      .nav-tab {
        flex: 1;
        text-align: center;
        font-size: 13px;
        padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
      }
    }
  `]
})
export class AppComponent {
  title = '@ldesign/qrcode Angular 示例';
}
