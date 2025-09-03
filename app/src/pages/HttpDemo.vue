<template>
  <div class="http-demo">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1>HTTP 客户端演示</h1>
      <p>展示 @ldesign/http 包的各种功能特性</p>
    </div>

    <!-- 统计信息面板 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">总请求数</span>
        <span class="stat-value">{{ stats.totalRequests }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">成功请求</span>
        <span class="stat-value success">{{ stats.successRequests }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">失败请求</span>
        <span class="stat-value error">{{ stats.errorRequests }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">缓存命中</span>
        <span class="stat-value cache">{{ stats.cacheHits }}</span>
      </div>
    </div>

    <!-- 功能演示区域 -->
    <div class="demo-sections">
      <!-- GET 请求演示 -->
      <section class="demo-section">
        <h2>GET 请求演示</h2>
        <div class="demo-controls">
          <button @click="fetchPosts" :disabled="loading.posts" class="btn btn-primary">
            {{ loading.posts ? '加载中...' : '获取文章列表' }}
          </button>
          <button @click="fetchPost" :disabled="loading.post" class="btn btn-secondary">
            {{ loading.post ? '加载中...' : '获取单篇文章' }}
          </button>
          <button @click="fetchUsers" :disabled="loading.users" class="btn btn-info">
            {{ loading.users ? '加载中...' : '获取用户列表' }}
          </button>
        </div>
        <div class="demo-result" v-if="results.posts">
          <h3>文章列表 (前5条)</h3>
          <div class="result-content">
            <div v-for="post in results.posts.slice(0, 5)" :key="post.id" class="post-item">
              <h4>{{ post.title }}</h4>
              <p>{{ post.body }}</p>
            </div>
          </div>
        </div>
        <div class="demo-result" v-if="results.post">
          <h3>单篇文章详情</h3>
          <div class="result-content">
            <h4>{{ results.post.title }}</h4>
            <p>{{ results.post.body }}</p>
          </div>
        </div>
      </section>

      <!-- POST 请求演示 -->
      <section class="demo-section">
        <h2>POST 请求演示</h2>
        <div class="demo-form">
          <div class="form-group">
            <label>文章标题</label>
            <input v-model="newPost.title" type="text" placeholder="请输入文章标题" class="form-input">
          </div>
          <div class="form-group">
            <label>文章内容</label>
            <textarea v-model="newPost.body" placeholder="请输入文章内容" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>用户ID</label>
            <input v-model.number="newPost.userId" type="number" placeholder="请输入用户ID" class="form-input">
          </div>
          <button @click="createPost" :disabled="loading.create" class="btn btn-success">
            {{ loading.create ? '创建中...' : '创建文章' }}
          </button>
        </div>
        <div class="demo-result" v-if="results.created">
          <h3>创建成功</h3>
          <div class="result-content">
            <p><strong>ID:</strong> {{ results.created.id }}</p>
            <p><strong>标题:</strong> {{ results.created.title }}</p>
            <p><strong>内容:</strong> {{ results.created.body }}</p>
          </div>
        </div>
      </section>

      <!-- PUT/PATCH 请求演示 -->
      <section class="demo-section">
        <h2>PUT/PATCH 请求演示</h2>
        <div class="demo-form">
          <div class="form-group">
            <label>文章ID</label>
            <input v-model.number="updatePost.id" type="number" placeholder="请输入要更新的文章ID" class="form-input">
          </div>
          <div class="form-group">
            <label>新标题</label>
            <input v-model="updatePost.title" type="text" placeholder="请输入新标题" class="form-input">
          </div>
          <div class="form-group">
            <label>新内容</label>
            <textarea v-model="updatePost.body" placeholder="请输入新内容" class="form-textarea"></textarea>
          </div>
          <div class="demo-controls">
            <button @click="updatePostFull" :disabled="loading.update" class="btn btn-warning">
              {{ loading.update ? '更新中...' : 'PUT 完整更新' }}
            </button>
            <button @click="updatePostPartial" :disabled="loading.patch" class="btn btn-warning">
              {{ loading.patch ? '更新中...' : 'PATCH 部分更新' }}
            </button>
          </div>
        </div>
        <div class="demo-result" v-if="results.updated">
          <h3>更新成功</h3>
          <div class="result-content">
            <p><strong>ID:</strong> {{ results.updated.id }}</p>
            <p><strong>标题:</strong> {{ results.updated.title }}</p>
            <p><strong>内容:</strong> {{ results.updated.body }}</p>
          </div>
        </div>
      </section>

      <!-- DELETE 请求演示 -->
      <section class="demo-section">
        <h2>DELETE 请求演示</h2>
        <div class="demo-form">
          <div class="form-group">
            <label>文章ID</label>
            <input v-model.number="deleteId" type="number" placeholder="请输入要删除的文章ID" class="form-input">
          </div>
          <button @click="deletePost" :disabled="loading.delete" class="btn btn-danger">
            {{ loading.delete ? '删除中...' : '删除文章' }}
          </button>
        </div>
        <div class="demo-result" v-if="results.deleted">
          <h3>删除成功</h3>
          <div class="result-content">
            <p>文章 ID {{ deleteId }} 已成功删除</p>
          </div>
        </div>
      </section>

      <!-- 错误处理演示 -->
      <section class="demo-section">
        <h2>错误处理演示</h2>
        <div class="demo-controls">
          <button @click="triggerError" :disabled="loading.error" class="btn btn-danger">
            {{ loading.error ? '请求中...' : '触发 404 错误' }}
          </button>
          <button @click="triggerTimeout" :disabled="loading.timeout" class="btn btn-danger">
            {{ loading.timeout ? '请求中...' : '触发超时错误' }}
          </button>
        </div>
        <div class="demo-result error" v-if="results.error">
          <h3>错误信息</h3>
          <div class="result-content">
            <p><strong>错误类型:</strong> {{ results.error.type }}</p>
            <p><strong>错误消息:</strong> {{ results.error.message }}</p>
            <p><strong>状态码:</strong> {{ results.error.status }}</p>
          </div>
        </div>
      </section>

      <!-- 缓存演示 -->
      <section class="demo-section">
        <h2>缓存功能演示</h2>
        <div class="demo-controls">
          <button @click="fetchWithCache" :disabled="loading.cache" class="btn btn-info">
            {{ loading.cache ? '请求中...' : '带缓存的请求' }}
          </button>
          <button @click="clearCache" class="btn btn-secondary">
            清除缓存
          </button>
        </div>
        <div class="demo-result" v-if="results.cache">
          <h3>缓存结果</h3>
          <div class="result-content">
            <p><strong>是否来自缓存:</strong> {{ results.cache.fromCache ? '是' : '否' }}</p>
            <p><strong>响应时间:</strong> {{ results.cache.responseTime }}ms</p>
            <p><strong>数据:</strong> {{ results.cache.data?.title }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 请求日志 -->
    <section class="demo-section">
      <h2>请求日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in requestLogs" :key="index" :class="['log-item', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-method">{{ log.method }}</span>
          <span class="log-url">{{ log.url }}</span>
          <span class="log-status">{{ log.status }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'

// HTTP 客户端实例 - 使用全局注入的客户端
const instance = getCurrentInstance()
const $http = instance?.appContext.config.globalProperties.$http

// 创建请求方法
const get = async (url: string, config?: any) => {
  return await $http.get(url, config)
}

const post = async (url: string, data?: any, config?: any) => {
  return await $http.post(url, data, config)
}

const put = async (url: string, data?: any, config?: any) => {
  return await $http.put(url, data, config)
}

const patch = async (url: string, data?: any, config?: any) => {
  return await $http.patch(url, data, config)
}

const del = async (url: string, config?: any) => {
  return await $http.delete(url, config)
}

// 响应式数据
const loading = reactive({
  posts: false,
  post: false,
  users: false,
  create: false,
  update: false,
  patch: false,
  delete: false,
  error: false,
  timeout: false,
  cache: false
})

const results = reactive({
  posts: null as any,
  post: null as any,
  users: null as any,
  created: null as any,
  updated: null as any,
  deleted: false,
  error: null as any,
  cache: null as any
})

const stats = reactive({
  totalRequests: 0,
  successRequests: 0,
  errorRequests: 0,
  cacheHits: 0
})

const newPost = reactive({
  title: '',
  body: '',
  userId: 1
})

const updatePost = reactive({
  id: 1,
  title: '',
  body: ''
})

const deleteId = ref(1)
const requestLogs = ref<any[]>([])

// 添加请求日志
const addLog = (method: string, url: string, status: number | string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  requestLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    method,
    url,
    status,
    message,
    type
  })
  
  // 限制日志数量
  if (requestLogs.value.length > 20) {
    requestLogs.value = requestLogs.value.slice(0, 20)
  }
}

// 更新统计信息
const updateStats = (success: boolean, fromCache = false) => {
  stats.totalRequests++
  if (success) {
    stats.successRequests++
  } else {
    stats.errorRequests++
  }
  if (fromCache) {
    stats.cacheHits++
  }
}

// GET 请求演示
const fetchPosts = async () => {
  loading.posts = true
  try {
    const response = await get('/posts')
    results.posts = response.data
    addLog('GET', '/posts', 200, `获取到 ${response.data.length} 篇文章`, 'success')
    updateStats(true)
  } catch (error: any) {
    addLog('GET', '/posts', error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.posts = false
  }
}

const fetchPost = async () => {
  loading.post = true
  try {
    const response = await get('/posts/1')
    results.post = response.data
    addLog('GET', '/posts/1', 200, '获取文章详情成功', 'success')
    updateStats(true)
  } catch (error: any) {
    addLog('GET', '/posts/1', error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.post = false
  }
}

const fetchUsers = async () => {
  loading.users = true
  try {
    const response = await get('/users')
    results.users = response.data
    addLog('GET', '/users', 200, `获取到 ${response.data.length} 个用户`, 'success')
    updateStats(true)
  } catch (error: any) {
    addLog('GET', '/users', error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.users = false
  }
}

// POST 请求演示
const createPost = async () => {
  if (!newPost.title || !newPost.body) {
    addLog('POST', '/posts', 'ERROR', '请填写完整信息', 'error')
    return
  }
  
  loading.create = true
  try {
    const response = await post('/posts', newPost)
    results.created = response.data
    addLog('POST', '/posts', 201, '创建文章成功', 'success')
    updateStats(true)
    
    // 重置表单
    newPost.title = ''
    newPost.body = ''
    newPost.userId = 1
  } catch (error: any) {
    addLog('POST', '/posts', error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.create = false
  }
}

// PUT 请求演示
const updatePostFull = async () => {
  if (!updatePost.id || !updatePost.title || !updatePost.body) {
    addLog('PUT', `/posts/${updatePost.id}`, 'ERROR', '请填写完整信息', 'error')
    return
  }
  
  loading.update = true
  try {
    const response = await put(`/posts/${updatePost.id}`, {
      id: updatePost.id,
      title: updatePost.title,
      body: updatePost.body,
      userId: 1
    })
    results.updated = response.data
    addLog('PUT', `/posts/${updatePost.id}`, 200, 'PUT 更新成功', 'success')
    updateStats(true)
  } catch (error: any) {
    addLog('PUT', `/posts/${updatePost.id}`, error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.update = false
  }
}

// PATCH 请求演示
const updatePostPartial = async () => {
  if (!updatePost.id) {
    addLog('PATCH', `/posts/${updatePost.id}`, 'ERROR', '请输入文章ID', 'error')
    return
  }
  
  loading.patch = true
  try {
    const patchData: any = { id: updatePost.id }
    if (updatePost.title) patchData.title = updatePost.title
    if (updatePost.body) patchData.body = updatePost.body
    
    const response = await patch(`/posts/${updatePost.id}`, patchData)
    results.updated = response.data
    addLog('PATCH', `/posts/${updatePost.id}`, 200, 'PATCH 更新成功', 'success')
    updateStats(true)
  } catch (error: any) {
    addLog('PATCH', `/posts/${updatePost.id}`, error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.patch = false
  }
}

// DELETE 请求演示
const deletePost = async () => {
  if (!deleteId.value) {
    addLog('DELETE', `/posts/${deleteId.value}`, 'ERROR', '请输入文章ID', 'error')
    return
  }
  
  loading.delete = true
  try {
    await del(`/posts/${deleteId.value}`)
    results.deleted = true
    addLog('DELETE', `/posts/${deleteId.value}`, 200, '删除成功', 'success')
    updateStats(true)
    
    // 3秒后清除删除结果
    setTimeout(() => {
      results.deleted = false
    }, 3000)
  } catch (error: any) {
    addLog('DELETE', `/posts/${deleteId.value}`, error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.delete = false
  }
}

// 错误处理演示
const triggerError = async () => {
  loading.error = true
  try {
    await get('/posts/999999') // 不存在的资源
  } catch (error: any) {
    results.error = {
      type: '404 Not Found',
      message: error.message,
      status: error.status || 404
    }
    addLog('GET', '/posts/999999', 404, '资源不存在', 'error')
    updateStats(false)
  } finally {
    loading.error = false
  }
}

const triggerTimeout = async () => {
  loading.timeout = true
  try {
    // 模拟超时请求（实际上这个API不会超时，这里只是演示）
    await get('/posts', { timeout: 1 }) // 1ms 超时
  } catch (error: any) {
    results.error = {
      type: 'Timeout Error',
      message: error.message,
      status: 'TIMEOUT'
    }
    addLog('GET', '/posts', 'TIMEOUT', '请求超时', 'error')
    updateStats(false)
  } finally {
    loading.timeout = false
  }
}

// 缓存演示
const fetchWithCache = async () => {
  loading.cache = true
  const startTime = Date.now()
  
  try {
    const response = await get('/posts/1', { 
      cache: { enabled: true, ttl: 60000 } // 1分钟缓存
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    results.cache = {
      fromCache: response.fromCache || false,
      responseTime,
      data: response.data
    }
    
    addLog('GET', '/posts/1', 200, `缓存请求完成 (${responseTime}ms)`, 'info')
    updateStats(true, response.fromCache)
  } catch (error: any) {
    addLog('GET', '/posts/1', error.status || 'ERROR', error.message, 'error')
    updateStats(false)
  } finally {
    loading.cache = false
  }
}

const clearCache = () => {
  // 这里应该调用 HTTP 客户端的清除缓存方法
  // 由于演示目的，我们只是显示一个日志
  addLog('CACHE', 'clear', 200, '缓存已清除', 'info')
}

// 组件挂载时的初始化
onMounted(() => {
  addLog('INIT', 'HttpDemo', 200, 'HTTP 演示页面已加载', 'info')
})
</script>

<style lang="less" scoped>
.http-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--ldesign-bg-color-page);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: var(--ldesign-text-color-primary);
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 16px;
  }
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  .stat-item {
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: var(--ldesign-shadow-1);

    .stat-label {
      display: block;
      color: var(--ldesign-text-color-secondary);
      font-size: 14px;
      margin-bottom: 8px;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);

      &.success {
        color: var(--ldesign-success-color);
      }

      &.error {
        color: var(--ldesign-error-color);
      }

      &.cache {
        color: var(--ldesign-brand-color);
      }
    }
  }
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demo-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--ldesign-shadow-1);

  h2 {
    color: var(--ldesign-text-color-primary);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--ldesign-border-color);
  }
}

.demo-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
    }
  }

  &.btn-secondary {
    background: var(--ldesign-gray-color-5);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-gray-color-6);
    }
  }

  &.btn-success {
    background: var(--ldesign-success-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-success-color-hover);
    }
  }

  &.btn-warning {
    background: var(--ldesign-warning-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-warning-color-hover);
    }
  }

  &.btn-danger {
    background: var(--ldesign-error-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-error-color-hover);
    }
  }

  &.btn-info {
    background: var(--ldesign-brand-color-5);
    color: white;

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-6);
    }
  }
}

.demo-form {
  margin-bottom: 20px;

  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      color: var(--ldesign-text-color-primary);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--ldesign-border-color);
      border-radius: 6px;
      font-size: 14px;
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-primary);
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder);
      }
    }

    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }
  }
}

.demo-result {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;

  &.error {
    border-color: var(--ldesign-error-color);
    background: var(--ldesign-error-color-1);
  }

  h3 {
    color: var(--ldesign-text-color-primary);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .result-content {
    color: var(--ldesign-text-color-secondary);
    font-size: 14px;
    line-height: 1.5;

    .post-item {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-color);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;

      h4 {
        color: var(--ldesign-text-color-primary);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      p {
        color: var(--ldesign-text-color-secondary);
        font-size: 13px;
        line-height: 1.4;
        margin: 0;
      }
    }

    p {
      margin: 4px 0;

      strong {
        color: var(--ldesign-text-color-primary);
      }
    }
  }
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 12px;

  .log-item {
    display: grid;
    grid-template-columns: 80px 60px 1fr 80px 1fr;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--ldesign-border-color);
    font-size: 12px;
    font-family: 'Courier New', monospace;

    &:last-child {
      border-bottom: none;
    }

    &.success {
      color: var(--ldesign-success-color);
    }

    &.error {
      color: var(--ldesign-error-color);
    }

    &.info {
      color: var(--ldesign-text-color-secondary);
    }

    .log-time {
      color: var(--ldesign-text-color-placeholder);
    }

    .log-method {
      font-weight: 600;
    }

    .log-url {
      color: var(--ldesign-brand-color);
    }

    .log-status {
      font-weight: 600;
    }

    .log-message {
      color: var(--ldesign-text-color-primary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .http-demo {
    padding: 16px;
  }

  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }

  .demo-controls {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .log-item {
    grid-template-columns: 1fr;
    gap: 4px;

    .log-time,
    .log-method,
    .log-url,
    .log-status,
    .log-message {
      display: block;
    }
  }
}
</style>
