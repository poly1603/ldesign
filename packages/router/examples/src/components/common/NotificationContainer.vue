<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[
            `notification--${notification.type}`,
            { 'notification--closable': notification.closable }
          ]"
        >
          <!-- 图标 -->
          <div class="notification-icon">
            <span>{{ getIcon(notification.type) }}</span>
          </div>
          
          <!-- 内容 -->
          <div class="notification-content">
            <h4 v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </h4>
            <p class="notification-message">
              {{ notification.message }}
            </p>
          </div>
          
          <!-- 关闭按钮 -->
          <button
            v-if="notification.closable"
            class="notification-close"
            @click="removeNotification(notification.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 全局通知容器组件
 * 
 * 功能特性：
 * 1. 多种通知类型
 * 2. 自动消失
 * 3. 手动关闭
 * 4. 动画效果
 * 5. 位置定位
 */

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

// 响应式状态
const notifications = ref<Notification[]>([])

// 通知计数器
let notificationId = 0

// 方法
const getIcon = (type: string) => {
  switch (type) {
    case 'success': return '✅'
    case 'warning': return '⚠️'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    default: return 'ℹ️'
  }
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = `notification-${++notificationId}`
  const newNotification: Notification = {
    id,
    closable: true,
    duration: 4000,
    ...notification
  }
  
  notifications.value.push(newNotification)
  
  // 自动移除
  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }
  
  return id
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const clearAll = () => {
  notifications.value = []
}

// 便捷方法
const success = (message: string, options?: Partial<Notification>) => {
  return addNotification({ type: 'success', message, ...options })
}

const warning = (message: string, options?: Partial<Notification>) => {
  return addNotification({ type: 'warning', message, ...options })
}

const error = (message: string, options?: Partial<Notification>) => {
  return addNotification({ type: 'error', message, duration: 0, ...options })
}

const info = (message: string, options?: Partial<Notification>) => {
  return addNotification({ type: 'info', message, ...options })
}

// 监听全局通知事件
const handleGlobalNotification = (event: CustomEvent) => {
  const { type, message, options } = event.detail
  addNotification({ type, message, ...options })
}

// 生命周期
onMounted(() => {
  // 监听全局通知事件
  window.addEventListener('notification:show', handleGlobalNotification as EventListener)
  
  // 将方法挂载到全局，方便调用
  ;(window as any).__NOTIFICATION__ = {
    success,
    warning,
    error,
    info,
    remove: removeNotification,
    clear: clearAll
  }
})

onUnmounted(() => {
  window.removeEventListener('notification:show', handleGlobalNotification as EventListener)
})

// 暴露方法给父组件
defineExpose({
  success,
  warning,
  error,
  info,
  remove: removeNotification,
  clear: clearAll
})
</script>

<style lang="less" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
  max-width: 400px;
}

.notification {
  .flex-center();
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  margin-bottom: var(--ls-margin-sm);
  background-color: #fff;
  .border-radius();
  .box-shadow(var(--ls-shadow-lg));
  border-left: 4px solid;
  pointer-events: auto;
  min-width: 300px;
  
  &--success {
    border-left-color: var(--ldesign-success-color);
    
    .notification-icon {
      color: var(--ldesign-success-color);
    }
  }
  
  &--warning {
    border-left-color: var(--ldesign-warning-color);
    
    .notification-icon {
      color: var(--ldesign-warning-color);
    }
  }
  
  &--error {
    border-left-color: var(--ldesign-error-color);
    
    .notification-icon {
      color: var(--ldesign-error-color);
    }
  }
  
  &--info {
    border-left-color: var(--ldesign-brand-color);
    
    .notification-icon {
      color: var(--ldesign-brand-color);
    }
  }
}

.notification-icon {
  font-size: var(--ls-font-size-lg);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
  
  .notification-title {
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    margin: 0 0 var(--ls-margin-xs) 0;
    color: var(--ldesign-text-color-primary);
  }
  
  .notification-message {
    font-size: var(--ls-font-size-sm);
    margin: 0;
    color: var(--ldesign-text-color-secondary);
    line-height: 1.5;
    word-break: break-word;
  }
}

.notification-close {
  .flex-center();
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  .border-radius(50%);
  .transition();
  color: var(--ldesign-text-color-placeholder);
  font-size: var(--ls-font-size-lg);
  font-weight: bold;
  flex-shrink: 0;
  
  &:hover {
    background-color: var(--ldesign-bg-color-container-hover);
    color: var(--ldesign-text-color-primary);
  }
}

// 动画效果
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

// 响应式设计
.mobile({
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification {
    min-width: auto;
    margin-bottom: var(--ls-margin-xs);
    padding: var(--ls-padding-sm);
  }
  
  .notification-content {
    .notification-title {
      font-size: var(--ls-font-size-sm);
    }
    
    .notification-message {
      font-size: var(--ls-font-size-xs);
    }
  }
});
</style>
