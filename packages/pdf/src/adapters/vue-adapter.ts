/**
 * Vue框架适配器实现
 * 为Vue提供PDF预览组件支持
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
 * Vue组件实例接口
 */
interface VueComponentInstance {
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
}

/**
 * Vue适配器实现
 */
export class VueAdapter extends BaseAdapter {
  private _vueInstances = new WeakMap<unknown, VueComponentInstance>()

  /**
   * 获取适配器类型
   */
  get type(): FrameworkType {
    return FrameworkType.VUE
  }

  /**
   * 框架特定的初始化实现
   */
  protected async doInitialize(): Promise<void> {
    // Vue特定的初始化逻辑
    if (this._config.debug) {
      console.warn('[Vue Adapter] Initialized with config:', this._config)
    }
  }

  /**
   * 创建Vue组件实例
   */
  createComponent(
    props: ComponentProps,
    handlers?: EventHandlers,
    hooks?: LifecycleHooks
  ): VueComponentInstance {
    if (!this._initialized) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Vue adapter not initialized'
      )
    }

    // 创建组件状态
    const state = this.createComponentState()
    
    // 创建临时容器用于初始化渲染上下文
    const tempContainer = document.createElement('div')
    const context = this.createRenderContext(tempContainer)
    
    // 创建组件方法
    const methods = this.createComponentMethods(state, context, handlers)
    
    // 创建Vue组件实例
    const instance: VueComponentInstance = {
      state,
      methods,
      context,
      handlers,
      hooks,
      mounted: false,
      cleanup: []
    }

    // 注册组件实例
    this._components.set(instance, context)
    this._vueInstances.set(instance, instance)

    // 初始化组件属性
    this.updateProps(instance, props)

    return instance
  }

  /**
   * 挂载组件到容器
   */
  async mount(component: unknown, container: HTMLElement): Promise<void> {
    const instance = this._vueInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid Vue component instance'
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

      // 标记为已挂载
      instance.mounted = true

      // 执行挂载后钩子
      instance.hooks?.mounted?.()

      // 如果有文档，开始渲染
      if (instance.state.document) {
        await this.renderCurrentPage(instance.state, instance.context)
      }

      if (this._config.debug) {
        console.warn('[Vue Adapter] Component mounted to container')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.RENDER_ERROR,
        'Failed to mount Vue component',
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
    const instance = this._vueInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid Vue component instance'
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

      // 执行更新后钩子
      instance.hooks?.updated?.()

      if (this._config.debug) {
        console.warn('[Vue Adapter] Component props updated:', props)
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Failed to update Vue component props',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 卸载组件
   */
  unmount(component: unknown): void {
    const instance = this._vueInstances.get(component)
    if (!instance) {
      return
    }

    try {
      // 执行卸载前钩子
      instance.hooks?.beforeUnmount?.()

      // 执行清理函数
      instance.cleanup.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          console.error('[Vue Adapter] Cleanup error:', error)
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
      this._vueInstances.delete(component)

      if (this._config.debug) {
        console.warn('[Vue Adapter] Component unmounted')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to unmount Vue component',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 框架特定的销毁实现
   */
  protected doDestroy(): void {
    // 清理所有Vue实例
    this._vueInstances = new WeakMap()
    
    if (this._config.debug) {
      console.warn('[Vue Adapter] Destroyed')
    }
  }

  /**
   * 加载PDF文档
   */
  private async _loadDocument(instance: VueComponentInstance, source: any): Promise<void> {
    try {
      instance.state.loading = true
      instance.state.error = null
      instance.handlers?.onLoadingChange?.(true)

      const document = await defaultPdfApi.loadPdf(source)
      instance.state.document = document
      instance.state.totalPages = document.numPages
      instance.state.currentPage = 1
      instance.state.loading = false

      instance.handlers?.onDocumentLoad?.(document)
      instance.handlers?.onLoadingChange?.(false)

      // 如果组件已挂载，渲染第一页
      if (instance.mounted) {
        await this.renderCurrentPage(instance.state, instance.context)
      }
    } catch (error) {
      instance.state.loading = false
      instance.state.error = error as Error
      instance.handlers?.onLoadingChange?.(false)
      instance.handlers?.onError?.(error as Error)
      this._handleError(error as Error)
    }
  }
}

/**
 * 创建Vue适配器实例
 */
export function createVueAdapter(config?: Partial<AdapterConfig>): VueAdapter {
  const defaultConfig: AdapterConfig = {
    framework: FrameworkType.VUE,
    componentName: 'PdfViewer',
    debug: false,
    ...config
  }
  
  return new VueAdapter(defaultConfig)
}