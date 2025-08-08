# 性能监控

LDesign Router 内置了强大的性能监控系统，帮助你实时了解路由导航的性能表现，识别瓶颈并进行优化。

## 🎯 性能监控概述

### 为什么需要性能监控？

- **📊 数据驱动优化** - 基于真实数据进行性能优化
- **🔍 问题早发现** - 及时发现性能瓶颈和异常
- **📈 持续改进** - 跟踪优化效果，持续提升用户体验
- **🎯 精准定位** - 快速定位性能问题的根源

### 监控指标

LDesign Router 监控以下关键指标：

- **导航时间** - 从开始导航到完成渲染的总时间
- **成功率** - 导航成功的比例
- **错误率** - 导航失败的比例
- **缓存命中率** - 缓存使用效果
- **内存使用** - 路由相关的内存占用

## 🚀 启用性能监控

### 基础配置

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 启用性能监控
  performance: true,
})
```

### 高级配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,

  // 详细的性能配置
  performance: {
    enabled: true,
    sampleRate: 1.0, // 采样率 (0-1)
    maxHistorySize: 100, // 最大历史记录数
    slowNavigationThreshold: 1000, // 慢导航阈值 (ms)
    enableMemoryTracking: true, // 启用内存跟踪
    enableUserTiming: true, // 启用 User Timing API
  },
})
```

## 📊 获取性能数据

### 基础统计信息

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 获取性能统计
const stats = router.getPerformanceStats()

console.log('性能统计:', {
  totalNavigations: stats.totalNavigations, // 总导航次数
  averageDuration: stats.averageDuration, // 平均导航时间
  successRate: stats.successRate, // 成功率
  fastestNavigation: stats.fastestNavigation, // 最快导航时间
  slowestNavigation: stats.slowestNavigation, // 最慢导航时间
  p95Duration: stats.p95Duration, // 95% 分位数
  p99Duration: stats.p99Duration, // 99% 分位数
})
```

### 详细性能数据

```typescript
// 获取详细的导航历史
const navigationHistory = router.getNavigationHistory()

navigationHistory.forEach(record => {
  console.log('导航记录:', {
    from: record.from,
    to: record.to,
    duration: record.duration,
    success: record.success,
    timestamp: record.timestamp,
    error: record.error,
  })
})
```

### 实时性能监控

```typescript
// 监听导航性能
router.afterEach((to, from, failure) => {
  const stats = router.getPerformanceStats()

  // 检查性能告警
  if (stats.averageDuration > 1000) {
    console.warn('⚠️ 平均导航时间过长:', `${stats.averageDuration}ms`)
  }

  if (stats.successRate < 0.95) {
    console.warn('⚠️ 导航成功率过低:', `${(stats.successRate * 100).toFixed(1)}%`)
  }

  // 发送性能数据到分析服务
  analytics.track('navigation_performance', {
    from: from.path,
    to: to.path,
    duration: stats.lastNavigationDuration,
    success: !failure,
  })
})
```

## 📈 性能分析

### 导航时间分析

```typescript
// 分析导航时间分布
function analyzeNavigationTiming() {
  const history = router.getNavigationHistory()
  const durations = history.map(record => record.duration)

  const analysis = {
    min: Math.min(...durations),
    max: Math.max(...durations),
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    median: durations.sort()[Math.floor(durations.length / 2)],
    p95: durations.sort()[Math.floor(durations.length * 0.95)],
    p99: durations.sort()[Math.floor(durations.length * 0.99)],
  }

  console.log('导航时间分析:', analysis)
  return analysis
}
```

### 路由性能排行

```typescript
// 分析各路由的性能表现
function analyzeRoutePerformance() {
  const history = router.getNavigationHistory()
  const routeStats = new Map()

  history.forEach(record => {
    const route = record.to
    if (!routeStats.has(route)) {
      routeStats.set(route, {
        count: 0,
        totalDuration: 0,
        failures: 0,
      })
    }

    const stats = routeStats.get(route)
    stats.count++
    stats.totalDuration += record.duration
    if (!record.success) stats.failures++
  })

  // 计算平均时间和成功率
  const routePerformance = Array.from(routeStats.entries()).map(([route, stats]) => ({
    route,
    averageDuration: stats.totalDuration / stats.count,
    successRate: (stats.count - stats.failures) / stats.count,
    totalNavigations: stats.count,
  }))

  // 按平均时间排序
  routePerformance.sort((a, b) => b.averageDuration - a.averageDuration)

  console.log('路由性能排行:', routePerformance)
  return routePerformance
}
```

### 性能趋势分析

```typescript
// 分析性能趋势
function analyzePerformanceTrend() {
  const history = router.getNavigationHistory()
  const timeWindow = 5 * 60 * 1000 // 5分钟窗口
  const now = Date.now()

  // 按时间窗口分组
  const windows = new Map()

  history.forEach(record => {
    const windowStart = Math.floor((record.timestamp - now) / timeWindow) * timeWindow + now

    if (!windows.has(windowStart)) {
      windows.set(windowStart, {
        navigations: [],
        totalDuration: 0,
        failures: 0,
      })
    }

    const window = windows.get(windowStart)
    window.navigations.push(record)
    window.totalDuration += record.duration
    if (!record.success) window.failures++
  })

  // 计算趋势
  const trend = Array.from(windows.entries()).map(([time, data]) => ({
    time: new Date(time),
    averageDuration: data.totalDuration / data.navigations.length,
    successRate: (data.navigations.length - data.failures) / data.navigations.length,
    navigationCount: data.navigations.length,
  }))

  trend.sort((a, b) => a.time.getTime() - b.time.getTime())

  console.log('性能趋势:', trend)
  return trend
}
```

## 🔧 性能优化建议

### 自动性能建议

```typescript
// 自动生成性能优化建议
function generatePerformanceRecommendations() {
  const stats = router.getPerformanceStats()
  const cacheStats = router.getCacheStats()
  const recommendations = []

  // 导航时间建议
  if (stats.averageDuration > 1000) {
    recommendations.push({
      type: 'slow_navigation',
      severity: 'high',
      message: '平均导航时间过长，建议启用预加载或优化组件',
      action: 'enable_preloading',
    })
  }

  // 缓存建议
  if (cacheStats.hitRate < 0.6) {
    recommendations.push({
      type: 'low_cache_hit',
      severity: 'medium',
      message: '缓存命中率较低，建议调整缓存策略',
      action: 'optimize_cache_rules',
    })
  }

  // 成功率建议
  if (stats.successRate < 0.95) {
    recommendations.push({
      type: 'low_success_rate',
      severity: 'high',
      message: '导航成功率较低，请检查路由配置和错误处理',
      action: 'check_error_handling',
    })
  }

  return recommendations
}

// 定期检查并显示建议
setInterval(() => {
  const recommendations = generatePerformanceRecommendations()

  recommendations.forEach(rec => {
    console.warn(`性能建议 [${rec.severity}]:`, rec.message)
  })
}, 60000) // 每分钟检查一次
```

### 性能告警

```typescript
// 设置性能告警
function setupPerformanceAlerts() {
  router.afterEach(() => {
    const stats = router.getPerformanceStats()

    // 慢导航告警
    if (stats.lastNavigationDuration > 2000) {
      console.error('🚨 慢导航告警:', {
        duration: stats.lastNavigationDuration,
        threshold: 2000,
        route: router.currentRoute.value.path,
      })

      // 发送告警
      sendAlert('slow_navigation', {
        duration: stats.lastNavigationDuration,
        route: router.currentRoute.value.path,
      })
    }

    // 连续失败告警
    const recentFailures = getRecentFailures(5) // 最近5次导航
    if (recentFailures.length >= 3) {
      console.error('🚨 连续导航失败告警:', recentFailures)

      sendAlert('navigation_failures', {
        failures: recentFailures,
        count: recentFailures.length,
      })
    }
  })
}
```

## 📊 性能仪表板

### 实时性能面板

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { onMounted, onUnmounted, ref } from 'vue'

const router = useRouter()
const stats = ref({})
const cacheStats = ref({})
const trendData = ref([])
const routePerformance = ref([])

// 更新性能数据
function updatePerformanceData() {
  stats.value = router.getPerformanceStats()
  cacheStats.value = router.getCacheStats()
  trendData.value = analyzePerformanceTrend()
  routePerformance.value = analyzeRoutePerformance()
}

// 样式类名
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

// 定时更新
let updateInterval
onMounted(() => {
  updatePerformanceData()
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
    <h2>路由性能监控</h2>

    <!-- 关键指标 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>平均导航时间</h3>
        <div class="metric-value" :class="getDurationClass(stats.averageDuration)">
          {{ stats.averageDuration }}ms
        </div>
      </div>

      <div class="metric-card">
        <h3>成功率</h3>
        <div class="metric-value" :class="getSuccessRateClass(stats.successRate)">
          {{ (stats.successRate * 100).toFixed(1) }}%
        </div>
      </div>

      <div class="metric-card">
        <h3>缓存命中率</h3>
        <div class="metric-value" :class="getCacheHitClass(cacheStats.hitRate)">
          {{ cacheStats.hitRate }}%
        </div>
      </div>

      <div class="metric-card">
        <h3>总导航次数</h3>
        <div class="metric-value">
          {{ stats.totalNavigations }}
        </div>
      </div>
    </div>

    <!-- 性能趋势图 -->
    <div class="chart-container">
      <h3>性能趋势</h3>
      <PerformanceChart :data="trendData" />
    </div>

    <!-- 路由性能排行 -->
    <div class="route-ranking">
      <h3>路由性能排行</h3>
      <table>
        <thead>
          <tr>
            <th>路由</th>
            <th>平均时间</th>
            <th>成功率</th>
            <th>访问次数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in routePerformance" :key="route.route">
            <td>{{ route.route }}</td>
            <td :class="getDurationClass(route.averageDuration)">{{ route.averageDuration }}ms</td>
            <td :class="getSuccessRateClass(route.successRate)">
              {{ (route.successRate * 100).toFixed(1) }}%
            </td>
            <td>{{ route.totalNavigations }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.performance-dashboard {
  padding: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
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

.chart-container {
  margin-bottom: 2rem;
}

.route-ranking table {
  width: 100%;
  border-collapse: collapse;
}

.route-ranking th,
.route-ranking td {
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
}

.route-ranking th {
  background: #f5f5f5;
}
</style>
```

## 🎯 最佳实践

### 1. 合理的监控配置

```typescript
// ✅ 推荐：生产环境适度监控
const router = createRouter({
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% 采样率，减少性能影响
    maxHistorySize: 50, // 适中的历史记录大小
  },
})

// ❌ 避免：过度监控影响性能
const router = createRouter({
  performance: {
    enabled: true,
    sampleRate: 1.0, // 100% 采样可能影响性能
    maxHistorySize: 1000, // 过大的历史记录占用内存
  },
})
```

### 2. 及时的性能告警

```typescript
// ✅ 推荐：设置合理的告警阈值
const PERFORMANCE_THRESHOLDS = {
  slowNavigation: 1000, // 1秒
  lowSuccessRate: 0.95, // 95%
  lowCacheHit: 0.6, // 60%
}

// 定期检查性能指标
setInterval(() => {
  const stats = router.getPerformanceStats()

  Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, threshold]) => {
    if (shouldAlert(stats, metric, threshold)) {
      sendPerformanceAlert(metric, stats[metric], threshold)
    }
  })
}, 60000)
```

### 3. 数据驱动的优化

```typescript
// ✅ 推荐：基于数据进行优化决策
function optimizeBasedOnData() {
  const routePerformance = analyzeRoutePerformance()

  // 为慢路由启用预加载
  routePerformance
    .filter(route => route.averageDuration > 1000)
    .forEach(route => {
      enablePreloadingForRoute(route.route)
    })

  // 为热门路由增加缓存
  routePerformance
    .filter(route => route.totalNavigations > 100)
    .forEach(route => {
      addToCacheIncludeList(route.route)
    })
}
```

通过 LDesign Router 的性能监控系统，你可以深入了解应用的路由性能，及时发现问题并进行优化，为用户提供
更好的体验。
