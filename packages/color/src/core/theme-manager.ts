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
  TextSize,
  ThemeConfig,
  ThemeEventDataMap,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  ThemeManagerOptions,
  WCAGLevel,
} from './types'
import { ColorGeneratorImpl } from '../utils/color-generator'
import { ColorScaleGenerator } from '../utils/color-scale'
import { CSSInjectorImpl, CSSVariableGenerator } from '../utils/css-injector'
import { globalThemeApplier } from '../utils/css-variables'
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
  storageKey: 'ldesign-theme-manager',
  autoDetect: true,
  themes: [],
  cache: true,
  cssPrefix: '--color',
  idleProcessing: true,
  useConstructableCss: false,
  autoAdjustContrast: false,
  contrastLevel: 'AA',
  textSize: 'normal',
  onThemeChanged: undefined,
  onError: undefined,
}

/**
 * 主题管理器实现
 */
/**
 * 主题管理器实现
 *
 * 负责：
 * - 管理主题与颜色模式（light/dark）
 * - 生成色阶与 CSS 变量并注入页面
 * - 持久化主题状态并在启动时恢复
 * - 空闲时预生成主题数据以提升性能
 */
export class ThemeManager implements ThemeManagerInstance {
  private options: Required<Omit<ThemeManagerOptions, 'onThemeChanged' | 'onError' | 'themes'>> & {
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

  // 高对比度支持
  private highContrastEnabled: boolean = false
  private highContrastLevel: 'AA' | 'AAA' = 'AA'
  private highContrastTextSize: 'normal' | 'large' = 'normal'

  /**
   * 创建主题管理器
   * @param options 主题管理器配置选项
   */
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
      useConstructable: (this.options as any).useConstructableCss === true,
    })

    // 高对比度初始设置
    if ((this.options as any).autoAdjustContrast) {
      this.highContrastEnabled = true
      this.highContrastLevel = ((this.options as any).contrastLevel || 'AA') as 'AA' | 'AAA'
      this.highContrastTextSize = ((this.options as any).textSize || 'normal') as 'normal' | 'large'
    }
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
  /**
   * 初始化主题管理器
   * - 初始化系统主题检测
   * - 恢复已保存的主题状态
   * - 应用当前主题
   * - 根据配置启动闲时预生成
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
        timestamp: Date.now(),
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
  /**
   * 设置主题与模式
   * @param theme 目标主题名称
   * @param mode 可选的颜色模式（不传则保持当前模式）
   */
  async setTheme(theme: string, mode?: ColorMode): Promise<void> {
    const targetMode = mode || this.currentMode

    if (theme === this.currentTheme && targetMode === this.currentMode) {
      return
    }

    try {
      // 检查主题是否存在
      if (!this.getThemeConfig(theme)) {
        throw new Error(`Theme \"${theme}\" not found`)
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
        previousTheme: oldTheme,
        previousMode: oldMode,
        timestamp: Date.now(),
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
  /**
   * 设置颜色模式
   * @param mode 'light' | 'dark'
   */
  async setMode(mode: ColorMode): Promise<void> {
    await this.setTheme(this.currentTheme, mode)
  }

  /**
   * 切换颜色模式
   */
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
  /**
   * 注册单个主题配置
   * @param config 主题配置
   */
  registerTheme(config: ThemeConfig): void {
    // 检查主题是否已存在
    const existingIndex = this.options.themes.findIndex(t => t.name === config.name)

    if (existingIndex >= 0) {
      // 更新现有主题
      this.options.themes[existingIndex] = config
    }
    else {
      // 添加新主题
      this.options.themes.push(config)
    }

    this.eventEmitter.emit('theme-registered', { theme: config.name, config })

    // 如果启用了闲时处理，预生成主题
    if (this.options.idleProcessing && this.isInitialized) {
      this.idleProcessor.addTask(() => this.preGenerateTheme(config.name), 1)
    }
  }

  /**
   * 注册多个主题
   */
  /**
   * 批量注册主题
   * @param configs 主题配置数组
   */
  registerThemes(configs: ThemeConfig[]): void {
    configs.forEach(config => this.registerTheme(config))
  }

  /**
   * 获取主题配置
   */
  /**
   * 获取指定名称的主题配置
   * @param name 主题名称
   */
  getThemeConfig(name: string): ThemeConfig | undefined {
    return this.options.themes.find(theme => theme.name === name)
  }

  /**
   * 获取所有主题名称
   */
  /**
   * 获取所有已注册主题名称
   */
  getThemeNames(): string[] {
    return this.options.themes.map(theme => theme.name)
  }

  /**
   * 获取生成的主题数据
   */
  /**
   * 获取缓存中的已生成主题数据
   * @param name 主题名称
   */
  getGeneratedTheme(name: string): GeneratedTheme | undefined {
    const cacheKey = `${name}-generated`
    return this.cache.get(cacheKey)
  }

  /**
   * 预生成主题
   */
  /**
   * 预生成指定主题的数据（色阶与 CSS 变量）
   * @param name 主题名称
   */
  async preGenerateTheme(name: string): Promise<void> {
    const config = this.getThemeConfig(name)
    if (!config) {
      throw new Error(`Theme \"${name}\" not found`)
    }

    const cacheKey = `${name}-generated`

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return
    }

    try {
      const generatedTheme = await this.generateThemeData(config)
      this.cache.set(cacheKey, generatedTheme)

      this.eventEmitter.emit('theme-generated', { theme: name, mode: 'light' })
    }
    catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 预生成所有主题
   */
  /**
   * 预生成所有已注册主题的数据
   */
  async preGenerateAllThemes(): Promise<void> {
    const tasks = this.getThemeNames().map(name => () => this.preGenerateTheme(name))

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
  /**
   * 将主题应用到页面（注入 CSS 变量）
   * @param name 主题名称
   * @param mode 颜色模式
   */
  applyTheme(name: string, mode: ColorMode): void {
    const config = this.getThemeConfig(name)
    if (!config) {
      throw new Error(`Theme config for \"${name}\" not found`)
    }

    // 获取主色调
    const modeColors = config[mode] || config.light || config.dark
    const primaryColor = modeColors?.primary

    if (primaryColor) {
      // 使用增强的主题应用器，根据当前模式生成完整的色阶
      globalThemeApplier.applyTheme(primaryColor, mode, config)
    }
    else {
      console.warn(`[ThemeManager] 主题 \"${name}\" 没有定义主色调`)

      // 回退到原有逻辑
      const generatedTheme = this.getGeneratedTheme(name)
      if (generatedTheme) {
        const light = generatedTheme.light.cssVariables
        const dark = generatedTheme.dark.cssVariables
        // 如果实现了 injectThemeVariables 则优先使用
        if (this.cssInjector.injectThemeVariables) {
          this.cssInjector.injectThemeVariables(light, dark, {
            name,
            primaryColor: (light[`${this.options.cssPrefix}-primary`] as string) || '#165DFF',
          })
        }
        else {
          const modeData = generatedTheme[mode]
          if (modeData.cssVariableGroups && modeData.cssVariableGroups.length > 0) {
            this.cssInjector.injectVariablesWithComments(modeData.cssVariableGroups)
          }
          else {
            this.cssInjector.injectVariables(modeData.cssVariables)
          }
        }
      }
    }

    // 如启用高对比度，注入覆盖层
    if (this.highContrastEnabled) {
      try {
        this.applyHighContrastOverrides(mode)
      }
      catch (e) {
        this.handleError(e as Error)
      }
    }
  }

  /**
   * 渲染（SSR）指定主题的完整 CSS 文本
   */
  async renderThemeCSS(
    name: string,
    mode: ColorMode = 'light',
    options?: { includeComments?: boolean },
  ): Promise<string> {
    const config = this.getThemeConfig(name)
    if (!config) {
      throw new Error(`Theme config for \"${name}\" not found`)
    }

    // 确保有生成数据
    await this.preGenerateTheme(name)
    const generated = this.getGeneratedTheme(name)
    if (!generated)
      return ''

    const light = generated.light.cssVariables as Record<string, string>
    const dark = generated.dark.cssVariables as Record<string, string>

    // 优先使用注入器的构建能力
    if (this.cssInjector.buildThemeCSSText) {
      const primary
        = (generated[mode].cssVariables[`${this.options.cssPrefix}-primary`] as string) || '#165DFF'
      return this.cssInjector.buildThemeCSSText(light, dark, { name, primaryColor: primary })
    }

    // 退回到手动拼接
    const makeDecls = (vars: Record<string, string>) =>
      Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')

    const lightDecls = makeDecls(light)
    const darkDecls = makeDecls(dark)
    const head = options?.includeComments
      ? `/* LDesign Theme: ${name} | Generated: ${new Date().toISOString()} */\n`
      : ''
    return `${head}:root {\n${lightDecls}\n}\n\n:root[data-theme-mode=\"dark\"] {\n${darkDecls}\n}`
  }

  /**
   * 接管（hydrate）SSR 注入的样式标签
   */
  hydrateMountedStyles(idOrSelector?: string): void {
    try {
      if (typeof document === 'undefined')
        return
      const id = idOrSelector || 'ldesign-theme-variables'
      const el
        = id.startsWith('#') || id.startsWith('.')
          ? document.querySelector(id)
          : document.getElementById(id)
      if (el && this.cssInjector.hydrate) {
        const targetId = (el as HTMLElement).id || 'ldesign-theme-variables'
        this.cssInjector.hydrate(targetId)
      }
    }
    catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * 移除主题样式
   */
  /**
   * 移除页面上由主题注入的 CSS 变量
   */
  removeTheme(): void {
    this.cssInjector.removeVariables()
  }

  /**
   * 将主题应用到指定容器（作用域主题）
   * @param root 容器元素
   * @param theme 指定主题，不传则使用当前主题
   * @param mode 指定模式，不传则使用当前模式
   */
  async applyThemeTo(root: Element, theme?: string, mode?: ColorMode): Promise<void> {
    const name = theme || this.currentTheme
    const targetMode = mode || this.currentMode
    const config = this.getThemeConfig(name)
    if (!config)
      throw new Error(`Theme config for \"${name}\" not found`)

    // 为容器打标签，供选择器作用
    const scopeId = this.ensureScopeId(root)

    // 确保已生成数据
    await this.preGenerateTheme(name)
    const generated = this.getGeneratedTheme(name)
    if (!generated)
      return

    const light = generated.light.cssVariables as Record<string, string>
    const dark = generated.dark.cssVariables as Record<string, string>

    // 针对容器作用域构建选择器
    const scopedInjector = new CSSInjectorImpl({
      prefix: this.options.cssPrefix,
      selector: `[data-theme-scope=\"${scopeId}\"]`,
      styleId: `ldesign-theme-variables-${scopeId}`,
      useConstructable: (this.options as any).useConstructableCss === true,
    })

    if (scopedInjector.injectThemeVariables) {
      scopedInjector.injectThemeVariables(light, dark, {
        name,
        primaryColor: (light[`${this.options.cssPrefix}-primary`] as string) || '#165DFF',
      })
    }
    else {
      // 退回：仅注入当前模式的扁平变量
      const modeVars = targetMode === 'dark' ? dark : light
      // 简易注入
      ;(scopedInjector as any).updateVariables
        ? scopedInjector.updateVariables(modeVars)
        : this.cssInjector.injectVariables(modeVars)
    }
  }

  /**
   * 从指定容器移除作用域主题
   */
  removeThemeFrom(root: Element): void {
    const scopeId = (root as HTMLElement).getAttribute('data-theme-scope')
    if (!scopeId)
      return
    const el = document.getElementById(`ldesign-theme-variables-${scopeId}`)
    if (el)
      el.remove()
    ;(root as HTMLElement).removeAttribute('data-theme-scope')
  }

  /**
   * 为容器分配稳定的 scopeId
   */
  private ensureScopeId(root: Element): string {
    const el = root as HTMLElement
    const existing = el.getAttribute('data-theme-scope')
    if (existing)
      return existing
    const id = `scope-${Math.random().toString(36).slice(2, 8)}`
    el.setAttribute('data-theme-scope', id)
    return id
  }

  /**
   * 销毁实例
   */
  /**
   * 销毁实例，释放所有资源
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

    // 销毁缓存（清理定时器并释放内存）
    if ((this.cache as any).destroy) {
      (this.cache as any).destroy()
    } else {
      this.cache.clear()
    }

    // 移除所有事件监听器
    this.eventEmitter.removeAllListeners()

    this.isInitialized = false
  }

  /**
   * 创建存储实例
   */
  /**
   * 创建存储实例（local/session/memory）
   */
  private createStorage(): Storage {
    if (typeof this.options.storage === 'object') {
      return this.options.storage
    }

    switch (this.options.storage) {
      case 'localStorage':
        return typeof localStorage !== 'undefined' ? localStorage : this.createMemoryStorage()
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined' ? sessionStorage : this.createMemoryStorage()
      case 'memory':
      default:
        return this.createMemoryStorage()
    }
  }

  /**
   * 创建内存存储
   */
  /**
   * 创建内存存储（用于无 window 环境或存储不可用时）
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
   * 
   * 优化特性：
   * - 使用双向链表结构实现真正的 O(1) LRU 操作
   * - 基于 TTL 的自动过期机制，减少内存占用
   * - 定期清理过期条目，避免内存泄漏
   * - 缓存统计信息，便于监控和调优
   * 
   * @returns 增强的 LRU 缓存实例
   */
  private createCache(): LRUCache<GeneratedTheme> {
    const maxSize = typeof this.options.cache === 'object' ? this.options.cache.maxSize || 50 : 50
    const ttl = 10 * 60 * 1000 // 10分钟TTL，主题数据不常变化

    // 双向链表节点
    interface CacheNode {
      key: string
      value: GeneratedTheme
      expiresAt: number
      prev: CacheNode | null
      next: CacheNode | null
    }

    // 缓存统计
    const stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0,
    }

    const cache = new Map<string, CacheNode>()
    let head: CacheNode | null = null // 最近使用
    let tail: CacheNode | null = null // 最久未使用

    // 定期清理过期条目（每2分钟）
    let cleanupTimer: NodeJS.Timeout | null = null
    const startCleanup = () => {
      cleanupTimer = setInterval(() => {
        const now = Date.now()
        const toDelete: string[] = []
        
        cache.forEach((node, key) => {
          if (now > node.expiresAt) {
            toDelete.push(key)
            stats.expirations++
          }
        })
        
        toDelete.forEach(key => {
          const node = cache.get(key)
          if (node) {
            removeNode(node)
            cache.delete(key)
          }
        })
      }, 2 * 60 * 1000)

      // 允许进程退出
      if (typeof process !== 'undefined' && cleanupTimer.unref) {
        cleanupTimer.unref()
      }
    }

    // 移除节点（从链表中）
    const removeNode = (node: CacheNode) => {
      if (node.prev) {
        node.prev.next = node.next
      } else {
        head = node.next
      }

      if (node.next) {
        node.next.prev = node.prev
      } else {
        tail = node.prev
      }

      node.prev = null
      node.next = null
    }

    // 将节点移到链表头部（最近使用）
    const moveToHead = (node: CacheNode) => {
      if (node === head) return

      removeNode(node)
      node.next = head
      node.prev = null

      if (head) {
        head.prev = node
      }
      head = node

      if (!tail) {
        tail = node
      }
    }

    // 添加到链表头部
    const addToHead = (node: CacheNode) => {
      node.next = head
      node.prev = null

      if (head) {
        head.prev = node
      }
      head = node

      if (!tail) {
        tail = node
      }
    }

    // 移除尾部节点（最久未使用）
    const removeTail = (): CacheNode | null => {
      if (!tail) return null

      const removed = tail
      removeNode(removed)
      return removed
    }

    startCleanup()

    return {
      get: (key: string) => {
        const node = cache.get(key)
        
        if (!node) {
          stats.misses++
          return undefined
        }

        // 检查是否过期
        if (Date.now() > node.expiresAt) {
          removeNode(node)
          cache.delete(key)
          stats.expirations++
          stats.misses++
          return undefined
        }

        // 移到头部（最近使用）
        moveToHead(node)
        stats.hits++
        return node.value
      },

      set: (key: string, value: GeneratedTheme) => {
        const existing = cache.get(key)

        if (existing) {
          // 更新现有节点
          existing.value = value
          existing.expiresAt = Date.now() + ttl
          moveToHead(existing)
          return
        }

        // 创建新节点
        const newNode: CacheNode = {
          key,
          value,
          expiresAt: Date.now() + ttl,
          prev: null,
          next: null,
        }

        cache.set(key, newNode)
        addToHead(newNode)

        // 如果超过容量，移除最久未使用的
        if (cache.size > maxSize) {
          const removed = removeTail()
          if (removed) {
            cache.delete(removed.key)
            stats.evictions++
          }
        }
      },

      delete: (key: string) => {
        const node = cache.get(key)
        if (!node) return false

        removeNode(node)
        cache.delete(key)
        return true
      },

      clear: () => {
        cache.clear()
        head = null
        tail = null
        stats.hits = 0
        stats.misses = 0
        stats.evictions = 0
        stats.expirations = 0
      },

      size: () => cache.size,

      has: (key: string) => {
        const node = cache.get(key)
        if (!node) return false
        
        // 检查是否过期
        if (Date.now() > node.expiresAt) {
          removeNode(node)
          cache.delete(key)
          stats.expirations++
          return false
        }
        
        return true
      },

      // 获取缓存统计（扩展方法）
      getStats: () => ({
        ...stats,
        size: cache.size,
        hitRate: stats.hits + stats.misses > 0 
          ? stats.hits / (stats.hits + stats.misses) 
          : 0,
      }),

      // 手动清理过期条目（扩展方法）
      cleanup: () => {
        const now = Date.now()
        let cleaned = 0
        
        cache.forEach((node, key) => {
          if (now > node.expiresAt) {
            removeNode(node)
            cache.delete(key)
            stats.expirations++
            cleaned++
          }
        })
        
        return cleaned
      },

      // 销毁缓存（扩展方法）
      destroy: () => {
        if (cleanupTimer) {
          clearInterval(cleanupTimer)
          cleanupTimer = null
        }
        cache.clear()
        head = null
        tail = null
      },
    }
  }

  /**
   * 初始化系统主题检测器
   */
  /**
   * 初始化系统主题检测器（浏览器环境）
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
    this.systemThemeWatcher = this.systemThemeDetector.watchSystemTheme((mode) => {
      if (this.currentTheme === 'system') {
        this.setMode(mode)
      }
    })
  }

  /**
   * 从存储中恢复主题设置
   */
  /**
   * 从存储中恢复已保存的主题/模式
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
  /**
   * 将当前主题/模式保存到存储
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
  /**
   * 应用当前主题（确保已生成数据后注入 CSS 变量）
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
  /**
   * 生成主题数据：色阶与 CSS 变量
   * @param config 主题配置
   * @throws 当主题配置缺失必要信息时抛出错误
   */
  private async generateThemeData(config: ThemeConfig): Promise<GeneratedTheme> {
    // 验证主题配置的完整性
    if (!config.light?.primary) {
      throw new Error(`Theme \"${config.name}\" is missing light.primary color`)
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
    const lightScales = this.scaleGenerator.generateScales(lightColorConfig, 'light')
    const darkScales = this.scaleGenerator.generateScales(darkColorConfig, 'dark')

    // 生成完整的 CSS 变量（包含色阶、主色、语义化变量，带注释）
    const lightCompleteVariables = this.cssVariableGenerator.generateCompleteVariables(lightScales)
    const lightSemanticVariables
      = this.cssVariableGenerator.generateCompleteSemanticVariables(lightScales)
    const lightCSSVariableGroups = [...lightCompleteVariables, ...lightSemanticVariables]

    const darkCompleteVariables = this.cssVariableGenerator.generateCompleteVariables(darkScales)
    const darkSemanticVariables
      = this.cssVariableGenerator.generateCompleteSemanticVariables(darkScales)
    const darkCSSVariableGroups = [...darkCompleteVariables, ...darkSemanticVariables]

    // 为兼容性生成扁平的CSS变量
    const lightFlatVariables: Record<string, ColorValue> = {}
    lightCSSVariableGroups.forEach((group) => {
      Object.assign(lightFlatVariables, group.variables)
    })

    const darkFlatVariables: Record<string, ColorValue> = {}
    darkCSSVariableGroups.forEach((group) => {
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
  /**
   * 启动闲时预生成任务，按顺序预热所有主题
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
  /**
   * 统一错误处理：触发事件并调用错误回调
   */
  private handleError(error: Error): void {
    this.eventEmitter.emit('error', {
      message: error.message,
      code: error.name,
      details: error,
      timestamp: Date.now(),
    })
    if (this.options.onError) {
      this.options.onError(error)
    }
  }

  // EventEmitter 方法代理
  on<K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>): void {
    this.eventEmitter.on(event, listener)
  }

  off<K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>): void {
    this.eventEmitter.off(event, listener)
  }

  emit<K extends ThemeEventType>(event: K, data: ThemeEventDataMap[K]): void {
    this.eventEmitter.emit(event, data)
  }

  once<K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>): void {
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

  /**
   * 获取缓存统计信息
   * 
   * 返回缓存的命中/未命中次数、淘汰/过期数量、当前大小和命中率
   * 可用于监控和优化缓存策略
   * 
   * @returns 缓存统计对象
   * @example
   * ```ts
   * const stats = themeManager.getCacheStats()
   * console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
   * console.log(`缓存大小: ${stats.size}`)
   * ```
   */
  getCacheStats(): {
    hits: number
    misses: number
    evictions: number
    expirations: number
    size: number
    hitRate: number
  } | null {
    if ((this.cache as any).getStats) {
      return (this.cache as any).getStats()
    }
    return null
  }

  /**
   * 手动清理过期的缓存条目
   * 
   * 在内存压力大时可手动调用以释放内存
   * 注意：缓存已有自动清理机制，一般不需要手动调用
   * 
   * @returns 清理的过期条目数量
   * @example
   * ```ts
   * const cleaned = themeManager.cleanupCache()
   * console.log(`清理了 ${cleaned} 个过期的缓存条目`)
   * ```
   */
  cleanupCache(): number {
    if ((this.cache as any).cleanup) {
      return (this.cache as any).cleanup()
    }
    return 0
  }

  /**
   * 启用/禁用高对比度覆盖
   */
  enableHighContrast(enable: boolean, options?: { level?: WCAGLevel, textSize?: TextSize }): void {
    this.highContrastEnabled = enable
    if (options?.level)
      this.highContrastLevel = options.level
    if (options?.textSize && (options.textSize === 'normal' || options.textSize === 'large'))
      this.highContrastTextSize = options.textSize

    // 立即应用或移除覆盖
    if (this.isInitialized) {
      if (enable) {
        this.applyHighContrastOverrides(this.currentMode)
      }
      else {
        this.removeHighContrastOverrides()
      }
    }
  }

  /**
   * 是否启用了高对比度
   */
  isHighContrastEnabled(): boolean {
    return this.highContrastEnabled
  }

  /**
   * 应用高对比度覆盖样式
   * 简化策略：依据当前背景/文本变量，确保达到目标阈值
   */
  private applyHighContrastOverrides(_mode: ColorMode): void {
    // 构造一些关键变量的高对比度替换（示例策略）
    const styleId = 'ldesign-theme-variables-contrast'
    // 计算对比度阈值（保留用于未来扩展）
    // const threshold = this.highContrastLevel === 'AAA'
    //   ? (this.highContrastTextSize === 'large' ? 4.5 : 7)
    //   : (this.highContrastTextSize === 'large' ? 3 : 4.5)

    // 这里直接增强常见文本/背景变量的对比度：
    // 若背景为浅色，则文本强制为 #000；若背景为深色，则文本强制为 #fff
    const baseSelector = ':root'
    const darkSelector = ':root[data-theme-mode="dark"]'

    const overridesLight = [
      `  var(--color-text): #000000 !important;`,
      `  var(--color-text-primary): #000000 !important;`,
      `  var(--color-text-secondary): #1a1a1a !important;`,
      `  var(--color-border): #1f1f1f !important;`,
    ]

    const overridesDark = [
      `  var(--color-text): #ffffff !important;`,
      `  var(--color-text-primary): #ffffff !important;`,
      `  var(--color-text-secondary): #e6e6e6 !important;`,
      `  var(--color-border): #e6e6e6 !important;`,
    ]

    const css = `/* High Contrast Overrides (${this.highContrastLevel}, ${this.highContrastTextSize}) */
${baseSelector} {
${overridesLight.join('\n')}
}

${darkSelector} {
${overridesDark.join('\n')}
}`

    // 使用注入器注入覆盖层（单独 styleId）
    if ((this.cssInjector as any).updateStyleElement) {
      // 通过 injectVariables 注入固定文本不可行，这里直接走底层更新方法
      ;(this.cssInjector as any).updateStyleElement(styleId, css)
    }
    else {
      // 回退：创建独立 <style>
      const exist = document.getElementById(styleId) as HTMLStyleElement
      if (exist) {
        exist.textContent = css
      }
      else {
        const st = document.createElement('style')
        st.id = styleId
        st.type = 'text/css'
        st.textContent = css
        document.head.appendChild(st)
      }
    }
  }

  /**
   * 移除高对比度覆盖
   */
  private removeHighContrastOverrides(): void {
    const styleId = 'ldesign-theme-variables-contrast'
    // 通过注入器清理（如果可能）
    if ((this.cssInjector as any).removeVariables) {
      ;(this.cssInjector as any).removeVariables(styleId)
    }
    const el = document.getElementById(styleId)
    if (el)
      el.remove()
  }
}
