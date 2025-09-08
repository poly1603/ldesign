/**
 * 系统通知工具函数
 */

import type { NotificationConfig, NotificationOptions } from '../types'
import { platform } from 'node:os'
import { NotificationManager } from './notification-manager'

/**
 * 系统通知工具类
 */
export class NotificationUtils {
  private static defaultManager: NotificationManager | null = null

  /**
   * 获取默认通知管理器
   */
  private static getDefaultManager(): NotificationManager {
    if (!this.defaultManager) {
      this.defaultManager = new NotificationManager()
    }
    return this.defaultManager
  }

  /**
   * 快速发送通知
   */
  static async notify(
    title: string,
    message?: string,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    const manager = this.getDefaultManager()
    return manager.notify({
      title,
      message: message || '',
      ...options,
    })
  }

  /**
   * 快速发送成功通知
   */
  static async success(title: string, message?: string): Promise<string> {
    const manager = this.getDefaultManager()
    return manager.success(title, message)
  }

  /**
   * 快速发送错误通知
   */
  static async error(title: string, message?: string): Promise<string> {
    const manager = this.getDefaultManager()
    return manager.error(title, message)
  }

  /**
   * 快速发送警告通知
   */
  static async warning(title: string, message?: string): Promise<string> {
    const manager = this.getDefaultManager()
    return manager.warning(title, message)
  }

  /**
   * 快速发送信息通知
   */
  static async info(title: string, message?: string): Promise<string> {
    const manager = this.getDefaultManager()
    return manager.info(title, message)
  }

  /**
   * 检查平台支持
   */
  static isPlatformSupported(): boolean {
    const currentPlatform = platform()
    return ['darwin', 'win32', 'linux'].includes(currentPlatform)
  }

  /**
   * 获取平台信息
   */
  static getPlatformInfo(): {
    platform: string
    supported: boolean
    features: string[]
  } {
    const currentPlatform = platform()
    const supported = this.isPlatformSupported()

    const features: string[] = []

    switch (currentPlatform) {
      case 'darwin':
        features.push('rich_notifications', 'sound', 'actions', 'images')
        break
      case 'win32':
        features.push('rich_notifications', 'sound', 'actions', 'images', 'progress')
        break
      case 'linux':
        features.push('basic_notifications', 'sound', 'urgency')
        break
    }

    return {
      platform: currentPlatform,
      supported,
      features,
    }
  }

  /**
   * 批量发送通知
   */
  static async notifyBatch(
    notifications: Array<{
      title: string
      message?: string
      options?: Partial<NotificationOptions>
    }>,
  ): Promise<string[]> {
    const manager = this.getDefaultManager()
    const results: string[] = []

    for (const notification of notifications) {
      try {
        const id = await manager.notify({
          title: notification.title,
          message: notification.message || '',
          ...notification.options,
        })
        results.push(id)
      }
      catch (error) {
        console.error(`Failed to send notification: ${notification.title}`, error)
        results.push('')
      }
    }

    return results
  }

  /**
   * 创建通知模板
   */
  static createTemplate(type: 'success' | 'error' | 'warning' | 'info') {
    return {
      success: (title: string, message?: string) => ({
        title,
        message: message || '操作成功完成',
        type: 'success' as const,
        sound: true,
      }),
      error: (title: string, message?: string) => ({
        title,
        message: message || '操作失败，请重试',
        type: 'error' as const,
        sound: true,
        persistent: true,
      }),
      warning: (title: string, message?: string) => ({
        title,
        message: message || '请注意相关事项',
        type: 'warning' as const,
        sound: true,
      }),
      info: (title: string, message?: string) => ({
        title,
        message: message || '信息提示',
        type: 'info' as const,
        sound: false,
      }),
    }[type]
  }

  /**
   * 创建进度通知
   */
  static async notifyProgress(
    title: string,
    current: number,
    total: number,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    const percentage = Math.round((current / total) * 100)
    const message = `进度: ${current}/${total} (${percentage}%)`

    return this.notify(title, message, {
      ...options,
      progress: percentage,
    })
  }

  /**
   * 创建倒计时通知
   */
  static async notifyCountdown(
    title: string,
    seconds: number,
    onComplete?: () => void,
    options: Partial<NotificationOptions> = {},
  ): Promise<void> {
    let remaining = seconds

    const updateNotification = async () => {
      if (remaining <= 0) {
        await this.notify(title, '倒计时结束！', {
          ...options,
          type: 'success',
        })
        if (onComplete) {
          onComplete()
        }
        return
      }

      await this.notify(title, `剩余时间: ${remaining} 秒`, options)
      remaining--

      setTimeout(updateNotification, 1000)
    }

    updateNotification()
  }

  /**
   * 创建定时通知
   */
  static scheduleNotification(
    title: string,
    message: string,
    delay: number,
    options: Partial<NotificationOptions> = {},
  ): NodeJS.Timeout {
    return setTimeout(async () => {
      await this.notify(title, message, options)
    }, delay)
  }

  /**
   * 创建重复通知
   */
  static scheduleRepeatingNotification(
    title: string,
    message: string,
    interval: number,
    options: Partial<NotificationOptions> = {},
  ): NodeJS.Timeout {
    return setInterval(async () => {
      await this.notify(title, message, options)
    }, interval)
  }

  /**
   * 获取通知历史统计
   */
  static getHistoryStats(): {
    total: number
    unread: number
    byType: Record<string, number>
    recent: number
  } {
    const manager = this.getDefaultManager()
    const history = manager.getHistory()

    const stats = {
      total: history.length,
      unread: manager.getUnreadCount(),
      byType: {} as Record<string, number>,
      recent: 0,
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    history.forEach((notification) => {
      // 按类型统计
      const type = (notification as any).type || 'info'
      stats.byType[type] = (stats.byType[type] || 0) + 1

      // 最近一小时的通知
      if (notification.timestamp > oneHourAgo) {
        stats.recent++
      }
    })

    return stats
  }

  /**
   * 清理过期通知
   */
  static cleanupExpiredNotifications(maxAge: number = 24 * 60 * 60 * 1000): void {
    const manager = this.getDefaultManager()
    const history = manager.getHistory()
    const cutoff = new Date(Date.now() - maxAge)

    // 这里应该有一个方法来删除过期的通知
    // 由于当前的 NotificationManager 没有提供这个方法，我们只是记录
    const expired = history.filter(n => n.timestamp < cutoff)
    process.stdout.write(`Found ${expired.length} expired notifications\n`)
  }

  /**
   * 导出通知历史
   */
  static exportHistory(format: 'json' | 'csv' = 'json'): string {
    const manager = this.getDefaultManager()
    const history = manager.getHistory()

    if (format === 'json') {
      return JSON.stringify(history, null, 2)
    }
    else {
      // CSV 格式
      const headers = ['ID', 'Title', 'Message', 'Timestamp', 'Clicked', 'Dismissed']
      const rows = history.map(n => [
        n.id,
        n.title,
        n.message,
        n.timestamp.toISOString(),
        n.clicked.toString(),
        n.dismissed.toString(),
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }

  /**
   * 设置默认配置
   */
  static setDefaultConfig(config: NotificationConfig): void {
    this.defaultManager = new NotificationManager(config)
  }

  /**
   * 测试通知功能
   */
  static async testNotifications(): Promise<boolean> {
    try {
      await this.info('测试通知', '如果您看到这条消息，说明通知功能正常工作')
      return true
    }
    catch (error) {
      console.error('Notification test failed:', error)
      return false
    }
  }
}
