/**
 * @file UI管理器
 * @description 管理所有UI组件的主控制器
 */

import { BaseComponent, type BaseComponentOptions } from './base-component'
import { Toolbar, ToolbarPosition, ToolType, type ToolbarOptions } from './toolbar'
import { ControlPointsRenderer, type ControlPointsRendererOptions } from './control-points-renderer'
import { PreviewPanel, type PreviewPanelOptions, type PreviewData } from './preview-panel'
import { StatusIndicator, StatusType, type StatusIndicatorOptions } from './status-indicator'
import type { CropArea, CropperEventType } from '@/types'

/**
 * UI管理器配置
 */
export interface UIManagerOptions extends BaseComponentOptions {
  /** 工具栏配置 */
  toolbar: Partial<ToolbarOptions> & { enabled: boolean }
  /** 控制点配置 */
  controlPoints: Partial<ControlPointsRendererOptions> & { enabled: boolean }
  /** 预览面板配置 */
  preview: Partial<PreviewPanelOptions> & { enabled: boolean }
  /** 状态指示器配置 */
  status: Partial<StatusIndicatorOptions> & { enabled: boolean }
  /** 主题 */
  theme: 'light' | 'dark' | 'auto'
  /** 响应式断点 */
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}

/**
 * UI事件类型
 */
export enum UIEventType {
  TOOL_CLICK = 'tool-click',
  CONTROL_POINT_CLICK = 'control-point-click',
  PREVIEW_UPDATE = 'preview-update',
  STATUS_CHANGE = 'status-change',
  THEME_CHANGE = 'theme-change',
  RESIZE = 'resize',
}

/**
 * UI管理器类
 */
export class UIManager extends BaseComponent {
  /** UI配置 */
  private uiOptions: UIManagerOptions

  /** 工具栏组件 */
  private toolbar: Toolbar | null = null

  /** 控制点渲染器 */
  private controlPointsRenderer: ControlPointsRenderer | null = null

  /** 预览面板 */
  private previewPanel: PreviewPanel | null = null

  /** 状态指示器 */
  private statusIndicator: StatusIndicator | null = null

  /** 当前屏幕尺寸类型 */
  private currentScreenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'

  /** 窗口大小监听器 */
  private resizeObserver: ResizeObserver | null = null

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: UIManagerOptions = {
    ...BaseComponent.DEFAULT_OPTIONS,
    toolbar: {
      enabled: true,
      position: ToolbarPosition.TOP,
      showTooltips: true,
      buttonSize: 'small',
    },
    controlPoints: {
      enabled: true,
      pointSize: 12,
      showCorners: true,
      showEdges: true,
      showCenter: false,
      showRotate: true,
    },
    preview: {
      enabled: false,
      previewSize: { width: 200, height: 200 },
      showInfo: true,
      realTimeUpdate: true,
    },
    status: {
      enabled: true,
      position: 'top',
      autoHideDelay: 3000,
      closable: true,
    },
    theme: 'auto',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
    },
  }

  /**
   * 构造函数
   * @param container 容器元素
   * @param options UI配置
   */
  constructor(container: HTMLElement, options: Partial<UIManagerOptions> = {}) {
    // 设置UIManager特定的配置
    const mergedOptions = { ...UIManager.DEFAULT_OPTIONS, ...options }

    // 初始化基础组件
    super('div', mergedOptions)
    this.uiOptions = mergedOptions

    // 将UI管理器添加到容器
    container.appendChild(this.element)

    // 设置响应式监听
    this.setupResponsiveListener()

    // 现在可以安全地初始化
    this.initialize()
  }

  /**
   * 获取组件名称
   */
  protected getComponentName(): string {
    return 'ui-manager'
  }

  /**
   * 渲染组件
   */
  protected render(): void {
    this.element.style.position = 'relative'
    this.element.style.width = '100%'
    this.element.style.height = '100%'
    this.element.style.overflow = 'hidden'

    // 应用主题
    this.applyTheme()

    // 初始化UI组件
    this.initializeComponents()
  }

  /**
   * 初始化UI组件
   */
  private initializeComponents(): void {
    // 初始化工具栏
    if (this.uiOptions.toolbar.enabled) {
      this.initializeToolbar()
    }

    // 初始化控制点渲染器
    if (this.uiOptions.controlPoints.enabled) {
      this.initializeControlPoints()
    }

    // 初始化预览面板
    if (this.uiOptions.preview.enabled) {
      this.initializePreview()
    }

    // 初始化状态指示器
    if (this.uiOptions.status.enabled) {
      this.initializeStatus()
    }
  }

  /**
   * 初始化工具栏
   */
  private initializeToolbar(): void {
    this.toolbar = new Toolbar(this.uiOptions.toolbar)
    this.element.appendChild(this.toolbar.getElement())

    // 监听工具点击事件
    this.toolbar.on('tool-click' as CropperEventType, (data) => {
      this.emit(UIEventType.TOOL_CLICK as CropperEventType, data)
    })
  }

  /**
   * 初始化控制点渲染器
   */
  private initializeControlPoints(): void {
    this.controlPointsRenderer = new ControlPointsRenderer(this.uiOptions.controlPoints)
    this.element.appendChild(this.controlPointsRenderer.getElement())

    // 监听控制点事件
    this.controlPointsRenderer.on('point-mousedown' as CropperEventType, (data) => {
      this.emit(UIEventType.CONTROL_POINT_CLICK as CropperEventType, data)
    })
  }

  /**
   * 初始化预览面板
   */
  private initializePreview(): void {
    this.previewPanel = new PreviewPanel(this.uiOptions.preview)

    // 预览面板通常放在侧边或独立容器中
    // 这里先添加到主容器，实际使用时可能需要调整
    this.element.appendChild(this.previewPanel.getElement())
  }

  /**
   * 初始化状态指示器
   */
  private initializeStatus(): void {
    this.statusIndicator = new StatusIndicator(this.uiOptions.status)
    this.element.appendChild(this.statusIndicator.getElement())
    this.statusIndicator.hide() // 默认隐藏
  }

  /**
   * 更新裁剪区域
   * @param cropArea 裁剪区域
   */
  updateCropArea(cropArea: CropArea): void {
    if (this.controlPointsRenderer) {
      this.controlPointsRenderer.updateCropArea(cropArea)
    }
  }

  /**
   * 更新预览
   * @param previewData 预览数据
   */
  updatePreview(previewData: PreviewData): void {
    if (this.previewPanel) {
      this.previewPanel.updatePreview(previewData)
      this.emit(UIEventType.PREVIEW_UPDATE as CropperEventType, previewData)
    }
  }

  /**
   * 显示状态消息
   * @param type 状态类型
   * @param message 消息内容
   * @param duration 显示时长
   */
  showStatus(type: StatusType, message: string, duration?: number): void {
    if (!this.statusIndicator) return

    switch (type) {
      case StatusType.INFO:
        this.statusIndicator.showInfo(message)
        break
      case StatusType.SUCCESS:
        this.statusIndicator.showSuccess(message)
        break
      case StatusType.WARNING:
        this.statusIndicator.showWarning(message)
        break
      case StatusType.ERROR:
        this.statusIndicator.showError(message)
        break
      case StatusType.LOADING:
        this.statusIndicator.showLoading(message)
        break
    }

    if (duration) {
      this.statusIndicator.updateIndicatorOptions({ autoHideDelay: duration })
    }

    this.emit(UIEventType.STATUS_CHANGE as CropperEventType, { type, message })
  }

  /**
   * 隐藏状态指示器
   */
  hideStatus(): void {
    if (this.statusIndicator) {
      this.statusIndicator.hide()
    }
  }

  /**
   * 设置工具启用状态
   * @param toolType 工具类型
   * @param enabled 是否启用
   */
  setToolEnabled(toolType: ToolType, enabled: boolean): void {
    if (this.toolbar) {
      this.toolbar.setToolEnabled(toolType, enabled)
    }
  }

  /**
   * 设置主题
   * @param theme 主题
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.uiOptions.theme = theme
    this.applyTheme()
    this.emit(UIEventType.THEME_CHANGE as CropperEventType, { theme })
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const { theme } = this.uiOptions

    if (theme === 'auto') {
      // 自动检测系统主题
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.element.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        // 测试环境或不支持matchMedia时，默认使用light主题
        this.element.setAttribute('data-theme', 'light')
      }
    } else {
      this.element.setAttribute('data-theme', theme)
    }
  }

  /**
   * 设置响应式监听
   */
  private setupResponsiveListener(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        this.updateScreenSize(width)
      }
    })

    this.resizeObserver.observe(this.element)

    // 监听系统主题变化
    if (this.uiOptions.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        this.applyTheme()
      })
    }
  }

  /**
   * 更新屏幕尺寸类型
   * @param width 宽度
   */
  private updateScreenSize(width: number): void {
    const { breakpoints } = this.uiOptions
    let newSize: 'mobile' | 'tablet' | 'desktop'

    if (width < breakpoints.mobile) {
      newSize = 'mobile'
    } else if (width < breakpoints.tablet) {
      newSize = 'tablet'
    } else {
      newSize = 'desktop'
    }

    if (newSize !== this.currentScreenSize) {
      this.currentScreenSize = newSize
      this.adaptToScreenSize()
      this.emit(UIEventType.RESIZE as CropperEventType, { screenSize: newSize, width })
    }
  }

  /**
   * 适配屏幕尺寸
   */
  private adaptToScreenSize(): void {
    const { currentScreenSize } = this

    // 调整工具栏
    if (this.toolbar) {
      if (currentScreenSize === 'mobile') {
        this.toolbar.setPosition(ToolbarPosition.BOTTOM)
        this.toolbar.setButtonSize('medium')
      } else {
        this.toolbar.setPosition(this.uiOptions.toolbar.position || ToolbarPosition.TOP)
        this.toolbar.setButtonSize(this.uiOptions.toolbar.buttonSize || 'small')
      }
    }

    // 调整控制点
    if (this.controlPointsRenderer) {
      const pointSize = currentScreenSize === 'mobile' ? 16 : 12
      this.controlPointsRenderer.updateRendererOptions({ pointSize })
    }

    // 调整预览面板
    if (this.previewPanel) {
      const previewSize = currentScreenSize === 'mobile'
        ? { width: 150, height: 150 }
        : { width: 200, height: 200 }
      this.previewPanel.setPreviewSize(previewSize)
    }
  }

  /**
   * 获取工具栏
   */
  getToolbar(): Toolbar | null {
    return this.toolbar
  }

  /**
   * 获取控制点渲染器
   */
  getControlPointsRenderer(): ControlPointsRenderer | null {
    return this.controlPointsRenderer
  }

  /**
   * 获取预览面板
   */
  getPreviewPanel(): PreviewPanel | null {
    return this.previewPanel
  }

  /**
   * 获取状态指示器
   */
  getStatusIndicator(): StatusIndicator | null {
    return this.statusIndicator
  }

  /**
   * 获取当前屏幕尺寸类型
   */
  getCurrentScreenSize(): 'mobile' | 'tablet' | 'desktop' {
    return this.currentScreenSize
  }

  /**
   * 更新UI配置
   * @param options 新配置
   */
  updateUIOptions(options: Partial<UIManagerOptions>): void {
    this.uiOptions = { ...this.uiOptions, ...options }

    // 重新初始化组件
    this.destroyComponents()
    this.initializeComponents()
  }

  /**
   * 销毁所有组件
   */
  private destroyComponents(): void {
    if (this.toolbar) {
      this.toolbar.destroy()
      this.toolbar = null
    }

    if (this.controlPointsRenderer) {
      this.controlPointsRenderer.destroy()
      this.controlPointsRenderer = null
    }

    if (this.previewPanel) {
      this.previewPanel.destroy()
      this.previewPanel = null
    }

    if (this.statusIndicator) {
      this.statusIndicator.destroy()
      this.statusIndicator = null
    }
  }

  /**
   * 销毁前回调
   */
  protected beforeDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    this.destroyComponents()
    super.beforeDestroy()
  }
}
