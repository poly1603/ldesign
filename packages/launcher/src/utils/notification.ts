/**
 * 系统通知工具类
 * 
 * 提供跨平台的系统通知功能，支持声音和自动消失
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Logger } from '../types'

/**
 * 通知选项接口
 */
export interface NotificationOptions {
  /** 通知标题 */
  title: string
  /** 通知消息 */
  message: string
  /** 通知图标路径 */
  icon?: string
  /** 是否播放声音 */
  sound?: boolean
  /** 通知超时时间（毫秒），0表示不自动消失 */
  timeout?: number
  /** 通知类型 */
  type?: 'info' | 'success' | 'warning' | 'error'
}

/**
 * 系统通知管理器
 */
export class NotificationManager {
  private logger: Logger
  private isEnabled: boolean = true

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 发送系统通知
   * 
   * @param options - 通知选项
   */
  async notify(options: NotificationOptions): Promise<void> {
    if (!this.isEnabled) {
      return
    }

    try {
      // 动态导入 node-notifier
      const notifier = await import('node-notifier')

      // 根据类型设置默认图标和声音
      const finalOptions = this.processOptions(options)

      // 发送通知 - 使用默认的 notify 方法
      notifier.default.notify({
        title: finalOptions.title,
        message: finalOptions.message,
        icon: finalOptions.icon,
        sound: finalOptions.sound,
        timeout: finalOptions.timeout || 3000, // 默认3秒后消失
        wait: false // 不等待用户交互
      })

      this.logger.debug('系统通知已发送', {
        title: finalOptions.title,
        message: finalOptions.message,
        type: finalOptions.type
      })
    } catch (error) {
      this.logger.warn('发送系统通知失败', { error: (error as Error).message })
    }
  }

  /**
   * 发送配置文件变更通知
   * 
   * @param configType - 配置类型 ('launcher' | 'app')
   * @param filePath - 配置文件路径
   * @param environment - 环境名称
   */
  async notifyConfigChange(
    configType: 'launcher' | 'app',
    filePath: string,
    environment?: string
  ): Promise<void> {
    const fileName = filePath.split(/[/\\]/).pop() || filePath
    const envText = environment ? ` (${environment})` : ''

    await this.notify({
      title: `🔄 ${configType === 'launcher' ? 'Launcher' : 'App'} 配置已更新`,
      message: `${fileName}${envText} 配置文件已重新加载`,
      type: 'info',
      sound: true,
      timeout: 3000
    })
  }

  /**
   * 发送成功通知
   */
  async success(title: string, message: string): Promise<void> {
    await this.notify({
      title,
      message,
      type: 'success',
      sound: true,
      timeout: 3000
    })
  }

  /**
   * 发送错误通知
   */
  async error(title: string, message: string): Promise<void> {
    await this.notify({
      title,
      message,
      type: 'error',
      sound: true,
      timeout: 5000 // 错误通知显示更久
    })
  }

  /**
   * 发送警告通知
   */
  async warning(title: string, message: string): Promise<void> {
    await this.notify({
      title,
      message,
      type: 'warning',
      sound: true,
      timeout: 4000
    })
  }

  /**
   * 发送信息通知
   */
  async info(title: string, message: string): Promise<void> {
    await this.notify({
      title,
      message,
      type: 'info',
      sound: false, // 信息通知默认不播放声音
      timeout: 3000
    })
  }

  /**
   * 启用通知
   */
  enable(): void {
    this.isEnabled = true
    this.logger.debug('系统通知已启用')
  }

  /**
   * 禁用通知
   */
  disable(): void {
    this.isEnabled = false
    this.logger.debug('系统通知已禁用')
  }

  /**
   * 检查通知是否启用
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * 处理通知选项，设置默认值
   */
  private processOptions(options: NotificationOptions): Required<NotificationOptions> {
    const type = options.type || 'info'

    return {
      title: options.title,
      message: options.message,
      icon: options.icon || this.getDefaultIcon(type),
      sound: options.sound !== false, // 默认启用声音
      timeout: options.timeout || 3000,
      type
    }
  }

  /**
   * 根据通知类型获取默认图标
   */
  private getDefaultIcon(type: NotificationOptions['type']): string {
    // 这里可以根据不同平台返回不同的图标路径
    // 暂时返回空字符串，使用系统默认图标
    return ''
  }
}

/**
 * 创建通知管理器实例
 */
export function createNotificationManager(logger: Logger): NotificationManager {
  return new NotificationManager(logger)
}
