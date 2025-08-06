<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const errorLogs = ref<any[]>([])
const errorStats = ref<any>({})
const customErrorMessage = ref('这是一个自定义错误')
const asyncErrorDelay = ref(2000)

// 计算属性
const hasErrorLogs = computed(() => errorLogs.value.length > 0)
const totalErrors = computed(() => errorStats.value.total || 0)
const errorsByType = computed(() => errorStats.value.byType || {})

// 方法
function triggerSyncError() {
  try {
    throw new Error(customErrorMessage.value || '同步错误示例')
  }
  catch (error) {
    engine.errors.onError(error as Error)

    engine.notifications.show({
      type: 'error',
      title: '同步错误',
      message: '已触发同步错误',
      duration: 3000,
    })
  }
}

function triggerAsyncError() {
  engine.notifications.show({
    type: 'info',
    title: '异步错误',
    message: `将在 ${asyncErrorDelay.value}ms 后触发`,
    duration: 2000,
  })

  setTimeout(() => {
    try {
      throw new Error(`异步错误 - 延迟 ${asyncErrorDelay.value}ms`)
    }
    catch (error) {
      engine.errors.onError(error as Error)

      engine.notifications.show({
        type: 'error',
        title: '异步错误',
        message: '异步错误已触发',
        duration: 3000,
      })
    }
  }, asyncErrorDelay.value)
}

function triggerTypeError() {
  try {
    // 故意触发类型错误
    const obj: any = null
    obj.someProperty.someMethod()
  }
  catch (error) {
    engine.errors.onError(error as Error)

    engine.notifications.show({
      type: 'error',
      title: 'TypeError',
      message: '已触发类型错误',
      duration: 3000,
    })
  }
}

function triggerReferenceError() {
  try {
    // 故意触发引用错误
    // @ts-expect-error - 故意访问未定义变量来演示错误处理
    console.log(undefinedVariable)
  }
  catch (error) {
    engine.errors.onError(error as Error)

    engine.notifications.show({
      type: 'error',
      title: 'ReferenceError',
      message: '已触发引用错误',
      duration: 3000,
    })
  }
}

function triggerNetworkError() {
  // 模拟网络错误
  fetch('https://nonexistent-domain-12345.com/api/data')
    .catch((error) => {
      engine.errors.onError(new Error(`网络错误: ${error.message}`))

      engine.notifications.show({
        type: 'error',
        title: '网络错误',
        message: '已触发网络错误',
        duration: 3000,
      })
    })
}

function triggerPromiseRejection() {
  // 模拟未捕获的 Promise 拒绝
  Promise.reject(new Error('未捕获的 Promise 拒绝'))
    .catch((error) => {
      engine.errors.onError(error)

      engine.notifications.show({
        type: 'error',
        title: 'Promise 拒绝',
        message: '已触发 Promise 拒绝',
        duration: 3000,
      })
    })
}

function simulateMemoryError() {
  try {
    // 模拟内存错误（创建大量对象）
    const largeArray = []
    for (let i = 0; i < 1000000; i++) {
      largeArray.push(Array.from({ length: 1000 }).fill(Math.random()))
    }

    engine.notifications.show({
      type: 'warning',
      title: '内存压力测试',
      message: '已创建大量对象，可能影响性能',
      duration: 3000,
    })
  }
  catch (error) {
    engine.errors.onError(error as Error)

    engine.notifications.show({
      type: 'error',
      title: '内存错误',
      message: '内存分配失败',
      duration: 3000,
    })
  }
}

function clearErrorLogs() {
  errorLogs.value = []
  errorStats.value = {}

  engine.notifications.show({
    type: 'info',
    title: '日志已清空',
    message: '所有错误日志已清空',
    duration: 2000,
  })
}

function exportErrorLogs() {
  const data = {
    timestamp: new Date().toISOString(),
    stats: errorStats.value,
    logs: errorLogs.value,
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `error-logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '错误日志已导出',
    duration: 2000,
  })
}

function updateErrorStats() {
  const stats = {
    total: errorLogs.value.length,
    byType: {} as any,
    byTime: {} as any,
  }

  errorLogs.value.forEach((log) => {
    // 按类型统计
    const type = log.type || 'Error'
    stats.byType[type] = (stats.byType[type] || 0) + 1

    // 按时间统计（按小时）
    const hour = new Date(log.timestamp).getHours()
    stats.byTime[hour] = (stats.byTime[hour] || 0) + 1
  })

  errorStats.value = stats
}

function formatErrorType(error: Error): string {
  return error.constructor.name
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

// 监听错误事件
engine.events.on('error:captured', (errorData) => {
  errorLogs.value.unshift({
    id: Date.now(),
    message: errorData.message,
    type: formatErrorType(errorData.error),
    stack: errorData.error.stack,
    timestamp: Date.now(),
    url: window.location.href,
  })

  // 只保留最近100条错误
  if (errorLogs.value.length > 100) {
    errorLogs.value = errorLogs.value.slice(0, 100)
  }

  updateErrorStats()
})

// 初始化
updateErrorStats()
</script>

<template>
  <div class="error-demo">
    <header class="demo-header">
      <h1>🚨 错误处理演示</h1>
      <p>展示引擎的错误捕获、处理和日志记录功能</p>
    </header>

    <div class="demo-content">
      <!-- 错误触发面板 -->
      <section class="error-triggers">
        <h2>错误触发测试</h2>
        <div class="trigger-grid">
          <div class="trigger-card">
            <h3>同步错误</h3>
            <p>立即触发的同步错误</p>
            <div class="input-group">
              <input
                v-model="customErrorMessage"
                type="text"
                placeholder="自定义错误消息"
                class="error-input"
              >
            </div>
            <button class="btn btn-danger" @click="triggerSyncError">
              触发同步错误
            </button>
          </div>

          <div class="trigger-card">
            <h3>异步错误</h3>
            <p>延迟触发的异步错误</p>
            <div class="input-group">
              <label>延迟时间 (ms):</label>
              <input
                v-model.number="asyncErrorDelay"
                type="number"
                min="100"
                max="10000"
                class="error-input"
              >
            </div>
            <button class="btn btn-warning" @click="triggerAsyncError">
              触发异步错误
            </button>
          </div>

          <div class="trigger-card">
            <h3>类型错误</h3>
            <p>访问 null/undefined 属性</p>
            <button class="btn btn-danger" @click="triggerTypeError">
              触发 TypeError
            </button>
          </div>

          <div class="trigger-card">
            <h3>引用错误</h3>
            <p>访问未定义的变量</p>
            <button class="btn btn-danger" @click="triggerReferenceError">
              触发 ReferenceError
            </button>
          </div>

          <div class="trigger-card">
            <h3>网络错误</h3>
            <p>模拟网络请求失败</p>
            <button class="btn btn-info" @click="triggerNetworkError">
              触发网络错误
            </button>
          </div>

          <div class="trigger-card">
            <h3>Promise 拒绝</h3>
            <p>未捕获的 Promise 拒绝</p>
            <button class="btn btn-warning" @click="triggerPromiseRejection">
              触发 Promise 拒绝
            </button>
          </div>

          <div class="trigger-card">
            <h3>内存压力</h3>
            <p>模拟内存分配压力</p>
            <button class="btn btn-secondary" @click="simulateMemoryError">
              内存压力测试
            </button>
          </div>

          <div class="trigger-card">
            <h3>日志管理</h3>
            <p>清空和导出错误日志</p>
            <div class="log-actions">
              <button class="btn btn-success" @click="exportErrorLogs">
                📤 导出日志
              </button>
              <button class="btn btn-secondary" @click="clearErrorLogs">
                🗑️ 清空日志
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 错误统计 -->
      <section class="error-stats">
        <h2>错误统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">
              {{ totalErrors }}
            </div>
            <div class="stat-label">
              总错误数
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">
              {{ Object.keys(errorsByType).length }}
            </div>
            <div class="stat-label">
              错误类型数
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">
              {{ hasErrorLogs ? formatTimestamp(errorLogs[0].timestamp) : '无' }}
            </div>
            <div class="stat-label">
              最近错误时间
            </div>
          </div>
        </div>

        <!-- 错误类型分布 -->
        <div v-if="Object.keys(errorsByType).length > 0" class="error-types">
          <h3>错误类型分布</h3>
          <div class="type-chart">
            <div
              v-for="(count, type) in errorsByType"
              :key="type"
              class="type-bar"
            >
              <div class="type-label">
                {{ type }}
              </div>
              <div class="type-count">
                {{ count }}
              </div>
              <div
                class="type-progress"
                :style="{ width: `${(count / totalErrors) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 错误日志列表 -->
      <section v-if="hasErrorLogs" class="error-logs">
        <h2>错误日志 (最近 {{ errorLogs.length }} 条)</h2>
        <div class="logs-container">
          <div
            v-for="log in errorLogs"
            :key="log.id"
            class="log-entry"
            :class="`log-${log.type.toLowerCase()}`"
          >
            <div class="log-header">
              <div class="log-type">
                {{ log.type }}
              </div>
              <div class="log-time">
                {{ formatTimestamp(log.timestamp) }}
              </div>
            </div>

            <div class="log-message">
              <strong>消息:</strong> {{ log.message }}
            </div>

            <div v-if="log.stack" class="log-stack">
              <details>
                <summary>查看堆栈跟踪</summary>
                <pre>{{ log.stack }}</pre>
              </details>
            </div>

            <div class="log-meta">
              <span>URL: {{ log.url }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="empty-logs">
        <div class="empty-message">
          <h3>暂无错误日志</h3>
          <p>触发一些错误来查看错误处理功能</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.error-demo {
  padding: 2rem;
  max-width: 1200px;
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
  font-size: 1.1rem;
  color: #7f8c8d;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-triggers,
.error-stats,
.error-logs,
.empty-logs {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-triggers h2,
.error-stats h2,
.error-logs h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.trigger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.trigger-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #e74c3c;
}

.trigger-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.trigger-card p {
  margin-bottom: 1rem;
  color: #7f8c8d;
  font-size: 0.875rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
  font-size: 0.875rem;
}

.error-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.error-input:focus {
  outline: none;
  border-color: #3498db;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.btn-info {
  background: #3498db;
  color: white;
}

.btn-info:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border-left: 4px solid #e74c3c;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.error-types {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.error-types h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.type-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-bar {
  position: relative;
  background: white;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-label {
  font-weight: 500;
  color: #2c3e50;
}

.type-count {
  font-weight: 600;
  color: #e74c3c;
}

.type-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #e74c3c;
  border-radius: 0 0 6px 6px;
  transition: width 0.3s ease;
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.log-entry {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #e74c3c;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-type {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.log-time {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.log-message {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.log-message strong {
  color: #2c3e50;
}

.log-stack {
  margin-bottom: 1rem;
}

.log-stack details {
  cursor: pointer;
}

.log-stack summary {
  font-size: 0.875rem;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.log-stack pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-meta {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.empty-message {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.empty-message h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .error-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .trigger-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
