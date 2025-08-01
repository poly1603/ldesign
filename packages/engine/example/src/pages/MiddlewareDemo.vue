<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const newMiddleware = ref({
  name: '',
  priority: 0,
  type: 'request' as 'request' | 'response' | 'error' | 'auth' | 'logging',
})

const testData = ref(JSON.stringify({ message: 'Hello World', userId: 123 }, null, 2))
const autoScroll = ref(true)
const logContainer = ref<HTMLElement>()

interface MiddlewareItem {
  name: string
  priority: number
  type: string
  enabled: boolean
  handler: Function
}

const middlewareList = ref<MiddlewareItem[]>([])

interface ExecutionLog {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'success'
  middleware: string
  message: string
  data?: any
}

const executionLogs = ref<ExecutionLog[]>([])

const middlewareStats = ref({
  totalExecutions: 0,
  avgExecutionTime: 0,
  errorCount: 0,
  successRate: 100,
})

const globalConfig = ref({
  enableLogging: true,
  enableTiming: true,
  stopOnError: false,
  maxExecutionTime: 5000,
})

// 计算属性
const sortedMiddlewares = computed(() => {
  return [...middlewareList.value].sort((a, b) => b.priority - a.priority)
})

// 方法
function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    request: '请求中间件',
    response: '响应中间件',
    error: '错误处理',
    auth: '认证中间件',
    logging: '日志中间件',
  }
  return labels[type] || type
}

function addLog(level: 'info' | 'warn' | 'error' | 'success', middleware: string, message: string, data?: any) {
  executionLogs.value.push({
    timestamp: Date.now(),
    level,
    middleware,
    message,
    data,
  })

  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
}

function createMiddlewareHandler(name: string, type: string) {
  return async (context: any, next: Function) => {
    const startTime = performance.now()

    try {
      if (globalConfig.value.enableLogging) {
        addLog('info', name, `开始执行 ${getTypeLabel(type)}`, context)
      }

      // 模拟中间件逻辑
      switch (type) {
        case 'auth':
          if (!context.user) {
            context.user = { id: 1, name: 'Test User' }
            addLog('success', name, '用户认证成功', context.user)
          }
          break

        case 'logging':
          addLog('info', name, '记录请求日志', {
            method: context.method || 'GET',
            url: context.url || '/api/test',
            timestamp: Date.now(),
          })
          break

        case 'request':
          context.processedAt = Date.now()
          addLog('info', name, '请求预处理完成')
          break

        case 'response':
          context.responseTime = Date.now() - (context.processedAt || Date.now())
          addLog('success', name, '响应后处理完成', {
            responseTime: context.responseTime,
          })
          break

        case 'error':
          if (context.error) {
            addLog('error', name, '处理错误', context.error)
            context.handled = true
          }
          break
      }

      // 调用下一个中间件
      await next()

      const endTime = performance.now()
      const executionTime = endTime - startTime

      if (globalConfig.value.enableTiming) {
        addLog('success', name, `执行完成，耗时: ${executionTime.toFixed(2)}ms`)
      }

      // 更新统计
      middlewareStats.value.totalExecutions++
      const totalTime = middlewareStats.value.avgExecutionTime * (middlewareStats.value.totalExecutions - 1) + executionTime
      middlewareStats.value.avgExecutionTime = totalTime / middlewareStats.value.totalExecutions
    }
    catch (error) {
      const endTime = performance.now()
      const executionTime = endTime - startTime

      addLog('error', name, `执行失败: ${error}`, { error, executionTime })
      middlewareStats.value.errorCount++

      if (globalConfig.value.stopOnError) {
        throw error
      }
    }

    // 更新成功率
    middlewareStats.value.successRate = Math.round(
      ((middlewareStats.value.totalExecutions - middlewareStats.value.errorCount)
        / middlewareStats.value.totalExecutions) * 100,
    )
  }
}

function registerMiddleware() {
  if (!newMiddleware.value.name.trim()) {
    engine.notifications.show({
      type: 'error',
      title: '注册失败',
      message: '请输入中间件名称',
    })
    return
  }

  const handler = createMiddlewareHandler(newMiddleware.value.name, newMiddleware.value.type)

  try {
    engine.middleware.use(newMiddleware.value.name, handler, {
      priority: newMiddleware.value.priority,
    })

    middlewareList.value.push({
      name: newMiddleware.value.name,
      priority: newMiddleware.value.priority,
      type: newMiddleware.value.type,
      enabled: true,
      handler,
    })

    addLog('success', 'System', `中间件 "${newMiddleware.value.name}" 注册成功`)

    engine.notifications.show({
      type: 'success',
      title: '注册成功',
      message: `中间件 "${newMiddleware.value.name}" 已注册`,
    })

    // 重置表单
    newMiddleware.value = {
      name: '',
      priority: 0,
      type: 'request',
    }
  }
  catch (error) {
    addLog('error', 'System', `中间件注册失败: ${error}`)
    engine.notifications.show({
      type: 'error',
      title: '注册失败',
      message: `${error}`,
    })
  }
}

function registerPresetMiddlewares() {
  const presets = [
    { name: 'auth-middleware', type: 'auth', priority: 100 },
    { name: 'logging-middleware', type: 'logging', priority: 90 },
    { name: 'request-validator', type: 'request', priority: 80 },
    { name: 'response-formatter', type: 'response', priority: 70 },
    { name: 'error-handler', type: 'error', priority: 60 },
  ]

  presets.forEach((preset) => {
    const handler = createMiddlewareHandler(preset.name, preset.type)

    try {
      engine.middleware.use(preset.name, handler, {
        priority: preset.priority,
      })

      middlewareList.value.push({
        name: preset.name,
        priority: preset.priority,
        type: preset.type,
        enabled: true,
        handler,
      })
    }
    catch (error) {
      console.warn(`预设中间件 ${preset.name} 注册失败:`, error)
    }
  })

  addLog('success', 'System', `已注册 ${presets.length} 个预设中间件`)

  engine.notifications.show({
    type: 'success',
    title: '批量注册成功',
    message: `已注册 ${presets.length} 个预设中间件`,
  })
}

function toggleMiddleware(name: string) {
  const middleware = middlewareList.value.find(m => m.name === name)
  if (middleware) {
    middleware.enabled = !middleware.enabled

    if (middleware.enabled) {
      engine.middleware.use(name, middleware.handler)
      addLog('info', 'System', `中间件 "${name}" 已启用`)
    }
    else {
      engine.middleware.remove(name)
      addLog('warn', 'System', `中间件 "${name}" 已禁用`)
    }
  }
}

function removeMiddleware(name: string) {
  try {
    engine.middleware.remove(name)
    middlewareList.value = middlewareList.value.filter(m => m.name !== name)

    addLog('warn', 'System', `中间件 "${name}" 已删除`)

    engine.notifications.show({
      type: 'warning',
      title: '删除成功',
      message: `中间件 "${name}" 已删除`,
    })
  }
  catch (error) {
    addLog('error', 'System', `删除中间件失败: ${error}`)
  }
}

async function testMiddleware(type: 'request' | 'response') {
  try {
    const data = JSON.parse(testData.value)
    const context = {
      type,
      data,
      method: 'POST',
      url: '/api/test',
      timestamp: Date.now(),
    }

    addLog('info', 'Test', `开始测试 ${type} 中间件`, context)

    // 模拟中间件执行
    const enabledMiddlewares = middlewareList.value
      .filter(m => m.enabled && (m.type === type || m.type === 'logging'))
      .sort((a, b) => b.priority - a.priority)

    for (const middleware of enabledMiddlewares) {
      await middleware.handler(context, () => Promise.resolve())
    }

    addLog('success', 'Test', `${type} 中间件测试完成`, context)
  }
  catch (error) {
    addLog('error', 'Test', `测试失败: ${error}`)
    engine.notifications.show({
      type: 'error',
      title: '测试失败',
      message: `${error}`,
    })
  }
}

async function testErrorMiddleware() {
  try {
    const context = {
      type: 'error',
      error: new Error('模拟错误'),
      timestamp: Date.now(),
    }

    addLog('error', 'Test', '模拟错误情况', context)

    const errorMiddlewares = middlewareList.value
      .filter(m => m.enabled && m.type === 'error')
      .sort((a, b) => b.priority - a.priority)

    for (const middleware of errorMiddlewares) {
      await middleware.handler(context, () => Promise.resolve())
    }

    if (context.handled) {
      addLog('success', 'Test', '错误已被处理', context)
    }
    else {
      addLog('warn', 'Test', '错误未被处理', context)
    }
  }
  catch (error) {
    addLog('error', 'Test', `错误测试失败: ${error}`)
  }
}

function clearLogs() {
  executionLogs.value = []
  addLog('info', 'System', '日志已清空')
}

function exportLogs() {
  const data = {
    logs: executionLogs.value,
    stats: middlewareStats.value,
    middlewares: middlewareList.value,
    timestamp: Date.now(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `middleware-logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '日志已导出到文件',
  })
}

function applyGlobalConfig() {
  addLog('info', 'System', '全局配置已更新', globalConfig.value)

  engine.notifications.show({
    type: 'success',
    title: '配置更新',
    message: '全局配置已应用',
  })
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 监听自动滚动
watch(executionLogs, () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
}, { deep: true })

onMounted(() => {
  addLog('info', 'System', '中间件演示页面已加载')
  engine.logger.info('中间件演示页面已初始化')
})
</script>

<template>
  <div class="middleware-demo">
    <div class="demo-header">
      <h1>🔧 中间件系统演示</h1>
      <p>展示中间件的注册、执行顺序和错误处理机制</p>
    </div>

    <div class="demo-grid">
      <!-- 中间件注册 -->
      <div class="demo-card">
        <h3>📝 中间件注册</h3>
        <div class="form-group">
          <label>中间件名称:</label>
          <input
            v-model="newMiddleware.name"
            type="text"
            placeholder="例如: auth-middleware"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>优先级:</label>
          <input
            v-model.number="newMiddleware.priority"
            type="number"
            placeholder="数字越大优先级越高"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>中间件类型:</label>
          <select v-model="newMiddleware.type" class="form-select">
            <option value="request">
              请求中间件
            </option>
            <option value="response">
              响应中间件
            </option>
            <option value="error">
              错误处理中间件
            </option>
            <option value="auth">
              认证中间件
            </option>
            <option value="logging">
              日志中间件
            </option>
          </select>
        </div>
        <div class="button-group">
          <button class="btn btn-primary" @click="registerMiddleware">
            注册中间件
          </button>
          <button class="btn btn-secondary" @click="registerPresetMiddlewares">
            注册预设中间件
          </button>
        </div>
      </div>

      <!-- 中间件列表 -->
      <div class="demo-card">
        <h3>📋 已注册中间件</h3>
        <div class="middleware-list">
          <div
            v-for="middleware in middlewareList"
            :key="middleware.name"
            class="middleware-item"
            :class="{ active: middleware.enabled }"
          >
            <div class="middleware-info">
              <div class="middleware-header">
                <span class="middleware-name">{{ middleware.name }}</span>
                <span class="middleware-priority">优先级: {{ middleware.priority }}</span>
              </div>
              <div class="middleware-meta">
                <span class="middleware-type">{{ getTypeLabel(middleware.type) }}</span>
                <span class="middleware-status" :class="middleware.enabled ? 'enabled' : 'disabled'">
                  {{ middleware.enabled ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
            <div class="middleware-actions">
              <button
                class="btn btn-sm"
                :class="middleware.enabled ? 'btn-warning' : 'btn-success'"
                @click="toggleMiddleware(middleware.name)"
              >
                {{ middleware.enabled ? '禁用' : '启用' }}
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="removeMiddleware(middleware.name)"
              >
                删除
              </button>
            </div>
          </div>
          <div v-if="middlewareList.length === 0" class="empty-state">
            暂无中间件，请先注册一些中间件
          </div>
        </div>
      </div>

      <!-- 中间件测试 -->
      <div class="demo-card">
        <h3>🧪 中间件测试</h3>
        <div class="test-section">
          <div class="form-group">
            <label>测试数据:</label>
            <textarea
              v-model="testData"
              class="form-textarea"
              placeholder="输入测试数据 (JSON格式)"
              rows="4"
            />
          </div>
          <div class="button-group">
            <button class="btn btn-primary" @click="testMiddleware('request')">
              测试请求中间件
            </button>
            <button class="btn btn-success" @click="testMiddleware('response')">
              测试响应中间件
            </button>
            <button class="btn btn-danger" @click="testErrorMiddleware">
              测试错误处理
            </button>
          </div>
        </div>
      </div>

      <!-- 执行日志 -->
      <div class="demo-card full-width">
        <h3>📊 执行日志</h3>
        <div class="log-controls">
          <button class="btn btn-secondary" @click="clearLogs">
            清空日志
          </button>
          <button class="btn btn-info" @click="exportLogs">
            导出日志
          </button>
          <label class="checkbox-label">
            <input v-model="autoScroll" type="checkbox">
            自动滚动
          </label>
        </div>
        <div
          ref="logContainer"
          class="log-container"
          :class="{ 'auto-scroll': autoScroll }"
        >
          <div
            v-for="(log, index) in executionLogs"
            :key="index"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-middleware">{{ log.middleware }}</span>
            <span class="log-message">{{ log.message }}</span>
            <div v-if="log.data" class="log-data">
              <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>
          <div v-if="executionLogs.length === 0" class="empty-logs">
            暂无执行日志
          </div>
        </div>
      </div>

      <!-- 性能统计 -->
      <div class="demo-card">
        <h3>📈 性能统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">
              {{ middlewareStats.totalExecutions }}
            </div>
            <div class="stat-label">
              总执行次数
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ middlewareStats.avgExecutionTime }}ms
            </div>
            <div class="stat-label">
              平均执行时间
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ middlewareStats.errorCount }}
            </div>
            <div class="stat-label">
              错误次数
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ middlewareStats.successRate }}%
            </div>
            <div class="stat-label">
              成功率
            </div>
          </div>
        </div>
      </div>

      <!-- 中间件配置 -->
      <div class="demo-card">
        <h3>⚙️ 全局配置</h3>
        <div class="config-section">
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="globalConfig.enableLogging" type="checkbox">
              启用详细日志
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="globalConfig.enableTiming" type="checkbox">
              启用性能计时
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="globalConfig.stopOnError" type="checkbox">
              遇到错误时停止执行
            </label>
          </div>
          <div class="form-group">
            <label>最大执行时间 (ms):</label>
            <input
              v-model.number="globalConfig.maxExecutionTime"
              type="number"
              class="form-input"
            >
          </div>
          <button class="btn btn-primary" @click="applyGlobalConfig">
            应用配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.middleware-demo {
  padding: 2rem;
  max-width: 1400px;
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
  font-size: 1.2rem;
  color: #7f8c8d;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.demo-card.full-width {
  grid-column: 1 / -1;
}

.demo-card h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.middleware-list {
  max-height: 400px;
  overflow-y: auto;
}

.middleware-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.middleware-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.middleware-item.active {
  border-color: #27ae60;
  background: #f8fff9;
}

.middleware-info {
  flex: 1;
}

.middleware-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.middleware-name {
  font-weight: 600;
  color: #2c3e50;
}

.middleware-priority {
  font-size: 0.75rem;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.middleware-meta {
  display: flex;
  gap: 1rem;
}

.middleware-type {
  font-size: 0.75rem;
  color: #495057;
}

.middleware-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.middleware-status.enabled {
  background: #d4edda;
  color: #155724;
}

.middleware-status.disabled {
  background: #f8d7da;
  color: #721c24;
}

.middleware-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state,
.empty-logs {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
  font-style: italic;
}

.log-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.log-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.log-entry.log-info {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.log-entry.log-success {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
}

.log-entry.log-warn {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.log-entry.log-error {
  background: #ffebee;
  border-left: 4px solid #f44336;
}

.log-time {
  color: #7f8c8d;
  font-size: 0.75rem;
  min-width: 80px;
}

.log-level {
  font-weight: 600;
  min-width: 60px;
}

.log-middleware {
  color: #3498db;
  font-weight: 500;
  min-width: 120px;
}

.log-message {
  flex: 1;
}

.log-data {
  width: 100%;
  margin-top: 0.5rem;
}

.log-data pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .middleware-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .middleware-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .log-entry {
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-time,
  .log-level,
  .log-middleware {
    min-width: auto;
  }
}
</style>
