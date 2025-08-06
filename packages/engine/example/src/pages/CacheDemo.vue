<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const cacheKey = ref('')
const cacheValue = ref('')
const cacheTtl = ref(60)
const searchKey = ref('')
const cacheEntries = ref<any[]>([])
const cacheStats = ref<any>({})

// 计算属性
const hasCacheEntries = computed(() => cacheEntries.value.length > 0)
const filteredEntries = computed(() => {
  if (!searchKey.value)
    return cacheEntries.value
  return cacheEntries.value.filter(entry =>
    entry.key.toLowerCase().includes(searchKey.value.toLowerCase()),
  )
})

// 方法
function setCacheItem() {
  if (!cacheKey.value.trim() || !cacheValue.value.trim()) {
    engine.notifications.show({
      type: 'warning',
      title: '警告',
      message: '请输入缓存键和值',
      duration: 2000,
    })
    return
  }

  try {
    let value: any = cacheValue.value

    // 尝试解析JSON
    try {
      value = JSON.parse(cacheValue.value)
    }
    catch {
      // 如果不是JSON，保持原始字符串
    }

    const ttl = cacheTtl.value > 0 ? cacheTtl.value * 1000 : undefined
    engine.cache.set(cacheKey.value, value, ttl)

    engine.logger.info(`缓存项已设置: ${cacheKey.value}`, { value, ttl })

    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: `缓存项 "${cacheKey.value}" 已设置`,
      duration: 2000,
    })

    // 清空输入
    cacheKey.value = ''
    cacheValue.value = ''

    // 更新缓存列表
    updateCacheEntries()
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `设置缓存失败: ${error}`,
      duration: 3000,
    })
  }
}

function getCacheItem(key: string) {
  try {
    const value = engine.cache.get(key)

    if (value !== undefined) {
      engine.logger.info(`获取缓存项: ${key}`, { value })

      engine.notifications.show({
        type: 'info',
        title: '缓存命中',
        message: `键: ${key}`,
        duration: 2000,
      })

      // 显示值
      const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      alert(`缓存值:\n${displayValue}`)
    }
    else {
      engine.notifications.show({
        type: 'warning',
        title: '缓存未命中',
        message: `键 "${key}" 不存在或已过期`,
        duration: 2000,
      })
    }
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `获取缓存失败: ${error}`,
      duration: 3000,
    })
  }
}

function deleteCacheItem(key: string) {
  try {
    const existed = engine.cache.has(key)
    engine.cache.delete(key)

    engine.logger.info(`缓存项已删除: ${key}`)

    engine.notifications.show({
      type: existed ? 'success' : 'info',
      title: existed ? '删除成功' : '键不存在',
      message: `键: ${key}`,
      duration: 2000,
    })

    updateCacheEntries()
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `删除缓存失败: ${error}`,
      duration: 3000,
    })
  }
}

function clearAllCache() {
  try {
    const size = engine.cache.size()
    engine.cache.clear()

    engine.logger.info(`所有缓存已清空，共 ${size} 项`)

    engine.notifications.show({
      type: 'info',
      title: '缓存已清空',
      message: `清空了 ${size} 个缓存项`,
      duration: 2000,
    })

    updateCacheEntries()
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `清空缓存失败: ${error}`,
      duration: 3000,
    })
  }
}

function updateCacheEntries() {
  try {
    const keys = engine.cache.keys()
    cacheEntries.value = keys.map((key) => {
      const value = engine.cache.get(key)
      const hasValue = engine.cache.has(key)

      return {
        key,
        value: hasValue ? value : '(已过期)',
        type: hasValue ? typeof value : 'expired',
        size: hasValue ? JSON.stringify(value).length : 0,
        expired: !hasValue,
      }
    })

    // 更新统计信息
    cacheStats.value = {
      totalItems: engine.cache.size(),
      totalKeys: keys.length,
      expiredItems: cacheEntries.value.filter(entry => entry.expired).length,
      totalSize: cacheEntries.value.reduce((sum, entry) => sum + entry.size, 0),
    }
  }
  catch (error) {
    engine.logger.error('更新缓存列表失败', error)
  }
}

function generateTestData() {
  const testData = [
    { key: 'user:123', value: { id: 123, name: 'Alice', email: 'alice@example.com' }, ttl: 30 },
    { key: 'config:theme', value: 'dark', ttl: 0 },
    { key: 'session:abc123', value: { userId: 123, loginTime: Date.now() }, ttl: 15 },
    { key: 'cache:api:users', value: [1, 2, 3, 4, 5], ttl: 60 },
    { key: 'temp:calculation', value: Math.PI * Math.E, ttl: 5 },
  ]

  testData.forEach(({ key, value, ttl }) => {
    const ttlMs = ttl > 0 ? ttl * 1000 : undefined
    engine.cache.set(key, value, ttlMs)
  })

  engine.logger.info('测试数据已生成', testData)

  engine.notifications.show({
    type: 'success',
    title: '测试数据已生成',
    message: `添加了 ${testData.length} 个测试缓存项`,
    duration: 2000,
  })

  updateCacheEntries()
}

function exportCacheData() {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      stats: cacheStats.value,
      entries: cacheEntries.value.filter(entry => !entry.expired).map(entry => ({
        key: entry.key,
        value: entry.value,
        type: entry.type,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cache-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    engine.notifications.show({
      type: 'success',
      title: '导出成功',
      message: '缓存数据已导出',
      duration: 2000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '导出失败',
      message: `导出过程中发生错误: ${error}`,
      duration: 3000,
    })
  }
}

function formatValue(value: any): string {
  if (value === '(已过期)')
    return value
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// 初始化
updateCacheEntries()

// 定期更新缓存状态
setInterval(updateCacheEntries, 2000)
</script>

<template>
  <div class="cache-demo">
    <header class="demo-header">
      <h1>💾 缓存管理器演示</h1>
      <p>展示引擎的缓存功能，包括设置、获取、删除和过期管理</p>
    </header>

    <div class="demo-content">
      <!-- 缓存操作面板 -->
      <section class="cache-operations">
        <h2>缓存操作</h2>
        <div class="operation-grid">
          <div class="operation-card">
            <h3>设置缓存</h3>
            <div class="input-group">
              <label>缓存键:</label>
              <input
                v-model="cacheKey"
                type="text"
                placeholder="例如: user:123"
              >
            </div>
            <div class="input-group">
              <label>缓存值 (支持JSON):</label>
              <textarea
                v-model="cacheValue"
                placeholder="例如: {&quot;name&quot;: &quot;Alice&quot;, &quot;age&quot;: 25} 或 简单字符串"
                rows="3"
              />
            </div>
            <div class="input-group">
              <label>过期时间 (秒, 0表示永不过期):</label>
              <input
                v-model.number="cacheTtl"
                type="number"
                min="0"
                placeholder="60"
              >
            </div>
            <button class="btn btn-primary" @click="setCacheItem">
              设置缓存
            </button>
          </div>

          <div class="operation-card">
            <h3>快速操作</h3>
            <div class="quick-actions">
              <button class="btn btn-success" @click="generateTestData">
                🧪 生成测试数据
              </button>
              <button class="btn btn-info" @click="exportCacheData">
                📤 导出缓存数据
              </button>
              <button class="btn btn-warning" @click="clearAllCache">
                🗑️ 清空所有缓存
              </button>
              <button class="btn btn-secondary" @click="updateCacheEntries">
                🔄 刷新列表
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 缓存统计 -->
      <section class="cache-stats">
        <h2>缓存统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">
              {{ cacheStats.totalItems }}
            </div>
            <div class="stat-label">
              活跃缓存项
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ cacheStats.totalKeys }}
            </div>
            <div class="stat-label">
              总键数量
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ cacheStats.expiredItems }}
            </div>
            <div class="stat-label">
              已过期项
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ formatSize(cacheStats.totalSize || 0) }}
            </div>
            <div class="stat-label">
              总大小
            </div>
          </div>
        </div>
      </section>

      <!-- 缓存列表 -->
      <section v-if="hasCacheEntries" class="cache-list">
        <h2>缓存列表</h2>

        <!-- 搜索框 -->
        <div class="search-box">
          <input
            v-model="searchKey"
            type="text"
            placeholder="搜索缓存键..."
            class="search-input"
          >
        </div>

        <!-- 缓存项列表 -->
        <div class="cache-items">
          <div
            v-for="entry in filteredEntries"
            :key="entry.key"
            class="cache-item"
            :class="{ expired: entry.expired }"
          >
            <div class="cache-header">
              <div class="cache-key">
                <strong>{{ entry.key }}</strong>
                <span class="cache-type">{{ entry.type }}</span>
              </div>
              <div class="cache-actions">
                <button
                  v-if="!entry.expired"
                  class="btn-small btn-info"
                  @click="getCacheItem(entry.key)"
                >
                  获取
                </button>
                <button
                  class="btn-small btn-danger"
                  @click="deleteCacheItem(entry.key)"
                >
                  删除
                </button>
              </div>
            </div>

            <div class="cache-value">
              <strong>值:</strong>
              <code>{{ formatValue(entry.value) }}</code>
            </div>

            <div class="cache-meta">
              <span>大小: {{ formatSize(entry.size) }}</span>
              <span v-if="entry.expired" class="expired-label">已过期</span>
            </div>
          </div>
        </div>

        <div v-if="filteredEntries.length === 0" class="no-results">
          <p>没有找到匹配的缓存项</p>
        </div>
      </section>

      <section v-else class="empty-cache">
        <div class="empty-message">
          <h3>暂无缓存数据</h3>
          <p>点击"生成测试数据"或手动添加缓存项开始体验</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cache-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cache-operations,
.cache-stats,
.cache-list,
.empty-cache {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cache-operations h2,
.cache-stats h2,
.cache-list h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.operation-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.operation-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.operation-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border-left: 4px solid #3498db;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.cache-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cache-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #27ae60;
  transition: all 0.2s ease;
}

.cache-item.expired {
  border-left-color: #e74c3c;
  opacity: 0.7;
}

.cache-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cache-key {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cache-key strong {
  color: #2c3e50;
}

.cache-type {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.cache-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-small.btn-info:hover {
  background: #138496;
}

.btn-small.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-small.btn-danger:hover {
  background: #c82333;
}

.cache-value {
  margin-bottom: 1rem;
}

.cache-value strong {
  color: #34495e;
  margin-right: 0.5rem;
}

.cache-value code {
  background: #e9ecef;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.5rem;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
}

.cache-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #7f8c8d;
}

.expired-label {
  background: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.no-results,
.empty-message {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.empty-message h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .cache-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .operation-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cache-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .cache-actions {
    align-self: flex-end;
  }
}
</style>
