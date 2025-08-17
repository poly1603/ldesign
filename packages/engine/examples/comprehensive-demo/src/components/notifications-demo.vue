<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const notificationType = ref('info')
const notificationTitle = ref('通知标题')
const notificationMessage = ref('这是一条通知消息')
const notificationDuration = ref(3000)
const notificationPosition = ref('top-right')
const notificationAnimation = ref('fade')
const notificationClosable = ref(true)
const notificationPersistent = ref(false)

const activeNotifications = reactive<any[]>([])
const totalNotifications = ref(0)
const notificationsPaused = ref(false)

let notificationIdCounter = 0

// 预设通知
const presetNotifications = [
  {
    name: '欢迎消息',
    type: 'success',
    title: '欢迎！',
    message: '欢迎使用 LDesign Engine 通知系统',
    duration: 3000,
  },
  {
    name: '保存成功',
    type: 'success',
    title: '保存成功',
    message: '您的更改已成功保存',
    duration: 2000,
  },
  {
    name: '网络错误',
    type: 'error',
    title: '网络错误',
    message: '无法连接到服务器，请检查网络连接',
    duration: 5000,
  },
  {
    name: '更新提醒',
    type: 'warning',
    title: '更新可用',
    message: '发现新版本，建议立即更新',
    duration: 4000,
  },
  {
    name: '系统维护',
    type: 'info',
    title: '系统维护通知',
    message: '系统将于今晚 23:00 进行维护，预计持续 2 小时',
    duration: 6000,
  },
]

// 计算属性
const visibleNotifications = computed(() => {
  return activeNotifications.filter(n => !n.hidden)
})

// 方法
function showNotification() {
  if (notificationsPaused.value) {
    emit('log', 'warning', '通知已暂停')
    return
  }

  const notification = createNotification({
    type: notificationType.value,
    title: notificationTitle.value,
    message: notificationMessage.value,
    duration: notificationDuration.value,
    position: notificationPosition.value,
    animation: notificationAnimation.value,
    closable: notificationClosable.value,
    persistent: notificationPersistent.value,
  })

  showNotificationInternal(notification)
}

function showToast() {
  const notification = createNotification({
    type: notificationType.value,
    message: notificationMessage.value,
    duration: 2000,
    position: 'bottom-right',
    animation: 'slide',
    closable: false,
  })

  showNotificationInternal(notification)
}

function showAlert() {
  const notification = createNotification({
    type: 'warning',
    title: '重要提醒',
    message: notificationMessage.value,
    duration: 0, // 不自动关闭
    position: 'center',
    animation: 'zoom',
    closable: true,
    persistent: true,
  })

  showNotificationInternal(notification)
}

function showAdvancedNotification() {
  const notification = createNotification({
    type: notificationType.value,
    title: notificationTitle.value,
    message: notificationMessage.value,
    duration: notificationPersistent.value ? 0 : notificationDuration.value,
    position: notificationPosition.value,
    animation: notificationAnimation.value,
    closable: notificationClosable.value,
    persistent: notificationPersistent.value,
  })

  showNotificationInternal(notification)
}

function showProgressNotification() {
  const notification = createNotification({
    type: 'info',
    title: '文件上传中...',
    message: '正在上传文件，请稍候',
    duration: 0,
    position: notificationPosition.value,
    animation: notificationAnimation.value,
    closable: false,
    progress: 0,
  })

  showNotificationInternal(notification)

  // 模拟进度更新
  let progress = 0
  const progressInterval = setInterval(() => {
    progress += Math.random() * 20
    if (progress >= 100) {
      progress = 100
      notification.title = '上传完成'
      notification.message = '文件上传成功'
      notification.type = 'success'
      notification.closable = true
      clearInterval(progressInterval)

      // 3秒后自动关闭
      setTimeout(() => {
        dismissNotification(notification.id)
      }, 3000)
    }
    notification.progress = Math.min(progress, 100)
  }, 200)
}

function showPresetNotification(preset: any) {
  const notification = createNotification(preset)
  showNotificationInternal(notification)
}

function createNotification(options: any) {
  return {
    id: ++notificationIdCounter,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration || 3000,
    position: options.position || 'top-right',
    animation: options.animation || 'fade',
    closable: options.closable !== false,
    persistent: options.persistent || false,
    progress: options.progress,
    timestamp: Date.now(),
    hidden: false,
  }
}

function showNotificationInternal(notification: any) {
  activeNotifications.push(notification)
  totalNotifications.value++

  emit('log', 'info', `显示通知: ${notification.title || notification.message}`, notification)

  // 自动关闭
  if (notification.duration > 0 && !notification.persistent) {
    setTimeout(() => {
      dismissNotification(notification.id)
    }, notification.duration)
  }
}

function dismissNotification(id: number) {
  const index = activeNotifications.findIndex(n => n.id === id)
  if (index !== -1) {
    const notification = activeNotifications[index]
    notification.hidden = true

    // 延迟移除以播放退出动画
    setTimeout(() => {
      const currentIndex = activeNotifications.findIndex(n => n.id === id)
      if (currentIndex !== -1) {
        activeNotifications.splice(currentIndex, 1)
      }
    }, 300)

    emit('log', 'info', `关闭通知: ${notification.title || notification.message}`)
  }
}

function clearAllNotifications() {
  activeNotifications.forEach((notification) => {
    notification.hidden = true
  })

  setTimeout(() => {
    activeNotifications.splice(0, activeNotifications.length)
  }, 300)

  emit('log', 'warning', '清空所有通知')
}

function pauseNotifications() {
  notificationsPaused.value = true
  emit('log', 'info', '暂停通知系统')
}

function resumeNotifications() {
  notificationsPaused.value = false
  emit('log', 'info', '恢复通知系统')
}

function getNotificationIcon(type: string): string {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }
  return icons[type as keyof typeof icons] || 'ℹ️'
}

// 生命周期
onMounted(() => {
  emit('log', 'info', '通知管理器演示已加载')

  // 显示欢迎通知
  setTimeout(() => {
    showPresetNotification(presetNotifications[0])
  }, 1000)
})
</script>

<template>
  <div class="notifications-demo">
    <div class="demo-header">
      <h2>🔔 通知管理器演示</h2>
      <p>NotificationManager 提供了丰富的通知功能，支持多种通知类型、动画效果和自定义样式。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础通知 -->
      <div class="card">
        <div class="card-header">
          <h3>基础通知</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>通知类型</label>
            <select v-model="notificationType">
              <option value="info">
                信息
              </option>
              <option value="success">
                成功
              </option>
              <option value="warning">
                警告
              </option>
              <option value="error">
                错误
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>通知标题</label>
            <input
              v-model="notificationTitle"
              type="text"
              placeholder="输入通知标题"
            >
          </div>

          <div class="form-group">
            <label>通知内容</label>
            <textarea
              v-model="notificationMessage"
              placeholder="输入通知内容"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label>持续时间 (毫秒)</label>
            <input
              v-model.number="notificationDuration"
              type="number"
              min="1000"
              max="10000"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="showNotification">
                显示通知
              </button>
              <button class="btn btn-secondary" @click="showToast">
                显示Toast
              </button>
              <button class="btn btn-warning" @click="showAlert">
                显示警告
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级通知 -->
      <div class="card">
        <div class="card-header">
          <h3>高级通知</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>通知位置</label>
            <select v-model="notificationPosition">
              <option value="top-right">
                右上角
              </option>
              <option value="top-left">
                左上角
              </option>
              <option value="bottom-right">
                右下角
              </option>
              <option value="bottom-left">
                左下角
              </option>
              <option value="center">
                居中
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>动画效果</label>
            <select v-model="notificationAnimation">
              <option value="fade">
                淡入淡出
              </option>
              <option value="slide">
                滑动
              </option>
              <option value="bounce">
                弹跳
              </option>
              <option value="zoom">
                缩放
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="notificationClosable"
                type="checkbox"
              >
              可关闭
            </label>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="notificationPersistent"
                type="checkbox"
              >
              持久显示
            </label>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="showAdvancedNotification">
                显示高级通知
              </button>
              <button class="btn btn-secondary" @click="showProgressNotification">
                进度通知
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知管理 -->
      <div class="card">
        <div class="card-header">
          <h3>通知管理</h3>
        </div>
        <div class="card-body">
          <div class="notification-stats">
            <div class="stat-item">
              <label>活跃通知:</label>
              <span>{{ activeNotifications.length }}</span>
            </div>
            <div class="stat-item">
              <label>总通知数:</label>
              <span>{{ totalNotifications }}</span>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="clearAllNotifications">
                清空所有通知
              </button>
              <button class="btn btn-warning" @click="pauseNotifications">
                暂停通知
              </button>
              <button class="btn btn-success" @click="resumeNotifications">
                恢复通知
              </button>
            </div>
          </div>

          <div class="active-notifications">
            <h4>活跃通知</h4>
            <div
              v-for="notification in activeNotifications"
              :key="notification.id"
              class="notification-item"
              :class="notification.type"
            >
              <div class="notification-content">
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.message }}</p>
              </div>
              <button
                class="btn btn-error btn-sm"
                @click="dismissNotification(notification.id)"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设通知 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>预设通知模板</h3>
        </div>
        <div class="card-body">
          <div class="preset-notifications">
            <button
              v-for="preset in presetNotifications"
              :key="preset.name"
              class="btn btn-secondary preset-btn"
              @click="showPresetNotification(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知容器 -->
    <div class="notification-container" :class="notificationPosition">
      <transition-group
        :name="notificationAnimation"
        tag="div"
        class="notification-list"
      >
        <div
          v-for="notification in visibleNotifications"
          :key="notification.id"
          class="notification-toast"
          :class="[notification.type, notification.animation]"
        >
          <div class="toast-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="toast-content">
            <div v-if="notification.title" class="toast-title">
              {{ notification.title }}
            </div>
            <div class="toast-message">
              {{ notification.message }}
            </div>
            <div v-if="notification.progress !== undefined" class="toast-progress">
              <div class="progress-bar" :style="{ width: `${notification.progress}%` }" />
            </div>
          </div>
          <button
            v-if="notification.closable"
            class="toast-close"
            @click="dismissNotification(notification.id)"
          >
            ×
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style lang="less" scoped>
.notifications-demo {
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

  .notification-stats {
    margin-bottom: var(--spacing-md);

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      label {
        font-weight: 500;
      }

      span {
        font-family: monospace;
        color: var(--primary-color);
      }
    }
  }

  .active-notifications {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
      border-radius: var(--border-radius);
      border-left: 4px solid;

      &.info {
        background: rgba(23, 162, 184, 0.1);
        border-left-color: var(--info-color);
      }

      &.success {
        background: rgba(40, 167, 69, 0.1);
        border-left-color: var(--success-color);
      }

      &.warning {
        background: rgba(255, 193, 7, 0.1);
        border-left-color: var(--warning-color);
      }

      &.error {
        background: rgba(220, 53, 69, 0.1);
        border-left-color: var(--error-color);
      }

      .notification-content {
        flex: 1;

        strong {
          display: block;
          margin-bottom: var(--spacing-xs);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .preset-notifications {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;

    .preset-btn {
      min-width: 120px;
    }
  }
}

// 通知容器样式
.notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;

  &.top-right {
    top: 20px;
    right: 20px;
  }

  &.top-left {
    top: 20px;
    left: 20px;
  }

  &.bottom-right {
    bottom: 20px;
    right: 20px;
  }

  &.bottom-left {
    bottom: 20px;
    left: 20px;
  }

  &.center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-width: 400px;
  }

  .notification-toast {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-primary);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    border-left: 4px solid;
    pointer-events: auto;

    &.info {
      border-left-color: var(--info-color);
    }

    &.success {
      border-left-color: var(--success-color);
    }

    &.warning {
      border-left-color: var(--warning-color);
    }

    &.error {
      border-left-color: var(--error-color);
    }

    .toast-icon {
      font-size: 18px;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;

      .toast-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
      }

      .toast-message {
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .toast-progress {
        margin-top: var(--spacing-sm);
        height: 4px;
        background: var(--bg-secondary);
        border-radius: 2px;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--text-primary);
      }
    }
  }
}

// 动画效果
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.bounce-enter-active {
  animation: bounce-in 0.5s ease;
}

.bounce-leave-active {
  animation: bounce-out 0.3s ease;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

.zoom-enter-active, .zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .notifications-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .notification-container {
    left: 10px !important;
    right: 10px !important;
    top: 10px !important;

    .notification-list {
      max-width: none;
    }
  }
}
</style>
