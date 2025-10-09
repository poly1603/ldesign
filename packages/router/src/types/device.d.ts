/**
 * @ldesign/device 模块类型声明
 *
 * 为 @ldesign/device 包提供类型定义
 */

declare module '@ldesign/device' {
  /**
   * 设备类型枚举
   */
  export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'unknown'

  /**
   * 设备信息接口
   */
  export interface DeviceInfo {
    type: DeviceType
    os: string
    osVersion: string
    browser: string
    browserVersion: string
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    screenWidth: number
    screenHeight: number
    pixelRatio: number
    orientation: 'portrait' | 'landscape'
    touchSupport: boolean
  }

  /**
   * 设备检测器接口
   */
  export interface DeviceDetector {
    /**
     * 获取当前设备信息
     */
    getDeviceInfo(): DeviceInfo

    /**
     * 检测设备类型
     */
    detectDeviceType(): DeviceType

    /**
     * 是否为移动设备
     */
    isMobile(): boolean

    /**
     * 是否为平板设备
     */
    isTablet(): boolean

    /**
     * 是否为桌面设备
     */
    isDesktop(): boolean

    /**
     * 监听设备变化
     */
    onChange(callback: (info: DeviceInfo) => void): () => void
  }

  /**
   * 创建设备检测器
   */
  export function createDeviceDetector(): DeviceDetector

  /**
   * 获取设备类型
   */
  export function getDeviceType(): DeviceType

  /**
   * 获取设备信息
   */
  export function getDeviceInfo(): DeviceInfo

  /**
   * 是否为移动设备
   */
  export function isMobile(): boolean

  /**
   * 是否为平板设备
   */
  export function isTablet(): boolean

  /**
   * 是否为桌面设备
   */
  export function isDesktop(): boolean
}
