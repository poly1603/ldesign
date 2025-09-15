<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue WebSocket 示例</h1>
      <div class="connection-status">
        <div 
          class="status-dot" 
          :class="status"
        ></div>
        <span>{{ statusText }}</span>
      </div>
    </header>

    <main class="app-main">
      <div class="examples-grid">
        <!-- 基础连接示例 -->
        <div class="example-card">
          <h3>基础连接</h3>
          <div class="example-content">
            <div class="connection-info">
              <p>URL: {{ wsUrl }}</p>
              <p>状态: {{ status }}</p>
              <p>重连次数: {{ reconnectCount }}</p>
            </div>
            <div class="example-actions">
              <button 
                @click="connect" 
                :disabled="status === 'connected' || status === 'connecting'"
                class="btn btn-primary"
              >
                连接
              </button>
              <button 
                @click="disconnect" 
                :disabled="status !== 'connected'"
                class="btn btn-secondary"
              >
                断开
              </button>
            </div>
          </div>
        </div>

        <!-- 消息发送示例 -->
        <div class="example-card">
          <h3>消息发送</h3>
          <div class="example-content">
            <div class="message-input-group">
              <input 
                v-model="messageText"
                @keyup.enter="sendMessage"
                placeholder="输入消息..."
                :disabled="status !== 'connected'"
                class="message-input"
              >
              <button 
                @click="sendMessage"
                :disabled="status !== 'connected' || !messageText.trim()"
                class="btn btn-primary"
              >
                发送
              </button>
            </div>
            <div class="message-stats">
              <p>已发送: {{ messagesSent }}</p>
              <p>已接收: {{ messagesReceived }}</p>
            </div>
          </div>
        </div>

        <!-- 消息历史 -->
        <div class="example-card full-width">
          <h3>消息历史</h3>
          <div class="example-content">
            <div class="message-list" ref="messageList">
              <div 
                v-for="message in messages" 
                :key="message.id"
                class="message-item"
                :class="message.type"
              >
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <span class="message-content">{{ message.content }}</span>
              </div>
            </div>
            <div class="message-actions">
              <button @click="clearMessages" class="btn btn-secondary">
                清空消息
              </button>
              <button @click="exportMessages" class="btn btn-secondary">
                导出消息
              </button>
            </div>
          </div>
        </div>

        <!-- 高级配置 -->
        <div class="example-card">
          <h3>高级配置</h3>
          <div class="example-content">
            <div class="config-group">
              <label>
                <input 
                  type="checkbox" 
                  v-model="config.heartbeat.enabled"
                  @change="updateConfig"
                >
                启用心跳检测
              </label>
              <div v-if="config.heartbeat.enabled" class="config-sub">
                <label>
                  心跳间隔 (秒):
                  <input 
                    type="number" 
                    v-model.number="config.heartbeat.interval"
                    @change="updateConfig"
                    min="5"
                    max="300"
                  >
                </label>
              </div>
            </div>

            <div class="config-group">
              <label>
                <input 
                  type="checkbox" 
                  v-model="config.reconnect.enabled"
                  @change="updateConfig"
                >
                启用自动重连
              </label>
              <div v-if="config.reconnect.enabled" class="config-sub">
                <label>
                  最大重连次数:
                  <input 
                    type="number" 
                    v-model.number="config.reconnect.maxAttempts"
                    @change="updateConfig"
                    min="1"
                    max="20"
                  >
                </label>
              </div>
            </div>

            <div class="config-group">
              <label>
                <input 
                  type="checkbox" 
                  v-model="config.messageQueue.enabled"
                  @change="updateConfig"
                >
                启用消息队列
              </label>
            </div>
          </div>
        </div>

        <!-- 性能监控 -->
        <div class="example-card">
          <h3>性能监控</h3>
          <div class="example-content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">连接时长</span>
                <span class="stat-value">{{ connectionDuration }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均延迟</span>
                <span class="stat-value">{{ averageLatency }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">消息速率</span>
                <span class="stat-value">{{ messageRate }}/s</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">错误次数</span>
                <span class="stat-value">{{ errorCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useWebSocket } from '@ldesign/websocket/vue'

// 响应式数据
const wsUrl = ref('ws://echo.websocket.org')
const messageText = ref('')
const messages = ref<Array<{
  id: string
  type: 'sent' | 'received' | 'system'
  content: string
  timestamp: number
}>>([])
const messageList = ref<HTMLElement>()

// 配置
const config = ref({
  heartbeat: {
    enabled: true,
    interval: 30
  },
  reconnect: {
    enabled: true,
    maxAttempts: 5
  },
  messageQueue: {
    enabled: true
  }
})

// 统计数据
const messagesSent = ref(0)
const messagesReceived = ref(0)
const reconnectCount = ref(0)
const errorCount = ref(0)
const connectionStartTime = ref<number | null>(null)
const latencyHistory = ref<number[]>([])

// 使用 WebSocket Hook
const { 
  status, 
  lastMessage, 
  send, 
  connect, 
  disconnect,
  updateConfig: updateWSConfig
} = useWebSocket(wsUrl, {
  autoConnect: false,
  heartbeat: {
    enabled: config.value.heartbeat.enabled,
    interval: config.value.heartbeat.interval * 1000
  },
  reconnect: {
    enabled: config.value.reconnect.enabled,
    maxAttempts: config.value.reconnect.maxAttempts,
    strategy: 'exponential'
  },
  messageQueue: {
    enabled: config.value.messageQueue.enabled
  },
  onConnected: () => {
    connectionStartTime.value = Date.now()
    addMessage('system', '连接成功')
  },
  onDisconnected: () => {
    connectionStartTime.value = null
    addMessage('system', '连接断开')
  },
  onReconnecting: (attempt: number) => {
    reconnectCount.value = attempt
    addMessage('system', `正在重连... (${attempt})`)
  },
  onError: (error: Error) => {
    errorCount.value++
    addMessage('system', `错误: ${error.message}`)
  }
})

// 计算属性
const statusText = computed(() => {
  const statusMap = {
    connected: '已连接',
    connecting: '连接中...',
    disconnected: '未连接',
    reconnecting: '重连中...'
  }
  return statusMap[status.value] || '未知状态'
})

const connectionDuration = computed(() => {
  if (!connectionStartTime.value) return '0s'
  const duration = Math.floor((Date.now() - connectionStartTime.value) / 1000)
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
})

const averageLatency = computed(() => {
  if (latencyHistory.value.length === 0) return 0
  const sum = latencyHistory.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / latencyHistory.value.length)
})

const messageRate = computed(() => {
  if (!connectionStartTime.value) return 0
  const duration = (Date.now() - connectionStartTime.value) / 1000
  return duration > 0 ? Math.round(messagesReceived.value / duration) : 0
})

// 监听最新消息
watch(lastMessage, (message) => {
  if (message) {
    messagesReceived.value++
    addMessage('received', message)
  }
})

// 方法
const addMessage = (type: 'sent' | 'received' | 'system', content: string) => {
  messages.value.push({
    id: Date.now().toString(),
    type,
    content,
    timestamp: Date.now()
  })
  
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!messageText.value.trim()) return
  
  try {
    const startTime = Date.now()
    await send(messageText.value)
    
    // 计算延迟（模拟）
    const latency = Date.now() - startTime
    latencyHistory.value.push(latency)
    if (latencyHistory.value.length > 10) {
      latencyHistory.value.shift()
    }
    
    messagesSent.value++
    addMessage('sent', messageText.value)
    messageText.value = ''
  } catch (error) {
    errorCount.value++
    addMessage('system', `发送失败: ${error.message}`)
  }
}

const clearMessages = () => {
  messages.value = []
  messagesSent.value = 0
  messagesReceived.value = 0
}

const exportMessages = () => {
  const data = messages.value.map(msg => ({
    type: msg.type,
    content: msg.content,
    time: new Date(msg.timestamp).toISOString()
  }))
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `websocket-messages-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const updateConfig = () => {
  updateWSConfig({
    heartbeat: {
      enabled: config.value.heartbeat.enabled,
      interval: config.value.heartbeat.interval * 1000
    },
    reconnect: {
      enabled: config.value.reconnect.enabled,
      maxAttempts: config.value.reconnect.maxAttempts
    },
    messageQueue: {
      enabled: config.value.messageQueue.enabled
    }
  })
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 可以在这里进行初始化
})

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  color: #722ED1;
  font-size: 24px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4d4f;
}

.status-dot.connected {
  background: #52c41a;
}

.status-dot.connecting {
  background: #faad14;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.app-main {
  padding: 20px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-card.full-width {
  grid-column: 1 / -1;
}

.example-card h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connection-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.example-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #722ED1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5e2aa7;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.message-input-group {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.message-input:focus {
  outline: none;
  border-color: #722ED1;
}

.message-stats p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.message-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.message-item.sent {
  color: #722ED1;
}

.message-item.received {
  color: #52c41a;
}

.message-item.system {
  color: #faad14;
  font-style: italic;
}

.message-time {
  color: #999;
  font-size: 12px;
  min-width: 80px;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.config-group {
  margin-bottom: 12px;
}

.config-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.config-sub {
  margin-left: 24px;
  margin-top: 8px;
}

.config-sub label {
  margin-bottom: 4px;
}

.config-sub input[type="number"] {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-left: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>
