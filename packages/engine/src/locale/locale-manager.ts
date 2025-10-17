/**
 * LocaleManager - 统一的多语言管理中心
 * 
 * @deprecated 已废弃，请使用新的插件系统
 * 
 * 新的插件系统使用方法：
 * ```typescript
 * // 方式1：自动共享
 * app.use(createI18nPlugin())  // 会自动 provide locale
 * app.use(createColorPlugin()) // 会自动 inject 并使用共享的 locale
 * 
 * // 方式2：显式共享
 * const locale = ref('zh-CN')
 * app.use(createI18nPlugin({ locale }))
 * app.use(createColorPlugin({ locale }))
 * ```
 * 
 * 保留此文件仅用于向后兼容
 */

import type { Engine } from '../types/engine'
import { ref, type Ref } from 'vue'

/**
 * 支持多语言的插件必须实现此接口
 */
export interface LocaleAwarePlugin {
  /**
   * 设置语言
   * @param locale 语言代码，如 'zh-CN', 'en-US'
   */
  setLocale: (locale: string) => void

  /**
   * 当前语言（可选，响应式）
   * 如果提供，manager 会自动绑定到全局 locale
   */
  currentLocale?: Ref<string>
}

/**
 * LocaleManager 配置选项
 */
export interface LocaleManagerOptions {
  /**
   * 初始语言
   * @default 'zh-CN'
   */
  initialLocale?: string

  /**
   * 后备语言
   * @default 'en-US'
   */
  fallbackLocale?: string

  /**
   * 是否自动持久化到 localStorage
   * @default true
   */
  persist?: boolean

  /**
   * 存储键名
   * @default 'ldesign-locale'
   */
  storageKey?: string

  /**
   * 语言变更前的钩子
   * 返回 false 可阻止切换
   */
  beforeChange?: (newLocale: string, oldLocale: string) => boolean | Promise<boolean>

  /**
   * 语言变更后的钩子
   */
  afterChange?: (newLocale: string, oldLocale: string) => void | Promise<void>

  /**
   * 错误处理
   */
  onError?: (error: Error) => void
}

/**
 * LocaleManager 类
 */
export class LocaleManager {
  private plugins = new Map<string, LocaleAwarePlugin>()
  private unwatchers: Array<() => void> = []
  private readonly currentLocale: Ref<string>
  private readonly fallbackLocale: string
  private readonly options: Required<Omit<LocaleManagerOptions, 'beforeChange' | 'afterChange' | 'onError'>> & {
    beforeChange?: LocaleManagerOptions['beforeChange']
    afterChange?: LocaleManagerOptions['afterChange']
    onError?: LocaleManagerOptions['onError']
  }

  constructor(
    private engine: Engine,
    options: LocaleManagerOptions = {}
  ) {
    // 合并默认选项
    this.options = {
      initialLocale: options.initialLocale || 'zh-CN',
      fallbackLocale: options.fallbackLocale || 'en-US',
      persist: options.persist !== false,
      storageKey: options.storageKey || 'ldesign-locale',
      beforeChange: options.beforeChange,
      afterChange: options.afterChange,
      onError: options.onError
    }

    this.fallbackLocale = this.options.fallbackLocale

    // 从持久化存储加载或使用初始语言
    const persistedLocale = this.loadPersistedLocale()
    this.currentLocale = ref(persistedLocale || this.options.initialLocale)

    // 初始化同步机制
    this.setupSync()

    this.engine.logger.info('LocaleManager initialized', {
      currentLocale: this.currentLocale.value,
      fallbackLocale: this.fallbackLocale,
      persist: this.options.persist
    })
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale.value
  }

  /**
   * 获取后备语言
   */
  getFallbackLocale(): string {
    return this.fallbackLocale
  }

  /**
   * 获取当前语言的响应式引用
   */
  getLocaleRef(): Ref<string> {
    return this.currentLocale
  }

  /**
   * 设置全局语言
   * 
   * @param locale 语言代码
   * @returns Promise<boolean> 是否成功切换
   */
  async setLocale(locale: string): Promise<boolean> {
    const oldLocale = this.currentLocale.value

    // 相同语言，跳过
    if (locale === oldLocale) {
      return true
    }

    try {
      // 调用 beforeChange 钩子
      if (this.options.beforeChange) {
        const shouldContinue = await this.options.beforeChange(locale, oldLocale)
        if (shouldContinue === false) {
          this.engine.logger.debug('Locale change cancelled by beforeChange hook', {
            from: oldLocale,
            to: locale
          })
          return false
        }
      }

      // 更新响应式状态
      this.currentLocale.value = locale

      // 同步到 engine.state
      this.engine.state.set('i18n.locale', locale)

      // 持久化到存储
      if (this.options.persist) {
        this.persistLocale(locale)
      }

      // 同步到所有已注册的插件
      this.syncToPlugins(locale)

      // 触发 engine 事件
      this.engine.events.emit('i18n:locale-changed', {
        newLocale: locale,
        oldLocale,
        timestamp: Date.now()
      })

      // 调用 afterChange 钩子
      if (this.options.afterChange) {
        await this.options.afterChange(locale, oldLocale)
      }

      this.engine.logger.info('Locale changed', {
        from: oldLocale,
        to: locale,
        pluginCount: this.plugins.size
      })

      return true
    } catch (error) {
      this.handleError(error as Error, 'setLocale')
      return false
    }
  }

  /**
   * 注册支持多语言的插件
   * 
   * @param name 插件名称（唯一标识）
   * @param plugin 插件实例
   */
  register(name: string, plugin: LocaleAwarePlugin): void {
    if (this.plugins.has(name)) {
      this.engine.logger.warn(`Plugin "${name}" is already registered in LocaleManager`)
      return
    }

    this.plugins.set(name, plugin)

    // 立即同步当前语言到新注册的插件
    try {
      plugin.setLocale(this.currentLocale.value)

      // 如果插件有 currentLocale 响应式属性，绑定到全局 locale
      if (plugin.currentLocale) {
        plugin.currentLocale.value = this.currentLocale.value
      }

      this.engine.logger.debug(`Plugin "${name}" registered to LocaleManager`, {
        currentLocale: this.currentLocale.value
      })
    } catch (error) {
      this.handleError(error as Error, `register:${name}`)
    }
  }

  /**
   * 注销插件
   * 
   * @param name 插件名称
   */
  unregister(name: string): void {
    if (this.plugins.delete(name)) {
      this.engine.logger.debug(`Plugin "${name}" unregistered from LocaleManager`)
    }
  }

  /**
   * 获取所有已注册的插件名称
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 销毁 LocaleManager
   * 清理所有监听器
   */
  destroy(): void {
    // 执行所有 unwatch 函数
    this.unwatchers.forEach(unwatch => unwatch())
    this.unwatchers = []

    // 清空插件注册
    this.plugins.clear()

    this.engine.logger.debug('LocaleManager destroyed')
  }

  /**
   * 设置同步机制
   * @private
   */
  private setupSync(): void {
    // 监听 engine.state 的 i18n.locale 变化
    // 这样可以支持其他地方通过 engine.state.set('i18n.locale', xxx) 来切换语言
    const unwatch = this.engine.state.watch('i18n.locale', (newLocale: string) => {
      if (newLocale && newLocale !== this.currentLocale.value) {
        // 使用 setLocale 来触发完整的切换流程
        this.setLocale(newLocale).catch(error => {
          this.handleError(error as Error, 'state.watch')
        })
      }
    })

    this.unwatchers.push(unwatch)

    // 初始化时同步到 engine.state
    this.engine.state.set('i18n.locale', this.currentLocale.value)
    this.engine.state.set('i18n.fallbackLocale', this.fallbackLocale)
  }

  /**
   * 同步语言到所有已注册的插件
   * @private
   */
  private syncToPlugins(locale: string): void {
    this.plugins.forEach((plugin, name) => {
      try {
        // 调用插件的 setLocale 方法
        plugin.setLocale(locale)

        // 如果插件有响应式 currentLocale，同步更新
        if (plugin.currentLocale) {
          plugin.currentLocale.value = locale
        }
      } catch (error) {
        this.handleError(error as Error, `syncToPlugins:${name}`)
      }
    })
  }

  /**
   * 从存储加载持久化的语言
   * @private
   */
  private loadPersistedLocale(): string | null {
    if (!this.options.persist || typeof window === 'undefined') {
      return null
    }

    try {
      const stored = localStorage.getItem(this.options.storageKey)
      if (stored) {
        this.engine.logger.debug('Loaded persisted locale', { locale: stored })
        return stored
      }
    } catch (error) {
      this.handleError(error as Error, 'loadPersistedLocale')
    }

    return null
  }

  /**
   * 持久化语言到存储
   * @private
   */
  private persistLocale(locale: string): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(this.options.storageKey, locale)
    } catch (error) {
      this.handleError(error as Error, 'persistLocale')
    }
  }

  /**
   * 错误处理
   * @private
   */
  private handleError(error: Error, context: string): void {
    this.engine.logger.error(`[LocaleManager:${context}]`, { error })

    if (this.options.onError) {
      try {
        this.options.onError(error)
      } catch (e) {
        this.engine.logger.error('Error in onError handler', { error: e })
      }
    }
  }
}

/**
 * 创建 LocaleManager 实例
 */
export function createLocaleManager(
  engine: Engine,
  options?: LocaleManagerOptions
): LocaleManager {
  return new LocaleManager(engine, options)
}
