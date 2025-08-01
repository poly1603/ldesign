// 模拟 @ldesign/http 库
// 在实际使用中，这里应该是: import { createHttpClient } from '@ldesign/http'

// 简化的 HTTP 客户端实现用于演示
class MockHttpClient {
  constructor(config = {}) {
    this.config = config
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    }
    this.activeRequests = 0
    this.completedRequests = 0
    this.cacheEnabled = false
    this.cache = new Map()
  }

  async request(config) {
    this.activeRequests++
    this.updateStats()

    try {
      // 应用请求拦截器
      let processedConfig = { ...this.config, ...config }
      for (const interceptor of this.interceptors.request) {
        processedConfig = await interceptor(processedConfig)
      }

      // 检查缓存
      const cacheKey = `${processedConfig.method || 'GET'}:${processedConfig.url}`
      if (this.cacheEnabled && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
          this.activeRequests--
          this.completedRequests++
          this.updateStats()
          return { ...cached.data, fromCache: true }
        }
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

      // 模拟请求
      const response = await this.mockFetch(processedConfig)

      // 缓存响应
      if (this.cacheEnabled && (processedConfig.method || 'GET') === 'GET') {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        })
      }

      // 应用响应拦截器
      let processedResponse = response
      for (const interceptor of this.interceptors.response) {
        processedResponse = await interceptor(processedResponse)
      }

      this.activeRequests--
      this.completedRequests++
      this.updateStats()

      return processedResponse
    }
    catch (error) {
      this.activeRequests--
      this.updateStats()

      // 应用错误拦截器
      let processedError = error
      for (const interceptor of this.interceptors.error) {
        processedError = await interceptor(processedError)
      }

      throw processedError
    }
  }

  async mockFetch(config) {
    const { url, method = 'GET', data } = config

    // 模拟不同的响应
    if (url.includes('error')) {
      throw new Error('模拟网络错误')
    }

    if (url.includes('timeout')) {
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    if (url.includes('404')) {
      const error = new Error('Not Found')
      error.status = 404
      throw error
    }

    // 模拟成功响应
    return {
      data: {
        success: true,
        method,
        url,
        data,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
      },
      status: method === 'POST' ? 201 : 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
    }
  }

  async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url })
  }

  async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data })
  }

  async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url })
  }

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor)
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor)
  }

  addErrorInterceptor(interceptor) {
    this.interceptors.error.push(interceptor)
  }

  clearInterceptors() {
    this.interceptors.request = []
    this.interceptors.response = []
    this.interceptors.error = []
  }

  enableCache() {
    this.cacheEnabled = true
  }

  disableCache() {
    this.cacheEnabled = false
  }

  clearCache() {
    this.cache.clear()
  }

  updateStats() {
    document.getElementById('active-requests').textContent = this.activeRequests
    document.getElementById('completed-requests').textContent = this.completedRequests
  }
}

// 创建 HTTP 客户端实例
const http = new MockHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
})

// 工具函数
function formatOutput(data, title = '') {
  const timestamp = new Date().toLocaleTimeString()
  const header = title ? `[${timestamp}] ${title}\n${'='.repeat(50)}\n` : `[${timestamp}]\n`

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
window.addAuthInterceptor = function () {
  http.addRequestInterceptor((config) => {
    config.headers = config.headers || {}
    config.headers.Authorization = 'Bearer fake-token-123'
    return config
  })
  updateOutput('interceptor-output', '✅ 已添加认证拦截器\n请求将自动添加 Authorization 头部')
}

window.addLoggingInterceptor = function () {
  http.addRequestInterceptor((config) => {
    console.log('📤 发送请求:', config)
    return config
  })

  http.addResponseInterceptor((response) => {
    console.log('📥 收到响应:', response)
    return response
  })

  updateOutput('interceptor-output', '✅ 已添加日志拦截器\n请求和响应将在控制台输出日志', true)
}

window.clearInterceptors = function () {
  http.clearInterceptors()
  updateOutput('interceptor-output', '🗑️ 已清除所有拦截器')
}

window.testWithInterceptors = async function () {
  try {
    updateOutput('interceptor-output', '🔄 测试拦截器...', true)
    const response = await http.get('/posts/1')
    updateOutput('interceptor-output', formatOutput(response, '拦截器测试成功'), true)
  }
  catch (error) {
    updateOutput('interceptor-output', formatOutput(error, '拦截器测试失败'), true)
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
      updateOutput('error-output', formatOutput(response, `第 ${attempts} 次尝试成功`), true)
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
    updateOutput('cache-output', `\n第一次请求 (${time1}ms): ${response1.fromCache ? '来自缓存' : '来自网络'}`, true)

    // 第二次请求
    const start2 = Date.now()
    const response2 = await http.get('/posts/1')
    const time2 = Date.now() - start2
    updateOutput('cache-output', `第二次请求 (${time2}ms): ${response2.fromCache ? '来自缓存' : '来自网络'}`, true)
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
      http.get(`/posts/${i}`).then(response => ({
        id: i,
        success: true,
        data: response.data,
      })).catch(error => ({
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

  updateOutput('concurrency-output', `📋 队列中有 ${requests.length} 个请求`, true)

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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateOutput('basic-output', '👋 欢迎使用 @ldesign/http!\n点击上方按钮开始体验各种功能...')
  updateOutput('interceptor-output', '拦截器状态：无')
  updateOutput('error-output', '点击上方按钮测试错误处理...')
  updateOutput('cache-output', '缓存状态：禁用')
  updateOutput('concurrency-output', '点击上方按钮测试并发控制...')
  updateOutput('custom-output', '配置左侧参数并发送请求...')
})
