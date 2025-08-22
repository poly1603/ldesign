<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref } from 'vue'

// 使用引擎组合式API
const { engine } = useEngine()

// 缓存演示数据
const cacheData = ref([
  {
    key: 'user:123',
    value: '{"id":123,"name":"张三","email":"zhang@example.com"}',
    type: 'user',
    ttl: 3600,
    size: 52,
    hits: 15,
    created: new Date(Date.now() - 1800000).toLocaleString(),
    lastAccessed: new Date(Date.now() - 300000).toLocaleString(),
  },
  {
    key: 'api:posts:latest',
    value: '[{"id":1,"title":"最新文章"},{"id":2,"title":"热门文章"}]',
    type: 'api',
    ttl: 1800,
    size: 98,
    hits: 42,
    created: new Date(Date.now() - 900000).toLocaleString(),
    lastAccessed: new Date(Date.now() - 60000).toLocaleString(),
  },
  {
    key: 'config:app',
    value: '{"theme":"dark","language":"zh-CN","debug":true}',
    type: 'config',
    ttl: 86400,
    size: 45,
    hits: 8,
    created: new Date(Date.now() - 3600000).toLocaleString(),
    lastAccessed: new Date(Date.now() - 1800000).toLocaleString(),
  },
])

// 缓存统计
const cacheStats = ref({
  total: 1247,
  hits: 892,
  misses: 355,
  size: '2.3MB',
  avgResponseTime: '12ms',
  hitRate: 71.5,
})

// 缓存操作历史
const cacheHistory = ref([
  {
    id: 1,
    action: 'GET',
    key: 'user:123',
    result: 'HIT',
    responseTime: '2ms',
    timestamp: new Date(Date.now() - 30000).toLocaleString(),
  },
  {
    id: 2,
    action: 'SET',
    key: 'api:posts:latest',
    result: 'SUCCESS',
    responseTime: '5ms',
    timestamp: new Date(Date.now() - 60000).toLocaleString(),
  },
  {
    id: 3,
    action: 'DELETE',
    key: 'temp:session:456',
    result: 'SUCCESS',
    responseTime: '1ms',
    timestamp: new Date(Date.now() - 90000).toLocaleString(),
  },
])

// 新缓存项表单
const newCacheItem = ref({
  key: '',
  value: '',
  ttl: 3600,
  type: 'custom',
})

// 缓存策略配置
const cacheConfig = ref({
  strategy: 'LRU',
  maxSize: '100MB',
  defaultTTL: 3600,
  autoCleanup: true,
  compression: true,
})

// 计算属性
const totalCacheSize = computed(() => {
  return cacheData.value.reduce((sum, item) => sum + item.size, 0)
})

const cacheHitRate = computed(() => {
  const total = cacheStats.value.hits + cacheStats.value.misses
  return total > 0 ? ((cacheStats.value.hits / total) * 100).toFixed(1) : 0
})

const expiredItems = computed(() => {
  const now = Date.now()
  return cacheData.value.filter(item => {
    const created = new Date(item.created).getTime()
    return now - created > item.ttl * 1000
  })
})

// 获取缓存项
function getCacheItem(key: string) {
  const item = cacheData.value.find(item => item.key === key)
  if (item) {
    item.hits++
    item.lastAccessed = new Date().toLocaleString()
    cacheStats.value.hits++
    
    addCacheHistory('GET', key, 'HIT', `${Math.random() * 5 + 1}ms`)
    
    engine.value?.notifications.show({
      title: '✅ 缓存命中',
      message: `成功获取缓存项: ${key}`,
      type: 'success',
    })
    
    return item.value
  } else {
    cacheStats.value.misses++
    
    addCacheHistory('GET', key, 'MISS', `${Math.random() * 20 + 10}ms`)
    
    engine.value?.notifications.show({
      title: '❌ 缓存未命中',
      message: `缓存项不存在: ${key}`,
      type: 'warning',
    })
    
    return null
  }
}

// 设置缓存项
function setCacheItem(key: string, value: string, ttl: number = 3600, type: string = 'custom') {
  const existingIndex = cacheData.value.findIndex(item => item.key === key)
  const cacheItem = {
    key,
    value,
    type,
    ttl,
    size: new Blob([value]).size,
    hits: 0,
    created: new Date().toLocaleString(),
    lastAccessed: new Date().toLocaleString(),
  }
  
  if (existingIndex >= 0) {
    cacheData.value[existingIndex] = cacheItem
  } else {
    cacheData.value.unshift(cacheItem)
  }
  
  addCacheHistory('SET', key, 'SUCCESS', `${Math.random() * 8 + 2}ms`)
  
  engine.value?.notifications.show({
    title: '💾 缓存设置成功',
    message: `已设置缓存项: ${key}`,
    type: 'success',
  })
}

// 删除缓存项
function deleteCacheItem(key: string) {
  const index = cacheData.value.findIndex(item => item.key === key)
  if (index >= 0) {
    cacheData.value.splice(index, 1)
    
    addCacheHistory('DELETE', key, 'SUCCESS', `${Math.random() * 3 + 1}ms`)
    
    engine.value?.notifications.show({
      title: '🗑️ 缓存删除成功',
      message: `已删除缓存项: ${key}`,
      type: 'info',
    })
  }
}

// 创建新缓存项
function createCacheItem() {
  if (!newCacheItem.value.key || !newCacheItem.value.value) {
    engine.value?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写缓存键和值',
      type: 'error',
    })
    return
  }
  
  setCacheItem(
    newCacheItem.value.key,
    newCacheItem.value.value,
    newCacheItem.value.ttl,
    newCacheItem.value.type
  )
  
  // 重置表单
  newCacheItem.value = {
    key: '',
    value: '',
    ttl: 3600,
    type: 'custom',
  }
}

// 清理过期缓存
function cleanupExpiredCache() {
  const expiredCount = expiredItems.value.length
  expiredItems.value.forEach(item => {
    deleteCacheItem(item.key)
  })
  
  engine.value?.notifications.show({
    title: '🧹 缓存清理完成',
    message: `已清理 ${expiredCount} 个过期缓存项`,
    type: 'success',
  })
}

// 清空所有缓存
function clearAllCache() {
  const count = cacheData.value.length
  cacheData.value = []
  
  addCacheHistory('CLEAR', 'ALL', 'SUCCESS', '5ms')
  
  engine.value?.notifications.show({
    title: '🗑️ 缓存已清空',
    message: `已清空 ${count} 个缓存项`,
    type: 'warning',
  })
}

// 演示缓存预热
function demoWarmup() {
  const warmupItems = [
    { key: 'warmup:user:popular', value: '{"users":["user1","user2","user3"]}', type: 'warmup' },
    { key: 'warmup:config:system', value: '{"version":"1.0.0","env":"production"}', type: 'warmup' },
    { key: 'warmup:data:stats', value: '{"totalUsers":1000,"activeUsers":250}', type: 'warmup' },
  ]
  
  engine.value?.notifications.show({
    title: '🔥 缓存预热开始',
    message: '正在预热关键缓存数据...',
    type: 'info',
  })
  
  let index = 0
  const warmupInterval = setInterval(() => {
    if (index < warmupItems.length) {
      const item = warmupItems[index]
      setCacheItem(item.key, item.value, 7200, item.type)
      index++
    } else {
      clearInterval(warmupInterval)
      engine.value?.notifications.show({
        title: '✅ 缓存预热完成',
        message: `已预热 ${warmupItems.length} 个关键缓存项`,
        type: 'success',
      })
    }
  }, 500)
}

// 更新缓存策略
function updateCacheStrategy() {
  addCacheHistory('CONFIG', 'STRATEGY', 'UPDATE', '1ms')
  
  engine.value?.notifications.show({
    title: '⚙️ 缓存策略已更新',
    message: `缓存策略已设置为 ${cacheConfig.value.strategy}`,
    type: 'info',
  })
}

// 添加缓存历史记录
function addCacheHistory(action: string, key: string, result: string, responseTime: string) {
  cacheHistory.value.unshift({
    id: Date.now(),
    action,
    key,
    result,
    responseTime,
    timestamp: new Date().toLocaleString(),
  })
  
  // 限制历史记录数量
  if (cacheHistory.value.length > 50) {
    cacheHistory.value = cacheHistory.value.slice(0, 50)
  }
}

// 清除历史记录
function clearHistory() {
  cacheHistory.value = []
  
  engine.value?.notifications.show({
    title: '🗑️ 历史记录已清除',
    message: '所有缓存操作历史已清除',
    type: 'info',
  })
}

// 格式化大小
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 获取TTL状态
function getTTLStatus(item: any): string {
  const now = Date.now()
  const created = new Date(item.created).getTime()
  const elapsed = now - created
  const remaining = item.ttl * 1000 - elapsed
  
  if (remaining <= 0) return 'expired'
  if (remaining < item.ttl * 1000 * 0.2) return 'expiring'
  return 'valid'
}

// 组件挂载
onMounted(() => {
  engine.value?.logger.info('缓存管理页面已加载')
})
</script>

<template>
  <div class="cache">
    <div class="page-header">
      <h1>💾 缓存系统</h1>
      <p>智能缓存管理，支持多种缓存策略和自动清理机制</p>
    </div>

    <!-- 缓存统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ cacheData.length }}</div>
          <div class="stat-label">缓存项数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ cacheHitRate }}%</div>
          <div class="stat-label">命中率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📏</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatSize(totalCacheSize) }}</div>
          <div class="stat-label">总大小</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ expiredItems.length }}</div>
          <div class="stat-label">过期项</div>
        </div>
      </div>
    </div>

    <!-- 缓存操作面板 -->
    <div class="section">
      <h2>🎛️ 缓存操作</h2>
      <div class="operations-panel">
        <div class="operation-group">
          <label>快速操作</label>
          <div class="operation-buttons">
            <button class="btn btn-primary" @click="demoWarmup">
              🔥 缓存预热
            </button>
            <button class="btn btn-warning" @click="cleanupExpiredCache">
              🧹 清理过期
            </button>
            <button class="btn btn-danger" @click="clearAllCache">
              🗑️ 清空缓存
            </button>
          </div>
        </div>
        
        <div class="operation-group">
          <label>缓存测试</label>
          <div class="test-controls">
            <input 
              v-model="testKey" 
              type="text" 
              placeholder="输入缓存键测试"
              class="form-input"
            >
            <button class="btn btn-secondary" @click="getCacheItem(testKey)">
              🔍 获取
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 缓存列表 -->
    <div class="section">
      <h2>📋 缓存列表</h2>
      <div class="cache-list">
        <div v-for="item in cacheData" :key="item.key" class="cache-item">
          <div class="cache-header">
            <div class="cache-key">{{ item.key }}</div>
            <div class="cache-actions">
              <button class="btn btn-sm btn-primary" @click="getCacheItem(item.key)">
                🔍 获取
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteCacheItem(item.key)">
                🗑️ 删除
              </button>
            </div>
          </div>
          
          <div class="cache-meta">
            <span class="cache-type">{{ item.type }}</span>
            <span :class="['cache-status', getTTLStatus(item)]">
              {{ getTTLStatus(item) === 'expired' ? '已过期' : 
                 getTTLStatus(item) === 'expiring' ? '即将过期' : '有效' }}
            </span>
            <span class="cache-size">{{ formatSize(item.size) }}</span>
            <span class="cache-hits">{{ item.hits }} 次命中</span>
          </div>
          
          <div class="cache-value">
            <pre>{{ item.value }}</pre>
          </div>
          
          <div class="cache-details">
            <div class="detail-item">
              <span class="detail-label">TTL:</span>
              <span class="detail-value">{{ item.ttl }}s</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ item.created }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最后访问:</span>
              <span class="detail-value">{{ item.lastAccessed }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="cacheData.length === 0" class="empty-cache">
          <div class="empty-icon">💾</div>
          <p>暂无缓存数据</p>
        </div>
      </div>
    </div>

    <!-- 创建新缓存 -->
    <div class="section">
      <h2>➕ 创建新缓存</h2>
      <div class="create-cache">
        <div class="form-row">
          <div class="form-group">
            <label>缓存键</label>
            <input 
              v-model="newCacheItem.key" 
              type="text" 
              placeholder="例如: user:123"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="newCacheItem.type" class="form-select">
              <option value="user">用户数据</option>
              <option value="api">API响应</option>
              <option value="config">配置信息</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div class="form-group">
            <label>TTL (秒)</label>
            <input 
              v-model.number="newCacheItem.ttl" 
              type="number" 
              min="1"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>缓存值 (JSON格式)</label>
          <textarea 
            v-model="newCacheItem.value" 
            placeholder='{"key": "value"}'
            class="form-textarea"
            rows="4"
          />
        </div>
        
        <button class="btn btn-primary" @click="createCacheItem">
          💾 创建缓存
        </button>
      </div>
    </div>

    <!-- 缓存配置 -->
    <div class="section">
      <h2>⚙️ 缓存配置</h2>
      <div class="cache-config">
        <div class="config-grid">
          <div class="config-item">
            <label>缓存策略</label>
            <select v-model="cacheConfig.strategy" class="form-select" @change="updateCacheStrategy">
              <option value="LRU">LRU (最近最少使用)</option>
              <option value="LFU">LFU (最不经常使用)</option>
              <option value="FIFO">FIFO (先进先出)</option>
              <option value="TTL">TTL (基于时间)</option>
            </select>
          </div>
          
          <div class="config-item">
            <label>最大大小</label>
            <input 
              v-model="cacheConfig.maxSize" 
              type="text" 
              class="form-input"
            >
          </div>
          
          <div class="config-item">
            <label>默认TTL (秒)</label>
            <input 
              v-model.number="cacheConfig.defaultTTL" 
              type="number" 
              class="form-input"
            >
          </div>
        </div>
        
        <div class="config-toggles">
          <div class="toggle-item">
            <label>
              <input 
                v-model="cacheConfig.autoCleanup" 
                type="checkbox"
                class="form-checkbox"
              >
              自动清理过期缓存
            </label>
          </div>
          
          <div class="toggle-item">
            <label>
              <input 
                v-model="cacheConfig.compression" 
                type="checkbox"
                class="form-checkbox"
              >
              启用数据压缩
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作历史 -->
    <div class="section">
      <div class="section-header">
        <h2>📚 操作历史</h2>
        <button class="btn btn-sm btn-secondary" @click="clearHistory">
          🗑️ 清除历史
        </button>
      </div>
      
      <div class="history-container">
        <div v-if="cacheHistory.length === 0" class="empty-history">
          <div class="empty-icon">📚</div>
          <p>暂无操作历史</p>
        </div>
        
        <div v-for="entry in cacheHistory.slice(0, 20)" :key="entry.id" class="history-item">
          <div class="history-content">
            <div class="history-action">{{ entry.action }}</div>
            <div class="history-key">{{ entry.key }}</div>
            <div class="history-time">{{ entry.timestamp }}</div>
          </div>
          <div class="history-meta">
            <span :class="['history-result', entry.result.toLowerCase()]">
              {{ entry.result }}
            </span>
            <span class="history-response-time">{{ entry.responseTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      testKey: '',
    }
  },
}
</script>

<style scoped>
.cache {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.operations-panel {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.operation-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.operation-group label {
  font-weight: bold;
  color: #2c3e50;
}

.operation-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.test-controls {
  display: flex;
  gap: 0.5rem;
}

.cache-list {
  display: grid;
  gap: 1.5rem;
}

.cache-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cache-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cache-key {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: bold;
  color: #667eea;
  font-size: 1.1rem;
}

.cache-actions {
  display: flex;
  gap: 0.5rem;
}

.cache-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.cache-type {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.cache-status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.cache-status.valid {
  background: #d4edda;
  color: #155724;
}

.cache-status.expiring {
  background: #fff3cd;
  color: #856404;
}

.cache-status.expired {
  background: #f8d7da;
  color: #721c24;
}

.cache-size,
.cache-hits {
  color: #666;
  font-size: 0.9rem;
}

.cache-value {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.cache-value pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.cache-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-weight: bold;
  color: #666;
}

.detail-value {
  color: #2c3e50;
}

.empty-cache {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.create-cache {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
}

.cache-config {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-toggles {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.toggle-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #2c3e50;
}

.form-checkbox {
  width: auto;
}

.history-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-content {
  flex: 1;
  display: grid;
  grid-template-columns: 80px 1fr 150px;
  gap: 1rem;
  align-items: center;
}

.history-action {
  font-weight: bold;
  color: #667eea;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.history-key {
  color: #2c3e50;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
}

.history-time {
  color: #666;
  font-size: 0.9rem;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-result {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.history-result.hit,
.history-result.success {
  background: #d4edda;
  color: #155724;
}

.history-result.miss {
  background: #fff3cd;
  color: #856404;
}

.history-result.error {
  background: #f8d7da;
  color: #721c24;
}

.history-response-time {
  color: #666;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: right;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .operations-panel {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .config-toggles {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cache-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .cache-details {
    grid-template-columns: 1fr;
  }
  
  .history-content {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .history-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
