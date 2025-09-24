import type { DeviceModule, GeolocationInfo } from '../types'
import { EventEmitter } from '../core/EventEmitter'
import { safeNavigatorAccess } from '../utils'

/**
 * 地理位置模块
 */
export class GeolocationModule extends EventEmitter<{ positionChange: GeolocationInfo }> implements DeviceModule {
  name = 'geolocation'
  private geolocationInfo: GeolocationInfo | null = null
  private watchId: number | null = null
  private options: PositionOptions

  constructor(options: PositionOptions = {}) {
    super()
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options,
    }
  }

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined')
      return

    // 不支持时直接返回，不抛错，符合测试期望
    if (!this.isSupported()) {
      return
    }

    try {
      // 获取当前位置（不阻塞初始化，避免在测试环境未注入回调时挂起）
      this.getCurrentPosition().catch((error) => {
        // 静默处理权限被拒绝的情况，避免控制台警告
        if (error.message !== 'Permission denied') {
          console.warn('Failed to get initial position:', error)
        }
      })
    }
    catch (error) {
      // 静默处理权限被拒绝的情况，避免控制台警告
      if ((error as Error).message !== 'Permission denied') {
        console.warn('Failed to get initial position:', error)
      }
    }
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.stopWatching()
  }

  /**
   * 获取地理位置信息
   */
  getData(): GeolocationInfo | null {
    return this.geolocationInfo ? { ...this.geolocationInfo } : null
  }

  /**
   * 检查是否支持地理位置 API
   */
  isSupported(): boolean {
    return safeNavigatorAccess((nav: Navigator & { geolocation?: Geolocation }) => {
      const g = nav.geolocation
      return !!(g && typeof g.getCurrentPosition === 'function')
    }, false)
  }

  /**
   * 获取当前位置
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationInfo> {
    const positionOptions = options ? { ...this.options, ...options } : this.options

    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const info = this.parsePosition(position)
          this.geolocationInfo = info
          this.emit('positionChange', info)
          resolve(info)
        },
        (error) => {
          reject(this.parseGeolocationError(error))
        },
        positionOptions,
      )
    })
  }

  /**
   * 开始监听位置变化
   */
  startWatching(callback?: (position: GeolocationInfo) => void): void {
    if (!this.isSupported()) {
      throw new Error('Geolocation API is not supported')
    }

    if (this.watchId !== null) {
      this.stopWatching()
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const info = this.parsePosition(position)
        this.geolocationInfo = info
        this.emit('positionChange', info)
        callback?.(info)
      },
      (error) => {
        console.error(
          'Geolocation watch error:',
          this.parseGeolocationError(error),
        )
      },
      this.options,
    )
  }

  /**
   * 停止监听位置变化
   */
  stopWatching(): void {
    if (this.watchId !== null && this.isSupported()) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  /**
   * 监听位置变化（别名方法，用于测试兼容性）
   */
  watchPosition(callback: (position: GeolocationInfo) => void): number | null {
    if (!this.isSupported()) {
      throw new Error('Geolocation API is not supported')
    }

    if (this.watchId !== null) {
      this.stopWatching()
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const info = this.parsePosition(position)
        this.geolocationInfo = info
        this.emit('positionChange', info)
        callback(info)
      },
      (error) => {
        console.error(
          'Geolocation watch error:',
          this.parseGeolocationError(error),
        )
      },
      this.options,
    )

    return this.watchId
  }

  /**
   * 清除位置监听（别名方法，用于测试兼容性）
   */
  clearWatch(watchId: number): void {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId)
      if (this.watchId === watchId) {
        this.watchId = null
      }
    }
  }

  /**
   * 获取纬度
   */
  getLatitude(): number | null {
    return this.geolocationInfo?.latitude ?? null
  }

  /**
   * 获取经度
   */
  getLongitude(): number | null {
    return this.geolocationInfo?.longitude ?? null
  }

  /**
   * 获取精度（米）
   */
  getAccuracy(): number | null {
    return this.geolocationInfo?.accuracy ?? null
  }

  /**
   * 获取海拔（米）
   */
  getAltitude(): number | null {
    return this.geolocationInfo?.altitude ?? null
  }

  /**
   * 获取海拔精度（米）
   */
  getAltitudeAccuracy(): number | null {
    return this.geolocationInfo?.altitudeAccuracy ?? null
  }

  /**
   * 获取方向（度）
   */
  getHeading(): number | null {
    return this.geolocationInfo?.heading ?? null
  }

  /**
   * 获取速度（米/秒）
   */
  getSpeed(): number | null {
    return this.geolocationInfo?.speed ?? null
  }

  /**
   * 计算两点之间的距离（米）
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3 // 地球半径（米）
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a
      = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
        + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * 计算与当前位置的距离
   */
  getDistanceFromCurrent(latitude: number, longitude: number): number | null {
    if (!this.geolocationInfo)
      return null

    return this.calculateDistance(
      this.geolocationInfo.latitude,
      this.geolocationInfo.longitude,
      latitude,
      longitude,
    )
  }

  /**
   * 解析位置信息
   */
  private parsePosition(position: GeolocationPosition): GeolocationInfo {
    const { coords } = position

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude ?? null,
      altitudeAccuracy: coords.altitudeAccuracy ?? null,
      heading: coords.heading ?? null,
      speed: coords.speed ?? null,
      // 一些测试期望包含时间戳
      timestamp: typeof position.timestamp === 'number' ? position.timestamp : Date.now(),
    } as GeolocationInfo
  }

  /**
   * 解析地理位置错误
   */
  private parseGeolocationError(error: GeolocationPositionError): Error {
    const errorMessages: Record<number, string> = {
      [error.PERMISSION_DENIED]: 'Permission denied',
      [error.POSITION_UNAVAILABLE]: 'Position unavailable',
      [error.TIMEOUT]: 'Request timeout',
    }

    const message = errorMessages[error.code] || 'An unknown error occurred'
    return new Error(message)
  }
}
