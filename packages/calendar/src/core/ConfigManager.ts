/**
 * 配置管理器 - 负责管理日历的配置选项
 */

import type { CalendarConfig, ViewType, LocaleType, ThemeType, DateInput } from '../types'
import { DateUtils } from '../utils/date'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<CalendarConfig> = {
  container: '',
  view: 'month',
  date: new Date(),
  locale: 'zh-CN',
  theme: 'default',
  firstDayOfWeek: 1, // 周一
  showLunar: true,
  showHolidays: true,
  showWeekNumbers: false,
  showToday: true,
  showNavigation: true,
  showToolbar: true,
  minDate: new Date(1900, 0, 1),
  maxDate: new Date(2100, 11, 31),
  disabledDates: [],
  selectionMode: 'single',
  maxSelections: 0,
  enableDragDrop: true,
  enableResize: true,
  enableKeyboard: true,
  enableTouch: true,
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    viewTransition: 'slide'
  },
  className: '',
  style: {}
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  /** 当前配置 */
  private config: Required<CalendarConfig>
  /** 配置变更监听器 */
  private listeners: Map<string, Function[]> = new Map()

  constructor(initialConfig: CalendarConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, initialConfig)
    this.validateConfig()
  }

  /**
   * 合并配置
   */
  private mergeConfig(defaultConfig: Required<CalendarConfig>, userConfig: CalendarConfig): Required<CalendarConfig> {
    const merged = { ...defaultConfig }

    for (const key in userConfig) {
      const value = userConfig[key as keyof CalendarConfig]
      if (value !== undefined) {
        if (key === 'animation' && typeof value === 'object') {
          merged.animation = { ...defaultConfig.animation, ...value }
        } else if (key === 'style' && typeof value === 'object') {
          merged.style = { ...defaultConfig.style, ...value } as any
        } else {
          (merged as any)[key] = value
        }
      }
    }

    return merged
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    // 验证视图类型
    const validViews: ViewType[] = ['month', 'week', 'day', 'year']
    if (!validViews.includes(this.config.view)) {
      console.warn(`Invalid view type: ${this.config.view}, using default: month`)
      this.config.view = 'month'
    }

    // 验证语言
    const validLocales: LocaleType[] = ['zh-CN', 'en-US']
    if (!validLocales.includes(this.config.locale as LocaleType)) {
      console.warn(`Invalid locale: ${this.config.locale}, using default: zh-CN`)
      this.config.locale = 'zh-CN'
    }

    // 验证主题
    const validThemes: ThemeType[] = ['default', 'dark', 'blue', 'green']
    if (!validThemes.includes(this.config.theme as ThemeType)) {
      console.warn(`Invalid theme: ${this.config.theme}, using default: default`)
      this.config.theme = 'default'
    }

    // 验证每周起始日
    if (this.config.firstDayOfWeek < 0 || this.config.firstDayOfWeek > 6) {
      console.warn(`Invalid firstDayOfWeek: ${this.config.firstDayOfWeek}, using default: 1`)
      this.config.firstDayOfWeek = 1
    }

    // 验证选择模式
    const validSelectionModes = ['single', 'multiple', 'range', 'week', 'month']
    if (!validSelectionModes.includes(this.config.selectionMode)) {
      console.warn(`Invalid selectionMode: ${this.config.selectionMode}, using default: single`)
      this.config.selectionMode = 'single'
    }

    // 验证最大选择数量
    if (this.config.maxSelections < 0) {
      console.warn(`Invalid maxSelections: ${this.config.maxSelections}, using default: 0`)
      this.config.maxSelections = 0
    }

    // 验证日期范围
    if (DateUtils.isAfter(this.config.minDate, this.config.maxDate)) {
      console.warn('minDate cannot be after maxDate, swapping values')
      const temp = this.config.minDate
      this.config.minDate = this.config.maxDate
      this.config.maxDate = temp
    }

    // 验证动画配置
    if (this.config.animation.duration < 0) {
      console.warn(`Invalid animation duration: ${this.config.animation.duration}, using default: 300`)
      this.config.animation.duration = 300
    }

    const validTransitions = ['slide', 'fade', 'zoom', 'none']
    if (!validTransitions.includes(this.config.animation.viewTransition)) {
      console.warn(`Invalid view transition: ${this.config.animation.viewTransition}, using default: slide`)
      this.config.animation.viewTransition = 'slide'
    }
  }

  /**
   * 获取配置值
   */
  public get<K extends keyof CalendarConfig>(key: K): Required<CalendarConfig>[K] {
    return this.config[key]
  }

  /**
   * 设置配置值
   */
  public set<K extends keyof CalendarConfig>(key: K, value: CalendarConfig[K]): void {
    const oldValue = this.config[key]
    
    if (key === 'animation' && typeof value === 'object') {
      this.config.animation = { ...this.config.animation, ...value }
    } else if (key === 'style' && typeof value === 'object') {
      this.config.style = { ...this.config.style, ...value } as any
    } else {
      (this.config as any)[key] = value
    }

    // 重新验证配置
    this.validateConfig()

    // 触发变更事件
    this.emit('configChanged', key, this.config[key], oldValue)
    this.emit(`${key}Changed`, this.config[key], oldValue)
  }

  /**
   * 批量设置配置
   */
  public setMultiple(config: Partial<CalendarConfig>): void {
    const changes: Array<{ key: string; newValue: any; oldValue: any }> = []

    for (const key in config) {
      const typedKey = key as keyof CalendarConfig
      const value = config[typedKey]
      if (value !== undefined) {
        const oldValue = this.config[typedKey]
        
        if (key === 'animation' && typeof value === 'object') {
          this.config.animation = { ...this.config.animation, ...value }
        } else if (key === 'style' && typeof value === 'object') {
          this.config.style = { ...this.config.style, ...value } as any
        } else {
          (this.config as any)[key] = value
        }

        changes.push({ key, newValue: this.config[typedKey], oldValue })
      }
    }

    // 重新验证配置
    this.validateConfig()

    // 触发变更事件
    for (const change of changes) {
      this.emit('configChanged', change.key, change.newValue, change.oldValue)
      this.emit(`${change.key}Changed`, change.newValue, change.oldValue)
    }

    this.emit('configBatchChanged', changes)
  }

  /**
   * 获取所有配置
   */
  public getAll(): Required<CalendarConfig> {
    return { ...this.config }
  }

  /**
   * 重置配置为默认值
   */
  public reset(): void {
    const oldConfig = { ...this.config }
    this.config = { ...DEFAULT_CONFIG }
    this.emit('configReset', this.config, oldConfig)
  }

  /**
   * 重置指定配置项为默认值
   */
  public resetKey<K extends keyof CalendarConfig>(key: K): void {
    const oldValue = this.config[key]
    this.config[key] = DEFAULT_CONFIG[key]
    this.emit('configChanged', key, this.config[key], oldValue)
    this.emit(`${key}Changed`, this.config[key], oldValue)
  }

  /**
   * 检查配置是否有效
   */
  public isValid(): boolean {
    try {
      this.validateConfig()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取默认配置
   */
  public static getDefaultConfig(): Required<CalendarConfig> {
    return { ...DEFAULT_CONFIG }
  }

  /**
   * 检查日期是否被禁用
   */
  public isDateDisabled(date: DateInput): boolean {
    const targetDate = DateUtils.dayjs(date)
    const minDate = DateUtils.dayjs(this.config.minDate)
    const maxDate = DateUtils.dayjs(this.config.maxDate)

    // 检查日期范围
    if (targetDate.isBefore(minDate, 'day') || targetDate.isAfter(maxDate, 'day')) {
      return true
    }

    // 检查禁用日期列表
    const disabledDates = this.config.disabledDates
    if (Array.isArray(disabledDates)) {
      return disabledDates.some(disabledDate => 
        DateUtils.dayjs(disabledDate).isSame(targetDate, 'day')
      )
    } else if (typeof disabledDates === 'function') {
      return disabledDates(targetDate)
    }

    return false
  }

  /**
   * 获取有效的日期范围
   */
  public getValidDateRange(): { min: DateInput; max: DateInput } {
    return {
      min: this.config.minDate,
      max: this.config.maxDate
    }
  }

  /**
   * 检查是否启用了某个功能
   */
  public isFeatureEnabled(feature: 'dragDrop' | 'resize' | 'keyboard' | 'touch' | 'animation'): boolean {
    switch (feature) {
      case 'dragDrop':
        return this.config.enableDragDrop
      case 'resize':
        return this.config.enableResize
      case 'keyboard':
        return this.config.enableKeyboard
      case 'touch':
        return this.config.enableTouch
      case 'animation':
        return this.config.animation.enabled
      default:
        return false
    }
  }

  /**
   * 获取动画配置
   */
  public getAnimationConfig() {
    return { ...this.config.animation }
  }

  /**
   * 获取样式配置
   */
  public getStyleConfig() {
    return { ...this.config.style }
  }

  /**
   * 事件监听
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return
    
    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in config manager handler for "${event}":`, error)
      }
    })
  }

  /**
   * 销毁配置管理器
   */
  public destroy(): void {
    this.listeners.clear()
  }
}
