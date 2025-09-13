/**
 * 主题管理器
 * 
 * 负责管理日历的主题系统：
 * - 主题注册和卸载
 * - 主题切换
 * - CSS变量管理
 * - 主题导入导出
 * - 自定义主题创建
 */

import type {
  CalendarTheme,
  IThemeManager,
  ThemeEvent,
  ThemeVariables
} from '../types/theme'

/**
 * 主题管理器类
 */
export class ThemeManager implements IThemeManager {
  /** 已注册的主题 */
  private themes: Map<string, CalendarTheme> = new Map()

  /** 当前主题 */
  private currentTheme: CalendarTheme | null = null

  /** 事件监听器 */
  private eventListeners: Map<string, Function[]> = new Map()

  /** 样式元素 */
  private styleElement: HTMLStyleElement | null = null

  /**
   * 构造函数
   */
  constructor() {
    this.initializeStyleElement()
    this.registerBuiltinThemes()
  }

  /**
   * 注册主题
   * @param theme 主题对象
   */
  register(theme: CalendarTheme): void {
    if (this.themes.has(theme.name)) {
      console.warn(`主题 ${theme.name} 已经注册`)
      return
    }

    // 验证主题
    if (!this.validateTheme(theme)) {
      throw new Error(`主题 ${theme.name} 验证失败`)
    }

    // 注册主题
    this.themes.set(theme.name, theme)

    // 触发主题注册事件
    this.emitThemeEvent('register', theme.name)
  }

  /**
   * 卸载主题
   * @param themeName 主题名称
   */
  unregister(themeName: string): void {
    if (!this.themes.has(themeName)) {
      console.warn(`主题 ${themeName} 不存在`)
      return
    }

    // 如果是当前主题，先切换到默认主题
    if (this.currentTheme?.name === themeName) {
      this.apply('default')
    }

    // 卸载主题
    this.themes.delete(themeName)

    // 触发主题卸载事件
    this.emitThemeEvent('unregister', themeName)
  }

  /**
   * 应用主题
   * @param themeName 主题名称
   */
  apply(themeName: string): void {
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`主题 ${themeName} 不存在`)
    }

    const previousTheme = this.currentTheme?.name

    // 应用主题变量
    this.applyThemeVariables(theme)

    // 应用自定义CSS
    this.applyCustomCSS(theme)

    // 更新当前主题
    this.currentTheme = theme

    // 触发主题变化事件
    this.emitThemeEvent('apply', themeName)
    if (previousTheme && previousTheme !== themeName) {
      this.emitThemeEvent('change', themeName, previousTheme)
    }
  }

  /**
   * 获取当前主题
   */
  getCurrent(): CalendarTheme | null {
    return this.currentTheme ? { ...this.currentTheme } : null
  }

  /**
   * 获取主题
   * @param themeName 主题名称
   */
  get(themeName: string): CalendarTheme | null {
    const theme = this.themes.get(themeName)
    return theme ? { ...theme } : null
  }

  /**
   * 获取所有主题
   */
  getAll(): CalendarTheme[] {
    return Array.from(this.themes.values()).map(theme => ({ ...theme }))
  }

  /**
   * 检查主题是否存在
   * @param themeName 主题名称
   */
  has(themeName: string): boolean {
    return this.themes.has(themeName)
  }

  /**
   * 创建自定义主题
   * @param baseTheme 基础主题名称
   * @param customConfig 自定义配置
   */
  create(baseTheme: string, customConfig: Partial<CalendarTheme>): CalendarTheme {
    const base = this.themes.get(baseTheme)
    if (!base) {
      throw new Error(`基础主题 ${baseTheme} 不存在`)
    }

    // 合并配置
    const customTheme: CalendarTheme = {
      ...base,
      ...customConfig,
      name: customConfig.name || `${baseTheme}-custom`,
      colors: { ...base.colors, ...customConfig.colors },
      fonts: { ...base.fonts, ...customConfig.fonts },
      spacing: { ...base.spacing, ...customConfig.spacing },
      borderRadius: { ...base.borderRadius, ...customConfig.borderRadius },
      shadows: { ...base.shadows, ...customConfig.shadows },
      animations: { ...base.animations, ...customConfig.animations },
      calendar: { ...base.calendar, ...customConfig.calendar },
      customVariables: { ...base.customVariables, ...customConfig.customVariables },
    }

    return customTheme
  }

  /**
   * 导出主题
   * @param themeName 主题名称
   */
  export(themeName: string): string {
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`主题 ${themeName} 不存在`)
    }

    return JSON.stringify(theme, null, 2)
  }

  /**
   * 导入主题
   * @param themeData 主题数据
   */
  import(themeData: string): CalendarTheme {
    try {
      const theme: CalendarTheme = JSON.parse(themeData)

      // 验证主题
      if (!this.validateTheme(theme)) {
        throw new Error('导入的主题数据无效')
      }

      // 注册主题
      this.register(theme)

      return theme
    } catch (error) {
      throw new Error(`导入主题失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 重置为默认主题
   */
  reset(): void {
    this.apply('default')
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 初始化样式元素
   */
  private initializeStyleElement(): void {
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'ldesign-calendar-theme'
    document.head.appendChild(this.styleElement)
  }

  /**
   * 注册内置主题
   */
  private registerBuiltinThemes(): void {
    // 动态导入内置主题
    import('./default').then(({ DefaultTheme }) => {
      this.register(DefaultTheme)
      // 如果没有当前主题，应用默认主题
      if (!this.currentTheme) {
        this.apply('default')
      }
    }).catch(error => {
      console.warn('加载默认主题失败:', error)
    })

    import('./dark').then(({ DarkTheme }) => {
      this.register(DarkTheme)
    }).catch(error => {
      console.warn('加载暗色主题失败:', error)
    })

    import('./blue').then(({ BlueTheme }) => {
      this.register(BlueTheme)
    }).catch(error => {
      console.warn('加载蓝色主题失败:', error)
    })

    import('./green').then(({ GreenTheme }) => {
      this.register(GreenTheme)
    }).catch(error => {
      console.warn('加载绿色主题失败:', error)
    })
  }

  /**
   * 验证主题
   * @param theme 主题对象
   */
  private validateTheme(theme: CalendarTheme): boolean {
    if (!theme.name || !theme.colors) {
      return false
    }

    // 检查必需的颜色属性
    const requiredColors = ['primary', 'background', 'text']
    for (const color of requiredColors) {
      if (!theme.colors[color as keyof typeof theme.colors]) {
        console.error(`主题 ${theme.name} 缺少必需的颜色属性: ${color}`)
        return false
      }
    }

    return true
  }

  /**
   * 应用主题变量
   * @param theme 主题对象
   */
  private applyThemeVariables(theme: CalendarTheme): void {
    const variables: ThemeVariables = {}

    // 转换颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables[`--ldesign-calendar-color-${key}`] = value
    })

    // 转换字体变量
    if (theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        variables[`--ldesign-calendar-font-${key}`] = String(value)
      })
    }

    // 转换间距变量
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        variables[`--ldesign-calendar-spacing-${key}`] = value
      })
    }

    // 转换圆角变量
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        variables[`--ldesign-calendar-border-radius-${key}`] = value
      })
    }

    // 转换阴影变量
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        variables[`--ldesign-calendar-shadow-${key}`] = value
      })
    }

    // 添加自定义变量
    if (theme.customVariables) {
      Object.entries(theme.customVariables).forEach(([key, value]) => {
        variables[key] = value
      })
    }

    // 应用变量到根元素
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  /**
   * 应用自定义CSS
   * @param theme 主题对象
   */
  private applyCustomCSS(theme: CalendarTheme): void {
    if (this.styleElement && theme.customCSS) {
      this.styleElement.textContent = theme.customCSS
    }
  }

  /**
   * 触发主题事件
   * @param type 事件类型
   * @param themeName 主题名称
   * @param previousTheme 之前的主题名称（可选）
   */
  private emitThemeEvent(
    type: ThemeEvent['type'],
    themeName: string,
    previousTheme?: string
  ): void {
    const event: ThemeEvent = {
      type,
      themeName,
      timestamp: Date.now(),
    }

    if (previousTheme) {
      event.previousTheme = previousTheme
    }

    // 触发通用主题事件
    this.emit('themeEvent', event)

    // 触发特定类型的事件
    this.emit(`theme${type.charAt(0).toUpperCase() + type.slice(1)}`, event)
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 参数
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`主题事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }
}
