# useNetwork

网络状态 Hook，提供实时的网络连接状态监控和网络质量检测功能。

## 概述

`useNetwork` 是一个用于监控网络状态的 Hook，提供以下核心功能：
- **连接状态监控**：实时检测网络连接状态
- **网络类型检测**：识别网络连接类型（WiFi、4G等）
- **网络质量评估**：检测网络速度和延迟
- **离线处理**：提供离线状态下的处理机制
- **重连机制**：自动重连和手动重连功能

## 安装和导入

```typescript
import { useNetwork } from '@ldesign/shared'
```

## API 参考

### 基础用法

**函数签名**
```typescript
interface NetworkState {
  isOnline: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface NetworkOptions {
  onOnline?: () => void
  onOffline?: () => void
  onTypeChange?: (type: string) => void
  enableSpeedTest?: boolean
  speedTestInterval?: number
}

function useNetwork(options?: NetworkOptions): {
  state: Ref<NetworkState>
  refresh: () => void
  testSpeed: () => Promise<{ download: number; upload: number }>
}
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| options | NetworkOptions | ✗ | {} | 网络监控选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| onOnline | Function | ✗ | - | 网络连接时的回调 |
| onOffline | Function | ✗ | - | 网络断开时的回调 |
| onTypeChange | Function | ✗ | - | 网络类型变化时的回调 |
| enableSpeedTest | boolean | ✗ | false | 是否启用速度测试 |
| speedTestInterval | number | ✗ | 30000 | 速度测试间隔（毫秒） |

**返回值**

| 属性 | 类型 | 描述 |
|------|------|------|
| state | Ref\<NetworkState\> | 网络状态 |
| refresh | Function | 手动刷新网络状态 |
| testSpeed | Function | 测试网络速度 |

**状态说明**

| 状态 | 类型 | 描述 |
|------|------|------|
| isOnline | boolean | 是否在线 |
| type | string | 网络连接类型 |
| effectiveType | string | 有效网络类型 |
| downlink | number | 下行速度（Mbps） |
| rtt | number | 往返时间（毫秒） |
| saveData | boolean | 是否启用数据节省模式 |

## 使用示例

### 基础网络状态监控

```vue
<template>
  <div class="network-status">
    <div class="status-indicator" :class="{ online: network.isOnline, offline: !network.isOnline }">
      {{ network.isOnline ? '在线' : '离线' }}
    </div>
    
    <div v-if="network.isOnline" class="network-info">
      <p>连接类型: {{ network.type || '未知' }}</p>
      <p>有效类型: {{ network.effectiveType || '未知' }}</p>
      <p v-if="network.downlink">下行速度: {{ network.downlink }} Mbps</p>
      <p v-if="network.rtt">往返时间: {{ network.rtt }} ms</p>
      <p v-if="network.saveData">数据节省模式: 已启用</p>
    </div>
    
    <div v-else class="offline-notice">
      <p>网络连接已断开</p>
      <button @click="refresh">重新检测</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNetwork } from '@ldesign/shared'

const { state: network, refresh } = useNetwork({
  onOnline: () => {
    console.log('网络已连接')
    // 重新加载数据
    reloadData()
  },
  
  onOffline: () => {
    console.log('网络已断开')
    // 显示离线提示
    showOfflineNotice()
  },
  
  onTypeChange: (type) => {
    console.log('网络类型变化:', type)
    // 根据网络类型调整行为
    adjustBehaviorForNetworkType(type)
  }
})

function reloadData() {
  // 重新加载页面数据
}

function showOfflineNotice() {
  // 显示离线提示
}

function adjustBehaviorForNetworkType(type: string) {
  if (type === 'cellular') {
    // 移动网络，启用数据节省模式
    enableDataSavingMode()
  } else if (type === 'wifi') {
    // WiFi 网络，可以加载高质量内容
    enableHighQualityMode()
  }
}

function enableDataSavingMode() {
  // 启用数据节省模式
}

function enableHighQualityMode() {
  // 启用高质量模式
}
</script>

<style scoped>
.status-indicator.online {
  color: green;
}

.status-indicator.offline {
  color: red;
}
</style>
```

### 智能数据加载

```vue
<template>
  <div class="data-loader">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retry">重试</button>
    </div>
    
    <div v-else class="content">
      <img 
        v-for="item in items" 
        :key="item.id"
        :src="getImageUrl(item)"
        :alt="item.title"
      />
    </div>
    
    <div v-if="network.saveData" class="data-saving-notice">
      数据节省模式已启用，图片质量已降低
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNetwork } from '@ldesign/shared'

const { state: network } = useNetwork()

const loading = ref(false)
const error = ref<string | null>(null)
const items = ref<any[]>([])

// 根据网络状况调整图片质量
const imageQuality = computed(() => {
  if (!network.value.isOnline) return 'offline'
  if (network.value.saveData) return 'low'
  if (network.value.effectiveType === 'slow-2g' || network.value.effectiveType === '2g') return 'low'
  if (network.value.effectiveType === '3g') return 'medium'
  return 'high'
})

// 根据网络状况调整请求策略
const requestStrategy = computed(() => {
  if (!network.value.isOnline) return 'cache-only'
  if (network.value.effectiveType === 'slow-2g') return 'minimal'
  if (network.value.effectiveType === '2g') return 'compressed'
  return 'full'
})

function getImageUrl(item: any): string {
  const baseUrl = item.imageUrl
  
  switch (imageQuality.value) {
    case 'low':
      return `${baseUrl}?quality=30&width=300`
    case 'medium':
      return `${baseUrl}?quality=60&width=600`
    case 'high':
      return `${baseUrl}?quality=90&width=1200`
    default:
      return '/placeholder.jpg'
  }
}

async function loadData() {
  if (!network.value.isOnline) {
    // 尝试从缓存加载
    items.value = await loadFromCache()
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const strategy = requestStrategy.value
    const response = await fetch(`/api/items?strategy=${strategy}`)
    
    if (!response.ok) {
      throw new Error('加载失败')
    }
    
    items.value = await response.json()
    
    // 缓存数据以供离线使用
    await cacheData(items.value)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
  } finally {
    loading.value = false
  }
}

async function loadFromCache(): Promise<any[]> {
  // 从缓存加载数据
  const cached = localStorage.getItem('cached-items')
  return cached ? JSON.parse(cached) : []
}

async function cacheData(data: any[]) {
  // 缓存数据
  localStorage.setItem('cached-items', JSON.stringify(data))
}

function retry() {
  loadData()
}

// 监听网络状态变化
watch(() => network.value.isOnline, (isOnline) => {
  if (isOnline) {
    // 网络恢复，重新加载数据
    loadData()
  }
})

// 监听网络类型变化
watch(() => network.value.effectiveType, () => {
  // 网络类型变化，可能需要调整加载策略
  if (network.value.isOnline) {
    loadData()
  }
})

// 初始加载
onMounted(() => {
  loadData()
})
</script>
```

### 网络速度测试

```vue
<template>
  <div class="speed-test">
    <h3>网络速度测试</h3>
    
    <div class="current-status">
      <p>当前状态: {{ network.isOnline ? '在线' : '离线' }}</p>
      <p v-if="network.downlink">估计下行速度: {{ network.downlink }} Mbps</p>
      <p v-if="network.rtt">往返时间: {{ network.rtt }} ms</p>
    </div>
    
    <div class="speed-test-controls">
      <button @click="runSpeedTest" :disabled="testing || !network.isOnline">
        {{ testing ? '测试中...' : '开始测试' }}
      </button>
      
      <button @click="toggleAutoTest">
        {{ autoTesting ? '停止自动测试' : '开始自动测试' }}
      </button>
    </div>
    
    <div v-if="speedTestResult" class="test-results">
      <h4>测试结果</h4>
      <p>下载速度: {{ speedTestResult.download.toFixed(2) }} Mbps</p>
      <p>上传速度: {{ speedTestResult.upload.toFixed(2) }} Mbps</p>
      <p>测试时间: {{ new Date(speedTestResult.timestamp).toLocaleTimeString() }}</p>
    </div>
    
    <div v-if="speedHistory.length > 0" class="speed-history">
      <h4>历史记录</h4>
      <div class="history-chart">
        <!-- 简单的速度历史图表 -->
        <div 
          v-for="(record, index) in speedHistory.slice(-10)" 
          :key="index"
          class="history-bar"
          :style="{ height: `${(record.download / maxSpeed) * 100}px` }"
          :title="`${record.download.toFixed(2)} Mbps`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useNetwork } from '@ldesign/shared'

const { state: network, testSpeed } = useNetwork({
  enableSpeedTest: true,
  speedTestInterval: 60000 // 每分钟自动测试一次
})

const testing = ref(false)
const autoTesting = ref(false)
const speedTestResult = ref<{ download: number; upload: number; timestamp: number } | null>(null)
const speedHistory = ref<Array<{ download: number; upload: number; timestamp: number }>>([])

let autoTestInterval: number | null = null

const maxSpeed = computed(() => {
  if (speedHistory.value.length === 0) return 100
  return Math.max(...speedHistory.value.map(r => r.download))
})

async function runSpeedTest() {
  if (!network.value.isOnline || testing.value) return
  
  testing.value = true
  
  try {
    const result = await testSpeed()
    const testResult = {
      ...result,
      timestamp: Date.now()
    }
    
    speedTestResult.value = testResult
    speedHistory.value.push(testResult)
    
    // 只保留最近50次测试结果
    if (speedHistory.value.length > 50) {
      speedHistory.value = speedHistory.value.slice(-50)
    }
    
    // 根据测试结果给出建议
    provideSuggestions(testResult)
    
  } catch (error) {
    console.error('速度测试失败:', error)
  } finally {
    testing.value = false
  }
}

function toggleAutoTest() {
  if (autoTesting.value) {
    // 停止自动测试
    if (autoTestInterval) {
      clearInterval(autoTestInterval)
      autoTestInterval = null
    }
    autoTesting.value = false
  } else {
    // 开始自动测试
    autoTestInterval = setInterval(runSpeedTest, 60000) // 每分钟测试一次
    autoTesting.value = true
    
    // 立即执行一次测试
    runSpeedTest()
  }
}

function provideSuggestions(result: { download: number; upload: number }) {
  if (result.download < 1) {
    console.warn('网络速度较慢，建议启用数据节省模式')
  } else if (result.download > 10) {
    console.log('网络速度良好，可以加载高质量内容')
  }
  
  if (result.upload < 0.5) {
    console.warn('上传速度较慢，大文件上传可能需要较长时间')
  }
}

// 清理定时器
onUnmounted(() => {
  if (autoTestInterval) {
    clearInterval(autoTestInterval)
  }
})
</script>

<style scoped>
.speed-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.history-chart {
  display: flex;
  align-items: flex-end;
  height: 100px;
  gap: 2px;
}

.history-bar {
  width: 20px;
  background-color: #007bff;
  min-height: 2px;
}
</style>
```

### 离线数据同步

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNetwork } from '@ldesign/shared'

const { state: network } = useNetwork()

// 离线数据队列
const offlineQueue = ref<Array<{ action: string; data: any; timestamp: number }>>([])
const syncing = ref(false)

// 监听网络状态，在线时同步离线数据
watch(() => network.value.isOnline, async (isOnline) => {
  if (isOnline && offlineQueue.value.length > 0) {
    await syncOfflineData()
  }
})

// 添加离线操作到队列
function addToOfflineQueue(action: string, data: any) {
  offlineQueue.value.push({
    action,
    data,
    timestamp: Date.now()
  })
  
  // 保存到本地存储
  localStorage.setItem('offline-queue', JSON.stringify(offlineQueue.value))
}

// 同步离线数据
async function syncOfflineData() {
  if (syncing.value || !network.value.isOnline) return
  
  syncing.value = true
  
  try {
    const queue = [...offlineQueue.value]
    
    for (const item of queue) {
      try {
        await syncSingleItem(item)
        
        // 成功同步后从队列中移除
        const index = offlineQueue.value.findIndex(q => 
          q.timestamp === item.timestamp && q.action === item.action
        )
        if (index > -1) {
          offlineQueue.value.splice(index, 1)
        }
        
      } catch (error) {
        console.error('同步失败:', item, error)
        // 同步失败的项目保留在队列中
      }
    }
    
    // 更新本地存储
    localStorage.setItem('offline-queue', JSON.stringify(offlineQueue.value))
    
  } finally {
    syncing.value = false
  }
}

async function syncSingleItem(item: { action: string; data: any; timestamp: number }) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
  
  if (!response.ok) {
    throw new Error(`同步失败: ${response.statusText}`)
  }
  
  return response.json()
}

// 执行操作（在线时直接执行，离线时加入队列）
async function performAction(action: string, data: any) {
  if (network.value.isOnline) {
    try {
      await syncSingleItem({ action, data, timestamp: Date.now() })
    } catch (error) {
      // 在线操作失败，加入离线队列
      addToOfflineQueue(action, data)
      throw error
    }
  } else {
    // 离线时直接加入队列
    addToOfflineQueue(action, data)
  }
}

// 初始化时从本地存储恢复离线队列
onMounted(() => {
  const saved = localStorage.getItem('offline-queue')
  if (saved) {
    try {
      offlineQueue.value = JSON.parse(saved)
    } catch (error) {
      console.error('恢复离线队列失败:', error)
    }
  }
  
  // 如果当前在线且有离线数据，立即同步
  if (network.value.isOnline && offlineQueue.value.length > 0) {
    syncOfflineData()
  }
})
</script>
```

## 高级特性

### 网络质量自适应

```typescript
class NetworkAdaptiveLoader {
  private network = useNetwork()
  
  getOptimalChunkSize(): number {
    const { effectiveType, downlink } = this.network.state.value
    
    if (effectiveType === 'slow-2g') return 64 * 1024 // 64KB
    if (effectiveType === '2g') return 128 * 1024 // 128KB
    if (effectiveType === '3g') return 512 * 1024 // 512KB
    if (downlink && downlink > 10) return 2 * 1024 * 1024 // 2MB
    
    return 1024 * 1024 // 1MB 默认
  }
  
  getOptimalConcurrency(): number {
    const { effectiveType, rtt } = this.network.state.value
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 1
    if (effectiveType === '3g') return 2
    if (rtt && rtt < 100) return 6
    
    return 3
  }
  
  shouldPreload(): boolean {
    const { effectiveType, saveData } = this.network.state.value
    
    if (saveData) return false
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return false
    
    return true
  }
}
```

## 注意事项

### 浏览器兼容性
- Network Information API 支持有限
- 提供降级方案
- 某些属性可能不可用

### 隐私考虑
- 网络信息可能涉及用户隐私
- 遵循相关隐私政策
- 避免过度收集网络数据

### 性能影响
- 避免频繁的网络检测
- 合理设置检测间隔
- 注意内存使用

## 相关功能

- [useAsyncData](/hooks/use-async-data) - 异步数据管理
- [useFetch](/hooks/use-fetch) - 数据获取 Hook
- [浏览器相关](/utils/browser) - 浏览器工具函数
