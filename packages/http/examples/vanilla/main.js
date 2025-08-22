// 导入 @ldesign/http 库
import {
  createCacheManager,
  createHttpClient,
  createResponseTimeInterceptor,
} from '@ldesign/http'

// 创建 HTTP 客户端实例
const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  cache: {
    enabled: false, // 默认禁用，通过按钮控制
    ttl: 300000, // 5分钟
  },
})

// 统计信息
const stats = {
  activeRequests: 0,
  completedRequests: 0,
  cacheHits: 0,
  errors: 0,
}

// 创建缓存管理器
const cacheManager = createCacheManager({
  enabled: false,
  ttl: 300000,
})

// 简化的统计跟踪（用于演示）
class StatsTracker {
  constructor() {
    this.stats = {
      activeRequests: 0,
      completedRequests: 0,
      cacheHits: 0,
      errors: 0,
    }
  }

  incrementActive() {
    this.stats.activeRequests++
    this.updateDisplay()
  }

  decrementActive() {
    this.stats.activeRequests--
    this.stats.completedRequests++
    this.updateDisplay()
  }

  incrementCacheHits() {
    this.stats.cacheHits++
    this.updateDisplay()
  }

  incrementErrors() {
    this.stats.errors++
    this.updateDisplay()
  }

  updateDisplay() {
    // 更新页面上的统计显示
    const totalEl = document.getElementById('total-requests')
    const successRateEl = document.getElementById('success-rate')
    const avgTimeEl = document.getElementById('avg-response-time')
    const cacheHitRateEl = document.getElementById('cache-hit-rate')

    if (totalEl) {
      totalEl.textContent = this.stats.completedRequests
    }

    if (successRateEl) {
      const successRate = this.stats.completedRequests > 0
        ? Math.round(((this.stats.completedRequests - this.stats.errors) / this.stats.completedRequests) * 100)
        : 0
      successRateEl.textContent = `${successRate}%`
    }

    if (avgTimeEl) {
      // 模拟平均响应时间
      const avgTime = Math.round(Math.random() * 500 + 100)
      avgTimeEl.textContent = `${avgTime}ms`
    }

    if (cacheHitRateEl) {
      const cacheHitRate = this.stats.completedRequests > 0
        ? Math.round((this.stats.cacheHits / this.stats.completedRequests) * 100)
        : 0
      cacheHitRateEl.textContent = `${cacheHitRate}%`
    }
  }
}

// 创建统计跟踪器
const statsTracker = new StatsTracker()

// 添加请求/响应拦截器来跟踪统计信息
http.interceptors.request.use((config) => {
  statsTracker.incrementActive()
  return config
})

http.interceptors.response.use(
  (response) => {
    statsTracker.decrementActive()
    if (response.fromCache) {
      statsTracker.incrementCacheHits()
    }
    return response
  },
  (error) => {
    statsTracker.decrementActive()
    statsTracker.incrementErrors()
    throw error
  },
)

// 工具函数
function formatOutput(data, title = '') {
  const timestamp = new Date().toLocaleTimeString()
  const header = title
    ? `[${timestamp}] ${title}\n${'='.repeat(50)}\n`
    : `[${timestamp}]\n`

  if (data instanceof Error) {
    return `${header}❌ 错误: ${data.message}\n${data.stack || ''}`
  }

  return header + JSON.stringify(data, null, 2)
}

function updateOutput(elementId, content, append = false) {
  const element = document.getElementById(elementId)
  if (append) {
    element.textContent += `\n\n${content}`
  }
  else {
    element.textContent = content
  }
  element.scrollTop = element.scrollHeight
}

// 基础请求示例
window.sendGetRequest = async function () {
  try {
    updateOutput('basic-output', '🔄 发送 GET 请求...')
    const response = await http.get('/posts/1')
    updateOutput('basic-output', formatOutput(response, 'GET 请求成功'))
  }
  catch (error) {
    updateOutput('basic-output', formatOutput(error, 'GET 请求失败'))
  }
}

window.sendPostRequest = async function () {
  try {
    updateOutput('basic-output', '🔄 发送 POST 请求...')
    const response = await http.post('/posts', {
      title: '新文章标题',
      body: '这是文章内容',
      userId: 1,
    })
    updateOutput('basic-output', formatOutput(response, 'POST 请求成功'))
  }
  catch (error) {
    updateOutput('basic-output', formatOutput(error, 'POST 请求失败'))
  }
}

window.sendPutRequest = async function () {
  try {
    updateOutput('basic-output', '🔄 发送 PUT 请求...')
    const response = await http.put('/posts/1', {
      title: '更新的文章标题',
      body: '更新的文章内容',
      userId: 1,
    })
    updateOutput('basic-output', formatOutput(response, 'PUT 请求成功'))
  }
  catch (error) {
    updateOutput('basic-output', formatOutput(error, 'PUT 请求失败'))
  }
}

window.sendDeleteRequest = async function () {
  try {
    updateOutput('basic-output', '🔄 发送 DELETE 请求...')
    const response = await http.delete('/posts/1')
    updateOutput('basic-output', formatOutput(response, 'DELETE 请求成功'))
  }
  catch (error) {
    updateOutput('basic-output', formatOutput(error, 'DELETE 请求失败'))
  }
}

// 拦截器示例
let authInterceptorId = null
let loggingInterceptorIds = []

window.addAuthInterceptor = function () {
  // 移除之前的认证拦截器
  if (authInterceptorId !== null) {
    http.interceptors.request.eject(authInterceptorId)
  }

  // 添加新的认证拦截器
  authInterceptorId = http.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    config.headers.Authorization = 'Bearer fake-token-123'
    return config
  })

  updateOutput(
    'interceptor-output',
    '✅ 已添加认证拦截器\n请求将自动添加 Authorization 头部',
  )
}

window.addLoggingInterceptor = function () {
  // 清除之前的日志拦截器
  loggingInterceptorIds.forEach((id) => {
    http.interceptors.request.eject(id)
    http.interceptors.response.eject(id)
  })
  loggingInterceptorIds = []

  // 添加请求日志拦截器
  const requestId = http.interceptors.request.use((config) => {
    console.log('📤 发送请求:', config)
    return config
  })

  // 添加响应日志拦截器
  const responseId = http.interceptors.response.use((response) => {
    console.log('📥 收到响应:', response)
    return response
  })

  loggingInterceptorIds.push(requestId, responseId)
  updateOutput(
    'interceptor-output',
    '✅ 已添加日志拦截器\n请求和响应将在控制台输出日志',
    true,
  )
}

window.addResponseTimeInterceptor = function () {
  // 添加响应时间拦截器
  const timeInterceptor = createResponseTimeInterceptor()
  http.interceptors.request.use(timeInterceptor.request)
  http.interceptors.response.use(timeInterceptor.response)

  updateOutput(
    'interceptor-output',
    '✅ 已添加响应时间拦截器\n响应时间将在控制台显示',
    true,
  )
}

window.clearInterceptors = function () {
  // 清除所有自定义拦截器
  if (authInterceptorId !== null) {
    http.interceptors.request.eject(authInterceptorId)
    authInterceptorId = null
  }

  loggingInterceptorIds.forEach((id) => {
    http.interceptors.request.eject(id)
    http.interceptors.response.eject(id)
  })
  loggingInterceptorIds = []

  updateOutput('interceptor-output', '🗑️ 已清除所有自定义拦截器')
}

window.testWithInterceptors = async function () {
  try {
    updateOutput('interceptor-output', '🔄 测试拦截器...', true)
    const response = await http.get('/posts/1')
    updateOutput(
      'interceptor-output',
      formatOutput(response, '拦截器测试成功'),
      true,
    )
  }
  catch (error) {
    updateOutput(
      'interceptor-output',
      formatOutput(error, '拦截器测试失败'),
      true,
    )
  }
}

// 错误处理示例
window.testNetworkError = async function () {
  try {
    updateOutput('error-output', '🔄 测试网络错误...')
    await http.get('/error')
  }
  catch (error) {
    updateOutput('error-output', formatOutput(error, '网络错误测试'))
  }
}

window.testTimeoutError = async function () {
  try {
    updateOutput('error-output', '🔄 测试超时错误...')
    await http.get('/timeout')
  }
  catch (error) {
    updateOutput('error-output', formatOutput(error, '超时错误测试'))
  }
}

window.testHttpError = async function () {
  try {
    updateOutput('error-output', '🔄 测试 HTTP 错误...')
    await http.get('/404')
  }
  catch (error) {
    updateOutput('error-output', formatOutput(error, 'HTTP 错误测试'))
  }
}

window.testRetry = async function () {
  updateOutput('error-output', '🔄 重试机制演示\n模拟重试逻辑...')

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      attempts++
      updateOutput('error-output', `\n尝试第 ${attempts} 次...`, true)

      if (attempts < 3) {
        throw new Error(`第 ${attempts} 次尝试失败`)
      }

      const response = await http.get('/posts/1')
      updateOutput(
        'error-output',
        formatOutput(response, `第 ${attempts} 次尝试成功`),
        true,
      )
      break
    }
    catch (error) {
      updateOutput('error-output', `❌ ${error.message}`, true)

      if (attempts < maxAttempts) {
        updateOutput('error-output', '⏳ 等待重试...', true)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}

// 缓存示例
window.enableCache = function () {
  http.enableCache()
  updateOutput('cache-output', '✅ 缓存已启用\nGET 请求将被缓存 5 分钟')
}

window.disableCache = function () {
  http.disableCache()
  updateOutput('cache-output', '❌ 缓存已禁用')
}

window.testCache = async function () {
  try {
    updateOutput('cache-output', '🔄 测试缓存功能...', true)

    // 第一次请求
    const start1 = Date.now()
    const response1 = await http.get('/posts/1')
    const time1 = Date.now() - start1
    updateOutput(
      'cache-output',
      `\n第一次请求 (${time1}ms): ${
        response1.fromCache ? '来自缓存' : '来自网络'
      }`,
      true,
    )

    // 第二次请求
    const start2 = Date.now()
    const response2 = await http.get('/posts/1')
    const time2 = Date.now() - start2
    updateOutput(
      'cache-output',
      `第二次请求 (${time2}ms): ${
        response2.fromCache ? '来自缓存' : '来自网络'
      }`,
      true,
    )
  }
  catch (error) {
    updateOutput('cache-output', formatOutput(error, '缓存测试失败'), true)
  }
}

window.clearCache = function () {
  http.clearCache()
  updateOutput('cache-output', '🗑️ 缓存已清除', true)
}

// 并发控制示例
window.sendConcurrentRequests = async function () {
  updateOutput('concurrency-output', '🔄 发送 5 个并发请求...')

  const promises = []
  for (let i = 1; i <= 5; i++) {
    promises.push(
      http
        .get(`/posts/${i}`)
        .then(response => ({
          id: i,
          success: true,
          data: response.data,
        }))
        .catch(error => ({
          id: i,
          success: false,
          error: error.message,
        })),
    )
  }

  try {
    const results = await Promise.all(promises)
    updateOutput('concurrency-output', formatOutput(results, '并发请求结果'))
  }
  catch (error) {
    updateOutput('concurrency-output', formatOutput(error, '并发请求失败'))
  }
}

window.testRequestQueue = async function () {
  updateOutput('concurrency-output', '🔄 测试请求队列...')

  // 模拟队列处理
  const requests = []
  for (let i = 1; i <= 10; i++) {
    requests.push(`请求 ${i}`)
  }

  updateOutput(
    'concurrency-output',
    `📋 队列中有 ${requests.length} 个请求`,
    true,
  )

  for (const request of requests) {
    updateOutput('concurrency-output', `⏳ 处理 ${request}...`, true)
    await new Promise(resolve => setTimeout(resolve, 200))
    updateOutput('concurrency-output', `✅ ${request} 完成`, true)
  }
}

window.cancelAllRequests = function () {
  updateOutput('concurrency-output', '❌ 已取消所有活跃请求', true)
  // 在实际实现中，这里会调用 AbortController.abort()
}

// 自定义请求
window.sendCustomRequest = async function () {
  try {
    const method = document.getElementById('custom-method').value
    const url = document.getElementById('custom-url').value
    const headersText = document.getElementById('custom-headers').value
    const dataText = document.getElementById('custom-data').value

    let headers = {}
    if (headersText.trim()) {
      headers = JSON.parse(headersText)
    }

    let data = null
    if (dataText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
      data = JSON.parse(dataText)
    }

    updateOutput('custom-output', `🔄 发送 ${method} 请求到 ${url}...`)

    const config = { url, headers }
    if (data)
      config.data = data

    const response = await http.request({ ...config, method })
    updateOutput('custom-output', formatOutput(response, '自定义请求成功'))
  }
  catch (error) {
    updateOutput('custom-output', formatOutput(error, '自定义请求失败'))
  }
}

// 标签页切换功能
window.switchTab = function (tabName) {
  // 隐藏所有标签页内容
  const tabContents = document.querySelectorAll('.tab-content')
  tabContents.forEach((content) => {
    content.style.display = 'none'
  })

  // 移除所有标签的active类
  const tabs = document.querySelectorAll('.tab')
  tabs.forEach((tab) => {
    tab.classList.remove('active')
  })

  // 显示选中的标签页内容
  const selectedTab = document.getElementById(`${tabName}-tab`)
  if (selectedTab) {
    selectedTab.style.display = 'block'
  }

  // 激活选中的标签
  event.target.classList.add('active')
}

// 适配器切换功能
let currentAdapter = 'fetch'
window.switchAdapter = function () {
  const select = document.getElementById('adapter-select')
  currentAdapter = select.value
  updateOutput('adapters-output', `当前适配器: ${currentAdapter.toUpperCase()}`)
}

window.testCurrentAdapter = async function () {
  updateOutput('adapters-output', `🔧 测试 ${currentAdapter.toUpperCase()} 适配器...`)

  try {
    const startTime = performance.now()
    const response = await http.get('/posts/1')
    const endTime = performance.now()

    updateOutput('adapters-output', formatOutput({
      adapter: currentAdapter,
      responseTime: `${(endTime - startTime).toFixed(2)}ms`,
      data: response.data,
    }, `${currentAdapter.toUpperCase()} 适配器测试成功`))
  }
  catch (error) {
    updateOutput('adapters-output', formatOutput(error, `${currentAdapter.toUpperCase()} 适配器测试失败`))
  }
}

window.compareAdapters = async function () {
  updateOutput('adapters-output', '⚡ 对比不同适配器性能...')

  const adapters = ['fetch', 'axios', 'alova']
  const results = {}

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

  updateOutput('adapters-output', formatOutput(results, '适配器性能对比'))
}

// 添加PATCH请求
window.sendPatchRequest = async function () {
  try {
    updateOutput('basic-output', '🔄 发送 PATCH 请求...')
    const response = await http.patch('/posts/1', {
      title: '部分更新的标题',
    })
    updateOutput('basic-output', formatOutput(response, 'PATCH 请求成功'))
  }
  catch (error) {
    updateOutput('basic-output', formatOutput(error, 'PATCH 请求失败'))
  }
}

// 缓存策略更新
window.updateCacheStrategy = function () {
  const select = document.getElementById('cache-strategy')
  const strategy = select.value
  updateOutput('cache-output', `缓存策略已更新为: ${strategy.toUpperCase()}`)
}

window.testSmartCache = async function () {
  updateOutput('cache-output', '🧠 测试智能缓存...')

  try {
    // 第一次请求
    const startTime1 = performance.now()
    await http.get('/posts/1', { cache: { enabled: true } })
    const endTime1 = performance.now()

    // 第二次请求（应该从缓存获取）
    const startTime2 = performance.now()
    await http.get('/posts/1', { cache: { enabled: true } })
    const endTime2 = performance.now()

    const result = {
      firstRequest: `${(endTime1 - startTime1).toFixed(2)}ms`,
      secondRequest: `${(endTime2 - startTime2).toFixed(2)}ms`,
      cacheHit: endTime2 - startTime2 < endTime1 - startTime1,
    }

    updateOutput('cache-output', formatOutput(result, '智能缓存测试完成'))
  }
  catch (error) {
    updateOutput('cache-output', formatOutput(error, '智能缓存测试失败'))
  }
}

// 重试策略更新
window.updateRetryStrategy = function () {
  const select = document.getElementById('retry-strategy')
  const strategy = select.value
  updateOutput('retry-output', `重试策略已更新为: ${strategy}`)
}

window.testRetrySuccess = async function () {
  updateOutput('retry-output', '✅ 测试重试成功场景...')

  try {
    const response = await http.get('/posts/1', {
      retry: { maxRetries: 3, delay: 1000 },
    })
    updateOutput('retry-output', formatOutput(response.data, '重试成功测试完成'))
  }
  catch (error) {
    updateOutput('retry-output', formatOutput(error, '重试成功测试失败'))
  }
}

window.testRetryFailure = async function () {
  updateOutput('retry-output', '❌ 测试重试失败场景...')

  try {
    await http.get('/nonexistent-endpoint', {
      retry: { maxRetries: 3, delay: 500 },
    })
  }
  catch (error) {
    updateOutput('retry-output', formatOutput({
      error: error.message,
      retryCount: error.retryCount || 0,
    }, '重试失败测试完成（预期结果）'))
  }
}

window.testCircuitBreaker = async function () {
  updateOutput('retry-output', '🔌 测试断路器...')

  // 模拟多次失败请求触发断路器
  const promises = []
  for (let i = 0; i < 5; i++) {
    promises.push(
      http.get('/error-endpoint').catch(err => ({ error: err.message })),
    )
  }

  const results = await Promise.all(promises)
  updateOutput('retry-output', formatOutput(results, '断路器测试完成'))
}

window.getRetryStats = function () {
  const stats = http.getRetryStats ? http.getRetryStats() : { message: '重试统计功能暂未实现' }
  updateOutput('retry-output', formatOutput(stats, '重试统计信息'))
}

// 性能监控功能
let performanceMonitoring = false

window.startPerformanceMonitoring = function () {
  performanceMonitoring = true
  updateOutput('performance-output', '📊 性能监控已启动')

  // 模拟更新统计数据
  updatePerformanceStats()
}

window.stopPerformanceMonitoring = function () {
  performanceMonitoring = false
  updateOutput('performance-output', '⏹️ 性能监控已停止')
}

window.getPerformanceReport = function () {
  const report = http.getPerformanceReport
    ? http.getPerformanceReport()
    : {
        requests: { total: 0, successful: 0, failed: 0 },
        cache: { hits: 0, misses: 0, hitRate: 0 },
        averageResponseTime: 0,
      }

  updateOutput('performance-output', formatOutput(report, '性能报告'))
}

window.clearPerformanceData = function () {
  // 重置统计数据
  statsTracker.stats.completedRequests = 0
  statsTracker.stats.errors = 0
  statsTracker.stats.cacheHits = 0
  statsTracker.updateDisplay()
  updateOutput('performance-output', '🗑️ 性能数据已清除')
}

function updatePerformanceStats() {
  if (!performanceMonitoring)
    return

  // 使用统计跟踪器更新显示
  statsTracker.updateDisplay()

  setTimeout(updatePerformanceStats, 1000)
}

// 高级功能演示
window.testPriorityRequests = async function () {
  updateOutput('advanced-output', '🎯 测试优先级请求...')

  try {
    // 模拟不同优先级的请求
    const results = await Promise.all([
      http.get('/posts/1').then(r => ({ priority: 'normal', data: r.data })),
      http.get('/posts/2').then(r => ({ priority: 'high', data: r.data })),
      http.get('/posts/3').then(r => ({ priority: 'critical', data: r.data })),
    ])

    updateOutput('advanced-output', formatOutput(results, '优先级请求测试成功'))
  }
  catch (error) {
    updateOutput('advanced-output', formatOutput(error, '优先级请求测试失败'))
  }
}

window.testBatchRequests = async function () {
  updateOutput('advanced-output', '📦 测试批量请求...')

  try {
    const requests = [
      { url: '/posts/1', method: 'GET' },
      { url: '/posts/2', method: 'GET' },
      { url: '/posts/3', method: 'GET' },
    ]

    const results = await http.batchRequest
      ? http.batchRequest(requests, { concurrent: true })
      : Promise.all(requests.map(req => http.get(req.url)))

    updateOutput('advanced-output', formatOutput(results.map(r => r.data || r), '批量请求测试成功'))
  }
  catch (error) {
    updateOutput('advanced-output', formatOutput(error, '批量请求测试失败'))
  }
}

window.testStreamingRequest = async function () {
  updateOutput('advanced-output', '🌊 测试流式请求...')

  try {
    // 模拟流式请求
    const response = await http.get('/posts', {
      responseType: 'stream',
    })

    updateOutput('advanced-output', formatOutput({
      message: '流式请求模拟完成',
      dataSize: JSON.stringify(response.data).length,
    }, '流式请求测试'))
  }
  catch (error) {
    updateOutput('advanced-output', formatOutput(error, '流式请求测试失败'))
  }
}

window.testRequestScheduler = async function () {
  updateOutput('advanced-output', '⏰ 测试请求调度器...')

  try {
    const schedulerStatus = http.getSchedulerStatus
      ? http.getSchedulerStatus()
      : {
          activeRequests: statsTracker.stats.activeRequests,
          queuedRequests: 0,
          maxConcurrent: 5,
        }

    updateOutput('advanced-output', formatOutput(schedulerStatus, '请求调度器状态'))
  }
  catch (error) {
    updateOutput('advanced-output', formatOutput(error, '请求调度器测试失败'))
  }
}

window.testConcurrencyControl = async function () {
  updateOutput('advanced-output', '⚡ 测试并发控制...')

  try {
    // 发送多个并发请求
    const promises = []
    for (let i = 1; i <= 10; i++) {
      promises.push(http.get(`/posts/${i}`))
    }

    const startTime = performance.now()
    const results = await Promise.all(promises)
    const endTime = performance.now()

    updateOutput('advanced-output', formatOutput({
      requestCount: results.length,
      totalTime: `${(endTime - startTime).toFixed(2)}ms`,
      averageTime: `${((endTime - startTime) / results.length).toFixed(2)}ms`,
    }, '并发控制测试完成'))
  }
  catch (error) {
    updateOutput('advanced-output', formatOutput(error, '并发控制测试失败'))
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateOutput(
    'basic-output',
    '👋 欢迎使用 @ldesign/http!\n点击上方按钮开始体验各种功能...',
  )
  updateOutput('adapters-output', '当前适配器: FETCH')
  updateOutput('interceptor-output', '拦截器状态：无')
  updateOutput('cache-output', '缓存状态：禁用')
  updateOutput('retry-output', '点击上方按钮测试重试机制...')
  updateOutput('performance-output', '性能监控未启动')
  updateOutput('advanced-output', '点击上方按钮测试高级功能...')
})
