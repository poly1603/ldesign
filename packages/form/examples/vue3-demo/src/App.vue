<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>LDesign Form</h1>
          <span class="nav-subtitle">Vue 3 示例</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/basic" class="nav-link">基础表单</router-link>
          <router-link to="/query" class="nav-link">查询表单</router-link>
          <router-link to="/complex" class="nav-link">复杂表单</router-link>
          <router-link to="/hooks" class="nav-link">Hooks 用法</router-link>
          <router-link to="/custom" class="nav-link">自定义组件</router-link>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2024 LDesign Team. All rights reserved.</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/form" target="_blank">GitHub</a>
          <a href="https://ldesign.dev/form" target="_blank">文档</a>
          <a href="https://ldesign.dev" target="_blank">官网</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加全局逻辑
</script>

<style scoped>
.navbar {
  background: var(--ldesign-bg-color-component);
  border-bottom: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand h1 {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-brand-color-7);
  margin: 0;
  font-weight: 600;
}

.nav-subtitle {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  margin-left: var(--ls-spacing-sm);
}

.nav-links {
  display: flex;
  gap: var(--ls-spacing-lg);
}

.nav-link {
  color: var(--ldesign-text-color-primary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: var(--ldesign-brand-color-1);
  color: var(--ldesign-brand-color-7);
}

.nav-link.router-link-active {
  background: var(--ldesign-brand-color-6);
  color: white;
}

.main-content {
  min-height: calc(100vh - 64px - 80px);
  padding: var(--ls-spacing-xl) 0;
}

.footer {
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);
  padding: var(--ls-spacing-lg) 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ldesign-text-color-secondary);
}

.footer-links {
  display: flex;
  gap: var(--ls-spacing-base);
}

.footer-links a {
  color: var(--ldesign-brand-color-6);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--ldesign-brand-color-7);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: var(--ls-spacing-base);
    gap: var(--ls-spacing-base);
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .footer-container {
    flex-direction: column;
    gap: var(--ls-spacing-sm);
    text-align: center;
  }
}
</style>
