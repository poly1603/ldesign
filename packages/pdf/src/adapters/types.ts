/**
 * 框架适配器类型定义
 * 定义跨框架PDF预览组件的统一接口
 */

import type { PdfSource, RenderOptions, PdfDocument, PdfPage, ErrorHandler } from '../types'

/**
 * 框架类型枚举
 */
export enum FrameworkType {
  VUE = 'vue',
  REACT = 'react',
  VANILLA = 'vanilla',
  ANGULAR = 'angular',
  SVELTE = 'svelte'
}

/**
 * 组件属性接口
 */
export interface ComponentProps {
  /** PDF源 */
  source: PdfSource
  /** 当前页码 */
  page?: number
  /** 缩放比例 */
  scale?: number
  /** 渲染选项 */
  renderOptions?: RenderOptions
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示缩略图 */
  showThumbnails?: boolean
  /** 容器样式类名 */
  className?: string
  /** 内联样式 */
  style?: Record<string, string | number>
  /** 是否禁用 */
  disabled?: boolean
  /** 加载状态 */
  loading?: boolean
}

/**
 * 事件处理器接口
 */
export interface EventHandlers {
  /** 文档加载完成 */
  onDocumentLoad?: (document: PdfDocument) => void
  /** 页面渲染完成 */
  onPageRender?: (page: PdfPage) => void
  /** 页面变化 */
  onPageChange?: (pageNumber: number) => void
  /** 缩放变化 */
  onScaleChange?: (scale: number) => void
  /** 错误处理 */
  onError?: (error: Error) => void
  /** 加载状态变化 */
  onLoadingChange?: (loading: boolean) => void
  /** 点击事件 */
  onClick?: (event: MouseEvent) => void
  /** 双击事件 */
  onDoubleClick?: (event: MouseEvent) => void
}

/**
 * 生命周期钩子接口
 */
export interface LifecycleHooks {
  /** 组件挂载前 */
  beforeMount?: () => void
  /** 组件挂载后 */
  mounted?: () => void
  /** 组件更新前 */
  beforeUpdate?: () => void
  /** 组件更新后 */
  updated?: () => void
  /** 组件卸载前 */
  beforeUnmount?: () => void
  /** 组件卸载后 */
  unmounted?: () => void
}

/**
 * 渲染上下文接口
 */
export interface RenderContext {
  /** 容器元素 */
  container: HTMLElement
  /** 画布元素 */
  canvas?: HTMLCanvasElement
  /** 渲染上下文 */
  context?: CanvasRenderingContext2D
  /** 当前文档 */
  document?: PdfDocument
  /** 当前页面 */
  currentPage?: PdfPage
  /** 是否已初始化 */
  initialized: boolean
}

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  /** 框架类型 */
  framework: FrameworkType
  /** 组件名称 */
  componentName?: string
  /** 默认属性 */
  defaultProps?: Partial<ComponentProps>
  /** 错误处理器 */
  errorHandler?: ErrorHandler
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义渲染器 */
  customRenderer?: (context: RenderContext) => void
}

/**
 * 框架适配器基础接口
 */
export interface FrameworkAdapter {
  /** 适配器类型 */
  readonly type: FrameworkType
  /** 适配器配置 */
  readonly config: AdapterConfig
  
  /**
   * 初始化适配器
   * @param config 配置选项
   */
  initialize(config: AdapterConfig): Promise<void>
  
  /**
   * 创建组件实例
   * @param props 组件属性
   * @param handlers 事件处理器
   * @param hooks 生命周期钩子
   */
  createComponent(
    props: ComponentProps,
    handlers?: EventHandlers,
    hooks?: LifecycleHooks
  ): unknown
  
  /**
   * 挂载组件到容器
   * @param component 组件实例
   * @param container 容器元素
   */
  mount(component: unknown, container: HTMLElement): Promise<void>
  
  /**
   * 更新组件属性
   * @param component 组件实例
   * @param props 新的属性
   */
  updateProps(component: unknown, props: Partial<ComponentProps>): void
  
  /**
   * 卸载组件
   * @param component 组件实例
   */
  unmount(component: unknown): void
  
  /**
   * 销毁适配器
   */
  destroy(): void
  
  /**
   * 获取渲染上下文
   * @param component 组件实例
   */
  getRenderContext(component: unknown): RenderContext | null
}

/**
 * 适配器工厂接口
 */
export interface AdapterFactory {
  /**
   * 创建适配器实例
   * @param type 框架类型
   * @param config 配置选项
   */
  createAdapter(type: FrameworkType, config?: Partial<AdapterConfig>): FrameworkAdapter
  
  /**
   * 注册自定义适配器
   * @param type 框架类型
   * @param adapter 适配器类
   */
  registerAdapter(type: FrameworkType, adapter: new (config: AdapterConfig) => FrameworkAdapter): void
  
  /**
   * 获取支持的框架类型列表
   */
  getSupportedFrameworks(): FrameworkType[]
  
  /**
   * 检查框架是否支持
   * @param type 框架类型
   */
  isSupported(type: FrameworkType): boolean
}

/**
 * 组件状态接口
 */
export interface ComponentState {
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 缩放比例 */
  scale: number
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 文档信息 */
  document: PdfDocument | null
}

/**
 * 组件方法接口
 */
export interface ComponentMethods {
  /** 跳转到指定页面 */
  goToPage(page: number): Promise<void>
  /** 上一页 */
  previousPage(): Promise<void>
  /** 下一页 */
  nextPage(): Promise<void>
  /** 设置缩放比例 */
  setScale(scale: number): Promise<void>
  /** 放大 */
  zoomIn(): Promise<void>
  /** 缩小 */
  zoomOut(): Promise<void>
  /** 适应宽度 */
  fitWidth(): Promise<void>
  /** 适应页面 */
  fitPage(): Promise<void>
  /** 刷新渲染 */
  refresh(): Promise<void>
}