<template>
  <div class="http-demo-container">
    <div class="http-header">
      <h1 class="http-title">{{ t('http.title') || 'HTTP 演示' }}</h1>
      <p class="http-subtitle">{{ t('http.subtitle') || '体验 @ldesign/http 网络请求功能' }}</p>
    </div>
    
    <div class="http-grid">
      <!-- GET 请求演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <Download class="icon" /> 
          GET 请求
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>请求 URL</label>
            <input 
              v-model="getUrl" 
              type="text" 
              placeholder="输入 API 地址"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="sendGetRequest" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> {{ loading ? '请求中...' : '发送请求' }}
            </button>
            <button @click="clearGetResult" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="getResult" class="result-box">
            <label>响应结果</label>
            <pre class="result-content">{{ formatJSON(getResult) }}</pre>
          </div>
          <div v-if="getError" class="result-box error">
            <label>错误信息</label>
            <div class="result-content">{{ getError }}</div>
          </div>
        </div>
      </div>

      <!-- POST 请求演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <Upload class="icon" /> 
          POST 请求
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>请求 URL</label>
            <input 
              v-model="postUrl" 
              type="text" 
              placeholder="输入 API 地址"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>请求数据 (JSON)</label>
            <textarea 
              v-model="postData" 
              placeholder='{"key": "value"}'
              class="textarea-field"
              rows="4"
            ></textarea>
          </div>
          <div class="button-group">
            <button @click="sendPostRequest" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> {{ loading ? '请求中...' : '发送请求' }}
            </button>
            <button @click="clearPostResult" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="postResult" class="result-box">
            <label>响应结果</label>
            <pre class="result-content">{{ formatJSON(postResult) }}</pre>
          </div>
          <div v-if="postError" class="result-box error">
            <label>错误信息</label>
            <div class="result-content">{{ postError }}</div>
          </div>
        </div>
      </div>

      <!-- 拦截器演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <Filter class="icon" /> 
          拦截器
        </h3>
        <div class="card-content">
          <div class="interceptor-info">
            <p>拦截器可以拦截请求和响应，用于添加认证、日志记录等功能。</p>
          </div>
          <div class="button-group">
            <button @click="addRequestInterceptor" class="action-btn primary">
              <Plus class="btn-icon" /> 添加请求拦截器
            </button>
            <button @click="addResponseInterceptor" class="action-btn secondary">
              <Plus class="btn-icon" /> 添加响应拦截器
            </button>
            <button @click="clearInterceptors" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除拦截器
            </button>
          </div>
          <div v-if="interceptorLogs.length > 0" class="result-box">
            <label>拦截器日志</label>
            <div class="log-list">
              <div v-for="(log, index) in interceptorLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 缓存功能演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <Database class="icon" /> 
          请求缓存
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>缓存 URL</label>
            <input 
              v-model="cacheUrl" 
              type="text" 
              placeholder="输入 API 地址"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>缓存时间（秒）</label>
            <input 
              v-model.number="cacheDuration" 
              type="number" 
              placeholder="60"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="sendCachedRequest" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 发送请求
            </button>
            <button @click="clearCache" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除缓存
            </button>
          </div>
          <div v-if="cacheInfo" class="result-box">
            <label>{{ cacheInfo.fromCache ? '缓存结果 ⚡' : '新请求结果' }}</label>
            <div class="cache-stats">
              <div><strong>请求时间:</strong> {{ cacheInfo.timestamp }}</div>
              <div><strong>来源:</strong> {{ cacheInfo.fromCache ? '缓存' : '网络' }}</div>
            </div>
            <pre class="result-content">{{ formatJSON(cacheInfo.data) }}</pre>
          </div>
        </div>
      </div>

      <!-- 重试机制演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <RefreshCw class="icon" /> 
          重试机制
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>重试次数</label>
            <input 
              v-model.number="retryCount" 
              type="number" 
              placeholder="3"
              min="1"
              max="5"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>重试延迟（毫秒）</label>
            <input 
              v-model.number="retryDelay" 
              type="number" 
              placeholder="1000"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="testRetry" class="action-btn primary" :disabled="loading">
              <Send class="btn-icon" /> 测试重试
            </button>
          </div>
          <div v-if="retryLogs.length > 0" class="result-box">
            <label>重试日志</label>
            <div class="log-list">
              <div v-for="(log, index) in retryLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 请求取消演示 -->
      <div class="http-card">
        <h3 class="card-title">
          <X class="icon" /> 
          请求取消
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>请求 URL</label>
            <input 
              v-model="cancelUrl" 
              type="text" 
              placeholder="输入一个慢速 API"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="sendCancellableRequest" class="action-btn primary" :disabled="cancelLoading">
              <Send class="btn-icon" /> 发送请求
            </button>
            <button @click="cancelRequest" class="action-btn danger" :disabled="!cancelLoading">
              <X class="btn-icon" /> 取消请求
            </button>
          </div>
          <div v-if="cancelStatus" class="result-box" :class="{ error: cancelStatus.includes('取消') }">
            <label>状态</label>
            <div class="result-content">{{ cancelStatus }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import { createHttpClient } from '@ldesign/http'
import { 
  Download, Upload, Send, Trash2, Filter, Plus, Database, 
  RefreshCw, X 
} from 'lucide-vue-next'

const { t } = useI18n()

// 创建 HTTP 客户端实例
const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
})

// GET 请求
const getUrl = ref('https://jsonplaceholder.typicode.com/posts/1')
const getResult = ref<any>(null)
const getError = ref('')
const loading = ref(false)

const sendGetRequest = async () => {
  loading.value = true
  getError.value = ''
  getResult.value = null
  
  try {
    const response = await http.get(getUrl.value)
    getResult.value = response.data
  } catch (error: any) {
    getError.value = error.message || '请求失败'
  } finally {
    loading.value = false
  }
}

const clearGetResult = () => {
  getResult.value = null
  getError.value = ''
}

// POST 请求
const postUrl = ref('https://jsonplaceholder.typicode.com/posts')
const postData = ref('{\n  "title": "测试标题",\n  "body": "测试内容",\n  "userId": 1\n}')
const postResult = ref<any>(null)
const postError = ref('')

const sendPostRequest = async () => {
  loading.value = true
  postError.value = ''
  postResult.value = null
  
  try {
    const data = JSON.parse(postData.value)
    const response = await http.post(postUrl.value, data)
    postResult.value = response.data
  } catch (error: any) {
    postError.value = error.message || '请求失败'
  } finally {
    loading.value = false
  }
}

const clearPostResult = () => {
  postResult.value = null
  postError.value = ''
}

// 拦截器
interface Log {
  time: string
  message: string
}

const interceptorLogs = ref<Log[]>([])

const addLog = (message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  interceptorLogs.value.push({ time, message })
}

const addRequestInterceptor = () => {
  http.interceptors.request.use(
    (config) => {
      addLog(`请求拦截器: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      addLog(`请求拦截器错误: ${error.message}`)
      return Promise.reject(error)
    }
  )
  addLog('✓ 请求拦截器已添加')
}

const addResponseInterceptor = () => {
  http.interceptors.response.use(
    (response) => {
      addLog(`响应拦截器: 状态 ${response.status}`)
      return response
    },
    (error) => {
      addLog(`响应拦截器错误: ${error.message}`)
      return Promise.reject(error)
    }
  )
  addLog('✓ 响应拦截器已添加')
}

const clearInterceptors = () => {
  interceptorLogs.value = []
  addLog('拦截器日志已清除')
}

// 缓存功能
const cacheUrl = ref('https://jsonplaceholder.typicode.com/posts/1')
const cacheDuration = ref(60)
const cacheInfo = ref<any>(null)

const sendCachedRequest = async () => {
  loading.value = true
  
  try {
    const response = await http.get(cacheUrl.value, {
      cache: {
        ttl: cacheDuration.value * 1000,
      }
    })
    
    cacheInfo.value = {
      data: response.data,
      fromCache: response.config?.cached || false,
      timestamp: new Date().toLocaleTimeString()
    }
  } catch (error: any) {
    console.error('缓存请求失败:', error)
  } finally {
    loading.value = false
  }
}

const clearCache = () => {
  cacheInfo.value = null
}

// 重试机制
const retryCount = ref(3)
const retryDelay = ref(1000)
const retryLogs = ref<Log[]>([])

const addRetryLog = (message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  retryLogs.value.push({ time, message })
}

const testRetry = async () => {
  loading.value = true
  retryLogs.value = []
  
  addRetryLog(`开始请求，最多重试 ${retryCount.value} 次`)
  
  try {
    await http.get('https://httpstat.us/500', {
      retry: {
        retries: retryCount.value,
        retryDelay: retryDelay.value,
      }
    })
  } catch (error: any) {
    addRetryLog(`所有重试失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 请求取消
const cancelUrl = ref('https://httpstat.us/200?sleep=5000')
const cancelLoading = ref(false)
const cancelStatus = ref('')
let cancelTokenSource: any = null

const sendCancellableRequest = async () => {
  cancelLoading.value = true
  cancelStatus.value = '请求进行中...'
  
  try {
    const { CancelToken } = await import('@ldesign/http')
    cancelTokenSource = CancelToken.source()
    
    const response = await http.get(cancelUrl.value, {
      cancelToken: cancelTokenSource.token
    })
    
    cancelStatus.value = '请求成功完成'
    console.log('Response:', response.data)
  } catch (error: any) {
    if (error.message?.includes('cancel')) {
      cancelStatus.value = '请求已取消 ❌'
    } else {
      cancelStatus.value = `请求失败: ${error.message}`
    }
  } finally {
    cancelLoading.value = false
  }
}

const cancelRequest = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('用户主动取消请求')
    cancelStatus.value = '正在取消请求...'
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
.http-demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.http-header {
  text-align: center;
  margin-bottom: 40px;
}

.http-title {
  font-size: 36px;
  color: var(--color-text-primary, #333);
  margin: 0 0 10px 0;
}

.http-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary, #666);
  margin: 0;
}

.http-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.http-card {
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

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: inherit;
}

.textarea-field {
  resize: vertical;
  font-family: monospace;
}

.input-field:focus,
.textarea-field:focus {
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
  min-width: 120px;
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

.interceptor-info {
  padding: 12px;
  background: #e6f7ff;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #1890ff;
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

.cache-stats {
  background: white;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 13px;
}

.cache-stats div {
  padding: 4px 0;
}

@media (max-width: 768px) {
  .http-grid {
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


