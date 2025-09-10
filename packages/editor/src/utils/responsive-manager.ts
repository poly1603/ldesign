/**
 * 响应式管理器
 * 负责处理编辑器的响应式布局和设备适配
 */

import { DeviceType } from '../types'
import type { BreakpointConfig } from '../types'
import { addClass, removeClass } from './index'

/**
 * 响应式管理器实现
 */
export class ResponsiveManager {
  /** 容器元素 */
  private container: HTMLElement

  /** 断点配置 */
  private breakpoints: Required<BreakpointConfig>

  /** 当前设备类型 */
  private currentDevice: DeviceType

  /** 窗口大小变化监听器 */
  private resizeObserver: ResizeObserver | null = null

  /** 设备变更监听器 */
  private deviceChangeListeners: Array<(device: DeviceType, prevDevice: DeviceType) => void> = []

  /** 防抖定时器 */
  private debounceTimer: number | null = null

  constructor(container: HTMLElement, breakpoints?: BreakpointConfig) {
    this.container = container
    this.breakpoints = {
      mobile: breakpoints?.mobile ?? 768,
      tablet: breakpoints?.tablet ?? 1024,
      desktop: breakpoints?.desktop ?? 1200
    }

    // 初始化当前设备类型
    this.currentDevice = this.detectDeviceType()

    // 应用初始设备样式
    this.applyDeviceStyles(this.currentDevice)

    // 启动监听
    this.startListening()
  }

  /**
   * 获取当前设备类型
   * @returns 当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.currentDevice
  }

  /**
   * 获取断点配置
   * @returns 断点配置
   */
  getBreakpoints(): Required<BreakpointConfig> {
    return { ...this.breakpoints }
  }

  /**
   * 更新断点配置
   * @param breakpoints 新的断点配置
   */
  updateBreakpoints(breakpoints: Partial<BreakpointConfig>): void {
    this.breakpoints = {
      ...this.breakpoints,
      ...breakpoints
    }

    // 重新检测设备类型
    this.checkDeviceChange()
  }

  /**
   * 检查是否为移动设备
   * @returns 是否为移动设备
   */
  isMobile(): boolean {
    return this.currentDevice === 'mobile'
  }

  /**
   * 检查是否为平板设备
   * @returns 是否为平板设备
   */
  isTablet(): boolean {
    return this.currentDevice === 'tablet'
  }

  /**
   * 检查是否为桌面设备
   * @returns 是否为桌面设备
   */
  isDesktop(): boolean {
    return this.currentDevice === 'desktop'
  }

  /**
   * 获取容器宽度
   * @returns 容器宽度
   */
  getContainerWidth(): number {
    return this.container.clientWidth
  }

  /**
   * 获取容器高度
   * @returns 容器高度
   */
  getContainerHeight(): number {
    return this.container.clientHeight
  }

  /**
   * 添加设备变更监听器
   * @param listener 监听器函数
   */
  onDeviceChange(listener: (device: DeviceType, prevDevice: DeviceType) => void): void {
    this.deviceChangeListeners.push(listener)
  }

  /**
   * 移除设备变更监听器
   * @param listener 监听器函数
   */
  offDeviceChange(listener: (device: DeviceType, prevDevice: DeviceType) => void): void {
    const index = this.deviceChangeListeners.indexOf(listener)
    if (index > -1) {
      this.deviceChangeListeners.splice(index, 1)
    }
  }

  /**
   * 强制检查设备变更
   */
  checkDeviceChange(): void {
    const newDevice = this.detectDeviceType()
    if (newDevice !== this.currentDevice) {
      this.handleDeviceChange(newDevice)
    }
  }

  /**
   * 获取设备特定的样式配置
   * @param device 设备类型
   * @returns 样式配置
   */
  getDeviceStyles(device: DeviceType): Record<string, string> {
    const baseStyles = {
      mobile: {
        '--ldesign-editor-padding': 'var(--ls-padding-sm)',
        '--ldesign-editor-font-size': 'var(--ls-font-size-sm)',
        '--ldesign-toolbar-height': '44px',
        '--ldesign-button-size': '40px',
        '--ldesign-icon-size': 'var(--ls-icon-size-small)'
      },
      tablet: {
        '--ldesign-editor-padding': 'var(--ls-padding-base)',
        '--ldesign-editor-font-size': 'var(--ls-font-size-base)',
        '--ldesign-toolbar-height': '48px',
        '--ldesign-button-size': '44px',
        '--ldesign-icon-size': 'var(--ls-icon-size-medium)'
      },
      desktop: {
        '--ldesign-editor-padding': 'var(--ls-padding-base)',
        '--ldesign-editor-font-size': 'var(--ls-font-size-base)',
        '--ldesign-toolbar-height': '52px',
        '--ldesign-button-size': '48px',
        '--ldesign-icon-size': 'var(--ls-icon-size-large)'
      }
    }

    return baseStyles[device] || baseStyles.desktop
  }

  /**
   * 获取设备特定的配置
   * @param device 设备类型
   * @returns 设备配置
   */
  getDeviceConfig(device: DeviceType): {
    touchEnabled: boolean
    keyboardShortcuts: boolean
    contextMenu: boolean
    dragAndDrop: boolean
  } {
    const configs = {
      mobile: {
        touchEnabled: true,
        keyboardShortcuts: false,
        contextMenu: false,
        dragAndDrop: false
      },
      tablet: {
        touchEnabled: true,
        keyboardShortcuts: true,
        contextMenu: true,
        dragAndDrop: true
      },
      desktop: {
        touchEnabled: false,
        keyboardShortcuts: true,
        contextMenu: true,
        dragAndDrop: true
      }
    }

    return configs[device] || configs.desktop
  }

  /**
   * 检测设备类型
   * @returns 设备类型
   */
  private detectDeviceType(): DeviceType {
    const width = this.getContainerWidth()

    if (width < this.breakpoints.mobile) {
      return DeviceType.Mobile
    } else if (width < this.breakpoints.tablet) {
      return DeviceType.Tablet
    } else {
      return DeviceType.Desktop
    }
  }

  /**
   * 应用设备样式
   * @param device 设备类型
   */
  private applyDeviceStyles(device: DeviceType): void {
    // 移除所有设备类名
    removeClass(this.container, 'ldesign-editor-mobile')
    removeClass(this.container, 'ldesign-editor-tablet')
    removeClass(this.container, 'ldesign-editor-desktop')

    // 添加当前设备类名
    addClass(this.container, `ldesign-editor-${device}`)

    // 应用设备特定的CSS变量
    const styles = this.getDeviceStyles(device)
    Object.entries(styles).forEach(([property, value]) => {
      this.container.style.setProperty(property, value)
    })
  }

  /**
   * 处理设备变更
   * @param newDevice 新设备类型
   */
  private handleDeviceChange(newDevice: DeviceType): void {
    const prevDevice = this.currentDevice
    this.currentDevice = newDevice

    // 应用新设备样式
    this.applyDeviceStyles(newDevice)

    // 通知监听器
    this.notifyDeviceChange(newDevice, prevDevice)

    console.log(`Device changed from ${prevDevice} to ${newDevice}`)
  }

  /**
   * 通知设备变更监听器
   * @param device 当前设备
   * @param prevDevice 之前设备
   */
  private notifyDeviceChange(device: DeviceType, prevDevice: DeviceType): void {
    this.deviceChangeListeners.forEach(listener => {
      try {
        listener(device, prevDevice)
      } catch (error) {
        console.error('Error in device change listener:', error)
      }
    })
  }

  /**
   * 开始监听窗口大小变化
   */
  private startListening(): void {
    // 使用 ResizeObserver 监听容器大小变化
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        this.handleResize()
      })
      this.resizeObserver.observe(this.container)
    } else {
      // 降级到 window resize 事件
      window.addEventListener('resize', this.handleResize.bind(this))
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    // 防抖处理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      this.checkDeviceChange()
      this.debounceTimer = null
    }, 150)
  }

  /**
   * 停止监听
   */
  private stopListening(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    } else {
      window.removeEventListener('resize', this.handleResize.bind(this))
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 获取调试信息
   * @returns 调试信息
   */
  getDebugInfo(): {
    currentDevice: DeviceType
    containerWidth: number
    containerHeight: number
    breakpoints: Required<BreakpointConfig>
    listeners: number
  } {
    return {
      currentDevice: this.currentDevice,
      containerWidth: this.getContainerWidth(),
      containerHeight: this.getContainerHeight(),
      breakpoints: this.breakpoints,
      listeners: this.deviceChangeListeners.length
    }
  }

  /**
   * 销毁响应式管理器
   */
  destroy(): void {
    // 停止监听
    this.stopListening()

    // 清理监听器
    this.deviceChangeListeners = []

    // 移除设备类名
    removeClass(this.container, 'ldesign-editor-mobile')
    removeClass(this.container, 'ldesign-editor-tablet')
    removeClass(this.container, 'ldesign-editor-desktop')

    console.log('ResponsiveManager destroyed')
  }
}
