<template>
  <teleport to="body">
    <div class="l-notification-container">
      <transition-group
        name="notification"
        tag="div"
        class="notification-list"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            `notification-${notification.type}`
          ]"
        >
          <div class="notification-icon">
            <component :is="getIcon(notification.type)" />
          </div>
          
          <div class="notification-content">
            <div v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          
          <button
            class="notification-close"
            @click="closeNotification(notification.id)"
          >
            <CloseIcon />
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEngine } from '../composables/useEngine'

// 图标组件（简化版，实际项目中可以使用图标库）
const SuccessIcon = () => '✓'
const ErrorIcon = () => '✗'
const WarningIcon = () => '⚠'
const InfoIcon = () => 'ℹ'
const CloseIcon = () => '×'

const engine = useEngine()

// 获取通知列表
const notifications = computed(() => {
  // 这里应该从engine的通知管理器获取通知列表
  // 暂时返回空数组，后续集成时会完善
  return []
})

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return SuccessIcon
    case 'error':
      return ErrorIcon
    case 'warning':
      return WarningIcon
    case 'info':
      return InfoIcon
    default:
      return InfoIcon
  }
}

const closeNotification = (id: string) => {
  // 关闭通知
  engine.notifications?.close?.(id)
}
</script>

<style lang="less" scoped>
.l-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: @z-index-toast;
  pointer-events: none;
  
  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 320px;
    max-width: 480px;
    padding: 16px;
    background: white;
    border-radius: @border-radius-lg;
    box-shadow: @shadow-lg;
    pointer-events: auto;
    border-left: 4px solid;
    
    &.notification-success {
      border-left-color: @success-color;
      
      .notification-icon {
        color: @success-color;
      }
    }
    
    &.notification-error {
      border-left-color: @danger-color;
      
      .notification-icon {
        color: @danger-color;
      }
    }
    
    &.notification-warning {
      border-left-color: @warning-color;
      
      .notification-icon {
        color: @warning-color;
      }
    }
    
    &.notification-info {
      border-left-color: @info-color;
      
      .notification-icon {
        color: @info-color;
      }
    }
  }
  
  .notification-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }
  
  .notification-content {
    flex: 1;
    min-width: 0;
  }
  
  .notification-title {
    font-weight: @font-weight-semibold;
    font-size: @font-size-base;
    color: @text-primary;
    margin-bottom: 4px;
  }
  
  .notification-message {
    font-size: @font-size-sm;
    color: @text-secondary;
    line-height: @line-height-base;
  }
  
  .notification-close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: @text-muted;
    cursor: pointer;
    border-radius: @border-radius-sm;
    transition: @transition-fast;
    
    &:hover {
      background: rgba(0, 0, 0, 0.1);
      color: @text-primary;
    }
  }
}

// 动画
.notification-enter-active,
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
</style>
