import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-page">
      <div class="container">
        <!-- 欢迎区域 -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">🚀 欢迎使用 Angular + @ldesign/launcher</h1>
            <p class="hero-subtitle">
              现代化的 Angular 开发体验，集成了最新的构建工具和开发流程
            </p>
            <div class="hero-badges">
              <span class="badge">Angular 17</span>
              <span class="badge">TypeScript</span>
              <span class="badge">Vite</span>
              <span class="badge">@ldesign/launcher</span>
            </div>
          </div>
        </section>

        <!-- 功能特性 -->
        <section class="features-section">
          <h2 class="section-title">🎯 主要特性</h2>
          <div class="features-grid">
            <div class="feature-card" *ngFor="let feature of features">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <!-- 交互演示 -->
        <section class="demo-section">
          <h2 class="section-title">🎮 交互演示</h2>
          <div class="demo-content">
            <div class="counter-demo">
              <h3>计数器演示</h3>
              <div class="counter-display">
                <span class="counter-value">{{ count }}</span>
              </div>
              <div class="counter-controls">
                <button 
                  (click)="decrement()" 
                  [disabled]="count <= 0"
                  class="counter-btn counter-btn--decrease"
                >
                  <span>➖</span>
                  <span>减少</span>
                </button>
                <button 
                  (click)="reset()" 
                  class="counter-btn counter-btn--reset"
                >
                  <span>🔄</span>
                  <span>重置</span>
                </button>
                <button 
                  (click)="increment()" 
                  class="counter-btn counter-btn--increase"
                >
                  <span>➕</span>
                  <span>增加</span>
                </button>
              </div>
            </div>

            <div class="status-demo">
              <h3>状态展示</h3>
              <div class="status-grid">
                <div class="status-item">
                  <strong>当前计数:</strong>
                  <span class="status-value">{{ count }}</span>
                </div>
                <div class="status-item">
                  <strong>点击次数:</strong>
                  <span class="status-value">{{ clickCount }}</span>
                </div>
                <div class="status-item">
                  <strong>时间戳:</strong>
                  <span class="status-value">{{ currentTime | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home-page {
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* 英雄区域样式 */
    .hero-section {
      text-align: center;
      padding: 4rem 0;
      background: linear-gradient(135deg, 
        var(--primary-color) 0%, 
        var(--accent-color) 100%);
      border-radius: 12px;
      margin-bottom: 3rem;
      color: white;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin: 0 0 2rem 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-badges {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* 功能特性样式 */
    .features-section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      color: var(--text-primary);
      margin: 0 0 2rem 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -3px var(--shadow-color);
      border-color: var(--primary-color);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
    }

    .feature-description {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    /* 演示区域样式 */
    .demo-section {
      margin-bottom: 3rem;
    }

    .demo-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .counter-demo, .status-demo {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
    }

    .counter-demo h3, .status-demo h3 {
      color: var(--text-primary);
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
    }

    /* 计数器样式 */
    .counter-display {
      text-align: center;
      margin-bottom: 2rem;
    }

    .counter-value {
      display: inline-block;
      font-size: 4rem;
      font-weight: 800;
      color: var(--primary-color);
      min-width: 120px;
      padding: 1rem;
      background: var(--background-color);
      border: 2px solid var(--border-color);
      border-radius: 12px;
    }

    .counter-controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .counter-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      background: var(--background-color);
      color: var(--text-primary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 100px;
      justify-content: center;
    }

    .counter-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px -2px var(--shadow-color);
    }

    .counter-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .counter-btn--decrease:hover:not(:disabled) {
      border-color: #ef4444;
      color: #ef4444;
    }

    .counter-btn--reset:hover:not(:disabled) {
      border-color: #8b5cf6;
      color: #8b5cf6;
    }

    .counter-btn--increase:hover:not(:disabled) {
      border-color: #10b981;
      color: #10b981;
    }

    /* 状态展示样式 */
    .status-grid {
      display: grid;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    .status-value {
      color: var(--primary-color);
      font-weight: 600;
    }

    /* 响应式样式 */
    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .counter-controls {
        flex-direction: column;
      }

      .counter-btn {
        min-width: 140px;
      }
    }
  `]
})
export class HomeComponent {
  count = 0;
  clickCount = 0;
  currentTime = new Date();

  // 功能特性数据
  features = [
    {
      icon: '⚡',
      title: '极速开发',
      description: '基于 Vite 的快速热重载和构建，提供流畅的开发体验。'
    },
    {
      icon: '🔧',
      title: '开箱即用',
      description: '预配置的 TypeScript、ESLint、Prettier 等工具，无需复杂设置。'
    },
    {
      icon: '📦',
      title: '模块化架构',
      description: '支持 ES 模块和 CommonJS，灵活的依赖管理和代码分割。'
    },
    {
      icon: '🎨',
      title: '主题支持',
      description: '内置明暗主题切换，支持自定义 CSS 变量和样式系统。'
    },
    {
      icon: '📱',
      title: '响应式设计',
      description: '移动端友好的界面设计，适配各种屏幕尺寸和设备。'
    },
    {
      icon: '🚀',
      title: '生产优化',
      description: '自动的代码分割、Tree-shaking 和压缩优化，提升应用性能。'
    }
  ];

  constructor() {
    // 定期更新时间显示
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  increment(): void {
    this.count++;
    this.clickCount++;
  }

  decrement(): void {
    if (this.count > 0) {
      this.count--;
      this.clickCount++;
    }
  }

  reset(): void {
    this.count = 0;
    this.clickCount++;
  }
}
