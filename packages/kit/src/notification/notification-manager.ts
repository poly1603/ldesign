/**
 * 系统通知管理器
 */

import type {
  NotificationConfig,
  NotificationHistory,
  NotificationOptions,
  SystemTrayOptions,
} from '../types'
import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * 系统通知管理器
 */
export class NotificationManager {
  private options: Required<NotificationConfig>
  private history: NotificationHistory[] = []
  private nextId = 1

  constructor(options: NotificationConfig = {}) {
    this.options = {
      appName: options.appName || 'Node.js App',
      icon: options.icon || '',
      sound: options.sound !== false,
      persistent: options.persistent || false,
      maxHistory: options.maxHistory || 100,
    }
  }

  /**
   * 发送通知
   */
  async notify(options: NotificationOptions): Promise<string> {
    const id = this.generateId()
    const notification: NotificationHistory = {
      id,
      title: options.title,
      message: options.message,
      icon: options.icon || this.options.icon,
      timestamp: new Date(),
      clicked: false,
      dismissed: false,
    }

    // 添加到历史记录
    this.addToHistory(notification)

    try {
      await this.sendPlatformNotification(options)
      return id
    }
    catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  /**
   * 发送成功通知
   */
  async success(
    title: string,
    message?: string,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    return this.notify({
      title,
      message: message || '',
      type: 'success',
      icon: options.icon || this.getDefaultIcon('success'),
      ...options,
    })
  }

  /**
   * 发送错误通知
   */
  async error(
    title: string,
    message?: string,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    return this.notify({
      title,
      message: message || '',
      type: 'error',
      icon: options.icon || this.getDefaultIcon('error'),
      ...options,
    })
  }

  /**
   * 发送警告通知
   */
  async warning(
    title: string,
    message?: string,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    return this.notify({
      title,
      message: message || '',
      type: 'warning',
      icon: options.icon || this.getDefaultIcon('warning'),
      ...options,
    })
  }

  /**
   * 发送信息通知
   */
  async info(
    title: string,
    message?: string,
    options: Partial<NotificationOptions> = {},
  ): Promise<string> {
    return this.notify({
      title,
      message: message || '',
      type: 'info',
      icon: options.icon || this.getDefaultIcon('info'),
      ...options,
    })
  }

  /**
   * 获取通知历史
   */
  getHistory(limit?: number): NotificationHistory[] {
    const history = [...this.history].reverse()
    return limit ? history.slice(0, limit) : history
  }

  /**
   * 清空通知历史
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 获取未读通知数量
   */
  getUnreadCount(): number {
    return this.history.filter(n => !n.clicked && !n.dismissed).length
  }

  /**
   * 标记通知为已读
   */
  markAsRead(id: string): void {
    const notification = this.history.find(n => n.id === id)
    if (notification) {
      notification.clicked = true
    }
  }

  /**
   * 标记通知为已忽略
   */
  markAsDismissed(id: string): void {
    const notification = this.history.find(n => n.id === id)
    if (notification) {
      notification.dismissed = true
    }
  }

  /**
   * 检查通知权限
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'default'> {
    const currentPlatform = platform()

    try {
      switch (currentPlatform) {
        case 'darwin':
          // macOS - 检查通知权限
          await execAsync(
            'osascript -e "display notification \\"test\\" with title \\"test\\""',
          )
          return 'granted'

        case 'win32':
          // Windows - 通常默认允许
          return 'granted'

        case 'linux':
          // Linux - 检查 notify-send 是否可用
          try {
            await execAsync('which notify-send')
            return 'granted'
          }
          catch {
            return 'denied'
          }

        default:
          return 'default'
      }
    }
    catch {
      return 'denied'
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission(): Promise<'granted' | 'denied'> {
    const permission = await this.checkPermission()

    if (permission === 'granted') {
      return 'granted'
    }

    // 在不同平台上引导用户开启通知权限
    const currentPlatform = platform()

    switch (currentPlatform) {
      case 'darwin':
        process.stdout.write('请在系统偏好设置 > 通知中允许此应用发送通知\n')
        break

      case 'win32':
        process.stdout.write('请在 Windows 设置 > 系统 > 通知和操作中允许此应用发送通知\n')
        break

      case 'linux':
        process.stdout.write('请安装 libnotify-bin: sudo apt-get install libnotify-bin\n')
        break
    }

    return 'denied'
  }

  /**
   * 创建系统托盘
   */
  async createSystemTray(options: SystemTrayOptions): Promise<void> {
    // 简化的系统托盘实现
    // 实际项目中应该使用 electron 或其他 GUI 框架
    process.stdout.write(`System tray created: ${options.title}\n`)

    if (options.menu) {
      process.stdout.write('Tray menu items:\n')
      options.menu.forEach((item, index) => {
        process.stdout.write(`  ${index + 1}. ${item.label}\n`)
      })
    }
  }

  /**
   * 发送平台特定的通知
   */
  private async sendPlatformNotification(options: NotificationOptions): Promise<void> {
    const currentPlatform = platform()

    switch (currentPlatform) {
      case 'darwin':
        await this.sendMacOSNotification(options)
        break

      case 'win32':
        await this.sendWindowsNotification(options)
        break

      case 'linux':
        await this.sendLinuxNotification(options)
        break

      default:
        throw new Error(`Unsupported platform: ${currentPlatform}`)
    }
  }

  /**
   * 发送 macOS 通知
   */
  private async sendMacOSNotification(options: NotificationOptions): Promise<void> {
    let script = `display notification "${options.message}" with title "${options.title}"`

    if (options.subtitle) {
      script += ` subtitle "${options.subtitle}"`
    }

    if (this.options.sound) {
      script += ` sound name "default"`
    }

    await execAsync(`osascript -e '${script}'`)
  }

  /**
   * 发送 Windows 通知
   */
  private async sendWindowsNotification(options: NotificationOptions): Promise<void> {
    // 使用 PowerShell 发送 Windows 10+ 通知
    const script = `
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
      
      $template = @"
      <toast>
        <visual>
          <binding template="ToastGeneric">
            <text>${options.title}</text>
            <text>${options.message}</text>
          </binding>
        </visual>
      </toast>
"@
      
      $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
      $xml.LoadXml($template)
      $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("${this.options.appName}").Show($toast)
    `

    await execAsync(`powershell -Command "${script.replace(/\n/g, '; ')}"`)
  }

  /**
   * 发送 Linux 通知
   */
  private async sendLinuxNotification(options: NotificationOptions): Promise<void> {
    let command = `notify-send "${options.title}" "${options.message}"`

    if (options.icon) {
      command += ` --icon="${options.icon}"`
    }

    if (options.urgency) {
      command += ` --urgency=${options.urgency}`
    }

    if (options.timeout) {
      command += ` --expire-time=${options.timeout}`
    }

    await execAsync(command)
  }

  /**
   * 获取默认图标
   */
  private getDefaultIcon(type: string): string | undefined {
    const currentPlatform = platform()

    // 返回平台特定的默认图标路径
    switch (currentPlatform) {
      case 'darwin':
        switch (type) {
          case 'success':
            return '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarInfo.icns'
          case 'error':
            return '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
          case 'warning':
            return '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon.icns'
          case 'info':
            return '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarInfo.icns'
        }
        break

      case 'linux':
        switch (type) {
          case 'success':
            return 'dialog-information'
          case 'error':
            return 'dialog-error'
          case 'warning':
            return 'dialog-warning'
          case 'info':
            return 'dialog-information'
        }
        break
    }

    return undefined
  }

  /**
   * 生成通知 ID
   */
  private generateId(): string {
    return `notification_${this.nextId++}_${Date.now()}`
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(notification: NotificationHistory): void {
    this.history.push(notification)

    // 限制历史记录数量
    if (this.history.length > this.options.maxHistory) {
      this.history = this.history.slice(-this.options.maxHistory)
    }
  }

  /**
   * 创建通知管理器实例
   */
  static create(options?: NotificationConfig): NotificationManager {
    return new NotificationManager(options)
  }
}
