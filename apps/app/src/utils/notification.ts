/**
 * 简单的通知工具
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationOptions {
  title: string
  message: string
  type: NotificationType
  duration?: number
}

/**
 * 显示通知
 */
export function showNotification(
  title: string,
  message: string,
  type: NotificationType = 'info',
  duration: number = 3000,
) {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`)

  // 简单的浏览器通知实现
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon:
        type === 'success'
          ? '✅'
          : type === 'error'
            ? '❌'
            : type === 'warning'
              ? '⚠️'
              : 'ℹ️',
    })
  }
  else {
    // 使用 alert 作为后备方案
    alert(`${title}\n${message}`)
  }
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
