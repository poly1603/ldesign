<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

// 模拟 useCache 功能（实际应该从 @ldesign/cache/vue 导入）
function useCache(options: any = {}) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const set = async (key: string, value: any, opts?: any) => {
    loading.value = true
    try {
      localStorage.setItem(
        `demo_${key}`,
        JSON.stringify({ value, timestamp: Date.now(), ...opts }),
      )
    }
    catch (err) {
      error.value = err as Error
    }
    finally {
      loading.value = false
    }
  }

  const get = async (key: string) => {
    try {
      const item = localStorage.getItem(`demo_${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        return parsed.value
      }
      return null
    }
    catch (err) {
      error.value = err as Error
      return null
    }
  }

  const remove = async (key: string) => {
    localStorage.removeItem(`demo_${key}`)
  }

  const clear = async () => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('demo_'),
    )
    keys.forEach(key => localStorage.removeItem(key))
  }

  const keys = async () => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('demo_'))
      .map(key => key.replace('demo_', ''))
  }

  return { set, get, remove, clear, keys, loading, error }
}

// 模拟 useCacheStats 功能
function useCacheStats() {
  const stats = ref({
    totalItems: 0,
    totalSizeFormatted: '0 B',
    hitRatePercentage: 0,
  })

  const refresh = async () => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('demo_'),
    )
    stats.value.totalItems = keys.length

    let totalSize = 0
    keys.forEach((key) => {
      totalSize += localStorage.getItem(key)?.length || 0
    })

    stats.value.totalSizeFormatted = formatBytes(totalSize)
    stats.value.hitRatePercentage = Math.floor(Math.random() * 100) // 模拟命中率
  }

  return { formattedStats: stats, refresh }
}

// 使用缓存功能
const { set, get, remove, clear, keys, loading, error } = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'vue_demo_',
})

const { formattedStats: cacheStats, refresh: refreshStats } = useCacheStats()

// 响应式数据
const reactiveKey = ref('user-preference')
const reactiveValue = ref({ value: '' })
const autoSaveEnabled = ref(true)
const autoSaveContent = ref('')
const autoSaveStatus = ref<{ type: string, message: string } | null>(null)
const tempCacheItems = ref<
  Array<{ key: string, value: any, remainingTime: number }>
>([])

// 更新响应式缓存
async function updateReactiveCache() {
  await set(reactiveKey.value, reactiveValue.value.value)
  autoSaveStatus.value = { type: 'success', message: '缓存已更新' }
}

// 监听自动保存内容变化（手动防抖）
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
watch(autoSaveContent, async (newContent) => {
  if (autoSaveEnabled.value && newContent) {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(async () => {
      await set('auto-save-content', newContent)
      autoSaveStatus.value = { type: 'info', message: '内容已自动保存' }
    }, 1000)
  }
})

// 创建临时缓存
async function createTempCache() {
  const tempKey = `temp-${Date.now()}`
  const tempValue = `临时数据 ${new Date().toLocaleTimeString()}`

  await set(tempKey, tempValue, { ttl: 10000 }) // 10秒过期

  tempCacheItems.value.push({
    key: tempKey,
    value: tempValue,
    remainingTime: 10,
  })

  // 倒计时
  const countdown = setInterval(() => {
    const item = tempCacheItems.value.find(i => i.key === tempKey)
    if (item) {
      item.remainingTime--
      if (item.remainingTime <= 0) {
        tempCacheItems.value = tempCacheItems.value.filter(
          i => i.key !== tempKey,
        )
        clearInterval(countdown)
      }
    }
  }, 1000)
}

// 清理过期项
async function cleanupExpired() {
  tempCacheItems.value = tempCacheItems.value.filter(
    item => item.remainingTime > 0,
  )
  autoSaveStatus.value = { type: 'success', message: '过期项已清理' }
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

// 生命周期
onMounted(async () => {
  // 初始化响应式缓存
  const cachedValue = await get(reactiveKey.value)
  if (cachedValue) {
    reactiveValue.value.value = cachedValue
  }

  // 初始化自动保存内容
  const savedContent = await get('auto-save-content')
  if (savedContent) {
    autoSaveContent.value = savedContent
  }

  await refreshStats()
})

onUnmounted(() => {
  // 清理资源
})
</script>

<template>
  <div class="demo-card">
    <h3>🎨 Vue 集成演示</h3>
    <p>演示与 Vue 3 的深度集成功能</p>

    <div class="demo-section">
      <h4>响应式缓存</h4>
      <input
        v-model="reactiveKey"
        placeholder="缓存键名"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <input
        v-model="reactiveValue.value"
        placeholder="缓存值"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <button class="btn" @click="updateReactiveCache">
        更新缓存
      </button>

      <div v-if="reactiveValue.value" class="status success">
        当前缓存值: {{ reactiveValue.value }}
      </div>
    </div>

    <div class="demo-section">
      <h4>自动保存</h4>
      <label>
        <input v-model="autoSaveEnabled" type="checkbox">
        启用自动保存
      </label>

      <textarea
        v-model="autoSaveContent"
        placeholder="输入内容，将自动保存到缓存..."
        rows="4"
        style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        "
      />

      <div v-if="autoSaveStatus" class="status" :class="autoSaveStatus.type">
        {{ autoSaveStatus.message }}
      </div>
    </div>

    <div class="demo-section">
      <h4>缓存状态监控</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">
            {{ cacheStats.totalItems || 0 }}
          </div>
          <div class="stat-label">
            总缓存项
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ cacheStats.totalSizeFormatted || '0 B' }}
          </div>
          <div class="stat-label">
            总大小
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ cacheStats.hitRatePercentage || 0 }}%
          </div>
          <div class="stat-label">
            命中率
          </div>
        </div>
      </div>

      <button class="btn secondary" @click="refreshStats">
        刷新统计
      </button>
    </div>

    <div class="demo-section">
      <h4>生命周期管理</h4>
      <button class="btn" @click="createTempCache">
        创建临时缓存
      </button>
      <button class="btn secondary" @click="cleanupExpired">
        清理过期项
      </button>

      <div v-if="tempCacheItems.length > 0" class="temp-cache-list">
        <h5>临时缓存项:</h5>
        <div
          v-for="item in tempCacheItems"
          :key="item.key"
          class="temp-cache-item"
        >
          <span>{{ item.key }}: {{ item.value }}</span>
          <span class="ttl">{{ item.remainingTime }}s</span>
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
.temp-cache-list {
  margin-top: 12px;
  max-height: 150px;
  overflow-y: auto;
}

.temp-cache-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;
}

.ttl {
  color: #666;
  font-weight: bold;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

textarea {
  font-family: inherit;
  font-size: 14px;
}
</style>
