<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-icon">📝</span>
          <span v-if="!sidebarCollapsed" class="logo-text">LDesign Form</span>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          {{ sidebarCollapsed ? '☰' : '✕' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- 首页 -->
        <div class="nav-item" :class="{ active: currentRoute === '/' }" @click="navigateTo('/')">
          <span class="nav-icon">🏠</span>
          <span v-if="!sidebarCollapsed" class="nav-text">首页</span>
        </div>

        <!-- 分类导航 -->
        <div v-for="(routes, category) in routesByCategory" :key="category" class="nav-category">
          <div v-if="!sidebarCollapsed" class="nav-category-title">{{ category }}</div>
          <div
            v-for="route in routes"
            :key="route.path"
            class="nav-item"
            :class="{ active: currentRoute === route.path }"
            @click="navigateTo(route.path)"
          >
            <span class="nav-icon">{{ route.icon }}</span>
            <span v-if="!sidebarCollapsed" class="nav-text">{{ route.title }}</span>
          </div>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 顶部栏 -->
      <header class="app-header">
        <div class="header-title">
          <h1>{{ currentPageTitle }}</h1>
          <p>{{ currentPageDescription }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-icon" @click="toggleTheme" :title="isDark ? '切换到浅色' : '切换到深色'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <a href="https://github.com/ldesign/form" target="_blank" class="btn-icon" title="GitHub">
            💻
          </a>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="app-content">
        <transition name="fade" mode="out-in">
          <component :is="currentComponent" :key="currentRoute" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef } from 'vue'
import { routes, currentRoute, navigateTo as navigate, getRoutesByCategory, getRouteByPath, initRouter } from './router'

// 导入页面组件
import HomePage from './pages/HomePage.vue'
import AllFieldsDemo from './pages/AllFieldsDemo.vue'
import ValidationDemo from './pages/ValidationDemo.vue'
import UserProfileDemo from './pages/UserProfileDemo.vue'
import ProductFormDemo from './pages/ProductFormDemo.vue'
import ArrayFieldsDemo from './pages/ArrayFieldsDemo.vue'
import ConditionalFieldsDemo from './pages/ConditionalFieldsDemo.vue'
import FormGroupDemo from './pages/FormGroupDemo.vue'
import SurveyDemo from './pages/SurveyDemo.vue'
import SettingsDemo from './pages/SettingsDemo.vue'
import LayoutDemo from './pages/LayoutDemo.vue'
import ThemeDemo from './pages/ThemeDemo.vue'

const componentMap = {
  '/': HomePage,
  '/all-fields': AllFieldsDemo,
  '/validation': ValidationDemo,
  '/user-profile': UserProfileDemo,
  '/product-form': ProductFormDemo,
  '/array-fields': ArrayFieldsDemo,
  '/conditional-fields': ConditionalFieldsDemo,
  '/form-group': FormGroupDemo,
  '/survey': SurveyDemo,
  '/settings': SettingsDemo,
  '/layout': LayoutDemo,
  '/theme': ThemeDemo
}

const sidebarCollapsed = ref(false)
const isDark = ref(false)

const routesByCategory = computed(() => getRoutesByCategory())

const currentComponent = shallowRef(HomePage)

const currentPageTitle = computed(() => {
  const route = getRouteByPath(currentRoute.value)
  return route?.title || 'LDesign Form'
})

const currentPageDescription = computed(() => {
  const descriptions = {
    '/': '功能完整的企业级表单解决方案',
    '/all-fields': '展示所有13个字段组件的功能和用法',
    '/validation': '展示所有22个验证规则的使用示例',
    '/user-profile': '用户资料管理表单，包含动态数组和级联选择',
    '/product-form': '电商商品编辑表单，包含多图上传和规格管理',
    '/array-fields': '动态数组字段：联系人、工作经历、教育背景',
    '/conditional-fields': '根据字段值动态显示/隐藏其他字段',
    '/form-group': '表单分组折叠展开功能',
    '/survey': '问卷调查表单，包含多种题型和进度跟踪',
    '/settings': '应用设置页面，演示即时保存和分类导航',
    '/layout': '展示单列、多列、响应式等布局方式',
    '/theme': '主题颜色、尺寸、圆角等样式定制'
  }
  return descriptions[currentRoute.value] || ''
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

const navigateTo = (path) => {
  navigate(path)
  // 更新当前组件
  currentComponent.value = componentMap[path] || HomePage
}

// 监听路由变化
import { watch } from 'vue'
watch(currentRoute, (newRoute) => {
  currentComponent.value = componentMap[newRoute] || HomePage
})

onMounted(() => {
  initRouter()
  currentComponent.value = componentMap[currentRoute.value] || HomePage
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.app-sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  transition: width 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-collapsed .app-sidebar {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #722ED1;
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.sidebar-toggle:hover {
  background: #f5f5f5;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-category {
  margin-bottom: 8px;
}

.nav-category-title {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(0, 0, 0, 0.65);
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #722ED1;
}

.nav-item.active {
  background: rgba(114, 46, 209, 0.05);
  color: #722ED1;
  border-left-color: #722ED1;
  font-weight: 500;
}

.nav-icon {
  font-size: 20px;
  min-width: 20px;
}

.nav-text {
  font-size: 14px;
}

.app-main {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s;
}

.sidebar-collapsed .app-main {
  margin-left: 60px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.header-title h1 {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.header-title p {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-icon:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.app-content {
  padding: 32px;
  min-height: calc(100vh - 100px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
.app-sidebar::-webkit-scrollbar {
  width: 6px;
}

.app-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.app-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 深色主题 */
[data-theme="dark"] {
  --bg-color: #1f1f1f;
  --card-bg: #2a2a2a;
  --text-color: rgba(255, 255, 255, 0.85);
  --border-color: #434343;
}

[data-theme="dark"] .app-container {
  background: var(--bg-color);
}

[data-theme="dark"] .app-sidebar,
[data-theme="dark"] .app-header {
  background: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

[data-theme="dark"] .header-title h1,
[data-theme="dark"] .nav-item {
  color: var(--text-color);
}

[data-theme="dark"] .nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .nav-item.active {
  background: rgba(114, 46, 209, 0.15);
}
</style>
