<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const cacheKey = ref('user:123')
const cacheValue = ref('{"name": "张三", "age": 25, "role": "user"}')
const cacheTTL = ref(300)
const cacheResult = ref<any>(null)
const cacheType = ref('memory')
const evictionPolicy = ref('lru')
const maxCacheSize = ref(10)
const cacheFilter = ref('all')
const testDataSize = ref(1000)
const isTestRunning = ref(false)
const performanceResult = ref<any>(null)
const selectedCacheItem = ref<any>(null)

const cacheStats = reactive({
  hitRate: 0,
  totalRequests: 0,
  hits: 0,
  misses: 0,
  size: 0,
  count: 0,
})

const cacheItems = reactive<any[]>([])

// 模拟缓存数据
const mockCache = new Map()
const cacheAccessLog = new Map()

// 计算属性
const filteredCacheItems = computed(() => {
  switch (cacheFilter.value) {
    case 'expired':
      return cacheItems.filter(item => item.expired)
    case 'active':
      return cacheItems.filter(item => !item.expired)
    default:
      return cacheItems
  }
})

// 方法
function setCache() {
  try {
    let value = cacheValue.value
    try {
      value = JSON.parse(cacheValue.value)
    }
    catch {
      // 保持原始字符串
    }

    const expiresAt = cacheTTL.value > 0 ? Date.now() + cacheTTL.value * 1000 : null

    const cacheItem = {
      key: cacheKey.value,
      value,
      type: cacheType.value,
      size: Math.round(JSON.stringify(value).length / 1024 * 100) / 100,
      createdAt: Date.now(),
      expiresAt,
      accessCount: 0,
      expired: false,
    }

    mockCache.set(cacheKey.value, cacheItem)

    cacheResult.value = {
      success: true,
      message: '缓存设置成功',
      key: cacheKey.value,
      ttl: cacheTTL.value,
    }

    refreshCacheList()
    refreshCacheStats()

    emit('log', 'success', `设置缓存: ${cacheKey.value}`, cacheItem)
  }
  catch (error: any) {
    cacheResult.value = {
      success: false,
      message: `设置失败: ${error.message}`,
    }
    emit('log', 'error', '设置缓存失败', error)
  }
}

function getCache() {
  try {
    const item = mockCache.get(cacheKey.value)

    if (!item) {
      cacheResult.value = {
        success: false,
        message: '缓存未找到',
        hit: false,
      }
      updateCacheStats(false)
      emit('log', 'warning', `缓存未命中: ${cacheKey.value}`)
      return
    }

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      mockCache.delete(cacheKey.value)
      cacheResult.value = {
        success: false,
        message: '缓存已过期',
        hit: false,
      }
      updateCacheStats(false)
      emit('log', 'warning', `缓存已过期: ${cacheKey.value}`)
      return
    }

    // 更新访问计数
    item.accessCount++

    cacheResult.value = {
      success: true,
      message: '缓存命中',
      value: item.value,
      hit: true,
      accessCount: item.accessCount,
    }

    updateCacheStats(true)
    refreshCacheList()

    emit('log', 'success', `缓存命中: ${cacheKey.value}`, item.value)
  }
  catch (error: any) {
    cacheResult.value = {
      success: false,
      message: `获取失败: ${error.message}`,
    }
    emit('log', 'error', '获取缓存失败', error)
  }
}

function deleteCache() {
  try {
    const deleted = mockCache.delete(cacheKey.value)

    cacheResult.value = {
      success: deleted,
      message: deleted ? '缓存删除成功' : '缓存不存在',
    }

    refreshCacheList()
    refreshCacheStats()

    emit('log', deleted ? 'success' : 'warning', `删除缓存: ${cacheKey.value}`)
  }
  catch (error: any) {
    cacheResult.value = {
      success: false,
      message: `删除失败: ${error.message}`,
    }
    emit('log', 'error', '删除缓存失败', error)
  }
}

function applyCacheStrategy() {
  emit('log', 'info', `应用缓存策略: ${cacheType.value}, ${evictionPolicy.value}, ${maxCacheSize.value}MB`)
}

function testCacheStrategy() {
  // 模拟策略测试
  const strategies = {
    lru: '最近最少使用策略测试完成',
    lfu: '最少使用频率策略测试完成',
    fifo: '先进先出策略测试完成',
    ttl: '基于时间策略测试完成',
  }

  emit('log', 'success', strategies[evictionPolicy.value as keyof typeof strategies])
}

function updateCacheStats(hit: boolean) {
  cacheStats.totalRequests++
  if (hit) {
    cacheStats.hits++
  }
  else {
    cacheStats.misses++
  }
  cacheStats.hitRate = Math.round((cacheStats.hits / cacheStats.totalRequests) * 100)
}

function refreshCacheStats() {
  cacheStats.count = mockCache.size
  cacheStats.size = Array.from(mockCache.values())
    .reduce((total, item) => total + item.size, 0)
}

function refreshCacheList() {
  cacheItems.splice(0, cacheItems.length)

  Array.from(mockCache.values()).forEach((item) => {
    const expired = item.expiresAt && Date.now() > item.expiresAt
    cacheItems.push({
      ...item,
      expired,
    })
  })

  // 清理过期项
  cacheItems.filter(item => item.expired).forEach((item) => {
    mockCache.delete(item.key)
  })
}

function clearAllCache() {
  mockCache.clear()
  cacheItems.splice(0, cacheItems.length)
  refreshCacheStats()
  emit('log', 'warning', '清空所有缓存')
}

function viewCacheItem(item: any) {
  selectedCacheItem.value = item
}

function closeModal() {
  selectedCacheItem.value = null
}

function refreshCacheItem(key: string) {
  const item = mockCache.get(key)
  if (item) {
    item.accessCount++
    refreshCacheList()
    emit('log', 'info', `刷新缓存项: ${key}`)
  }
}

function deleteCacheItem(key: string) {
  mockCache.delete(key)
  refreshCacheList()
  refreshCacheStats()
  emit('log', 'warning', `删除缓存项: ${key}`)
}

async function runPerformanceTest() {
  isTestRunning.value = true

  try {
    const testData = Array.from({ length: testDataSize.value }, (_, i) => ({
      key: `test:${i}`,
      value: { id: i, data: `test data ${i}`, timestamp: Date.now() },
    }))

    // 写入测试
    const writeStart = performance.now()
    testData.forEach((item) => {
      mockCache.set(item.key, {
        key: item.key,
        value: item.value,
        type: 'memory',
        size: Math.round(JSON.stringify(item.value).length / 1024 * 100) / 100,
        createdAt: Date.now(),
        expiresAt: null,
        accessCount: 0,
        expired: false,
      })
    })
    const writeEnd = performance.now()
    const writeTime = Math.round(writeEnd - writeStart)

    // 读取测试
    const readStart = performance.now()
    testData.forEach((item) => {
      mockCache.get(item.key)
    })
    const readEnd = performance.now()
    const readTime = Math.round(readEnd - readStart)

    performanceResult.value = {
      writeTime,
      readTime,
      writeSpeed: Math.round(testDataSize.value / (writeTime / 1000)),
      readSpeed: Math.round(testDataSize.value / (readTime / 1000)),
    }

    refreshCacheList()
    refreshCacheStats()

    emit('log', 'success', '性能测试完成', performanceResult.value)
  }
  catch (error: any) {
    emit('log', 'error', '性能测试失败', error)
  }
  finally {
    isTestRunning.value = false
  }
}

function benchmarkCacheTypes() {
  const results = {
    memory: { read: 1000000, write: 800000 },
    localStorage: { read: 50000, write: 30000 },
    sessionStorage: { read: 45000, write: 28000 },
    indexedDB: { read: 20000, write: 15000 },
  }

  emit('log', 'info', '缓存类型对比测试完成', results)
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  // 初始化一些示例数据
  const sampleData = [
    { key: 'user:1', value: { name: '张三', role: 'admin' } },
    { key: 'config:app', value: { theme: 'dark', lang: 'zh-CN' } },
    { key: 'session:abc123', value: { userId: 1, loginTime: Date.now() } },
  ]

  sampleData.forEach((item) => {
    mockCache.set(item.key, {
      key: item.key,
      value: item.value,
      type: 'memory',
      size: Math.round(JSON.stringify(item.value).length / 1024 * 100) / 100,
      createdAt: Date.now() - Math.random() * 3600000,
      expiresAt: null,
      accessCount: Math.floor(Math.random() * 10),
      expired: false,
    })
  })

  refreshCacheList()
  refreshCacheStats()

  emit('log', 'info', '缓存管理器演示已加载')
})
</script>

<template>
  <div class="cache-demo">
    <div class="demo-header">
      <h2>💾 缓存管理器演示</h2>
      <p>CacheManager 提供了多层缓存机制，支持内存缓存、本地存储、过期策略等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础缓存操作 -->
      <div class="card">
        <div class="card-header">
          <h3>基础缓存操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>缓存键</label>
            <input
              v-model="cacheKey"
              type="text"
              placeholder="例如: user:123"
            >
          </div>

          <div class="form-group">
            <label>缓存值</label>
            <textarea
              v-model="cacheValue"
              placeholder="输入缓存数据 (JSON 格式)"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label>过期时间 (秒)</label>
            <input
              v-model.number="cacheTTL"
              type="number"
              min="0"
              placeholder="0 表示永不过期"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="setCache">
                设置缓存
              </button>
              <button class="btn btn-secondary" @click="getCache">
                获取缓存
              </button>
              <button class="btn btn-warning" @click="deleteCache">
                删除缓存
              </button>
            </div>
          </div>

          <div v-if="cacheResult" class="cache-result">
            <h4>操作结果</h4>
            <pre>{{ JSON.stringify(cacheResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 缓存策略 -->
      <div class="card">
        <div class="card-header">
          <h3>缓存策略</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>缓存类型</label>
            <select v-model="cacheType">
              <option value="memory">
                内存缓存
              </option>
              <option value="localStorage">
                本地存储
              </option>
              <option value="sessionStorage">
                会话存储
              </option>
              <option value="indexedDB">
                IndexedDB
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>淘汰策略</label>
            <select v-model="evictionPolicy">
              <option value="lru">
                LRU (最近最少使用)
              </option>
              <option value="lfu">
                LFU (最少使用频率)
              </option>
              <option value="fifo">
                FIFO (先进先出)
              </option>
              <option value="ttl">
                TTL (基于时间)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>最大缓存大小 (MB)</label>
            <input
              v-model.number="maxCacheSize"
              type="number"
              min="1"
              max="100"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="applyCacheStrategy">
                应用策略
              </button>
              <button class="btn btn-secondary" @click="testCacheStrategy">
                测试策略
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 缓存统计 -->
      <div class="card">
        <div class="card-header">
          <h3>缓存统计</h3>
        </div>
        <div class="card-body">
          <div class="cache-stats">
            <div class="stat-item">
              <label>缓存命中率:</label>
              <span>{{ cacheStats.hitRate }}%</span>
            </div>
            <div class="stat-item">
              <label>总请求数:</label>
              <span>{{ cacheStats.totalRequests }}</span>
            </div>
            <div class="stat-item">
              <label>命中次数:</label>
              <span>{{ cacheStats.hits }}</span>
            </div>
            <div class="stat-item">
              <label>未命中次数:</label>
              <span>{{ cacheStats.misses }}</span>
            </div>
            <div class="stat-item">
              <label>缓存大小:</label>
              <span>{{ cacheStats.size }} MB</span>
            </div>
            <div class="stat-item">
              <label>缓存项数:</label>
              <span>{{ cacheStats.count }}</span>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="refreshCacheStats">
                刷新统计
              </button>
              <button class="btn btn-warning" @click="clearAllCache">
                清空缓存
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 缓存项列表 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>缓存项列表</h3>
          <div class="header-actions">
            <select v-model="cacheFilter">
              <option value="all">
                全部
              </option>
              <option value="expired">
                已过期
              </option>
              <option value="active">
                活跃
              </option>
            </select>
            <button class="btn btn-secondary btn-sm" @click="refreshCacheList">
              刷新
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="cache-list">
            <div
              v-for="item in filteredCacheItems"
              :key="item.key"
              class="cache-item"
              :class="{ expired: item.expired }"
            >
              <div class="cache-info">
                <div class="cache-key">
                  {{ item.key }}
                </div>
                <div class="cache-meta">
                  <span>类型: {{ item.type }}</span>
                  <span>大小: {{ item.size }} KB</span>
                  <span>创建: {{ formatTime(item.createdAt) }}</span>
                  <span v-if="item.expiresAt">过期: {{ formatTime(item.expiresAt) }}</span>
                  <span>访问: {{ item.accessCount }} 次</span>
                </div>
              </div>
              <div class="cache-actions">
                <button
                  class="btn btn-secondary btn-sm"
                  @click="viewCacheItem(item)"
                >
                  查看
                </button>
                <button
                  class="btn btn-warning btn-sm"
                  @click="refreshCacheItem(item.key)"
                >
                  刷新
                </button>
                <button
                  class="btn btn-error btn-sm"
                  @click="deleteCacheItem(item.key)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能测试 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>缓存性能测试</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>测试数据量</label>
            <input
              v-model.number="testDataSize"
              type="number"
              min="100"
              max="10000"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-primary"
                :disabled="isTestRunning"
                @click="runPerformanceTest"
              >
                {{ isTestRunning ? '测试中...' : '运行性能测试' }}
              </button>
              <button class="btn btn-secondary" @click="benchmarkCacheTypes">
                对比测试
              </button>
            </div>
          </div>

          <div v-if="performanceResult" class="performance-result">
            <h4>性能测试结果</h4>
            <div class="result-grid">
              <div class="result-item">
                <label>写入耗时:</label>
                <span>{{ performanceResult.writeTime }}ms</span>
              </div>
              <div class="result-item">
                <label>读取耗时:</label>
                <span>{{ performanceResult.readTime }}ms</span>
              </div>
              <div class="result-item">
                <label>写入速度:</label>
                <span>{{ performanceResult.writeSpeed }} ops/s</span>
              </div>
              <div class="result-item">
                <label>读取速度:</label>
                <span>{{ performanceResult.readSpeed }} ops/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 缓存详情模态框 -->
    <div v-if="selectedCacheItem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>缓存项详情</h3>
          <button class="modal-close" @click="closeModal">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <label>键:</label>
            <span>{{ selectedCacheItem.key }}</span>
          </div>
          <div class="detail-item">
            <label>值:</label>
            <pre>{{ JSON.stringify(selectedCacheItem.value, null, 2) }}</pre>
          </div>
          <div class="detail-item">
            <label>类型:</label>
            <span>{{ selectedCacheItem.type }}</span>
          </div>
          <div class="detail-item">
            <label>大小:</label>
            <span>{{ selectedCacheItem.size }} KB</span>
          </div>
          <div class="detail-item">
            <label>创建时间:</label>
            <span>{{ new Date(selectedCacheItem.createdAt).toLocaleString() }}</span>
          </div>
          <div v-if="selectedCacheItem.expiresAt" class="detail-item">
            <label>过期时间:</label>
            <span>{{ new Date(selectedCacheItem.expiresAt).toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <label>访问次数:</label>
            <span>{{ selectedCacheItem.accessCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cache-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .cache-result {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    pre {
      background: var(--bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      font-size: 12px;
      overflow-x: auto;
    }
  }

  .cache-stats {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      label {
        font-weight: 500;
      }

      span {
        font-family: monospace;
        color: var(--primary-color);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .cache-list {
    max-height: 400px;
    overflow-y: auto;

    .cache-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border-left: 4px solid var(--success-color);

      &.expired {
        border-left-color: var(--error-color);
        opacity: 0.6;
      }

      .cache-info {
        flex: 1;

        .cache-key {
          font-weight: 500;
          font-family: monospace;
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
        }

        .cache-meta {
          display: flex;
          gap: var(--spacing-md);
          font-size: 12px;
          color: var(--text-secondary);

          span {
            white-space: nowrap;
          }
        }
      }

      .cache-actions {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }

  .performance-result {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-sm);

      .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: var(--border-radius);

        label {
          font-weight: 500;
          font-size: 12px;
        }

        span {
          font-family: monospace;
          color: var(--primary-color);
        }
      }
    }
  }
}

// 模态框样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    background: var(--bg-primary);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--border-color);

      h3 {
        margin: 0;
        font-size: 18px;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-muted);

        &:hover {
          color: var(--text-primary);
        }
      }
    }

    .modal-body {
      padding: var(--spacing-md);

      .detail-item {
        display: flex;
        margin-bottom: var(--spacing-md);

        label {
          font-weight: 500;
          min-width: 100px;
          color: var(--text-primary);
        }

        span {
          flex: 1;
          color: var(--text-secondary);
          font-family: monospace;
        }

        pre {
          flex: 1;
          background: var(--bg-secondary);
          padding: var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 12px;
          overflow-x: auto;
          margin: 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .cache-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .cache-item {
    flex-direction: column;
    align-items: flex-start !important;

    .cache-actions {
      margin-top: var(--spacing-sm);
    }
  }

  .cache-meta {
    flex-direction: column !important;
    gap: var(--spacing-xs) !important;
  }

  .result-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
