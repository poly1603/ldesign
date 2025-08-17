<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const middlewareName = ref('auth-middleware')
const middlewareType = ref('auth')
const requestPath = ref('/api/users')
const requestMethod = ref('GET')
const requestData = ref('{"userId": 123}')
const requestResult = ref<any>(null)
const middlewareChain = reactive<any[]>([])
const executionLogs = reactive<any[]>([])

// 中间件模板
const middlewareTemplates = {
  auth: {
    name: '认证中间件',
    handler: async (context: any, next: any) => {
      const startTime = Date.now()
      addExecutionLog('auth', 'before', '开始认证检查')

      // 模拟认证逻辑
      if (!context.headers?.authorization) {
        addExecutionLog('auth', 'error', '缺少认证头')
        throw new Error('未授权访问')
      }

      addExecutionLog('auth', 'success', '认证通过')
      await next()

      const duration = Date.now() - startTime
      addExecutionLog('auth', 'after', '认证中间件执行完成', duration)
    },
  },
  logger: {
    name: '日志中间件',
    handler: async (context: any, next: any) => {
      const startTime = Date.now()
      addExecutionLog('logger', 'before', `请求开始: ${context.method} ${context.path}`)

      await next()

      const duration = Date.now() - startTime
      addExecutionLog('logger', 'after', `请求完成: ${context.method} ${context.path}`, duration)
    },
  },
  cache: {
    name: '缓存中间件',
    handler: async (context: any, next: any) => {
      const cacheKey = `${context.method}:${context.path}`
      addExecutionLog('cache', 'before', `检查缓存: ${cacheKey}`)

      // 模拟缓存检查
      const cached = Math.random() > 0.7 // 30% 命中率
      if (cached) {
        addExecutionLog('cache', 'hit', '缓存命中')
        context.response = { cached: true, data: 'cached data' }
        return
      }

      addExecutionLog('cache', 'miss', '缓存未命中')
      await next()

      addExecutionLog('cache', 'after', '缓存已更新')
    },
  },
  validator: {
    name: '验证中间件',
    handler: async (context: any, next: any) => {
      addExecutionLog('validator', 'before', '开始数据验证')

      // 模拟数据验证
      if (context.data && typeof context.data !== 'object') {
        addExecutionLog('validator', 'error', '数据格式无效')
        throw new Error('数据验证失败')
      }

      addExecutionLog('validator', 'success', '数据验证通过')
      await next()

      addExecutionLog('validator', 'after', '验证中间件执行完成')
    },
  },
  custom: {
    name: '自定义中间件',
    handler: async (context: any, next: any) => {
      addExecutionLog('custom', 'before', '自定义中间件开始执行')

      // 自定义逻辑
      context.customData = { processed: true, timestamp: Date.now() }

      await next()

      addExecutionLog('custom', 'after', '自定义中间件执行完成')
    },
  },
}

// 方法
function addMiddleware() {
  try {
    const template = middlewareTemplates[middlewareType.value as keyof typeof middlewareTemplates]
    if (!template) {
      throw new Error('未知的中间件类型')
    }

    const middleware = {
      name: middlewareName.value,
      type: middlewareType.value,
      handler: template.handler,
      active: true,
    }

    props.engine.middleware.use(middleware.handler)
    middlewareChain.push(middleware)

    emit('log', 'success', `添加中间件: ${middlewareName.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '添加中间件失败', error)
  }
}

function removeMiddleware() {
  try {
    const index = middlewareChain.findIndex(m => m.name === middlewareName.value)
    if (index !== -1) {
      middlewareChain.splice(index, 1)
      emit('log', 'warning', `移除中间件: ${middlewareName.value}`)
    }
    else {
      emit('log', 'warning', '未找到指定中间件')
    }
  }
  catch (error: any) {
    emit('log', 'error', '移除中间件失败', error)
  }
}

function clearMiddlewares() {
  try {
    middlewareChain.splice(0, middlewareChain.length)
    // 重新初始化中间件管理器
    props.engine.middleware.clear()
    emit('log', 'warning', '清空所有中间件')
  }
  catch (error: any) {
    emit('log', 'error', '清空中间件失败', error)
  }
}

async function executeRequest() {
  try {
    requestResult.value = null

    let data = null
    if (requestData.value.trim()) {
      try {
        data = JSON.parse(requestData.value)
      }
      catch {
        data = requestData.value
      }
    }

    const context = {
      method: requestMethod.value,
      path: requestPath.value,
      headers: { authorization: 'Bearer token123' },
      data,
      response: null as any,
    }

    addExecutionLog('system', 'start', '开始执行请求')

    // 执行中间件链
    await props.engine.middleware.execute(context)

    // 如果没有响应，生成默认响应
    if (!context.response) {
      context.response = {
        status: 200,
        data: { message: '请求处理成功', method: context.method, path: context.path },
      }
    }

    requestResult.value = context.response
    addExecutionLog('system', 'complete', '请求执行完成')

    emit('log', 'success', '请求执行成功', context.response)
  }
  catch (error: any) {
    requestResult.value = { error: error.message }
    addExecutionLog('system', 'error', `请求执行失败: ${error.message}`)
    emit('log', 'error', '请求执行失败', error)
  }
}

async function simulateError() {
  try {
    const context = {
      method: requestMethod.value,
      path: requestPath.value,
      headers: {}, // 故意不包含认证头
      data: null,
      response: null,
    }

    addExecutionLog('system', 'start', '开始执行错误模拟')

    await props.engine.middleware.execute(context)
  }
  catch (error: any) {
    requestResult.value = { error: error.message }
    addExecutionLog('system', 'error', `模拟错误: ${error.message}`)
    emit('log', 'error', '模拟错误执行', error)
  }
}

function refreshMiddlewareChain() {
  // 更新中间件状态
  middlewareChain.forEach((middleware) => {
    middleware.active = Math.random() > 0.2 // 80% 活跃率
  })
  emit('log', 'info', '刷新中间件链状态')
}

function addExecutionLog(middleware: string, phase: string, message: string, duration?: number) {
  executionLogs.push({
    timestamp: Date.now(),
    middleware,
    phase,
    message,
    duration,
    type: phase === 'error' ? 'error' : phase === 'success' ? 'success' : 'info',
  })

  // 限制日志数量
  if (executionLogs.length > 100) {
    executionLogs.splice(0, executionLogs.length - 100)
  }
}

function clearExecutionLogs() {
  executionLogs.splice(0, executionLogs.length)
  emit('log', 'info', '清空执行日志')
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  // 添加默认中间件
  addMiddleware()
  emit('log', 'info', '中间件管理器演示已加载')
})
</script>

<template>
  <div class="middleware-demo">
    <div class="demo-header">
      <h2>🔗 中间件管理器演示</h2>
      <p>MiddlewareManager 提供了洋葱模型的中间件系统，支持请求/响应拦截、异步处理等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 中间件注册 -->
      <div class="card">
        <div class="card-header">
          <h3>中间件注册</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>中间件名称</label>
            <input
              v-model="middlewareName"
              type="text"
              placeholder="例如: auth-middleware"
            >
          </div>

          <div class="form-group">
            <label>中间件类型</label>
            <select v-model="middlewareType">
              <option value="auth">
                认证中间件
              </option>
              <option value="logger">
                日志中间件
              </option>
              <option value="cache">
                缓存中间件
              </option>
              <option value="validator">
                验证中间件
              </option>
              <option value="custom">
                自定义中间件
              </option>
            </select>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="addMiddleware">
                添加中间件
              </button>
              <button class="btn btn-warning" @click="removeMiddleware">
                移除中间件
              </button>
              <button class="btn btn-error" @click="clearMiddlewares">
                清空所有
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 请求测试 -->
      <div class="card">
        <div class="card-header">
          <h3>请求测试</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>请求路径</label>
            <input
              v-model="requestPath"
              type="text"
              placeholder="例如: /api/users"
            >
          </div>

          <div class="form-group">
            <label>请求方法</label>
            <select v-model="requestMethod">
              <option value="GET">
                GET
              </option>
              <option value="POST">
                POST
              </option>
              <option value="PUT">
                PUT
              </option>
              <option value="DELETE">
                DELETE
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>请求数据</label>
            <textarea
              v-model="requestData"
              placeholder="输入请求数据 (JSON 格式)"
              rows="3"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="executeRequest">
                执行请求
              </button>
              <button class="btn btn-secondary" @click="simulateError">
                模拟错误
              </button>
            </div>
          </div>

          <div v-if="requestResult" class="request-result">
            <h4>执行结果</h4>
            <pre>{{ JSON.stringify(requestResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 中间件链状态 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>中间件链</h3>
          <button class="btn btn-secondary btn-sm" @click="refreshMiddlewareChain">
            刷新
          </button>
        </div>
        <div class="card-body">
          <div class="middleware-chain">
            <div
              v-for="(middleware, index) in middlewareChain"
              :key="index"
              class="middleware-item"
            >
              <div class="middleware-info">
                <span class="middleware-index">{{ index + 1 }}</span>
                <span class="middleware-name">{{ middleware.name }}</span>
                <span class="middleware-type">{{ middleware.type }}</span>
              </div>
              <div class="middleware-status">
                <span class="status-indicator" :class="{ active: middleware.active }" />
                <span>{{ middleware.active ? '活跃' : '非活跃' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 执行日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>执行日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearExecutionLogs">
            清空
          </button>
        </div>
        <div class="card-body">
          <div class="execution-logs">
            <div
              v-for="(log, index) in executionLogs"
              :key="index"
              class="execution-log-item"
              :class="log.type"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-middleware">{{ log.middleware }}</span>
              <span class="log-phase">{{ log.phase }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.duration" class="log-duration">{{ log.duration }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.middleware-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .request-result {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    pre {
      background: var(--bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      font-size: 12px;
      overflow-x: auto;
    }
  }

  .middleware-chain {
    .middleware-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border-left: 4px solid var(--primary-color);

      .middleware-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .middleware-index {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .middleware-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .middleware-type {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .middleware-status {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 12px;

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--error-color);

          &.active {
            background: var(--success-color);
          }
        }
      }
    }
  }

  .execution-logs {
    max-height: 300px;
    overflow-y: auto;

    .execution-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      &.error {
        background: rgba(220, 53, 69, 0.1);
      }

      &.success {
        background: rgba(40, 167, 69, 0.1);
      }

      .log-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .log-middleware {
        color: var(--primary-color);
        min-width: 80px;
        font-weight: 500;
      }

      .log-phase {
        color: var(--secondary-color);
        min-width: 60px;
      }

      .log-message {
        flex: 1;
        color: var(--text-primary);
      }

      .log-duration {
        color: var(--warning-color);
        min-width: 50px;
        text-align: right;
      }
    }
  }
}

@media (max-width: 768px) {
  .middleware-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .middleware-item {
    flex-direction: column;
    align-items: flex-start !important;

    .middleware-status {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
