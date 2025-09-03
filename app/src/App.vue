<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>{{ t('demo.welcome') }}</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active" exact-active-class="active">
            首页
          </router-link>
          <router-link to="/packages" class="nav-link" active-class="active">
            包测试
          </router-link>
          <router-link to="/login" class="nav-link" active-class="active">
            登录
          </router-link>
        </div>
        <div class="app-controls">
          <ThemeSelector mode="select" :show-preview="true" :custom-themes="customThemes"
            :disabled-builtin-themes="disabledBuiltinThemes" placeholder="选择主题" />
          <DarkModeToggle />
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

import { ref } from 'vue'
import { ThemeSelector, DarkModeToggle } from '@ldesign/color'
import type { ThemeConfig } from '@ldesign/color'

// 导入国际化相关功能
const t = (key: string) => key // 临时的翻译函数
const getCurrentLanguageName = () => 'Chinese' // 临时的语言名称函数

// 自定义主题配置
const customThemes = ref<ThemeConfig[]>([
  {
    name: 'custom-brand',
    displayName: '品牌主题',
    description: '公司品牌色主题',
    builtin: false,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  },
  {
    name: 'custom-ocean',
    displayName: '海洋主题',
    description: '深海蓝色主题',
    builtin: false,
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626'
    }
  }
])

// 禁用的内置主题列表（示例：禁用红色和粉色主题）
const disabledBuiltinThemes = ref<string[]>(['red', 'pink'])

console.log('🎉 App.vue 组件已加载')
console.log('🚀 使用 @ldesign/router 路由系统')
console.log('🌐 使用 @ldesign/i18n 国际化系统')
console.log('🔧 展示优化后的 LDesign Engine + Router + I18n 集成')
console.log('🎨 使用 @ldesign/color 主题管理系统')
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/*
 * 使用 @ldesign/color 生成的CSS变量
 * 这些变量由主题管理器动态注入到 #ldesign-color-variables style标签中
 * 这里定义的是语义化映射，将业务语义映射到设计系统变量
 */
:root {
  /* 文本颜色 - 映射到 @ldesign/color 变量 */
  --color-text: var(--ldesign-text-color, var(--ldesign-font-gray-4, #1f2937));
  --color-text-secondary: var(--ldesign-text-color-secondary, var(--ldesign-font-gray-3, #6b7280));
  --color-text-muted: var(--ldesign-text-color-placeholder, var(--ldesign-font-gray-2, #9ca3af));

  /* 背景颜色 - 映射到 @ldesign/color 变量 */
  --color-bg: var(--ldesign-bg-color-page, #ffffff);
  --color-bg-secondary: var(--ldesign-bg-color-container, #f8f9fa);
  --color-bg-tertiary: var(--ldesign-bg-color-component, #f1f3f4);

  /* 边框和阴影 - 映射到 @ldesign/color 变量 */
  --color-border: var(--ldesign-border-color, var(--ldesign-border-level-1-color, #e5e7eb));
  --color-shadow: var(--ldesign-shadow-1, rgba(0, 0, 0, 0.1));

  /* 功能色 - 映射到 @ldesign/color 变量 */
  --color-primary: var(--ldesign-brand-color, #1677ff);
  --color-secondary: var(--ldesign-brand-color-6, #0062eb);
  --color-success: var(--ldesign-success-color, #52c41a);
  --color-warning: var(--ldesign-warning-color, #faad14);
  --color-danger: var(--ldesign-danger-color, #ff4d4f);

  /* 主题色阶 - 直接使用 @ldesign/color 生成的色阶 */
  --color-primary-light: var(--ldesign-brand-color-3, #66a6ff);
  --color-primary-lighter: var(--ldesign-brand-color-1, #b8d5ff);
  --color-primary-dark: var(--ldesign-brand-color-8, #004099);
  --color-primary-darker: var(--ldesign-brand-color-10, #001e47);

  /* 交互状态色 */
  --color-primary-hover: var(--ldesign-brand-color-hover, var(--ldesign-brand-color-5, #4096ff));
  --color-primary-active: var(--ldesign-brand-color-active, var(--ldesign-brand-color-7, #0050b3));
  --color-primary-focus: var(--ldesign-brand-color-focus, var(--ldesign-brand-color-4, #69b1ff));
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 - 使用主题色阶 */
.app-nav {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-bg);
  padding: 1rem 0;
  box-shadow: 0 2px 8px var(--color-shadow);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
  color: var(--color-bg);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-block;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--color-primary-lighter);
  color: var(--color-primary-darker);
  transform: translateY(-1px);
}

.nav-link.active {
  background: var(--color-bg);
  color: var(--color-primary);
  box-shadow: 0 2px 4px var(--color-shadow);
}

/* 主内容区域 */
.app-main {
  flex: 1;
  background-color: var(--color-bg);
  transition: all 0.3s ease;
  min-height: calc(100vh - 200px);
}

/* 底部样式 */
.app-footer {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  color: var(--color-text-secondary);
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid var(--color-border);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 控制组件样式 */
.app-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-controls>* {
  flex-shrink: 0;
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

  .nav-container,
  .footer-container {
    padding: 0 1rem;
  }
}
</style>
