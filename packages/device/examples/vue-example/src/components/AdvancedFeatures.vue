<script setup>
import {
  useBattery,
  useDevice,
  useGeolocation,
  useNetwork,
} from '@ldesign/device/vue'
import { onMounted, onUnmounted, ref } from 'vue'

const { detector, deviceInfo } = useDevice()
const { networkInfo } = useNetwork()
const { batteryInfo } = useBattery()
const {
  position,
  isSupported: geoSupported,
  getCurrentPosition,
  startWatching,
  stopWatching,
  isWatching,
} = useGeolocation()

// 响应式数据
const logs = ref([])
const autoRefresh = ref(false)
const refreshInterval = ref(null)
const eventCounts = ref({
  deviceChange: 0,
  orientationChange: 0,
  resize: 0,
  networkChange: 0,
  batteryChange: 0,
})

// 添加日志
function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift({
    id: Date.now(),
    timestamp,
    message,
    type,
  })

  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 清空日志
function clearLogs() {
  logs.value = []
  Object.keys(eventCounts.value).forEach((key) => {
    eventCounts.value[key] = 0
  })
  addLog('日志已清空', 'info')
}

// 模拟设备变化
function simulateDeviceChange() {
  addLog('模拟设备变化事件...', 'info')

  // 触发 resize 事件
  const resizeEvent = new Event('resize')
  window.dispatchEvent(resizeEvent)

  setTimeout(() => {
    addLog('设备变化模拟完成', 'success')
  }, 100)
}

// 获取当前位置
async function getCurrentPos() {
  try {
    addLog('正在获取当前位置...', 'info')
    await getCurrentPosition()
    if (position.value) {
      addLog(
        `位置获取成功: ${position.value.latitude.toFixed(
          6,
        )}, ${position.value.longitude.toFixed(6)}`,
        'success',
      )
    }
  }
  catch (error) {
    addLog(`位置获取失败: ${error.message}`, 'error')
  }
}

// 开始位置监听
function startLocationWatching() {
  try {
    startWatching()
    addLog('开始监听位置变化', 'success')
  }
  catch (error) {
    addLog(`开始位置监听失败: ${error.message}`, 'error')
  }
}

// 停止位置监听
function stopLocationWatching() {
  try {
    stopWatching()
    addLog('停止位置监听', 'warning')
  }
  catch (error) {
    addLog(`停止位置监听失败: ${error.message}`, 'error')
  }
}

// 切换自动刷新
function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value

  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      if (detector) {
        detector.refresh()
        addLog('自动刷新设备信息', 'info')
      }
    }, 5000)
    addLog('开启自动刷新 (5秒间隔)', 'success')
  }
  else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
    addLog('关闭自动刷新', 'warning')
  }
}

// 导出设备信息
function exportDeviceInfo() {
  const data = {
    timestamp: new Date().toISOString(),
    deviceInfo: deviceInfo.value,
    networkInfo: networkInfo.value,
    batteryInfo: batteryInfo.value,
    position: position.value,
    eventCounts: eventCounts.value,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `device-info-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  addLog('设备信息已导出', 'success')
}

// 事件监听器
onMounted(() => {
  if (detector) {
    detector.on('deviceChange', () => {
      eventCounts.value.deviceChange++
      addLog('设备信息变化', 'info')
    })

    detector.on('orientationChange', (orientation) => {
      eventCounts.value.orientationChange++
      addLog(`屏幕方向变化: ${orientation}`, 'info')
    })

    detector.on('resize', ({ width, height }) => {
      eventCounts.value.resize++
      addLog(`窗口大小变化: ${width}×${height}`, 'info')
    })

    detector.on('networkChange', () => {
      eventCounts.value.networkChange++
      addLog('网络状态变化', 'success')
    })

    detector.on('batteryChange', () => {
      eventCounts.value.batteryChange++
      addLog('电池状态变化', 'success')
    })
  }

  addLog('高级功能组件初始化完成', 'success')
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="advanced-features">
    <div class="card">
      <h3>🚀 高级功能演示</h3>

      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="control-group">
          <h4>📍 地理位置控制</h4>
          <div class="controls">
            <button
              class="btn primary"
              :disabled="!geoSupported"
              @click="getCurrentPos"
            >
              📍 获取位置
            </button>
            <button
              class="btn secondary"
              :disabled="!geoSupported || isWatching"
              @click="startLocationWatching"
            >
              👁️ 开始监听
            </button>
            <button
              class="btn warning"
              :disabled="!geoSupported || !isWatching"
              @click="stopLocationWatching"
            >
              ⏹️ 停止监听
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>⚙️ 系统控制</h4>
          <div class="controls">
            <button
              class="btn"
              :class="{ active: autoRefresh }"
              @click="toggleAutoRefresh"
            >
              {{ autoRefresh ? '⏹️ 停止自动刷新' : '▶️ 开启自动刷新' }}
            </button>
            <button class="btn secondary" @click="simulateDeviceChange">
              📏 模拟设备变化
            </button>
            <button class="btn success" @click="exportDeviceInfo">
              💾 导出设备信息
            </button>
          </div>
        </div>
      </div>

      <!-- 事件统计 -->
      <div class="event-stats">
        <h4>📊 事件统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="label">设备变化:</span>
            <span class="value">{{ eventCounts.deviceChange }}</span>
          </div>
          <div class="stat-item">
            <span class="label">方向变化:</span>
            <span class="value">{{ eventCounts.orientationChange }}</span>
          </div>
          <div class="stat-item">
            <span class="label">窗口变化:</span>
            <span class="value">{{ eventCounts.resize }}</span>
          </div>
          <div class="stat-item">
            <span class="label">网络变化:</span>
            <span class="value">{{ eventCounts.networkChange }}</span>
          </div>
          <div class="stat-item">
            <span class="label">电池变化:</span>
            <span class="value">{{ eventCounts.batteryChange }}</span>
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="log-section">
        <div class="log-header">
          <h4>📋 实时日志</h4>
          <button class="btn small" @click="clearLogs">
            🗑️ 清空
          </button>
        </div>

        <div class="log-container">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-entry"
            :class="log.type"
          >
            <span class="timestamp">[{{ log.timestamp }}]</span>
            <span class="message">{{ log.message }}</span>
          </div>

          <div v-if="logs.length === 0" class="empty-log">
            暂无日志记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-features {
  margin-top: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6f42c1;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 24px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-panel {
  margin-bottom: 24px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #6c757d;
  color: white;
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn.primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.btn.secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.btn.success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.btn.warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
}

.btn.active {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.event-stats {
  margin-bottom: 24px;
}

.event-stats h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item .label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.stat-item .value {
  color: #6f42c1;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.log-section h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-container {
  background: #2d3748;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
}

.log-entry.info {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
}

.log-entry.success {
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
}

.log-entry.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.log-entry.error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.timestamp {
  color: #9ca3af;
  margin-right: 8px;
}

.empty-log {
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  padding: 20px;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
