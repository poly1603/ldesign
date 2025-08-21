<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
// import { useCacheStats } from '@ldesign/cache/vue'
// import { createCache } from '@ldesign/cache'

// 临时模拟功能
function useCacheStats(options: any = {}) {
  const formattedStats = ref({
    totalItems: 0,
    totalSizeFormatted: '0 B',
    hitRatePercentage: 0,
    expiredItems: 0,
  })

  const engineUsage = ref([
    {
      engine: 'localStorage',
      available: true,
      itemCount: 0,
      sizeFormatted: '0 B',
      usage: 0,
    },
    {
      engine: 'sessionStorage',
      available: true,
      itemCount: 0,
      sizeFormatted: '0 B',
      usage: 0,
    },
    {
      engine: 'memory',
      available: true,
      itemCount: 0,
      sizeFormatted: '0 B',
      usage: 0,
    },
  ])

  const refresh = async () => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('perf_'),
    )
    formattedStats.value.totalItems = keys.length

    let totalSize = 0
    keys.forEach((key) => {
      totalSize += localStorage.getItem(key)?.length || 0
    })

    formattedStats.value.totalSizeFormatted = formatBytes(totalSize)
    formattedStats.value.hitRatePercentage = Math.floor(Math.random() * 100)
  }

  const startAutoRefresh = (interval: number) => {
    setInterval(refresh, interval)
  }

  const stopAutoRefresh = () => {
    // 简化实现
  }

  return {
    formattedStats,
    engineUsage,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
  }
}

function createCache(options: any = {}) {
  return {
    set: async (key: string, value: any, opts?: any) => {
      const data = { value, timestamp: Date.now(), ...opts }
      localStorage.setItem(`perf_${key}`, JSON.stringify(data))
    },
    get: async (key: string) => {
      const item = localStorage.getItem(`perf_${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        return parsed.value
      }
      return null
    },
    clear: async (engine?: string) => {
      const prefix = engine ? `${engine}_` : 'perf_'
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith(prefix),
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
    },
    cleanup: async () => {
      // 模拟清理过期项
    },
    getStats: async () => {
      return {
        engines: {
          memory: {
            itemCount: Math.floor(Math.random() * 50),
            size: Math.floor(Math.random() * 1024 * 1024),
          },
        },
      }
    },
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 使用缓存统计
const {
  formattedStats,
  engineUsage,
  refresh,
  startAutoRefresh,
  stopAutoRefresh,
} = useCacheStats({
  refreshInterval: 2000, // 每2秒刷新
})

// 创建专门用于性能测试的缓存管理器
const perfCache = createCache({
  defaultEngine: 'memory',
  debug: false,
})

// 响应式数据
const loading = ref(false)
const error = ref<Error | null>(null)
const autoRefresh = ref(false)
const performanceResults = ref<
  Array<{
    id: string
    name: string
    duration: number
    operations: number
    average: number
  }>
>([])
const memoryStats = ref<any>(null)

// 刷新统计
async function refreshStats() {
  await refresh()
}

// 切换自动刷新
function toggleAutoRefresh() {
  if (autoRefresh.value) {
    stopAutoRefresh()
    autoRefresh.value = false
  }
  else {
    startAutoRefresh(2000)
    autoRefresh.value = true
  }
}

// 运行性能测试
async function runPerformanceTest() {
  loading.value = true
  error.value = null

  try {
    const operations = 1000
    const testData = { test: 'performance data', timestamp: Date.now() }

    // 测试设置操作
    const setStart = performance.now()
    for (let i = 0; i < operations; i++) {
      await perfCache.set(`perf-set-${i}`, testData)
    }
    const setDuration = performance.now() - setStart

    // 测试获取操作
    const getStart = performance.now()
    for (let i = 0; i < operations; i++) {
      await perfCache.get(`perf-set-${i}`)
    }
    const getDuration = performance.now() - getStart

    // 添加结果
    performanceResults.value.unshift(
      {
        id: generateId(),
        name: `设置操作 (${operations}次)`,
        duration: Math.round(setDuration),
        operations,
        average: Number((setDuration / operations).toFixed(3)),
      },
      {
        id: generateId(),
        name: `获取操作 (${operations}次)`,
        duration: Math.round(getDuration),
        operations,
        average: Number((getDuration / operations).toFixed(3)),
      },
    )

    // 只保留最近6个结果
    if (performanceResults.value.length > 6) {
      performanceResults.value = performanceResults.value.slice(0, 6)
    }

    await refreshStats()
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 批量操作测试
async function runBatchTest() {
  loading.value = true
  error.value = null

  try {
    const batchSize = 100
    const testData = Array.from({ length: batchSize }, (_, i) => ({
      key: `batch-${i}`,
      value: { id: i, data: `batch data ${i}`, timestamp: Date.now() },
    }))

    // 单个操作测试
    const singleStart = performance.now()
    for (const item of testData) {
      await perfCache.set(item.key, item.value)
    }
    const singleDuration = performance.now() - singleStart

    // 清理
    await perfCache.clear()

    // 批量操作测试
    const batchStart = performance.now()
    await Promise.all(testData.map(item => perfCache.set(item.key, item.value)))
    const batchDuration = performance.now() - batchStart

    // 添加结果
    performanceResults.value.unshift(
      {
        id: generateId(),
        name: `单个操作 (${batchSize}次)`,
        duration: Math.round(singleDuration),
        operations: batchSize,
        average: Number((singleDuration / batchSize).toFixed(3)),
      },
      {
        id: generateId(),
        name: `并行操作 (${batchSize}次)`,
        duration: Math.round(batchDuration),
        operations: batchSize,
        average: Number((batchDuration / batchSize).toFixed(3)),
      },
    )

    await refreshStats()
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 填充内存缓存
async function fillMemoryCache() {
  loading.value = true

  try {
    for (let i = 0; i < 50; i++) {
      await perfCache.set(
        `memory-item-${i}`,
        {
          id: i,
          data: `Memory cached data ${i}`,
          timestamp: Date.now(),
          random: Math.random(),
        },
        {
          ttl: i % 2 === 0 ? 10000 : undefined, // 一半的数据10秒后过期
        },
      )
    }

    await updateMemoryStats()
    await refreshStats()
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 触发清理
async function triggerCleanup() {
  loading.value = true

  try {
    await perfCache.cleanup()
    await updateMemoryStats()
    await refreshStats()
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 清空内存缓存
async function clearMemoryCache() {
  loading.value = true

  try {
    await perfCache.clear('memory')
    await updateMemoryStats()
    await refreshStats()
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 更新内存统计
async function updateMemoryStats() {
  try {
    const stats = await perfCache.getStats()
    const memoryEngine = stats.engines.memory

    if (memoryEngine) {
      memoryStats.value = {
        totalItems: memoryEngine.itemCount,
        totalSizeFormatted: formatBytes(memoryEngine.size),
        expiredItems: 0, // 简化显示
        oldestItem: null, // 简化显示
      }
    }
  }
  catch (err) {
    console.error('Failed to update memory stats:', err)
  }
}

// 工具函数
const generateId = () => Math.random().toString(36).substring(2, 11)

// 生命周期
onMounted(() => {
  refreshStats()
})

onUnmounted(() => {
  if (autoRefresh.value) {
    stopAutoRefresh()
  }
})
</script>

<template>
  <div class="demo-card">
    <h3>📊 性能监控演示</h3>
    <p>实时监控缓存性能和使用情况</p>

    <div class="demo-section">
      <h4>缓存统计</h4>
      <button class="btn" @click="refreshStats">
        刷新统计
      </button>
      <button class="btn secondary" @click="toggleAutoRefresh">
        {{ autoRefresh ? '停止' : '开始' }}自动刷新
      </button>

      <div v-if="formattedStats" class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">
            {{ formattedStats.totalItems }}
          </div>
          <div class="stat-label">
            总缓存项
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ formattedStats.totalSizeFormatted }}
          </div>
          <div class="stat-label">
            总大小
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ formattedStats.hitRatePercentage }}%
          </div>
          <div class="stat-label">
            命中率
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ formattedStats.expiredItems }}
          </div>
          <div class="stat-label">
            过期项
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>引擎使用情况</h4>
      <div v-if="engineUsage.length > 0" class="engine-stats">
        <div
          v-for="engine in engineUsage"
          :key="engine.engine"
          class="engine-stat"
        >
          <div class="engine-header">
            <span class="engine-name">{{ engine.engine }}</span>
            <span
              class="engine-status"
              :class="{ available: engine.available }"
            >
              {{ engine.available ? '可用' : '不可用' }}
            </span>
          </div>
          <div class="engine-details">
            <span>项目数: {{ engine.itemCount }}</span>
            <span>大小: {{ engine.sizeFormatted }}</span>
            <span>使用率: {{ engine.usage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>性能测试</h4>
      <button class="btn" @click="runPerformanceTest">
        运行性能测试
      </button>
      <button class="btn" @click="runBatchTest">
        批量操作测试
      </button>

      <div v-if="performanceResults.length > 0" class="performance-results">
        <div
          v-for="result in performanceResults"
          :key="result.id"
          class="performance-result"
        >
          <div class="result-title">
            {{ result.name }}
          </div>
          <div class="result-metrics">
            <span>耗时: {{ result.duration }}ms</span>
            <span>操作数: {{ result.operations }}</span>
            <span>平均: {{ result.average }}ms/op</span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>内存管理</h4>
      <button class="btn" @click="fillMemoryCache">
        填充内存缓存
      </button>
      <button class="btn secondary" @click="triggerCleanup">
        触发清理
      </button>
      <button class="btn danger" @click="clearMemoryCache">
        清空内存缓存
      </button>

      <div v-if="memoryStats" class="code">
        <div><strong>内存统计:</strong></div>
        <div>总项目: {{ memoryStats.totalItems }}</div>
        <div>总大小: {{ memoryStats.totalSizeFormatted }}</div>
        <div>过期项: {{ memoryStats.expiredItems }}</div>
        <div v-if="memoryStats.oldestItem">
          最旧项: {{ memoryStats.oldestItem.key }} ({{
            Math.round(memoryStats.oldestItem.age / 1000)
          }}秒前)
        </div>
      </div>
    </div>

    <div v-if="loading" class="status info">
      处理中...
    </div>

    <div v-if="error" class="status error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<style scoped>
.engine-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.engine-stat {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
}

.engine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.engine-name {
  font-weight: bold;
  color: #333;
}

.engine-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #dc3545;
  color: white;
}

.engine-status.available {
  background: #28a745;
}

.engine-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.performance-results {
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.performance-result {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.result-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.result-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}
</style>
