<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ t('dashboard.title') }}</h1>
      <p class="dashboard-subtitle">{{ t('dashboard.subtitle', { username }) }}</p>
    </div>
    
    <div class="dashboard-grid">
      <!-- 路由信息卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title">📍 {{ t('dashboard.currentRoute') || '当前路由信息' }}</h3>
        <div class="card-content">
          <div class="info-row">
            <span class="info-label">{{ t('common.path') || '路径' }}：</span>
            <span class="info-value">{{ route.path }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('common.name') || '名称' }}：</span>
            <span class="info-value">{{ route.name || `(${t('common.unnamed') || '未命名'})` }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('common.params') || '参数' }}：</span>
            <span class="info-value">{{ JSON.stringify(route.params) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('common.query') || '查询' }}：</span>
            <span class="info-value">{{ JSON.stringify(route.query) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Engine 状态卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title">⚙️ {{ t('dashboard.engineStatus') || 'Engine 状态' }}</h3>
        <div class="card-content">
          <div class="info-row">
            <span class="info-label">{{ t('dashboard.appName') || '应用名称' }}：</span>
            <span class="info-value">{{ engineInfo.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('about.version') }}：</span>
            <span class="info-value">{{ engineInfo.version }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('dashboard.environment') || '环境' }}：</span>
            <span class="info-value">{{ engineInfo.environment }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('dashboard.debugMode') || '调试模式' }}：</span>
            <span class="info-value">{{ engineInfo.debug ? t('common.on') || '开启' : t('common.off') || '关闭' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 路由历史卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title">📜 {{ t('dashboard.routeHistory') || '路由历史' }}</h3>
        <div class="card-content">
          <div v-if="routeHistory.length === 0" class="empty-state">
            {{ t('dashboard.noHistory') || '暂无历史记录' }}
          </div>
          <div v-else class="history-list">
            <div v-for="(item, index) in routeHistory" :key="index" class="history-item">
              <span class="history-time">{{ item.time }}</span>
              <span class="history-path">{{ item.path }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 快速操作卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title">🚀 {{ t('dashboard.quickActions.title') }}</h3>
        <div class="card-content">
          <button @click="navigateTo('/')" class="action-button">
            🏠 {{ t('errors.404.action') }}
          </button>
          <button @click="navigateTo('/about')" class="action-button">
            ℹ️ {{ t('nav.about') }}
          </button>
          <button @click="refreshRoute" class="action-button">
            🔄 {{ t('common.refresh') }}
          </button>
          <button @click="clearHistory" class="action-button danger">
            🗑️ {{ t('common.clear') }} {{ t('dashboard.history') || '历史' }}
          </button>
        </div>
      </div>
      
      <!-- 性能监控卡片 -->
      <div class="dashboard-card wide">
        <h3 class="card-title">📊 {{ t('dashboard.performanceMonitor') || '性能监控' }}</h3>
        <div class="card-content">
          <div class="performance-grid">
            <div class="performance-item">
              <div class="performance-value">{{ performance.navigationTime }}ms</div>
              <div class="performance-label">{{ t('dashboard.navigationTime') || '导航时间' }}</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ performance.cacheHitRate }}%</div>
              <div class="performance-label">{{ t('dashboard.cacheHitRate') || '缓存命中率' }}</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ performance.totalNavigations }}</div>
              <div class="performance-label">{{ t('dashboard.totalNavigations') || '总导航次数' }}</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ performance.memoryUsage }}MB</div>
              <div class="performance-label">{{ t('dashboard.memoryUsage') || '内存使用' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 路由列表卡片 -->
      <div class="dashboard-card wide">
        <h3 class="card-title">📝 {{ t('dashboard.allRoutes') || '所有路由' }}</h3>
        <div class="card-content">
          <table class="route-table">
            <thead>
              <tr>
                <th>{{ t('common.path') || '路径' }}</th>
                <th>{{ t('common.name') || '名称' }}</th>
                <th>{{ t('dashboard.auth') || '认证' }}</th>
                <th>{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in allRoutes" :key="route.path">
                <td>{{ route.path }}</td>
                <td>{{ route.name || '-' }}</td>
                <td>
                  <span v-if="route.meta?.requiresAuth" class="badge badge-warning">
                    {{ t('dashboard.requiresAuth') || '需要认证' }}
                  </span>
                  <span v-else class="badge badge-success">
                    {{ t('dashboard.public') || '公开' }}
                  </span>
                </td>
                <td>
                  <button @click="navigateTo(route.path)" class="link-button">
                    {{ t('common.visit') || '访问' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 用户信息
const username = ref('')

// Engine 信息
const engineInfo = ref({
  name: t('app.name'),
  version: '1.0.0',
  environment: 'development',
  debug: true
})

// 路由历史
const routeHistory = ref<Array<{ path: string; time: string }>>([])

// 性能数据
const performance = ref({
  navigationTime: 0,
  cacheHitRate: 0,
  totalNavigations: 0,
  memoryUsage: 0
})

// 所有路由
const allRoutes = ref<any[]>([])

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 刷新路由
const refreshRoute = () => {
  router.go(0)
}

// 清除历史
const clearHistory = () => {
  routeHistory.value = []
  localStorage.removeItem('routeHistory')
}

// 更新路由历史
const updateHistory = () => {
  const now = new Date()
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  
  routeHistory.value.unshift({
    path: route.path,
    time: timeStr
  })
  
  // 只保留最近10条记录
  if (routeHistory.value.length > 10) {
    routeHistory.value = routeHistory.value.slice(0, 10)
  }
  
  // 保存到 localStorage
  localStorage.setItem('routeHistory', JSON.stringify(routeHistory.value))
}

// 更新性能数据
const updatePerformance = () => {
  // 模拟性能数据
  performance.value = {
    navigationTime: Math.round(Math.random() * 100 + 50),
    cacheHitRate: Math.round(Math.random() * 30 + 70),
    totalNavigations: parseInt(localStorage.getItem('totalNavigations') || '0'),
    memoryUsage: Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024)
  }
}

// 性能监控定时器
let performanceTimer: any = null

onMounted(() => {
// 获取用户信息
  username.value = localStorage.getItem('username') || t('common.guest')
  
  // 获取 Engine 信息
  const engine = (window as any).__ENGINE__
  if (engine?.config) {
    engineInfo.value = {
      name: engine.config.name || engineInfo.value.name,
      version: engine.config.version || engineInfo.value.version,
      environment: engine.config.environment || engineInfo.value.environment,
      debug: engine.config.debug ?? engineInfo.value.debug
    }
  }
  
  // 加载路由历史
  const savedHistory = localStorage.getItem('routeHistory')
  if (savedHistory) {
    try {
      routeHistory.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error(t('dashboard.errors.loadHistory'))
    }
  }
  
  // 获取所有路由
  allRoutes.value = router.getRoutes()
  
  // 更新当前路由历史
  updateHistory()
  
  // 更新性能数据
  updatePerformance()
  
  // 定时更新性能数据
  performanceTimer = setInterval(updatePerformance, 3000)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-title {
  font-size: 36px;
  color: var(--ld-color-gray-800, #2c3e50);
  margin: 0 0 10px 0;
}

.dashboard-subtitle {
  font-size: 18px;
  color: var(--ld-color-gray-600, #666);
  margin: 0;
}

/* 网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

/* 卡片样式 */
.dashboard-card {
  background: var(--ld-color-gray-50, white);
  border-radius: 12px;
  box-shadow: 0 5px 20px var(--ld-color-gray-200, rgba(0, 0, 0, 0.05));
  overflow: hidden;
}

.dashboard-card.wide {
  grid-column: span 2;
}

.card-title {
  font-size: 18px;
  color: var(--ld-color-gray-800, #2c3e50);
  margin: 0;
  padding: 20px;
  background: var(--ld-color-gray-50, #f8f9fa);
  border-bottom: 1px solid var(--ld-color-gray-300, #e0e0e0);
}

.card-content {
  padding: 20px;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--ld-color-gray-200, #f0f0f0);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--ld-color-gray-600, #666);
}

.info-value {
  color: var(--ld-color-gray-800, #2c3e50);
  font-family: monospace;
}

/* 历史列表 */
.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--ld-color-gray-200, #f0f0f0);
}

.history-time {
  color: var(--ld-color-gray-500, #999);
  font-size: 12px;
}

.history-path {
  color: var(--ld-color-gray-800, #2c3e50);
  font-family: monospace;
}

/* 操作按钮 */
.action-button {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: var(--ld-color-primary-500);
  color: var(--ld-color-gray-50, white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.action-button:hover {
  background: var(--ld-color-primary-600);
  transform: translateX(5px);
}

.action-button.danger {
  background: var(--ld-color-danger-500);
}

.action-button.danger:hover {
  background: var(--ld-color-danger-600);
}

/* 性能监控 */
.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.performance-item {
  text-align: center;
}

.performance-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--ld-color-primary-500);
}

.performance-label {
  font-size: 12px;
  color: var(--ld-color-gray-600, #666);
  margin-top: 5px;
  text-transform: uppercase;
}

/* 路由表格 */
.route-table {
  width: 100%;
  border-collapse: collapse;
}

.route-table th {
  text-align: left;
  padding: 10px;
  background: var(--ld-color-gray-50, #f8f9fa);
  border-bottom: 2px solid var(--ld-color-gray-300, #e0e0e0);
}

.route-table td {
  padding: 10px;
  border-bottom: 1px solid var(--ld-color-gray-200, #f0f0f0);
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: var(--ld-color-success-100);
  color: var(--ld-color-success-700);
}

.badge-warning {
  background: var(--ld-color-warning-100);
  color: var(--ld-color-warning-700);
}

.link-button {
  padding: 4px 12px;
  background: transparent;
  color: var(--ld-color-primary-500);
  border: 1px solid var(--ld-color-primary-500);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.link-button:hover {
  background: var(--ld-color-primary-500);
  color: var(--ld-color-gray-50, white);
}

.empty-state {
  text-align: center;
  color: var(--ld-color-gray-500, #999);
  padding: 20px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-card.wide {
    grid-column: span 1;
  }
}
</style>