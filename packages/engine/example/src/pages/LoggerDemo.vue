<template>
  <div class="logger-demo">
    <div class="demo-header">
      <h1>📝 日志系统演示</h1>
      <p>展示日志记录、过滤、搜索和管理功能</p>
    </div>

    <div class="demo-grid">
      <!-- 日志记录 -->
      <div class="demo-card">
        <h3>✍️ 记录日志</h3>
        <div class="form-group">
          <label>日志级别:</label>
          <select v-model="newLog.level" class="form-select">
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div class="form-group">
          <label>日志消息:</label>
          <input 
            v-model="newLog.message" 
            type="text" 
            placeholder="输入日志消息"
            class="form-input"
            @keyup.enter="addLog"
          >
        </div>
        <div class="form-group">
          <label>附加数据 (可选):</label>
          <textarea 
            v-model="newLog.data" 
            class="form-textarea"
            placeholder="JSON格式的附加数据"
            rows="3"
          ></textarea>
        </div>
        <div class="button-group">
          <button @click="addLog" class="btn btn-primary">
            记录日志
          </button>
          <button @click="addBatchLogs" class="btn btn-secondary">
            批量测试日志
          </button>
        </div>
      </div>

      <!-- 日志配置 -->
      <div class="demo-card">
        <h3>⚙️ 日志配置</h3>
        <div class="form-group">
          <label>当前日志级别:</label>
          <select v-model="currentLevel" @change="updateLogLevel" class="form-select">
            <option value="debug">Debug (显示所有)</option>
            <option value="info">Info (隐藏Debug)</option>
            <option value="warn">Warn (只显示警告和错误)</option>
            <option value="error">Error (只显示错误)</option>
          </select>
        </div>
        <div class="form-group">
          <label>最大日志数量:</label>
          <input 
            v-model.number="maxLogs" 
            type="number" 
            min="10" 
            max="10000"
            class="form-input"
            @change="updateMaxLogs"
          >
        </div>
        <div class="config-info">
          <div class="info-item">
            <span class="info-label">当前日志数量:</span>
            <span class="info-value">{{ totalLogs }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">显示的日志:</span>
            <span class="info-value">{{ filteredLogs.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存使用:</span>
            <span class="info-value">{{ memoryUsage }}</span>
          </div>
        </div>
      </div>

      <!-- 日志过滤和搜索 -->
      <div class="demo-card">
        <h3>🔍 过滤和搜索</h3>
        <div class="form-group">
          <label>搜索关键词:</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索日志内容"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>级别过滤:</label>
          <div class="level-filters">
            <label v-for="level in logLevels" :key="level" class="checkbox-label">
              <input 
                v-model="levelFilters[level]" 
                type="checkbox"
              >
              <span class="level-badge" :class="`level-${level}`">{{ level.toUpperCase() }}</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>时间范围:</label>
          <div class="time-range">
            <input 
              v-model="timeRange.start" 
              type="datetime-local" 
              class="form-input"
            >
            <span>到</span>
            <input 
              v-model="timeRange.end" 
              type="datetime-local" 
              class="form-input"
            >
          </div>
        </div>
        <div class="button-group">
          <button @click="clearFilters" class="btn btn-secondary">
            清除过滤
          </button>
          <button @click="exportFilteredLogs" class="btn btn-info">
            导出过滤结果
          </button>
        </div>
      </div>

      <!-- 日志统计 -->
      <div class="demo-card">
        <h3>📊 日志统计</h3>
        <div class="stats-grid">
          <div class="stat-item" v-for="(count, level) in logStats" :key="level">
            <div class="stat-value" :class="`level-${level}`">{{ count }}</div>
            <div class="stat-label">{{ level.toUpperCase() }}</div>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title">日志级别分布</div>
          <div class="chart-bars">
            <div 
              v-for="(count, level) in logStats" 
              :key="level"
              class="chart-bar"
              :class="`level-${level}`"
              :style="{ height: getBarHeight(count) + '%' }"
              :title="`${level}: ${count} 条`"
            >
              <span class="bar-label">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志管理 -->
      <div class="demo-card">
        <h3>🗂️ 日志管理</h3>
        <div class="management-section">
          <div class="button-group">
            <button @click="clearAllLogs" class="btn btn-danger">
              清空所有日志
            </button>
            <button @click="clearByLevel" class="btn btn-warning">
              按级别清空
            </button>
            <button @click="clearOldLogs" class="btn btn-secondary">
              清空旧日志
            </button>
          </div>
          <div class="form-group">
            <label>清空级别:</label>
            <select v-model="clearLevel" class="form-select">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div class="form-group">
            <label>保留天数:</label>
            <input 
              v-model.number="retentionDays" 
              type="number" 
              min="1" 
              max="365"
              class="form-input"
            >
          </div>
        </div>
      </div>

      <!-- 实时日志监控 -->
      <div class="demo-card">
        <h3>📡 实时监控</h3>
        <div class="monitor-controls">
          <label class="checkbox-label">
            <input v-model="realTimeMode" type="checkbox">
            启用实时监控
          </label>
          <label class="checkbox-label">
            <input v-model="autoScroll" type="checkbox">
            自动滚动
          </label>
          <label class="checkbox-label">
            <input v-model="showTimestamp" type="checkbox">
            显示时间戳
          </label>
        </div>
        <div class="monitor-stats">
          <div class="monitor-stat">
            <span class="stat-label">监控状态:</span>
            <span class="stat-value" :class="realTimeMode ? 'active' : 'inactive'">
              {{ realTimeMode ? '运行中' : '已停止' }}
            </span>
          </div>
          <div class="monitor-stat">
            <span class="stat-label">更新频率:</span>
            <span class="stat-value">{{ updateFrequency }}ms</span>
          </div>
        </div>
      </div>

      <!-- 日志显示区域 -->
      <div class="demo-card full-width">
        <h3>📋 日志列表</h3>
        <div class="log-controls">
          <div class="control-group">
            <button @click="refreshLogs" class="btn btn-primary">
              刷新日志
            </button>
            <button @click="exportLogs" class="btn btn-success">
              导出日志
            </button>
            <select v-model="pageSize" class="form-select">
              <option value="50">显示 50 条</option>
              <option value="100">显示 100 条</option>
              <option value="200">显示 200 条</option>
              <option value="-1">显示全部</option>
            </select>
          </div>
          <div class="pagination" v-if="pageSize !== -1">
            <button 
              @click="currentPage--" 
              :disabled="currentPage <= 1"
              class="btn btn-sm btn-secondary"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages"
              class="btn btn-sm btn-secondary"
            >
              下一页
            </button>
          </div>
        </div>
        
        <div 
          ref="logContainer" 
          class="log-display"
          :class="{ 'auto-scroll': autoScroll }"
        >
          <div 
            v-for="(log, index) in paginatedLogs" 
            :key="index"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <div class="log-header">
              <span class="log-level-badge" :class="`level-${log.level}`">
                {{ log.level.toUpperCase() }}
              </span>
              <span v-if="showTimestamp" class="log-timestamp">
                {{ formatTimestamp(log.timestamp) }}
              </span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="log.data && log.data.length > 0" class="log-data">
              <div 
                v-for="(item, dataIndex) in log.data" 
                :key="dataIndex"
                class="log-data-item"
              >
                <pre>{{ formatLogData(item) }}</pre>
              </div>
            </div>
          </div>
          <div v-if="paginatedLogs.length === 0" class="empty-logs">
            {{ filteredLogs.length === 0 ? '暂无日志' : '当前页无日志' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Engine } from '@ldesign/engine'

const engine = inject<Engine>('engine')!

// 响应式数据
const newLog = ref({
  level: 'info' as 'debug' | 'info' | 'warn' | 'error',
  message: '',
  data: ''
})

const currentLevel = ref('debug')
const maxLogs = ref(1000)
const searchQuery = ref('')
const realTimeMode = ref(true)
const autoScroll = ref(true)
const showTimestamp = ref(true)
const updateFrequency = ref(1000)
const pageSize = ref(100)
const currentPage = ref(1)
const clearLevel = ref('debug')
const retentionDays = ref(7)

const logLevels = ['debug', 'info', 'warn', 'error']
const levelFilters = ref({
  debug: true,
  info: true,
  warn: true,
  error: true
})

const timeRange = ref({
  start: '',
  end: ''
})

const logContainer = ref<HTMLElement>()
const updateInterval = ref<number>()

// 计算属性
const totalLogs = computed(() => engine.logger.getLogs().length)

const filteredLogs = computed(() => {
  let logs = engine.logger.getLogs()
  
  // 级别过滤
  logs = logs.filter(log => levelFilters.value[log.level as keyof typeof levelFilters.value])
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(query) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
    )
  }
  
  // 时间范围过滤
  if (timeRange.value.start) {
    const startTime = new Date(timeRange.value.start).getTime()
    logs = logs.filter(log => log.timestamp >= startTime)
  }
  
  if (timeRange.value.end) {
    const endTime = new Date(timeRange.value.end).getTime()
    logs = logs.filter(log => log.timestamp <= endTime)
  }
  
  return logs.reverse() // 最新的在前面
})

const totalPages = computed(() => {
  if (pageSize.value === -1) return 1
  return Math.ceil(filteredLogs.value.length / pageSize.value)
})

const paginatedLogs = computed(() => {
  if (pageSize.value === -1) return filteredLogs.value
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

const logStats = computed(() => {
  const stats = { debug: 0, info: 0, warn: 0, error: 0 }
  engine.logger.getLogs().forEach(log => {
    if (stats.hasOwnProperty(log.level)) {
      stats[log.level as keyof typeof stats]++
    }
  })
  return stats
})

const memoryUsage = computed(() => {
  const logs = engine.logger.getLogs()
  const size = JSON.stringify(logs).length
  return `${(size / 1024).toFixed(1)} KB`
})

// 方法
const addLog = () => {
  if (!newLog.value.message.trim()) {
    engine.notifications.show({
      type: 'error',
      title: '记录失败',
      message: '请输入日志消息'
    })
    return
  }
  
  try {
    let data: any = undefined
    if (newLog.value.data.trim()) {
      data = JSON.parse(newLog.value.data)
    }
    
    engine.logger[newLog.value.level](newLog.value.message, data)
    
    // 重置表单
    newLog.value.message = ''
    newLog.value.data = ''
    
    engine.notifications.show({
      type: 'success',
      title: '记录成功',
      message: `${newLog.value.level.toUpperCase()} 日志已记录`
    })
    
  } catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '记录失败',
      message: `数据格式错误: ${error}`
    })
  }
}

const addBatchLogs = () => {
  const messages = [
    { level: 'debug', message: '调试信息：用户登录流程开始', data: { userId: 123, ip: '192.168.1.1' } },
    { level: 'info', message: '用户登录成功', data: { userId: 123, username: 'testuser' } },
    { level: 'warn', message: '检测到异常登录尝试', data: { ip: '192.168.1.100', attempts: 3 } },
    { level: 'error', message: '数据库连接失败', data: { error: 'Connection timeout', retries: 3 } },
    { level: 'info', message: '系统性能监控报告', data: { cpu: '45%', memory: '67%', disk: '23%' } },
    { level: 'debug', message: 'API请求处理', data: { endpoint: '/api/users', method: 'GET', duration: 120 } },
    { level: 'warn', message: '缓存命中率较低', data: { hitRate: 0.65, threshold: 0.8 } },
    { level: 'error', message: '支付处理失败', data: { orderId: 'ORD-001', amount: 99.99, reason: 'Card declined' } }
  ]
  
  messages.forEach((msg, index) => {
    setTimeout(() => {
      engine.logger[msg.level as keyof typeof engine.logger](msg.message, msg.data)
    }, index * 200)
  })
  
  engine.notifications.show({
    type: 'info',
    title: '批量测试',
    message: `正在生成 ${messages.length} 条测试日志`
  })
}

const updateLogLevel = () => {
  engine.logger.setLevel(currentLevel.value as any)
  engine.notifications.show({
    type: 'info',
    title: '级别更新',
    message: `日志级别已设置为 ${currentLevel.value.toUpperCase()}`
  })
}

const updateMaxLogs = () => {
  engine.logger.setMaxLogs(maxLogs.value)
  engine.notifications.show({
    type: 'info',
    title: '配置更新',
    message: `最大日志数量已设置为 ${maxLogs.value}`
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  levelFilters.value = {
    debug: true,
    info: true,
    warn: true,
    error: true
  }
  timeRange.value = {
    start: '',
    end: ''
  }
  currentPage.value = 1
}

const clearAllLogs = () => {
  engine.logger.clear()
  currentPage.value = 1
  
  engine.notifications.show({
    type: 'warning',
    title: '日志清空',
    message: '所有日志已清空'
  })
}

const clearByLevel = () => {
  const logs = engine.logger.getLogs()
  const filteredLogs = logs.filter(log => log.level !== clearLevel.value)
  
  engine.logger.clear()
  filteredLogs.forEach(log => {
    engine.logger[log.level as keyof typeof engine.logger](log.message, ...log.data)
  })
  
  engine.notifications.show({
    type: 'warning',
    title: '按级别清空',
    message: `${clearLevel.value.toUpperCase()} 级别的日志已清空`
  })
}

const clearOldLogs = () => {
  const cutoffTime = Date.now() - (retentionDays.value * 24 * 60 * 60 * 1000)
  const logs = engine.logger.getLogs()
  const recentLogs = logs.filter(log => log.timestamp >= cutoffTime)
  
  const removedCount = logs.length - recentLogs.length
  
  engine.logger.clear()
  recentLogs.forEach(log => {
    engine.logger[log.level as keyof typeof engine.logger](log.message, ...log.data)
  })
  
  engine.notifications.show({
    type: 'info',
    title: '清理完成',
    message: `已清理 ${removedCount} 条旧日志`
  })
}

const refreshLogs = () => {
  // 强制重新计算
  currentPage.value = 1
  
  engine.notifications.show({
    type: 'info',
    title: '刷新完成',
    message: '日志列表已刷新'
  })
}

const exportLogs = () => {
  const data = {
    logs: engine.logger.getLogs(),
    stats: logStats.value,
    config: {
      level: currentLevel.value,
      maxLogs: maxLogs.value
    },
    exportTime: Date.now()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '日志已导出到文件'
  })
}

const exportFilteredLogs = () => {
  const data = {
    logs: filteredLogs.value,
    filters: {
      search: searchQuery.value,
      levels: levelFilters.value,
      timeRange: timeRange.value
    },
    exportTime: Date.now()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `filtered-logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '过滤后的日志已导出'
  })
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatLogData = (data: any) => {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return String(data)
}

const getBarHeight = (count: number) => {
  const maxCount = Math.max(...Object.values(logStats.value))
  return maxCount > 0 ? (count / maxCount) * 100 : 0
}

// 监听自动滚动
watch([paginatedLogs, autoScroll], () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
}, { deep: true })

// 监听实时模式
watch(realTimeMode, (enabled) => {
  if (enabled) {
    updateInterval.value = setInterval(() => {
      // 触发重新计算
      if (autoScroll.value && logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    }, updateFrequency.value)
  } else {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
    }
  }
})

onMounted(() => {
  // 初始化配置
  currentLevel.value = engine.logger.getLevel()
  maxLogs.value = engine.logger.getMaxLogs()
  
  // 启动实时监控
  if (realTimeMode.value) {
    updateInterval.value = setInterval(() => {
      if (autoScroll.value && logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    }, updateFrequency.value)
  }
  
  engine.logger.info('日志系统演示页面已加载')
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style scoped>
.logger-demo {
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
  margin-bottom: 0.5rem;
}

.checkbox-label input[type="checkbox"] {
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #229954;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #e67e22;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.config-info {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.info-value {
  font-weight: 500;
  color: #2c3e50;
}

.level-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.level-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.level-debug {
  background: #e3f2fd;
  color: #1976d2;
}

.level-info {
  background: #e8f5e8;
  color: #388e3c;
}

.level-warn {
  background: #fff3e0;
  color: #f57c00;
}

.level-error {
  background: #ffebee;
  color: #d32f2f;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-range span {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.chart-title {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 150px;
  gap: 1rem;
}

.chart-bar {
  flex: 1;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
}

.bar-label {
  position: absolute;
  top: -20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c3e50;
}

.management-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.monitor-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.monitor-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.monitor-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-value.active {
  color: #27ae60;
  font-weight: 500;
}

.stat-value.inactive {
  color: #e74c3c;
  font-weight: 500;
}

.log-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-info {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.log-display {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
}

.log-entry {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #e9ecef;
  background: white;
}

.log-entry.log-debug {
  border-left-color: #2196f3;
}

.log-entry.log-info {
  border-left-color: #4caf50;
}

.log-entry.log-warn {
  border-left-color: #ff9800;
}

.log-entry.log-error {
  border-left-color: #f44336;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.log-level-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 60px;
  text-align: center;
}

.log-timestamp {
  font-size: 0.75rem;
  color: #7f8c8d;
  font-family: 'Courier New', monospace;
}

.log-message {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.log-data {
  margin-top: 0.5rem;
}

.log-data-item {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.log-data-item:last-child {
  margin-bottom: 0;
}

.log-data-item pre {
  margin: 0;
  font-size: 0.75rem;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-logs {
  text-align: center;
  color: #7f8c8d;
  padding: 3rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .time-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .log-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .chart-bars {
    height: 100px;
  }
}
</style>