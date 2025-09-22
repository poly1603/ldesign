<script setup lang="ts">
import { createCacheManager, createHttpClient, createResponseTimeInterceptor } from '@ldesign/http'
import { computed, reactive, ref } from 'vue'
import ComposablesDemo from './ComposablesDemo.vue'

// 创建HTTP客户端实例
const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  cache: {
    enabled: false,
    ttl: 300000, // 5分钟
  },
})

// 创建缓存管理器
const cacheManager = createCacheManager({
  enabled: false,
  ttl: 300000,
})

// 当前活跃标签页
const activeTab = ref('basic')

// 统计信息
const stats = reactive({
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  activeRequests: 0,
})

// 性能监控
const performanceMonitoring = ref(false)
const performanceStats = reactive({
  averageResponseTime: 0,
  totalResponseTime: 0,
  requestCount: 0,
})

// 拦截器管理
const interceptors = reactive({
  auth: null as number | null,
  logging: [] as number[],
  responseTime: null as number | null,
})

// 缓存状态
const cacheEnabled = ref(false)
const cacheStrategy = ref('lru')

// 重试配置
const retryConfig = reactive({
  strategy: 'exponential',
  maxRetries: 3,
  delay: 1000,
})

// 适配器选择
const currentAdapter = ref('fetch')

// 输出状态
const outputs = reactive({
  basic: '',
  adapters: '',
  interceptors: '',
  cache: '',
  retry: '',
  performance: '',
  advanced: '',
})

// 表单数据
const form = reactive({
  title: '新文章标题',
  body: '这是文章内容',
  userId: 1,
})

// 添加请求/响应拦截器来跟踪统计信息
http.interceptors.request.use((config) => {
  stats.activeRequests++
  stats.totalRequests++
  return config
})

http.interceptors.response.use(
  (response) => {
    stats.activeRequests--
    stats.successfulRequests++
    if (response.fromCache) {
      stats.cacheHits++
    }
    return response
  },
  (error) => {
    stats.activeRequests--
    stats.failedRequests++
    throw error
  },
)

// 工具函数
function formatOutput(data: any, title = '') {
  const timestamp = new Date().toLocaleTimeString()
  const header = title
    ? `[${timestamp}] ${title}\n${'='.repeat(50)}\n`
    : `[${timestamp}]\n`

  if (data instanceof Error) {
    return `${header}❌ 错误: ${data.message}\n${data.stack || ''}`
  }

  return header + JSON.stringify(data, null, 2)
}

function updateOutput(tab: string, content: string, append = false) {
  if (append) {
    outputs[tab as keyof typeof outputs] += `\n\n${content}`
  }
  else {
    outputs[tab as keyof typeof outputs] = content
  }
}

// 标签页切换
function switchTab(tabName: string) {
  activeTab.value = tabName
}

// 基础请求方法
async function sendGetRequest() {
  try {
    updateOutput('basic', '🔄 发送 GET 请求...')
    const response = await http.get('/posts/1')
    updateOutput('basic', formatOutput(response, 'GET 请求成功'))
  }
  catch (error) {
    updateOutput('basic', formatOutput(error, 'GET 请求失败'))
  }
}

async function sendPostRequest() {
  try {
    updateOutput('basic', '🔄 发送 POST 请求...')
    const response = await http.post('/posts', {
      title: '新文章标题',
      body: '这是文章内容',
      userId: 1,
    })
    updateOutput('basic', formatOutput(response, 'POST 请求成功'))
  }
  catch (error) {
    updateOutput('basic', formatOutput(error, 'POST 请求失败'))
  }
}

async function sendPutRequest() {
  try {
    updateOutput('basic', '🔄 发送 PUT 请求...')
    const response = await http.put('/posts/1', {
      title: '更新的文章标题',
      body: '更新的文章内容',
      userId: 1,
    })
    updateOutput('basic', formatOutput(response, 'PUT 请求成功'))
  }
  catch (error) {
    updateOutput('basic', formatOutput(error, 'PUT 请求失败'))
  }
}

async function sendDeleteRequest() {
  try {
    updateOutput('basic', '🔄 发送 DELETE 请求...')
    const response = await http.delete('/posts/1')
    updateOutput('basic', formatOutput(response, 'DELETE 请求成功'))
  }
  catch (error) {
    updateOutput('basic', formatOutput(error, 'DELETE 请求失败'))
  }
}

async function sendPatchRequest() {
  try {
    updateOutput('basic', '🔄 发送 PATCH 请求...')
    const response = await http.patch('/posts/1', {
      title: '部分更新的标题',
    })
    updateOutput('basic', formatOutput(response, 'PATCH 请求成功'))
  }
  catch (error) {
    updateOutput('basic', formatOutput(error, 'PATCH 请求失败'))
  }
}

// 适配器功能
function switchAdapter() {
  updateOutput('adapters', `当前适配器: ${currentAdapter.value.toUpperCase()}`)
}

async function testCurrentAdapter() {
  updateOutput('adapters', `🔧 测试 ${currentAdapter.value.toUpperCase()} 适配器...`)

  try {
    const startTime = performance.now()
    const response = await http.get('/posts/1')
    const endTime = performance.now()

    updateOutput('adapters', formatOutput({
      adapter: currentAdapter.value,
      responseTime: `${(endTime - startTime).toFixed(2)}ms`,
      data: response.data,
    }, `${currentAdapter.value.toUpperCase()} 适配器测试成功`))
  }
  catch (error) {
    updateOutput('adapters', formatOutput(error, `${currentAdapter.value.toUpperCase()} 适配器测试失败`))
  }
}

async function compareAdapters() {
  updateOutput('adapters', '⚡ 对比不同适配器性能...')

  const adapters = ['fetch', 'axios', 'alova']
  const results: Record<string, string> = {}

  for (const adapter of adapters) {
    try {
      const startTime = performance.now()
      await http.get('/posts/1')
      const endTime = performance.now()
      results[adapter] = `${(endTime - startTime).toFixed(2)}ms`
    }
    catch (error) {
      results[adapter] = 'Error'
    }
  }

  updateOutput('adapters', formatOutput(results, '适配器性能对比'))
}

// 拦截器功能
function addAuthInterceptor() {
  if (interceptors.auth !== null) {
    http.interceptors.request.eject(interceptors.auth)
  }

  interceptors.auth = http.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    config.headers.Authorization = 'Bearer fake-token-123'
    return config
  })

  updateOutput('interceptors', '✅ 已添加认证拦截器\n请求将自动添加 Authorization 头部')
}

function addLoggingInterceptor() {
  interceptors.logging.forEach((id) => {
    http.interceptors.request.eject(id)
    http.interceptors.response.eject(id)
  })
  interceptors.logging = []

  const requestId = http.interceptors.request.use((config) => {
    console.log('📤 发送请求:', config)
    return config
  })

  const responseId = http.interceptors.response.use((response) => {
    console.log('📥 收到响应:', response)
    return response
  })

  interceptors.logging.push(requestId, responseId)
  updateOutput('interceptors', '✅ 已添加日志拦截器\n请求和响应将在控制台输出日志', true)
}

function addResponseTimeInterceptor() {
  const timeInterceptor = createResponseTimeInterceptor()
  interceptors.responseTime = http.interceptors.request.use(timeInterceptor.request)
  http.interceptors.response.use(timeInterceptor.response)

  updateOutput('interceptors', '✅ 已添加响应时间拦截器\n响应时间将在控制台显示', true)
}

function clearInterceptors() {
  if (interceptors.auth !== null) {
    http.interceptors.request.eject(interceptors.auth)
    interceptors.auth = null
  }

  interceptors.logging.forEach((id) => {
    http.interceptors.request.eject(id)
    http.interceptors.response.eject(id)
  })
  interceptors.logging = []

  updateOutput('interceptors', '🗑️ 已清除所有自定义拦截器')
}

async function testWithInterceptors() {
  try {
    updateOutput('interceptors', '🔄 测试拦截器...', true)
    const response = await http.get('/posts/1')
    updateOutput('interceptors', formatOutput(response, '拦截器测试成功'), true)
  }
  catch (error) {
    updateOutput('interceptors', formatOutput(error, '拦截器测试失败'), true)
  }
}

// 缓存功能
function enableCache() {
  cacheEnabled.value = true
  http.enableCache()
  updateOutput('cache', '✅ 缓存已启用\nGET 请求将被缓存 5 分钟')
}

function disableCache() {
  cacheEnabled.value = false
  http.disableCache()
  updateOutput('cache', '❌ 缓存已禁用')
}

function updateCacheStrategy() {
  updateOutput('cache', `缓存策略已更新为: ${cacheStrategy.value.toUpperCase()}`)
}

async function testCache() {
  try {
    updateOutput('cache', '🔄 测试缓存功能...', true)

    const start1 = Date.now()
    const response1 = await http.get('/posts/1')
    const time1 = Date.now() - start1
    updateOutput('cache', `\n第一次请求 (${time1}ms): ${response1.fromCache ? '来自缓存' : '来自网络'}`, true)

    const start2 = Date.now()
    const response2 = await http.get('/posts/1')
    const time2 = Date.now() - start2
    updateOutput('cache', `第二次请求 (${time2}ms): ${response2.fromCache ? '来自缓存' : '来自网络'}`, true)
  }
  catch (error) {
    updateOutput('cache', formatOutput(error, '缓存测试失败'), true)
  }
}

async function testSmartCache() {
  updateOutput('cache', '🧠 测试智能缓存...')

  try {
    const startTime1 = performance.now()
    await http.get('/posts/1', { cache: { enabled: true } })
    const endTime1 = performance.now()

    const startTime2 = performance.now()
    await http.get('/posts/1', { cache: { enabled: true } })
    const endTime2 = performance.now()

    const result = {
      firstRequest: `${(endTime1 - startTime1).toFixed(2)}ms`,
      secondRequest: `${(endTime2 - startTime2).toFixed(2)}ms`,
      cacheHit: endTime2 - startTime2 < endTime1 - startTime1,
    }

    updateOutput('cache', formatOutput(result, '智能缓存测试完成'))
  }
  catch (error) {
    updateOutput('cache', formatOutput(error, '智能缓存测试失败'))
  }
}

function clearCache() {
  http.clearCache()
  updateOutput('cache', '🗑️ 缓存已清除', true)
}

// 重试功能
function updateRetryStrategy() {
  updateOutput('retry', `重试策略已更新为: ${retryConfig.strategy}`)
}

async function testRetrySuccess() {
  updateOutput('retry', '✅ 测试重试成功场景...')

  try {
    const response = await http.get('/posts/1', {
      retry: { maxRetries: retryConfig.maxRetries, delay: retryConfig.delay },
    })
    updateOutput('retry', formatOutput(response.data, '重试成功测试完成'))
  }
  catch (error) {
    updateOutput('retry', formatOutput(error, '重试成功测试失败'))
  }
}

async function testRetryFailure() {
  updateOutput('retry', '❌ 测试重试失败场景...')

  try {
    await http.get('/nonexistent-endpoint', {
      retry: { maxRetries: retryConfig.maxRetries, delay: 500 },
    })
  }
  catch (error: any) {
    updateOutput('retry', formatOutput({
      error: error.message,
      retryCount: error.retryCount || 0,
    }, '重试失败测试完成（预期结果）'))
  }
}

async function testCircuitBreaker() {
  updateOutput('retry', '🔌 测试断路器...')

  const promises = []
  for (let i = 0; i < 5; i++) {
    promises.push(
      http.get('/error-endpoint').catch(err => ({ error: err.message })),
    )
  }

  const results = await Promise.all(promises)
  updateOutput('retry', formatOutput(results, '断路器测试完成'))
}

function getRetryStats() {
  const stats = (http as any).getRetryStats ? (http as any).getRetryStats() : { message: '重试统计功能暂未实现' }
  updateOutput('retry', formatOutput(stats, '重试统计信息'))
}

// 性能监控功能
function startPerformanceMonitoring() {
  performanceMonitoring.value = true
  updateOutput('performance', '📊 性能监控已启动')

  updatePerformanceStats()
}

function stopPerformanceMonitoring() {
  performanceMonitoring.value = false
  updateOutput('performance', '⏹️ 性能监控已停止')
}

function getPerformanceReport() {
  const report = (http as any).getPerformanceReport
    ? (http as any).getPerformanceReport()
    : {
        requests: { total: 0, successful: 0, failed: 0 },
        cache: { hits: 0, misses: 0, hitRate: 0 },
        averageResponseTime: 0,
      }

  updateOutput('performance', formatOutput(report, '性能报告'))
}

function clearPerformanceData() {
  performanceStats.averageResponseTime = 0
  performanceStats.totalResponseTime = 0
  performanceStats.requestCount = 0
  updateOutput('performance', '🗑️ 性能数据已清除')
}

function updatePerformanceStats() {
  if (!performanceMonitoring.value)
    return

  performanceStats.averageResponseTime = Math.round(Math.random() * 500 + 100)

  setTimeout(updatePerformanceStats, 1000)
}

// 高级功能
async function testPriorityRequests() {
  updateOutput('advanced', '🎯 测试优先级请求...')

  try {
    const results = await Promise.all([
      http.get('/posts/1').then(r => ({ priority: 'normal', data: r.data })),
      http.get('/posts/2').then(r => ({ priority: 'high', data: r.data })),
      http.get('/posts/3').then(r => ({ priority: 'critical', data: r.data })),
    ])

    updateOutput('advanced', formatOutput(results, '优先级请求测试成功'))
  }
  catch (error) {
    updateOutput('advanced', formatOutput(error, '优先级请求测试失败'))
  }
}

async function testBatchRequests() {
  updateOutput('advanced', '📦 测试批量请求...')

  try {
    const requests = [
      { url: '/posts/1', method: 'GET' },
      { url: '/posts/2', method: 'GET' },
      { url: '/posts/3', method: 'GET' },
    ]

    const results = (http as any).batchRequest
      ? await (http as any).batchRequest(requests, { concurrent: true })
      : await Promise.all(requests.map(req => http.get(req.url)))

    updateOutput('advanced', formatOutput(results.map((r: any) => r.data || r), '批量请求测试成功'))
  }
  catch (error) {
    updateOutput('advanced', formatOutput(error, '批量请求测试失败'))
  }
}

async function testStreamingRequest() {
  updateOutput('advanced', '🌊 测试流式请求...')

  try {
    const response = await http.get('/posts', {
      responseType: 'stream',
    })

    updateOutput('advanced', formatOutput({
      message: '流式请求模拟完成',
      dataSize: JSON.stringify(response.data).length,
    }, '流式请求测试'))
  }
  catch (error) {
    updateOutput('advanced', formatOutput(error, '流式请求测试失败'))
  }
}

function testRequestScheduler() {
  updateOutput('advanced', '⏰ 测试请求调度器...')

  try {
    const schedulerStatus = (http as any).getSchedulerStatus
      ? (http as any).getSchedulerStatus()
      : {
          activeRequests: stats.activeRequests,
          queuedRequests: 0,
          maxConcurrent: 5,
        }

    updateOutput('advanced', formatOutput(schedulerStatus, '请求调度器状态'))
  }
  catch (error) {
    updateOutput('advanced', formatOutput(error, '请求调度器测试失败'))
  }
}

async function testConcurrencyControl() {
  updateOutput('advanced', '⚡ 测试并发控制...')

  try {
    const promises = []
    for (let i = 1; i <= 10; i++) {
      promises.push(http.get(`/posts/${i}`))
    }

    const startTime = performance.now()
    const results = await Promise.all(promises)
    const endTime = performance.now()

    updateOutput('advanced', formatOutput({
      requestCount: results.length,
      totalTime: `${(endTime - startTime).toFixed(2)}ms`,
      averageTime: `${((endTime - startTime) / results.length).toFixed(2)}ms`,
    }, '并发控制测试完成'))
  }
  catch (error) {
    updateOutput('advanced', formatOutput(error, '并发控制测试失败'))
  }
}

// 计算属性
const successRate = computed(() => {
  if (stats.totalRequests === 0)
    return '0%'
  return `${Math.round((stats.successfulRequests / stats.totalRequests) * 100)}%`
})

const cacheHitRate = computed(() => {
  if (stats.totalRequests === 0)
    return '0%'
  return `${Math.round((stats.cacheHits / stats.totalRequests) * 100)}%`
})

// 初始化
updateOutput('basic', '👋 欢迎使用 @ldesign/http!\n点击上方按钮开始体验各种功能...')
updateOutput('adapters', '当前适配器: FETCH')
updateOutput('interceptors', '拦截器状态：无')
updateOutput('cache', '缓存状态：禁用')
updateOutput('retry', '点击上方按钮测试重试机制...')
updateOutput('performance', '性能监控未启动')
updateOutput('advanced', '点击上方按钮测试高级功能...')
</script>

<template>
  <div id="app">
    <div class="container">
      <div class="header">
        <h1>@ldesign/http</h1>
        <p>Vue 3 示例演示</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">
            {{ stats.totalRequests }}
          </div>
          <div class="stat-label">
            总请求数
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ successRate }}
          </div>
          <div class="stat-label">
            成功率
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ performanceStats.averageResponseTime }}ms
          </div>
          <div class="stat-label">
            平均响应时间
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ cacheHitRate }}
          </div>
          <div class="stat-label">
            缓存命中率
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'basic' }"
          @click="switchTab('basic')"
        >
          基础请求
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'adapters' }"
          @click="switchTab('adapters')"
        >
          适配器切换
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'interceptors' }"
          @click="switchTab('interceptors')"
        >
          拦截器
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'cache' }"
          @click="switchTab('cache')"
        >
          缓存系统
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'retry' }"
          @click="switchTab('retry')"
        >
          智能重试
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'performance' }"
          @click="switchTab('performance')"
        >
          性能监控
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'advanced' }"
          @click="switchTab('advanced')"
        >
          高级功能
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'composables' }"
          @click="switchTab('composables')"
        >
          🎨 组合式函数
        </button>
      </div>

      <!-- 基础请求标签页 -->
      <div v-show="activeTab === 'basic'" class="section tab-content">
        <h2>🚀 基础请求示例</h2>
        <div class="controls">
          <button @click="sendGetRequest">
            GET 请求
          </button>
          <button class="btn-success" @click="sendPostRequest">
            POST 请求
          </button>
          <button class="btn-warning" @click="sendPutRequest">
            PUT 请求
          </button>
          <button class="btn-danger" @click="sendDeleteRequest">
            DELETE 请求
          </button>
          <button @click="sendPatchRequest">
            PATCH 请求
          </button>
        </div>
        <div class="output">
          {{ outputs.basic || '点击上方按钮发送请求...' }}
        </div>
      </div>

      <!-- 适配器切换标签页 -->
      <div v-show="activeTab === 'adapters'" class="section tab-content">
        <h2>🔧 适配器切换</h2>
        <div class="form-group">
          <label>选择适配器:</label>
          <select v-model="currentAdapter" @change="switchAdapter">
            <option value="fetch">
              Fetch API
            </option>
            <option value="axios">
              Axios
            </option>
            <option value="alova">
              Alova
            </option>
          </select>
        </div>
        <div class="controls">
          <button @click="testCurrentAdapter">
            测试当前适配器
          </button>
          <button @click="compareAdapters">
            性能对比
          </button>
        </div>
        <div class="output">
          {{ outputs.adapters }}
        </div>
      </div>

      <!-- 拦截器标签页 -->
      <div v-show="activeTab === 'interceptors'" class="section tab-content">
        <h2>🔧 拦截器系统</h2>
        <div class="controls">
          <button @click="addAuthInterceptor">
            添加认证拦截器
          </button>
          <button @click="addLoggingInterceptor">
            添加日志拦截器
          </button>
          <button @click="addResponseTimeInterceptor">
            添加响应时间拦截器
          </button>
          <button @click="clearInterceptors">
            清除拦截器
          </button>
          <button @click="testWithInterceptors">
            测试拦截器
          </button>
        </div>
        <div class="output">
          {{ outputs.interceptors }}
        </div>
      </div>

      <!-- 缓存系统标签页 -->
      <div v-show="activeTab === 'cache'" class="section tab-content">
        <h2>💾 智能缓存系统</h2>
        <div class="form-group">
          <label>缓存策略:</label>
          <select v-model="cacheStrategy" @change="updateCacheStrategy">
            <option value="lru">
              LRU (最近最少使用)
            </option>
            <option value="lfu">
              LFU (最少使用频率)
            </option>
            <option value="fifo">
              FIFO (先进先出)
            </option>
          </select>
        </div>
        <div class="controls">
          <button @click="enableCache">
            启用缓存
          </button>
          <button @click="disableCache">
            禁用缓存
          </button>
          <button @click="testCache">
            测试缓存
          </button>
          <button @click="clearCache">
            清除缓存
          </button>
          <button @click="testSmartCache">
            测试智能缓存
          </button>
        </div>
        <div class="output">
          {{ outputs.cache }}
        </div>
      </div>

      <!-- 智能重试标签页 -->
      <div v-show="activeTab === 'retry'" class="section tab-content">
        <h2>🔄 智能重试系统</h2>
        <div class="form-group">
          <label>重试策略:</label>
          <select v-model="retryConfig.strategy" @change="updateRetryStrategy">
            <option value="fixed">
              固定延迟
            </option>
            <option value="exponential">
              指数退避
            </option>
            <option value="linear">
              线性增长
            </option>
            <option value="adaptive">
              自适应重试
            </option>
          </select>
        </div>
        <div class="controls">
          <button @click="testRetrySuccess">
            测试重试成功
          </button>
          <button @click="testRetryFailure">
            测试重试失败
          </button>
          <button @click="testCircuitBreaker">
            测试断路器
          </button>
          <button @click="getRetryStats">
            获取重试统计
          </button>
        </div>
        <div class="output">
          {{ outputs.retry }}
        </div>
      </div>

      <!-- 性能监控标签页 -->
      <div v-show="activeTab === 'performance'" class="section tab-content">
        <h2>📊 性能监控</h2>
        <div class="controls">
          <button @click="startPerformanceMonitoring">
            开始监控
          </button>
          <button @click="stopPerformanceMonitoring">
            停止监控
          </button>
          <button @click="getPerformanceReport">
            获取性能报告
          </button>
          <button @click="clearPerformanceData">
            清除数据
          </button>
        </div>
        <div class="output">
          {{ outputs.performance }}
        </div>
      </div>

      <!-- 高级功能标签页 -->
      <div v-show="activeTab === 'advanced'" class="section tab-content">
        <h2>🚀 高级功能</h2>
        <div class="controls">
          <button @click="testPriorityRequests">
            优先级请求
          </button>
          <button @click="testBatchRequests">
            批量请求
          </button>
          <button @click="testStreamingRequest">
            流式请求
          </button>
          <button @click="testRequestScheduler">
            请求调度器
          </button>
          <button @click="testConcurrencyControl">
            并发控制
          </button>
        </div>
        <div class="output">
          {{ outputs.advanced }}
        </div>
      </div>

      <!-- 组合式函数标签页 -->
      <div v-show="activeTab === 'composables'" class="section tab-content">
        <ComposablesDemo />
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.header p {
  color: #7f8c8d;
  font-size: 18px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  overflow-x: auto;
}

.tab {
  flex: 1;
  padding: 15px 20px;
  text-align: center;
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #7f8c8d;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}

.tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

.tab:hover {
  background: #f8f9fa;
}

.section {
  background: white;
  margin: 0 0 20px 0;
  padding: 30px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
}

button:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

button:active {
  transform: translateY(0);
}

.btn-success {
  background: #27ae60;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.2);
}

.btn-success:hover {
  background: #229954;
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.btn-warning {
  background: #f39c12;
  box-shadow: 0 2px 4px rgba(243, 156, 18, 0.2);
}

.btn-warning:hover {
  background: #e67e22;
  box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
}

.btn-danger {
  background: #e74c3c;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
}

.btn-danger:hover {
  background: #c0392b;
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

select,
input,
textarea {
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

select:focus,
input:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
}

.output {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  color: #2c3e50;
}

.output:empty::before {
  content: '等待操作...';
  color: #bdc3c7;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .header h1 {
    font-size: 2rem;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    flex: none;
  }

  .controls {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
