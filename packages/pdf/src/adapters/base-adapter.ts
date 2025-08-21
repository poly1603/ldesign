/**
 * 基础适配器抽象类
 * 提供所有框架适配器的通用实现
 */

import type { ErrorHandler } from '../types'
import type {
  AdapterConfig,
  ComponentMethods,
  ComponentProps,
  ComponentState,
  EventHandlers,
  FrameworkAdapter,
  FrameworkType,
  LifecycleHooks,
  RenderContext,
} from './types'
import { defaultPdfApi } from '../api/pdf-api'
import { createPdfError, ErrorCode } from '../utils/error-handler'
import { createEventEmitter } from '../utils/event-emitter'

/**
 * 基础适配器抽象类
 */
export abstract class BaseAdapter implements FrameworkAdapter {
  protected _config: AdapterConfig
  protected _initialized = false
  protected _components = new WeakMap<unknown, RenderContext>()
  protected _eventEmitter = createEventEmitter()
  protected _errorHandler?: ErrorHandler

  constructor(config: AdapterConfig) {
    this._config = { ...config }
    this._errorHandler = config.errorHandler
  }

  /**
   * 获取适配器类型
   */
  abstract get type(): FrameworkType

  /**
   * 获取适配器配置
   */
  get config(): AdapterConfig {
    return { ...this._config }
  }

  /**
   * 初始化适配器
   */
  async initialize(config: AdapterConfig): Promise<void> {
    try {
      this._config = { ...this._config, ...config }
      this._errorHandler = config.errorHandler || this._errorHandler

      // 执行框架特定的初始化
      await this.doInitialize()

      this._initialized = true
      this._eventEmitter.emit('initialized', this)
    }
    catch (error) {
      const pdfError = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        `Failed to initialize ${this.type} adapter`,
        error,
      )
      this._handleError(pdfError)
      throw pdfError
    }
  }

  /**
   * 创建组件实例
   */
  abstract createComponent(
    props: ComponentProps,
    handlers?: EventHandlers,
    hooks?: LifecycleHooks
  ): unknown

  /**
   * 挂载组件到容器
   */
  abstract mount(component: unknown, container: HTMLElement): Promise<void>

  /**
   * 更新组件属性
   */
  abstract updateProps(component: unknown, props: Partial<ComponentProps>): void

  /**
   * 卸载组件
   */
  abstract unmount(component: unknown): void

  /**
   * 获取渲染上下文
   */
  getRenderContext(component: unknown): RenderContext | null {
    return this._components.get(component) || null
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    try {
      // 清理所有组件
      this._components = new WeakMap()

      // 清理事件监听器
      this._eventEmitter.removeAllListeners()

      // 执行框架特定的清理
      this.doDestroy()

      this._initialized = false
      this._eventEmitter.emit('destroyed', this)
    }
    catch (error) {
      const pdfError = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        `Failed to destroy ${this.type} adapter`,
        error,
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 创建渲染上下文
   */
  protected createRenderContext(container: HTMLElement): RenderContext {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw createPdfError(
        ErrorCode.RENDER_ERROR,
        'Failed to get 2D rendering context',
      )
    }

    container.appendChild(canvas)

    return {
      container,
      canvas,
      context,
      initialized: false,
    }
  }

  /**
   * 创建组件状态
   */
  protected createComponentState(): ComponentState {
    return {
      currentPage: 1,
      totalPages: 0,
      scale: 1.0,
      loading: false,
      error: null,
      document: null,
    }
  }

  /**
   * 创建组件方法
   */
  protected createComponentMethods(
    state: ComponentState,
    context: RenderContext,
    handlers?: EventHandlers,
  ): ComponentMethods {
    return {
      async goToPage(page: number): Promise<void> {
        if (!state.document || page < 1 || page > state.totalPages) {
          throw createPdfError(
            ErrorCode.VALIDATION_ERROR,
            `Invalid page number: ${page}`,
          )
        }

        try {
          state.currentPage = page
          await this.renderCurrentPage(state, context)
          handlers?.onPageChange?.(page)
        }
        catch (error) {
          const pdfError = createPdfError(
            ErrorCode.RENDER_ERROR,
            `Failed to go to page ${page}`,
            error,
          )
          this._handleError(pdfError)
          throw pdfError
        }
      },

      async previousPage(): Promise<void> {
        if (state.currentPage > 1) {
          await this.goToPage(state.currentPage - 1)
        }
      },

      async nextPage(): Promise<void> {
        if (state.currentPage < state.totalPages) {
          await this.goToPage(state.currentPage + 1)
        }
      },

      async setScale(scale: number): Promise<void> {
        if (scale <= 0) {
          throw createPdfError(
            ErrorCode.VALIDATION_ERROR,
            `Invalid scale value: ${scale}`,
          )
        }

        try {
          state.scale = scale
          await this.renderCurrentPage(state, context)
          handlers?.onScaleChange?.(scale)
        }
        catch (error) {
          const pdfError = createPdfError(
            ErrorCode.RENDER_ERROR,
            `Failed to set scale to ${scale}`,
            error,
          )
          this._handleError(pdfError)
          throw pdfError
        }
      },

      async zoomIn(): Promise<void> {
        await this.setScale(state.scale * 1.2)
      },

      async zoomOut(): Promise<void> {
        await this.setScale(state.scale / 1.2)
      },

      async fitWidth(): Promise<void> {
        if (!context.canvas || !context.container)
          return

        const containerWidth = context.container.clientWidth
        const canvasWidth = context.canvas.width
        const scale = containerWidth / canvasWidth
        await this.setScale(scale)
      },

      async fitPage(): Promise<void> {
        if (!context.canvas || !context.container)
          return

        const containerWidth = context.container.clientWidth
        const containerHeight = context.container.clientHeight
        const canvasWidth = context.canvas.width
        const canvasHeight = context.canvas.height

        const scaleX = containerWidth / canvasWidth
        const scaleY = containerHeight / canvasHeight
        const scale = Math.min(scaleX, scaleY)

        await this.setScale(scale)
      },

      async refresh(): Promise<void> {
        await this.renderCurrentPage(state, context)
      },

      async exportAsImage(format = 'png' as const, quality = 0.92): Promise<string> {
        if (!context.canvas) {
          throw createPdfError(
            ErrorCode.RENDER_ERROR,
            'No canvas available for export',
          )
        }

        try {
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
          return context.canvas.toDataURL(mimeType, quality)
        }
        catch (error) {
          const pdfError = createPdfError(
            ErrorCode.RENDER_ERROR,
            `Failed to export as ${format}`,
            error,
          )
          this._handleError(pdfError)
          throw pdfError
        }
      },
    }
  }

  /**
   * 渲染当前页面
   */
  protected async renderCurrentPage(
    state: ComponentState,
    context: RenderContext,
  ): Promise<void> {
    if (!state.document || !context.canvas || !context.context) {
      return
    }

    try {
      state.loading = true

      const page = await defaultPdfApi.getPage(state.document.id, state.currentPage)
      const renderResult = await defaultPdfApi.renderPage(
        state.document.id,
        state.currentPage,
        {
          scale: state.scale,
          canvas: context.canvas,
        },
      )

      context.currentPage = page
      state.loading = false
    }
    catch (error) {
      state.loading = false
      const pdfError = createPdfError(
        ErrorCode.RENDER_ERROR,
        `Failed to render page ${state.currentPage}`,
        error,
      )
      state.error = pdfError
      this._handleError(pdfError)
      throw pdfError
    }
  }

  /**
   * 处理错误
   */
  protected _handleError(error: Error): void {
    if (this._errorHandler) {
      this._errorHandler.handleError(error)
    }
    else {
      console.error(`[${this.type} Adapter]`, error)
    }

    this._eventEmitter.emit('error', error)
  }

  /**
   * 框架特定的初始化实现
   */
  protected abstract doInitialize(): Promise<void>

  /**
   * 框架特定的销毁实现
   */
  protected abstract doDestroy(): void
}
