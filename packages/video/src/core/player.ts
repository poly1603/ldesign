/**
 * 视频播放器核心类
 * 实现基础的视频播放功能和控制接口
 */

import { EventEmitter } from '../utils/events'
import { getDeviceInfo } from '../utils/device'
import { createElement, querySelector } from '../utils/dom'
import { generateId } from '../utils/common'
import { PlayerState, PlayerEvent } from '../types/player'
import { PluginManager } from './plugin-manager'
import type {
  IVideoPlayer,
  PlayerOptions,
  PlayerStatus,
  VideoSource,
  VideoQuality
} from '../types/player'
import type { DeviceInfo } from '../types/device'
import type { IPlugin } from '../types/plugin'

/**
 * 视频播放器核心实现
 */
export class VideoPlayer extends EventEmitter implements IVideoPlayer {
  private _container: HTMLElement
  private _videoElement: HTMLVideoElement
  private _options: PlayerOptions
  private _status: PlayerStatus
  private _deviceInfo: DeviceInfo
  private _pluginManager: PluginManager
  private _initialized = false
  private _destroyed = false
  private handleResize?: () => void
  private handleOrientationChange?: () => void

  constructor(options: PlayerOptions) {
    super()

    this._deviceInfo = getDeviceInfo()
    this._options = this.normalizeOptions(options)
    this._container = this.resolveContainer(options.container)
    this._videoElement = this.createVideoElement()
    this._status = this.createInitialStatus()
    this._pluginManager = new PluginManager(this)

    this.setupContainer()
    this.bindVideoEvents()
  }

  /**
   * 播放器配置
   */
  get options(): PlayerOptions {
    return { ...this._options }
  }

  /**
   * 播放器状态
   */
  get status(): PlayerStatus {
    return { ...this._status }
  }

  /**
   * 视频元素
   */
  get videoElement(): HTMLVideoElement {
    return this._videoElement
  }

  /**
   * 容器元素
   */
  get container(): HTMLElement {
    return this._container
  }

  /**
   * 设备信息
   */
  get deviceInfo(): DeviceInfo {
    return this._deviceInfo
  }

  /**
   * 是否已初始化
   */
  get initialized(): boolean {
    return this._initialized
  }

  /**
   * 是否已销毁
   */
  get destroyed(): boolean {
    return this._destroyed
  }

  /**
   * 插件管理器
   */
  get pluginManager(): PluginManager {
    return this._pluginManager
  }

  /**
   * 获取插件实例
   */
  getPlugin<T extends IPlugin = IPlugin>(name: string): T | undefined {
    return this._pluginManager.get(name) as T | undefined
  }

  /**
   * 初始化播放器
   */
  async initialize(): Promise<void> {
    if (this._initialized || this._destroyed) {
      return
    }

    try {
      this.emit(PlayerEvent.LOAD_START)

      // 设置视频源
      if (this._options.src) {
        await this.setSrc(this._options.src)
      }

      // 应用初始配置
      this.applyInitialConfig()

      // 注册插件
      await this.registerPlugins()

      this._initialized = true
      this.updateStatus({ state: PlayerState.READY })
      this.emit(PlayerEvent.READY)

    } catch (error) {
      this.updateStatus({ state: PlayerState.ERROR })
      this.emit(PlayerEvent.ERROR, { error })
      throw error
    }
  }

  /**
   * 简单事件发射（直接传递数据，不包装在事件对象中）
   */
  private emitSimple<T = any>(event: string, data?: T): boolean {
    const listeners = this.listeners.get(event)
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      }
      return true
    }
    return false
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    if (this._destroyed) {
      return
    }

    this.pause()
    this.unbindVideoEvents()
    this.removeAllListeners()

    // 移除响应式事件监听
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
    
    if (this.handleOrientationChange && 'orientation' in screen) {
      screen.orientation.removeEventListener('change', this.handleOrientationChange)
    }

    // 销毁插件
    this._pluginManager.destroy()

    // 清理视频元素
    if (this._videoElement) {
      if (this._videoElement.parentNode) {
        this._videoElement.parentNode.removeChild(this._videoElement)
      }
      // 清理视频元素的引用
      this._videoElement.src = ''
      this._videoElement.load()
    }

    // 清理容器
    if (this._container) {
      this._container.innerHTML = ''
    }

    this._destroyed = true
    this._initialized = false

    // 清理引用
    this._videoElement = null as any

    this.emitSimple(PlayerEvent.DESTROY)
  }

  /**
   * 播放视频
   */
  async play(): Promise<void> {
    if (this._destroyed || !this._initialized) {
      throw new Error('Player not initialized')
    }

    try {
      await this._videoElement.play()
      this.updateStatus({ state: PlayerState.PLAYING })
      this.emitSimple(PlayerEvent.PLAY)
    } catch (error) {
      this.emitSimple(PlayerEvent.ERROR, { error })
      throw error
    }
  }

  /**
   * 暂停视频
   */
  pause(): void {
    if (this._destroyed || !this._initialized) {
      return
    }

    this._videoElement.pause()
    this.updateStatus({ state: PlayerState.PAUSED })
    this.emitSimple(PlayerEvent.PAUSE)
  }

  /**
   * 跳转到指定时间
   */
  seek(time: number): void {
    if (this._destroyed || !this._initialized) {
      return
    }

    const clampedTime = Math.max(0, Math.min(time, this._videoElement.duration || 0))
    this._videoElement.currentTime = clampedTime
    this.updateStatus({ currentTime: clampedTime })
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (this._destroyed || !this._initialized) {
      return
    }

    const clampedVolume = Math.max(0, Math.min(1, volume))
    this._videoElement.volume = clampedVolume
    this.updateStatus({ volume: clampedVolume })
    this.emit(PlayerEvent.VOLUME_CHANGE, { volume: clampedVolume, muted: this._videoElement.muted })
  }

  /**
   * 设置播放速度
   */
  setPlaybackRate(rate: number): void {
    if (this._destroyed || !this._initialized) {
      return
    }

    const clampedRate = Math.max(0.25, Math.min(4, rate))
    this._videoElement.playbackRate = clampedRate
    this.updateStatus({ playbackRate: clampedRate })
    this.emit(PlayerEvent.RATE_CHANGE, { playbackRate: clampedRate })
  }

  /**
   * 切换全屏
   */
  async toggleFullscreen(): Promise<void> {
    if (this._destroyed || !this._initialized) {
      return
    }

    try {
      const isFullscreen = this.isFullscreen()
      
      if (isFullscreen) {
        await this.exitFullscreen()
        this._container.classList.remove('lv-player--fullscreen')
        this.emitSimple(PlayerEvent.FULLSCREEN_CHANGE, { fullscreen: false })
      } else {
        await this.requestFullscreen()
        this._container.classList.add('lv-player--fullscreen')
        this.emitSimple(PlayerEvent.FULLSCREEN_CHANGE, { fullscreen: true })
      }
    } catch (error) {
      this.emit(PlayerEvent.ERROR, { error })
      throw error
    }
  }

  /**
   * 检查是否处于全屏状态
   */
  private isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    )
  }

  /**
   * 请求全屏（跨浏览器兼容）
   */
  private async requestFullscreen(): Promise<void> {
    const element = this._container
    
    if (element.requestFullscreen) {
      await element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen()
    } else {
      throw new Error('Fullscreen not supported')
    }
  }

  /**
   * 退出全屏（跨浏览器兼容）
   */
  private async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
    }
  }

  /**
   * 切换画中画
   */
  async togglePip(): Promise<void> {
    if (this._destroyed || !this._initialized) {
      return
    }

    if (!('pictureInPictureEnabled' in document)) {
      throw new Error('Picture-in-Picture not supported')
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        this.emitSimple(PlayerEvent.PIP_CHANGE, { pip: false })
      } else {
        await this._videoElement.requestPictureInPicture()
        this.emitSimple(PlayerEvent.PIP_CHANGE, { pip: true })
      }
    } catch (error) {
      this.emit(PlayerEvent.ERROR, { error })
      throw error
    }
  }

  /**
   * 切换播放/暂停
   */
  toggle(): void {
    if (this._videoElement.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  /**
   * 设置视频源
   */
  async setSrc(src: VideoSource | string): Promise<void> {
    if (this._destroyed) {
      return
    }

    const source = typeof src === 'string' ? { src } : src

    this._videoElement.src = source.src

    if (source.poster) {
      this._videoElement.poster = source.poster
    }

    // 等待元数据加载
    return new Promise((resolve, reject) => {
      const onLoadedMetadata = () => {
        this._videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
        this._videoElement.removeEventListener('error', onError)
        this.updateStatus({
          duration: this._videoElement.duration,
          currentTime: this._videoElement.currentTime
        })
        resolve()
      }

      const onError = () => {
        this._videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
        this._videoElement.removeEventListener('error', onError)
        reject(new Error('Failed to load video'))
      }

      this._videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
      this._videoElement.addEventListener('error', onError)
    })
  }

  /**
   * 切换视频质量
   */
  setQuality(quality: VideoQuality): void {
    if (this._destroyed || !this._initialized) {
      return
    }

    const currentTime = this._videoElement.currentTime
    const paused = this._videoElement.paused

    this._videoElement.src = quality.src
    this._videoElement.currentTime = currentTime

    if (!paused) {
      this._videoElement.play()
    }

    this.updateStatus({ quality })
  }

  /**
   * 标准化配置选项
   */
  private normalizeOptions(options: PlayerOptions): PlayerOptions {
    if (!options.src || (typeof options.src === 'string' && options.src.trim() === '')) {
      throw new Error('Video source is required')
    }

    return {
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      volume: 1,
      playbackRate: 1,
      preload: 'metadata',
      pip: true,
      fullscreen: true,
      hotkeys: true,
      gestures: this._deviceInfo.isTouch,
      responsive: true,
      language: 'zh-CN',
      ...options
    }
  }

  /**
   * 解析容器元素
   */
  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (!container) {
      throw new Error('Container element is required')
    }

    if (typeof container === 'string') {
      const element = querySelector<HTMLElement>(container)
      if (!element) {
        throw new Error(`Container element not found: ${container}`)
      }
      return element
    }
    return container
  }

  /**
   * 创建视频元素
   */
  private createVideoElement(): HTMLVideoElement {
    const video = createElement('video', {
      attributes: {
        'data-player-id': generateId('video-player')
      }
    })

    return video
  }

  /**
   * 创建初始状态
   */
  private createInitialStatus(): PlayerStatus {
    return {
      state: PlayerState.UNINITIALIZED,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: this._options.volume || 1,
      muted: this._options.muted || false,
      playbackRate: this._options.playbackRate || 1,
      fullscreen: false,
      pip: false
    }
  }

  /**
   * 设置播放器容器
   */
  private setupContainer(): void {
    this._container.classList.add('lv-player')
    
    // 根据设备类型添加相应的类名
    const deviceType = this._deviceInfo.device.type
    this._container.classList.add(`lv-player--${deviceType}`)
    
    // 添加操作系统类名
    const osType = this._deviceInfo.os.type
    this._container.classList.add(`lv-player--${osType}`)
    
    // 添加浏览器类名
    const browserType = this._deviceInfo.browser.type
    this._container.classList.add(`lv-player--${browserType}`)
    
    // 设置宽高比模式
    if (this._options.aspectRatio) {
      this._container.classList.add('lv-player--aspect-ratio')
      this._container.style.setProperty('--lv-player-aspect-ratio', this._options.aspectRatio)
    }
    
    // 添加视频元素
    this._container.appendChild(this._videoElement)
    
    // 监听窗口大小变化
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
    
    // 监听屏幕方向变化
    if ('orientation' in screen) {
      this.handleOrientationChange = this.handleOrientationChange.bind(this)
      screen.orientation.addEventListener('change', this.handleOrientationChange)
    }

    if (this._options.className) {
      this._container.classList.add(this._options.className)
    }
  }

  /**
   * 绑定视频事件
   */
  private bindVideoEvents(): void {
    const events = [
      'play', 'pause', 'ended', 'timeupdate', 'loadstart',
      'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough',
      'waiting', 'seeking', 'seeked', 'volumechange', 'ratechange',
      'progress', 'error', 'stalled', 'suspend', 'abort',
      'emptied', 'durationchange'
    ]

    events.forEach(event => {
      this._videoElement.addEventListener(event, this.handleVideoEvent.bind(this))
    })

    // 全屏事件监听（跨浏览器兼容）
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ]
    
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, this.handleFullscreenChange.bind(this))
    })

    // 画中画事件监听
    this._videoElement.addEventListener('enterpictureinpicture', this.handlePipChange.bind(this))
    this._videoElement.addEventListener('leavepictureinpicture', this.handlePipChange.bind(this))
  }

  /**
   * 解绑视频事件
   */
  private unbindVideoEvents(): void {
    const events = [
      'play', 'pause', 'ended', 'timeupdate', 'loadstart',
      'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough',
      'waiting', 'seeking', 'seeked', 'volumechange', 'ratechange',
      'progress', 'error', 'stalled', 'suspend', 'abort',
      'emptied', 'durationchange'
    ]

    events.forEach(event => {
      this._videoElement.removeEventListener(event, this.handleVideoEvent.bind(this))
    })

    // 移除全屏事件监听（跨浏览器兼容）
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ]
    
    fullscreenEvents.forEach(event => {
      document.removeEventListener(event, this.handleFullscreenChange.bind(this))
    })

    // 移除画中画事件监听
    this._videoElement.removeEventListener('enterpictureinpicture', this.handlePipChange.bind(this))
    this._videoElement.removeEventListener('leavepictureinpicture', this.handlePipChange.bind(this))
  }

  /**
   * 处理视频事件
   */
  private handleVideoEvent(event: Event): void {
    const type = event.type as PlayerEvent

    switch (type) {
      case 'play':
        this.updateStatus({ state: PlayerState.PLAYING })
        this.emit(PlayerEvent.PLAY)
        break

      case 'pause':
        this.updateStatus({ state: PlayerState.PAUSED })
        this.emit(PlayerEvent.PAUSE)
        break

      case 'ended':
        this.updateStatus({ state: PlayerState.ENDED })
        this.emit(PlayerEvent.ENDED)
        break

      case 'timeupdate':
        this.updateStatus({
          currentTime: this._videoElement.currentTime,
          duration: this._videoElement.duration
        })
        this.emit(PlayerEvent.TIME_UPDATE, {
          currentTime: this._videoElement.currentTime,
          duration: this._videoElement.duration
        })
        break

      case 'volumechange':
        this.updateStatus({
          volume: this._videoElement.volume,
          muted: this._videoElement.muted
        })
        this.emit(PlayerEvent.VOLUME_CHANGE, {
          volume: this._videoElement.volume,
          muted: this._videoElement.muted
        })
        break

      case 'error':
        this.updateStatus({ state: PlayerState.ERROR })
        this.emit(PlayerEvent.ERROR, { error: this._videoElement.error })
        break
    }
  }

  /**
   * 处理全屏状态变化
   */
  private handleFullscreenChange(): void {
    const isFullscreen = this.isFullscreen()
    
    if (isFullscreen) {
      this._container.classList.add('lv-player--fullscreen')
    } else {
      this._container.classList.remove('lv-player--fullscreen')
    }
    
    this.updateStatus({ fullscreen: isFullscreen })
    this.emit(PlayerEvent.FULLSCREEN_CHANGE, { fullscreen: isFullscreen })
  }

  /**
   * 处理画中画状态变化
   */
  private handlePipChange(): void {
    const pip = !!document.pictureInPictureElement
    this.updateStatus({ pip })
    this.emit(PlayerEvent.PIP_CHANGE, { pip })
  }

  /**
   * 应用初始配置
   */
  private applyInitialConfig(): void {
    this._videoElement.autoplay = this._options.autoplay || false
    this._videoElement.muted = this._options.muted || false
    this._videoElement.loop = this._options.loop || false
    this._videoElement.controls = false // 使用自定义控制栏
    this._videoElement.volume = this._options.volume || 1
    this._videoElement.playbackRate = this._options.playbackRate || 1
    this._videoElement.preload = this._options.preload || 'metadata'

    if (this._options.crossOrigin) {
      this._videoElement.crossOrigin = this._options.crossOrigin
    }
  }

  /**
   * 注册插件
   */
  private async registerPlugins(): Promise<void> {
    if (!this._options.plugins) {
      return
    }

    for (const plugin of this._options.plugins) {
      if ('metadata' in plugin) {
        // 插件实例
        await this._pluginManager.register(plugin as IPlugin)
      } else {
        // 插件配置
        // TODO: 根据配置创建插件实例
        console.warn('Plugin config not supported yet:', plugin)
      }
    }
  }

  /**
   * 更新状态
   */
  private updateStatus(updates: Partial<PlayerStatus>): void {
    Object.assign(this._status, updates)
    this.emitSimple(PlayerEvent.STATUS_CHANGE, this._status)
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (this._destroyed) return
    
    // 更新视口信息
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    this.emit(PlayerEvent.RESIZE, viewport)
    
    // 如果是全屏状态，确保样式正确
    if (this.isFullscreen()) {
      this._container.style.width = '100vw'
      this._container.style.height = '100vh'
    }
  }

  /**
   * 处理屏幕方向变化
   */
  private handleOrientationChange(): void {
    if (this._destroyed) return
    
    // 延迟处理，等待屏幕方向变化完成
    setTimeout(() => {
      const orientation = screen.orientation?.angle || 0
      this.emit(PlayerEvent.ORIENTATION_CHANGE, { orientation })
      
      // 触发重新布局
      this.handleResize()
    }, 100)
  }
}
