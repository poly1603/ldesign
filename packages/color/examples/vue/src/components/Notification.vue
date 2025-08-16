<script setup lang="ts">
import type { NotificationItem } from '@/composables/useNotification'
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

function getIcon(type: NotificationItem['type']) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[type] || icons.info
}
</script>

<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[`notification-${notification.type}`]"
        >
          <div class="notification-content">
            <span class="notification-icon">
              {{ getIcon(notification.type) }}
            </span>
            <span class="notification-message">
              {{ notification.message }}
            </span>
          </div>
          <button
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

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 500;
  min-width: 300px;
}

.notification-success {
  background: var(--color-success, #52c41a);
}

.notification-error {
  background: var(--color-danger, #ff4d4f);
}

.notification-warning {
  background: var(--color-warning, #faad14);
}

.notification-info {
  background: var(--color-primary, #1890ff);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification-icon {
  font-size: 1.125rem;
}

.notification-message {
  font-size: 0.9rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin-left: 0.5rem;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification {
    min-width: auto;
    padding: 0.875rem 1rem;
  }

  .notification-message {
    font-size: 0.875rem;
  }
}
</style>
