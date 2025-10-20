<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { type DebugLog, useTemplateDebugger } from '../composables/useTemplateDebugger'
import { useTemplatePerformance } from '../composables/useTemplatePerformance'
import { useTemplateSnapshot } from '../composables/useTemplateSnapshot'

interface Props {
  templateId?: string
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 面板状态
const visible = ref(props.modelValue ?? true)
const minimized = ref(false)
const activeTab = ref('logs')
// Chart canvas reference to satisfy vue/no-unused-refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)

// 调试器实例
const templateDebugger = props.templateId ? useTemplateDebugger(props.templateId) : null
const snapshot = props.templateId
  ? useTemplateSnapshot(props.templateId, {
      maxSnapshots: 20,
      autoSave: true
    })
  : null
const performance = props.templateId ? useTemplatePerformance(props.templateId) : null

// 日志相关
const logFilter = ref<string>('all')
const logSearch = ref('')
const logs = ref<DebugLog[]>([])

// 状态相关
const templateState = ref<any>({})
const templateProps = ref<any>({})
const currentTemplate = ref(props.templateId)

// 快照历史
const snapshotHistory = computed(() => {
  return snapshot?.snapshots.value || []
})

// 性能数据
const performanceData = ref({
  renderTime: 0,
  loadTime: 0,
  memory: 0,
  componentCount: 0
})

// 事件历史
const eventHistory = ref<any[]>([])

// 分析数据
const analyticsData = ref({
  totalRenders: 0,
  errorCount: 0,
  avgResponseTime: 0,
  interactions: 0,
  recommendations: [] as Array<{ message: string; priority: string }>
})

// 标签页配置
const tabs = [
  { id: 'logs', label: 'Logs', icon: '📋' },
  { id: 'state', label: 'State', icon: '🔍' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'events', label: 'Events', icon: '📡' },
  { id: 'analytics', label: 'Analytics', icon: '📊' }
]

// 过滤日志
const filteredLogs = computed(() => {
  let result = logs.value

  if (logFilter.value !== 'all') {
    result = result.filter((log) => log.level === logFilter.value)
  }

  if (logSearch.value) {
    const search = logSearch.value.toLowerCase()
    result = result.filter(
      (log) =>
        log.message.toLowerCase().includes(search) ||
        JSON.stringify(log.data).toLowerCase().includes(search)
    )
  }

  return result.slice(-100) // 最多显示100条
})

// 工具函数
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

const formatData = (data: any) => {
  if (data === undefined) return ''
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

const formatJSON = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// 操作函数
const clearLogs = () => {
  logs.value = []
  templateDebugger?.clearLogs()
}

const clearEvents = () => {
  eventHistory.value = []
}

const restoreSnapshot = (index: number) => {
  if (snapshot) {
    snapshot.gotoIndex(index)
    templateDebugger?.info(`Restored to snapshot #${index}`)
  }
}

// 监听调试器日志
const collectLogs = () => {
  if (templateDebugger) {
    logs.value = templateDebugger.getLogs()
  }
}

// 收集性能数据
const collectPerformance = () => {
  if (performance) {
    const metrics = performance.getMetrics()
    performanceData.value = {
      renderTime: Math.round(metrics.renderTime || 0),
      loadTime: Math.round(metrics.loadTime || 0),
      memory: Math.round((performance.memory.value || 0) / 1024 / 1024),
      componentCount: metrics.componentCount || 0
    }
  }
}

// 收集状态数据
const collectState = () => {
  if (templateDebugger) {
    // takeSnapshot 不返回值，这里我们使用最新的快照数据
    const snapshots = templateDebugger.stateSnapshots.value
    if (snapshots.length > 0) {
      const latestSnapshot = snapshots[snapshots.length - 1]
      templateState.value = latestSnapshot.state || {}
      templateProps.value = latestSnapshot.props || {}
    }
  }
}

// 定时刷新
let refreshTimer: number | null = null

const startRefresh = () => {
  refreshTimer = window.setInterval(() => {
    collectLogs()
    collectPerformance()
    collectState()
  }, 1000)
}

const stopRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 监听可见性
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    startRefresh()
  } else {
    stopRefresh()
  }
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val ?? true
  }
)

// 生命周期
onMounted(() => {
  if (visible.value) {
    startRefresh()
  }
  // Access the chart canvas to mark the ref as used
  if (chartCanvas.value) {
    chartCanvas.value.getContext('2d')
  }
})

onUnmounted(() => {
  stopRefresh()
})

// 暴露API
defineExpose({
  show: () => (visible.value = true),
  hide: () => (visible.value = false),
  toggle: () => (visible.value = !visible.value),
  minimize: () => (minimized.value = true),
  maximize: () => (minimized.value = false)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="template-dev-panel" :class="{ minimized }">
      <!-- 面板头部 -->
      <div class="dev-panel-header">
        <div class="header-left">
          <h3>🛠️ Template Dev Panel</h3>
          <span class="template-name">{{ currentTemplate || 'No Template' }}</span>
        </div>
        <div class="header-actions">
          <button class="btn-icon" title="最小化/还原" @click="minimized = !minimized">
            {{ minimized ? '□' : '−' }}
          </button>
          <button class="btn-icon" title="关闭" @click="visible = false">
            ✕
          </button>
        </div>
      </div>

      <!-- 面板内容 -->
      <div v-show="!minimized" class="dev-panel-content">
        <!-- 标签页导航 -->
        <div class="tab-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn" :class="[{ active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- 调试日志 -->
        <div v-show="activeTab === 'logs'" class="tab-content">
          <div class="toolbar">
            <select v-model="logFilter" class="filter-select">
              <option value="all">
                All Levels
              </option>
              <option value="error">
                Errors
              </option>
              <option value="warn">
                Warnings
              </option>
              <option value="info">
                Info
              </option>
              <option value="debug">
                Debug
              </option>
            </select>
            <input
              v-model="logSearch"
              type="text"
              placeholder="搜索日志..."
              class="search-input"
            >
            <button class="btn-clear" @click="clearLogs">
              清空
            </button>
          </div>
          <div class="logs-container">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-item" :class="[`log-${log.level}`]"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.data" class="log-data">{{ formatData(log.data) }}</span>
            </div>
          </div>
        </div>

        <!-- 状态检查器 -->
        <div v-show="activeTab === 'state'" class="tab-content">
          <div class="state-inspector">
            <div class="state-section">
              <h4>Template State</h4>
              <pre class="code-block">{{ formatJSON(templateState) }}</pre>
            </div>
            <div class="state-section">
              <h4>Props</h4>
              <pre class="code-block">{{ formatJSON(templateProps) }}</pre>
            </div>
            <div class="state-section">
              <h4>Snapshot History</h4>
              <div class="snapshot-list">
                <div
                  v-for="(snap, idx) in snapshotHistory"
                  :key="idx"
                  class="snapshot-item"
                  @click="restoreSnapshot(idx)"
                >
                  <span class="snapshot-time">{{ formatTime(snap.timestamp) }}</span>
                  <span class="snapshot-desc">{{ snap.description || 'Snapshot' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 性能监控 -->
        <div v-show="activeTab === 'performance'" class="tab-content">
          <div class="perf-metrics">
            <div class="metric-card">
              <div class="metric-label">
                渲染时间
              </div>
              <div class="metric-value">
                {{ performanceData.renderTime }}ms
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-label">
                加载时间
              </div>
              <div class="metric-value">
                {{ performanceData.loadTime }}ms
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-label">
                内存使用
              </div>
              <div class="metric-value">
                {{ performanceData.memory }}MB
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-label">
                组件数量
              </div>
              <div class="metric-value">
                {{ performanceData.componentCount }}
              </div>
            </div>
          </div>
          <div class="perf-chart">
            <h4>性能趋势</h4>
            <canvas ref="chartCanvas" width="600" height="200" />
          </div>
        </div>

        <!-- 事件监听器 -->
        <div v-show="activeTab === 'events'" class="tab-content">
          <div class="toolbar">
            <button class="btn-clear" @click="clearEvents">
              清空事件
            </button>
          </div>
          <div class="events-container">
            <div
              v-for="(event, index) in eventHistory"
              :key="index"
              class="event-item"
            >
              <span class="event-time">{{ formatTime(event.timestamp) }}</span>
              <span class="event-type">{{ event.type }}</span>
              <span class="event-payload">{{ formatData(event.payload) }}</span>
            </div>
          </div>
        </div>

        <!-- 分析报告 -->
        <div v-show="activeTab === 'analytics'" class="tab-content">
          <div class="analytics-summary">
            <h4>使用统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">
                  总渲染次数
                </div>
                <div class="stat-value">
                  {{ analyticsData.totalRenders }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">
                  错误次数
                </div>
                <div class="stat-value error">
                  {{ analyticsData.errorCount }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">
                  平均响应时间
                </div>
                <div class="stat-value">
                  {{ analyticsData.avgResponseTime }}ms
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">
                  用户交互
                </div>
                <div class="stat-value">
                  {{ analyticsData.interactions }}
                </div>
              </div>
            </div>
          </div>
          <div class="recommendations">
            <h4>优化建议</h4>
            <ul class="recommendation-list">
              <li
                v-for="(rec, idx) in analyticsData.recommendations"
                :key="idx"
                class="recommendation-item" :class="[`priority-${rec.priority}`]"
              >
                {{ rec.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.template-dev-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 800px;
  max-width: 90vw;
  height: 500px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #3c3c3c;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  z-index: 99999;
  transition: height 0.3s;
}

.template-dev-panel.minimized {
  height: 40px;
}

.dev-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  cursor: move;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.template-name {
  color: #4ec9b0;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #d4d4d4;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #3c3c3c;
}

.dev-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-nav {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #2d2d30;
  border-bottom: 1px solid #3c3c3c;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #d4d4d4;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #3c3c3c;
}

.tab-btn.active {
  background: #007acc;
  color: white;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.filter-select,
.search-input {
  background: #3c3c3c;
  border: 1px solid #555;
  color: #d4d4d4;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.search-input {
  flex: 1;
}

.btn-clear {
  background: #c5383a;
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #e53935;
}

/* 日志样式 */
.logs-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  margin-bottom: 2px;
  border-left: 3px solid transparent;
  border-radius: 2px;
  font-family: 'Consolas', monospace;
}

.log-item:hover {
  background: #2d2d30;
}

.log-error {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.log-warn {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.log-info {
  border-left-color: #2196f3;
}

.log-debug {
  border-left-color: #9e9e9e;
  opacity: 0.7;
}

.log-time {
  color: #858585;
  min-width: 80px;
}

.log-level {
  font-weight: bold;
  min-width: 50px;
}

.log-message {
  flex: 1;
}

.log-data {
  color: #4ec9b0;
  font-size: 10px;
}

/* 状态检查器样式 */
.state-inspector {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.state-section {
  margin-bottom: 16px;
}

.state-section h4 {
  margin: 0 0 8px 0;
  color: #4ec9b0;
  font-size: 13px;
}

.code-block {
  background: #252526;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #3c3c3c;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshot-item {
  display: flex;
  gap: 8px;
  padding: 6px 12px;
  background: #252526;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.snapshot-item:hover {
  background: #3c3c3c;
}

.snapshot-time {
  color: #858585;
  min-width: 80px;
}

.snapshot-desc {
  color: #d4d4d4;
}

/* 性能监控样式 */
.perf-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px;
}

.metric-card {
  background: #252526;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #3c3c3c;
  text-align: center;
}

.metric-label {
  font-size: 11px;
  color: #858585;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #4ec9b0;
}

.perf-chart {
  padding: 12px;
}

.perf-chart h4 {
  margin: 0 0 12px 0;
  color: #4ec9b0;
}

/* 事件监听器样式 */
.events-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  display: flex;
  gap: 8px;
  padding: 6px 12px;
  margin-bottom: 4px;
  background: #252526;
  border-radius: 4px;
  border-left: 3px solid #4ec9b0;
}

.event-time {
  color: #858585;
  min-width: 80px;
}

.event-type {
  font-weight: bold;
  color: #4ec9b0;
  min-width: 120px;
}

.event-payload {
  color: #d4d4d4;
  font-size: 11px;
}

/* 分析报告样式 */
.analytics-summary {
  padding: 12px;
}

.analytics-summary h4 {
  margin: 0 0 12px 0;
  color: #4ec9b0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  background: #252526;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #3c3c3c;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #858585;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #4ec9b0;
}

.stat-value.error {
  color: #f44336;
}

.recommendations {
  padding: 0 12px 12px;
}

.recommendations h4 {
  margin: 0 0 12px 0;
  color: #4ec9b0;
}

.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-item {
  padding: 8px 12px;
  margin-bottom: 6px;
  background: #252526;
  border-radius: 4px;
  border-left: 3px solid #4ec9b0;
}

.recommendation-item.priority-high {
  border-left-color: #f44336;
}

.recommendation-item.priority-medium {
  border-left-color: #ff9800;
}

.recommendation-item.priority-low {
  border-left-color: #2196f3;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}
</style>
