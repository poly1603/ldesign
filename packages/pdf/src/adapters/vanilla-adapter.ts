/**
 * 原生JavaScript适配器实现
 * 为不使用框架的项目提供PDF预览组件支持
 */

import { BaseAdapter } from './base-adapter'
import {
  FrameworkType,
  type AdapterConfig,
  type ComponentProps,
  type EventHandlers,
  type LifecycleHooks,
  type RenderContext,
  type ComponentState,
  type ComponentMethods
} from './types'
import { createPdfError, ErrorCode } from '../utils/error-handler'
import { defaultPdfApi } from '../api/pdf-api'

/**
 * 原生组件实例接口
 */
interface VanillaComponentInstance {
  /** 组件状态 */
  state: ComponentState
  /** 组件方法 */
  methods: ComponentMethods
  /** 渲染上下文 */
  context: RenderContext
  /** 事件处理器 */
  handlers?: EventHandlers
  /** 生命周期钩子 */
  hooks?: LifecycleHooks
  /** 是否已挂载 */
  mounted: boolean
  /** 清理函数 */
  cleanup: (() => void)[]
  /** DOM事件监听器 */
  eventListeners: Map<string, EventListener>
  /** 观察器 */
  observers: (MutationObserver | ResizeObserver | IntersectionObserver)[]
}

/**
 * 原生JavaScript适配器实现
 */
export class VanillaAdapter extends BaseAdapter {
  private _vanillaInstances = new WeakMap<unknown, VanillaComponentInstance>()

  /**
   * 获取适配器类型
   */
  get type(): FrameworkType {
    return FrameworkType.VANILLA
  }

  /**
   * 框架特定的初始化实现
   */
  protected async doInitialize(): Promise<void> {
    // 原生JavaScript特定的初始化逻辑
    if (this._config.debug) {
      console.warn('[Vanilla Adapter] Initialized with config:', this._config)
    }
  }

  /**
   * 创建原生组件实例
   */
  createComponent(
    props: ComponentProps,
    handlers?: EventHandlers,
    hooks?: LifecycleHooks
  ): VanillaComponentInstance {
    if (!this._initialized) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Vanilla adapter not initialized'
      )
    }

    // 创建组件状态
    const state = this.createComponentState()
    
    // 创建临时容器用于初始化渲染上下文
    const tempContainer = document.createElement('div')
    const context = this.createRenderContext(tempContainer)
    
    // 创建组件方法
    const methods = this.createComponentMethods(state, context, handlers)
    
    // 创建原生组件实例
    const instance: VanillaComponentInstance = {
      state,
      methods,
      context,
      handlers,
      hooks,
      mounted: false,
      cleanup: [],
      eventListeners: new Map(),
      observers: []
    }

    // 注册组件实例
    this._components.set(instance, context)
    this._vanillaInstances.set(instance, instance)

    // 初始化组件属性
    this.updateProps(instance, props)

    return instance
  }

  /**
   * 挂载组件到容器
   */
  async mount(component: unknown, container: HTMLElement): Promise<void> {
    const instance = this._vanillaInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid Vanilla component instance'
      )
    }

    try {
      // 执行挂载前钩子
      instance.hooks?.beforeMount?.()

      // 将渲染上下文的容器替换为实际容器
      if (instance.context.canvas) {
        container.appendChild(instance.context.canvas)
      }
      instance.context.container = container
      instance.context.initialized = true

      // 设置容器样式
      this._setupContainerStyles(container)

      // 绑定DOM事件
      this._bindDOMEvents(instance)

      // 设置观察器
      this._setupObservers(instance)

      // 标记为已挂载
      instance.mounted = true

      // 执行挂载后钩子
      instance.hooks?.mounted?.()

      // 如果有文档，开始渲染
      if (instance.state.document) {
        await this.renderCurrentPage(instance.state, instance.context)
      }

      if (this._config.debug) {
        console.warn('[Vanilla Adapter] Component mounted to container')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.RENDER_ERROR,
        'Failed to mount Vanilla component',
        error
      )
      this._handleError(pdfError)
      throw pdfError
    }
  }

  /**
   * 更新组件属性
   */
  updateProps(component: unknown, props: Partial<ComponentProps>): void {
    const instance = this._vanillaInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid Vanilla component instance'
      )
    }

    try {
      // 执行更新前钩子
      instance.hooks?.beforeUpdate?.()

      // 更新源文档
      if (props.source && props.source !== instance.state.document?.source) {
        this._loadDocument(instance, props.source)
      }

      // 更新页码
      if (props.page && props.page !== instance.state.currentPage) {
        instance.methods.goToPage(props.page).catch(error => {
          this._handleError(error)
        })
      }

      // 更新缩放比例
      if (props.scale && props.scale !== instance.state.scale) {
        instance.methods.setScale(props.scale).catch(error => {
          this._handleError(error)
        })
      }

      // 更新渲染选项
      if (props.renderOptions) {
        // 重新渲染当前页面
        this.renderCurrentPage(instance.state, instance.context).catch(error => {
          this._handleError(error)
        })
      }

      // 更新样式
      if (props.className && instance.context.container) {
        instance.context.container.className = props.className
      }

      if (props.style && instance.context.container) {
        Object.assign(instance.context.container.style, props.style)
      }

      // 更新加载状态
      if (typeof props.loading === 'boolean') {
        instance.state.loading = props.loading
        this._updateLoadingState(instance)
      }

      // 更新禁用状态
      if (typeof props.disabled === 'boolean') {
        this._updateDisabledState(instance, props.disabled)
      }

      // 执行更新后钩子
      instance.hooks?.updated?.()

      if (this._config.debug) {
        console.warn('[Vanilla Adapter] Component props updated:', props)
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Failed to update Vanilla component props',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 卸载组件
   */
  unmount(component: unknown): void {
    const instance = this._vanillaInstances.get(component)
    if (!instance) {
      return
    }

    try {
      // 执行卸载前钩子
      instance.hooks?.beforeUnmount?.()

      // 清理DOM事件监听器
      this._unbindDOMEvents(instance)

      // 清理观察器
      this._cleanupObservers(instance)

      // 执行清理函数
      instance.cleanup.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          console.error('[Vanilla Adapter] Cleanup error:', error)
        }
      })

      // 清理DOM
      if (instance.context.canvas && instance.context.canvas.parentNode) {
        instance.context.canvas.parentNode.removeChild(instance.context.canvas)
      }

      // 清理状态
      instance.mounted = false
      instance.context.initialized = false

      // 执行卸载后钩子
      instance.hooks?.unmounted?.()

      // 从映射中移除
      this._components.delete(component)
      this._vanillaInstances.delete(component)

      if (this._config.debug) {
        console.warn('[Vanilla Adapter] Component unmounted')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to unmount Vanilla component',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 框架特定的销毁实现
   */
  protected doDestroy(): void {
    // 清理所有原生实例
    this._vanillaInstances = new WeakMap()
    
    if (this._config.debug) {
      console.warn('[Vanilla Adapter] Destroyed')
    }
  }

  /**
   * 设置容器样式
   */
  private _setupContainerStyles(container: HTMLElement): void {
    container.style.position = container.style.position || 'relative'
    container.style.overflow = container.style.overflow || 'auto'
    container.style.userSelect = 'none'
  }

  /**
   * 绑定DOM事件
   */
  private _bindDOMEvents(instance: VanillaComponentInstance): void {
    const { container, canvas } = instance.context
    const { handlers } = instance

    if (!container || !canvas) return

    // 点击事件
    if (handlers?.onClick) {
      const clickHandler = (event: MouseEvent) => {
        handlers.onClick?.(event)
      }
      canvas.addEventListener('click', clickHandler)
      instance.eventListeners.set('click', clickHandler)
    }

    // 双击事件
    if (handlers?.onDoubleClick) {
      const dblClickHandler = (event: MouseEvent) => {
        handlers.onDoubleClick?.(event)
      }
      canvas.addEventListener('dblclick', dblClickHandler)
      instance.eventListeners.set('dblclick', dblClickHandler)
    }

    // 鼠标滚轮事件（缩放）
    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.max(0.1, Math.min(5.0, instance.state.scale + delta))
      instance.methods.setScale(newScale).catch(error => {
        this._handleError(error)
      })
    }
    canvas.addEventListener('wheel', wheelHandler)
    instance.eventListeners.set('wheel', wheelHandler)

    // 键盘事件
    const keydownHandler = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault()
          instance.methods.previousPage().catch(error => {
            this._handleError(error)
          })
          break
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault()
          instance.methods.nextPage().catch(error => {
            this._handleError(error)
          })
          break
        case '+':
        case '=':
          event.preventDefault()
          instance.methods.zoomIn().catch(error => {
            this._handleError(error)
          })
          break
        case '-':
          event.preventDefault()
          instance.methods.zoomOut().catch(error => {
            this._handleError(error)
          })
          break
      }
    }
    container.addEventListener('keydown', keydownHandler)
    instance.eventListeners.set('keydown', keydownHandler)

    // 确保容器可以接收键盘事件
    container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0
  }

  /**
   * 解绑DOM事件
   */
  private _unbindDOMEvents(instance: VanillaComponentInstance): void {
    const { container, canvas } = instance.context

    instance.eventListeners.forEach((listener, eventType) => {
      if (eventType === 'keydown' && container) {
        container.removeEventListener(eventType, listener)
      } else if (canvas) {
        canvas.removeEventListener(eventType, listener)
      }
    })

    instance.eventListeners.clear()
  }

  /**
   * 设置观察器
   */
  private _setupObservers(instance: VanillaComponentInstance): void {
    const { container } = instance.context
    if (!container) return

    // 尺寸变化观察器
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        // 容器尺寸变化时重新渲染
        if (instance.mounted && instance.state.document) {
          this.renderCurrentPage(instance.state, instance.context).catch(error => {
            this._handleError(error)
          })
        }
      })
      resizeObserver.observe(container)
      instance.observers.push(resizeObserver)
    }

    // 可见性观察器
    if (typeof IntersectionObserver !== 'undefined') {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && instance.state.document) {
            // 组件进入视口时重新渲染
            this.renderCurrentPage(instance.state, instance.context).catch(error => {
              this._handleError(error)
            })
          }
        })
      })
      intersectionObserver.observe(container)
      instance.observers.push(intersectionObserver)
    }
  }

  /**
   * 清理观察器
   */
  private _cleanupObservers(instance: VanillaComponentInstance): void {
    instance.observers.forEach(observer => {
      observer.disconnect()
    })
    instance.observers.length = 0
  }

  /**
   * 更新加载状态
   */
  private _updateLoadingState(instance: VanillaComponentInstance): void {
    const { container } = instance.context
    if (!container) return

    if (instance.state.loading) {
      container.style.cursor = 'wait'
      container.setAttribute('aria-busy', 'true')
    } else {
      container.style.cursor = 'default'
      container.removeAttribute('aria-busy')
    }
  }

  /**
   * 更新禁用状态
   */
  private _updateDisabledState(instance: VanillaComponentInstance, disabled: boolean): void {
    const { container } = instance.context
    if (!container) return

    if (disabled) {
      container.style.pointerEvents = 'none'
      container.style.opacity = '0.6'
      container.setAttribute('aria-disabled', 'true')
    } else {
      container.style.pointerEvents = 'auto'
      container.style.opacity = '1'
      container.removeAttribute('aria-disabled')
    }
  }

  /**
   * 加载PDF文档
   */
  private async _loadDocument(instance: VanillaComponentInstance, source: any): Promise<void> {
    try {
      instance.state.loading = true
      instance.state.error = null
      this._updateLoadingState(instance)
      instance.handlers?.onLoadingChange?.(true)

      const document = await defaultPdfApi.loadPdf(source)
      instance.state.document = document
      instance.state.totalPages = document.numPages
      instance.state.currentPage = 1
      instance.state.loading = false
      this._updateLoadingState(instance)

      instance.handlers?.onDocumentLoad?.(document)
      instance.handlers?.onLoadingChange?.(false)

      // 如果组件已挂载，渲染第一页
      if (instance.mounted) {
        await this.renderCurrentPage(instance.state, instance.context)
      }
    } catch (error) {
      instance.state.loading = false
      instance.state.error = error as Error
      this._updateLoadingState(instance)
      instance.handlers?.onLoadingChange?.(false)
      instance.handlers?.onError?.(error as Error)
      this._handleError(error as Error)
    }
  }
}

/**
 * 创建原生JavaScript适配器实例
 */
export function createVanillaAdapter(config?: Partial<AdapterConfig>): VanillaAdapter {
  const defaultConfig: AdapterConfig = {
    framework: FrameworkType.VANILLA,
    componentName: 'PdfViewer',
    debug: false,
    ...config
  }
  
  return new VanillaAdapter(defaultConfig)
}