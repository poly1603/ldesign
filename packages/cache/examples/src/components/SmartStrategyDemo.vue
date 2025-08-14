<template>
  <div class="demo-card">
    <h3>🧠 智能策略演示</h3>
    <p>演示根据数据特征自动选择最适合的存储引擎</p>

    <div class="demo-section">
      <h4>数据大小策略</h4>
      <button @click="testSmallData" class="btn">
        小数据 (→ localStorage)
      </button>
      <button @click="testMediumData" class="btn">
        中等数据 (→ sessionStorage)
      </button>
      <button @click="testLargeData" class="btn">大数据 (→ IndexedDB)</button>
    </div>

    <div class="demo-section">
      <h4>TTL 策略</h4>
      <button @click="testShortTTL" class="btn">短期缓存 (→ Memory)</button>
      <button @click="testMediumTTL" class="btn">
        中期缓存 (→ sessionStorage)
      </button>
      <button @click="testLongTTL" class="btn">
        长期缓存 (→ localStorage)
      </button>
    </div>

    <div class="demo-section">
      <h4>数据类型策略</h4>
      <button @click="testSimpleType" class="btn">
        简单类型 (→ localStorage)
      </button>
      <button @click="testComplexObject" class="btn">
        复杂对象 (→ IndexedDB)
      </button>
      <button @click="testArrayData" class="btn">数组数据 (→ IndexedDB)</button>
    </div>

    <div v-if="strategyResults.length > 0" class="strategy-results">
      <h4>策略选择结果</h4>
      <div
        v-for="result in strategyResults"
        :key="result.id"
        class="strategy-result"
      >
        <div class="result-header">
          <strong>{{ result.description }}</strong>
          <span class="engine-badge" :class="result.engine">{{
            result.engine
          }}</span>
        </div>
        <div class="result-details">
          <span>原因: {{ result.reason }}</span>
          <span>置信度: {{ (result.confidence * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <button @click="clearResults" class="btn secondary">清空结果</button>
      <button @click="testAllStrategies" class="btn">测试所有策略</button>
    </div>

    <div v-if="loading" class="status info">策略分析中...</div>

    <div v-if="error" class="status error">错误: {{ error.message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { createCache } from '@ldesign/cache'

// 临时模拟 createCache 功能
const createCache = (options: any = {}) => {
  return {
    set: async (key: string, value: any, opts?: any) => {
      const data = { value, timestamp: Date.now(), ...opts }
      localStorage.setItem(`smart_${key}`, JSON.stringify(data))
    },
    get: async (key: string) => {
      const item = localStorage.getItem(`smart_${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        return parsed.value
      }
      return null
    },
    keys: async () => {
      return Object.keys(localStorage)
        .filter(key => key.startsWith('smart_'))
        .map(key => key.replace('smart_', ''))
    },
    clear: async () => {
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('smart_')
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
    },
  }
}

// 创建启用智能策略的缓存管理器
const smartCache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB
      medium: 64 * 1024, // 64KB
      large: 1024 * 1024, // 1MB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟
      medium: 24 * 60 * 60 * 1000, // 24小时
      long: 7 * 24 * 60 * 60 * 1000, // 7天
    },
  },
  debug: true,
})

// 监听策略选择事件
smartCache.on('strategy', (event: any) => {
  if (event.strategy) {
    addResult(
      `策略选择: ${event.key}`,
      event.engine,
      event.strategy.reason,
      event.strategy.confidence
    )
  }
})

interface StrategyResult {
  id: string
  description: string
  engine: string
  reason: string
  confidence: number
}

const loading = ref(false)
const error = ref<Error | null>(null)
const strategyResults = ref<StrategyResult[]>([])
const allKeys = ref<string[]>([])

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 11)

// 添加策略结果
const addResult = (
  description: string,
  engine: string,
  reason: string,
  confidence: number
) => {
  strategyResults.value.unshift({
    id: generateId(),
    description,
    engine,
    reason,
    confidence,
  })

  // 只保留最近10个结果
  if (strategyResults.value.length > 10) {
    strategyResults.value = strategyResults.value.slice(0, 10)
  }
}

// 测试策略选择
const simulateStrategy = async (
  description: string,
  data: any,
  options?: any
) => {
  loading.value = true
  error.value = null

  try {
    // 设置数据，策略选择结果会通过事件监听器自动添加到结果中
    await smartCache.set(`strategy-test-${generateId()}`, data, options)
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

// 测试小数据
const testSmallData = () => {
  simulateStrategy('小数据测试', 'small string data')
}

// 测试中等数据
const testMediumData = () => {
  const mediumData = 'x'.repeat(10 * 1024) // 10KB
  simulateStrategy('中等数据测试', mediumData)
}

// 测试大数据
const testLargeData = () => {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    data: `large-item-${i}`,
    timestamp: Date.now(),
  }))
  simulateStrategy('大数据测试', largeData)
}

// 测试短期TTL
const testShortTTL = () => {
  simulateStrategy('短期缓存测试', 'temporary data', { ttl: 1000 })
}

// 测试中期TTL
const testMediumTTL = () => {
  simulateStrategy('中期缓存测试', 'session data', { ttl: 2 * 60 * 60 * 1000 })
}

// 测试长期TTL
const testLongTTL = () => {
  simulateStrategy('长期缓存测试', 'persistent data', {
    ttl: 30 * 24 * 60 * 60 * 1000,
  })
}

// 测试简单类型
const testSimpleType = () => {
  simulateStrategy('简单类型测试', 42)
}

// 测试复杂对象
const testComplexObject = () => {
  const complexObj = {
    user: {
      id: 1,
      profile: {
        name: '张三',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    },
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
    },
  }
  simulateStrategy('复杂对象测试', complexObj)
}

// 测试数组数据
const testArrayData = () => {
  const arrayData = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random(),
  }))
  simulateStrategy('数组数据测试', arrayData)
}

// 获取所有键
const getAllKeys = async () => {
  try {
    const keyList = await smartCache.keys()
    allKeys.value = keyList
  } catch (err) {
    error.value = err as Error
  }
}

// 清空所有缓存
const clearAllCache = async () => {
  try {
    await smartCache.clear()
    allKeys.value = []
    strategyResults.value = []
  } catch (err) {
    error.value = err as Error
  }
}

// 清空结果
const clearResults = () => {
  strategyResults.value = []
}

// 测试所有策略
const testAllStrategies = async () => {
  await testSmallData()
  await new Promise(resolve => setTimeout(resolve, 100))
  await testLargeData()
  await new Promise(resolve => setTimeout(resolve, 100))
  await testShortTTL()
  await new Promise(resolve => setTimeout(resolve, 100))
  await testComplexObject()
}
</script>

<style scoped>
.strategy-results {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.strategy-result {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.engine-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.engine-badge.localStorage {
  background: #28a745;
}
.engine-badge.sessionStorage {
  background: #17a2b8;
}
.engine-badge.cookie {
  background: #ffc107;
  color: #333;
}
.engine-badge.indexedDB {
  background: #6f42c1;
}
.engine-badge.memory {
  background: #fd7e14;
}

.result-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}
</style>
