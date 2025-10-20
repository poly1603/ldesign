<template>
  <div class="cache-demo">
    <h3>缓存功能演示</h3>
    
    <div class="demo-section">
      <h4>1. 基础缓存操作</h4>
      <div class="demo-actions">
        <button @click="setCache" class="demo-btn">设置缓存</button>
        <button @click="getCache" class="demo-btn">获取缓存</button>
        <button @click="removeCache" class="demo-btn">删除缓存</button>
      </div>
      <div v-if="cacheValue" class="demo-result">
        缓存值: {{ JSON.stringify(cacheValue) }}
      </div>
    </div>

    <div class="demo-section">
      <h4>2. Remember 模式（记忆化）</h4>
      <button @click="testRemember" class="demo-btn">测试 Remember</button>
      <div v-if="rememberResult" class="demo-result">
        结果: {{ rememberResult }}
      </div>
    </div>

    <div class="demo-section">
      <h4>3. 缓存统计</h4>
      <button @click="showStats" class="demo-btn">查看统计</button>
      <div v-if="stats" class="demo-result">
        <div>总项数: {{ stats.totalItems }}</div>
        <div>总大小: {{ formatBytes(stats.totalSize) }}</div>
        <div>命中率: {{ stats.hitRate }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppCache } from '@/composables/useAppCache'

const cache = useAppCache()

const cacheValue = ref<any>(null)
const rememberResult = ref<string>('')
const stats = ref<any>(null)

// 设置缓存
const setCache = async () => {
  await cache.set('demo-data', { 
    message: 'Hello Cache!', 
    timestamp: Date.now() 
  })
  console.log('缓存已设置')
}

// 获取缓存
const getCache = async () => {
  cacheValue.value = await cache.get('demo-data')
  console.log('缓存已获取:', cacheValue.value)
}

// 删除缓存
const removeCache = async () => {
  await cache.remove('demo-data')
  cacheValue.value = null
  console.log('缓存已删除')
}

// 测试 Remember
const testRemember = async () => {
  const start = Date.now()
  
  const data = await cache.remember('expensive-data', async () => {
    // 模拟耗时操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { computed: Math.random() }
  })
  
  const elapsed = Date.now() - start
  rememberResult.value = `第一次耗时: ${elapsed}ms, 数据: ${JSON.stringify(data)}`
  
  // 第二次调用应该很快
  const start2 = Date.now()
  const cachedData = await cache.remember('expensive-data', async () => {
    return { computed: 999 }
  })
  const elapsed2 = Date.now() - start2
  
  rememberResult.value += ` | 第二次耗时: ${elapsed2}ms (从缓存)`
}

// 查看统计
const showStats = async () => {
  const s = await cache.getStats()
  if (s) {
    stats.value = {
      totalItems: s.totalItems,
      totalSize: s.totalSize,
      hitRate: s.hits && s.misses 
        ? Math.round((s.hits / (s.hits + s.misses)) * 100)
        : 0
    }
  }
}

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.cache-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.demo-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.demo-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.demo-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-btn:hover {
  background: #5568d3;
}

.demo-result {
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-family: monospace;
  font-size: 14px;
}
</style>



