<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRealtimeStore } from '@/stores/realtime/RealtimeStore'

// 使用实时 Store
const realtimeStore = useRealtimeStore()

// 新消息输入
const newMessage = ref('')

// 消息容器引用
const messagesContainer = ref<HTMLElement>()

// 发送消息
function sendMessage() {
  if (newMessage.value.trim()) {
    realtimeStore.sendMessage(newMessage.value.trim())
    newMessage.value = ''

    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
}

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 格式化运行时间
function formatUptime(uptime: number) {
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

// 获取通知类型标签
function getNotificationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误'
  }
  return labels[type] || type
}

// 模拟用户活动的定时器
let activityTimer: number | null = null

// 组件挂载时开始模拟活动
onMounted(() => {
  // 定期模拟用户活动
  activityTimer = window.setInterval(() => {
    if (realtimeStore.connectionStatus.connected && Math.random() > 0.7) {
      realtimeStore.simulateUserActivity()
    }
  }, 10000)
})

// 组件卸载时清理
onUnmounted(() => {
  if (activityTimer) {
    clearInterval(activityTimer)
  }

  // 断开连接
  if (realtimeStore.connectionStatus.connected) {
    realtimeStore.disconnect()
  }
})
</script>

<template>
  <div class="realtime-examples">
    <div class="page-header">
      <h1>实时同步示例</h1>
      <p>展示多窗口、多标签页状态同步功能</p>
    </div>

    <!-- 连接状态 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">连接状态</h2>
        <p class="card-description">实时连接状态和统计信息</p>
      </div>

      <div class="example-content">
        <div class="connection-status">
          <div class="status-indicator">
            <div
              class="status-dot" :class="{
                connected: realtimeStore.connectionStatus.connected,
                connecting: realtimeStore.connectionStatus.reconnecting,
                disconnected: !realtimeStore.connectionStatus.connected && !realtimeStore.connectionStatus.reconnecting,
              }"
            />
            <span class="status-text">{{ realtimeStore.connectionStatusText }}</span>
          </div>

          <div class="connection-actions">
            <button
              v-if="!realtimeStore.connectionStatus.connected" :disabled="realtimeStore.connectionStatus.reconnecting"
              class="btn btn-primary" @click="realtimeStore.connect()"
            >
              {{ realtimeStore.connectionStatus.reconnecting ? '连接中...' : '连接' }}
            </button>

            <button
              v-if="realtimeStore.connectionStatus.connected" class="btn btn-danger"
              @click="realtimeStore.disconnect()"
            >
              断开连接
            </button>

            <button class="btn btn-secondary" @click="realtimeStore.simulateUserActivity()">
              模拟用户活动
            </button>
          </div>

          <div class="connection-stats">
            <div class="stat-item">
              <span class="stat-label">延迟:</span>
              <span class="stat-value">{{ realtimeStore.connectionStatus.latency.toFixed(0) }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">重连次数:</span>
              <span class="stat-value">{{ realtimeStore.connectionStatus.reconnectAttempts }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">运行时间:</span>
              <span class="stat-value">{{ formatUptime(realtimeStore.uptime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">消息总数:</span>
              <span class="stat-value">{{ realtimeStore.stats.totalMessages }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">数据点:</span>
              <span class="stat-value">{{ realtimeStore.stats.dataPoints }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时聊天和数据 -->
    <div class="realtime-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">实时聊天</h2>
          <p class="card-description">模拟 WebSocket 聊天功能</p>
        </div>

        <div class="example-content">
          <div class="chat-container">
            <div class="chat-users">
              <h4>在线用户 ({{ realtimeStore.onlineUsersCount }}/{{ realtimeStore.onlineUsers.length }})</h4>
              <div class="users-list">
                <div v-for="user in realtimeStore.onlineUsers" :key="user.id" class="user-item" :class="user.status">
                  <span class="user-avatar">{{ user.avatar }}</span>
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-status" :class="user.status">{{ realtimeStore.getStatusLabel(user.status) }}</span>
                </div>
              </div>
            </div>

            <div class="chat-messages">
              <div ref="messagesContainer" class="messages-list">
                <div
                  v-for="message in realtimeStore.recentMessages" :key="message.id" class="message-item"
                  :class="message.type"
                >
                  <div class="message-header">
                    <span class="message-user">{{ message.user }}</span>
                    <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <div class="message-content">{{ message.content }}</div>
                </div>
              </div>

              <div class="message-input">
                <input
                  v-model="newMessage" :disabled="!realtimeStore.connectionStatus.connected"
                  type="text" placeholder="输入消息..." class="form-input"
                  @keyup.enter="sendMessage"
                >
                <button
                  :disabled="!realtimeStore.connectionStatus.connected || !newMessage.trim()" class="btn btn-primary"
                  @click="sendMessage"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">实时数据流</h2>
          <p class="card-description">模拟 SSE 数据推送</p>
        </div>

        <div class="example-content">
          <div class="realtime-data">
            <div v-if="realtimeStore.latestRealtimeData" class="data-current">
              <h4>当前数据</h4>
              <div class="data-metrics">
                <div class="metric-card">
                  <div class="metric-value">{{ realtimeStore.latestRealtimeData.temperature.toFixed(1) }}°C</div>
                  <div class="metric-label">温度</div>
                  <div class="metric-bar">
                    <div
                      class="metric-fill temperature"
                      :style="{ width: `${(realtimeStore.latestRealtimeData.temperature / 35) * 100}%` }"
                    />
                  </div>
                </div>

                <div class="metric-card">
                  <div class="metric-value">{{ realtimeStore.latestRealtimeData.humidity.toFixed(1) }}%</div>
                  <div class="metric-label">湿度</div>
                  <div class="metric-bar">
                    <div
                      class="metric-fill humidity"
                      :style="{ width: `${realtimeStore.latestRealtimeData.humidity}%` }"
                    />
                  </div>
                </div>

                <div class="metric-card">
                  <div class="metric-value">{{ realtimeStore.latestRealtimeData.pressure.toFixed(0) }} hPa</div>
                  <div class="metric-label">气压</div>
                  <div class="metric-bar">
                    <div
                      class="metric-fill pressure"
                      :style="{ width: `${((realtimeStore.latestRealtimeData.pressure - 1000) / 50) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="data-chart">
              <h4>数据趋势</h4>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <div class="chart-line">
                    <div
                      v-for="(data, index) in realtimeStore.realtimeData.slice(-20)" :key="index" class="chart-point"
                      :style="{
                        left: `${(index / 19) * 100}%`,
                        bottom: `${(data.temperature / 35) * 100}%`,
                      }"
                    />
                  </div>
                  <div class="chart-labels">
                    <span>温度趋势</span>
                    <span>{{ realtimeStore.realtimeData.length }} 个数据点</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知系统 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">实时通知</h2>
        <p class="card-description">实时推送通知和消息</p>
      </div>

      <div class="example-content">
        <div class="notifications-container">
          <div class="notifications-header">
            <h4>通知中心</h4>
            <div class="notifications-actions">
              <span class="notifications-count">
                {{ realtimeStore.unreadNotificationsCount }} 条未读
              </span>
              <button class="btn btn-sm btn-secondary" @click="realtimeStore.clearNotifications()">
                清空所有
              </button>
            </div>
          </div>

          <div class="notifications-list">
            <div v-if="realtimeStore.notifications.length === 0" class="empty-notifications">
              暂无通知
            </div>

            <div
              v-for="notification in realtimeStore.notifications.slice(0, 10)" :key="notification.id"
              class="notification-item" :class="{
                unread: !notification.read,
                [`notification-${notification.type}`]: true,
              }" @click="realtimeStore.markNotificationAsRead(notification.id)"
            >
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-type">{{ getNotificationTypeLabel(notification.type) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.realtime-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.connection-status {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.connected {
  background: #38a169;
  box-shadow: 0 0 8px rgba(56, 161, 105, 0.5);
}

.status-dot.connecting {
  background: #f6ad55;
  animation: pulse 1.5s infinite;
}

.status-dot.disconnected {
  background: #e53e3e;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-weight: 500;
  font-size: 1rem;
}

.connection-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.connection-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.stat-value {
  font-weight: 600;
  font-size: 0.875rem;
  color: #2d3748;
}

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chat-container {
  display: flex;
  gap: 1rem;
  height: 400px;
}

.chat-users {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-users h4 {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background: #f7fafc;
  transition: all 0.2s ease;
}

.user-item.online {
  border-left: 3px solid #38a169;
}

.user-item.away {
  border-left: 3px solid #f6ad55;
}

.user-item.busy {
  border-left: 3px solid #e53e3e;
}

.user-avatar {
  font-size: 1.25rem;
}

.user-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.user-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

.user-status.online {
  background: #c6f6d5;
  color: #22543d;
}

.user-status.away {
  background: #fef5e7;
  color: #744210;
}

.user-status.busy {
  background: #fed7d7;
  color: #742a2a;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.message-item {
  padding: 0.75rem;
  border-radius: 6px;
  background: white;
  border: 1px solid #e2e8f0;
}

.message-item.system {
  background: #ebf8ff;
  border-color: #90cdf4;
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.message-user {
  font-weight: 600;
  font-size: 0.875rem;
  color: #3182ce;
}

.message-time {
  font-size: 0.75rem;
  color: #718096;
}

.message-content {
  font-size: 0.875rem;
  color: #2d3748;
}

.message-input {
  display: flex;
  gap: 0.5rem;
}

.message-input .form-input {
  flex: 1;
}

.realtime-data {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.data-current h4,
.data-chart h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #2d3748;
}

.data-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.metric-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-fill.temperature {
  background: linear-gradient(90deg, #4299e1, #e53e3e);
}

.metric-fill.humidity {
  background: linear-gradient(90deg, #48bb78, #3182ce);
}

.metric-fill.pressure {
  background: linear-gradient(90deg, #9f7aea, #667eea);
}

.chart-container {
  height: 200px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
}

.chart-placeholder {
  position: relative;
  height: 100%;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.chart-line {
  position: relative;
  height: 100%;
}

.chart-point {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3182ce;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.chart-labels {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #718096;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.notifications-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notifications-count {
  font-size: 0.875rem;
  color: #718096;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.empty-notifications {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  padding: 2rem;
}

.notification-item {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  border-left: 4px solid #3182ce;
  background: #ebf8ff;
}

.notification-item.notification-info {
  border-left-color: #3182ce;
}

.notification-item.notification-success {
  border-left-color: #38a169;
}

.notification-item.notification-warning {
  border-left-color: #f6ad55;
}

.notification-item.notification-error {
  border-left-color: #e53e3e;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #2d3748;
}

.notification-time {
  font-size: 0.75rem;
  color: #718096;
}

.notification-message {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.notification-type {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .realtime-grid {
    grid-template-columns: 1fr;
  }

  .chat-container {
    flex-direction: column;
    height: auto;
  }

  .chat-users {
    flex: none;
  }

  .users-list {
    flex-direction: row;
    overflow-x: auto;
  }

  .user-item {
    flex: 0 0 auto;
  }

  .data-metrics {
    grid-template-columns: 1fr;
  }

  .connection-stats {
    grid-template-columns: 1fr;
  }
}
</style>
