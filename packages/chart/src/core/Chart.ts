/**
 * 核心图表类
 * 
 * 这是图表库的核心类，负责：
 * - 管理 ECharts 实例
 * - 处理图表配置
 * - 管理图表生命周期
 * - 提供统一的 API 接口
 */

import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type {
  ChartConfig,
  ChartData,
  ChartSize,
  ChartEventType,
  EventHandler,
  ChartInstance,
  ThemeConfig,
} from './types'
import {
  DEFAULT_CHART_CONFIG,
  ERROR_MESSAGES,
  CHART_CONTAINER_CLASS,
  LOADING_CLASS,
  RESPONSIVE_CLASS,
  RESIZE_DEBOUNCE_DELAY,
} from './constants'
import { ChartFactory } from './ChartFactory'
import { DataAdapter } from '../adapters/DataAdapter'
import { ConfigBuilder } from '../config/ConfigBuilder'
import { ThemeManager } from '../themes/ThemeManager'
import { EventManager } from '../events/EventManager'
import { ResponsiveManager } from '../responsive/ResponsiveManager'
import { ExportManager, type ExportOptions, type ExportFormat } from '../export/ExportManager'
import { InteractionManager, type InteractionConfig } from '../interactions/InteractionManager'
import { LifecycleManager } from '../lifecycle/LifecycleManager'
import { AnimationManager } from '../animations/AnimationManager'
import { PerformanceManager, type PerformanceConfig } from '../performance/PerformanceManager'
import { MemoryManager, type MemoryConfig } from '../memory/MemoryManager'
import { RealTimeDataManager, type RealTimeConfig, type WebSocketConfig } from '../realtime/RealTimeDataManager'
import { DataStreamProcessor, type DataStreamConfig } from '../realtime/DataStreamProcessor'
import { validateContainer, validateConfig, debounce } from '../utils/helpers'
import { mergeWithDefaults } from '../config/defaults'

/**
 * 核心图表类
 * 
 * 使用示例：
 * ```typescript
 * const chart = new Chart(container, {
 *   type: 'line',
 *   data: [
 *     { name: '1月', value: 100 },
 *     { name: '2月', value: 200 }
 *   ],
 *   title: '月度数据'
 * })
 * ```
 */
export class Chart implements ChartInstance {
  /** ECharts 实例 */
  private _echarts: ECharts | null = null

  /** 图表配置 */
  private _config: ChartConfig

  /** 图表容器 */
  private _container: HTMLElement

  /** 数据适配器 */
  private _dataAdapter: DataAdapter

  /** 配置构建器 */
  private _configBuilder: ConfigBuilder

  /** 主题管理器 */
  private _themeManager: ThemeManager

  /** 事件管理器 */
  private _eventManager: EventManager

  /** 响应式管理器 */
  private _responsiveManager: ResponsiveManager | null = null

  /** 导出管理器 */
  private _exportManager: ExportManager

  /** 交互管理器 */
  private _interactionManager: InteractionManager | null = null

  /** 生命周期管理器 */
  private _lifecycleManager: LifecycleManager | null = null

  /** 动画管理器 */
  private _animationManager: AnimationManager | null = null

  /** 性能管理器 */
  private _performanceManager: PerformanceManager | null = null

  /** 内存管理器 */
  private _memoryManager: MemoryManager | null = null

  /** 实时数据管理器 */
  private _realTimeDataManager: RealTimeDataManager | null = null

  /** 数据流处理器 */
  private _dataStreamProcessor: DataStreamProcessor | null = null

  /** 是否已销毁 */
  private _disposed = false

  /** 防抖的 resize 函数 */
  private _debouncedResize: (() => void) | null = null

  /**
   * 构造函数
   * @param container - 图表容器元素
   * @param config - 图表配置
   */
  constructor(container: HTMLElement | string, config: ChartConfig) {
    console.log('创建 Chart 实例，配置:', config)

    // 验证和获取容器元素
    this._container = this._resolveContainer(container)
    console.log('容器元素:', this._container)

    // 验证配置
    if (!validateConfig(config)) {
      console.error('配置验证失败:', config)
      throw new Error(ERROR_MESSAGES.INVALID_CONFIG)
    }

    console.log('配置验证通过')

    // 合并默认配置
    this._config = mergeWithDefaults(config, config.type)
    console.log('合并后的配置:', this._config)

    // 初始化管理器
    this._dataAdapter = ChartFactory.getAdapter(this._config.type)
    this._configBuilder = new ConfigBuilder()
    this._themeManager = new ThemeManager()
    this._eventManager = new EventManager()
    this._exportManager = new ExportManager()

    console.log('管理器初始化完成')

    // 初始化性能和内存管理器
    this._initPerformanceManager()
    this._initMemoryManager()

    console.log('性能和内存管理器初始化完成')

    // 初始化图表
    console.log('开始初始化图表...')
    this._init()
  }

  // ============================================================================
  // 公共属性
  // ============================================================================

  /**
   * 获取 ECharts 实例
   */
  get echarts(): ECharts {
    if (!this._echarts) {
      throw new Error(ERROR_MESSAGES.CHART_DISPOSED)
    }
    return this._echarts
  }

  /**
   * 获取 ECharts 实例（别名方法）
   */
  getEChartsInstance(): ECharts {
    return this.echarts
  }

  /**
   * 获取图表配置
   */
  get config(): ChartConfig {
    return { ...this._config }
  }

  /**
   * 获取图表容器
   */
  get container(): HTMLElement {
    return this._container
  }

  // ============================================================================
  // 公共方法
  // ============================================================================

  /**
   * 更新图表数据
   * @param data - 新的图表数据
   */
  updateData(data: ChartData): void {
    this._checkDisposed()

    this._config.data = data
    this._render()
  }

  /**
   * 设置图表标题
   * @param title - 新的标题
   */
  setTitle(title: string): void {
    this._checkDisposed()

    this._config.title = title
    this._render()
  }

  /**
   * 更新图表配置
   * @param config - 部分配置更新
   */
  updateConfig(config: Partial<ChartConfig>): void {
    this._checkDisposed()

    this._config = { ...this._config, ...config }
    this._render()
  }

  /**
   * 设置主题
   * @param theme - 主题名称或主题配置
   */
  setTheme(theme: string | ThemeConfig): void {
    this._checkDisposed()

    this._config.theme = theme

    if (typeof theme === 'string') {
      this._themeManager.setCurrentTheme(theme)
    } else {
      this._themeManager.registerTheme(theme)
      this._themeManager.setCurrentTheme(theme.name)
    }

    this._render()
  }

  /**
   * 调整图表大小
   * @param size - 新的尺寸配置
   */
  resize(size?: ChartSize): void {
    this._checkDisposed()

    if (size) {
      this._config.size = { ...this._config.size, ...size }
      this._updateContainerSize()
    }

    if (!this._echarts) {
      console.warn('ECharts 实例未初始化，无法调整大小')
      return
    }

    try {
      // 确保容器有有效尺寸
      this._ensureContainerSize()

      // 获取当前容器尺寸
      const containerRect = this._container.getBoundingClientRect()

      // 如果容器有有效尺寸，则调整图表大小
      if (containerRect.width > 0 && containerRect.height > 0) {
        this._echarts.resize({
          width: containerRect.width,
          height: containerRect.height
        })
      } else {
        // 如果容器尺寸无效，使用默认尺寸
        this._echarts.resize()
      }
    } catch (error) {
      console.error('调整图表大小失败:', error)
      // 降级到简单的 resize
      try {
        this._echarts.resize()
      } catch (fallbackError) {
        console.error('降级 resize 也失败:', fallbackError)
      }
    }
  }

  /**
   * 显示加载动画
   * @param text - 加载文本
   */
  showLoading(text = '加载中...'): void {
    this._checkDisposed()

    this._container.classList.add(LOADING_CLASS)
    const currentTheme = this._themeManager.getCurrentTheme()
    this._echarts?.showLoading('default', {
      text,
      color: currentTheme.colors.primary,
      textColor: currentTheme.colors.text,
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0,
    })
  }

  /**
   * 隐藏加载动画
   */
  hideLoading(): void {
    this._checkDisposed()

    this._container.classList.remove(LOADING_CLASS)
    this._echarts?.hideLoading()
  }

  /**
   * 清空图表
   */
  clear(): void {
    this._checkDisposed()

    this._echarts?.clear()
  }

  // ============================================================================
  // 导出功能
  // ============================================================================

  /**
   * 导出图表
   * @param options - 导出选项
   * @returns 导出结果（字符串或 Blob）
   */
  async export(options: ExportOptions): Promise<string | Blob> {
    this._checkDisposed()

    // 设置导出管理器的数据
    if (this._echarts) {
      this._exportManager.setECharts(this._echarts)
    }
    this._exportManager.setChartData(this._config.data, this._config.title)

    return this._exportManager.export(options)
  }

  /**
   * 导出为图片
   * @param format - 图片格式 ('png' | 'svg')
   * @param filename - 文件名（可选）
   * @param options - 导出选项（可选）
   */
  async exportImage(
    format: 'png' | 'svg' = 'png',
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<string> {
    const result = await this.export({
      format,
      filename: filename || `chart-${Date.now()}`,
      ...options
    })

    if (typeof result === 'string') {
      return result
    } else {
      throw new Error('图片导出应该返回字符串格式')
    }
  }

  /**
   * 导出为 PDF
   * @param filename - 文件名（可选）
   * @param options - 导出选项（可选）
   */
  async exportPDF(
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<Blob> {
    const result = await this.export({
      format: 'pdf',
      filename: filename || `chart-${Date.now()}`,
      ...options
    })

    if (result instanceof Blob) {
      return result
    } else {
      throw new Error('PDF 导出应该返回 Blob 格式')
    }
  }

  /**
   * 导出数据为 CSV
   * @param filename - 文件名（可选）
   * @param options - 导出选项（可选）
   */
  async exportCSV(
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<string> {
    const result = await this.export({
      format: 'csv',
      filename: filename || `chart-data-${Date.now()}`,
      ...options
    })

    if (typeof result === 'string') {
      return result
    } else {
      throw new Error('CSV 导出应该返回字符串格式')
    }
  }

  /**
   * 导出数据为 Excel
   * @param filename - 文件名（可选）
   * @param options - 导出选项（可选）
   */
  async exportExcel(
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<Blob> {
    const result = await this.export({
      format: 'excel',
      filename: filename || `chart-data-${Date.now()}`,
      ...options
    })

    if (result instanceof Blob) {
      return result
    } else {
      throw new Error('Excel 导出应该返回 Blob 格式')
    }
  }

  /**
   * 下载导出的文件
   * @param format - 导出格式
   * @param filename - 文件名（可选）
   * @param options - 导出选项（可选）
   */
  async downloadExport(
    format: ExportFormat,
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const finalFilename = filename || `chart-${Date.now()}`
    const result = await this.export({
      format,
      filename: finalFilename,
      ...options
    })

    ExportManager.downloadFile(result, finalFilename, format)
  }

  /**
   * 销毁图表
   */
  dispose(): void {
    if (this._disposed) return

    // 销毁响应式管理器
    this._responsiveManager?.dispose()
    this._responsiveManager = null

    // 销毁交互管理器
    this._interactionManager?.dispose()
    this._interactionManager = null

    // 销毁生命周期管理器
    this._lifecycleManager?.dispose()
    this._lifecycleManager = null

    // 销毁动画管理器
    this._animationManager?.dispose()
    this._animationManager = null

    // 销毁性能管理器
    this._performanceManager?.dispose()
    this._performanceManager = null

    // 销毁内存管理器
    this._memoryManager?.dispose()
    this._memoryManager = null

    // 清理事件管理器
    this._eventManager.dispose()

    // 销毁 ECharts 实例
    if (this._echarts) {
      this._echarts.dispose()
      this._echarts = null
    }

    // 清理容器类名
    this._container.classList.remove(
      CHART_CONTAINER_CLASS,
      LOADING_CLASS,
      RESPONSIVE_CLASS
    )

    // 清理防抖函数
    this._debouncedResize = null

    // 标记为已销毁
    this._disposed = true
  }

  /**
   * 注册事件监听器
   * @param eventType - 事件类型
   * @param handler - 事件处理函数
   */
  on(eventType: ChartEventType, handler: EventHandler): void {
    this._checkDisposed()
    this._eventManager.on(eventType, handler)
  }

  /**
   * 注销事件监听器
   * @param eventType - 事件类型
   * @param handler - 事件处理函数（可选）
   */
  off(eventType: ChartEventType, handler?: EventHandler): void {
    this._checkDisposed()
    this._eventManager.off(eventType, handler)
  }

  // ============================================================================
  // 交互功能
  // ============================================================================

  /**
   * 启用交互功能
   * @param config - 交互配置
   */
  enableInteractions(config: InteractionConfig): void {
    this._checkDisposed()

    if (!this._interactionManager) {
      this._interactionManager = new InteractionManager()
    }

    if (this._echarts && this._config) {
      this._interactionManager.initialize(this._echarts, this._config, config)
    }
  }

  /**
   * 启用缩放功能
   * @param config - 缩放配置
   */
  enableZoom(config?: InteractionConfig['zoomConfig']): void {
    this._checkDisposed()

    if (!this._interactionManager) {
      this._interactionManager = new InteractionManager()
      if (this._echarts && this._config) {
        this._interactionManager.initialize(this._echarts, this._config)
      }
    }

    this._interactionManager?.enableZoom(config)
  }

  /**
   * 启用刷选功能
   * @param config - 刷选配置
   */
  enableBrush(config?: InteractionConfig['brushConfig']): void {
    this._checkDisposed()

    if (!this._interactionManager) {
      this._interactionManager = new InteractionManager()
      if (this._echarts && this._config) {
        this._interactionManager.initialize(this._echarts, this._config)
      }
    }

    this._interactionManager?.enableBrush(config)
  }

  /**
   * 启用数据筛选
   */
  enableDataFilter(): void {
    this._checkDisposed()

    if (!this._interactionManager) {
      this._interactionManager = new InteractionManager()
      if (this._echarts && this._config) {
        this._interactionManager.initialize(this._echarts, this._config)
      }
    }

    this._interactionManager?.enableDataFilter()
  }

  /**
   * 筛选数据
   * @param filterFn - 筛选函数
   */
  filterData(filterFn: (dataItem: any, index: number) => boolean): void {
    this._checkDisposed()
    this._interactionManager?.filterData(filterFn)
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this._checkDisposed()
    this._interactionManager?.clearSelection()
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    this._checkDisposed()
    this._interactionManager?.resetZoom()
  }

  /**
   * 注册交互事件监听器
   * @param event - 事件名称
   * @param callback - 回调函数
   */
  onInteraction(event: string, callback: Function): void {
    this._checkDisposed()

    if (!this._interactionManager) {
      this._interactionManager = new InteractionManager()
      if (this._echarts && this._config) {
        this._interactionManager.initialize(this._echarts, this._config)
      }
    }

    this._interactionManager.on(event, callback)
  }

  /**
   * 注销交互事件监听器
   * @param event - 事件名称
   * @param callback - 回调函数
   */
  offInteraction(event: string, callback?: Function): void {
    this._checkDisposed()
    this._interactionManager?.off(event, callback)
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 解析容器元素
   * @param container - 容器元素或选择器
   * @returns 容器元素
   */
  private _resolveContainer(container: HTMLElement | string): HTMLElement {
    let element: HTMLElement | null = null

    if (typeof container === 'string') {
      element = document.querySelector(container)
    } else {
      element = container
    }

    if (!validateContainer(element)) {
      throw new Error(ERROR_MESSAGES.INVALID_CONTAINER)
    }

    return element
  }

  /**
   * 初始化图表
   */
  private _init(): void {
    // 设置容器样式
    this._setupContainer()

    // 延迟初始化以确保容器尺寸正确
    this._delayedInit()
  }

  /**
   * 延迟初始化图表
   * 确保容器已经有正确的尺寸后再初始化 ECharts
   */
  private _delayedInit(): void {
    console.log('开始延迟初始化...')

    // 在测试环境或服务端渲染环境中直接初始化，不使用 requestAnimationFrame
    // 使用安全的环境检测，避免在浏览器中访问 process 对象
    const isTestEnv = typeof window === 'undefined' ||
      (typeof import.meta !== 'undefined' && import.meta.env?.NODE_ENV === 'test') ||
      (typeof globalThis !== 'undefined' && globalThis.__VITEST__)

    console.log('是否为测试环境:', isTestEnv)

    if (isTestEnv) {
      console.log('测试环境，直接初始化')
      this._initEChartsAndRender()
      return
    }

    console.log('浏览器环境，使用 requestAnimationFrame')
    // 使用 requestAnimationFrame 确保 DOM 渲染完成
    requestAnimationFrame(() => {
      console.log('requestAnimationFrame 回调执行')
      // 检查容器是否有有效尺寸
      const hasValidSize = this._hasValidContainerSize()
      console.log('容器是否有有效尺寸:', hasValidSize)

      if (hasValidSize) {
        console.log('容器尺寸有效，直接初始化 ECharts')
        this._initEChartsAndRender()
      } else {
        console.log('容器尺寸无效，等待有效尺寸')
        // 如果容器尺寸无效，使用 ResizeObserver 或定时器等待
        this._waitForValidSize()
      }
    })
  }

  /**
   * 检查容器是否有有效尺寸
   */
  private _hasValidContainerSize(): boolean {
    const rect = this._container.getBoundingClientRect()
    const hasSize = rect.width > 0 && rect.height > 0

    console.log('检查容器尺寸:')
    console.log('  getBoundingClientRect:', rect.width, 'x', rect.height)
    console.log('  offsetWidth/Height:', this._container.offsetWidth, 'x', this._container.offsetHeight)
    console.log('  clientWidth/Height:', this._container.clientWidth, 'x', this._container.clientHeight)

    // 如果没有尺寸，检查是否有 CSS 样式设置的尺寸
    if (!hasSize && typeof window !== 'undefined') {
      try {
        const computedStyle = window.getComputedStyle(this._container)
        const cssWidth = parseFloat(computedStyle.width)
        const cssHeight = parseFloat(computedStyle.height)
        console.log('  CSS 样式尺寸:', cssWidth, 'x', cssHeight)
        return cssWidth > 0 && cssHeight > 0
      } catch (error) {
        // 在测试环境中可能无法访问 getComputedStyle
        console.log('  无法获取 CSS 样式:', error)
        return false
      }
    }

    console.log('  最终结果:', hasSize)
    return hasSize
  }

  /**
   * 等待容器获得有效尺寸
   */
  private _waitForValidSize(): void {
    // 在测试环境中直接强制初始化
    // 使用安全的环境检测，避免在浏览器中访问 process 对象
    const isTestEnv = typeof window === 'undefined' ||
      (typeof import.meta !== 'undefined' && import.meta.env?.NODE_ENV === 'test') ||
      (typeof globalThis !== 'undefined' && globalThis.__VITEST__)
    if (isTestEnv) {
      this._forceInitWithDefaultSize()
      return
    }

    let attempts = 0
    const maxAttempts = 50 // 最多等待 5 秒（50 * 100ms）

    const checkSize = () => {
      attempts++

      if (this._hasValidContainerSize()) {
        this._initEChartsAndRender()
      } else if (attempts < maxAttempts) {
        setTimeout(checkSize, 100)
      } else {
        // 超时后强制初始化，使用默认尺寸
        console.warn('图表容器尺寸检测超时，使用默认尺寸初始化')
        this._forceInitWithDefaultSize()
      }
    }

    // 如果支持 ResizeObserver，优先使用
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            observer.disconnect()
            this._initEChartsAndRender()
            return
          }
        }
      })

      observer.observe(this._container)

      // 设置超时保护
      setTimeout(() => {
        observer.disconnect()
        if (!this._echarts) {
          this._forceInitWithDefaultSize()
        }
      }, 5000)
    } else {
      // 降级到定时器检查
      checkSize()
    }
  }

  /**
   * 强制使用默认尺寸初始化
   */
  private _forceInitWithDefaultSize(): void {
    // 设置默认尺寸
    if (!this._container.style.width) {
      this._container.style.width = '100%'
    }
    if (!this._container.style.height) {
      this._container.style.height = '400px'
    }

    this._initEChartsAndRender()
  }

  /**
   * 初始化 ECharts 并渲染
   */
  private _initEChartsAndRender(): void {
    // 初始化 ECharts 实例
    this._initECharts()

    // 设置主题
    if (this._config.theme) {
      if (typeof this._config.theme === 'string') {
        this._themeManager.setCurrentTheme(this._config.theme)
      } else {
        this._themeManager.registerTheme(this._config.theme)
        this._themeManager.setCurrentTheme(this._config.theme.name)
      }
    }

    // 初始化响应式管理器
    if (this._config.responsive) {
      this._initResponsive()
    }

    // 初始化导出管理器
    if (this._echarts) {
      this._exportManager.setECharts(this._echarts)
      this._exportManager.setChartData(this._config.data, this._config.title)
    }

    // 渲染图表
    this._render()
  }

  /**
   * 设置容器样式
   */
  private _setupContainer(): void {
    this._container.classList.add(CHART_CONTAINER_CLASS)

    if (this._config.responsive) {
      this._container.classList.add(RESPONSIVE_CLASS)
    }

    this._updateContainerSize()
  }

  /**
   * 更新容器尺寸
   */
  private _updateContainerSize(): void {
    const { size } = this._config
    if (!size) return

    if (size.width !== undefined) {
      this._container.style.width = typeof size.width === 'number'
        ? `${size.width}px`
        : size.width
    }

    if (size.height !== undefined) {
      this._container.style.height = typeof size.height === 'number'
        ? `${size.height}px`
        : size.height
    }
  }

  /**
   * 初始化 ECharts 实例
   */
  private _initECharts(): void {
    try {
      console.log('开始初始化 ECharts 实例...')

      // 确保容器有有效尺寸
      this._ensureContainerSize()

      const rect = this._container.getBoundingClientRect()
      console.log('容器尺寸:', rect.width, 'x', rect.height)

      // 获取主题配置
      const themeConfig = typeof this._config.theme === 'string'
        ? this._themeManager.getEChartsTheme(this._config.theme)
        : undefined

      console.log('主题配置:', themeConfig)

      // 初始化 ECharts 实例
      console.log('调用 echarts.init...')
      this._echarts = echarts.init(this._container, themeConfig, {
        width: this._container.offsetWidth || undefined,
        height: this._container.offsetHeight || undefined,
        renderer: 'canvas', // 明确指定渲染器
        useDirtyRect: true, // 启用脏矩形优化
      })

      console.log('ECharts 实例创建成功:', !!this._echarts)

      // 绑定事件管理器
      this._eventManager.setECharts(this._echarts)

      // 添加错误处理
      this._echarts.on('error', (error) => {
        console.error('ECharts 渲染错误:', error)
      })

    } catch (error) {
      console.error('ECharts 初始化失败:', error)
      console.error('错误详情:', error.message, error.stack)
      throw new Error(ERROR_MESSAGES.ECHARTS_NOT_FOUND)
    }
  }

  /**
   * 确保容器有有效尺寸
   */
  private _ensureContainerSize(): void {
    const rect = this._container.getBoundingClientRect()

    // 如果容器没有尺寸，尝试设置默认尺寸
    if (rect.width === 0 || rect.height === 0) {
      // 在测试环境中直接设置默认尺寸
      // 使用安全的环境检测，避免在浏览器中访问 process 对象
      const isTestEnv = typeof window === 'undefined' ||
        (typeof import.meta !== 'undefined' && import.meta.env?.NODE_ENV === 'test') ||
        (typeof globalThis !== 'undefined' && globalThis.__VITEST__)
      if (isTestEnv) {
        this._container.style.width = this._config.size?.width
          ? (typeof this._config.size.width === 'number'
            ? `${this._config.size.width}px`
            : this._config.size.width)
          : '400px'
        this._container.style.height = this._config.size?.height
          ? (typeof this._config.size.height === 'number'
            ? `${this._config.size.height}px`
            : this._config.size.height)
          : '300px'
        return
      }

      try {
        const computedStyle = window.getComputedStyle(this._container)

        // 检查是否有 CSS 设置的尺寸
        if (computedStyle.width === '0px' || computedStyle.width === 'auto') {
          this._container.style.width = this._config.size?.width
            ? (typeof this._config.size.width === 'number'
              ? `${this._config.size.width}px`
              : this._config.size.width)
            : '100%'
        }

        if (computedStyle.height === '0px' || computedStyle.height === 'auto') {
          this._container.style.height = this._config.size?.height
            ? (typeof this._config.size.height === 'number'
              ? `${this._config.size.height}px`
              : this._config.size.height)
            : '400px'
        }
      } catch (error) {
        // 如果无法访问 getComputedStyle，设置默认尺寸
        this._container.style.width = '400px'
        this._container.style.height = '300px'
      }
    }
  }

  /**
   * 初始化响应式管理器
   */
  private _initResponsive(): void {
    this._debouncedResize = debounce(() => {
      this.resize()
    }, RESIZE_DEBOUNCE_DELAY)

    this._responsiveManager = new ResponsiveManager()
    if (this._echarts) {
      this._responsiveManager.initialize(this._container, this._echarts, this._config)
    }
  }

  /**
   * 渲染图表
   */
  private _render(): void {
    if (!this._echarts) {
      console.warn('ECharts 实例未初始化，无法渲染图表')
      return
    }

    try {
      // 检查容器是否仍然有效
      if (!this._container.isConnected) {
        console.warn('图表容器已从 DOM 中移除，停止渲染')
        return
      }

      // 转换数据
      const adaptedData = this._dataAdapter.adapt(this._config.data, this._config.type)

      // 构建配置
      const option = this._configBuilder.build(this._config, adaptedData)

      // 设置图表选项
      this._echarts.setOption(option, true)

      // 确保图表正确渲染
      this._ensureChartRendered()

    } catch (error) {
      console.error('图表渲染失败:', error)
      this._handleRenderError(error)
    }
  }

  /**
   * 确保图表正确渲染
   */
  private _ensureChartRendered(): void {
    if (!this._echarts) return

    // 在测试环境中跳过渲染后检查
    // 使用安全的环境检测，避免在浏览器中访问 process 对象
    const isTestEnv = typeof window === 'undefined' ||
      (typeof import.meta !== 'undefined' && import.meta.env?.NODE_ENV === 'test') ||
      (typeof globalThis !== 'undefined' && globalThis.__VITEST__)

    if (isTestEnv) {
      return
    }

    // 使用 requestAnimationFrame 确保渲染完成后再检查
    requestAnimationFrame(() => {
      try {
        // 检查 ECharts 实例是否存在
        if (!this._echarts || this._disposed) {
          return
        }

        // 检查图表是否需要 resize
        const containerRect = this._container.getBoundingClientRect()
        const echartsSize = this._echarts.getWidth && this._echarts.getHeight
          ? { width: this._echarts.getWidth(), height: this._echarts.getHeight() }
          : null

        if (echartsSize &&
          (Math.abs(containerRect.width - echartsSize.width) > 1 ||
            Math.abs(containerRect.height - echartsSize.height) > 1)) {
          this._echarts.resize()
        }
      } catch (error) {
        console.warn('图表渲染后检查失败:', error)
      }
    })
  }

  /**
   * 处理渲染错误
   */
  private _handleRenderError(error: any): void {
    // 如果是尺寸相关的错误，尝试重新调整尺寸后重试
    if (error.message && error.message.includes('width') || error.message.includes('height')) {
      console.log('检测到尺寸相关错误，尝试重新调整尺寸...')

      setTimeout(() => {
        try {
          this._ensureContainerSize()
          if (this._echarts) {
            this._echarts.resize()
          }
        } catch (retryError) {
          console.error('重试渲染失败:', retryError)
        }
      }, 100)
    } else {
      // 其他错误直接抛出
      throw error
    }
  }

  /**
   * 检查图表是否已销毁
   */
  private _checkDisposed(): void {
    if (this._disposed) {
      throw new Error(ERROR_MESSAGES.CHART_DISPOSED)
    }
  }

  /**
   * 初始化性能管理器
   */
  private _initPerformanceManager(): void {
    const performanceConfig: PerformanceConfig = {
      enableMonitoring: this._config.performance?.enableMonitoring ?? true,
      largeDataThreshold: this._config.performance?.largeDataThreshold ?? 10000,
      enableDataSampling: this._config.performance?.enableDataSampling ?? false,
      enableVirtualScrolling: this._config.performance?.enableVirtualScrolling ?? false,
      enableProgressiveRendering: this._config.performance?.enableProgressiveRendering ?? false
    }

    this._performanceManager = new PerformanceManager(performanceConfig)

    // 监听性能事件
    this._performanceManager.on('memoryWarning', (info: any) => {
      console.warn('图表内存使用警告:', info)
      this._eventManager.emit('memoryWarning', info)
    })

    this._performanceManager.on('renderComplete', (metrics: any) => {
      this._eventManager.emit('renderComplete', metrics)
    })
  }

  /**
   * 初始化内存管理器
   */
  private _initMemoryManager(): void {
    const memoryConfig: MemoryConfig = {
      maxCacheSize: this._config.memory?.maxCacheSize ?? 50,
      memoryWarningThreshold: this._config.memory?.memoryWarningThreshold ?? 100,
      enableAutoCleanup: this._config.memory?.enableAutoCleanup ?? true,
      enableMemoryMonitoring: this._config.memory?.enableMemoryMonitoring ?? true
    }

    this._memoryManager = new MemoryManager(memoryConfig)

    // 监听内存事件
    this._memoryManager.on('memoryWarning', (info: any) => {
      console.warn('内存使用警告:', info)
      this._eventManager.emit('memoryWarning', info)
    })

    this._memoryManager.on('cleanupPerformed', (info: any) => {
      console.log('内存清理完成:', info)
      this._eventManager.emit('memoryCleanup', info)
    })
  }

  /**
   * 初始化生命周期管理器
   */
  private _initLifecycleManager(): void {
    if (!this._lifecycleManager) {
      this._lifecycleManager = new LifecycleManager()

      // 监听生命周期事件
      this._lifecycleManager.on('stateChanged', (state: any) => {
        this._eventManager.emit('lifecycleStateChanged', state)
      })
    }
  }

  /**
   * 初始化动画管理器
   */
  private _initAnimationManager(): void {
    if (!this._animationManager) {
      this._animationManager = new AnimationManager()

      // 监听动画事件
      this._animationManager.on('animationComplete', (info: any) => {
        this._eventManager.emit('animationComplete', info)
      })
    }
  }

  /**
   * 初始化实时数据管理器
   */
  private _initRealTimeDataManager(): void {
    if (!this._realTimeDataManager) {
      const realTimeConfig: RealTimeConfig = {
        enabled: this._config.realTime?.enabled ?? false,
        updateInterval: this._config.realTime?.updateInterval ?? 1000,
        maxDataPoints: this._config.realTime?.maxDataPoints ?? 10000,
        enableAggregation: this._config.realTime?.enableAggregation ?? false,
        aggregationWindow: this._config.realTime?.aggregationWindow ?? 60000,
        enableVirtualScrolling: this._config.realTime?.enableVirtualScrolling ?? false,
        bufferSize: this._config.realTime?.bufferSize ?? 1000
      }

      this._realTimeDataManager = new RealTimeDataManager(realTimeConfig)

      // 监听实时数据事件
      this._realTimeDataManager.on('dataProcessed', (data: any) => {
        this.updateData(data)
        this._eventManager.emit('realTimeDataUpdated', data)
      })

      this._realTimeDataManager.on('connected', () => {
        this._eventManager.emit('realTimeConnected')
      })

      this._realTimeDataManager.on('disconnected', () => {
        this._eventManager.emit('realTimeDisconnected')
      })

      this._realTimeDataManager.on('error', (error: Error) => {
        this._eventManager.emit('realTimeError', error)
      })
    }
  }

  /**
   * 初始化数据流处理器
   */
  private _initDataStreamProcessor(): void {
    if (!this._dataStreamProcessor) {
      const streamConfig: DataStreamConfig = {
        batchSize: this._config.dataStream?.batchSize ?? 100,
        processInterval: this._config.dataStream?.processInterval ?? 100,
        enableValidation: this._config.dataStream?.enableValidation ?? true,
        enableTransformation: this._config.dataStream?.enableTransformation ?? true,
        maxQueueSize: this._config.dataStream?.maxQueueSize ?? 10000
      }

      this._dataStreamProcessor = new DataStreamProcessor(streamConfig)

      // 监听数据流事件
      this._dataStreamProcessor.on('batchProcessed', (data: any) => {
        if (this._realTimeDataManager) {
          this._realTimeDataManager.addDataPoints(data)
        }
        this._eventManager.emit('dataStreamProcessed', data)
      })

      this._dataStreamProcessor.on('processingError', (error: Error) => {
        this._eventManager.emit('dataStreamError', error)
      })
    }
  }

  /**
   * 获取性能管理器
   */
  getPerformanceManager(): PerformanceManager | null {
    return this._performanceManager
  }

  /**
   * 获取内存管理器
   */
  getMemoryManager(): MemoryManager | null {
    return this._memoryManager
  }

  /**
   * 获取生命周期管理器
   */
  getLifecycleManager(): LifecycleManager | null {
    return this._lifecycleManager
  }

  /**
   * 获取动画管理器
   */
  getAnimationManager(): AnimationManager | null {
    return this._animationManager
  }

  /**
   * 获取实时数据管理器
   */
  getRealTimeDataManager(): RealTimeDataManager | null {
    return this._realTimeDataManager
  }

  /**
   * 获取数据流处理器
   */
  getDataStreamProcessor(): DataStreamProcessor | null {
    return this._dataStreamProcessor
  }

  /**
   * 启用实时数据功能
   * @param config - 实时数据配置
   */
  enableRealTimeData(config?: RealTimeConfig): void {
    this._initRealTimeDataManager()
    if (config && this._realTimeDataManager) {
      this._realTimeDataManager.updateConfig(config)
    }
    this._realTimeDataManager?.start()
  }

  /**
   * 禁用实时数据功能
   */
  disableRealTimeData(): void {
    this._realTimeDataManager?.stop()
  }

  /**
   * 连接 WebSocket 数据源
   * @param config - WebSocket 配置
   */
  connectWebSocket(config: WebSocketConfig): void {
    this._initRealTimeDataManager()
    this._realTimeDataManager?.connectWebSocket(config)
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnectWebSocket(): void {
    this._realTimeDataManager?.disconnectWebSocket()
  }

  /**
   * 启用数据流处理
   * @param config - 数据流配置
   */
  enableDataStream(config?: DataStreamConfig): void {
    this._initDataStreamProcessor()
    if (config && this._dataStreamProcessor) {
      // 更新配置逻辑可以在 DataStreamProcessor 中实现
    }
    this._dataStreamProcessor?.start()
  }

  /**
   * 禁用数据流处理
   */
  disableDataStream(): void {
    this._dataStreamProcessor?.stop()
  }
}
