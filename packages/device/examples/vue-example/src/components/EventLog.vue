<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const logs = ref([])
const logContainer = ref(null)
const autoScroll = ref(true)
const logIdCounter = ref(0)

// const { deviceDetector } = useDevice()

// 添加日志
function addLog(type, message, data = null) {
  const log = {
    id: ++logIdCounter.value,
    type,
    message,
    data,
    timestamp: new Date(),
  }

  logs.value.push(log)

  // 限制日志数量，避免内存溢出
  if (logs.value.length > 100) {
    logs.value.shift()
  }

  // 自动滚动到底部
  if (autoScroll.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 清空日志
function clearLogs() {
  logs.value = []
}

// 切换自动滚动
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部
function scrollToBottom() {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 获取日志图标
function getLogIcon(type) {
  const icons = {
    device: '📱',
    orientation: '🔄',
    resize: '📏',
    network: '🌐',
    battery: '🔋',
    geolocation: '📍',
    module: '🔧',
    error: '❌',
    info: 'ℹ️',
  }
  return icons[type] || '📝'
}

// 获取日志类型文本
function getLogTypeText(type) {
  const texts = {
    device: '设备检测',
    orientation: '方向变化',
    resize: '窗口调整',
    network: '网络状态',
    battery: '电池状态',
    geolocation: '地理位置',
    module: '模块操作',
    error: '错误',
    info: '信息',
  }
  return texts[type] || '未知'
}

// 格式化时间
function formatTime(timestamp) {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

// 格式化数据
function formatData(data) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return String(data)
}

// 设置事件监听器
function setupEventListeners() {
  // TODO: 实现事件监听器
  addLog('info', '事件监听器功能暂时禁用')
}

// 监听 deviceDetector 变化
// watch(() => deviceDetector.value, (newDetector) => {
//   if (newDetector) {
//     setupEventListeners()
//     addLog('info', '设备检测器已初始化')
//   }
// }, { immediate: true })

onMounted(() => {
  addLog('info', 'Vue 示例应用已启动')
  setupEventListeners()
})

onUnmounted(() => {
  // 清理事件监听器
  // if (deviceDetector.value) {
  //   deviceDetector.value.removeAllListeners()
  // }
})
</script>

<template>
  <div class="card">
    <div class="header">
      <h3>📋 事件日志</h3>
      <div class="controls">
        <button class="btn btn-secondary" @click="clearLogs">
          🗑️ 清空日志
        </button>
        <button
          class="btn"
          :class="autoScroll ? 'btn-primary' : 'btn-secondary'"
          @click="toggleAutoScroll"
        >
          {{ autoScroll ? '🔄' : '⏸️' }} 自动滚动
        </button>
      </div>
    </div>

    <div ref="logContainer" class="log-container">
      <div v-if="logs.length === 0" class="empty-state">
        <span class="icon">📝</span>
        <p>暂无事件日志</p>
        <p class="hint">
          调整窗口大小、旋转设备或触发其他事件来查看日志
        </p>
      </div>

      <div v-else class="log-list">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-item"
          :class="`log-${log.type}`"
        >
          <div class="log-header">
            <span class="log-icon">{{ getLogIcon(log.type) }}</span>
            <span class="log-type">{{ getLogTypeText(log.type) }}</span>
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          </div>
          <div class="log-content">
            <div class="log-message">
              {{ log.message }}
            </div>
            <div v-if="log.data" class="log-data">
              <pre>{{ formatData(log.data) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="log-count">共 {{ logs.length }} 条日志</span>
      <span v-if="logs.length > 0" class="last-update">
        最后更新: {{ formatTime(logs[logs.length - 1].timestamp) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #28a745;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.controls {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}

.empty-state .icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
}

.empty-state .hint {
  font-size: 0.9rem;
  color: #adb5bd;
}

.log-list {
  padding: 12px;
}

.log-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px;
  border-left: 4px solid #dee2e6;
  transition: all 0.3s ease;
}

.log-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-device {
  border-left-color: #ff6b6b;
}
.log-orientation {
  border-left-color: #4ecdc4;
}
.log-resize {
  border-left-color: #45b7d1;
}
.log-network {
  border-left-color: #96ceb4;
}
.log-battery {
  border-left-color: #feca57;
}
.log-geolocation {
  border-left-color: #ff9ff3;
}
.log-module {
  border-left-color: #54a0ff;
}
.log-error {
  border-left-color: #ff6b6b;
}
.log-info {
  border-left-color: #74b9ff;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.log-icon {
  font-size: 1.2rem;
}

.log-type {
  font-weight: 600;
  color: #495057;
}

.log-time {
  margin-left: auto;
  font-size: 0.8rem;
  color: #6c757d;
  font-family: 'Courier New', monospace;
}

.log-content {
  color: #495057;
}

.log-message {
  margin-bottom: 8px;
}

.log-data {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  border: 1px solid #e9ecef;
}

.log-data pre {
  margin: 0;
  font-size: 0.8rem;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-all;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
  font-size: 0.9rem;
  color: #6c757d;
}

.log-count {
  font-weight: 500;
}

.last-update {
  font-family: 'Courier New', monospace;
}

/* 滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .controls {
    justify-content: center;
  }

  .footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .log-header {
    flex-wrap: wrap;
  }

  .log-time {
    margin-left: 0;
    width: 100%;
    text-align: right;
  }
}
</style>
