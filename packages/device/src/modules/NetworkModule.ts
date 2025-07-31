import type { DeviceModule, NetworkInfo, NetworkStatus, NetworkType } from '../types'
import { safeNavigatorAccess } from '../utils'

/**
 * 网络信息模块
 */
export class NetworkModule implements DeviceModule {
  name = 'network'
  private networkInfo: NetworkInfo
  private connection: any
  private onlineHandler?: () => void
  private offlineHandler?: () => void
  private changeHandler?: () => void

  constructor() {
    this.networkInfo = this.detectNetworkInfo()
  }

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined')
      return

    // 获取网络连接对象
    this.connection = safeNavigatorAccess(
      nav => (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection,
      null,
    )

    // 设置事件监听器
    this.setupEventListeners()

    // 初始检测
    this.updateNetworkInfo()
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.removeEventListeners()
  }

  /**
   * 获取网络信息
   */
  getData(): NetworkInfo {
    return { ...this.networkInfo }
  }

  /**
   * 获取网络连接状态
   */
  getStatus(): NetworkStatus {
    return this.networkInfo.status
  }

  /**
   * 获取网络连接类型
   */
  getConnectionType(): NetworkType {
    return this.networkInfo.type
  }

  /**
   * 获取下载速度（Mbps）
   */
  getDownlink(): number | undefined {
    return this.networkInfo.downlink
  }

  /**
   * 获取往返时间（毫秒）
   */
  getRTT(): number | undefined {
    return this.networkInfo.rtt
  }

  /**
   * 是否为计量连接
   */
  isSaveData(): boolean | undefined {
    return this.networkInfo.saveData
  }

  /**
   * 检查是否在线
   */
  isOnline(): boolean {
    return this.networkInfo.status === 'online'
  }

  /**
   * 检查是否离线
   */
  isOffline(): boolean {
    return this.networkInfo.status === 'offline'
  }

  /**
   * 检测网络信息
   */
  private detectNetworkInfo(): NetworkInfo {
    if (typeof window === 'undefined') {
      return {
        status: 'online',
        type: 'unknown',
      }
    }

    const status: NetworkStatus = navigator.onLine ? 'online' : 'offline'
    const connection = safeNavigatorAccess(
      nav => (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection,
      null,
    )

    const networkInfo: NetworkInfo = {
      status,
      type: this.parseConnectionType(connection?.effectiveType || connection?.type),
    }

    // 添加额外的网络信息（如果可用）
    if (connection) {
      if (typeof connection.downlink === 'number') {
        networkInfo.downlink = connection.downlink
      }
      if (typeof connection.rtt === 'number') {
        networkInfo.rtt = connection.rtt
      }
      if (typeof connection.saveData === 'boolean') {
        networkInfo.saveData = connection.saveData
      }
    }

    return networkInfo
  }

  /**
   * 解析连接类型
   */
  private parseConnectionType(type?: string): NetworkType {
    if (!type)
      return 'unknown'

    const typeMap: Record<string, NetworkType> = {
      'slow-2g': 'cellular',
      '2g': 'cellular',
      '3g': 'cellular',
      '4g': 'cellular',
      '5g': 'cellular',
      'wifi': 'wifi',
      'ethernet': 'ethernet',
      'bluetooth': 'bluetooth',
    }

    return typeMap[type.toLowerCase()] || 'unknown'
  }

  /**
   * 更新网络信息
   */
  private updateNetworkInfo(): void {
    this.networkInfo = this.detectNetworkInfo()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined')
      return

    // 监听在线/离线状态变化
    this.onlineHandler = () => {
      this.updateNetworkInfo()
    }
    this.offlineHandler = () => {
      this.updateNetworkInfo()
    }

    window.addEventListener('online', this.onlineHandler)
    window.addEventListener('offline', this.offlineHandler)

    // 监听网络连接变化
    if (this.connection && 'addEventListener' in this.connection) {
      this.changeHandler = () => {
        this.updateNetworkInfo()
      }
      this.connection.addEventListener('change', this.changeHandler)
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (typeof window === 'undefined')
      return

    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
      this.onlineHandler = undefined
    }

    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler)
      this.offlineHandler = undefined
    }

    if (this.connection && this.changeHandler && 'removeEventListener' in this.connection) {
      this.connection.removeEventListener('change', this.changeHandler)
      this.changeHandler = undefined
    }
  }
}
