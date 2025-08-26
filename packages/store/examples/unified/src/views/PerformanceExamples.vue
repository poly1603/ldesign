<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance/PerformanceStore'

// 使用性能 Store
const performanceStore = usePerformanceStore()

// 搜索输入
const searchInput = ref('')

// 实时更新状态
const isUpdating = ref(false)
let updateInterval: number | null = null

// 防抖搜索
let debounceTimer: number | null = null
function debouncedSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = window.setTimeout(() => {
    performanceStore.debouncedSearch(searchInput.value)
  }, 300)
}

// 开始实时更新
function startRealTimeUpdates() {
  if (isUpdating.value) return

  isUpdating.value = true
  updateInterval = window.setInterval(() => {
    performanceStore.throttledUpdate()
  }, 1000) // 每秒更新一次
}

// 停止实时更新
function stopRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
  isUpdating.value = false
}

// 获取缓存命中率样式类
function getCacheHitRateClass(hitRate: number) {
  if (hitRate >= 80) return 'success'
  if (hitRate >= 60) return 'warning'
  return 'danger'
}

// 格式化趋势值
function formatTrend(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// 获取趋势样式类
function getTrendClass(value: number) {
  if (value > 5) return 'trend-up'
  if (value < -5) return 'trend-down'
  return 'trend-stable'
}

// 组件挂载时初始化
onMounted(() => {
  performanceStore.initializeData()
})

// 组件卸载时清理
onUnmounted(() => {
  stopRealTimeUpdates()
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="performance-examples">
    <div class="page-header">
      <h1>性能优化示例</h1>
      <p>展示缓存、防抖、节流等性能优化功能</p>
    </div>

    <!-- 性能控制面板 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">性能控制面板</h2>
        <p class="card-description">初始化数据和控制性能测试</p>
      </div>

      <div class="example-content">
        <div class="control-panel">
          <button class="btn btn-primary" @click="performanceStore.initializeData()">
            初始化数据 (1000条)
          </button>

          <button
            :disabled="performanceStore.loading" class="btn btn-success"
            @click="performanceStore.batchOperation(100)"
          >
            批量操作 (100条)
          </button>

          <button class="btn btn-danger" @click="performanceStore.clearData()">
            清空数据
          </button>

          <button class="btn btn-secondary" @click="performanceStore.resetPerformanceStats()">
            重置统计
          </button>
        </div>

        <div class="data-stats">
          <div class="stat-item">
            <span class="stat-label">数据总数:</span>
            <span class="stat-value">{{ performanceStore.dataStats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">过滤结果:</span>
            <span class="stat-value">{{ performanceStore.filteredItems.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">加载状态:</span>
            <span class="stat-value" :class="{ loading: performanceStore.loading }">
              {{ performanceStore.loading ? '加载中...' : '就绪' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 防抖和节流示例 -->
    <div class="performance-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">防抖搜索 (Debounce)</h2>
          <p class="card-description">搜索输入防抖，减少不必要的计算</p>
        </div>

        <div class="example-content">
          <div class="search-demo">
            <input
              v-model="searchInput" type="text" placeholder="输入搜索关键词..." class="form-input"
              @input="debouncedSearch"
            >

            <div class="search-stats">
              <div class="stat-item">
                <span class="stat-label">防抖触发次数:</span>
                <span class="stat-value">{{ performanceStore.debounceCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">搜索耗时:</span>
                <span class="stat-value">{{ performanceStore.performanceStats.searchTime.toFixed(2) }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">当前关键词:</span>
                <span class="stat-value">{{ performanceStore.searchKeyword || '无' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">节流更新 (Throttle)</h2>
          <p class="card-description">实时数据更新节流，控制更新频率</p>
        </div>

        <div class="example-content">
          <div class="throttle-demo">
            <button :disabled="isUpdating" class="btn btn-primary" @click="startRealTimeUpdates">
              {{ isUpdating ? '更新中...' : '开始实时更新' }}
            </button>

            <button :disabled="!isUpdating" class="btn btn-secondary" @click="stopRealTimeUpdates">
              停止更新
            </button>

            <div class="realtime-stats">
              <div class="stat-item">
                <span class="stat-label">节流触发次数:</span>
                <span class="stat-value">{{ performanceStore.throttleCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">CPU使用率:</span>
                <span class="stat-value">{{ performanceStore.realTimeData.cpu.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">内存使用率:</span>
                <span class="stat-value">{{ performanceStore.realTimeData.memory.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">网络使用率:</span>
                <span class="stat-value">{{ performanceStore.realTimeData.network.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 缓存和性能统计 -->
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">缓存统计</h2>
      <p class="card-description">展示缓存命中率和性能提升</p>
    </div>

    <div class="example-content">
      <div class="cache-demo">
        <div class="cache-controls">
          <button class="btn btn-success btn-sm" @click="performanceStore.simulateCacheOperation(true)">
            模拟缓存命中
          </button>

          <button class="btn btn-warning btn-sm" @click="performanceStore.simulateCacheOperation(false)">
            模拟缓存未命中
          </button>
        </div>

        <div class="cache-stats">
          <div class="stat-item">
            <span class="stat-label">缓存命中:</span>
            <span class="stat-value success">{{ performanceStore.cacheStats.hits }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存未命中:</span>
            <span class="stat-value warning">{{ performanceStore.cacheStats.misses }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">命中率:</span>
            <span class="stat-value" :class="getCacheHitRateClass(performanceStore.cacheStats.hitRate)">
              {{ performanceStore.cacheStats.hitRate.toFixed(1) }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存大小:</span>
            <span class="stat-value">{{ performanceStore.cacheStats.size }} KB</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 数据操作性能测试 -->
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">数据操作性能测试</h2>
      <p class="card-description">测试大量数据的过滤、排序性能</p>
    </div>

    <div class="example-content">
      <div class="data-operations">
        <div class="operation-controls">
          <select
            v-model="performanceStore.selectedCategory"
            class="form-select" @change="performanceStore.setFilter(performanceStore.selectedCategory)"
          >
            <option value="all">所有分类</option>
            <option v-for="stat in performanceStore.categoryStats" :key="stat.category" :value="stat.category">
              {{ stat.category }} ({{ stat.count }})
            </option>
          </select>

          <select
            v-model="performanceStore.sortBy" class="form-select"
            @change="performanceStore.setSorting(performanceStore.sortBy)"
          >
            <option value="name">按名称排序</option>
            <option value="value">按数值排序</option>
            <option value="timestamp">按时间排序</option>
          </select>
        </div>

        <div class="operation-results">
          <div class="result-stats">
            <span>显示 {{ performanceStore.filteredItems.length }} / {{ performanceStore.dataStats.total }} 项</span>
            <span>平均值: {{ performanceStore.dataStats.average.toFixed(2) }}</span>
          </div>

          <div class="data-preview">
            <div v-for="item in performanceStore.filteredItems.slice(0, 5)" :key="item.id" class="data-item">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-value">{{ item.value }}</span>
              <span class="item-category">{{ item.category }}</span>
            </div>

            <div v-if="performanceStore.filteredItems.length > 5" class="more-items">
              还有 {{ performanceStore.filteredItems.length - 5 }} 项...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.control-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.data-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.stat-value {
  font-weight: 600;
  font-size: 1rem;
}

.stat-value.loading {
  color: #f6ad55;
}

.stat-value.success {
  color: #38a169;
}

.stat-value.warning {
  color: #f6ad55;
}

.stat-value.danger {
  color: #e53e3e;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.search-demo,
.throttle-demo,
.cache-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-stats,
.realtime-stats,
.cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.cache-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.data-operations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.operation-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.operation-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-stats {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  color: #718096;
  flex-wrap: wrap;
}

.data-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
  font-size: 0.875rem;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-value {
  font-weight: 600;
  color: #3182ce;
  margin: 0 1rem;
}

.item-category {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.more-items {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  padding: 0.5rem;
}

.form-input,
.form-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.form-select {
  min-width: 150px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-grid {
    grid-template-columns: 1fr;
  }

  .control-panel {
    flex-direction: column;
  }

  .data-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
