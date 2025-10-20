import type { BatteryInfo, DeviceModule } from '../types'
import { safeNavigatorAccess } from '../utils'

/**
 * 电池信息模块
 */
interface BatteryManager {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

export class BatteryModule implements DeviceModule {
  name = 'battery'
  private batteryInfo: BatteryInfo
  private battery: BatteryManager | null = null
  private eventHandlers: Map<string, () => void> = new Map()
  private customEventHandlers: Map<string, Set<(data: unknown) => void>> = new Map()

  constructor() {
    this.batteryInfo = this.getDefaultBatteryInfo()
  }

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined')
      return

    try {
      // 获取电池 API
      this.battery = await safeNavigatorAccess(async (nav) => {
        if ('getBattery' in nav && nav.getBattery) {
          return await nav.getBattery()
        }
        // 降级到旧版本的 API
        const navAny = nav as unknown as Record<string, unknown>
        return (navAny.battery
          || navAny.mozBattery
          || navAny.webkitBattery) as BatteryManager | null
      }, null)

      if (this.battery) {
        this.updateBatteryInfo()
        this.setupEventListeners()
      }
    }
    catch (error) {
      console.warn('Battery API not supported or failed to initialize:', error)
    }
  }

  /**
   * 销毁模块（优化：彻底清理所有引用）
   */
  async destroy(): Promise<void> {
    this.removeEventListeners()
    
    // 清理引用以帮助垃圾回收
    this.battery = null
    this.eventHandlers.clear()
    this.customEventHandlers.clear()
  }

  /**
   * 获取电池信息
   */
  getData(): BatteryInfo {
    // 每次获取时尝试同步最新的电池信息，满足测试对实时性的期望
    this.updateBatteryInfo()
    return { ...this.batteryInfo }
  }

  /**
   * 获取电池电量（0-1）
   */
  getLevel(): number {
    return this.batteryInfo.level
  }

  /**
   * 获取电池电量百分比（0-100）
   */
  getLevelPercentage(): number {
    return Math.round(this.batteryInfo.level * 100)
  }

  /**
   * 检查是否正在充电
   */
  isCharging(): boolean {
    return this.batteryInfo.charging
  }

  /**
   * 获取充电时间（秒）
   */
  getChargingTime(): number {
    return this.batteryInfo.chargingTime
  }

  /**
   * 获取放电时间（秒）
   */
  getDischargingTime(): number {
    return this.batteryInfo.dischargingTime
  }

  /**
   * 获取充电时间（格式化）
   */
  getChargingTimeFormatted(): string {
    return this.formatTime(this.batteryInfo.chargingTime)
  }

  /**
   * 获取放电时间（格式化）
   */
  getDischargingTimeFormatted(): string {
    return this.formatTime(this.batteryInfo.dischargingTime)
  }

  /**
   * 检查电池是否电量低
   */
  isLowBattery(threshold = 0.2): boolean {
    return this.batteryInfo.level <= threshold
  }

  /**
   * 检查电池是否电量充足
   */
  isHighBattery(threshold = 0.8): boolean {
    return this.batteryInfo.level >= threshold
  }

  /**
   * 获取电池状态描述
   */
  getBatteryStatus(): string {
    if (this.batteryInfo.charging) {
      return 'charging'
    }
    if (this.isLowBattery()) {
      return 'low'
    }
    if (this.isHighBattery()) {
      return 'high'
    }
    return 'normal'
  }

  /**
   * 获取默认电池信息
   */
  private getDefaultBatteryInfo(): BatteryInfo {
    return {
      level: 1,
      charging: false,
      chargingTime: Number.POSITIVE_INFINITY,
      dischargingTime: Number.POSITIVE_INFINITY,
    }
  }

  /**
   * 更新电池信息
   */
  private updateBatteryInfo(): void {
    if (!this.battery)
      return

    const normalizeTime = (t: number | null | undefined): number => {
      if (typeof t !== 'number' || !Number.isFinite(t) || t < 0 || t === Number.MAX_VALUE)
        return Number.POSITIVE_INFINITY
      return t
    }

    this.batteryInfo = {
      level: typeof this.battery.level === 'number' ? this.battery.level : 1,
      charging: !!this.battery.charging,
      chargingTime: normalizeTime((this.battery as unknown as { chargingTime?: number }).chargingTime),
      dischargingTime: normalizeTime((this.battery as unknown as { dischargingTime?: number }).dischargingTime),
    }

    // 触发电池状态变化事件
    this.emit('batteryChange', this.batteryInfo)
  }

  /**
   * 格式化时间
   */
  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) {
      return '未知'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.battery || typeof this.battery.addEventListener !== 'function')
      return

    const events = [
      'chargingchange',
      'levelchange',
      'chargingtimechange',
      'dischargingtimechange',
    ]

    events.forEach((event) => {
      const handler = () => {
        this.updateBatteryInfo()
      }
      this.eventHandlers.set(event, handler)
      if (this.battery) {
        this.battery.addEventListener(event, handler)
      }
    })
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (!this.battery || typeof this.battery.removeEventListener !== 'function')
      return

    this.eventHandlers.forEach((handler, event) => {
      if (this.battery) {
        this.battery.removeEventListener(event, handler)
      }
    })
    this.eventHandlers.clear()
  }

  /**
   * 添加自定义事件监听器
   */
  on(event: string, handler: (data: unknown) => void): void {
    if (!this.customEventHandlers.has(event)) {
      this.customEventHandlers.set(event, new Set())
    }
    this.customEventHandlers.get(event)?.add(handler)
  }

  /**
   * 移除自定义事件监听器
   */
  off(event: string, handler: (data: unknown) => void): void {
    const handlers = this.customEventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.customEventHandlers.delete(event)
      }
    }
  }

  /**
   * 触发自定义事件
   */
  private emit(event: string, data: unknown): void {
    const handlers = this.customEventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        }
        catch (error) {
          console.warn(`Error in battery event handler for ${event}:`, error)
        }
      })
    }
  }
}
