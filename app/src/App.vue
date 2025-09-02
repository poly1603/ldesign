<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>{{ t('demo.welcome') }}</h1>
        </div>
        <div class="nav-links">
          <router-link
            to="/"
            class="nav-link"
            active-class="active"
            exact-active-class="active"
          >
            {{ t('nav.home') }}
          </router-link>
          <router-link
            to="/login"
            class="nav-link"
            active-class="active"
          >
            {{ t('user.login') }}
          </router-link>
        </div>
        <div class="nav-actions">
          <!-- 语言切换器 -->
          <LanguageSwitcher
            mode="dropdown"
            @change="onLanguageChange"
            class="language-switcher-nav"
          />
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 {{ t('page.home.title') }} - {{ t('demo.description') }}</p>
        <div class="footer-info">
          <span>{{ t('language.current') }}: {{ getCurrentLanguageName() }}</span>
          <span class="separator">|</span>
          <span>{{ t('theme.title') }}: {{ t('theme.light') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 应用根组件
 * 提供应用的基本布局和导航结构
 * 使用 @ldesign/router 的路由系统和 @ldesign/i18n 的国际化功能
 */

import { computed } from 'vue'
import { useI18n } from '@ldesign/i18n'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { supportedLocales, languageManager } from './i18n'

// 使用国际化
const { t } = useI18n()

// 获取当前语言名称
const getCurrentLanguageName = computed(() => {
  const currentLocale = languageManager.getLocale()
  const locale = supportedLocales.find(l => l.code === currentLocale)
  return locale?.name || currentLocale
})

// 语言切换事件处理
const onLanguageChange = (newLocale: string, oldLocale: string) => {
  console.log(`🌐 语言已切换: ${oldLocale} → ${newLocale}`)

  // 可以在这里添加其他语言切换后的逻辑
  // 比如重新加载某些数据、更新页面标题等

  // 更新页面标题
  document.title = t('page.home.title')
}

console.log('🎉 App.vue 组件已加载')
console.log('🚀 使用 @ldesign/router 路由系统')
console.log('🌐 使用 @ldesign/i18n 国际化系统')
console.log('🔧 展示优化后的 LDesign Engine + Router + I18n 集成')
console.log(`📍 当前语言: ${languageManager.getLocale()}`)
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.app-nav {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switcher-nav {
  /* 导航栏中的语言切换器样式 */
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background: #3498db;
  color: white;
}

/* 主内容区域 */
.app-main {
  flex: 1;
}

/* 底部样式 */
.app-footer {
  background: #34495e;
  color: white;
  padding: 1rem 0;
  text-align: center;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-info {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.separator {
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-actions {
    order: -1; /* 在移动端将语言切换器放到顶部 */
  }

  .footer-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .separator {
    display: none; /* 在移动端隐藏分隔符 */
  }

  .nav-container,
  .footer-container {
    padding: 0 1rem;
  }
}
</style>
