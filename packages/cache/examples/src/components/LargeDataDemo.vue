<script setup lang="ts">
import { ref } from 'vue'

// 响应式数据
const loading = ref(false)
const loadingMessage = ref('')
const error = ref<Error | null>(null)
const dataSize = ref('medium')
const generatedData = ref<{
  count: number
  sizeFormatted: string
  duration: number
} | null>(null)

const storageResults = ref<
  Array<{
    engine: string
    success: boolean
    storeDuration: number
    readDuration: number
    error?: string
  }>
>([])

const batchResults = ref<{
  setCount: number
  setDuration: number
  getCount: number
  getDuration: number
  deleteCount: number
  deleteDuration: number
  averageTime: number
} | null>(null)

const memoryInfo = ref<{
  totalFormatted: string
  usedFormatted: string
  availableFormatted: string
  usagePercentage: number
} | null>(null)

const cacheStats = ref({
  totalItems: 0,
  totalSizeFormatted: '0 B',
  hitRatePercentage: 0,
})

// 数据大小配置
const dataSizeConfig = {
  small: 100,
  medium: 1000,
  large: 10000,
  huge: 50000,
}

// 生成测试数据
async function generateData() {
  loading.value = true
  loadingMessage.value = '正在生成数据...'
  error.value = null

  try {
    const count = dataSizeConfig[dataSize.value as keyof typeof dataSizeConfig]
    const startTime = performance.now()

    const data = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `这是第 ${i} 个测试数据项，包含一些描述信息`,
      timestamp: Date.now(),
      metadata: {
        category: `category-${i % 10}`,
        tags: [`tag-${i % 5}`, `tag-${(i + 1) % 5}`],
        score: Math.random() * 100,
      },
      content: `这是一些较长的内容数据，用于测试存储性能。项目编号: ${i}，随机数: ${Math.random()}`,
    }))

    const endTime = performance.now()
    const dataString = JSON.stringify(data)
    const dataSizeBytes = new Blob([dataString]).size

    generatedData.value = {
      count,
      sizeFormatted: formatBytes(dataSizeBytes),
      duration: Math.round(endTime - startTime),
    }

    // 存储到 localStorage 用于后续测试
    localStorage.setItem('large-data-demo', dataString)
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

// 清空数据
function clearData() {
  localStorage.removeItem('large-data-demo')
  generatedData.value = null
  storageResults.value = []
  batchResults.value = null
}

// 测试存储性能
async function testStoragePerformance() {
  if (!generatedData.value) {
    error.value = new Error('请先生成数据')
    return
  }

  loading.value = true
  loadingMessage.value = '测试存储性能...'
  storageResults.value = []

  const testData = localStorage.getItem('large-data-demo')
  if (!testData) {
    error.value = new Error('测试数据不存在')
    loading.value = false
    return
  }

  const engines = ['localStorage', 'sessionStorage', 'indexedDB']

  for (const engine of engines) {
    try {
      const testKey = `perf-test-${engine}`

      // 测试存储
      const storeStart = performance.now()
      if (engine === 'localStorage') {
        localStorage.setItem(testKey, testData)
      }
      else if (engine === 'sessionStorage') {
        sessionStorage.setItem(testKey, testData)
      }
      const storeEnd = performance.now()

      // 测试读取
      const readStart = performance.now()
      let readData = null
      if (engine === 'localStorage') {
        readData = localStorage.getItem(testKey)
      }
      else if (engine === 'sessionStorage') {
        readData = sessionStorage.getItem(testKey)
      }
      const readEnd = performance.now()

      storageResults.value.push({
        engine,
        success: readData === testData,
        storeDuration: Math.round(storeEnd - storeStart),
        readDuration: Math.round(readEnd - readStart),
      })
    }
    catch (err) {
      storageResults.value.push({
        engine,
        success: false,
        storeDuration: 0,
        readDuration: 0,
        error: (err as Error).message,
      })
    }
  }

  loading.value = false
  loadingMessage.value = ''
}

// 测试批量操作
async function testBatchOperations() {
  loading.value = true
  loadingMessage.value = '测试批量操作...'

  try {
    const batchSize = 1000
    const testData = Array.from({ length: batchSize }, (_, i) => ({
      key: `batch-${i}`,
      value: { id: i, data: `batch data ${i}` },
    }))

    // 批量设置
    const setStart = performance.now()
    testData.forEach((item) => {
      localStorage.setItem(`batch_${item.key}`, JSON.stringify(item.value))
    })
    const setEnd = performance.now()

    // 批量获取
    const getStart = performance.now()
    testData.forEach((item) => {
      localStorage.getItem(`batch_${item.key}`)
    })
    const getEnd = performance.now()

    // 批量删除
    const deleteStart = performance.now()
    testData.forEach((item) => {
      localStorage.removeItem(`batch_${item.key}`)
    })
    const deleteEnd = performance.now()

    const setDuration = setEnd - setStart
    const getDuration = getEnd - getStart
    const deleteDuration = deleteEnd - deleteStart
    const totalDuration = setDuration + getDuration + deleteDuration

    batchResults.value = {
      setCount: batchSize,
      setDuration: Math.round(setDuration),
      getCount: batchSize,
      getDuration: Math.round(getDuration),
      deleteCount: batchSize,
      deleteDuration: Math.round(deleteDuration),
      averageTime: Number((totalDuration / (batchSize * 3)).toFixed(3)),
    }
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

// 监控内存使用
function monitorMemory() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const total = memory.jsHeapSizeLimit
    const used = memory.usedJSHeapSize
    const available = total - used

    memoryInfo.value = {
      totalFormatted: formatBytes(total),
      usedFormatted: formatBytes(used),
      availableFormatted: formatBytes(available),
      usagePercentage: Math.round((used / total) * 100),
    }
  }
  else {
    // 模拟内存信息
    const mockUsed = Math.random() * 100 * 1024 * 1024 // 0-100MB
    const mockTotal = 200 * 1024 * 1024 // 200MB

    memoryInfo.value = {
      totalFormatted: formatBytes(mockTotal),
      usedFormatted: formatBytes(mockUsed),
      availableFormatted: formatBytes(mockTotal - mockUsed),
      usagePercentage: Math.round((mockUsed / mockTotal) * 100),
    }
  }
}

// 工具函数
function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>

<template>
  <div class="demo-card">
    <h3>📦 大数据处理演示</h3>
    <p>演示大容量数据的存储和处理能力</p>

    <div class="demo-section">
      <h4>数据生成</h4>
      <div class="data-controls">
        <label>
          数据量:
          <select v-model="dataSize" style="margin-left: 8px; padding: 4px">
            <option value="small">小 (100 项)</option>
            <option value="medium">中 (1,000 项)</option>
            <option value="large">大 (10,000 项)</option>
            <option value="huge">超大 (50,000 项)</option>
          </select>
        </label>

        <button class="btn" :disabled="loading" @click="generateData">
          {{ loading ? '生成中...' : '生成数据' }}
        </button>

        <button class="btn danger" @click="clearData">
          清空数据
        </button>
      </div>

      <div v-if="generatedData" class="data-info">
        <div>已生成: {{ generatedData.count.toLocaleString() }} 项数据</div>
        <div>数据大小: {{ generatedData.sizeFormatted }}</div>
        <div>生成耗时: {{ generatedData.duration }}ms</div>
      </div>
    </div>

    <div class="demo-section">
      <h4>存储性能测试</h4>
      <button class="btn" :disabled="loading" @click="testStoragePerformance">
        测试存储性能
      </button>

      <div v-if="storageResults.length > 0" class="performance-results">
        <div
          v-for="result in storageResults"
          :key="result.engine"
          class="performance-result"
        >
          <div class="result-header">
            <strong>{{ result.engine }}</strong>
            <span
              class="status-badge"
              :class="result.success ? 'success' : 'error'"
            >
              {{ result.success ? '成功' : '失败' }}
            </span>
          </div>
          <div class="result-details">
            <span>存储耗时: {{ result.storeDuration }}ms</span>
            <span>读取耗时: {{ result.readDuration }}ms</span>
            <span v-if="result.error">错误: {{ result.error }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>批量操作</h4>
      <button class="btn" :disabled="loading" @click="testBatchOperations">
        批量操作测试
      </button>

      <div v-if="batchResults" class="code">
        <div><strong>批量操作结果:</strong></div>
        <div>
          设置 {{ batchResults.setCount }} 项: {{ batchResults.setDuration }}ms
        </div>
        <div>
          获取 {{ batchResults.getCount }} 项: {{ batchResults.getDuration }}ms
        </div>
        <div>
          删除 {{ batchResults.deleteCount }} 项:
          {{ batchResults.deleteDuration }}ms
        </div>
        <div>平均操作时间: {{ batchResults.averageTime }}ms/项</div>
      </div>
    </div>

    <div class="demo-section">
      <h4>内存使用监控</h4>
      <button class="btn secondary" @click="monitorMemory">
        监控内存
      </button>

      <div v-if="memoryInfo" class="memory-info">
        <div class="memory-item">
          <span>已用内存:</span>
          <div class="memory-bar">
            <div
              class="memory-fill"
              :style="{ width: `${memoryInfo.usagePercentage}%` }"
            />
          </div>
          <span>{{ memoryInfo.usagePercentage }}%</span>
        </div>

        <div class="memory-details">
          <div>总内存: {{ memoryInfo.totalFormatted }}</div>
          <div>已用: {{ memoryInfo.usedFormatted }}</div>
          <div>可用: {{ memoryInfo.availableFormatted }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="status info">
      {{ loadingMessage }}
    </div>

    <div v-if="error" class="status error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<style scoped>
.data-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.data-controls label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.data-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
}

.data-info div {
  margin-bottom: 4px;
}

.performance-results {
  margin-top: 16px;
}

.performance-result {
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

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.status-badge.success {
  background: #28a745;
}
.status-badge.error {
  background: #dc3545;
}

.result-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  flex-wrap: wrap;
  gap: 8px;
}

.memory-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
}

.memory-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.memory-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.memory-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
  transition: width 0.3s ease;
}

.memory-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}
</style>
