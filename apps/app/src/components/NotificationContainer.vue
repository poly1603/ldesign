<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[`notification-${notification.type}`]"
          @click="removeNotification(notification.id!)"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button
            class="notification-close"
            @click.stop="removeNotification(notification.id!)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

// 计算属性
const notifications = computed(() => appStore.notifications)

// 方法
const removeNotification = (id: string) => {
  appStore.removeNotification(id)
}

const getNotificationIcon = (type: string) => {
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  }
  return icons[type as keyof typeof icons] || 'ℹ️'
}
</script>

<style lang="less" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  min-width: 320px;
  max-width: 480px;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  pointer-events: auto;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  // 成功通知
  &.notification-success {
    border-left: 4px solid var(--success-color);

    .notification-icon {
      color: var(--success-color);
    }
  }

  // 警告通知
  &.notification-warning {
    border-left: 4px solid var(--warning-color);

    .notification-icon {
      color: var(--warning-color);
    }
  }

  // 错误通知
  &.notification-error {
    border-left: 4px solid var(--error-color);

    .notification-icon {
      color: var(--error-color);
    }
  }

  // 信息通知
  &.notification-info {
    border-left: 4px solid var(--info-color);

    .notification-icon {
      color: var(--info-color);
    }
  }
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;

  .notification-title {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-xs);
    line-height: 1.4;
  }

  .notification-message {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
    line-height: 1.5;
    word-wrap: break-word;
  }
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-color-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    background: var(--bg-color-secondary);
    color: var(--text-color);
  }
}

// 动画效果
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateY(-100%) scale(0.8);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

// 响应式设计
@media (max-width: 768px) {
  .notification-container {
    left: var(--spacing-md);
    right: var(--spacing-md);
    transform: none;
  }

  .notification {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
}
</style>
