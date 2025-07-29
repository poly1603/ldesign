<template>
  <div class="demo-page">
    <header class="page-header">
      <h1>📡 事件系统演示</h1>
      <p>高效的事件管理，支持优先级和命名空间</p>
    </header>

    <section class="demo-section">
      <h2>基础事件操作</h2>
      <div class="demo-controls">
        <button class="btn btn-primary" @click="emitSimpleEvent">
          触发简单事件
        </button>
        <button class="btn btn-success" @click="emitDataEvent">
          触发带数据事件
        </button>
        <button class="btn btn-warning" @click="emitPriorityEvent">
          触发优先级事件
        </button>
        <button class="btn btn-info" @click="emitOnceEvent">
          触发一次性事件
        </button>
      </div>
    </section>

    <section class="demo-section">
      <h2>事件命名空间</h2>
      <div class="namespace-demo">
        <div class="namespace-group">
          <h3>用户命名空间</h3>
          <div class="demo-controls">
            <button class="btn btn-primary" @click="emitUserEvent('login')">
              用户登录
            </button>
            <button class="btn btn-secondary" @click="emitUserEvent('logout')">
              用户登出
            </button>
            <button class="btn btn-info" @click="emitUserEvent('profile-update')">
              更新资料
            </button>
          </div>
        </div>
        
        <div class="namespace-group">
          <h3>系统命名空间</h3>
          <div class="demo-controls">
            <button class="btn btn-success" @click="emitSystemEvent('startup')">
              系统启动
            </button>
            <button class="btn btn-warning" @click="emitSystemEvent('warning')">
              系统警告
            </button>
            <button class="btn btn-danger" @click="emitSystemEvent('error')">
              系统错误
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>事件统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ eventStats.totalEvents }}</h3>
          <p>注册事件数</p>
        </div>
        <div class="stat-card">
          <h3>{{ eventStats.totalListeners }}</h3>
          <p>监听器总数</p>
        </div>
        <div class="stat-card">
          <h3>{{ eventCount }}</h3>
          <p>触发次数</p>
        </div>
        <div class="stat-card">
          <h3>{{ maxListeners }}</h3>
          <p>最大监听器数</p>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>事件列表</h2>
      <div class="event-list">
        <div 
          v-for="(count, eventName) in eventStats.events" 
          :key="eventName"
          class="event-item"
        >
          <div class="event-info">
            <span class="event-name">{{ eventName }}</span>
            <span class="listener-count">{{ count }} 个监听器</span>
          </div>
          <div class="event-actions">
            <button class="btn btn-sm btn-primary" @click="triggerEvent(eventName)">
              触发
            </button>
            <button class="btn btn-sm btn-danger" @click="removeAllListeners(eventName)">
              清除监听器
            </button>
          </div>
        </div>
        <div v-if="Object.keys(eventStats.events).length === 0" class="empty-state">
          暂无注册的事件
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>事件日志</h2>
      <div class="log-controls">
        <button class="btn btn-secondary" @click="clearEventLogs">
          清空日志
        </button>
        <button class="btn btn-info" @click="toggleAutoScroll">
          {{ autoScroll ? '关闭' : '开启' }}自动滚动
        </button>
      </div>
      <div class="event-logs" ref="logsContainer">
        <div 
          v-for="log in eventLogs" 
          :key="log.id"
          :class="`log-entry log-${log.type}`"
        >
          <span class="log-time">[{{ formatTime(log.timestamp) }}]</span>
          <span class="log-event">{{ log.event }}</span>
          <span class="log-data" v-if="log.data">{{ JSON.stringify(log.data) }}</span>
        </div>
        <div v-if="eventLogs.length === 0" class="empty-state">
          暂无事件日志
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, nextTick } from 'vue'
import type { Engine } from '@ldesign/engine'

const engine = inject<Engine>('engine')!

const eventCount = ref(0)
const eventStats = ref({ totalEvents: 0, totalListeners: 0, events: {} })
const eventLogs = ref<any[]>([])
const autoScroll = ref(true)
const logsContainer = ref<HTMLElement>()

const maxListeners = computed(() => engine.events.getMaxListeners())

const emitSimpleEvent = () => {
  engine.events.emit('demo:simple')
  logEvent('demo:simple', 'emit')
}

const emitDataEvent = () => {
  const data = {
    message: 'Hello Events!',
    timestamp: Date.now(),
    random: Math.random()
  }
  engine.events.emit('demo:data', data)
  logEvent('demo:data', 'emit', data)
}

const emitPriorityEvent = () => {
  engine.events.emit('demo:priority', { priority: 'high' })
  logEvent('demo:priority', 'emit', { priority: 'high' })
}

const emitOnceEvent = () => {
  engine.events.emit('demo:once')
  logEvent('demo:once', 'emit')
}

const emitUserEvent = (action: string) => {
  const userNamespace = engine.events.namespace('user')
  const data = { action, userId: 123, timestamp: Date.now() }
  userNamespace.emit(action, data)
  logEvent(`user:${action}`, 'emit', data)
}

const emitSystemEvent = (type: string) => {
  const systemNamespace = engine.events.namespace('system')
  const data = { type, level: type === 'error' ? 'critical' : 'normal', timestamp: Date.now() }
  systemNamespace.emit(type, data)
  logEvent(`system:${type}`, 'emit', data)
}

const triggerEvent = (eventName: string) => {
  engine.events.emit(eventName, { triggered: true, timestamp: Date.now() })
  logEvent(eventName, 'trigger')
}

const removeAllListeners = (eventName: string) => {
  engine.events.removeAllListeners(eventName)
  updateStats()
  logEvent(eventName, 'clear-listeners')
}

const clearEventLogs = () => {
  eventLogs.value = []
}

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

const logEvent = (event: string, type: string, data?: any) => {
  eventCount.value++
  eventLogs.value.push({
    id: Date.now() + Math.random(),
    event,
    type,
    data,
    timestamp: Date.now()
  })
  
  // 限制日志数量
  if (eventLogs.value.length > 100) {
    eventLogs.value = eventLogs.value.slice(-100)
  }
  
  // 自动滚动
  if (autoScroll.value) {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    })
  }
}

const updateStats = () => {
  eventStats.value = engine.events.getStats()
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  // 注册演示事件监听器
  engine.events.on('demo:simple', () => {
    logEvent('demo:simple', 'received')
    engine.logger.info('收到简单事件')
  })
  
  engine.events.on('demo:data', (data) => {
    logEvent('demo:data', 'received', data)
    engine.logger.info('收到数据事件:', data)
  })
  
  // 优先级事件监听器
  engine.events.on('demo:priority', (data) => {
    logEvent('demo:priority', 'received-low', data)
  }, 1) // 低优先级
  
  engine.events.on('demo:priority', (data) => {
    logEvent('demo:priority', 'received-high', data)
  }, 10) // 高优先级
  
  // 一次性事件监听器
  engine.events.once('demo:once', () => {
    logEvent('demo:once', 'received-once')
    engine.logger.info('收到一次性事件（只会触发一次）')
  })
  
  // 用户命名空间事件
  const userNamespace = engine.events.namespace('user')
  userNamespace.on('login', (data) => {
    logEvent('user:login', 'received', data)
    engine.logger.info('用户登录:', data)
  })
  
  userNamespace.on('logout', (data) => {
    logEvent('user:logout', 'received', data)
    engine.logger.info('用户登出:', data)
  })
  
  userNamespace.on('profile-update', (data) => {
    logEvent('user:profile-update', 'received', data)
    engine.logger.info('用户资料更新:', data)
  })
  
  // 系统命名空间事件
  const systemNamespace = engine.events.namespace('system')
  systemNamespace.on('startup', (data) => {
    logEvent('system:startup', 'received', data)
    engine.logger.info('系统启动:', data)
  })
  
  systemNamespace.on('warning', (data) => {
    logEvent('system:warning', 'received', data)
    engine.logger.warn('系统警告:', data)
  })
  
  systemNamespace.on('error', (data) => {
    logEvent('system:error', 'received', data)
    engine.logger.error('系统错误:', data)
  })
  
  // 定期更新统计信息
  const updateInterval = setInterval(updateStats, 1000)
  updateStats()
  
  // 清理函数
  return () => {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.namespace-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.namespace-group h3 {
  margin-bottom: 1rem;
  color: #34495e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-card h3 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #3498db;
}

.stat-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.875rem;
}

.event-list {
  max-height: 400px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.event-item:last-child {
  border-bottom: none;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-name {
  font-weight: 500;
  color: #2c3e50;
}

.listener-count {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.log-controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.event-logs {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #7f8c8d;
  min-width: 80px;
}

.log-event {
  color: #2c3e50;
  font-weight: 500;
  min-width: 120px;
}

.log-data {
  color: #27ae60;
  flex: 1;
  word-break: break-all;
}

.log-emit {
  background: #e8f5e8;
}

.log-received {
  background: #e3f2fd;
}

.log-trigger {
  background: #fff3e0;
}

.log-clear-listeners {
  background: #ffebee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
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

.empty-state {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
}
</style>