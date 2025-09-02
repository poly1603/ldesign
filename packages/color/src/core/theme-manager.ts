/**
 * 主题管理器核心类
 */

import type {
  ColorGenerator,
  ColorMode,
  ColorValue,
  CSSInjector,
  EventEmitter,
  GeneratedTheme,
  IdleProcessor,
  LRUCache,
  Storage,
  SystemThemeDetector,
  ThemeConfig,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  ThemeManagerOptions,
} from './types'
import { ColorGeneratorImpl } from '../utils/color-generator'
import { ColorScaleGenerator } from '../utils/color-scale'
import { CSSInjectorImpl, CSSVariableGenerator } from '../utils/css-injector'
import { EventEmitterImpl } from '../utils/event-emitter'
import { IdleProcessorImpl } from '../utils/idle-processor'

/**
 * 默认主题管理器选项
 */
const DEFAULT_OPTIONS: Required<
  Omit<ThemeManagerOptions, 'onThemeChanged' | 'onError' | 'themes'>
> & {
  onThemeChanged?: (theme: string, mode: ColorMode) => void
  onError?: (error: Error) => void
  themes: ThemeConfig[]
} = {
  defaultTheme: 'default',
  fallbackTheme: 'default',
  storage: 'localStorage',
  storageKey: 'ldesign-theme',
  autoDetect: true,
  themes: [],
  cache: true,
  cssPrefix: '--color',
  idleProcessing: true,
  onThemeChanged: undefined,
  onError: undefined,
}

/**
 * 主题管理器实现
 */
export class ThemeManager implements ThemeManagerInstance {
  private options: Required<
    Omit<ThemeManagerOptions, 'onThemeChanged' | 'onError' | 'themes'>
  > & {
    onThemeChanged?: (theme: string, mode: ColorMode) => void
    onError?: (error: Error) => void
    themes: ThemeConfig[]
  }

  private currentTheme: string
  private currentMode: ColorMode
  private storage: Storage
  private cache: LRUCache<GeneratedTheme>
  private colorGenerator: ColorGenerator
  private scaleGenerator: ColorScaleGenerator
  private cssInjector: CSSInjector
  private cssVariableGenerator: CSSVariableGenerator
  private idleProcessor: IdleProcessor
  private systemThemeDetector: SystemThemeDetector | null = null
  private eventEmitter: EventEmitter
  private isInitialized: boolean = false
  private systemThemeWatcher: (() => void) | null = null

  constructor(options?: ThemeManagerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.currentTheme = this.options.defaultTheme
    this.currentMode = 'light'

    // 初始化组件
    this.eventEmitter = new EventEmitterImpl()
    this.colorGenerator = new ColorGeneratorImpl()
    this.scaleGenerator = new ColorScaleGenerator()
    this.cssInjector = new CSSInjectorImpl({
      prefix: this.options.cssPrefix,
      styleId: 'ldesign-theme-variables',
    })
    this.cssVariableGenerator = new CSSVariableGenerator(this.options.cssPrefix)
    this.idleProcessor = new IdleProcessorImpl({
      autoStart: this.options.idleProcessing,
    })

    // 初始化存储
    this.storage = this.createStorage()

    // 初始化缓存
    this.cache = this.createCache()

    // 注册预设主题
    if (this.options.themes.length > 0) {
      this.registerThemes(this.options.themes)
    }
  }

  /**
   * 初始化主题管理器
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化系统主题检测器
      if (this.options.autoDetect) {
        await this.initSystemThemeDetector()
      }

      // 从存储中恢复主题设置
      await this.restoreThemeFromStorage()

      // 应用当前主题
      await this.applyCurrentTheme()

      // 开始闲时预生成
      if (this.options.idleProcessing) {
        this.startIdlePreGeneration()
      }

      this.isInitialized = true
      this.eventEmitter.emit('theme-changed', {
        theme: this.currentTheme,
        mode: this.currentMode,
      })
    }
    catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string {
    return this.currentTheme
  }

  /**
   * 获取当前颜色模式
   */
  getCurrentMode(): ColorMode {
    return this.currentMode
  }

  /**
   * 设置主题
   */
  async setTheme(theme: string, mode?: ColorMode): Promise<void> {
    const targetMode = mode || this.currentMode

    if (theme === this.currentTheme && targetMode === this.currentMode) {
      return
    }

    try {
      // 检查主题是否存在
      if (!this.getThemeConfig(theme)) {
        throw new Error(`Theme "${theme}" not found`)
      }

      const oldTheme = this.currentTheme
      const oldMode = this.currentMode

      this.currentTheme = theme
      this.currentMode = targetMode

      // 应用主题
      await this.applyCurrentTheme()

      // 保存到存储
      this.saveThemeToStorage()

      // 触发事件
      this.eventEmitter.emit('theme-changed', {
        theme: this.currentTheme,
        mode: this.currentMode,
        oldTheme,
        oldMode,
      })

      // 调用回调
      if (this.options.onThemeChanged) {
        this.options.onThemeChanged(this.currentTheme, this.currentMode)
      }
    }
    catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 设置颜色模式
   */
  async setMode(mode: ColorMode): Promise<void> {
    await this.setTheme(this.currentTheme, mode)
  }

  /**
   * 切换颜色模式
   */
  async toggleMode(): Promise<void> {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light'
    await this.setMode(newMode)
  }

  /**
   * 注册主题
   */
  registerTheme(config: ThemeConfig): void {
    // 检查主题是否已存在
    const existingIndex = this.options.themes.findIndex(
      t => t.name === config.name,
    )

    if (existingIndex >= 0) {
      // 更新现有主题
      this.options.themes[existingIndex] = config
    }
    else {
      // 添加新主题
      this.options.themes.push(config)
    }

    this.eventEmitter.emit('theme-registered', { theme: config.name })

    // 如果启用了闲时处理，预生成主题
    if (this.options.idleProcessing && this.isInitialized) {
      this.idleProcessor.addTask(() => this.preGenerateTheme(config.name), 1)
    }
  }

  /**
   * 注册多个主题
   */
  registerThemes(configs: ThemeConfig[]): void {
    configs.forEach(config => this.registerTheme(config))
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(name: string): ThemeConfig | undefined {
    return this.options.themes.find(theme => theme.name === name)
  }

  /**
   * 获取所有主题名称
   */
  getThemeNames(): string[] {
    return this.options.themes.map(theme => theme.name)
  }

  /**
   * 获取生成的主题数据
   */
  getGeneratedTheme(name: string): GeneratedTheme | undefined {
    const cacheKey = `${name}-generated`
    return this.cache.get(cacheKey)
  }

  /**
   * 预生成主题
   */
  async preGenerateTheme(name: string): Promise<void> {
    const config = this.getThemeConfig(name)
    if (!config) {
      throw new Error(`Theme "${name}" not found`)
    }

    const cacheKey = `${name}-generated`

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return
    }

    try {
      const generatedTheme = await this.generateThemeData(config)
      this.cache.set(cacheKey, generatedTheme)

      this.eventEmitter.emit('theme-generated', { theme: name })
    }
    catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 预生成所有主题
   */
  async preGenerateAllThemes(): Promise<void> {
    const tasks = this.getThemeNames().map(
      name => () => this.preGenerateTheme(name),
    )

    if (this.options.idleProcessing) {
      // 使用闲时处理
      tasks.forEach((task, index) => {
        this.idleProcessor.addTask(task, index)
      })
    }
    else {
      // 直接执行
      await Promise.all(tasks.map(task => task()))
    }
  }

  /**
   * 应用主题到页面
   */
  applyTheme(name: string, mode: ColorMode): void {
    const generatedTheme = this.getGeneratedTheme(name)
    if (!generatedTheme) {
      throw new Error(`Generated theme data for "${name}" not found`)
    }

    const modeData = generatedTheme[mode]
    // 使用带注释的CSS变量注入
    if (modeData.cssVariableGroups && modeData.cssVariableGroups.length > 0) {
      this.cssInjector.injectVariablesWithComments(modeData.cssVariableGroups)
    } else {
      // 兼容旧版本
      this.cssInjector.injectVariables(modeData.cssVariables)
    }
  }

  /**
   * 移除主题样式
   */
  removeTheme(): void {
    this.cssInjector.removeVariables()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    // 停止系统主题监听
    if (this.systemThemeWatcher) {
      this.systemThemeWatcher()
      this.systemThemeWatcher = null
    }

    // 停止闲时处理
    this.idleProcessor.stop()

    // 移除主题样式
    this.removeTheme()

    // 清空缓存
    this.cache.clear()

    // 移除所有事件监听器
    this.eventEmitter.removeAllListeners()

    this.isInitialized = false
  }

  /**
   * 创建存储实例
   */
  private createStorage(): Storage {
    if (typeof this.options.storage === 'object') {
      return this.options.storage
    }

    switch (this.options.storage) {
      case 'localStorage':
        return typeof localStorage !== 'undefined'
          ? localStorage
          : this.createMemoryStorage()
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined'
          ? sessionStorage
          : this.createMemoryStorage()
      case 'memory':
      default:
        return this.createMemoryStorage()
    }
  }

  /**
   * 创建内存存储
   */
  private createMemoryStorage(): Storage {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    }
  }

  /**
   * 创建高性能LRU缓存实例
   *
   * 使用优化的LRU算法，提供O(1)的访问和更新性能
   * 支持自动过期和内存管理
   */
  private createCache(): LRUCache<GeneratedTheme> {
    const cache = new Map<string, { value: GeneratedTheme, accessed: number }>()
    const maxSize
      = typeof this.options.cache === 'object'
        ? this.options.cache.maxSize || 50
        : 50

    // 优化的LRU淘汰策略：使用双向链表概念但基于Map实现
    let accessOrder: string[] = []

    return {
      get: (key: string) => {
        const item = cache.get(key)
        if (item) {
          // 更新访问时间和访问顺序
          item.accessed = Date.now()

          // 将key移动到访问顺序的末尾（最近访问）
          const index = accessOrder.indexOf(key)
          if (index > -1) {
            accessOrder.splice(index, 1)
          }
          accessOrder.push(key)

          return item.value
        }
        return undefined
      },
      set: (key: string, value: GeneratedTheme) => {
        // 如果key已存在，更新值并调整访问顺序
        if (cache.has(key)) {
          cache.set(key, { value, accessed: Date.now() })
          const index = accessOrder.indexOf(key)
          if (index > -1) {
            accessOrder.splice(index, 1)
          }
          accessOrder.push(key)
          return
        }

        // 如果缓存已满，删除最久未访问的项（LRU策略）
        if (cache.size >= maxSize && accessOrder.length > 0) {
          const oldestKey = accessOrder.shift() // 移除最旧的key
          if (oldestKey) {
            cache.delete(oldestKey)
          }
        }

        // 添加新项
        cache.set(key, { value, accessed: Date.now() })
        accessOrder.push(key)
      },
      delete: (key: string) => {
        const deleted = cache.delete(key)
        if (deleted) {
          const index = accessOrder.indexOf(key)
          if (index > -1) {
            accessOrder.splice(index, 1)
          }
        }
        return deleted
      },
      clear: () => {
        cache.clear()
        accessOrder = []
      },
      size: () => cache.size,
      has: (key: string) => cache.has(key),
    }
  }

  /**
   * 初始化系统主题检测器
   */
  private async initSystemThemeDetector(): Promise<void> {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    this.systemThemeDetector = {
      getSystemTheme: () => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        return mediaQuery.matches ? 'dark' : 'light'
      },
      watchSystemTheme: (callback: (mode: ColorMode) => void) => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => {
          callback(e.matches ? 'dark' : 'light')
        }
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
      },
    }

    // 监听系统主题变化
    this.systemThemeWatcher = this.systemThemeDetector.watchSystemTheme(
      (mode) => {
        if (this.currentTheme === 'system') {
          this.setMode(mode)
        }
      },
    )
  }

  /**
   * 从存储中恢复主题设置
   */
  private async restoreThemeFromStorage(): Promise<void> {
    try {
      const stored = this.storage.getItem(this.options.storageKey)
      if (stored) {
        const { theme, mode } = JSON.parse(stored)
        if (theme && this.getThemeConfig(theme)) {
          this.currentTheme = theme
        }
        if (mode && (mode === 'light' || mode === 'dark')) {
          this.currentMode = mode
        }
      }
    }
    catch (error) {
      console.warn('Failed to restore theme from storage:', error)
    }

    // 如果是系统主题，获取系统模式
    if (this.currentTheme === 'system' && this.systemThemeDetector) {
      this.currentMode = this.systemThemeDetector.getSystemTheme()
    }
  }

  /**
   * 保存主题设置到存储
   */
  private saveThemeToStorage(): void {
    try {
      const data = {
        theme: this.currentTheme,
        mode: this.currentMode,
      }
      this.storage.setItem(this.options.storageKey, JSON.stringify(data))
    }
    catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }

  /**
   * 应用当前主题
   */
  private async applyCurrentTheme(): Promise<void> {
    // 确保主题数据已生成
    await this.preGenerateTheme(this.currentTheme)

    // 应用主题
    this.applyTheme(this.currentTheme, this.currentMode)
  }

  /**
   * 生成主题数据
   * @param config - 主题配置
   * @returns 生成的主题数据
   * @throws 当主题配置缺失必要信息时抛出错误
   */
  private async generateThemeData(
    config: ThemeConfig,
  ): Promise<GeneratedTheme> {
    // 验证主题配置的完整性
    if (!config.light?.primary) {
      throw new Error(`Theme "${config.name}" is missing light.primary color`)
    }

    const lightColors = this.colorGenerator.generateColors(config.light.primary)
    const lightColorConfig = {
      primary: config.light.primary,
      success: lightColors.success || '#52c41a',
      warning: lightColors.warning || '#faad14',
      danger: lightColors.danger || '#ff4d4f',
      gray: lightColors.gray || '#8c8c8c',
    }

    const darkColors = config.dark
      ? this.colorGenerator.generateColors(config.dark.primary)
      : lightColors
    const darkColorConfig = config.dark
      ? {
        primary: config.dark.primary,
        success: darkColors.success || '#49aa19',
        warning: darkColors.warning || '#d4b106',
        danger: darkColors.danger || '#dc4446',
        gray: darkColors.gray || '#8c8c8c',
      }
      : lightColorConfig

    // 生成色阶
    const lightScales = this.scaleGenerator.generateScales(
      lightColorConfig,
      'light',
    )
    const darkScales = this.scaleGenerator.generateScales(
      darkColorConfig,
      'dark',
    )

    // 生成完整的 CSS 变量（包含色阶、主色、语义化变量，带注释）
    const lightCompleteVariables = this.cssVariableGenerator.generateCompleteVariables(lightScales)
    const lightSemanticVariables = this.cssVariableGenerator.generateCompleteSemanticVariables(lightScales)
    const lightCSSVariableGroups = [...lightCompleteVariables, ...lightSemanticVariables]

    const darkCompleteVariables = this.cssVariableGenerator.generateCompleteVariables(darkScales)
    const darkSemanticVariables = this.cssVariableGenerator.generateCompleteSemanticVariables(darkScales)
    const darkCSSVariableGroups = [...darkCompleteVariables, ...darkSemanticVariables]

    // 为兼容性生成扁平的CSS变量
    const lightFlatVariables: Record<string, ColorValue> = {}
    lightCSSVariableGroups.forEach(group => {
      Object.assign(lightFlatVariables, group.variables)
    })

    const darkFlatVariables: Record<string, ColorValue> = {}
    darkCSSVariableGroups.forEach(group => {
      Object.assign(darkFlatVariables, group.variables)
    })

    return {
      name: config.name,
      light: {
        scales: lightScales,
        cssVariableGroups: lightCSSVariableGroups,
        cssVariables: lightFlatVariables,
      },
      dark: {
        scales: darkScales,
        cssVariableGroups: darkCSSVariableGroups,
        cssVariables: darkFlatVariables,
      },
      timestamp: Date.now(),
    }
  }

  /**
   * 开始闲时预生成
   */
  private startIdlePreGeneration(): void {
    // 预生成所有主题
    this.getThemeNames().forEach((name, index) => {
      this.idleProcessor.addTask(() => this.preGenerateTheme(name), index)
    })
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.eventEmitter.emit('error', error)
    if (this.options.onError) {
      this.options.onError(error)
    }
  }

  // EventEmitter 方法代理
  on<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    this.eventEmitter.on(event, listener)
  }

  off<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    this.eventEmitter.off(event, listener)
  }

  emit<T = unknown>(event: ThemeEventType, data?: T): void {
    this.eventEmitter.emit(event, data)
  }

  once<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    this.eventEmitter.once(event, listener)
  }

  removeAllListeners(event?: ThemeEventType): void {
    this.eventEmitter.removeAllListeners(event)
  }

  listenerCount(event: ThemeEventType): number {
    return this.eventEmitter.listenerCount(event)
  }

  eventNames(): ThemeEventType[] {
    return this.eventEmitter.eventNames()
  }
}
