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
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.removeEventListeners()
  }

  /**
   * 获取电池信息
   */
  getData(): BatteryInfo {
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

    this.batteryInfo = {
      level: this.battery.level || 1,
      charging: this.battery.charging || false,
      chargingTime: this.battery.chargingTime || Number.POSITIVE_INFINITY,
      dischargingTime: this.battery.dischargingTime || Number.POSITIVE_INFINITY,
    }
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
}
