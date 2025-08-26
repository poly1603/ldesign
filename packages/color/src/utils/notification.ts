/**
 * 通知系统工具
 */

import { ref } from 'vue'

/**
 * 通知项接口
 */
export interface NotificationItem {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  timestamp: number
}

/**
 * 全局通知状态
 */
const notifications = ref<NotificationItem[]>([])
let notificationId = 0

/**
 * 通知工具函数
 */
export function useNotification() {
  function showNotification(
    message: string,
    type: NotificationItem['type'] = 'info',
    duration = 3000,
  ) {
    const id = `notification-${++notificationId}`
    const notification: NotificationItem = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    }

    notifications.value.push(notification)

    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAllNotifications() {
    notifications.value = []
  }

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
  }
}
