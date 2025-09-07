<template>
  <div class="home">
    <!-- 页面头部 -->
    <section class="hero">
      <div class="hero-container">
        <h1 class="hero-title">@ldesign/form 演示项目</h1>
        <p class="hero-subtitle">
          展示查询表单的多种实现方式：原生JavaScript、Web Components、Vue组件
        </p>
        <p class="hero-description">
          每种实现都包含相同的功能：智能按钮布局、展开收起、配置面板等
        </p>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features">
      <div class="features-container">
        <h2 class="features-title">核心功能特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>智能按钮布局</h3>
            <p>根据字段数量自动调整按钮位置，支持行内和新行两种模式</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>展开收起功能</h3>
            <p>支持表单的展开和收起，提供更好的用户体验</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚙️</div>
            <h3>实时配置面板</h3>
            <p>可以实时调整表单配置，立即查看效果</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>LDESIGN 设计系统</h3>
            <p>使用统一的设计系统变量，保证视觉一致性</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>多字段支持</h3>
            <p>支持9个字段，分3行显示，包含文本和选择框</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h3>灵活对齐方式</h3>
            <p>支持左对齐、居中、右对齐三种按钮对齐方式</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 实现方式导航 -->
    <section class="implementations">
      <div class="implementations-container">
        <h2 class="implementations-title">选择实现方式</h2>
        <div class="implementations-grid">
          <router-link to="/vanilla" class="implementation-card">
            <div class="implementation-icon">🟨</div>
            <h3>原生JavaScript</h3>
            <p>使用纯JavaScript实现，无框架依赖，展示基础DOM操作和事件处理</p>
            <div class="implementation-tags">
              <span class="tag">Vanilla JS</span>
              <span class="tag">DOM API</span>
              <span class="tag">ES6+</span>
            </div>
          </router-link>

          <router-link to="/webcomponents" class="implementation-card">
            <div class="implementation-icon">🔷</div>
            <h3>Web Components</h3>
            <p>使用Lit框架创建可复用的Web Components，展示现代组件化开发</p>
            <div class="implementation-tags">
              <span class="tag">Lit</span>
              <span class="tag">Web Components</span>
              <span class="tag">Shadow DOM</span>
            </div>
          </router-link>

          <router-link to="/vue" class="implementation-card">
            <div class="implementation-icon">🟢</div>
            <h3>Vue组件</h3>
            <p>使用Vue 3组合式API和@ldesign/form hooks，展示响应式框架开发</p>
            <div class="implementation-tags">
              <span class="tag">Vue 3</span>
              <span class="tag">Composition API</span>
              <span class="tag">Hooks</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 技术栈信息 -->
    <section class="tech-stack">
      <div class="tech-stack-container">
        <h2 class="tech-stack-title">技术栈</h2>
        <div class="tech-list">
          <div class="tech-item">
            <strong>构建工具：</strong>Vite 5.0+
          </div>
          <div class="tech-item">
            <strong>开发语言：</strong>TypeScript 5.3+
          </div>
          <div class="tech-item">
            <strong>包管理器：</strong>pnpm 8.0+
          </div>
          <div class="tech-item">
            <strong>设计系统：</strong>LDESIGN CSS Variables
          </div>
          <div class="tech-item">
            <strong>路由管理：</strong>Vue Router 4.2+
          </div>
          <div class="tech-item">
            <strong>组件库：</strong>Lit 3.1+ (Web Components)
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 首页不需要额外的逻辑
</script>

<style scoped>
.home {
  min-height: calc(100vh - 64px - 80px); /* 减去导航栏和页脚高度 */
}

/* 英雄区域 */
.hero {
  background: linear-gradient(135deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-brand-color-2) 100%);
  padding: var(--ls-padding-xxl) 0;
  text-align: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
}

.hero-title {
  font-size: var(--ls-font-size-h1);
  font-weight: 700;
  color: var(--ldesign-brand-color);
  margin: 0 0 var(--ls-margin-base) 0;
}

.hero-subtitle {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-margin-sm) 0;
  font-weight: 500;
}

.hero-description {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 功能特性区域 */
.features {
  padding: var(--ls-padding-xxl) 0;
  background: var(--ldesign-bg-color-container);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
}

.features-title {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  text-align: center;
  margin: 0 0 var(--ls-margin-xl) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-lg);
}

.feature-card {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ldesign-shadow-2);
  border-color: var(--ldesign-brand-color-focus);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--ls-margin-base);
}

.feature-card h3 {
  font-size: var(--ls-font-size-lg);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-margin-sm) 0;
}

.feature-card p {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 实现方式区域 */
.implementations {
  padding: var(--ls-padding-xxl) 0;
  background: var(--ldesign-bg-color-page);
}

.implementations-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
}

.implementations-title {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  text-align: center;
  margin: 0 0 var(--ls-margin-xl) 0;
}

.implementations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--ls-spacing-xl);
}

.implementation-card {
  background: var(--ldesign-bg-color-container);
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-xl);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: block;
}

.implementation-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--ldesign-shadow-3);
  border-color: var(--ldesign-brand-color);
}

.implementation-icon {
  font-size: 64px;
  margin-bottom: var(--ls-margin-base);
  text-align: center;
}

.implementation-card h3 {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-margin-sm) 0;
  text-align: center;
}

.implementation-card p {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  margin: 0 0 var(--ls-margin-base) 0;
  line-height: 1.6;
  text-align: center;
}

.implementation-tags {
  display: flex;
  justify-content: center;
  gap: var(--ls-spacing-xs);
  flex-wrap: wrap;
}

.tag {
  background: var(--ldesign-brand-color-focus);
  color: var(--ldesign-brand-color);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-xs);
  font-weight: 500;
}

/* 技术栈区域 */
.tech-stack {
  padding: var(--ls-padding-xxl) 0;
  background: var(--ldesign-bg-color-container);
}

.tech-stack-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
}

.tech-stack-title {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  text-align: center;
  margin: 0 0 var(--ls-margin-xl) 0;
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);
  max-width: 800px;
  margin: 0 auto;
}

.tech-item {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
}

.tech-item strong {
  color: var(--ldesign-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--ls-font-size-h3);
  }
  
  .hero-subtitle {
    font-size: var(--ls-font-size-lg);
  }
  
  .hero-description {
    font-size: var(--ls-font-size-sm);
  }
  
  .features-grid,
  .implementations-grid {
    grid-template-columns: 1fr;
  }
  
  .implementation-card {
    padding: var(--ls-padding-base);
  }
  
  .implementation-icon {
    font-size: 48px;
  }
}
</style>
