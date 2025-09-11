import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-shell')
export class AppShell extends LitElement {
  @state() 
  private isDarkTheme = false;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: all 0.3s ease;
    }

    .header {
      text-align: center;
      padding: 3rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }

    .main {
      flex: 1;
      padding: 2rem 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 3rem;
    }

    .hero h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .hero p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .features {
      margin-top: 3rem;
    }

    .features h3 {
      font-size: 1.8rem;
      text-align: center;
      margin-bottom: 2rem;
      color: var(--text-primary);
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .footer {
      text-align: center;
      padding: 2rem;
      background-color: var(--bg-secondary);
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .title {
        font-size: 2rem;
      }
      
      .actions {
        flex-direction: column;
        align-items: center;
      }
      
      .feature-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    /* CSS 变量 */
    :host {
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --text-primary: #1e293b;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border-color: #e2e8f0;
      --primary-color: #667eea;
      --secondary-color: #764ba2;
    }

    :host([dark]) {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      --border-color: #334155;
    }
  `;

  protected firstUpdated() {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkTheme = prefersDark;
    this.updateTheme();

    // 监听主题切换事件
    this.addEventListener('theme-changed', this.handleThemeChange as EventListener);
  }

  private handleThemeChange = (event: CustomEvent) => {
    this.isDarkTheme = event.detail.isDark;
    this.updateTheme();
  };

  private updateTheme() {
    if (this.isDarkTheme) {
      this.setAttribute('dark', '');
      document.documentElement.classList.add('dark');
    } else {
      this.removeAttribute('dark');
      document.documentElement.classList.remove('dark');
    }
  }

  render() {
    return html`
      <header class="header">
        <h1 class="title">🚀 LDesign Launcher</h1>
        <p class="subtitle">Lit Web Components 示例项目</p>
      </header>

      <main class="main">
        <section class="hero">
          <h2>欢迎使用 LDesign Launcher</h2>
          <p>这是一个使用 Lit Web Components 开发的现代化示例项目</p>
          
          <div class="actions">
            <counter-button></counter-button>
            <theme-toggle .isDark=${this.isDarkTheme}></theme-toggle>
          </div>
        </section>

        <section class="features">
          <h3>功能特性</h3>
          <div class="feature-grid">
            <feature-card
              icon="⚡"
              title="快速开发"
              description="零配置启动开发服务器，支持热更新">
            </feature-card>
            
            <feature-card
              icon="🧩"
              title="Web Components"
              description="基于标准化 Web Components API">
            </feature-card>
            
            <feature-card
              icon="🎨"
              title="现代样式"
              description="支持 CSS 变量和暗色模式切换">
            </feature-card>
            
            <feature-card
              icon="📦"
              title="智能打包"
              description="自动优化构建输出和代码分割">
            </feature-card>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>&copy; 2024 LDesign Launcher. All rights reserved.</p>
      </footer>
    `;
  }
}
