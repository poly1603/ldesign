<template>
  <div id="app">
    <header class="app-header">
      <div class="header-top">
        <div class="header-content">
          <h1>🚀 Engine Router Demo</h1>
          <p>演示Engine与Router + I18n的集成使用</p>
        </div>
        <div class="language-switcher">
          <LanguageSwitcher />
        </div>
      </div>
    </header>

    <nav class="app-nav">
      <RouterLink to="/" class="nav-link">{{ $t('nav.home') }}</RouterLink>
      <RouterLink to="/about" class="nav-link">{{ $t('nav.about') }}</RouterLink>
      <RouterLink to="/features" class="nav-link">{{ $t('nav.features') }}</RouterLink>
      <RouterLink to="/config" class="nav-link">{{ $t('nav.config') }}</RouterLink>
    </nav>

    <main class="app-main">
      <RouterView transition="fade" />
    </main>

    <footer class="app-footer">
      <p>Powered by @ldesign/engine + @ldesign/router</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { LanguageSwitcher } from '@ldesign/i18n'

// RouterLink和RouterView组件由Engine Router插件自动注册，无需手动导入
// LanguageSwitcher组件从@ldesign/i18n导入
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  text-align: left;
}

.language-switcher {
  display: flex;
  align-items: center;
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
}

.app-header p {
  margin: 0;
  opacity: 0.9;
}

.app-nav {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  border-bottom: 1px solid #e9ecef;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #495057;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #e9ecef;
  color: #212529;
}

.nav-link.router-link-active {
  background: #007bff;
  color: white;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
}

.app-footer p {
  margin: 0;
}

/* 为路由内容添加最小高度，避免布局跳动 */
.app-main {
  min-height: 400px;
}

/* RouterView内置动画的CSS样式 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
