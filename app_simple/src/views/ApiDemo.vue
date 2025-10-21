<template>
  <div class="api-demo-container">
    <div class="api-header">
      <h1 class="api-title">{{ t('api.title') || 'API 演示' }}</h1>
      <p class="api-subtitle">{{ t('api.subtitle') || '体验 @ldesign/api 接口管理功能' }}</p>
    </div>
    
    <div class="api-grid">
      <!-- API Engine 基础使用 -->
      <div class="api-card">
        <h3 class="card-title">
          <Server class="icon" /> 
          API Engine
        </h3>
        <div class="card-content">
          <div class="info-box">
            <p>API Engine 提供统一的接口管理能力，支持插件化扩展。</p>
          </div>
          <div class="button-group">
            <button @click="testBasicCall" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 基础调用
            </button>
            <button @click="getEngineStatus" class="action-btn secondary">
              <Info class="btn-icon" /> 查看状态
            </button>
          </div>
          <div v-if="engineStatus" class="result-box">
            <label>Engine 状态</label>
            <pre class="result-content">{{ formatJSON(engineStatus) }}</pre>
          </div>
        </div>
      </div>

      <!-- 系统 API 演示 -->
      <div class="api-card">
        <h3 class="card-title">
          <Users class="icon" /> 
          系统 API
        </h3>
        <div class="card-content">
          <form @submit.prevent="testSystemLogin">
            <div class="input-group">
              <label>用户名</label>
              <input 
                v-model="loginForm.username" 
                type="text" 
                placeholder="admin"
                class="input-field"
                autocomplete="username"
              />
            </div>
            <div class="input-group">
              <label>密码</label>
              <input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="password"
                class="input-field"
                autocomplete="current-password"
              />
            </div>
            <div class="button-group">
              <button type="submit" class="action-btn primary" :disabled="loading">
                <LogIn class="btn-icon" /> 模拟登录
              </button>
              <button type="button" @click="testGetUserInfo" class="action-btn secondary" :disabled="!isLoggedIn">
                <User class="btn-icon" /> 获取用户信息
              </button>
              <button type="button" @click="testLogout" class="action-btn danger" :disabled="!isLoggedIn">
                <LogOut class="btn-icon" /> 登出
              </button>
            </div>
          </form>
          <div v-if="userInfo" class="result-box success">
            <label>用户信息</label>
            <pre class="result-content">{{ formatJSON(userInfo) }}</pre>
          </div>
          <div v-if="systemApiError" class="result-box error">
            <label>错误</label>
            <div class="result-content">{{ systemApiError }}</div>
          </div>
        </div>
      </div>

      <!-- 缓存策略演示 -->
      <div class="api-card">
        <h3 class="card-title">
          <Database class="icon" /> 
          缓存策略
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>API 方法名</label>
            <input 
              v-model="cacheApiMethod" 
              type="text" 
              placeholder="getUsers"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>缓存 TTL (秒)</label>
            <input 
              v-model.number="cacheTTL" 
              type="number" 
              placeholder="60"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="testCachedCall" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 带缓存调用
            </button>
            <button @click="getCacheStats" class="action-btn secondary">
              <BarChart class="btn-icon" /> 缓存统计
            </button>
            <button @click="clearApiCache" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除缓存
            </button>
          </div>
          <div v-if="cacheStats" class="result-box">
            <label>缓存统计</label>
            <div class="cache-info">
              <div class="stat-item">
                <span class="stat-label">缓存项数:</span>
                <span class="stat-value">{{ cacheStats.size || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">命中率:</span>
                <span class="stat-value">{{ calculateHitRate(cacheStats) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量请求演示 -->
      <div class="api-card">
        <h3 class="card-title">
          <Layers class="icon" /> 
          批量请求
        </h3>
        <div class="card-content">
          <div class="info-box">
            <p>批量请求可以同时发送多个 API 调用，提高效率。</p>
          </div>
          <div class="input-group">
            <label>请求数量</label>
            <input 
              v-model.number="batchCount" 
              type="number" 
              placeholder="3"
              min="1"
              max="10"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="testBatchCall" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 发送批量请求
            </button>
          </div>
          <div v-if="batchResults" class="result-box">
            <label>批量结果 ({{ batchResults.length }} 个)</label>
            <div class="batch-results">
              <div v-for="(result, index) in batchResults" :key="index" class="batch-item">
                <strong>请求 {{ index + 1 }}:</strong>
                <pre class="batch-content">{{ formatJSON(result) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 插件系统演示 -->
      <div class="api-card">
        <h3 class="card-title">
          <Puzzle class="icon" /> 
          插件系统
        </h3>
        <div class="card-content">
          <div class="info-box">
            <p>API Engine 支持灵活的插件系统，可以扩展各种功能。</p>
          </div>
          <div class="button-group">
            <button @click="addLoggingPlugin" class="action-btn primary">
              <Plus class="btn-icon" /> 添加日志插件
            </button>
            <button @click="addPerformancePlugin" class="action-btn secondary">
              <Plus class="btn-icon" /> 添加性能插件
            </button>
            <button @click="listPlugins" class="action-btn info">
              <List class="btn-icon" /> 查看插件
            </button>
          </div>
          <div v-if="pluginLogs.length > 0" class="result-box">
            <label>插件日志</label>
            <div class="log-list">
              <div v-for="(log, index) in pluginLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误处理演示 -->
      <div class="api-card">
        <h3 class="card-title">
          <AlertCircle class="icon" /> 
          错误处理
        </h3>
        <div class="card-content">
          <div class="button-group">
            <button @click="triggerNetworkError" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 网络错误
            </button>
            <button @click="triggerValidationError" class="action-btn secondary" :disabled="loading">
              <Send class="btn-icon" /> 验证错误
            </button>
            <button @click="triggerServerError" class="action-btn danger" :disabled="loading">
              <Send class="btn-icon" /> 服务器错误
            </button>
          </div>
          <div v-if="errorLogs.length > 0" class="result-box error">
            <label>错误日志</label>
            <div class="log-list">
              <div v-for="(log, index) in errorLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import { createApiEngine } from '@ldesign/api'
import { 
  Server, Send, Info, Users, User, LogIn, LogOut, Database, 
  BarChart, Trash2, Layers, Puzzle, Plus, List, AlertCircle
} from 'lucide-vue-next'

const { t } = useI18n()

// 创建 API Engine 实例
const apiEngine = createApiEngine({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
})

// 基础状态
const loading = ref(false)
const engineStatus = ref<any>(null)

// 系统 API
const loginForm = ref({
  username: 'admin',
  password: 'password123'
})
const userInfo = ref<any>(null)
const systemApiError = ref('')
const isLoggedIn = computed(() => !!userInfo.value)

// 缓存
const cacheApiMethod = ref('getUsers')
const cacheTTL = ref(60)
const cacheStats = ref<any>(null)

// 批量请求
const batchCount = ref(3)
const batchResults = ref<any[]>([])

// 插件
interface Log {
  time: string
  message: string
}
const pluginLogs = ref<Log[]>([])

// 错误处理
const errorLogs = ref<Log[]>([])

// 添加日志
const addLog = (logs: Log[], message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  logs.push({ time, message })
}

// 基础调用
const testBasicCall = async () => {
  loading.value = true
  try {
    const result = await apiEngine.call('getPosts', {
      url: '/posts/1',
      method: 'GET'
    })
    engineStatus.value = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    engineStatus.value = {
      success: false,
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

const getEngineStatus = () => {
  engineStatus.value = {
    methods: Object.keys(apiEngine['_methods'] || {}),
    plugins: Object.keys(apiEngine['_plugins'] || {}),
    config: {
      baseURL: apiEngine['_config']?.baseURL,
      timeout: apiEngine['_config']?.timeout
    }
  }
}

// 系统 API 测试
const testSystemLogin = async () => {
  loading.value = true
  systemApiError.value = ''
  
  try {
    // 模拟登录
    userInfo.value = {
      id: 1,
      username: loginForm.value.username,
      email: 'user@example.com',
      role: 'admin',
      token: 'mock-jwt-token',
      loginTime: new Date().toISOString()
    }
    addLog(pluginLogs.value, `✓ 用户 ${loginForm.value.username} 登录成功`)
  } catch (error: any) {
    systemApiError.value = error.message
    addLog(errorLogs.value, `✗ 登录失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testGetUserInfo = async () => {
  loading.value = true
  systemApiError.value = ''
  
  try {
    const result = await apiEngine.call('getUserInfo', {
      url: '/users/1',
      method: 'GET'
    })
    userInfo.value = {
      ...userInfo.value,
      ...result
    }
    addLog(pluginLogs.value, '✓ 用户信息获取成功')
  } catch (error: any) {
    systemApiError.value = error.message
    addLog(errorLogs.value, `✗ 获取用户信息失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const testLogout = () => {
  userInfo.value = null
  systemApiError.value = ''
  addLog(pluginLogs.value, '✓ 用户已登出')
}

// 缓存功能
const testCachedCall = async () => {
  loading.value = true
  
  try {
    const result = await apiEngine.call(cacheApiMethod.value, {
      url: '/users',
      method: 'GET',
      cache: {
        ttl: cacheTTL.value * 1000
      }
    })
    
    addLog(pluginLogs.value, `✓ 缓存调用成功: ${cacheApiMethod.value}`)
    engineStatus.value = {
      method: cacheApiMethod.value,
      cached: true,
      data: result.slice(0, 3) // 只显示前3条
    }
  } catch (error: any) {
    addLog(errorLogs.value, `✗ 缓存调用失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const getCacheStats = () => {
  // 模拟缓存统计
  cacheStats.value = {
    size: Math.floor(Math.random() * 10),
    hits: Math.floor(Math.random() * 100),
    misses: Math.floor(Math.random() * 50),
    hitRate: (Math.random() * 100).toFixed(2)
  }
  addLog(pluginLogs.value, '✓ 缓存统计已更新')
}

const clearApiCache = () => {
  cacheStats.value = null
  addLog(pluginLogs.value, '✓ 缓存已清除')
}

const calculateHitRate = (stats: any) => {
  if (!stats || (!stats.hits && !stats.misses)) return 0
  const total = stats.hits + stats.misses
  return total > 0 ? ((stats.hits / total) * 100).toFixed(2) : 0
}

// 批量请求
const testBatchCall = async () => {
  loading.value = true
  batchResults.value = []
  
  try {
    const promises = Array.from({ length: batchCount.value }, (_, i) => 
      apiEngine.call(`getPost${i}`, {
        url: `/posts/${i + 1}`,
        method: 'GET'
      })
    )
    
    const results = await Promise.all(promises)
    batchResults.value = results
    addLog(pluginLogs.value, `✓ 批量请求完成: ${batchCount.value} 个请求`)
  } catch (error: any) {
    addLog(errorLogs.value, `✗ 批量请求失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 插件系统
const addLoggingPlugin = () => {
  addLog(pluginLogs.value, '✓ 日志插件已添加')
  addLog(pluginLogs.value, '  - 将记录所有 API 请求和响应')
}

const addPerformancePlugin = () => {
  addLog(pluginLogs.value, '✓ 性能插件已添加')
  addLog(pluginLogs.value, '  - 将监控 API 调用性能')
}

const listPlugins = () => {
  addLog(pluginLogs.value, '📋 已安装插件列表:')
  addLog(pluginLogs.value, '  - 系统 API 插件')
  addLog(pluginLogs.value, '  - 缓存插件')
  addLog(pluginLogs.value, '  - 错误处理插件')
}

// 错误处理
const triggerNetworkError = async () => {
  loading.value = true
  try {
    await apiEngine.call('networkError', {
      url: 'https://invalid-domain-12345.com/api',
      method: 'GET'
    })
  } catch (error: any) {
    addLog(errorLogs.value, `✗ 网络错误: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const triggerValidationError = () => {
  addLog(errorLogs.value, '✗ 验证错误: 缺少必填参数')
}

const triggerServerError = async () => {
  loading.value = true
  try {
    await apiEngine.call('serverError', {
      url: 'https://httpstat.us/500',
      method: 'GET'
    })
  } catch (error: any) {
    addLog(errorLogs.value, `✗ 服务器错误: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatJSON = (data: any) => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<style scoped>
.api-demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.api-header {
  text-align: center;
  margin-bottom: 40px;
}

.api-title {
  font-size: 36px;
  color: var(--color-text-primary, #333);
  margin: 0 0 10px 0;
}

.api-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary, #666);
  margin: 0;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.api-card {
  background: var(--color-bg-container, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-title {
  font-size: 18px;
  color: var(--color-text-primary, #333);
  margin: 0;
  padding: 20px;
  background: var(--color-bg-container-secondary, #f5f5f5);
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary-default, #667eea);
}

.card-content {
  padding: 20px;
}

.info-box {
  padding: 12px;
  background: #e6f7ff;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #1890ff;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  font-size: 14px;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary-default, #667eea);
}

.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 100px;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.action-btn.primary {
  background: var(--color-primary-default, #667eea);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #5568d3);
}

.action-btn.secondary {
  background: var(--color-success-default, #48bb78);
  color: white;
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--color-success-hover, #38a169);
}

.action-btn.danger {
  background: var(--color-danger-default, #f56565);
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: var(--color-danger-hover, #e53e3e);
}

.action-btn.info {
  background: var(--color-info-default, #4299e1);
  color: white;
}

.action-btn.info:hover:not(:disabled) {
  background: var(--color-info-hover, #3182ce);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-box {
  margin-top: 15px;
  padding: 12px;
  background: #f7fafc;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  max-height: 400px;
  overflow: auto;
}

.result-box.success {
  background: #f0fff4;
  border-color: #48bb78;
}

.result-box.error {
  background: #fff5f5;
  border-color: #f56565;
}

.result-box label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  font-size: 13px;
}

.result-content {
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: var(--color-text-primary, #333);
  margin: 0;
  white-space: pre-wrap;
}

.cache-info {
  background: white;
  padding: 12px;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.batch-results {
  max-height: 300px;
  overflow-y: auto;
}

.batch-item {
  padding: 10px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
}

.batch-item:last-child {
  margin-bottom: 0;
}

.batch-content {
  margin: 8px 0 0 0;
  padding: 8px;
  background: #f7fafc;
  border-radius: 4px;
  font-size: 11px;
  white-space: pre-wrap;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #999;
  font-family: monospace;
  white-space: nowrap;
}

.log-message {
  color: #333;
  flex: 1;
}

@media (max-width: 768px) {
  .api-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>


