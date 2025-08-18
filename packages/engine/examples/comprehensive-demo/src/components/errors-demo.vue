<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const errorType = ref('syntax')
const errorMessage = ref('测试错误消息')
const recoveryStrategy = ref('retry')
const retryCount = ref(3)
const recoveryResult = ref<any>(null)
const logFilter = ref('all')

const errorStats = reactive({
  total: 0,
  handled: 0,
  unhandled: 0,
  critical: 0,
})

const errorLogs = reactive<any[]>([])

// 错误处理策略
const errorStrategies = reactive([
  {
    name: '自动重试',
    description: '对于网络错误等临时性错误自动重试',
    enabled: true,
  },
  {
    name: '错误上报',
    description: '将错误信息上报到监控系统',
    enabled: true,
  },
  {
    name: '用户通知',
    description: '向用户显示友好的错误提示',
    enabled: true,
  },
  {
    name: '降级处理',
    description: '在关键功能出错时启用备用方案',
    enabled: false,
  },
  {
    name: '错误隔离',
    description: '防止错误影响其他功能模块',
    enabled: true,
  },
])

// 计算属性
const filteredErrorLogs = computed(() => {
  if (logFilter.value === 'all') {
    return errorLogs
  }
  return errorLogs.filter(log => log.level === logFilter.value)
})

// 方法
function triggerError() {
  try {
    const error = createError(errorType.value, errorMessage.value)
    throw error
  } catch (error: any) {
    handleError(error, 'sync')
  }
}

function triggerAsyncError() {
  setTimeout(() => {
    try {
      const error = createError(errorType.value, errorMessage.value)
      throw error
    } catch (error: any) {
      handleError(error, 'async')
    }
  }, 100)
}

function triggerPromiseError() {
  Promise.reject(createError(errorType.value, errorMessage.value)).catch(
    error => {
      handleError(error, 'promise')
    }
  )
}

function createError(type: string, message: string): Error {
  const errors = {
    syntax: () => {
      // 模拟语法错误
      eval('invalid syntax here')
    },
    reference: () => {
      // 模拟引用错误
      return (window as any).undefinedVariable.property
    },
    type: () => {
      // 模拟类型错误
      return (null as any).toString()
    },
    network: () => {
      const error = new Error(message || '网络请求失败')
      error.name = 'NetworkError'
      return error
    },
    validation: () => {
      const error = new Error(message || '数据验证失败')
      error.name = 'ValidationError'
      return error
    },
    custom: () => {
      const error = new Error(message || '自定义错误')
      error.name = 'CustomError'
      return error
    },
  }

  try {
    return errors[type as keyof typeof errors]()
  } catch (error) {
    return error as Error
  }
}

function handleError(error: Error, source: string) {
  const errorLog = {
    timestamp: Date.now(),
    level: getErrorLevel(error),
    type: error.name || 'Error',
    message: error.message,
    stack: error.stack,
    source,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
    handled: true,
  }

  errorLogs.push(errorLog)
  updateErrorStats()

  // 应用错误处理策略
  applyErrorStrategies(errorLog)

  emit('log', 'error', `捕获${source}错误: ${error.message}`, errorLog)
}

function getErrorLevel(error: Error): string {
  const criticalErrors = ['ReferenceError', 'TypeError', 'SyntaxError']
  if (criticalErrors.includes(error.name)) {
    return 'critical'
  }

  const warningErrors = ['ValidationError', 'NetworkError']
  if (warningErrors.includes(error.name)) {
    return 'warning'
  }

  return 'error'
}

function updateErrorStats() {
  errorStats.total = errorLogs.length
  errorStats.handled = errorLogs.filter(log => log.handled).length
  errorStats.unhandled = errorLogs.filter(log => !log.handled).length
  errorStats.critical = errorLogs.filter(log => log.level === 'critical').length
}

function applyErrorStrategies(errorLog: any) {
  errorStrategies.forEach(strategy => {
    if (!strategy.enabled) return

    switch (strategy.name) {
      case '自动重试':
        if (errorLog.type === 'NetworkError') {
          emit('log', 'info', '应用自动重试策略')
        }
        break
      case '错误上报':
        emit('log', 'info', '错误已上报到监控系统')
        break
      case '用户通知':
        emit('log', 'warning', `用户通知: ${errorLog.message}`)
        break
      case '降级处理':
        if (errorLog.level === 'critical') {
          emit('log', 'info', '启用降级处理')
        }
        break
      case '错误隔离':
        emit('log', 'info', '错误已隔离，不影响其他功能')
        break
    }
  })
}

function updateStrategy(strategy: any) {
  emit(
    'log',
    'info',
    `${strategy.enabled ? '启用' : '禁用'}策略: ${strategy.name}`
  )
}

async function testRecovery() {
  recoveryResult.value = null

  try {
    const result = await executeRecoveryStrategy()
    recoveryResult.value = {
      success: true,
      message: '恢复成功',
      attempts: result.attempts,
    }
    emit('log', 'success', '错误恢复测试成功', recoveryResult.value)
  } catch (error: any) {
    recoveryResult.value = {
      success: false,
      message: `恢复失败: ${error.message}`,
      attempts: retryCount.value,
    }
    emit('log', 'error', '错误恢复测试失败', recoveryResult.value)
  }
}

function simulateRecovery() {
  const success = Math.random() > 0.3 // 70% 成功率

  recoveryResult.value = {
    success,
    message: success ? '模拟恢复成功' : '模拟恢复失败',
    attempts: Math.floor(Math.random() * retryCount.value) + 1,
  }

  emit(
    'log',
    success ? 'success' : 'error',
    '模拟错误恢复',
    recoveryResult.value
  )
}

async function executeRecoveryStrategy(): Promise<{ attempts: number }> {
  let attempts = 0

  for (let i = 0; i < retryCount.value; i++) {
    attempts++

    try {
      switch (recoveryStrategy.value) {
        case 'retry':
          await simulateOperation()
          break
        case 'fallback':
          await simulateFallback()
          break
        case 'ignore':
          // 忽略错误
          break
        case 'reload':
          // 模拟重载
          await new Promise(resolve => setTimeout(resolve, 500))
          break
      }

      return { attempts }
    } catch (error) {
      if (i === retryCount.value - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  throw new Error('所有重试都失败了')
}

async function simulateOperation() {
  await new Promise(resolve => setTimeout(resolve, 200))
  if (Math.random() < 0.3) {
    throw new Error('操作失败')
  }
}

async function simulateFallback() {
  await new Promise(resolve => setTimeout(resolve, 100))
  // 降级操作总是成功
}

function refreshStats() {
  updateErrorStats()
  emit('log', 'info', '错误统计已刷新', errorStats)
}

function clearErrorHistory() {
  errorLogs.splice(0, errorLogs.length)
  updateErrorStats()
  emit('log', 'warning', '错误历史已清空')
}

function clearErrorLogs() {
  errorLogs.splice(0, errorLogs.length)
  updateErrorStats()
  emit('log', 'info', '错误日志已清空')
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  // 设置全局错误处理
  window.addEventListener('error', event => {
    handleError(event.error, 'global')
  })

  window.addEventListener('unhandledrejection', event => {
    handleError(new Error(event.reason), 'unhandled-promise')
  })

  emit('log', 'info', '错误管理器演示已加载')
})
</script>

<template>
  <div class="errors-demo">
    <div class="demo-header">
      <h2>🚨 错误管理器演示</h2>
      <p>
        ErrorManager
        提供了完整的错误处理机制，包括错误捕获、分类、报告和恢复策略。
      </p>
    </div>

    <div class="demo-grid">
      <!-- 错误触发 -->
      <div class="card">
        <div class="card-header">
          <h3>错误触发测试</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>错误类型</label>
            <select v-model="errorType">
              <option value="syntax">语法错误</option>
              <option value="reference">引用错误</option>
              <option value="type">类型错误</option>
              <option value="network">网络错误</option>
              <option value="validation">验证错误</option>
              <option value="custom">自定义错误</option>
            </select>
          </div>

          <div class="form-group">
            <label>错误消息</label>
            <input
              v-model="errorMessage"
              type="text"
              placeholder="输入错误消息"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-error" @click="triggerError">
                触发错误
              </button>
              <button class="btn btn-warning" @click="triggerAsyncError">
                异步错误
              </button>
              <button class="btn btn-secondary" @click="triggerPromiseError">
                Promise错误
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误处理策略 -->
      <div class="card">
        <div class="card-header">
          <h3>错误处理策略</h3>
        </div>
        <div class="card-body">
          <div class="strategy-list">
            <div
              v-for="strategy in errorStrategies"
              :key="strategy.name"
              class="strategy-item"
            >
              <div class="strategy-info">
                <h4>{{ strategy.name }}</h4>
                <p>{{ strategy.description }}</p>
              </div>
              <div class="strategy-toggle">
                <label class="switch">
                  <input
                    v-model="strategy.enabled"
                    type="checkbox"
                    @change="updateStrategy(strategy)"
                  />
                  <span class="slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误统计 -->
      <div class="card">
        <div class="card-header">
          <h3>错误统计</h3>
        </div>
        <div class="card-body">
          <div class="error-stats">
            <div class="stat-card">
              <h4>总错误数</h4>
              <div class="stat-value">
                {{ errorStats.total }}
              </div>
            </div>
            <div class="stat-card">
              <h4>已处理</h4>
              <div class="stat-value">
                {{ errorStats.handled }}
              </div>
            </div>
            <div class="stat-card">
              <h4>未处理</h4>
              <div class="stat-value">
                {{ errorStats.unhandled }}
              </div>
            </div>
            <div class="stat-card">
              <h4>严重错误</h4>
              <div class="stat-value">
                {{ errorStats.critical }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="refreshStats">
                刷新统计
              </button>
              <button class="btn btn-warning" @click="clearErrorHistory">
                清空历史
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误恢复 -->
      <div class="card">
        <div class="card-header">
          <h3>错误恢复</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>恢复策略</label>
            <select v-model="recoveryStrategy">
              <option value="retry">重试</option>
              <option value="fallback">降级</option>
              <option value="ignore">忽略</option>
              <option value="reload">重载</option>
            </select>
          </div>

          <div class="form-group">
            <label>重试次数</label>
            <input v-model.number="retryCount" type="number" min="1" max="10" />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="testRecovery">
                测试恢复
              </button>
              <button class="btn btn-secondary" @click="simulateRecovery">
                模拟恢复
              </button>
            </div>
          </div>

          <div v-if="recoveryResult" class="recovery-result">
            <h4>恢复结果</h4>
            <div
              class="result-item"
              :class="recoveryResult.success ? 'success' : 'error'"
            >
              <span>{{ recoveryResult.message }}</span>
              <span v-if="recoveryResult.attempts"
                >尝试次数: {{ recoveryResult.attempts }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 错误日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>错误日志</h3>
          <div class="header-actions">
            <select v-model="logFilter">
              <option value="all">全部</option>
              <option value="critical">严重</option>
              <option value="error">错误</option>
              <option value="warning">警告</option>
            </select>
            <button class="btn btn-secondary btn-sm" @click="clearErrorLogs">
              清空
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="error-logs">
            <div
              v-for="(error, index) in filteredErrorLogs"
              :key="index"
              class="error-log-item"
              :class="error.level"
            >
              <div class="error-header">
                <span class="error-time">{{
                  formatTime(error.timestamp)
                }}</span>
                <span class="error-level">{{ error.level.toUpperCase() }}</span>
                <span class="error-type">{{ error.type }}</span>
              </div>
              <div class="error-message">
                {{ error.message }}
              </div>
              <div v-if="error.stack" class="error-stack">
                <details>
                  <summary>堆栈信息</summary>
                  <pre>{{ error.stack }}</pre>
                </details>
              </div>
              <div v-if="error.context" class="error-context">
                <strong>上下文:</strong> {{ JSON.stringify(error.context) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.errors-demo {
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

  .strategy-list {
    .strategy-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      .strategy-info {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }

      .strategy-toggle {
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;

          input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;

            &:before {
              position: absolute;
              content: '';
              height: 18px;
              width: 18px;
              left: 3px;
              bottom: 3px;
              background-color: white;
              transition: 0.4s;
              border-radius: 50%;
            }
          }

          input:checked + .slider {
            background-color: var(--primary-color);
          }

          input:checked + .slider:before {
            transform: translateX(26px);
          }
        }
      }
    }
  }

  .error-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .stat-card {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 14px;
        color: var(--text-secondary);
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
      }
    }
  }

  .recovery-result {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      border-radius: var(--border-radius);

      &.success {
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid var(--success-color);
      }

      &.error {
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid var(--error-color);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .error-logs {
    max-height: 400px;
    overflow-y: auto;

    .error-log-item {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      border-radius: var(--border-radius);
      border-left: 4px solid;

      &.critical {
        background: rgba(220, 53, 69, 0.1);
        border-left-color: var(--error-color);
      }

      &.error {
        background: rgba(255, 193, 7, 0.1);
        border-left-color: var(--warning-color);
      }

      &.warning {
        background: rgba(23, 162, 184, 0.1);
        border-left-color: var(--info-color);
      }

      .error-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        .error-time {
          color: var(--text-muted);
          font-size: 12px;
          font-family: monospace;
        }

        .error-level {
          font-size: 12px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .error-type {
          font-size: 12px;
          color: var(--primary-color);
          font-family: monospace;
        }
      }

      .error-message {
        font-weight: 500;
        margin-bottom: var(--spacing-sm);
        color: var(--text-primary);
      }

      .error-stack {
        margin-bottom: var(--spacing-sm);

        details {
          summary {
            cursor: pointer;
            font-size: 12px;
            color: var(--text-secondary);
          }

          pre {
            margin-top: var(--spacing-sm);
            padding: var(--spacing-sm);
            background: var(--bg-primary);
            border-radius: var(--border-radius);
            font-size: 10px;
            overflow-x: auto;
          }
        }
      }

      .error-context {
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }
}

@media (max-width: 768px) {
  .errors-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .error-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .strategy-item {
    flex-direction: column;
    align-items: flex-start !important;

    .strategy-toggle {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
