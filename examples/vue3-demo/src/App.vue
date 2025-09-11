<!--
  主应用组件
-->

<template>
  <div id="app" class="app">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>📊 LDesign Chart</h1>
          <span class="version">Vue3 示例</span>
        </div>
        
        <nav class="nav">
          <router-link 
            v-for="route in mainRoutes" 
            :key="route.path"
            :to="route.path"
            class="nav-link"
            active-class="nav-link--active"
          >
            {{ route.meta?.title }}
          </router-link>
        </nav>
        
        <div class="header-actions">
          <button 
            class="theme-toggle"
            @click="toggleTheme"
            :title="`切换到${currentTheme === 'light' ? '深色' : '浅色'}主题`"
          >
            {{ currentTheme === 'light' ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>
          © 2024 LDesign Chart - 基于 
          <a href="https://echarts.apache.org/" target="_blank">ECharts</a> 
          的 Vue3 图表组件库
        </p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/chart" target="_blank">GitHub</a>
          <a href="/docs" target="_blank">文档</a>
          <a href="/examples" target="_blank">更多示例</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 路由相关
 */
const router = useRouter()

// 主要路由（用于导航显示）
const mainRoutes = computed(() => {
  return router.getRoutes().filter(route => 
    route.meta?.showInNav && !route.meta?.hidden
  )
})

/**
 * 主题切换
 */
const currentTheme = ref<'light' | 'dark'>('light')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  
  // 更新 HTML 根元素的主题类
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  
  // 保存到本地存储
  localStorage.setItem('chart-theme', currentTheme.value)
}

/**
 * 生命周期
 */
onMounted(() => {
  // 从本地存储恢复主题
  const savedTheme = localStorage.getItem('chart-theme') as 'light' | 'dark'
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})
</script>

<style lang="less">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--ldesign-bg-color-page);
  color: var(--ldesign-text-color-primary);
}

.app-header {
  background-color: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--ldesign-shadow-1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--ls-padding-base);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    h1 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-brand-color);
    }

    .version {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
      background-color: var(--ldesign-brand-color-1);
      padding: 2px 8px;
      border-radius: var(--ls-border-radius-sm);
    }
  }

  .nav {
    display: flex;
    gap: var(--ls-spacing-base);

    .nav-link {
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      border-radius: var(--ls-border-radius-base);
      text-decoration: none;
      color: var(--ldesign-text-color-secondary);
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        color: var(--ldesign-brand-color);
        background-color: var(--ldesign-brand-color-1);
      }

      &--active {
        color: var(--ldesign-brand-color);
        background-color: var(--ldesign-brand-color-2);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    .theme-toggle {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: var(--ls-border-radius-base);
      background-color: var(--ldesign-bg-color-component);
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--ldesign-bg-color-component-hover);
        transform: scale(1.05);
      }
    }
  }
}

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-padding-lg);
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  background-color: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);
  margin-top: auto;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--ls-padding-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ls-spacing-base);

    p {
      margin: 0;
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);

      a {
        color: var(--ldesign-brand-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .footer-links {
      display: flex;
      gap: var(--ls-spacing-base);

      a {
        color: var(--ldesign-text-color-secondary);
        text-decoration: none;
        font-size: var(--ls-font-size-sm);

        &:hover {
          color: var(--ldesign-brand-color);
        }
      }
    }
  }
}

// 页面切换动画
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    .header-content {
      flex-direction: column;
      height: auto;
      padding: var(--ls-padding-base);
      gap: var(--ls-spacing-base);
    }

    .nav {
      order: 3;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .app-main {
    padding: var(--ls-padding-base);
  }

  .app-footer {
    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }
}
</style>
