/**
 * 弹幕插件
 * 实现弹幕发送、接收、显示和管理功能
 */

import { OverlayPlugin } from '../../core/base-plugin'
import { createElement, addClass, removeClass, setStyle } from '../../utils/dom'
import { throttle, debounce } from '../../utils/events'
import { formatTime } from '../../utils/format'
import { generateId } from '../../utils/common'
import type { PluginContext, PluginMetadata } from '../../types/plugin'
import { PlayerEvent } from '../../types/player'
import { DanmakuType } from '../../types/danmaku'
import type {
  DanmakuItem,
  DanmakuConfig,
  DanmakuRenderer,
  DanmakuCollisionDetector
} from '../../types/danmaku'

/**
 * 弹幕插件配置选项
 */
export interface DanmakuOptions {
  /** 是否启用弹幕 */
  enabled?: boolean
  /** 弹幕透明度 (0-1) */
  opacity?: number
  /** 弹幕速度倍率 */
  speed?: number
  /** 弹幕字体大小 */
  fontSize?: number
  /** 弹幕字体 */
  fontFamily?: string
  /** 弹幕描边宽度 */
  strokeWidth?: number
  /** 弹幕描边颜色 */
  strokeColor?: string
  /** 最大弹幕数量 */
  maxCount?: number
  /** 弹幕显示区域高度比例 (0-1) */
  areaRatio?: number
  /** 是否启用碰撞检测 */
  collision?: boolean
  /** 弹幕过滤器 */
  filters?: Array<(danmaku: DanmakuItem) => boolean>
  /** 弹幕数据源URL */
  source?: string
  /** 是否允许发送弹幕 */
  allowSend?: boolean
  /** 发送弹幕的API端点 */
  sendApi?: string
  /** 弹幕池大小 */
  poolSize?: number
  /** 性能优化选项 */
  performance?: {
    /** 是否启用GPU加速 */
    useGPU?: boolean
    /** 渲染帧率限制 */
    maxFPS?: number
    /** 内存回收阈值 */
    memoryThreshold?: number
  }
}

/**
 * 弹幕配置
 */
export interface DanmakuConfig extends DanmakuOptions {
  container: HTMLElement
  width: number
  height: number
}

/**
 * 弹幕插件实现
 */
export class DanmakuPlugin extends OverlayPlugin {
  private _config: DanmakuConfig
  private _danmakuList: DanmakuItem[] = []
  private _activeDanmaku: Map<string, HTMLElement> = new Map()
  private _danmakuPool: HTMLElement[] = []
  private _renderer?: DanmakuRenderer
  private _collisionDetector?: DanmakuCollisionDetector
  private _animationId?: number
  private _lastTime = 0
  private _paused = false
  private _input?: HTMLElement
  private _sendButton?: HTMLElement

  constructor(options: DanmakuOptions = {}) {
    const metadata: PluginMetadata = {
      name: 'danmaku',
      version: '1.0.0',
      description: '弹幕插件，支持弹幕显示、发送和管理',
      author: 'LDesign Team',
      dependencies: []
    }

    super(metadata, options)

    this._config = this.createConfig(options)
  }

  /**
   * 弹幕配置
   */
  get config(): DanmakuConfig {
    return { ...this._config }
  }

  /**
   * 当前弹幕列表
   */
  get danmakuList(): DanmakuItem[] {
    return [...this._danmakuList]
  }

  /**
   * 活跃弹幕数量
   */
  get activeCount(): number {
    return this._activeDanmaku.size
  }

  /**
   * 是否暂停
   */
  get paused(): boolean {
    return this._paused
  }

  /**
   * 添加弹幕
   */
  addDanmaku(danmaku: Omit<DanmakuItem, 'id'>): void {
    const item: DanmakuItem = {
      id: generateId('danmaku'),
      ...danmaku
    }

    // 应用过滤器
    if (this._config.filters) {
      const shouldShow = this._config.filters.every(filter => filter(item))
      if (!shouldShow) {
        return
      }
    }

    this._danmakuList.push(item)
    this.emit('danmakuAdded', { danmaku: item })
  }

  /**
   * 批量添加弹幕
   */
  addDanmakuList(danmakuList: Array<Omit<DanmakuItem, 'id'>>): void {
    danmakuList.forEach(danmaku => this.addDanmaku(danmaku))
  }

  /**
   * 清空弹幕
   */
  clearDanmaku(): void {
    this._danmakuList = []
    this._activeDanmaku.forEach(element => this.recycleDanmakuElement(element))
    this._activeDanmaku.clear()
    this.emit('danmakuCleared')
  }

  /**
   * 清空弹幕（别名方法）
   */
  clear(): void {
    this.clearDanmaku()
  }

  /**
   * 发送弹幕
   */
  async sendDanmaku(text: string, type: DanmakuType = DanmakuType.SCROLL, color = '#ffffff'): Promise<void> {
    if (!this._config.allowSend) {
      throw new Error('Sending danmaku is not allowed')
    }

    const context = this.getContext()
    const currentTime = context.player.status.currentTime

    const danmaku: Omit<DanmakuItem, 'id'> = {
      text,
      time: currentTime,
      type,
      color,
      fontSize: this._config.fontSize || 16,
      timestamp: Date.now()
    }

    // 发送到服务器
    if (this._config.sendApi) {
      try {
        await fetch(this._config.sendApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(danmaku)
        })
      } catch (error) {
        console.error('Failed to send danmaku:', error)
        throw error
      }
    }

    // 本地显示
    this.addDanmaku(danmaku)

    // 立即显示新发送的弹幕
    const item: DanmakuItem = {
      id: generateId('danmaku'),
      ...danmaku
    }
    this.showDanmaku(item)

    this.emit('danmakuSent', { danmaku })
  }

  /**
   * 发送弹幕（别名方法）
   */
  async send(text: string, type: DanmakuType = DanmakuType.SCROLL, color = '#ffffff'): Promise<void> {
    return this.sendDanmaku(text, type, color)
  }

  /**
   * 暂停弹幕
   */
  pause(): void {
    this._paused = true
    this._activeDanmaku.forEach(element => {
      element.style.animationPlayState = 'paused'
    })
  }

  /**
   * 恢复弹幕
   */
  resume(): void {
    this._paused = false
    this._activeDanmaku.forEach(element => {
      element.style.animationPlayState = 'running'
    })
  }

  /**
   * 切换弹幕显示
   */
  toggle(): void {
    if (this._paused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  /**
   * 设置弹幕透明度
   */
  setOpacity(opacity: number): void {
    this._config.opacity = Math.max(0, Math.min(1, opacity))

    if (this._overlay) {
      setStyle(this._overlay, { opacity: this._config.opacity.toString() })
    }

    this.emit('opacityChanged', { opacity: this._config.opacity })
  }

  /**
   * 设置弹幕速度
   */
  setSpeed(speed: number): void {
    this._config.speed = Math.max(0.1, Math.min(5, speed))
    this.emit('speedChanged', { speed: this._config.speed })
  }

  /**
   * 设置弹幕字体大小
   */
  setFontSize(fontSize: number): void {
    this._config.fontSize = Math.max(12, Math.min(48, fontSize))
    this.emit('fontSizeChanged', { fontSize: this._config.fontSize })
  }

  /**
   * 加载弹幕数据
   */
  async loadDanmaku(source?: string): Promise<void> {
    const url = source || this._config.source
    if (!url) {
      throw new Error('No danmaku source specified')
    }

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (Array.isArray(data)) {
        this.addDanmakuList(data)
      } else if (data.danmaku && Array.isArray(data.danmaku)) {
        this.addDanmakuList(data.danmaku)
      }

      this.emit('danmakuLoaded', { source: url, count: this._danmakuList.length })
    } catch (error) {
      console.error('Failed to load danmaku:', error)
      throw error
    }
  }

  protected createOverlay(): HTMLElement {
    const overlay = createElement('div', {
      className: 'lv-danmaku-overlay',
      styles: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: '5'
      }
    })

    // 创建弹幕容器
    const container = createElement('div', {
      className: 'lv-danmaku-container',
      styles: {
        position: 'relative',
        width: '100%',
        height: `${this._config.areaRatio! * 100}%`,
        overflow: 'hidden'
      }
    })

    overlay.appendChild(container)

    // 如果允许发送弹幕，创建输入框
    if (this._config.allowSend) {
      this.createDanmakuInput(overlay)
    }

    return overlay
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._config.container = this._overlay!
    this._config.width = context.player.container.clientWidth
    this._config.height = context.player.container.clientHeight

    // 绑定播放器事件
    context.player.on(PlayerEvent.PLAY, this.handlePlay.bind(this))
    context.player.on(PlayerEvent.PAUSE, this.handlePause.bind(this))
    context.player.on(PlayerEvent.TIME_UPDATE, this.handleTimeUpdate.bind(this))

    // 加载弹幕数据
    if (this._config.source) {
      try {
        await this.loadDanmaku()
      } catch (error) {
        console.warn('Failed to load initial danmaku data:', error)
      }
    }

    // 开始渲染循环
    this.startRenderLoop()
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    this.stopRenderLoop()
    this.clearDanmaku()

    // 解绑播放器事件
    context.player.off(PlayerEvent.PLAY, this.handlePlay.bind(this))
    context.player.off(PlayerEvent.PAUSE, this.handlePause.bind(this))
    context.player.off(PlayerEvent.TIME_UPDATE, this.handleTimeUpdate.bind(this))

    await super.onUninstall(context)
  }

  protected async onEnable(context: PluginContext): Promise<void> {
    await super.onEnable(context)
    this.resume()
  }

  protected async onDisable(context: PluginContext): Promise<void> {
    this.pause()
    await super.onDisable(context)
  }

  /**
   * 创建配置对象
   */
  private createConfig(options: DanmakuOptions): DanmakuConfig {
    return {
      enabled: true,
      opacity: 0.8,
      speed: 1,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      strokeWidth: 1,
      strokeColor: '#000000',
      maxCount: 100,
      areaRatio: 0.7,
      collision: true,
      allowSend: true,
      poolSize: 50,
      performance: {
        useGPU: true,
        maxFPS: 60,
        memoryThreshold: 100
      },
      ...options,
      container: null as any,
      width: 0,
      height: 0
    }
  }

  /**
   * 创建弹幕输入框
   */
  private createDanmakuInput(overlay: HTMLElement): void {
    const inputContainer = createElement('div', {
      className: 'lv-danmaku-input-container',
      styles: {
        position: 'absolute',
        bottom: '60px',
        left: '16px',
        right: '16px',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto'
      }
    })

    this._input = createElement('input', {
      className: 'lv-danmaku-input',
      attributes: {
        type: 'text',
        placeholder: '发个弹幕吧~',
        maxlength: '100'
      },
      styles: {
        flex: '1',
        padding: '8px 12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        fontSize: '14px'
      }
    })

    this._sendButton = createElement('button', {
      className: 'lv-danmaku-send-button',
      textContent: '发送',
      styles: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        background: 'var(--ldesign-brand-color)',
        color: '#ffffff',
        fontSize: '14px',
        cursor: 'pointer'
      }
    })

    // 绑定发送事件
    this._sendButton.addEventListener('click', this.handleSendDanmaku.bind(this))
    this._input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendDanmaku()
      }
    })

    inputContainer.appendChild(this._input)
    inputContainer.appendChild(this._sendButton)
    overlay.appendChild(inputContainer)
  }

  /**
   * 处理发送弹幕
   */
  private async handleSendDanmaku(): Promise<void> {
    if (!this._input) return

    const text = (this._input as HTMLInputElement).value.trim()
    if (!text) return

    try {
      await this.sendDanmaku(text)
        ; (this._input as HTMLInputElement).value = ''
    } catch (error) {
      console.error('Failed to send danmaku:', error)
      // 可以显示错误提示
    }
  }

  /**
   * 处理播放事件
   */
  private handlePlay(): void {
    this.resume()
  }

  /**
   * 处理暂停事件
   */
  private handlePause(): void {
    this.pause()
  }

  /**
   * 处理时间更新事件
   */
  private handleTimeUpdate = throttle((data: { currentTime: number }) => {
    this.updateDanmaku(data.currentTime)
  }, 100)

  /**
   * 更新弹幕显示
   */
  private updateDanmaku(currentTime: number): void {
    // 查找需要显示的弹幕
    const danmakuToShow = this._danmakuList.filter(danmaku => {
      const timeDiff = Math.abs(danmaku.time - currentTime)
      return timeDiff < 0.1 && !this._activeDanmaku.has(danmaku.id)
    })

    // 显示新弹幕
    danmakuToShow.forEach(danmaku => {
      if (this._activeDanmaku.size < this._config.maxCount!) {
        this.showDanmaku(danmaku)
      }
    })
  }

  /**
   * 显示单个弹幕
   */
  private showDanmaku(danmaku: DanmakuItem): void {
    const element = this.getDanmakuElement()
    if (!element) return

    // 设置弹幕内容和样式
    element.textContent = danmaku.text
    element.style.color = danmaku.color || '#ffffff'
    element.style.fontSize = `${danmaku.fontSize || this._config.fontSize}px`
    element.style.fontFamily = this._config.fontFamily!

    // 设置位置和动画
    this.positionDanmaku(element, danmaku)
    this.animateDanmaku(element, danmaku)

    // 添加到活跃列表
    this._activeDanmaku.set(danmaku.id, element)

    // 设置移除定时器
    const duration = this.calculateDuration(danmaku)
    setTimeout(() => {
      this.removeDanmaku(danmaku.id)
    }, duration)
  }

  /**
   * 获取弹幕元素（从池中获取或创建新的）
   */
  private getDanmakuElement(): HTMLElement | null {
    if (this._danmakuPool.length > 0) {
      return this._danmakuPool.pop()!
    }

    const container = this._overlay?.querySelector('.lv-danmaku-container')
    if (!container) return null

    const element = createElement('div', {
      className: 'lv-danmaku-item',
      styles: {
        position: 'absolute',
        whiteSpace: 'nowrap',
        textShadow: `${this._config.strokeWidth}px ${this._config.strokeWidth}px 0 ${this._config.strokeColor}`,
        userSelect: 'none',
        pointerEvents: 'none'
      }
    })

    container.appendChild(element)
    return element
  }

  /**
   * 回收弹幕元素到池中
   */
  private recycleDanmakuElement(element: HTMLElement): void {
    // 停止动画并重置样式
    element.style.animation = ''
    element.style.transition = ''
    element.style.left = ''
    element.style.top = ''
    element.textContent = ''

    // 从DOM中移除
    element.remove()

    // 如果池未满，重新创建一个干净的元素加入池中
    if (this._danmakuPool.length < this._config.poolSize!) {
      const newElement = this.createCleanDanmakuElement()
      if (newElement) {
        this._danmakuPool.push(newElement)
      }
    }
  }

  /**
   * 创建干净的弹幕元素（用于池）
   */
  private createCleanDanmakuElement(): HTMLElement | null {
    const container = this._overlay?.querySelector('.lv-danmaku-container')
    if (!container) return null

    const element = createElement('div', {
      className: 'lv-danmaku-item',
      styles: {
        position: 'absolute',
        whiteSpace: 'nowrap',
        textShadow: `${this._config.strokeWidth}px ${this._config.strokeWidth}px 0 ${this._config.strokeColor}`,
        userSelect: 'none',
        pointerEvents: 'none',
        display: 'none' // 初始隐藏
      }
    })

    return element
  }

  /**
   * 定位弹幕
   */
  private positionDanmaku(element: HTMLElement, danmaku: DanmakuItem): void {
    const container = this._overlay?.querySelector('.lv-danmaku-container')
    if (!container) return

    const containerHeight = container.clientHeight
    const elementHeight = element.offsetHeight || 20

    let top: number

    switch (danmaku.type) {
      case DanmakuType.TOP:
        top = 10
        break
      case DanmakuType.BOTTOM:
        top = containerHeight - elementHeight - 10
        break
      case DanmakuType.SCROLL:
      default:
        // 随机选择一个轨道
        const trackCount = Math.floor(containerHeight / (elementHeight + 5))
        const track = Math.floor(Math.random() * trackCount)
        top = track * (elementHeight + 5)
        break
    }

    element.style.top = `${top}px`
    element.style.display = 'block'
  }

  /**
   * 动画弹幕
   */
  private animateDanmaku(element: HTMLElement, danmaku: DanmakuItem): void {
    const container = this._overlay?.querySelector('.lv-danmaku-container')
    if (!container) return

    const containerWidth = container.clientWidth
    const elementWidth = element.offsetWidth

    switch (danmaku.type) {
      case DanmakuType.SCROLL:
        element.style.left = `${containerWidth}px`
        element.style.animation = `danmaku-scroll ${this.calculateDuration(danmaku)}ms linear`
        break
      case DanmakuType.TOP:
      case DanmakuType.BOTTOM:
        element.style.left = `${(containerWidth - elementWidth) / 2}px`
        element.style.animation = `danmaku-fade ${this.calculateDuration(danmaku)}ms ease-in-out`
        break
    }
  }

  /**
   * 计算弹幕持续时间
   */
  private calculateDuration(danmaku: DanmakuItem): number {
    const baseDuration = danmaku.type === DanmakuType.SCROLL ? 8000 : 3000
    return baseDuration / (this._config.speed || 1)
  }

  /**
   * 移除弹幕
   */
  private removeDanmaku(id: string): void {
    const element = this._activeDanmaku.get(id)
    if (element) {
      this._activeDanmaku.delete(id)
      this.recycleDanmakuElement(element)
    }
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    const render = (timestamp: number) => {
      if (timestamp - this._lastTime >= 1000 / (this._config.performance?.maxFPS || 60)) {
        this.renderDanmaku()
        this._lastTime = timestamp
      }

      this._animationId = requestAnimationFrame(render)
    }

    this._animationId = requestAnimationFrame(render)
  }

  /**
   * 渲染弹幕
   */
  private renderDanmaku(): void {
    if (this._paused) return

    const context = this.getContext()
    const currentTime = context.player.status.currentTime

    // 查找需要显示的弹幕
    const danmakuToShow = this._danmakuList.filter(danmaku => {
      // 检查是否已经在显示
      if (this._activeDanmaku.has(danmaku.id)) return false

      // 检查时间是否匹配（允许0.5秒的误差）
      return Math.abs(danmaku.time - currentTime) <= 0.5
    })

    // 显示新弹幕
    danmakuToShow.forEach(danmaku => {
      this.showDanmaku(danmaku)
    })

    // 更新已显示弹幕的位置
    this.updateDanmakuPositions()
  }



  /**
   * 更新弹幕位置
   */
  private updateDanmakuPositions(): void {
    // 这里可以添加碰撞检测和位置调整逻辑
    // 目前保持简单实现
  }

  /**
   * 移除弹幕
   */
  private removeDanmaku(danmakuId: string): void {
    const element = this._activeDanmaku.get(danmakuId)
    if (element) {
      this.recycleDanmakuElement(element)
      this._activeDanmaku.delete(danmakuId)
    }
  }

  /**
   * 停止渲染循环
   */
  private stopRenderLoop(): void {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = undefined
    }
  }
}
