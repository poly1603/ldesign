import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page">
      <div class="container">
        <!-- 页面标题 -->
        <header class="page-header">
          <h1 class="page-title">📖 关于本项目</h1>
          <p class="page-subtitle">
            了解更多关于这个 Angular + @ldesign/launcher 示例项目的信息
          </p>
        </header>

        <!-- 项目介绍 -->
        <section class="intro-section">
          <div class="intro-card">
            <h2 class="section-title">🎯 项目简介</h2>
            <p class="intro-text">
              这是一个使用 <strong>Angular 17</strong> 和 <strong>@ldesign/launcher</strong> 构建的现代化 Web 应用示例。
              本项目展示了如何使用最新的 Angular 特性（如独立组件、信号等）结合高效的开发工具链。
            </p>
            <div class="project-stats">
              <div class="stat-item">
                <div class="stat-value">{{ projectStats.components }}</div>
                <div class="stat-label">组件</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ projectStats.routes }}</div>
                <div class="stat-label">路由</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ projectStats.features }}</div>
                <div class="stat-label">特性</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ projectStats.devTime }}</div>
                <div class="stat-label">开发时间</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 技术栈 -->
        <section class="tech-stack-section">
          <h2 class="section-title">🛠️ 技术栈</h2>
          <div class="tech-categories">
            <div class="tech-category" *ngFor="let category of techStack">
              <h3 class="category-title">{{ category.name }}</h3>
              <div class="tech-list">
                <div 
                  class="tech-item" 
                  *ngFor="let tech of category.technologies"
                  [class.featured]="tech.featured"
                >
                  <div class="tech-icon">{{ tech.icon }}</div>
                  <div class="tech-info">
                    <div class="tech-name">{{ tech.name }}</div>
                    <div class="tech-version" *ngIf="tech.version">v{{ tech.version }}</div>
                    <div class="tech-description">{{ tech.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 特性展示 -->
        <section class="features-section">
          <h2 class="section-title">✨ 核心特性</h2>
          <div class="features-grid">
            <div class="feature-item" *ngFor="let feature of keyFeatures">
              <div class="feature-header">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
              </div>
              <p class="feature-description">{{ feature.description }}</p>
              <div class="feature-benefits">
                <div class="benefit-item" *ngFor="let benefit of feature.benefits">
                  <span class="benefit-check">✓</span>
                  <span>{{ benefit }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 开发信息 -->
        <section class="dev-info-section">
          <div class="dev-info-grid">
            <div class="info-card">
              <h3 class="info-title">🚀 开始使用</h3>
              <div class="code-snippet">
                <pre><code># 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build</code></pre>
              </div>
            </div>
            
            <div class="info-card">
              <h3 class="info-title">📚 学习资源</h3>
              <ul class="resource-list">
                <li><a href="https://angular.io/" target="_blank">Angular 官方文档</a></li>
                <li><a href="https://vitejs.dev/" target="_blank">Vite 构建工具</a></li>
                <li><a href="https://typescript.org/" target="_blank">TypeScript 语言</a></li>
                <li><a href="#" target="_blank">@ldesign/launcher 文档</a></li>
              </ul>
            </div>

            <div class="info-card">
              <h3 class="info-title">🤝 贡献指南</h3>
              <p>欢迎提交问题报告和功能请求！</p>
              <div class="contribution-links">
                <a href="#" class="contribution-link">
                  <span class="link-icon">🐛</span>
                  <span>报告 Bug</span>
                </a>
                <a href="#" class="contribution-link">
                  <span class="link-icon">💡</span>
                  <span>功能建议</span>
                </a>
                <a href="#" class="contribution-link">
                  <span class="link-icon">🔧</span>
                  <span>提交代码</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- 版权信息 -->
        <section class="copyright-section">
          <div class="copyright-content">
            <p>
              <strong>Angular + @ldesign/launcher 示例</strong> © 2024 
              <br>
              基于 MIT 许可证开源发布
            </p>
            <div class="build-info">
              <span>构建时间: {{ buildTime | date:'yyyy-MM-dd HH:mm:ss' }}</span>
              <span>版本: v1.0.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .about-page {
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* 页面头部 */
    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-title {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* 章节标题 */
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 2rem 0;
      text-align: center;
    }

    /* 项目介绍 */
    .intro-section {
      margin-bottom: 4rem;
    }

    .intro-card {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 10px 25px -3px var(--shadow-color);
      text-align: center;
    }

    .intro-text {
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
    }

    .project-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* 技术栈 */
    .tech-stack-section {
      margin-bottom: 4rem;
    }

    .tech-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .tech-category {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
    }

    .category-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.5rem 0;
      text-align: center;
    }

    .tech-list {
      display: grid;
      gap: 1rem;
    }

    .tech-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .tech-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 8px -2px var(--shadow-color);
    }

    .tech-item.featured {
      border-color: var(--primary-color);
      background: linear-gradient(135deg, 
        var(--primary-color)10, 
        var(--card-background));
    }

    .tech-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .tech-info {
      flex: 1;
      min-width: 0;
    }

    .tech-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .tech-version {
      font-size: 0.75rem;
      color: var(--primary-color);
      font-weight: 600;
    }

    .tech-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    /* 特性展示 */
    .features-section {
      margin-bottom: 4rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .feature-item {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -3px var(--shadow-color);
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .feature-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .feature-description {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
    }

    .feature-benefits {
      display: grid;
      gap: 0.5rem;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .benefit-check {
      color: var(--primary-color);
      font-weight: 700;
    }

    /* 开发信息 */
    .dev-info-section {
      margin-bottom: 4rem;
    }

    .dev-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .info-card {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
    }

    .info-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.5rem 0;
    }

    .code-snippet {
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
    }

    .code-snippet pre {
      margin: 0;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-primary);
    }

    .resource-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.75rem;
    }

    .resource-list li a {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .resource-list li a:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateX(4px);
    }

    .contribution-links {
      display: grid;
      gap: 0.75rem;
    }

    .contribution-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .contribution-link:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateX(4px);
    }

    .link-icon {
      font-size: 1.25rem;
    }

    /* 版权信息 */
    .copyright-section {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .copyright-content {
      text-align: center;
      color: var(--text-secondary);
    }

    .build-info {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .intro-card {
        padding: 2rem;
      }

      .project-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .tech-categories {
        grid-template-columns: 1fr;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .dev-info-grid {
        grid-template-columns: 1fr;
      }

      .build-info {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AboutComponent {
  buildTime = new Date();
  
  // 项目统计数据
  projectStats = {
    components: 5,
    routes: 2,
    features: 6,
    devTime: '2小时'
  };

  // 技术栈分类
  techStack = [
    {
      name: '前端框架',
      technologies: [
        {
          icon: '🅰️',
          name: 'Angular',
          version: '17.0',
          description: '现代化的 Web 应用框架',
          featured: true
        },
        {
          icon: '📘',
          name: 'TypeScript',
          version: '5.2',
          description: '类型安全的 JavaScript',
          featured: true
        },
        {
          icon: '💨',
          name: 'RxJS',
          version: '7.8',
          description: '响应式编程库'
        }
      ]
    },
    {
      name: '构建工具',
      technologies: [
        {
          icon: '⚡',
          name: 'Vite',
          version: '5.0',
          description: '下一代前端构建工具',
          featured: true
        },
        {
          icon: '🚀',
          name: '@ldesign/launcher',
          version: '1.0',
          description: '统一的开发工具链',
          featured: true
        },
        {
          icon: '📦',
          name: 'ESBuild',
          description: '极速 JavaScript 构建器'
        }
      ]
    },
    {
      name: '开发工具',
      technologies: [
        {
          icon: '🔍',
          name: 'ESLint',
          description: '代码质量检测工具'
        },
        {
          icon: '💅',
          name: 'Prettier',
          description: '代码格式化工具'
        },
        {
          icon: '🎨',
          name: 'SCSS',
          description: 'CSS 预处理器'
        }
      ]
    }
  ];

  // 核心特性
  keyFeatures = [
    {
      icon: '🏗️',
      title: '现代化架构',
      description: '采用 Angular 17 的最新特性，包括独立组件、信号系统等。',
      benefits: [
        '独立组件架构',
        '更小的包体积',
        '更好的 Tree-shaking',
        '更快的启动时间'
      ]
    },
    {
      icon: '⚡',
      title: '极速开发',
      description: '基于 Vite 的快速热重载和构建，大幅提升开发效率。',
      benefits: [
        '毫秒级热重载',
        '按需编译',
        '智能缓存',
        '快速构建'
      ]
    },
    {
      icon: '🔧',
      title: '开箱即用',
      description: '预配置的开发工具链，无需复杂设置即可开始开发。',
      benefits: [
        '零配置启动',
        '内置 TypeScript',
        '自动代码检查',
        '智能补全'
      ]
    }
  ];
}
