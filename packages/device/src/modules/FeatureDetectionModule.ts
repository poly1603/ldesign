import type { DeviceModule } from '../types'
import { EventEmitter } from '../core/EventEmitter'

/**
 * 设备特性检测信息
 */
export interface FeatureDetectionInfo {
  /** 存储支持 */
  storage: {
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    cookies: boolean
    cacheAPI: boolean
    fileSystemAccess: boolean
  }
  /** 媒体支持 */
  media: {
    webp: boolean
    avif: boolean
    jxl: boolean
    heic: boolean
    webm: boolean
    mp4: boolean
    hls: boolean
  }
  /** CSS 特性支持 */
  css: {
    grid: boolean
    flexbox: boolean
    cssVariables: boolean
    containerQueries: boolean
    hasSelector: boolean
    subgrid: boolean
  }
  /** API 支持 */
  apis: {
    serviceWorker: boolean
    webWorker: boolean
    webRTC: boolean
    webSocket: boolean
    webGL: boolean
    webGL2: boolean
    webGPU: boolean
    webAssembly: boolean
    webXR: boolean
    webAudio: boolean
    intersectionObserver: boolean
    resizeObserver: boolean
    mutationObserver: boolean
  }
  /** PWA 能力 */
  pwa: {
    pushNotifications: boolean
    backgroundSync: boolean
    periodicBackgroundSync: boolean
    installable: boolean
  }
  /** 传感器支持 */
  sensors: {
    accelerometer: boolean
    gyroscope: boolean
    magnetometer: boolean
    ambientLight: boolean
  }
  /** 用户偏好 */
  preferences: {
    darkMode: boolean
    reducedMotion: boolean
    reducedTransparency: boolean
    highContrast: boolean
  }
  /** 设备能力 */
  capabilities: {
    touch: boolean
    pointer: 'fine' | 'coarse' | 'none'
    hover: boolean
    vibration: boolean
    clipboard: boolean
    share: boolean
    notifications: boolean
  }
  /** 硬件信息 */
  hardware: {
    cpuCores: number
    deviceMemory: number // GB
    maxTouchPoints: number
  }
}

/**
 * 特性检测模块事件
 */
export interface FeatureDetectionEvents extends Record<string, unknown> {
  featureChange: FeatureDetectionInfo
  darkModeChange: boolean
  reducedMotionChange: boolean
}

/**
 * 设备特性检测模块
 *
 * 提供全面的设备特性检测功能，包括：
 * - 存储 API 支持检测
 * - 媒体格式支持检测
 * - 现代 Web API 支持检测
 * - 用户偏好设置检测
 * - 硬件能力检测
 *
 * @example
 * ```typescript
 * const detector = new DeviceDetector()
 * const featureModule = await detector.loadModule<FeatureDetectionModule>('feature')
 * const features = featureModule.getData()
 *
 * if (features.media.webp) {
 *    }
 *
 * if (features.preferences.darkMode) {
 *    }
 * ```
 */
export class FeatureDetectionModule
  extends EventEmitter<FeatureDetectionEvents>
  implements DeviceModule {
  name = 'feature'
  private features: FeatureDetectionInfo | null = null
  private mediaQueryListeners: Map<string, MediaQueryList> = new Map()
  private isInitialized = false

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (this.isInitialized)
      return

    this.features = await this.detectFeatures()
    this.setupMediaQueryListeners()
    this.isInitialized = true
  }

  /**
   * 获取特性检测数据
   */
  getData(): FeatureDetectionInfo {
    if (!this.features) {
      throw new Error('FeatureDetectionModule not initialized')
    }
    return { ...this.features }
  }

  /**
   * 检查是否支持暗黑模式
   */
  isDarkMode(): boolean {
    return this.features?.preferences.darkMode ?? false
  }

  /**
   * 检查是否偏好减少动画
   */
  prefersReducedMotion(): boolean {
    return this.features?.preferences.reducedMotion ?? false
  }

  /**
   * 检查是否支持 WebP
   */
  supportsWebP(): boolean {
    return this.features?.media.webp ?? false
  }

  /**
   * 检查是否支持 AVIF
   */
  supportsAVIF(): boolean {
    return this.features?.media.avif ?? false
  }

  /**
   * 获取 CPU 核心数
   */
  getCPUCores(): number {
    return this.features?.hardware.cpuCores ?? 1
  }

  /**
   * 获取设备内存（GB）
   */
  getDeviceMemory(): number {
    return this.features?.hardware.deviceMemory ?? 0
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.removeMediaQueryListeners()
    this.removeAllListeners()
    this.features = null
    this.isInitialized = false
  }

  /**
   * 检测所有特性
   */
  private async detectFeatures(): Promise<FeatureDetectionInfo> {
    return {
      storage: this.detectStorage(),
      media: await this.detectMediaSupport(),
      css: this.detectCSSFeatures(),
      apis: this.detectAPIs(),
      pwa: this.detectPWACapabilities(),
      sensors: this.detectSensors(),
      preferences: this.detectPreferences(),
      capabilities: this.detectCapabilities(),
      hardware: this.detectHardware(),
    }
  }

  /**
   * 检测存储支持
   */
  private detectStorage() {
    return {
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      indexedDB: this.checkIndexedDB(),
      cookies: this.checkCookies(),
      cacheAPI: 'caches' in window,
      fileSystemAccess: 'showOpenFilePicker' in window,
    }
  }

  /**
   * 检测媒体格式支持
   */
  private async detectMediaSupport() {
    return {
      webp: await this.checkImageFormat('webp'),
      avif: await this.checkImageFormat('avif'),
      jxl: false, // JPEG XL 还没有广泛支持
      heic: false, // HEIC 主要在 iOS Safari 中支持
      webm: this.checkVideoFormat('video/webm'),
      mp4: this.checkVideoFormat('video/mp4'),
      hls: this.checkHLSSupport(),
    }
  }

  /**
   * 检测 API 支持
   */
  private detectAPIs() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined',
      webRTC: 'RTCPeerConnection' in window,
      webSocket: 'WebSocket' in window,
      webGL: this.checkWebGL(),
      webGL2: this.checkWebGL2(),
      webGPU: 'gpu' in navigator,
      webAssembly: typeof WebAssembly !== 'undefined',
      webXR: 'xr' in navigator,
      webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      mutationObserver: 'MutationObserver' in window,
    }
  }

  /**
   * 检测传感器支持
   */
  private detectSensors() {
    return {
      accelerometer: 'Accelerometer' in window,
      gyroscope: 'Gyroscope' in window,
      magnetometer: 'Magnetometer' in window,
      ambientLight: 'AmbientLightSensor' in window,
    }
  }

  /**
   * 检测 CSS 特性支持
   */
  private detectCSSFeatures() {
    if (typeof window === 'undefined' || !CSS || !CSS.supports) {
      return {
        grid: false,
        flexbox: false,
        cssVariables: false,
        containerQueries: false,
        hasSelector: false,
        subgrid: false,
      }
    }

    return {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      cssVariables: CSS.supports('--test', 'value'),
      containerQueries: CSS.supports('container-type', 'inline-size'),
      hasSelector: CSS.supports('selector(:has(div))'),
      subgrid: CSS.supports('grid-template-rows', 'subgrid'),
    }
  }

  /**
   * 检测 PWA 能力
   */
  private detectPWACapabilities() {
    const pushNotifications = 'PushManager' in window
    const backgroundSync = 'sync' in (ServiceWorkerRegistration.prototype || {})
    const periodicBackgroundSync = 'periodicSync' in (ServiceWorkerRegistration.prototype || {})
    const installable = 'onbeforeinstallprompt' in window

    return {
      pushNotifications,
      backgroundSync,
      periodicBackgroundSync,
      installable,
    }
  }

  /**
   * 检测用户偏好
   */
  private detectPreferences() {
    return {
      darkMode: this.checkDarkMode(),
      reducedMotion: this.checkReducedMotion(),
      reducedTransparency: this.checkReducedTransparency(),
      highContrast: this.checkHighContrast(),
    }
  }

  /**
   * 检测设备能力
   */
  private detectCapabilities() {
    return {
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pointer: this.detectPointerType(),
      hover: this.checkHoverCapability(),
      vibration: 'vibrate' in navigator,
      clipboard: 'clipboard' in navigator,
      share: 'share' in navigator,
      notifications: 'Notification' in window,
    }
  }

  /**
   * 检测硬件信息
   */
  private detectHardware() {
    return {
      cpuCores: (navigator as unknown as { hardwareConcurrency?: number }).hardwareConcurrency || 1,
      deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    }
  }

  /**
   * 检查 LocalStorage 支持
   */
  private checkLocalStorage(): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查 SessionStorage 支持
   */
  private checkSessionStorage(): boolean {
    try {
      const test = '__test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查 IndexedDB 支持
   */
  private checkIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  /**
   * 检查 Cookies 支持
   */
  private checkCookies(): boolean {
    return navigator.cookieEnabled
  }

  /**
   * 检查图片格式支持
   */
  private checkImageFormat(format: 'webp' | 'avif'): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.width === 1)
      img.onerror = () => resolve(false)

      const formats = {
        webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
      }

      img.src = formats[format]
    })
  }

  /**
   * 检查视频格式支持
   */
  private checkVideoFormat(mimeType: string): boolean {
    const video = document.createElement('video')
    return video.canPlayType(mimeType) !== ''
  }

  /**
   * 检查 HLS 支持
   */
  private checkHLSSupport(): boolean {
    const video = document.createElement('video')
    return video.canPlayType('application/vnd.apple.mpegurl') !== ''
  }

  /**
   * 检查 WebGL 支持
   */
  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    }
    catch {
      return false
    }
  }

  /**
   * 检查 WebGL2 支持
   */
  private checkWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    }
    catch {
      return false
    }
  }

  /**
   * 检查暗黑模式
   */
  private checkDarkMode(): boolean {
    if (typeof window === 'undefined')
      return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 检查减少动画偏好
   */
  private checkReducedMotion(): boolean {
    if (typeof window === 'undefined')
      return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * 检查减少透明度偏好
   */
  private checkReducedTransparency(): boolean {
    if (typeof window === 'undefined')
      return false
    return window.matchMedia('(prefers-reduced-transparency: reduce)').matches
  }

  /**
   * 检查高对比度偏好
   */
  private checkHighContrast(): boolean {
    if (typeof window === 'undefined')
      return false
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * 检测指针类型
   */
  private detectPointerType(): 'fine' | 'coarse' | 'none' {
    if (typeof window === 'undefined')
      return 'none'
    if (window.matchMedia('(pointer: fine)').matches)
      return 'fine'
    if (window.matchMedia('(pointer: coarse)').matches)
      return 'coarse'
    return 'none'
  }

  /**
   * 检查悬停能力
   */
  private checkHoverCapability(): boolean {
    if (typeof window === 'undefined')
      return false
    return window.matchMedia('(hover: hover)').matches
  }

  /**
   * 设置媒体查询监听器
   */
  private setupMediaQueryListeners(): void {
    if (typeof window === 'undefined')
      return

    // 监听暗黑模式变化
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const darkModeHandler = (e: MediaQueryListEvent) => {
      if (this.features) {
        this.features.preferences.darkMode = e.matches
        this.emit('darkModeChange', e.matches)
        this.emit('featureChange', this.features)
      }
    }
    darkModeQuery.addEventListener('change', darkModeHandler)
    this.mediaQueryListeners.set('darkMode', darkModeQuery)

    // 监听减少动画偏好变化
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotionHandler = (e: MediaQueryListEvent) => {
      if (this.features) {
        this.features.preferences.reducedMotion = e.matches
        this.emit('reducedMotionChange', e.matches)
        this.emit('featureChange', this.features)
      }
    }
    reducedMotionQuery.addEventListener('change', reducedMotionHandler)
    this.mediaQueryListeners.set('reducedMotion', reducedMotionQuery)
  }

  /**
   * 移除媒体查询监听器
   */
  private removeMediaQueryListeners(): void {
    this.mediaQueryListeners.clear()
  }
}
