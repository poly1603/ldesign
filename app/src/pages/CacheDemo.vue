<template>
  <div class="cache-demo">
    <div class="demo-header">
      <h1>Cache 缓存系统演示</h1>
      <p>展示 @ldesign/cache 包的各种缓存功能</p>
    </div>

    <!-- 基础缓存操作 -->
    <div class="demo-section">
      <h2>基础缓存操作</h2>
      <div class="operation-panel">
        <div class="input-group">
          <label>缓存键:</label>
          <input 
            v-model="basicKey" 
            placeholder="输入缓存键" 
            class="input-field"
          />
        </div>
        <div class="input-group">
          <label>缓存值:</label>
          <textarea 
            v-model="basicValue" 
            placeholder="输入缓存值（支持JSON）" 
            class="input-field textarea"
            rows="3"
          ></textarea>
        </div>
        <div class="button-group">
          <button @click="setBasicCache" class="btn btn-primary">设置缓存</button>
          <button @click="getBasicCache" class="btn btn-secondary">获取缓存</button>
          <button @click="deleteBasicCache" class="btn btn-danger">删除缓存</button>
          <button @click="checkBasicCache" class="btn btn-info">检查存在</button>
        </div>
      </div>
      <div v-if="basicResult" class="result-panel">
        <h3>操作结果:</h3>
        <pre class="result-content">{{ basicResult }}</pre>
      </div>
    </div>

    <!-- 存储引擎切换 -->
    <div class="demo-section">
      <h2>存储引擎管理</h2>
      <div class="operation-panel">
        <div class="input-group">
          <label>当前引擎:</label>
          <span class="current-engine">{{ currentEngine }}</span>
        </div>
        <div class="input-group">
          <label>切换引擎:</label>
          <select v-model="selectedEngine" class="select-field">
            <option value="memory">Memory (内存)</option>
            <option value="localStorage">LocalStorage</option>
            <option value="sessionStorage">SessionStorage</option>
            <option value="indexedDB">IndexedDB</option>
            <option value="cookie">Cookie</option>
          </select>
        </div>
        <div class="button-group">
          <button @click="switchEngine" class="btn btn-primary">切换引擎</button>
          <button @click="getEngineInfo" class="btn btn-info">引擎信息</button>
        </div>
      </div>
      <div v-if="engineResult" class="result-panel">
        <h3>引擎信息:</h3>
        <pre class="result-content">{{ engineResult }}</pre>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="demo-section">
      <h2>批量操作</h2>
      <div class="operation-panel">
        <div class="input-group">
          <label>批量数据 (JSON格式):</label>
          <textarea 
            v-model="batchData" 
            placeholder='{"key1": "value1", "key2": "value2"}' 
            class="input-field textarea"
            rows="4"
          ></textarea>
        </div>
        <div class="button-group">
          <button @click="setBatchCache" class="btn btn-primary">批量设置</button>
          <button @click="getBatchCache" class="btn btn-secondary">批量获取</button>
          <button @click="getAllKeys" class="btn btn-info">获取所有键</button>
          <button @click="clearAllCache" class="btn btn-danger">清空缓存</button>
        </div>
      </div>
      <div v-if="batchResult" class="result-panel">
        <h3>批量操作结果:</h3>
        <pre class="result-content">{{ batchResult }}</pre>
      </div>
    </div>

    <!-- 缓存统计 -->
    <div class="demo-section">
      <h2>缓存统计</h2>
      <div class="operation-panel">
        <div class="button-group">
          <button @click="getStats" class="btn btn-info">获取统计</button>
          <button @click="refreshStats" class="btn btn-secondary">刷新统计</button>
          <button @click="cleanup" class="btn btn-warning">清理过期</button>
        </div>
      </div>
      <div v-if="statsResult" class="result-panel">
        <h3>缓存统计:</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">总大小:</span>
            <span class="stat-value">{{ formatBytes(statsResult.size || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存数量:</span>
            <span class="stat-value">{{ statsResult.count || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">命中率:</span>
            <span class="stat-value">{{ ((statsResult.hitRate || 0) * 100).toFixed(2) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">命中次数:</span>
            <span class="stat-value">{{ statsResult.hits || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">未命中次数:</span>
            <span class="stat-value">{{ statsResult.misses || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">过期数量:</span>
            <span class="stat-value">{{ statsResult.expired || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级功能 -->
    <div class="demo-section">
      <h2>高级功能</h2>
      <div class="operation-panel">
        <div class="input-group">
          <label>TTL (毫秒):</label>
          <input 
            v-model.number="ttl" 
            type="number" 
            placeholder="过期时间" 
            class="input-field"
          />
        </div>
        <div class="input-group">
          <label>带TTL的键:</label>
          <input 
            v-model="ttlKey" 
            placeholder="输入键名" 
            class="input-field"
          />
        </div>
        <div class="input-group">
          <label>带TTL的值:</label>
          <input 
            v-model="ttlValue" 
            placeholder="输入值" 
            class="input-field"
          />
        </div>
        <div class="button-group">
          <button @click="setWithTTL" class="btn btn-primary">设置带TTL缓存</button>
          <button @click="getTTL" class="btn btn-info">获取剩余TTL</button>
          <button @click="extendTTL" class="btn btn-secondary">延长TTL</button>
        </div>
      </div>
      <div v-if="advancedResult" class="result-panel">
        <h3>高级功能结果:</h3>
        <pre class="result-content">{{ advancedResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createCache, CacheManager } from '@ldesign/cache'

// 创建缓存管理器实例（直接使用，不依赖插件）
let cacheManager: CacheManager
try {
  cacheManager = createCache({
    defaultEngine: 'localStorage',
    enableEncryption: false,
    enableCompression: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: 7 * 24 * 60 * 60 * 1000, // 7天
  })
  console.log('Cache manager created successfully:', cacheManager)
} catch (error) {
  console.error('Failed to create cache manager:', error)
  // 创建一个备用的缓存管理器
  cacheManager = new CacheManager({
    defaultEngine: 'localStorage',
    enableEncryption: false,
    enableCompression: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: 7 * 24 * 60 * 60 * 1000, // 7天
  })
}

// 基础缓存操作（直接使用 cacheManager）
const get = cacheManager?.get?.bind(cacheManager) || (async () => null)
const set = cacheManager?.set?.bind(cacheManager) || (async () => {})
const del = cacheManager?.delete?.bind(cacheManager) || (async () => {})
const has = cacheManager?.has?.bind(cacheManager) || (async () => false)
const keys = cacheManager?.keys?.bind(cacheManager) || (async () => [])
const clear = cacheManager?.clear?.bind(cacheManager) || (async () => {})

// 响应式数据
const basicKey = ref('demo-key')
const basicValue = ref('{"name": "张三", "age": 25, "city": "北京"}')
const basicResult = ref('')

const currentEngine = ref('localStorage')
const selectedEngine = ref('localStorage')
const engineResult = ref('')

const batchData = ref('{"user:1": {"name": "Alice", "role": "admin"}, "user:2": {"name": "Bob", "role": "user"}, "config:theme": "dark"}')
const batchResult = ref('')

const statsResult = ref<any>(null)

const ttl = ref(30000) // 30秒
const ttlKey = ref('temp-key')
const ttlValue = ref('临时数据')
const advancedResult = ref('')

// 基础缓存操作方法
const setBasicCache = async () => {
  try {
    let value = basicValue.value
    try {
      value = JSON.parse(basicValue.value)
    } catch {
      // 如果不是JSON，就使用原始字符串
    }
    
    await set(basicKey.value, value)
    basicResult.value = `✅ 缓存设置成功\n键: ${basicKey.value}\n值: ${JSON.stringify(value, null, 2)}`
  } catch (error) {
    basicResult.value = `❌ 设置失败: ${error}`
  }
}

const getBasicCache = async () => {
  try {
    const data = await get(basicKey.value)
    if (data === null || data === undefined) {
      basicResult.value = `⚠️ 缓存不存在: ${basicKey.value}`
    } else {
      basicResult.value = `✅ 缓存获取成功\n键: ${basicKey.value}\n值: ${JSON.stringify(data, null, 2)}`
    }
  } catch (error) {
    basicResult.value = `❌ 获取失败: ${error}`
  }
}

const deleteBasicCache = async () => {
  try {
    await del(basicKey.value)
    basicResult.value = `✅ 缓存删除成功: ${basicKey.value}`
  } catch (error) {
    basicResult.value = `❌ 删除失败: ${error}`
  }
}

const checkBasicCache = async () => {
  try {
    const exists = await has(basicKey.value)
    basicResult.value = `🔍 缓存检查结果\n键: ${basicKey.value}\n存在: ${exists ? '是' : '否'}`
  } catch (error) {
    basicResult.value = `❌ 检查失败: ${error}`
  }
}

// 存储引擎管理方法
const switchEngine = async () => {
  try {
    // 检查是否有 switchEngine 方法
    if (typeof cacheManager.switchEngine === 'function') {
      await cacheManager.switchEngine(selectedEngine.value)
      currentEngine.value = selectedEngine.value
      engineResult.value = `✅ 成功切换到 ${selectedEngine.value} 引擎`
    } else {
      engineResult.value = `⚠️ 当前缓存管理器不支持动态切换引擎\n当前引擎: ${currentEngine.value}`
    }
  } catch (error) {
    engineResult.value = `❌ 切换失败: ${error}`
  }
}

const getEngineInfo = async () => {
  try {
    // 检查是否有 getEngineInfo 方法
    if (typeof cacheManager.getEngineInfo === 'function') {
      const info = await cacheManager.getEngineInfo()
      engineResult.value = `📊 引擎信息:\n${JSON.stringify(info, null, 2)}`
    } else {
      // 提供基本的引擎信息
      const info = {
        currentEngine: currentEngine.value,
        supportedEngines: ['memory', 'localStorage', 'sessionStorage', 'indexedDB', 'cookie'],
        cacheManagerType: cacheManager.constructor.name,
        hasStats: typeof cacheManager.getStats === 'function',
        hasCleanup: typeof cacheManager.cleanup === 'function'
      }
      engineResult.value = `📊 引擎信息:\n${JSON.stringify(info, null, 2)}`
    }
  } catch (error) {
    engineResult.value = `❌ 获取引擎信息失败: ${error}`
  }
}

// 批量操作方法
const setBatchCache = async () => {
  try {
    const data = JSON.parse(batchData.value)
    const keys = Object.keys(data)

    // 使用循环进行批量设置
    for (const key of keys) {
      await set(key, data[key])
    }

    batchResult.value = `✅ 批量设置成功\n设置了 ${keys.length} 个缓存项:\n${keys.join(', ')}`
  } catch (error) {
    batchResult.value = `❌ 批量设置失败: ${error}`
  }
}

const getBatchCache = async () => {
  try {
    const data = JSON.parse(batchData.value)
    const keys = Object.keys(data)
    const results: Record<string, any> = {}

    // 使用循环进行批量获取
    for (const key of keys) {
      results[key] = await get(key)
    }

    batchResult.value = `✅ 批量获取结果:\n${JSON.stringify(results, null, 2)}`
  } catch (error) {
    batchResult.value = `❌ 批量获取失败: ${error}`
  }
}

const getAllKeys = async () => {
  try {
    const allKeys = await keys()
    batchResult.value = `🔑 所有缓存键 (${allKeys.length} 个):\n${JSON.stringify(allKeys, null, 2)}`
  } catch (error) {
    batchResult.value = `❌ 获取键列表失败: ${error}`
  }
}

const clearAllCache = async () => {
  try {
    await clear()
    batchResult.value = `✅ 所有缓存已清空`
  } catch (error) {
    batchResult.value = `❌ 清空失败: ${error}`
  }
}

// 统计方法
const getStats = async () => {
  try {
    const currentStats = await cacheManager.getStats()
    statsResult.value = currentStats
  } catch (error) {
    console.error('获取统计失败:', error)
    statsResult.value = { error: String(error) }
  }
}

const refreshStats = async () => {
  try {
    const currentStats = await cacheManager.getStats()
    statsResult.value = currentStats
  } catch (error) {
    console.error('刷新统计失败:', error)
  }
}

const cleanup = async () => {
  try {
    await cacheManager.cleanup()
    await getStats()
    console.log('✅ 过期缓存清理完成')
  } catch (error) {
    console.error('清理失败:', error)
  }
}

// 高级功能方法
const setWithTTL = async () => {
  try {
    // 使用基础的 set 方法，传入 TTL 选项
    await set(ttlKey.value, ttlValue.value, { ttl: ttl.value })
    advancedResult.value = `✅ 带TTL缓存设置成功\n键: ${ttlKey.value}\n值: ${ttlValue.value}\nTTL: ${ttl.value}ms`
  } catch (error) {
    advancedResult.value = `❌ 设置失败: ${error}`
  }
}

const getTTL = async () => {
  try {
    // 检查是否有 getTTL 方法
    if (typeof cacheManager.getTTL === 'function') {
      const remainingTTL = await cacheManager.getTTL(ttlKey.value)
      if (remainingTTL === null) {
        advancedResult.value = `⚠️ 缓存不存在或已过期: ${ttlKey.value}`
      } else {
        advancedResult.value = `⏰ 剩余TTL\n键: ${ttlKey.value}\n剩余时间: ${remainingTTL}ms (${Math.round(remainingTTL / 1000)}秒)`
      }
    } else {
      // 如果没有 getTTL 方法，检查缓存是否存在
      const exists = await has(ttlKey.value)
      if (exists) {
        advancedResult.value = `⚠️ 缓存存在，但无法获取剩余TTL\n键: ${ttlKey.value}\n当前缓存管理器不支持TTL查询功能`
      } else {
        advancedResult.value = `⚠️ 缓存不存在: ${ttlKey.value}`
      }
    }
  } catch (error) {
    advancedResult.value = `❌ 获取TTL失败: ${error}`
  }
}

const extendTTL = async () => {
  try {
    // 检查是否有 extendTTL 方法
    if (typeof cacheManager.extendTTL === 'function') {
      await cacheManager.extendTTL(ttlKey.value, ttl.value)
      advancedResult.value = `✅ TTL延长成功\n键: ${ttlKey.value}\n延长时间: ${ttl.value}ms`
    } else {
      // 如果没有 extendTTL 方法，重新设置缓存
      const currentValue = await get(ttlKey.value)
      if (currentValue !== null && currentValue !== undefined) {
        await set(ttlKey.value, currentValue, { ttl: ttl.value })
        advancedResult.value = `✅ TTL重新设置成功\n键: ${ttlKey.value}\n新TTL: ${ttl.value}ms\n注意: 使用重新设置方式，而非延长`
      } else {
        advancedResult.value = `⚠️ 缓存不存在，无法延长TTL: ${ttlKey.value}`
      }
    }
  } catch (error) {
    advancedResult.value = `❌ 延长TTL失败: ${error}`
  }
}

// 工具方法
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时初始化
onMounted(async () => {
  await getStats()
  try {
    // 检查是否有 getCurrentEngine 方法
    if (typeof cacheManager.getCurrentEngine === 'function') {
      currentEngine.value = await cacheManager.getCurrentEngine()
      selectedEngine.value = currentEngine.value
    } else {
      // 使用默认引擎
      currentEngine.value = 'localStorage'
      selectedEngine.value = 'localStorage'
    }
  } catch (error) {
    console.error('获取当前引擎失败:', error)
    // 使用默认值
    currentEngine.value = 'localStorage'
    selectedEngine.value = 'localStorage'
  }
})
</script>

<style scoped lang="less">
.cache-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ldesign-spacing-lg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ldesign-spacing-xl);
  
  h1 {
    color: var(--ldesign-brand-color);
    margin-bottom: var(--ldesign-spacing-sm);
    font-size: 2.5rem;
    font-weight: 600;
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 1.1rem;
  }
}

.demo-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: var(--ldesign-spacing-lg);
  margin-bottom: var(--ldesign-spacing-lg);
  box-shadow: var(--ldesign-shadow-1);
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ldesign-spacing-md);
    font-size: 1.5rem;
    font-weight: 500;
    border-bottom: 2px solid var(--ldesign-brand-color);
    padding-bottom: var(--ldesign-spacing-sm);
  }
}

.operation-panel {
  margin-bottom: var(--ldesign-spacing-md);
}

.input-group {
  margin-bottom: var(--ldesign-spacing-md);
  
  label {
    display: block;
    margin-bottom: var(--ldesign-spacing-xs);
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
  }
}

.input-field, .select-field, .textarea {
  width: 100%;
  padding: var(--ldesign-spacing-sm);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
  }
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: 'Courier New', monospace;
}

.button-group {
  display: flex;
  gap: var(--ldesign-spacing-sm);
  flex-wrap: wrap;
}

.btn {
  padding: var(--ldesign-spacing-sm) var(--ldesign-spacing-md);
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.btn-primary {
  background: var(--ldesign-brand-color);
  color: white;
  
  &:hover {
    background: var(--ldesign-brand-color-hover);
  }
}

.btn-secondary {
  background: var(--ldesign-gray-color-6);
  color: white;
  
  &:hover {
    background: var(--ldesign-gray-color-7);
  }
}

.btn-danger {
  background: var(--ldesign-error-color);
  color: white;
  
  &:hover {
    background: var(--ldesign-error-color-hover);
  }
}

.btn-warning {
  background: var(--ldesign-warning-color);
  color: white;
  
  &:hover {
    background: var(--ldesign-warning-color-hover);
  }
}

.btn-info {
  background: var(--ldesign-brand-color-4);
  color: white;
  
  &:hover {
    background: var(--ldesign-brand-color-5);
  }
}

.result-panel {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 4px;
  padding: var(--ldesign-spacing-md);
  
  h3 {
    margin-bottom: var(--ldesign-spacing-sm);
    color: var(--ldesign-text-color-primary);
    font-size: 1.1rem;
  }
}

.result-content {
  background: var(--ldesign-gray-color-1);
  padding: var(--ldesign-spacing-sm);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: var(--ldesign-text-color-primary);
}

.current-engine {
  display: inline-block;
  background: var(--ldesign-brand-color-2);
  color: var(--ldesign-brand-color-8);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ldesign-spacing-md);
  margin-top: var(--ldesign-spacing-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ldesign-spacing-sm);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 4px;
}

.stat-label {
  font-weight: 500;
  color: var(--ldesign-text-color-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--ldesign-brand-color);
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .cache-demo {
    padding: var(--ldesign-spacing-md);
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
