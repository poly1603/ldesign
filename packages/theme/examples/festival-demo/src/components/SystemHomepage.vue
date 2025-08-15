<template>
  <div class="system-homepage">
    <!-- 顶部导航栏 -->
    <nav class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <div class="logo">
            <span class="logo-icon">🎨</span>
            <span class="logo-text">LDesign</span>
          </div>
        </div>

        <div class="navbar-menu">
          <a href="#" class="nav-link active">首页</a>
          <a href="#" class="nav-link">产品</a>
          <a href="#" class="nav-link">解决方案</a>
          <a href="#" class="nav-link">文档</a>
          <a href="#" class="nav-link">社区</a>
        </div>

        <div class="navbar-actions">
          <div class="search-box">
            <input type="text" placeholder="搜索..." class="search-input" />
            <button class="search-btn">🔍</button>
          </div>

          <div class="user-menu">
            <div class="user-avatar">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="用户头像"
              />
            </div>
            <span class="user-name">张三</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-main">节日主题设计系统</span>
            <span class="title-sub">让每个节日都有专属的视觉体验</span>
          </h1>
          <p class="hero-description">
            基于现代前端技术栈，提供完整的节日主题解决方案。
            支持春节、圣诞节等多种节日主题，一键切换，沉浸式体验。
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary">立即体验</button>
            <button class="btn btn-secondary">查看文档</button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card card">
            <div class="card-header">
              <span class="card-title">主题预览</span>
              <div class="theme-dots">
                <span class="dot dot-red"></span>
                <span class="dot dot-green"></span>
                <span class="dot dot-blue"></span>
              </div>
            </div>
            <div class="card-content">
              <div class="preview-themes">
                <div class="theme-preview spring">🧧</div>
                <div class="theme-preview christmas">🎄</div>
                <div class="theme-preview default">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">核心特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-title">智能主题</h3>
            <p class="feature-description">
              基于日期自动推荐节日主题，支持手动切换
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎭</div>
            <h3 class="feature-title">丰富挂件</h3>
            <p class="feature-description">
              每个主题包含多种动画挂件，营造节日氛围
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">高性能</h3>
            <p class="feature-description">GPU 加速动画，60fps 流畅体验</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">响应式</h3>
            <p class="feature-description">完美适配桌面、平板、移动端</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number badge">3</div>
            <div class="stat-label">精选主题</div>
          </div>
          <div class="stat-item">
            <div class="stat-number badge">6</div>
            <div class="stat-label">装饰类型</div>
          </div>
          <div class="stat-item">
            <div class="stat-number badge">3</div>
            <div class="stat-label">动画效果</div>
          </div>
          <div class="stat-item">
            <div class="stat-number badge">100%</div>
            <div class="stat-label">响应式</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quickstart-section">
      <div class="container">
        <h2 class="section-title">快速开始</h2>
        <div class="quickstart-content">
          <div class="code-example">
            <div class="code-header">
              <span class="code-title">安装使用</span>
              <button class="copy-btn no-decoration">复制</button>
            </div>
            <pre class="code-block"><code>npm install @ldesign/theme
import { switchTheme } from '@ldesign/theme'

// 切换到春节主题
switchTheme('spring-festival')</code></pre>
          </div>

          <div class="quickstart-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>安装依赖</h4>
                <p>通过 npm 或 yarn 安装主题包</p>
              </div>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>导入主题</h4>
                <p>在项目中导入并初始化主题系统</p>
              </div>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>切换主题</h4>
                <p>调用 API 即可切换到不同的节日主题</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>产品</h4>
            <ul>
              <li><a href="#">主题系统</a></li>
              <li><a href="#">组件库</a></li>
              <li><a href="#">设计工具</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>开发者</h4>
            <ul>
              <li><a href="#">API 文档</a></li>
              <li><a href="#">快速开始</a></li>
              <li><a href="#">示例代码</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>社区</h4>
            <ul>
              <li><a href="#">GitHub</a></li>
              <li><a href="#">讨论区</a></li>
              <li><a href="#">博客</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>关于</h4>
            <ul>
              <li><a href="#">公司介绍</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">隐私政策</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 LDesign. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 响应式数据
const isMenuOpen = ref(false)

// 方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const copyCode = () => {
  const code = `npm install @ldesign/theme
import { switchTheme } from '@ldesign/theme'

// 切换到春节主题
switchTheme('spring-festival')`

  navigator.clipboard.writeText(code).then(() => {
    console.log('代码已复制到剪贴板')
  })
}
</script>

<style scoped>
.system-homepage {
  min-height: 100vh;
  background: var(
    --festival-background,
    linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
  );
}

/* 顶部导航栏 */
.top-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--festival-primary, #e2e8f0);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand .logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--festival-primary, #1a202c);
}

.logo-icon {
  font-size: 24px;
}

.navbar-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: var(--festival-text, #4a5568);
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--festival-primary, #3182ce);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--festival-primary, #3182ce);
  border-radius: 1px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--festival-primary, #3182ce);
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  width: 200px;
}

.search-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--festival-primary, #e2e8f0);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--festival-text, #1a202c);
}

/* Hero 区域 */
.hero-section {
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero-title {
  margin: 0 0 24px 0;
}

.title-main {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: var(--festival-primary, #1a202c);
  line-height: 1.2;
  margin-bottom: 8px;
}

.title-sub {
  display: block;
  font-size: 24px;
  font-weight: 400;
  color: var(--festival-text, #4a5568);
  line-height: 1.4;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  color: var(--festival-text, #4a5568);
  margin: 0 0 32px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--festival-primary, #3182ce);
  color: white;
  border-color: var(--festival-primary, #3182ce);
}

.btn-primary:hover {
  background: var(--festival-secondary, #2c5aa0);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(49, 130, 206, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--festival-primary, #3182ce);
  border-color: var(--festival-primary, #3182ce);
}

.btn-secondary:hover {
  background: var(--festival-primary, #3182ce);
  color: white;
  transform: translateY(-2px);
}

.visual-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-weight: 600;
  color: var(--festival-text, #1a202c);
}

.theme-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-red {
  background: #dc2626;
}
.dot-green {
  background: #16a34a;
}
.dot-blue {
  background: #1890ff;
}

.preview-themes {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 32px 0;
}

.theme-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-preview:hover {
  transform: scale(1.1);
}

.theme-preview.spring {
  background: linear-gradient(135deg, #dc2626, #f59e0b);
}

.theme-preview.christmas {
  background: linear-gradient(135deg, #16a34a, #dc2626);
}

.theme-preview.default {
  background: linear-gradient(135deg, #1890ff, #722ed1);
}

/* 功能特性 */
.features-section {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.5);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  color: var(--festival-primary, #1a202c);
  margin: 0 0 48px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
  margin: 0 0 12px 0;
}

.feature-description {
  color: var(--festival-text, #4a5568);
  line-height: 1.6;
  margin: 0;
}

/* 数据统计 */
.stats-section {
  padding: 80px 0;
  background: var(--festival-primary, #3182ce);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* 快速开始 */
.quickstart-section {
  padding: 80px 0;
}

.quickstart-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}

.code-example {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
}

.code-header {
  background: #2d2d2d;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.copy-btn {
  background: var(--festival-primary, #3182ce);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.code-block {
  padding: 24px;
  margin: 0;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
}

.quickstart-steps {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--festival-primary, #3182ce);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
}

.step-content p {
  margin: 0;
  color: var(--festival-text, #4a5568);
  line-height: 1.6;
}

/* 页脚 */
.site-footer {
  background: #1a1a1a;
  color: #e2e8f0;
  padding: 64px 0 24px 0;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.footer-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #b3b3b3;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: var(--festival-primary, #3182ce);
}

.footer-bottom {
  border-top: 1px solid #333;
  padding-top: 24px;
  text-align: center;
  color: #b3b3b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }

  .navbar-menu {
    display: none;
  }

  .search-input {
    width: 120px;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }

  .title-main {
    font-size: 36px;
  }

  .title-sub {
    font-size: 20px;
  }

  .quickstart-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
