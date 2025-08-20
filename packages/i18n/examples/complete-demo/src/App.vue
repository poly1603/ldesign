<!--
  主应用组件
  
  展示：
  - 导航栏
  - 语言切换
  - 路由视图
  - 开发工具面板
-->

<template>
  <div id="app" class="app">
    <!-- 导航栏 -->
    <header class="header">
      <nav class="nav">
        <div class="nav-brand">
          <h1 class="brand-title">{{ t('app.title') }}</h1>
          <span class="brand-subtitle">{{ t('app.subtitle') }}</span>
        </div>

        <ul class="nav-menu">
          <li v-for="route in navRoutes" :key="route.name" class="nav-item">
            <router-link 
              :to="route.path" 
              class="nav-link"
              :class="{ 'active': $route.name === route.name }"
            >
              {{ t(route.meta.title) }}
            </router-link>
          </li>
        </ul>

        <div class="nav-actions">
          <!-- 语言切换器 -->
          <LanguageSwitcher 
            variant="dropdown"
            size="medium"
            :show-flag="true"
            :show-code="false"
            name-display="native"
            theme="auto"
            @change="handleLanguageChange"
          />

          <!-- 开发工具切换 -->
          <button 
            v-if="isDev" 
            @click="toggleDevTools"
            class="dev-toggle"
            :class="{ 'active': showDevTools }"
          >
            <span class="dev-icon">🛠️</span>
            {{ showDevTools ? t('dev.hide') : t('dev.show') }}
          </button>
        </div>
      </nav>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <p>{{ t('footer.copyright', { year: currentYear }) }}</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/i18n" target="_blank">
            {{ t('footer.github') }}
          </a>
          <a href="https://ldesign.dev" target="_blank">
            {{ t('footer.website') }}
          </a>
        </div>
      </div>
    </footer>

    <!-- 开发工具面板 -->
    <DevToolsPanel v-if="isDev && showDevTools" @close="showDevTools = false" />

    <!-- 通知系统 -->
    <NotificationSystem ref="notifications" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n, LanguageSwitcher, useI18nDevTools } from '@ldesign/i18n/vue'
import { routes } from './router'
import DevToolsPanel from './components/DevToolsPanel.vue'
import NotificationSystem from './components/NotificationSystem.vue'

// 组合式API
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const devTools = useI18nDevTools()

// 响应式数据
const showDevTools = ref(false)
const notifications = ref()

// 计算属性
const isDev = computed(() => import.meta.env.DEV)
const currentYear = computed(() => new Date().getFullYear())

const navRoutes = computed(() => {
  return routes.filter(route => 
    route.name && 
    route.name !== 'NotFound' && 
    route.meta?.title
  )
})

// 方法
const handleLanguageChange = (locale: string) => {
  notifications.value?.add({
    type: 'success',
    title: t('notifications.languageChanged.title'),
    message: t('notifications.languageChanged.message', { locale }),
    duration: 3000,
  })
}

const toggleDevTools = () => {
  showDevTools.value = !showDevTools.value
}

// 监听路由变化，更新页面标题
watch(
  () => route.meta,
  (meta) => {
    if (meta?.title) {
      document.title = `${t(meta.title as string)} - ${t('app.title')}`
    }
  },
  { immediate: true }
)

// 监听语言变化，更新页面标题
watch(
  () => t('app.title'),
  () => {
    if (route.meta?.title) {
      document.title = `${t(route.meta.title as string)} - ${t('app.title')}`
    }
  }
)
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #f8f9fa;
}

/* 导航栏样式 */
.header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  flex-direction: column;
}

.brand-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #007acc;
}

.brand-subtitle {
  font-size: 0.8rem;
  color: #666;
  margin-top: -2px;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #007acc;
  border-bottom-color: #007acc;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dev-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dev-toggle:hover {
  background: #e9ecef;
}

.dev-toggle.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.dev-icon {
  font-size: 1rem;
}

/* 主要内容样式 */
.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 20px;
  width: 100%;
}

/* 页面过渡动画 */
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

/* 页脚样式 */
.footer {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #007acc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    height: auto;
    padding: 1rem 20px;
    gap: 1rem;
  }

  .nav-menu {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-actions {
    order: -1;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .main {
    padding: 1rem 20px;
  }
}
</style>
