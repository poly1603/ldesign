<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRealTimeStore } from '../stores/realTimeStore'

const store = useRealTimeStore()

// 响应式数据
const newMessage = ref('')
const messageList = ref<HTMLElement>()

// 计算属性
const connectionStatus = computed(() => store.connectionStatus)
const messageCount = computed(() => store.messages.length)
const onlineUsers = computed(() => store.userList.filter(u => u.online).length)
const messages = computed(() => store.messages)
const userList = computed(() => store.userList)
const sharedCounter = computed(() => store.sharedCounter)
const lastSyncTime = computed(() => store.lastSyncTime)
const syncStatus = computed(() => store.syncStatus)
const offlineQueue = computed(() => store.offlineQueue)

const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'text-green'
    case 'connecting':
      return 'text-yellow'
    case 'disconnected':
      return 'text-red'
    default:
      return 'text-gray'
  }
})

// 方法
function connect() {
  store.connect()
}

function disconnect() {
  store.disconnect()
}

function clearMessages() {
  store.clearMessages()
}

function sendMessage() {
  if (newMessage.value.trim()) {
    store.sendMessage(newMessage.value.trim())
    newMessage.value = ''

    // 滚动到底部
    nextTick(() => {
      if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
      }
    })
  }
}

function incrementCounter() {
  store.incrementSharedCounter()
}

function decrementCounter() {
  store.decrementSharedCounter()
}

function resetCounter() {
  store.resetSharedCounter()
}

function processOfflineQueue() {
  store.processOfflineQueue()
}

function clearOfflineQueue() {
  store.clearOfflineQueue()
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  store.initialize()
})

onUnmounted(() => {
  store.cleanup()
})
</script>

<template>
  <div class="realtime-demo">
    <div class="page-header">
      <h1>实时同步示例</h1>
      <p>展示WebSocket连接、数据同步、离线处理等实时应用功能</p>
    </div>

    <div class="demo-section">
      <h2>连接状态</h2>
      <div class="grid grid-3">
        <div class="metric">
          <div class="metric-value" :class="connectionStatusClass">
            {{ connectionStatus }}
          </div>
          <div class="metric-label">
            连接状态
          </div>
        </div>
        <div class="metric">
          <div class="metric-value">
            {{ messageCount }}
          </div>
          <div class="metric-label">
            消息数量
          </div>
        </div>
        <div class="metric">
          <div class="metric-value">
            {{ onlineUsers }}
          </div>
          <div class="metric-label">
            在线用户
          </div>
        </div>
      </div>

      <div class="connection-controls">
        <button
          class="btn btn-primary"
          :disabled="connectionStatus === 'connected'"
          @click="connect"
        >
          连接
        </button>
        <button
          class="btn btn-danger"
          :disabled="connectionStatus === 'disconnected'"
          @click="disconnect"
        >
          断开连接
        </button>
        <button class="btn btn-secondary" @click="clearMessages">
          清空消息
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h2>实时聊天</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>消息列表</h3>
          <div ref="messageList" class="message-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
              :class="{ 'own-message': message.isOwn }"
            >
              <div class="message-header">
                <span class="message-user">{{ message.user }}</span>
                <span class="message-time">{{
                  formatTime(message.timestamp)
                }}</span>
              </div>
              <div class="message-content">
                {{ message.content }}
              </div>
            </div>
          </div>

          <div class="message-input">
            <input
              v-model="newMessage"
              placeholder="输入消息..."
              class="form-input"
              :disabled="connectionStatus !== 'connected'"
              @keyup.enter="sendMessage"
            >
            <button
              class="btn btn-primary"
              :disabled="!newMessage.trim() || connectionStatus !== 'connected'"
              @click="sendMessage"
            >
              发送
            </button>
          </div>
        </div>

        <div class="card">
          <h3>在线用户</h3>
          <div class="user-list">
            <div v-for="user in userList" :key="user.id" class="user-item">
              <div class="user-avatar">
                {{ user.name.charAt(0) }}
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ user.name }}
                </div>
                <div class="user-status">
                  {{ user.status }}
                </div>
              </div>
              <div
                class="user-indicator"
                :class="user.online ? 'online' : 'offline'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>数据同步</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>共享计数器</h3>
          <div class="counter-display">
            <div class="counter-value">
              {{ sharedCounter }}
            </div>
            <div class="counter-actions">
              <button class="btn btn-primary" @click="incrementCounter">
                +1
              </button>
              <button class="btn btn-secondary" @click="decrementCounter">
                -1
              </button>
              <button class="btn btn-danger" @click="resetCounter">
                重置
              </button>
            </div>
          </div>
          <div class="sync-info">
            <p>
              最后同步: {{ lastSyncTime ? formatTime(lastSyncTime) : '未同步' }}
            </p>
            <p>同步状态: {{ syncStatus }}</p>
          </div>
        </div>

        <div class="card">
          <h3>离线队列</h3>
          <div class="offline-queue">
            <div v-if="offlineQueue.length === 0" class="no-items">
              暂无离线操作
            </div>
            <div v-for="item in offlineQueue" :key="item.id" class="queue-item">
              <div class="queue-action">
                {{ item.action }}
              </div>
              <div class="queue-data">
                {{ JSON.stringify(item.data) }}
              </div>
              <div class="queue-time">
                {{ formatTime(item.timestamp) }}
              </div>
            </div>
          </div>

          <div class="queue-controls">
            <button class="btn btn-primary" @click="processOfflineQueue">
              处理队列 ({{ offlineQueue.length }})
            </button>
            <button class="btn btn-danger" @click="clearOfflineQueue">
              清空队列
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>代码示例</h2>
      <div class="card">
        <h3>WebSocket 集成</h3>
        <div class="code-block">
          <pre>
import { WebSocketStore } from '@ldesign/store'

class RealTimeStore extends WebSocketStore {
  @State({ default: [] })
  messages: Message[] = []

  @State({ default: 0 })
  counter: number = 0

  constructor() {
    super('realtime-store', 'ws://localhost:8080')
  }

  @OnWebSocketMessage('message')
  handleMessage(data: MessageData) {
    this.messages.push(data)
  }

  @OnWebSocketMessage('counter-update')
  handleCounterUpdate(data: { value: number }) {
    this.counter = data.value
  }

  @Action()
  sendMessage(content: string) {
    this.emit('send-message', { content, user: this.currentUser })
  }
}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.realtime-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.connection-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.text-green {
  color: #38a169;
}
.text-yellow {
  color: #d69e2e;
}
.text-red {
  color: #e53e3e;
}
.text-gray {
  color: #718096;
}

.message-list {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.message-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
}

.message-item.own-message {
  background: #e6fffa;
  margin-left: 2rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.message-user {
  font-weight: 600;
  color: #2d3748;
}

.message-time {
  color: #718096;
}

.message-content {
  color: #4a5568;
}

.message-input {
  display: flex;
  gap: 0.5rem;
}

.message-input .form-input {
  flex: 1;
}

.user-list {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3182ce;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
}

.user-status {
  font-size: 0.875rem;
  color: #718096;
}

.user-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.user-indicator.online {
  background: #38a169;
}

.user-indicator.offline {
  background: #e53e3e;
}

.counter-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.counter-value {
  font-size: 3rem;
  font-weight: bold;
  color: #3182ce;
  margin-bottom: 1rem;
}

.counter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.sync-info {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}

.offline-queue {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.queue-item {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.queue-action {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.queue-data {
  font-family: monospace;
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.queue-time {
  font-size: 0.75rem;
  color: #718096;
}

.queue-controls {
  display: flex;
  gap: 1rem;
}

.no-items {
  text-align: center;
  color: #718096;
  padding: 2rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-input:disabled {
  background: #f7fafc;
  color: #a0aec0;
}
</style>
