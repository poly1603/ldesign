<template>
  <div v-if="show" :class="['performance-monitor', `position-${position}`, { minimized }]">
    <!-- 头部 -->
    <div class="monitor-header">
      <h3 class="monitor-title">
        <span class="icon">📊</span>
        性能监控
      </h3>
      <div class="monitor-actions">
        <button 
          class="action-btn" 
          :title="minimized ? '展开' : '最小化'"
          @click="toggleMinimize"
        >
          {{ minimized ? '▲' : '▼' }}
        </button>
        <button 
          class="action-btn" 
          title="导出报告"
          @click="exportReport"
        >
          💾
        </button>
        <button 
          class="action-btn" 
          title="刷新"
          @click="refresh"
        >
          🔄
        </button>
        <button 
          class="action-btn close-btn" 
          title="关闭"
          @click="close"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="!minimized" class="monitor-content">
      <!-- 概览卡片 -->
      <div v-if="metrics.includes('overview')" class="metric-card overview-card">
        <h4 class="card-title">系统概览</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <span class="metric-label">设备类型</span>
            <span class="metric-value">{{ deviceInfo.current }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">窗口宽度</span>
            <span class="metric-value">{{ deviceInfo.width }}px</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">匹配模式</span>
            <span class="metric-value">
              {{ deviceInfo.useMatchMedia ? 'matchMedia' : 'resize' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 加载器统计 -->
      <div v-if="metrics.includes('loader')" class="metric-card">
        <h4 class="card-title">组件加载</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <span class="metric-label">成功率</span>
            <span :class="['metric-value', getStatusClass(loaderStats.successRate)]">
              {{ loaderStats.successRate.toFixed(1) }}%
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">缓存命中率</span>
            <span :class="['metric-value', getStatusClass(loaderStats.cacheHitRate)]">
              {{ loaderStats.cacheHitRate.toFixed(1) }}%
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">平均加载时间</span>
            <span class="metric-value">{{ loaderStats.avgLoadTime.toFixed(0) }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">活跃加载</span>
            <span class="metric-value">{{ loaderInfo.activeLoading }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">队列任务</span>
            <span class="metric-value">{{ loaderInfo.queuedTasks }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">并发利用率</span>
            <span class="metric-value">{{ loaderInfo.utilization.toFixed(0) }}%</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-bars">
          <div class="progress-item">
            <span class="progress-label">成功率</span>
            <div class="progress-bar">
              <div 
                class="progress-fill success" 
                :style="{ width: `${loaderStats.successRate}%` }"
              />
            </div>
          </div>
          <div class="progress-item">
            <span class="progress-label">缓存命中率</span>
            <div class="progress-bar">
              <div 
                class="progress-fill cache" 
                :style="{ width: `${loaderStats.cacheHitRate}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 缓存统计 -->
      <div v-if="metrics.includes('cache')" class="metric-card">
        <h4 class="card-title">缓存状态</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <span class="metric-label">当前项数</span>
            <span class="metric-value">{{ cacheStats.currentItems }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">当前大小</span>
            <span class="metric-value">{{ formatBytes(cacheStats.currentSize) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">命中数</span>
            <span class="metric-value">{{ cacheStats.hits }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">未命中数</span>
            <span class="metric-value">{{ cacheStats.misses }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">驱逐次数</span>
            <span class="metric-value">{{ cacheStats.evictions }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">平均访问时间</span>
            <span class="metric-value">{{ cacheStats.avgAccessTime.toFixed(2) }}ms</span>
          </div>
        </div>
      </div>

      <!-- 错误统计 -->
      <div v-if="metrics.includes('errors')" class="metric-card">
        <h4 class="card-title">错误统计</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <span class="metric-label">总错误数</span>
            <span :class="['metric-value', errorStats.total > 0 ? 'error' : '']">
              {{ errorStats.total }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">严重错误</span>
            <span :class="['metric-value', errorStats.bySeverity.critical > 0 ? 'critical' : '']">
              {{ errorStats.bySeverity.critical }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">高级错误</span>
            <span :class="['metric-value', errorStats.bySeverity.high > 0 ? 'error' : '']">
              {{ errorStats.bySeverity.high }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">可恢复</span>
            <span class="metric-value">{{ errorStats.recoverable }}</span>
          </div>
        </div>
      </div>

      <!-- 内存使用 (如果支持) -->
      <div v-if="metrics.includes('memory') && memoryInfo" class="metric-card">
        <h4 class="card-title">内存使用</h4>
        <div class="metric-grid">
          <div class="metric-item">
            <span class="metric-label">已用内存</span>
            <span class="metric-value">{{ formatBytes(memoryInfo.usedJSHeapSize) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">总内存</span>
            <span class="metric-value">{{ formatBytes(memoryInfo.totalJSHeapSize) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">内存限制</span>
            <span class="metric-value">{{ formatBytes(memoryInfo.jsHeapSizeLimit) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">使用率</span>
            <span :class="['metric-value', getMemoryStatusClass(memoryInfo.ratio)]">
              {{ (memoryInfo.ratio * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
        
        <div class="progress-item">
          <div class="progress-bar">
            <div 
              :class="['progress-fill', 'memory', getMemoryStatusClass(memoryInfo.ratio)]"
              :style="{ width: `${memoryInfo.ratio * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- 实时图表 (简化版) -->
      <div v-if="showCharts" class="metric-card chart-card">
        <h4 class="card-title">性能趋势</h4>
        <div class="chart-container">
          <div class="chart-line">
            <span class="chart-label">加载时间</span>
            <div class="chart-bars">
              <div 
                v-for="(value, index) in loadTimeHistory" 
                :key="index"
                class="chart-bar"
                :style="{ height: `${(value / maxLoadTime) * 100}%` }"
                :title="`${value.toFixed(0)}ms`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div v-if="!minimized" class="monitor-footer">
      <span class="footer-text">
        更新时间: {{ lastUpdate }}
      </span>
      <span class="footer-text">
        刷新间隔: {{ refreshInterval }}ms
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { DeviceAdapter } from '../core/device-adapter'
import type { ComponentLoader } from '../utils/loader'
import type { ErrorHandler } from '../utils/errors'

interface Props {
  show?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  metrics?: Array<'overview' | 'loader' | 'cache' | 'errors' | 'memory'>
  refreshInterval?: number
  showCharts?: boolean
  deviceAdapter?: DeviceAdapter
  componentLoader?: ComponentLoader
  errorHandler?: ErrorHandler
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  position: 'top-right',
  metrics: () => ['overview', 'loader', 'cache', 'errors'],
  refreshInterval: 1000,
  showCharts: true,
})

const emit = defineEmits<{
  close: []
  export: [data: any]
  refresh: []
}>()

// 状态
const minimized = ref(false)
const lastUpdate = ref('')
const deviceInfo = ref({
  current: 'desktop',
  width: 0,
  useMatchMedia: false,
})

const loaderStats = ref({
  successRate: 0,
  cacheHitRate: 0,
  avgLoadTime: 0,
  total: 0,
  success: 0,
  failed: 0,
  cached: 0,
})

const loaderInfo = ref({
  activeLoading: 0,
  queuedTasks: 0,
  utilization: 0,
})

const cacheStats = ref({
  currentItems: 0,
  currentSize: 0,
  hits: 0,
  misses: 0,
  evictions: 0,
  avgAccessTime: 0,
})

const errorStats = ref({
  total: 0,
  bySeverity: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  recoverable: 0,
})

const memoryInfo = ref<{
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  ratio: number
} | null>(null)

const loadTimeHistory = ref<number[]>([])
const maxLoadTime = ref(1000)
const maxHistoryLength = 20

let intervalId: number | null = null

// 计算属性
const formattedLastUpdate = computed(() => lastUpdate.value)

// 方法
function toggleMinimize() {
  minimized.value = !minimized.value
}

function close() {
  emit('close')
}

function refresh() {
  updateMetrics()
  emit('refresh')
}

function exportReport() {
  const report = {
    timestamp: new Date().toISOString(),
    device: deviceInfo.value,
    loader: { ...loaderStats.value, info: loaderInfo.value },
    cache: cacheStats.value,
    errors: errorStats.value,
    memory: memoryInfo.value,
    history: loadTimeHistory.value,
  }
  
  emit('export', report)
  
  // 下载 JSON 文件
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function updateMetrics() {
  lastUpdate.value = new Date().toLocaleTimeString()

  // 更新设备信息
  if (props.deviceAdapter) {
    deviceInfo.value = props.deviceAdapter.getDeviceInfo()
  }

  // 更新加载器统计
  if (props.componentLoader) {
    const stats = props.componentLoader.getLoadingStats()
    loaderStats.value = {
      successRate: stats.stats.successRate,
      cacheHitRate: stats.stats.cacheHitRate,
      avgLoadTime: stats.stats.avgLoadTime,
      total: stats.stats.total,
      success: stats.stats.success,
      failed: stats.stats.failed,
      cached: stats.stats.cached,
    }

    const loadInfo = props.componentLoader.getLoadInfo()
    loaderInfo.value = {
      activeLoading: stats.activeLoading,
      queuedTasks: stats.queuedTasks,
      utilization: loadInfo.concurrency.utilization,
    }

    // 更新加载时间历史
    if (stats.stats.avgLoadTime > 0) {
      loadTimeHistory.value.push(stats.stats.avgLoadTime)
      if (loadTimeHistory.value.length > maxHistoryLength) {
        loadTimeHistory.value.shift()
      }
      maxLoadTime.value = Math.max(...loadTimeHistory.value, 100)
    }

    // 更新缓存统计
    cacheStats.value = stats.cacheStats
  }

  // 更新错误统计
  if (props.errorHandler) {
    errorStats.value = props.errorHandler.getStats()
  }

  // 更新内存信息
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory
    memoryInfo.value = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      ratio: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function getStatusClass(value: number): string {
  if (value >= 90) return 'success'
  if (value >= 70) return 'warning'
  return 'error'
}

function getMemoryStatusClass(ratio: number): string {
  if (ratio < 0.7) return 'success'
  if (ratio < 0.85) return 'warning'
  return 'critical'
}

// 生命周期
onMounted(() => {
  updateMetrics()
  intervalId = window.setInterval(updateMetrics, props.refreshInterval)
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
})

watch(() => props.refreshInterval, (newInterval) => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
  intervalId = window.setInterval(updateMetrics, newInterval)
})
</script>

<style scoped lang="less">
.performance-monitor {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 300px;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &.position-top-right {
    top: 20px;
    right: 20px;
  }

  &.position-top-left {
    top: 20px;
    left: 20px;
  }

  &.position-bottom-right {
    bottom: 20px;
    right: 20px;
  }

  &.position-bottom-left {
    bottom: 20px;
    left: 20px;
  }

  &.position-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &.minimized {
    min-width: 250px;
    max-height: 60px;
  }
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.monitor-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 18px;
  }
}

.monitor-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.close-btn:hover {
    background: rgba(239, 68, 68, 0.8);
  }
}

.monitor-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    margin-bottom: 0;
  }
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;

  &.success {
    color: #10b981;
  }

  &.warning {
    color: #f59e0b;
  }

  &.error {
    color: #ef4444;
  }

  &.critical {
    color: #dc2626;
  }
}

.progress-bars {
  margin-top: 16px;
}

.progress-item {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.progress-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;

  &.success {
    background: linear-gradient(90deg, #10b981, #059669);
  }

  &.cache {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }

  &.memory {
    background: linear-gradient(90deg, #8b5cf6, #7c3aed);

    &.warning {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    &.critical {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }
  }
}

.chart-container {
  margin-top: 12px;
}

.chart-line {
  margin-bottom: 16px;
}

.chart-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 60px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}

.monitor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: #f9fafb;
  font-size: 11px;
  color: #6b7280;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .performance-monitor {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .metric-card {
    background: rgba(55, 65, 81, 0.5);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .card-title {
    color: #f3f4f6;
  }

  .metric-value {
    color: #f9fafb;
  }

  .monitor-footer {
    background: rgba(17, 24, 39, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .performance-monitor {
    max-width: calc(100vw - 40px);
    
    &.position-center {
      max-width: 90vw;
    }
  }

  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
