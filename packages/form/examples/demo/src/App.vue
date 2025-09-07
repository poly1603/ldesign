<template>
  <div class="app">
    <!-- 全局导航栏 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <h1>@ldesign/form</h1>
            <span class="brand-subtitle">演示项目</span>
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link 
            v-for="route in navRoutes" 
            :key="route.path"
            :to="route.path"
            class="nav-link"
            :class="{ active: $route.path === route.path }"
          >
            {{ route.meta?.title }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 LDESIGN Team. All rights reserved.</p>
        <p>展示 @ldesign/form 的多种实现方式</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from './router'

const route = useRoute()

// 过滤出需要在导航中显示的路由
const navRoutes = computed(() => {
  return routes.filter(r => r.name !== 'NotFound' && r.path !== '/')
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.app-nav {
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  text-decoration: none;
  color: var(--ldesign-text-color-primary);
}

.nav-brand h1 {
  font-size: var(--ls-font-size-lg);
  font-weight: 600;
  color: var(--ldesign-brand-color);
  margin: 0;
}

.brand-subtitle {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  font-weight: 400;
}

.nav-menu {
  display: flex;
  gap: var(--ls-spacing-base);
}

.nav-link {
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  border-radius: var(--ls-border-radius-base);
  text-decoration: none;
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--ldesign-brand-color);
  background: var(--ldesign-brand-color-focus);
}

.nav-link.active {
  color: var(--ldesign-brand-color);
  background: var(--ldesign-brand-color-focus);
}

/* 主内容区域 */
.app-main {
  flex: 1;
  background: var(--ldesign-bg-color-page);
}

/* 页脚样式 */
.app-footer {
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);
  padding: var(--ls-padding-base) 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
  text-align: center;
}

.footer-container p {
  margin: 0;
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}

.footer-container p:first-child {
  margin-bottom: var(--ls-margin-xs);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 var(--ls-padding-sm);
    height: 56px;
  }
  
  .nav-brand h1 {
    font-size: var(--ls-font-size-base);
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .nav-menu {
    gap: var(--ls-spacing-sm);
  }
  
  .nav-link {
    padding: var(--ls-padding-xs);
    font-size: var(--ls-font-size-xs);
  }
}
</style>
