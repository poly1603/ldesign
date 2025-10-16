/**
 * 网络状态感知
 *
 * 监听网络状态变化，自动处理离线/在线场景
 */

/**
 * 网络状态
 */
export enum NetworkStatus {
 /** 在线 */
 ONLINE = 'online',
 /** 离线 */
 OFFLINE = 'offline',
 /** 未知 */
 UNKNOWN = 'unknown',
}

/**
 * 连接类型
 */
export enum ConnectionType {
 /** WiFi */
 WIFI = 'wifi',
 /** 4G */
 CELLULAR_4G = '4g',
 /** 3G */
 CELLULAR_3G = '3g',
 /** 2G */
 CELLULAR_2G = '2g',
 /** 未知 */
 UNKNOWN = 'unknown',
}

/**
 * 网络状态信息
 */
export interface NetworkInfo {
 /** 是否在线 */
 online: boolean
 /** 连接类型 */
 connectionType: ConnectionType
 /** 是否按流量计费 */
 metered: boolean
 /** 下行速度(Mbps) */
 downlink?: number
 /** 往返时间(ms) */
 rtt?: number
 /** 有效类型 */
 effectiveType?: string
}

/**
 * 网络状态监听器配置
 */
export interface NetworkMonitorConfig {
 /** 是否启用 */
 enabled?: boolean
 /** 离线时是否暂停请求 */
 pauseOnOffline?: boolean
 /** 在线时是否自动重试失败的请求 */
 retryOnOnline?: boolean
 /** 状态变化回调 */
 onStatusChange?: (status: NetworkStatus, info: NetworkInfo) => void
 /** 离线回调 */
 onOffline?: () => void
 /** 在线回调 */
 onOnline?: () => void
}

/**
 * 网络状态监听器
 *
 * @example
 * ```typescript
 * const monitor = new NetworkMonitor({
 *  enabled: true,
 *  onStatusChange: (status, info) => {
 *   
 *  },
 *  onOffline: () => {
 *   
 *  },
 *  onOnline: () => {
 *   
 *  },
 * })
 *
 * monitor.start()
 *
 * // 获取当前状态
 * const info = monitor.getNetworkInfo()
 * 
 * ```
 */
export class NetworkMonitor {
 public config: Required<Omit<NetworkMonitorConfig, 'onStatusChange' | 'onOffline' | 'onOnline'>> & Pick<NetworkMonitorConfig, 'onStatusChange' | 'onOffline' | 'onOnline'>
 private currentStatus: NetworkStatus = NetworkStatus.UNKNOWN
 private listeners: Array<() => void> = []
 private isMonitoring: boolean = false

 constructor(config: NetworkMonitorConfig = {}) {
  this.config = {
   enabled: config.enabled ?? true,
   pauseOnOffline: config.pauseOnOffline ?? true,
   retryOnOnline: config.retryOnOnline ?? true,
   onStatusChange: config.onStatusChange,
   onOffline: config.onOffline,
   onOnline: config.onOnline,
  }

  // 初始化当前状态
  this.updateStatus()
 }

 /**
  * 开始监听
  */
 start(): void {
  if (!this.config?.enabled || this.isMonitoring) {
   return
  }

  if (typeof window === 'undefined') {
   return
  }

  this.isMonitoring = true

  // 监听online事件
  const handleOnline = () => {
   this.handleStatusChange(NetworkStatus.ONLINE)
   this.config?.onOnline?.()
  }

  // 监听offline事件
  const handleOffline = () => {
   this.handleStatusChange(NetworkStatus.OFFLINE)
   this.config?.onOffline?.()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 保存监听器以便清理
  this.listeners.push(
   () => window.removeEventListener('online', handleOnline),
   () => window.removeEventListener('offline', handleOffline),
  )

  // 如果支持Network Information API,也监听连接变化
  if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
   const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

   const handleConnectionChange = () => {
    this.updateStatus()
   }

   connection.addEventListener('change', handleConnectionChange)
   this.listeners.push(() => connection.removeEventListener('change', handleConnectionChange))
  }
 }

 /**
  * 停止监听
  */
 stop(): void {
  if (!this.isMonitoring) {
   return
  }

  this.isMonitoring = false

  // 清理所有监听器
  this.listeners.forEach(cleanup => cleanup())
  this.listeners = []
 }

 /**
  * 获取当前网络状态
  */
 getStatus(): NetworkStatus {
  return this.currentStatus
 }

 /**
  * 是否在线
  */
 isOnline(): boolean {
  return this.currentStatus === NetworkStatus.ONLINE
 }

 /**
  * 是否离线
  */
 isOffline(): boolean {
  return this.currentStatus === NetworkStatus.OFFLINE
 }

 /**
  * 获取网络信息
  */
 getNetworkInfo(): NetworkInfo {
  const info: NetworkInfo = {
   online: this.isOnline(),
   connectionType: ConnectionType.UNKNOWN,
   metered: false,
  }

  if (typeof navigator === 'undefined') {
   return info
  }

  // 获取连接信息
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
   // 连接类型
   if (connection.effectiveType) {
    info.effectiveType = connection.effectiveType
    info.connectionType = this.parseConnectionType(connection.effectiveType)
   }

   // 是否按流量计费
   if (typeof connection.saveData === 'boolean') {
    info.metered = connection.saveData
   }

   // 下行速度
   if (typeof connection.downlink === 'number') {
    info.downlink = connection.downlink
   }

   // 往返时间
   if (typeof connection.rtt === 'number') {
    info.rtt = connection.rtt
   }
  }

  return info
 }

 /**
  * 处理状态变化
  */
 private handleStatusChange(newStatus: NetworkStatus): void {
  if (this.currentStatus === newStatus) {
   return
  }

  this.currentStatus = newStatus
  const info = this.getNetworkInfo()

  // 触发回调
  this.config?.onStatusChange?.(newStatus, info)
 }

 /**
  * 更新状态
  */
 private updateStatus(): void {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
   this.currentStatus = navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE
  }
  else {
   this.currentStatus = NetworkStatus.UNKNOWN
  }
 }

 /**
  * 解析连接类型
  */
 private parseConnectionType(effectiveType: string): ConnectionType {
  switch (effectiveType.toLowerCase()) {
   case '4g':
    return ConnectionType.CELLULAR_4G
   case '3g':
    return ConnectionType.CELLULAR_3G
   case '2g':
    return ConnectionType.CELLULAR_2G
   case 'wifi':
    return ConnectionType.WIFI
   default:
    return ConnectionType.UNKNOWN
  }
 }

 /**
  * 判断当前网络是否适合大文件传输
  */
 isSuitableForLargeTransfer(): boolean {
  const info = this.getNetworkInfo()

  // 离线不适合
  if (!info.online) {
   return false
  }

  // 按流量计费不适合
  if (info.metered) {
   return false
  }

  // 2G/3G网络不适合
  if (
   info.connectionType === ConnectionType.CELLULAR_2G
   || info.connectionType === ConnectionType.CELLULAR_3G
  ) {
   return false
  }

  // 下行速度太慢不适合 (< 1 Mbps)
  if (info.downlink && info.downlink < 1) {
   return false
  }

  return true
 }

 /**
  * 销毁监听器
  */
 destroy(): void {
  this.stop()
 }
}

/**
 * 创建网络状态监听器
 */
export function createNetworkMonitor(config?: NetworkMonitorConfig): NetworkMonitor {
 return new NetworkMonitor(config)
}

/**
 * 全局网络状态监听器
 */
export const globalNetworkMonitor = new NetworkMonitor()

// 自动启动全局监听器
if (typeof window !== 'undefined') {
 globalNetworkMonitor.start()
}

/**
 * 网络状态拦截器
 *
 * 在离线时阻止请求，在线时自动重试
 */
export function createNetworkInterceptor(config?: NetworkMonitorConfig) {
 const monitor = new NetworkMonitor(config)
 monitor.start()

 const pendingRequests: Array<{ config: any, resolve: any, reject: any }> = []

 // 在线时处理待处理的请求
 monitor.start()

 return {
  request: {
   onFulfilled: async (requestConfig: any) => {
    // 检查网络状态
    if (monitor.isOffline()) {
     // 如果配置了离线暂停，将请求加入队列
     if (monitor.config.pauseOnOffline) {
      return new Promise((resolve, reject) => {
       pendingRequests.push({
        config: requestConfig,
        resolve,
        reject,
       })

       // 监听网络恢复
       const checkOnline = () => {
        if (monitor.isOnline()) {
         // 网络恢复，处理待处理的请求
         const pending = pendingRequests.shift()
         if (pending) {
          resolve(pending.config)
         }
        }
       }

       const timer = setInterval(checkOnline, 1000)

       // 5分钟超时
       setTimeout(() => {
        clearInterval(timer)
        const index = pendingRequests.findIndex(p => p.config === requestConfig)
        if (index !== -1) {
         pendingRequests.splice(index, 1)
         reject(new Error('Network timeout: request cancelled after 5 minutes'))
        }
       }, 5 * 60 * 1000)
      })
     }

     // 否则直接抛出错误
     throw new Error('Network is offline')
    }

    return requestConfig
   },
  },

  destroy: () => {
   monitor.destroy()
  },
 }
}

/**
 * 便捷函数: 等待网络恢复
 */
export function waitForOnline(timeout = 60000): Promise<void> {
 return new Promise((resolve, reject) => {
  if (globalNetworkMonitor.isOnline()) {
   resolve()
   return
  }

  const timer = setTimeout(() => {
   reject(new Error('Timeout waiting for network'))
  }, timeout)

  const checkOnline = () => {
   if (globalNetworkMonitor.isOnline()) {
    clearTimeout(timer)
    resolve()
   }
  }

  const interval = setInterval(checkOnline, 1000)

  setTimeout(() => clearInterval(interval), timeout)
 })
}
