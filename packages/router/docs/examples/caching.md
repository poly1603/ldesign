# 智能缓存示例

展示 LDesign Router 的 LRU + TTL 混合缓存策略，实现极致的性能优化。

## 🎯 示例概述

构建一个内容管理系统，展示：

- LRU 最近最少使用算法
- TTL 时间过期机制
- 智能缓存策略
- 缓存性能监控

## 💾 缓存配置策略

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 智能缓存配置
  cache: {
    max: 30, // 最大缓存30个页面
    ttl: 15 * 60 * 1000, // 15分钟过期时间

    // 包含规则 - 哪些页面需要缓存
    include: [
      // 内容页面 - 高缓存价值
      'ArticleDetail',
      'CategoryList',
      /^Article/, // 所有文章相关页面

      // 用户页面 - 中等缓存价值
      /^User/,
      'UserProfile',

      // 静态页面 - 长期缓存
      '/about',
      '/help',
      '/terms',
    ],

    // 排除规则 - 哪些页面不缓存
    exclude: [
      // 实时数据页面
      '/dashboard/realtime',
      '/chat',
      '/notifications',

      // 敏感页面
      '/payment',
      '/admin/settings',

      // 编辑页面
      /\/edit$/,
      /\/create$/,

      // 带特定查询参数的页面
      /\?.*nocache/,
    ],

    // 自定义缓存条件
    condition: route => {
      // 移动端减少缓存
      if (isMobile() && route.meta.mobileCache === false) {
        return false
      }

      // 低内存设备减少缓存
      if (isLowMemory()) {
        return route.meta.priority === 'high'
      }

      // 慢网络增加缓存
      if (isSlowNetwork()) {
        return true
      }

      return route.meta.cache !== false
    },
  },
})

export default router
```

## 🎨 缓存管理组件

```vue
<!-- components/CacheManager.vue -->
<script setup>
import { useRouter } from '@ldesign/router'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const router = useRouter()

// 缓存统计
const cacheStats = reactive({
  hitRate: 0,
  size: 0,
  maxSize: 0,
  timeSaved: 0,
  totalHits: 0,
  totalMisses: 0,
})

// 缓存条目
const cacheEntries = ref([])

// 过滤和排序
const sortBy = ref('lastAccessed')
const filterText = ref('')

// 缓存配置
const config = reactive({
  maxSize: 30,
  ttlMinutes: 15,
  strategy: 'lru',
  autoCleanup: true,
})

// 图表引用
const hitRateChart = ref(null)
const sizeChart = ref(null)

// 过滤后的缓存条目
const filteredEntries = computed(() => {
  let entries = [...cacheEntries.value]

  // 过滤
  if (filterText.value) {
    entries = entries.filter(entry =>
      entry.path.toLowerCase().includes(filterText.value.toLowerCase())
    )
  }

  // 排序
  entries.sort((a, b) => {
    switch (sortBy.value) {
      case 'lastAccessed':
        return b.lastAccessed - a.lastAccessed
      case 'createdAt':
        return b.createdAt - a.createdAt
      case 'hitCount':
        return b.hitCount - a.hitCount
      case 'size':
        return b.size - a.size
      default:
        return 0
    }
  })

  return entries
})

// 刷新缓存统计
function refreshStats() {
  const stats = router.getCacheStats()
  Object.assign(cacheStats, stats)

  // 获取缓存条目详情
  cacheEntries.value = router.getCacheEntries().map(entry => ({
    ...entry,
    lastAccessed: entry.lastAccessed || Date.now(),
    createdAt: entry.createdAt || Date.now(),
    hitCount: entry.hitCount || 0,
    size: entry.size || 0,
    expiresAt: entry.expiresAt || Date.now() + config.ttlMinutes * 60 * 1000,
  }))
}

// 清空所有缓存
function clearAllCache() {
  if (confirm('确定要清空所有缓存吗？')) {
    router.clearRouteCache()
    refreshStats()
  }
}

// 刷新单个缓存条目
function refreshEntry(entry) {
  router.clearRouteCache(entry.path)
  router.preloadRoute(entry.path)
  refreshStats()
}

// 移除单个缓存条目
function removeEntry(entry) {
  router.clearRouteCache(entry.path)
  refreshStats()
}

// 检查是否过期
function isExpired(entry) {
  return Date.now() > entry.expiresAt
}

// 获取TTL进度
function getTTLProgress(entry) {
  const total = entry.expiresAt - entry.createdAt
  const remaining = entry.expiresAt - Date.now()
  return Math.max(0, (remaining / total) * 100)
}

// 格式化时间
function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 格式化TTL
function formatTTL(expiresAt) {
  const remaining = expiresAt - Date.now()
  if (remaining <= 0) return '已过期'

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
}

// 格式化大小
function formatSize(bytes) {
  if (!bytes) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`
}

// 更新缓存配置
function updateConfig() {
  router.updateCacheConfig({
    max: config.maxSize,
    ttl: config.ttlMinutes * 60 * 1000,
    strategy: config.strategy,
    autoCleanup: config.autoCleanup,
  })
}

// 绘制图表
function drawCharts() {
  // 命中率图表
  if (hitRateChart.value) {
    const ctx = hitRateChart.value.getContext('2d')
    // 绘制命中率趋势图...
  }

  // 缓存大小图表
  if (sizeChart.value) {
    const ctx = sizeChart.value.getContext('2d')
    // 绘制缓存大小变化图...
  }
}

// 定时更新
let updateInterval = null

onMounted(() => {
  refreshStats()
  drawCharts()

  // 每5秒更新一次
  updateInterval = setInterval(() => {
    refreshStats()
    drawCharts()
  }, 5000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<template>
  <div class="cache-manager">
    <div class="manager-header">
      <h3>智能缓存管理</h3>
      <div class="header-actions">
        <button class="refresh-btn" @click="refreshStats">
          <Icon name="refresh" />
          刷新统计
        </button>
        <button class="clear-btn" @click="clearAllCache">
          <Icon name="trash" />
          清空缓存
        </button>
      </div>
    </div>

    <!-- 缓存统计概览 -->
    <div class="cache-overview">
      <div class="overview-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ cacheStats.hitRate }}%</div>
            <div class="stat-label">缓存命中率</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💾</div>
          <div class="stat-content">
            <div class="stat-value">{{ cacheStats.size }}/{{ cacheStats.maxSize }}</div>
            <div class="stat-label">缓存使用量</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ cacheStats.timeSaved }}ms</div>
            <div class="stat-label">节省时间</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ cacheStats.totalHits }}
            </div>
            <div class="stat-label">总命中次数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 缓存列表 -->
    <div class="cache-list">
      <div class="list-header">
        <h4>缓存条目 ({{ cacheEntries.length }})</h4>
        <div class="list-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="lastAccessed">按访问时间</option>
            <option value="createdAt">按创建时间</option>
            <option value="hitCount">按命中次数</option>
            <option value="size">按大小</option>
          </select>
          <input v-model="filterText" placeholder="过滤路径..." class="filter-input" />
        </div>
      </div>

      <div class="cache-entries">
        <div
          v-for="entry in filteredEntries"
          :key="entry.key"
          class="cache-entry"
          :class="{ 'entry--expired': isExpired(entry) }"
        >
          <div class="entry-info">
            <div class="entry-path">
              {{ entry.path }}
            </div>
            <div class="entry-meta">
              <span class="meta-item">
                <Icon name="clock" />
                {{ formatTime(entry.lastAccessed) }}
              </span>
              <span class="meta-item">
                <Icon name="target" />
                {{ entry.hitCount }} 次命中
              </span>
              <span class="meta-item">
                <Icon name="database" />
                {{ formatSize(entry.size) }}
              </span>
            </div>
          </div>

          <div class="entry-status">
            <div class="ttl-progress">
              <div
                class="ttl-bar"
                :style="{ width: `${getTTLProgress(entry)}%` }"
                :class="{ 'ttl-bar--warning': getTTLProgress(entry) < 20 }"
              />
            </div>
            <div class="ttl-text">
              {{ formatTTL(entry.expiresAt) }}
            </div>
          </div>

          <div class="entry-actions">
            <button
              class="action-btn action-btn--refresh"
              title="刷新缓存"
              @click="refreshEntry(entry)"
            >
              <Icon name="refresh" />
            </button>
            <button
              class="action-btn action-btn--remove"
              title="移除缓存"
              @click="removeEntry(entry)"
            >
              <Icon name="x" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 缓存策略配置 -->
    <div class="cache-config">
      <h4>缓存策略配置</h4>
      <div class="config-form">
        <div class="form-group">
          <label>最大缓存数量</label>
          <input
            v-model.number="config.maxSize"
            type="number"
            min="5"
            max="100"
            @change="updateConfig"
          />
        </div>

        <div class="form-group">
          <label>TTL (分钟)</label>
          <input
            v-model.number="config.ttlMinutes"
            type="number"
            min="1"
            max="60"
            @change="updateConfig"
          />
        </div>

        <div class="form-group">
          <label>缓存策略</label>
          <select v-model="config.strategy" @change="updateConfig">
            <option value="lru">LRU (最近最少使用)</option>
            <option value="lfu">LFU (最少使用频率)</option>
            <option value="fifo">FIFO (先进先出)</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input v-model="config.autoCleanup" type="checkbox" @change="updateConfig" />
            自动清理过期缓存
          </label>
        </div>
      </div>
    </div>

    <!-- 缓存性能图表 -->
    <div class="cache-performance">
      <h4>性能趋势</h4>
      <div class="performance-charts">
        <div class="chart-container">
          <h5>命中率趋势</h5>
          <canvas ref="hitRateChart" width="300" height="150" />
        </div>
        <div class="chart-container">
          <h5>缓存大小变化</h5>
          <canvas ref="sizeChart" width="300" height="150" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cache-manager {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.manager-header h3 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.clear-btn:hover {
  border-color: #f5222d;
  color: #f5222d;
}

.cache-overview {
  margin-bottom: 2rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.cache-list {
  margin-bottom: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h4 {
  margin: 0;
  color: #333;
}

.list-controls {
  display: flex;
  gap: 1rem;
}

.sort-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.cache-entries {
  max-height: 400px;
  overflow-y: auto;
}

.cache-entry {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #52c41a;
}

.cache-entry.entry--expired {
  border-left-color: #faad14;
  opacity: 0.7;
}

.entry-info {
  flex: 1;
}

.entry-path {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.entry-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.entry-status {
  width: 120px;
  text-align: center;
}

.ttl-progress {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.ttl-bar {
  height: 100%;
  background: #52c41a;
  transition: width 0.3s ease;
}

.ttl-bar--warning {
  background: #faad14;
}

.ttl-text {
  font-size: 0.8rem;
  color: #666;
}

.entry-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn--refresh:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn--remove:hover {
  border-color: #f5222d;
  color: #f5222d;
}

.cache-config {
  margin-bottom: 2rem;
}

.cache-config h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.config-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #666;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.cache-performance h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.performance-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.chart-container {
  text-align: center;
}

.chart-container h5 {
  margin: 0 0 1rem 0;
  color: #666;
}

.chart-container canvas {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>
```

## 🎯 关键特性

### 1. LRU + TTL 混合策略

- LRU 算法确保最常用的页面保留在缓存中
- TTL 机制确保数据的新鲜度
- 智能清理过期和最少使用的缓存

### 2. 精确的缓存控制

- 包含/排除规则
- 条件缓存函数
- 动态配置更新

### 3. 实时监控和管理

- 缓存命中率统计
- 缓存条目详情
- TTL 进度可视化
- 性能趋势图表

### 4. 用户友好的管理界面

- 直观的缓存状态显示
- 便捷的缓存操作
- 灵活的配置选项

这个示例展示了 LDesign Router 智能缓存系统的强大功能，通过合理配置可以显著提升应用性能。
