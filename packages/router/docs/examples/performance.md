# 性能监控示例

展示 LDesign Router 内置的性能监控系统，实现实时性能分析和优化。

## 🎯 示例概述

构建一个性能监控仪表板，展示：

- 实时导航性能监控
- 性能趋势分析
- 自动性能优化建议
- 性能告警系统

## 📊 性能监控配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 启用性能监控
  performance: {
    enabled: true,
    sampleRate: 1.0, // 100% 采样率
    maxHistorySize: 100, // 最大历史记录数
    slowNavigationThreshold: 1000, // 慢导航阈值 (ms)
    enableMemoryTracking: true, // 启用内存跟踪
    enableUserTiming: true, // 启用 User Timing API

    // 自定义性能指标
    customMetrics: {
      // 首次内容绘制
      fcp: true,
      // 最大内容绘制
      lcp: true,
      // 首次输入延迟
      fid: true,
      // 累积布局偏移
      cls: true,
    },
  },
})

export default router
```

## 🎨 性能监控仪表板

```vue
<!-- components/PerformanceDashboard.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const router = useRouter()

// 监控状态
const isMonitoring = ref(true)

// 性能统计
const stats = reactive({
  totalNavigations: 0,
  averageDuration: 0,
  successRate: 0,
  fastestNavigation: 0,
  slowestNavigation: 0,
  p95Duration: 0,
  p99Duration: 0,
})

// 缓存统计
const cacheStats = reactive({
  hitRate: 0,
  size: 0,
  totalHits: 0,
})

// 趋势数据
const durationTrend = ref(0)
const successTrend = ref(0)
const cacheTrend = ref(0)
const recentNavigations = ref(0)

// 路由排行
const routeRanking = ref([])
const rankingMetric = ref('averageDuration')
const routeFilter = ref('')

// 告警和建议
const activeAlerts = ref([])
const optimizationSuggestions = ref([])

// 图表引用
const durationChart = ref(null)
const successChart = ref(null)

// 过滤后的路由排行
const filteredRouteRanking = computed(() => {
  let routes = [...routeRanking.value]

  // 过滤
  if (routeFilter.value) {
    routes = routes.filter(route =>
      route.path.toLowerCase().includes(routeFilter.value.toLowerCase())
    )
  }

  // 排序
  routes.sort((a, b) => {
    switch (rankingMetric.value) {
      case 'averageDuration':
        return b.averageDuration - a.averageDuration
      case 'totalNavigations':
        return b.totalNavigations - a.totalNavigations
      case 'successRate':
        return a.successRate - b.successRate
      case 'p95Duration':
        return b.p95Duration - a.p95Duration
      default:
        return 0
    }
  })

  return routes.slice(0, 20) // 只显示前20名
})

// 样式类名计算
function getDurationClass(duration) {
  if (duration < 500) return 'good'
  if (duration < 1000) return 'warning'
  return 'danger'
}

function getSuccessRateClass(rate) {
  if (rate > 0.95) return 'good'
  if (rate > 0.9) return 'warning'
  return 'danger'
}

function getCacheHitClass(rate) {
  if (rate > 80) return 'good'
  if (rate > 60) return 'warning'
  return 'danger'
}

function getTrendClass(trend) {
  if (trend > 0) return 'positive'
  if (trend < 0) return 'negative'
  return 'neutral'
}

// 格式化趋势
function formatTrend(trend) {
  if (trend === 0) return '无变化'
  const sign = trend > 0 ? '+' : ''
  return `${sign}${trend.toFixed(1)}%`
}

// 格式化时间
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

// 获取告警图标
function getAlertIcon(severity) {
  switch (severity) {
    case 'high':
      return 'alert-triangle'
    case 'medium':
      return 'alert-circle'
    case 'low':
      return 'info'
    default:
      return 'bell'
  }
}

// 更新性能数据
function updatePerformanceData() {
  // 获取基础统计
  const performanceStats = router.getPerformanceStats()
  Object.assign(stats, performanceStats)

  // 获取缓存统计
  const cacheData = router.getCacheStats()
  Object.assign(cacheStats, cacheData)

  // 分析路由性能
  analyzeRoutePerformance()

  // 生成告警
  generateAlerts()

  // 生成优化建议
  generateOptimizationSuggestions()

  // 更新图表
  updateCharts()
}

// 分析路由性能
function analyzeRoutePerformance() {
  const history = router.getNavigationHistory()
  const routeStats = new Map()

  history.forEach(record => {
    const route = record.to
    if (!routeStats.has(route)) {
      routeStats.set(route, {
        path: route,
        durations: [],
        successes: 0,
        total: 0,
      })
    }

    const stats = routeStats.get(route)
    stats.total++
    stats.durations.push(record.duration)
    if (record.success) stats.successes++
  })

  // 计算统计指标
  routeRanking.value = Array.from(routeStats.entries()).map(([path, data]) => {
    const durations = data.durations.sort((a, b) => a - b)
    return {
      path,
      averageDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      successRate: data.successes / data.total,
      totalNavigations: data.total,
      p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
      p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
    }
  })
}

// 生成性能告警
function generateAlerts() {
  const newAlerts = []

  // 慢导航告警
  if (stats.averageDuration > 1500) {
    newAlerts.push({
      id: Date.now() + 1,
      severity: 'high',
      title: '导航性能告警',
      message: `平均导航时间 ${stats.averageDuration}ms 超过阈值`,
      timestamp: Date.now(),
    })
  }

  // 成功率告警
  if (stats.successRate < 0.95) {
    newAlerts.push({
      id: Date.now() + 2,
      severity: 'medium',
      title: '导航成功率告警',
      message: `导航成功率 ${(stats.successRate * 100).toFixed(1)}% 过低`,
      timestamp: Date.now(),
    })
  }

  // 缓存命中率告警
  if (cacheStats.hitRate < 60) {
    newAlerts.push({
      id: Date.now() + 3,
      severity: 'low',
      title: '缓存性能告警',
      message: `缓存命中率 ${cacheStats.hitRate}% 较低`,
      timestamp: Date.now(),
    })
  }

  activeAlerts.value = newAlerts
}

// 生成优化建议
function generateOptimizationSuggestions() {
  const suggestions = []

  if (stats.averageDuration > 1000) {
    suggestions.push({
      id: 1,
      icon: 'zap',
      title: '启用智能预加载',
      description: '为常用页面启用预加载可以显著减少导航时间',
      expectedImprovement: '30-50% 性能提升',
    })
  }

  if (cacheStats.hitRate < 70) {
    suggestions.push({
      id: 2,
      icon: 'database',
      title: '优化缓存策略',
      description: '调整缓存规则和TTL设置以提高命中率',
      expectedImprovement: '20-30% 性能提升',
    })
  }

  if (stats.successRate < 0.98) {
    suggestions.push({
      id: 3,
      icon: 'shield',
      title: '改进错误处理',
      description: '添加更好的错误边界和重试机制',
      expectedImprovement: '提升用户体验',
    })
  }

  optimizationSuggestions.value = suggestions
}

// 更新图表
function updateCharts() {
  // 这里可以使用 Chart.js 或其他图表库
  // 绘制导航时间趋势图和成功率趋势图
}

// 切换监控状态
function toggleMonitoring() {
  isMonitoring.value = !isMonitoring.value

  if (isMonitoring.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

// 开始监控
function startMonitoring() {
  updatePerformanceData()

  // 监听导航事件
  router.afterEach(() => {
    updatePerformanceData()
  })
}

// 停止监控
function stopMonitoring() {
  // 停止监听事件
}

// 导出数据
function exportData() {
  const data = {
    stats,
    cacheStats,
    routeRanking: routeRanking.value,
    alerts: activeAlerts.value,
    timestamp: Date.now(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 清除历史
function clearHistory() {
  if (confirm('确定要清除所有性能历史数据吗？')) {
    router.clearPerformanceHistory()
    updatePerformanceData()
  }
}

// 分析特定路由
function analyzeRoute(route) {
  console.log('分析路由:', route)
  // 显示详细的路由分析
}

// 忽略告警
function dismissAlert(alert) {
  const index = activeAlerts.value.indexOf(alert)
  if (index > -1) {
    activeAlerts.value.splice(index, 1)
  }
}

// 应用优化建议
function applySuggestion(suggestion) {
  console.log('应用建议:', suggestion)
  // 实施优化建议
}

// 定时更新
let updateInterval = null

onMounted(() => {
  startMonitoring()
  updateInterval = setInterval(updatePerformanceData, 5000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<template>
  <div class="performance-dashboard">
    <div class="dashboard-header">
      <h2>路由性能监控</h2>
      <div class="header-controls">
        <button :class="{ active: isMonitoring }" @click="toggleMonitoring">
          {{ isMonitoring ? '停止监控' : '开始监控' }}
        </button>
        <button @click="exportData">导出数据</button>
        <button @click="clearHistory">清除历史</button>
      </div>
    </div>

    <!-- 关键指标概览 -->
    <div class="metrics-overview">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <div class="metric-value" :class="getDurationClass(stats.averageDuration)">
              {{ stats.averageDuration }}ms
            </div>
            <div class="metric-label">平均导航时间</div>
            <div class="metric-trend" :class="getTrendClass(durationTrend)">
              {{ formatTrend(durationTrend) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🎯</div>
          <div class="metric-content">
            <div class="metric-value" :class="getSuccessRateClass(stats.successRate)">
              {{ (stats.successRate * 100).toFixed(1) }}%
            </div>
            <div class="metric-label">成功率</div>
            <div class="metric-trend" :class="getTrendClass(successTrend)">
              {{ formatTrend(successTrend) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">💾</div>
          <div class="metric-content">
            <div class="metric-value" :class="getCacheHitClass(cacheStats.hitRate)">
              {{ cacheStats.hitRate }}%
            </div>
            <div class="metric-label">缓存命中率</div>
            <div class="metric-trend" :class="getTrendClass(cacheTrend)">
              {{ formatTrend(cacheTrend) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-content">
            <div class="metric-value">
              {{ stats.totalNavigations }}
            </div>
            <div class="metric-label">总导航次数</div>
            <div class="metric-trend positive">+{{ recentNavigations }} (最近1小时)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能趋势图表 -->
    <div class="performance-charts">
      <div class="chart-section">
        <h3>导航时间趋势</h3>
        <div class="chart-container">
          <canvas ref="durationChart" width="800" height="300" />
        </div>
      </div>

      <div class="chart-section">
        <h3>成功率趋势</h3>
        <div class="chart-container">
          <canvas ref="successChart" width="800" height="300" />
        </div>
      </div>
    </div>

    <!-- 路由性能排行 -->
    <div class="route-ranking">
      <h3>路由性能排行</h3>
      <div class="ranking-controls">
        <select v-model="rankingMetric">
          <option value="averageDuration">平均时间</option>
          <option value="totalNavigations">访问次数</option>
          <option value="successRate">成功率</option>
          <option value="p95Duration">95% 分位数</option>
        </select>
        <input v-model="routeFilter" placeholder="过滤路由..." class="route-filter" />
      </div>

      <div class="ranking-table">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>路由</th>
              <th>平均时间</th>
              <th>成功率</th>
              <th>访问次数</th>
              <th>95% 分位数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(route, index) in filteredRouteRanking" :key="route.path">
              <td>{{ index + 1 }}</td>
              <td class="route-path">
                {{ route.path }}
              </td>
              <td :class="getDurationClass(route.averageDuration)">
                {{ route.averageDuration }}ms
              </td>
              <td :class="getSuccessRateClass(route.successRate)">
                {{ (route.successRate * 100).toFixed(1) }}%
              </td>
              <td>{{ route.totalNavigations }}</td>
              <td>{{ route.p95Duration }}ms</td>
              <td>
                <button class="analyze-btn" @click="analyzeRoute(route)">分析</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 性能告警 -->
    <div class="performance-alerts">
      <h3>性能告警</h3>
      <div class="alerts-list">
        <div
          v-for="alert in activeAlerts"
          :key="alert.id"
          class="alert-item"
          :class="[`alert-${alert.severity}`]"
        >
          <div class="alert-icon">
            <Icon :name="getAlertIcon(alert.severity)" />
          </div>
          <div class="alert-content">
            <div class="alert-title">
              {{ alert.title }}
            </div>
            <div class="alert-message">
              {{ alert.message }}
            </div>
            <div class="alert-time">
              {{ formatTime(alert.timestamp) }}
            </div>
          </div>
          <div class="alert-actions">
            <button class="dismiss-btn" @click="dismissAlert(alert)">忽略</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div class="optimization-suggestions">
      <h3>优化建议</h3>
      <div class="suggestions-list">
        <div
          v-for="suggestion in optimizationSuggestions"
          :key="suggestion.id"
          class="suggestion-item"
        >
          <div class="suggestion-icon">
            <Icon :name="suggestion.icon" />
          </div>
          <div class="suggestion-content">
            <div class="suggestion-title">
              {{ suggestion.title }}
            </div>
            <div class="suggestion-description">
              {{ suggestion.description }}
            </div>
            <div class="suggestion-impact">预期提升: {{ suggestion.expectedImprovement }}</div>
          </div>
          <div class="suggestion-actions">
            <button class="apply-btn" @click="applySuggestion(suggestion)">应用</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-dashboard {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  margin: 0;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.header-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-controls button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.metrics-overview {
  margin-bottom: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.metric-value.good {
  color: #52c41a;
}
.metric-value.warning {
  color: #faad14;
}
.metric-value.danger {
  color: #f5222d;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.metric-trend {
  font-size: 0.8rem;
}

.metric-trend.positive {
  color: #52c41a;
}
.metric-trend.negative {
  color: #f5222d;
}
.metric-trend.neutral {
  color: #666;
}

.performance-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.chart-container {
  text-align: center;
}

.route-ranking {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.route-ranking h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.ranking-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.ranking-controls select,
.route-filter {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.ranking-table {
  overflow-x: auto;
}

.ranking-table table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th,
.ranking-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-table th {
  background: #fafafa;
  font-weight: 600;
}

.route-path {
  font-family: monospace;
  font-size: 0.9rem;
}

.analyze-btn {
  padding: 0.25rem 0.5rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.performance-alerts,
.optimization-suggestions {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.performance-alerts h3,
.optimization-suggestions h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.alert-item,
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 4px solid #d9d9d9;
}

.alert-item.alert-high {
  border-left-color: #f5222d;
  background: #fff2f0;
}

.alert-item.alert-medium {
  border-left-color: #faad14;
  background: #fffbe6;
}

.alert-item.alert-low {
  border-left-color: #1890ff;
  background: #f0f8ff;
}

.suggestion-item {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.alert-content,
.suggestion-content {
  flex: 1;
}

.alert-title,
.suggestion-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.alert-message,
.suggestion-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.alert-time,
.suggestion-impact {
  font-size: 0.8rem;
  color: #999;
}

.dismiss-btn,
.apply-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.apply-btn {
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}
</style>
```

## 🎯 关键特性

### 1. 实时性能监控

- 导航时间统计
- 成功率监控
- 缓存性能跟踪
- 内存使用监控

### 2. 智能分析

- 性能趋势分析
- 路由性能排行
- 瓶颈识别
- 异常检测

### 3. 自动告警

- 性能阈值告警
- 趋势异常告警
- 自定义告警规则

### 4. 优化建议

- 基于数据的优化建议
- 预期效果评估
- 一键应用优化

这个示例展示了 LDesign Router 强大的性能监控能力，帮助开发者实时了解和优化应用性能。
