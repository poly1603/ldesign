<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1>🚀 Vue3 Engine</h1>
          <p>强大的Vue3应用引擎演示平台</p>
        </div>
        <div class="engine-status">
          <span class="status-item">
            <strong>引擎状态:</strong> 
            <span :class="engineStatus.class">{{ engineStatus.text }}</span>
          </span>
          <span class="status-item">
            <strong>版本:</strong> {{ engine.config.version }}
          </span>
          <span class="status-item">
            <strong>调试模式:</strong> {{ engine.config.debug ? '开启' : '关闭' }}
          </span>
        </div>
      </div>
    </header>

    <nav class="app-navigation">
      <div class="nav-content">
        <button 
          v-for="page in pages" 
          :key="page.id"
          @click="navigateToPage(page.id)"
          class="nav-button"
          :class="{ active: currentPage === page.id }"
        >
          <span class="nav-icon">{{ page.icon }}</span>
          <span class="nav-label">{{ page.label }}</span>
        </button>
      </div>
    </nav>

    <main class="app-main">
      <div class="page-container">
        <!-- 主页 -->
        <Home v-if="currentPage === 'home'" @navigate="navigateToPage" />
        
        <!-- 插件演示页 -->
        <PluginDemo v-else-if="currentPage === 'plugin'" />
        
        <!-- 事件演示页 -->
        <EventDemo v-else-if="currentPage === 'event'" />
        
        <!-- 状态演示页 -->
        <StateDemo v-else-if="currentPage === 'state'" />
        
        <!-- 中间件演示页 -->
        <MiddlewareDemo v-else-if="currentPage === 'middleware'" />
        
        <!-- 日志演示页 -->
        <LoggerDemo v-else-if="currentPage === 'logger'" />
        
        <!-- 通知演示页 -->
        <NotificationDemo v-else-if="currentPage === 'notification'" />
        
        <!-- 404页面 -->
        <div v-else class="page-not-found">
          <h2>页面未找到</h2>
          <p>请选择一个有效的页面</p>
          <button @click="navigateToPage('home')" class="btn btn-primary">
            返回主页
          </button>
        </div>
      </div>
    </main>

    <!-- 实时日志显示 -->
    <aside class="app-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!sidebarCollapsed">📝 实时日志</h3>
        <button @click="toggleSidebar" class="sidebar-toggle">
          {{ sidebarCollapsed ? '📖' : '📕' }}
        </button>
      </div>
      <div v-if="!sidebarCollapsed" class="log-section">
        <div class="log-controls">
          <button @click="clearLogs" class="btn btn-sm btn-secondary">
            清空日志
          </button>
          <button @click="exportLogs" class="btn btn-sm btn-info">
            导出日志
          </button>
        </div>
        <div class="log-container" ref="logContainer">
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="empty-logs">
            暂无日志
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import type { Engine } from '@ldesign/engine'
import Home from './pages/Home.vue'
import PluginDemo from './pages/PluginDemo.vue'
import EventDemo from './pages/EventDemo.vue'
import StateDemo from './pages/StateDemo.vue'
import MiddlewareDemo from './pages/MiddlewareDemo.vue'
import LoggerDemo from './pages/LoggerDemo.vue'
import NotificationDemo from './pages/NotificationDemo.vue'

// 注入引擎实例
const engine = inject<Engine>('engine')!

// 响应式数据
const currentPage = ref('home')
const sidebarCollapsed = ref(false)
const logs = ref<any[]>([])

// 页面配置
const pages = ref([
  { id: 'home', label: '主页', icon: '🏠' },
  { id: 'plugin', label: '插件系统', icon: '🔌' },
  { id: 'event', label: '事件系统', icon: '📡' },
  { id: 'state', label: '状态管理', icon: '💾' },
  { id: 'middleware', label: '中间件', icon: '⚡' },
  { id: 'logger', label: '日志系统', icon: '📝' },
  { id: 'notification', label: '通知系统', icon: '🔔' }
])

// 计算属性
const engineStatus = computed(() => {
  const isRunning = engine && engine.config
  return {
    text: isRunning ? '运行中' : '未启动',
    class: isRunning ? 'status-running' : 'status-stopped'
  }
})

// 方法
const navigateToPage = (pageId: string) => {
  currentPage.value = pageId
  engine.logger.info(`导航到页面: ${pageId}`)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const clearLogs = () => {
  engine.logger.clear()
  logs.value = []
  engine.notifications.show({
    type: 'info',
    title: '信息',
    message: '日志已清空',
    duration: 3000
  })
}

const exportLogs = () => {
  const logData = logs.value.map(log => 
    `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
  ).join('\n')
  
  const blob = new Blob([logData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `engine-logs-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  engine.notifications.show({
    type: 'success',
    title: '成功',
    message: '日志已导出',
    duration: 3000
  })
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const updateLogs = () => {
  const engineLogs = engine.logger.getLogs()
  logs.value = engineLogs.slice(-50) // 只显示最近50条
}

// 生命周期
onMounted(() => {
  // 监听日志更新
  const logInterval = setInterval(updateLogs, 1000)
  
  // 监听页面导航事件
  engine.events.on('app:navigate', (data) => {
    navigateToPage(data.page)
  })
  
  // 记录初始日志
  engine.logger.info('Vue3 Engine 多页面应用已启动')
  engine.logger.info('引擎配置:', engine.config)
  engine.logger.info('可用页面:', pages.value.map(p => p.label).join(', '))
  
  // 清理函数
  return () => {
    clearInterval(logInterval)
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部样式 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-section h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.logo-section p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.engine-status {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.status-item {
  font-size: 0.875rem;
}

.status-running {
  color: #10b981;
  font-weight: 600;
}

.status-stopped {
  color: #ef4444;
  font-weight: 600;
}

/* 导航样式 */
.app-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
  overflow-x: auto;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}

.nav-button:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.nav-icon {
  font-size: 1.125rem;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-not-found h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.page-not-found p {
  margin: 0 0 2rem 0;
  color: #6b7280;
}

/* 侧边栏样式 */
.app-sidebar {
  width: 350px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.app-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #374151;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.sidebar-toggle:hover {
  background: #f3f4f6;
}

.log-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-controls {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #1f2937;
}

.log-entry {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
}

.log-time {
  color: #9ca3af;
  min-width: 60px;
}

.log-level {
  min-width: 50px;
  font-weight: 600;
}

.log-message {
  flex: 1;
}

.log-info {
  background: rgba(96, 165, 250, 0.1);
}

.log-info .log-level {
  color: #60a5fa;
}

.log-info .log-message {
  color: #bfdbfe;
}

.log-success {
  background: rgba(52, 211, 153, 0.1);
}

.log-success .log-level {
  color: #34d399;
}

.log-success .log-message {
  color: #a7f3d0;
}

.log-warning {
  background: rgba(251, 191, 36, 0.1);
}

.log-warning .log-level {
  color: #fbbf24;
}

.log-warning .log-message {
  color: #fde68a;
}

.log-error {
  background: rgba(248, 113, 113, 0.1);
}

.log-error .log-level {
  color: #f87171;
}

.log-error .log-message {
  color: #fecaca;
}

.log-debug {
  background: rgba(167, 139, 250, 0.1);
}

.log-debug .log-level {
  color: #a78bfa;
}

.log-debug .log-message {
  color: #ddd6fe;
}

.empty-logs {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-info:hover {
  background: #0891b2;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main {
    flex-direction: column;
  }
  
  .app-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    max-height: 300px;
  }
  
  .app-sidebar.collapsed {
    width: 100%;
    max-height: 60px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .engine-status {
    justify-content: center;
  }
  
  .nav-content {
    padding: 0 1rem;
  }
  
  .page-container {
    padding: 1rem;
  }
  
  .app-sidebar {
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0;
  }
  
  .logo-section h1 {
    font-size: 1.5rem;
  }
  
  .engine-status {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-button {
    padding: 0.75rem 1rem;
  }
  
  .nav-label {
    display: none;
  }
}
</style>