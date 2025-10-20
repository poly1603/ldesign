<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ t('dashboard.title') }}</h1>
      <p class="dashboard-subtitle">{{ t('dashboard.subtitle', { username }) }}</p>
    </div>
    
    <div class="dashboard-grid">
      <!-- 路由信息卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title"><MapPin class="icon" /> {{ t('dashboard.currentRoute') || '当前路由信息' }}</h3>
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
        <h3 class="card-title"><Settings class="icon" /> {{ t('dashboard.engineStatus') || 'Engine 状态' }}</h3>
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
        <h3 class="card-title"><ScrollText class="icon" /> {{ t('dashboard.routeHistory') || '路由历史' }}</h3>
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
        <h3 class="card-title"><Rocket class="icon" /> {{ t('dashboard.quickActions.title') }}</h3>
        <div class="card-content">
          <button @click="navigateTo('/')" class="action-button">
            <Home class="button-icon" /> {{ t('errors.404.action') }}
          </button>
          <button @click="navigateTo('/about')" class="action-button">
            <Info class="button-icon" /> {{ t('nav.about') }}
          </button>
          <button @click="refreshRoute" class="action-button">
            <RefreshCw class="button-icon" /> {{ t('common.refresh') }}
          </button>
          <button @click="clearHistory" class="action-button danger">
            <Trash2 class="button-icon" /> {{ t('common.clear') }} {{ t('dashboard.history') || '历史' }}
          </button>
        </div>
      </div>
      
      <!-- 性能监控卡片 -->
      <div class="dashboard-card wide">
        <h3 class="card-title"><BarChart3 class="icon" /> {{ t('dashboard.performanceMonitor') || '性能监控' }}</h3>
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
      
      <!-- 缓存统计卡片 -->
      <div class="dashboard-card">
        <h3 class="card-title"><BarChart3 class="icon" /> 缓存统计</h3>
        <div class="card-content">
          <div class="performance-grid">
            <div class="performance-item">
              <div class="performance-value">{{ cacheStats.totalItems }}</div>
              <div class="performance-label">缓存项数</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ formatBytes(cacheStats.totalSize) }}</div>
              <div class="performance-label">总大小</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ cacheStats.hitRate }}%</div>
              <div class="performance-label">命中率</div>
            </div>
            <div class="performance-item">
              <div class="performance-value">{{ cacheStats.engines }}</div>
              <div class="performance-label">存储引擎</div>
            </div>
          </div>
          <div class="cache-actions">
            <button @click="clearCache" class="action-button">
              <Trash2 class="button-icon" /> 清空缓存
            </button>
            <button @click="refreshCacheStats" class="action-button">
              <RefreshCw class="button-icon" /> 刷新统计
            </button>
          </div>
        </div>
      </div>
      
      <!-- 路由列表卡片 -->
      <div class="dashboard-card wide">
        <h3 class="card-title"><FileText class="icon" /> {{ t('dashboard.allRoutes') || '所有路由' }}</h3>
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
import { useAppCache } from '@/composables/useAppCache'
import { MapPin, Settings, ScrollText, Rocket, Home, Info, RefreshCw, Trash2, BarChart3, FileText } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const cache = useAppCache()

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

// 缓存统计
const cacheStats = ref({
  totalItems: 0,
  totalSize: 0,
  hitRate: 0,
  engines: 0
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

// 清空缓存
const clearCache = async () => {
  try {
    await cache.clear()
    await refreshCacheStats()
    console.log('缓存已清空')
  } catch (error) {
    console.error('清空缓存失败:', error)
  }
}

// 刷新缓存统计
const refreshCacheStats = async () => {
  try {
    const stats = await cache.getStats()
    if (stats) {
      cacheStats.value = {
        totalItems: stats.totalItems || 0,
        totalSize: stats.totalSize || 0,
        hitRate: stats.hits && stats.misses 
          ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
          : 0,
        engines: stats.engines ? Object.keys(stats.engines).length : 0
      }
    }
  } catch (error) {
    console.error('获取缓存统计失败:', error)
  }
}

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 更新路由历史
const updateHistory = () => {
  const now = new Date()
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  
  // 避免重复记录相同路径
  if (routeHistory.value.length > 0 && routeHistory.value[0].path === route.path) {
    return
  }
  
  routeHistory.value.unshift({
    path: route.path,
    time: timeStr
  })
  
  // 只保留最近5条记录（从10条减少到5条，减少内存占用）
  const MAX_HISTORY = 5
  if (routeHistory.value.length > MAX_HISTORY) {
    routeHistory.value = routeHistory.value.slice(0, MAX_HISTORY)
  }
  
  // 使用 requestIdleCallback 延迟 localStorage 写入
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      localStorage.setItem('routeHistory', JSON.stringify(routeHistory.value))
    })
  } else {
    localStorage.setItem('routeHistory', JSON.stringify(routeHistory.value))
  }
}

// 更新性能数据
const updatePerformance = () => {
  // 模拟性能数据
  performance.value = {
    navigationTime: Math.round(Math.random() * 100 + 50),
    cacheHitRate: Math.round(Math.random() * 30 + 70),
    totalNavigations: parseInt(localStorage.getItem('totalNavigations') || '0'),
    memoryUsage: Math.round(((window.performance as any).memory?.usedJSHeapSize || 0) / 1024 / 1024)
  }
}

// 性能监控定时器
let performanceTimer: number | null = null

onMounted(() => {
  // 获取用户信息
  username.value = localStorage.getItem('username') || t('common.guest')
  
  // 获取 Engine 信息
  try {
    const engine = (window as any).__ENGINE__
    if (engine && typeof engine === 'object' && engine.config) {
      engineInfo.value = {
        name: engine.config.name || engineInfo.value.name,
        version: engine.config.version || engineInfo.value.version,
        environment: engine.config.environment || engineInfo.value.environment,
        debug: engine.config.debug ?? engineInfo.value.debug
      }
    }
  } catch (e) {
    console.debug('Engine info not available:', e)
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
  
  // 刷新缓存统计
  refreshCacheStats()
  
  // 定时更新性能数据 - 增加间隔到 10 秒以减少 CPU 和内存占用
  performanceTimer = window.setInterval(() => {
    updatePerformance()
    refreshCacheStats()
  }, 10000)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (performanceTimer !== null) {
    clearInterval(performanceTimer)
    performanceTimer = null
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
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
}

.dashboard-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary);
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
  background: var(--color-bg-container);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.dashboard-card.wide {
  grid-column: span 2;
}

.card-title {
  font-size: 18px;
  color: var(--color-text-primary);
  margin: 0;
  padding: 20px;
  background: var(--color-bg-container-secondary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary-default);
}

.card-content {
  padding: 20px;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.info-value {
  color: var(--color-text-primary);
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
  border-bottom: 1px solid var(--color-border-light);
}

.history-time {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.history-path {
  color: var(--color-text-primary);
  font-family: monospace;
}

/* 操作按钮 */
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: var(--color-primary-default);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.button-icon {
  width: 16px;
  height: 16px;
}

.action-button:hover {
  background: var(--color-primary-hover);
  transform: translateX(5px);
}

.action-button.danger {
  background: var(--color-danger-default);
}

.action-button.danger:hover {
  background: var(--color-danger-hover);
}

/* 缓存操作按钮组 */
.cache-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.cache-actions .action-button {
  flex: 1;
  margin-bottom: 0;
  justify-content: center;
  font-size: 14px;
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
  color: var(--color-primary-default);
}

.performance-label {
  font-size: 12px;
  color: var(--color-text-secondary);
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
  background: var(--color-bg-container-secondary);
  border-bottom: 2px solid var(--color-border);
}

.route-table td {
  padding: 10px;
  border-bottom: 1px solid var(--color-border-light);
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: var(--color-success-lighter);
  color: var(--color-success-default);
}

.badge-warning {
  background: var(--color-warning-lighter);
  color: var(--color-warning-default);
}

.link-button {
  padding: 4px 12px;
  background: transparent;
  color: var(--color-primary-default);
  border: 1px solid var(--color-primary-default);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.link-button:hover {
  background: var(--color-primary-default);
  color: var(--color-text-inverse);
}

.empty-state {
  text-align: center;
  color: var(--color-text-tertiary);
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