<template>
  <div class="cache-demo">
    <div class="page-header">
      <h1>💾 缓存系统演示</h1>
      <p>测试 @ldesign/cache 包的各种功能和集成效果</p>
    </div>

    <div class="test-sections">
      <!-- 基础缓存操作 -->
      <section class="test-section">
        <h2>🔧 基础缓存操作</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>缓存键:</strong> {{ basicKey || '未设置' }}</p>
            <p><strong>缓存值:</strong> {{ basicValue || '未设置' }}</p>
            <p><strong>操作结果:</strong> {{ basicResult || '无' }}</p>
          </div>
          <div class="controls">
            <input
              v-model="basicKey"
              placeholder="输入缓存键，例如：user:123"
              class="input-field"
            />
            <textarea
              v-model="basicValue"
              placeholder="输入缓存值，支持JSON格式"
              class="textarea"
              rows="3"
            ></textarea>
            <button @click="setCache" class="btn btn-primary">设置缓存</button>
            <button @click="getCache" class="btn btn-secondary">获取缓存</button>
            <button @click="deleteCache" class="btn btn-warning">删除缓存</button>
            <button @click="hasCache" class="btn btn-success">检查存在</button>
          </div>
        </div>
      </section>

      <!-- 批量操作 -->
      <section class="test-section">
        <h2>📦 批量操作</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>批量操作次数:</strong> {{ batchOperations }}</p>
            <p><strong>平均耗时:</strong> {{ averageTime }}ms</p>
          </div>
          <div class="controls">
            <button @click="performBatchSet" class="btn btn-primary">批量设置</button>
            <button @click="performBatchGet" class="btn btn-secondary">批量获取</button>
            <button @click="clearAll" class="btn btn-warning">清空所有</button>
          </div>
        </div>
      </section>

      <!-- 缓存统计 -->
      <section class="test-section">
        <h2>📊 缓存统计</h2>
        <div class="test-content">
          <div class="info-grid">
            <div class="info-item">
              <strong>缓存项数量:</strong>
              <span class="status-success">{{ stats.count }}</span>
            </div>
            <div class="info-item">
              <strong>总大小:</strong>
              <span class="status-success">{{ formatBytes(stats.size) }}</span>
            </div>
            <div class="info-item">
              <strong>命中率:</strong>
              <span class="status-success">{{ stats.hitRate }}%</span>
            </div>
            <div class="info-item">
              <strong>当前引擎:</strong>
              <span class="status-success">{{ currentEngine }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'

// 获取当前组件实例
const instance = getCurrentInstance()

// 获取缓存引擎实例
const cache = instance?.appContext.app.config.globalProperties.$cache

// 响应式数据
const basicKey = ref('')
const basicValue = ref('')
const basicResult = ref('')
const batchOperations = ref(0)
const averageTime = ref(0)
const currentEngine = ref('未知')

// 统计数据
const stats = reactive({
  count: 0,
  size: 0,
  hitRate: 0
})

// 基础缓存操作
const setCache = async () => {
  if (!cache) {
    basicResult.value = '缓存引擎未初始化'
    return
  }
  
  try {
    await cache.set(basicKey.value, basicValue.value)
    basicResult.value = '设置成功'
    updateStats()
  } catch (error) {
    basicResult.value = `设置失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const getCache = async () => {
  if (!cache) {
    basicResult.value = '缓存引擎未初始化'
    return
  }
  
  try {
    const value = await cache.get(basicKey.value)
    basicResult.value = value !== undefined ? JSON.stringify(value, null, 2) : '缓存不存在'
    updateStats()
  } catch (error) {
    basicResult.value = `获取失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const deleteCache = async () => {
  if (!cache) {
    basicResult.value = '缓存引擎未初始化'
    return
  }
  
  try {
    await cache.delete(basicKey.value)
    basicResult.value = '删除成功'
    updateStats()
  } catch (error) {
    basicResult.value = `删除失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const hasCache = async () => {
  if (!cache) {
    basicResult.value = '缓存引擎未初始化'
    return
  }
  
  try {
    const exists = await cache.has(basicKey.value)
    basicResult.value = exists ? '缓存存在' : '缓存不存在'
    updateStats()
  } catch (error) {
    basicResult.value = `检查失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

// 批量操作
const performBatchSet = async () => {
  if (!cache) return
  
  const startTime = performance.now()
  
  try {
    for (let i = 0; i < 10; i++) {
      await cache.set(`batch-key-${i}`, `batch-value-${i}`)
    }
    
    const endTime = performance.now()
    batchOperations.value += 10
    averageTime.value = Number(((endTime - startTime) / 10).toFixed(3))
    
    updateStats()
  } catch (error) {
    console.error('批量设置失败:', error)
  }
}

const performBatchGet = async () => {
  if (!cache) return
  
  const startTime = performance.now()
  
  try {
    for (let i = 0; i < 10; i++) {
      await cache.get(`batch-key-${i}`)
    }
    
    const endTime = performance.now()
    averageTime.value = Number(((endTime - startTime) / 10).toFixed(3))
    
    updateStats()
  } catch (error) {
    console.error('批量获取失败:', error)
  }
}

const clearAll = async () => {
  if (!cache) return
  
  try {
    await cache.clear()
    updateStats()
  } catch (error) {
    console.error('清空失败:', error)
  }
}

// 更新统计信息
const updateStats = async () => {
  if (!cache) return
  
  try {
    const cacheStats = await cache.getStats()
    stats.count = cacheStats.count || 0
    stats.size = cacheStats.size || 0
    stats.hitRate = Math.round((cacheStats.hitRate || 0) * 100)
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 格式化字节大小
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时初始化
onMounted(async () => {
  if (cache) {
    currentEngine.value = cache.constructor.name || '默认引擎'
    await updateStats()
  }
})
</script>

<style scoped lang="less">
.cache-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 8px;
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 16px;
  }
}

.test-sections {
  display: grid;
  gap: 24px;
}

.test-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 24px;
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.test-content {
  display: grid;
  gap: 16px;
}

.state-display {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  padding: 16px;
  
  p {
    margin: 8px 0;
    color: var(--ldesign-text-color-primary);
    
    strong {
      color: var(--ldesign-brand-color);
    }
  }
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-field, .textarea {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
  }
}

.textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
  
  &.btn-secondary {
    background: var(--ldesign-gray-color-6);
    color: white;
    
    &:hover {
      background: var(--ldesign-gray-color-7);
    }
  }
  
  &.btn-warning {
    background: var(--ldesign-warning-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-warning-color-hover);
    }
  }
  
  &.btn-success {
    background: var(--ldesign-success-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-success-color-hover);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  
  strong {
    color: var(--ldesign-text-color-primary);
  }
}

.status-success {
  color: var(--ldesign-success-color);
  font-weight: 500;
}
</style>
