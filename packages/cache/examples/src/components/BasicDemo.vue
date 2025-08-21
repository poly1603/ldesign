<script setup lang="ts">
import { ref } from 'vue'
// import { useCache } from '@ldesign/cache/vue'

// 临时模拟 useCache 功能
function useCache(options: any = {}) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const set = async (key: string, value: any, opts?: any) => {
    loading.value = true
    try {
      const data = { value, timestamp: Date.now(), ...opts }
      localStorage.setItem(
        `${options.keyPrefix || ''}${key}`,
        JSON.stringify(data),
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
      const item = localStorage.getItem(`${options.keyPrefix || ''}${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(`${options.keyPrefix || ''}${key}`)
          return null
        }
        return parsed.value
      }
      return null
    }
    catch (err) {
      error.value = err as Error
      return null
    }
  }

  const has = async (key: string) => {
    const value = await get(key)
    return value !== null
  }

  const keys = async () => {
    const prefix = options.keyPrefix || ''
    return Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .map(key => key.replace(prefix, ''))
  }

  const clear = async () => {
    const prefix = options.keyPrefix || ''
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith(prefix),
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  return { set, get, has, keys, clear, loading, error }
}

// 使用缓存
const { set, get, has, keys, clear, loading, error } = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'demo_',
  debug: true,
})

// 响应式数据
const inputKey = ref('user-name')
const inputValue = ref('张三')
const getKey = ref('user-name')
const getCacheResult = ref<any>(undefined)
const ttlStatus = ref<{ type: string, message: string } | null>(null)
const allKeys = ref<string[]>([])

// 设置缓存
async function setCache() {
  try {
    await set(inputKey.value, inputValue.value)
    ttlStatus.value = {
      type: 'success',
      message: `缓存 "${inputKey.value}" 设置成功`,
    }
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `设置失败: ${(err as Error).message}`,
    }
  }
}

// 获取缓存
async function getCache() {
  try {
    getCacheResult.value = await get(getKey.value)
  }
  catch (err) {
    getCacheResult.value = null
    ttlStatus.value = {
      type: 'error',
      message: `获取失败: ${(err as Error).message}`,
    }
  }
}

// 设置TTL缓存
async function setTTLCache() {
  try {
    await set('ttl-demo', '这是一个5秒后过期的缓存', { ttl: 5000 })
    ttlStatus.value = { type: 'success', message: 'TTL缓存设置成功，5秒后过期' }
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `TTL设置失败: ${(err as Error).message}`,
    }
  }
}

// 检查TTL缓存
async function checkTTLCache() {
  try {
    const exists = await has('ttl-demo')
    if (exists) {
      const value = await get('ttl-demo')
      ttlStatus.value = { type: 'success', message: `TTL缓存存在: ${value}` }
    }
    else {
      ttlStatus.value = { type: 'info', message: 'TTL缓存已过期或不存在' }
    }
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `检查失败: ${(err as Error).message}`,
    }
  }
}

// 批量设置缓存
async function setBatchCache() {
  try {
    const batchData = [
      { key: 'user1', value: { name: '用户1', age: 25 } },
      { key: 'user2', value: { name: '用户2', age: 30 } },
      { key: 'user3', value: { name: '用户3', age: 35 } },
      { key: 'config', value: { theme: 'dark', lang: 'zh-CN' } },
    ]

    await Promise.all(batchData.map(item => set(item.key, item.value)))

    ttlStatus.value = { type: 'success', message: '批量设置成功' }
    await getAllKeys() // 刷新键列表
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `批量设置失败: ${(err as Error).message}`,
    }
  }
}

// 获取所有键
async function getAllKeys() {
  try {
    allKeys.value = await keys()
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `获取键列表失败: ${(err as Error).message}`,
    }
  }
}

// 清空所有缓存
async function clearAllCache() {
  try {
    await clear()
    allKeys.value = []
    getCacheResult.value = undefined
    ttlStatus.value = { type: 'success', message: '缓存已清空' }
  }
  catch (err) {
    ttlStatus.value = {
      type: 'error',
      message: `清空失败: ${(err as Error).message}`,
    }
  }
}
</script>

<template>
  <div class="demo-card">
    <h3>🎯 基础功能演示</h3>
    <p>演示缓存的基本 CRUD 操作</p>

    <div class="demo-section">
      <h4>设置缓存</h4>
      <input
        v-model="inputKey"
        placeholder="输入键名"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <input
        v-model="inputValue"
        placeholder="输入值"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <button class="btn" @click="setCache">
        设置缓存
      </button>
    </div>

    <div class="demo-section">
      <h4>获取缓存</h4>
      <input
        v-model="getKey"
        placeholder="输入要获取的键名"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <button class="btn" @click="getCache">
        获取缓存
      </button>

      <div v-if="getCacheResult" class="status success">
        获取结果: {{ getCacheResult }}
      </div>
      <div v-else-if="getCacheResult === null" class="status info">
        缓存不存在或已过期
      </div>
    </div>

    <div class="demo-section">
      <h4>TTL 演示</h4>
      <button class="btn" @click="setTTLCache">
        设置5秒过期缓存
      </button>
      <button class="btn secondary" @click="checkTTLCache">
        检查TTL缓存
      </button>

      <div v-if="ttlStatus" class="status" :class="ttlStatus.type">
        {{ ttlStatus.message }}
      </div>
    </div>

    <div class="demo-section">
      <h4>批量操作</h4>
      <button class="btn" @click="setBatchCache">
        批量设置
      </button>
      <button class="btn secondary" @click="getAllKeys">
        获取所有键
      </button>
      <button class="btn danger" @click="clearAllCache">
        清空缓存
      </button>

      <div v-if="allKeys.length > 0" class="code">
        所有键名: {{ allKeys.join(', ') }}
      </div>
    </div>

    <div v-if="loading" class="status info">
      操作中...
    </div>

    <div v-if="error" class="status error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.demo-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.demo-section h4 {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 1.1rem;
}

input {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}
</style>
