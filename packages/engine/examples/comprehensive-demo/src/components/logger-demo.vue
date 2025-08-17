<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const logLevel = ref('info')
const logMessage = ref('这是一条测试日志')
const logData = ref('{"userId": 123, "action": "login"}')
const minLogLevel = ref('debug')
const logFormat = ref('detailed')
const enableTimestamp = ref(true)
const enableColors = ref(true)
const enableConsoleOutput = ref(true)
const logFilter = ref('all')
const searchQuery = ref('')

const logStats = reactive({
  total: 0,
  debug: 0,
  info: 0,
  warn: 0,
  error: 0,
  fatal: 0,
})

const logs = reactive<any[]>([])

// 日志模板
const logTemplates = [
  {
    name: '用户登录',
    level: 'info',
    message: '用户登录成功',
    data: { userId: 123, username: '张三', ip: '192.168.1.100' },
  },
  {
    name: '数据库连接',
    level: 'debug',
    message: '数据库连接建立',
    data: { host: 'localhost', port: 3306, database: 'app_db' },
  },
  {
    name: '网络错误',
    level: 'error',
    message: '网络请求失败',
    data: { url: '/api/users', status: 500, error: 'Internal Server Error' },
  },
  {
    name: '性能警告',
    level: 'warn',
    message: '响应时间过长',
    data: { endpoint: '/api/data', responseTime: 5000, threshold: 3000 },
  },
  {
    name: '系统启动',
    level: 'info',
    message: '系统启动完成',
    data: { version: '1.0.0', environment: 'production', startTime: Date.now() },
  },
  {
    name: '致命错误',
    level: 'fatal',
    message: '系统崩溃',
    data: { error: 'OutOfMemoryError', heap: '2GB', available: '100MB' },
  },
]

// 计算属性
const filteredLogs = computed(() => {
  let filtered = logs

  // 按级别过滤
  if (logFilter.value !== 'all') {
    filtered = filtered.filter(log => log.level === logFilter.value)
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.message.toLowerCase().includes(query)
      || log.source.toLowerCase().includes(query)
      || (log.data && JSON.stringify(log.data).toLowerCase().includes(query)),
    )
  }

  return filtered.slice().reverse() // 最新的在前面
})

// 方法
function writeLog() {
  try {
    let data = null
    if (logData.value.trim()) {
      try {
        data = JSON.parse(logData.value)
      }
      catch {
        data = logData.value
      }
    }

    const logEntry = createLogEntry(logLevel.value, logMessage.value, data)
    addLog(logEntry)

    emit('log', logLevel.value as any, logMessage.value, data)
  }
  catch (error: any) {
    emit('log', 'error', '写入日志失败', error)
  }
}

function writeDebugLog() {
  const logEntry = createLogEntry('debug', '调试信息: 变量值检查', {
    variable: 'userCount',
    value: 42,
    expected: 40,
  })
  addLog(logEntry)
  emit('log', 'info', '写入调试日志')
}

function writeWarningLog() {
  const logEntry = createLogEntry('warn', '警告: 内存使用率过高', {
    usage: '85%',
    threshold: '80%',
    recommendation: '清理缓存',
  })
  addLog(logEntry)
  emit('log', 'info', '写入警告日志')
}

function writeErrorLog() {
  const logEntry = createLogEntry('error', '错误: API调用失败', {
    endpoint: '/api/users',
    status: 500,
    error: 'Internal Server Error',
    stack: 'Error: API call failed\n    at fetchUsers (app.js:123:45)\n    at UserComponent (component.js:67:89)',
  })
  addLog(logEntry)
  emit('log', 'info', '写入错误日志')
}

function createLogEntry(level: string, message: string, data?: any) {
  return {
    timestamp: Date.now(),
    level,
    message,
    data,
    source: 'LoggerDemo',
    stack: data?.stack || null,
    formatted: formatLogEntry(level, message, data),
  }
}

function formatLogEntry(level: string, message: string, data?: any) {
  const timestamp = enableTimestamp.value ? new Date().toISOString() : ''
  const levelStr = level.toUpperCase().padEnd(5)

  switch (logFormat.value) {
    case 'simple':
      return `${levelStr} ${message}`
    case 'detailed':
      return `[${timestamp}] ${levelStr} [LoggerDemo] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`
    case 'json':
      return JSON.stringify({ timestamp, level, source: 'LoggerDemo', message, data })
    case 'custom':
      return `🚀 ${timestamp} | ${levelStr} | ${message}`
    default:
      return `${levelStr} ${message}`
  }
}

function addLog(logEntry: any) {
  logs.push(logEntry)
  updateLogStats(logEntry.level)

  // 输出到控制台
  if (enableConsoleOutput.value) {
    const consoleMethod = getConsoleMethod(logEntry.level)
    if (enableColors.value) {
      console[consoleMethod](`%c${logEntry.formatted}`, getLogStyle(logEntry.level))
    }
    else {
      console[consoleMethod](logEntry.formatted)
    }
  }

  // 限制日志数量
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000)
    refreshStats()
  }
}

function getConsoleMethod(level: string) {
  switch (level) {
    case 'debug': return 'debug'
    case 'info': return 'info'
    case 'warn': return 'warn'
    case 'error': return 'error'
    case 'fatal': return 'error'
    default: return 'log'
  }
}

function getLogStyle(level: string) {
  const styles = {
    debug: 'color: #6c757d',
    info: 'color: #17a2b8',
    warn: 'color: #ffc107; font-weight: bold',
    error: 'color: #dc3545; font-weight: bold',
    fatal: 'color: #dc3545; font-weight: bold; background: #f8d7da',
  }
  return styles[level as keyof typeof styles] || 'color: inherit'
}

function updateLogStats(level: string) {
  logStats.total++
  logStats[level as keyof typeof logStats]++
}

function refreshStats() {
  // 重新计算统计
  logStats.total = logs.length
  logStats.debug = logs.filter(log => log.level === 'debug').length
  logStats.info = logs.filter(log => log.level === 'info').length
  logStats.warn = logs.filter(log => log.level === 'warn').length
  logStats.error = logs.filter(log => log.level === 'error').length
  logStats.fatal = logs.filter(log => log.level === 'fatal').length
}

function applyLogConfig() {
  emit('log', 'info', '应用日志配置', {
    minLogLevel: minLogLevel.value,
    format: logFormat.value,
    timestamp: enableTimestamp.value,
    colors: enableColors.value,
    console: enableConsoleOutput.value,
  })
}

function resetLogConfig() {
  minLogLevel.value = 'debug'
  logFormat.value = 'detailed'
  enableTimestamp.value = true
  enableColors.value = true
  enableConsoleOutput.value = true
  emit('log', 'info', '重置日志配置')
}

function clearLogs() {
  logs.splice(0, logs.length)
  logStats.total = 0
  logStats.debug = 0
  logStats.info = 0
  logStats.warn = 0
  logStats.error = 0
  logStats.fatal = 0
  emit('log', 'warning', '清空所有日志')
}

function exportLogs() {
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: logStats,
      logs: logs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        level: log.level,
        message: log.message,
        data: log.data,
        source: log.source,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    emit('log', 'success', '日志导出成功')
  }
  catch (error: any) {
    emit('log', 'error', '日志导出失败', error)
  }
}

function writeQuickLog(template: any) {
  const logEntry = createLogEntry(template.level, template.message, template.data)
  addLog(logEntry)
  emit('log', 'info', `写入快速日志: ${template.name}`)
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 生命周期
onMounted(() => {
  // 写入一些示例日志
  const sampleLogs = [
    { level: 'info', message: '系统启动', data: { version: '1.0.0' } },
    { level: 'debug', message: '加载配置文件', data: { file: 'config.json' } },
    { level: 'warn', message: '配置项缺失', data: { key: 'database.timeout' } },
  ]

  sampleLogs.forEach((log) => {
    const logEntry = createLogEntry(log.level, log.message, log.data)
    addLog(logEntry)
  })

  emit('log', 'info', '日志管理器演示已加载')
})
</script>

<template>
  <div class="logger-demo">
    <div class="demo-header">
      <h2>📋 日志管理器演示</h2>
      <p>LoggerManager 提供了完整的日志系统，支持多级别日志、格式化输出、日志过滤等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 日志输出 -->
      <div class="card">
        <div class="card-header">
          <h3>日志输出</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>日志级别</label>
            <select v-model="logLevel">
              <option value="debug">
                DEBUG
              </option>
              <option value="info">
                INFO
              </option>
              <option value="warn">
                WARN
              </option>
              <option value="error">
                ERROR
              </option>
              <option value="fatal">
                FATAL
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>日志消息</label>
            <input
              v-model="logMessage"
              type="text"
              placeholder="输入日志消息"
            >
          </div>

          <div class="form-group">
            <label>日志数据 (JSON)</label>
            <textarea
              v-model="logData"
              placeholder="输入附加数据"
              rows="3"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="writeLog">
                写入日志
              </button>
              <button class="btn btn-secondary" @click="writeDebugLog">
                调试日志
              </button>
              <button class="btn btn-warning" @click="writeWarningLog">
                警告日志
              </button>
              <button class="btn btn-error" @click="writeErrorLog">
                错误日志
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志配置 -->
      <div class="card">
        <div class="card-header">
          <h3>日志配置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>最小日志级别</label>
            <select v-model="minLogLevel">
              <option value="debug">
                DEBUG
              </option>
              <option value="info">
                INFO
              </option>
              <option value="warn">
                WARN
              </option>
              <option value="error">
                ERROR
              </option>
              <option value="fatal">
                FATAL
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>日志格式</label>
            <select v-model="logFormat">
              <option value="simple">
                简单格式
              </option>
              <option value="detailed">
                详细格式
              </option>
              <option value="json">
                JSON格式
              </option>
              <option value="custom">
                自定义格式
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="enableTimestamp"
                type="checkbox"
              >
              显示时间戳
            </label>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="enableColors"
                type="checkbox"
              >
              启用颜色
            </label>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="enableConsoleOutput"
                type="checkbox"
              >
              控制台输出
            </label>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="applyLogConfig">
                应用配置
              </button>
              <button class="btn btn-secondary" @click="resetLogConfig">
                重置配置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志统计 -->
      <div class="card">
        <div class="card-header">
          <h3>日志统计</h3>
        </div>
        <div class="card-body">
          <div class="log-stats">
            <div class="stat-card">
              <h4>总日志数</h4>
              <div class="stat-value">
                {{ logStats.total }}
              </div>
            </div>
            <div class="stat-card">
              <h4>调试日志</h4>
              <div class="stat-value">
                {{ logStats.debug }}
              </div>
            </div>
            <div class="stat-card">
              <h4>信息日志</h4>
              <div class="stat-value">
                {{ logStats.info }}
              </div>
            </div>
            <div class="stat-card">
              <h4>警告日志</h4>
              <div class="stat-value">
                {{ logStats.warn }}
              </div>
            </div>
            <div class="stat-card">
              <h4>错误日志</h4>
              <div class="stat-value">
                {{ logStats.error }}
              </div>
            </div>
            <div class="stat-card">
              <h4>致命错误</h4>
              <div class="stat-value">
                {{ logStats.fatal }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="refreshStats">
                刷新统计
              </button>
              <button class="btn btn-warning" @click="exportLogs">
                导出日志
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志查看器 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>日志查看器</h3>
          <div class="header-actions">
            <select v-model="logFilter">
              <option value="all">
                全部
              </option>
              <option value="debug">
                DEBUG
              </option>
              <option value="info">
                INFO
              </option>
              <option value="warn">
                WARN
              </option>
              <option value="error">
                ERROR
              </option>
              <option value="fatal">
                FATAL
              </option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索日志..."
              class="search-input"
            >
            <button class="btn btn-secondary btn-sm" @click="clearLogs">
              清空日志
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="log-viewer">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-entry"
              :class="log.level"
            >
              <div class="log-header">
                <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-source">{{ log.source }}</span>
              </div>
              <div class="log-message">
                {{ log.message }}
              </div>
              <div v-if="log.data" class="log-data">
                <details>
                  <summary>附加数据</summary>
                  <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
                </details>
              </div>
              <div v-if="log.stack" class="log-stack">
                <details>
                  <summary>堆栈信息</summary>
                  <pre>{{ log.stack }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>快速日志模板</h3>
        </div>
        <div class="card-body">
          <div class="quick-logs">
            <button
              v-for="template in logTemplates"
              :key="template.name"
              class="btn btn-secondary quick-log-btn"
              @click="writeQuickLog(template)"
            >
              {{ template.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.logger-demo {
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

  .log-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .stat-card {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
      }

      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: var(--primary-color);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .search-input {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 12px;
      min-width: 150px;
    }
  }

  .log-viewer {
    max-height: 400px;
    overflow-y: auto;
    background: #1e1e1e;
    border-radius: var(--border-radius);
    padding: var(--spacing-sm);
    font-family: 'Courier New', monospace;

    .log-entry {
      margin-bottom: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: 4px;
      border-left: 4px solid;

      &.debug {
        background: rgba(108, 117, 125, 0.1);
        border-left-color: #6c757d;
        color: #6c757d;
      }

      &.info {
        background: rgba(23, 162, 184, 0.1);
        border-left-color: #17a2b8;
        color: #17a2b8;
      }

      &.warn {
        background: rgba(255, 193, 7, 0.1);
        border-left-color: #ffc107;
        color: #ffc107;
      }

      &.error {
        background: rgba(220, 53, 69, 0.1);
        border-left-color: #dc3545;
        color: #dc3545;
      }

      &.fatal {
        background: rgba(220, 53, 69, 0.2);
        border-left-color: #dc3545;
        color: #dc3545;
        font-weight: bold;
      }

      .log-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);
        font-size: 11px;

        .log-timestamp {
          color: #888;
        }

        .log-level {
          font-weight: bold;
          min-width: 50px;
        }

        .log-source {
          color: #aaa;
        }
      }

      .log-message {
        font-size: 13px;
        line-height: 1.4;
        margin-bottom: var(--spacing-xs);
      }

      .log-data, .log-stack {
        margin-top: var(--spacing-xs);

        details {
          summary {
            cursor: pointer;
            font-size: 11px;
            color: #aaa;
            margin-bottom: var(--spacing-xs);
          }

          pre {
            background: rgba(0, 0, 0, 0.3);
            padding: var(--spacing-xs);
            border-radius: 4px;
            font-size: 10px;
            overflow-x: auto;
            color: #ccc;
          }
        }
      }
    }
  }

  .quick-logs {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;

    .quick-log-btn {
      min-width: 120px;
    }
  }
}

@media (max-width: 768px) {
  .logger-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .log-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;

    .search-input {
      min-width: auto;
    }
  }

  .quick-logs {
    flex-direction: column;

    .quick-log-btn {
      min-width: auto;
    }
  }
}
</style>
