<template>
  <div class="app">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">
            <img src="/logo.svg" alt="">
          </span>
          <span v-show="!sidebarCollapsed" class="logo-text">LDesign UI</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <ChevronRight v-if="sidebarCollapsed" :size="16" />
          <ChevronLeft v-else :size="16" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <SidebarMenu :collapsed="sidebarCollapsed" />
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <button class="action-btn" title="刷新" @click="refreshPage">
              <RefreshCw :size="18" />
            </button>
            <ThemeSettings />
            <button class="action-btn" title="帮助">
              <HelpCircle :size="18" />
            </button>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 连接状态指示器 -->
    <div class="connection-status">
      <div class="status-item" :class="{ connected: wsConnected }">
        <span class="status-dot"></span>
        <span class="status-text">WS</span>
      </div>
      <div class="status-item" :class="{ connected: apiConnected }">
        <span class="status-dot"></span>
        <span class="status-text">API</span>
      </div>
    </div>

    <!-- 全局组件 -->
    <Message ref="messageRef" />
    <Confirm ref="confirmRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { RefreshCw, Settings, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import SidebarMenu from './components/SidebarMenu.vue'
import ThemeSettings from './components/ThemeSettings.vue'
import Message from './components/Message.vue'
import Confirm from './components/Confirm.vue'
import { useWebSocket } from './composables/useWebSocket'
import { useApi } from './composables/useApi'
import { useTheme } from './composables/useTheme'
import { setGlobalMessageInstance } from './composables/useMessage'
import { setGlobalConfirmInstance } from './composables/useConfirm'

// 响应式数据
const sidebarCollapsed = ref(false)
const route = useRoute()

// 连接状态
const { connected: wsConnected } = useWebSocket()
const apiConnected = ref(false)

// API 实例
const api = useApi()

// 主题
const { themeType } = useTheme()

// 全局组件引用
const messageRef = ref()
const confirmRef = ref()

// 检查API连接状态
const checkApiConnection = async () => {
  try {
    const response = await api.get('/api/health')
    apiConnected.value = response.success
  } catch (error) {
    apiConnected.value = false
  }
}

// 定期检查API连接状态
let apiCheckInterval: number | null = null

// 计算属性
const pageTitle = computed(() => {
  return route.meta?.title as string || '仪表盘'
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // 保存到本地存储
  localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed.value))
}

const refreshPage = () => {
  window.location.reload()
}

// 生命周期
onMounted(() => {
  // 设置全局组件实例
  if (messageRef.value) {
    setGlobalMessageInstance(messageRef.value)
  }
  if (confirmRef.value) {
    setGlobalConfirmInstance(confirmRef.value)
  }

  // 从本地存储恢复侧边栏状态
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }

  // 监听窗口大小变化
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize() // 初始检查

  // 开始检查API连接状态
  checkApiConnection()
  apiCheckInterval = window.setInterval(checkApiConnection, 5000) // 每5秒检查一次

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (apiCheckInterval) {
      clearInterval(apiCheckInterval)
    }
  })
})
</script>

<style lang="less" scoped>
.app {
  display: flex;
  height: 100vh;
  background-color: var(--ldesign-bg-color-page);
}

.sidebar {
  width: 240px;
  background-color: var(--ldesign-bg-color-container);
  border-right: 1px solid var(--ldesign-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ls-spacing-base);
  border-bottom: 1px solid var(--ldesign-border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--ldesign-text-color-primary);
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--ldesign-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
    color: var(--ldesign-text-color-primary);
  }
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--ls-spacing-base) 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background-color: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ls-spacing-base);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--ls-border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
  }
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--ls-spacing-base);
}

.connection-status {
  position: fixed;
  bottom: var(--ls-spacing-base);
  right: var(--ls-spacing-base);
  display: flex;
  gap: 8px;
  background-color: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--ls-border-radius-sm);
  font-size: 11px;
  font-weight: 500;
  color: var(--ldesign-text-color-secondary);
  transition: all 0.3s ease;

  &.connected {
    background-color: var(--ldesign-success-color-1);
    color: var(--ldesign-success-color-7);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--ldesign-gray-color-4);
    transition: background-color 0.3s ease;
  }

  &.connected .status-dot {
    background-color: var(--ldesign-success-color-5);
  }

  .status-text {
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
