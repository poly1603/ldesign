/**
 * React框架适配器实现
 * 为React提供PDF预览组件支持
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
 * React组件实例接口
 */
interface ReactComponentInstance {
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
  /** 状态更新函数 */
  setState?: (updater: (prevState: ComponentState) => ComponentState) => void
  /** 强制更新函数 */
  forceUpdate?: () => void
}

/**
 * React适配器实现
 */
export class ReactAdapter extends BaseAdapter {
  private _reactInstances = new WeakMap<unknown, ReactComponentInstance>()

  /**
   * 获取适配器类型
   */
  get type(): FrameworkType {
    return FrameworkType.REACT
  }

  /**
   * 框架特定的初始化实现
   */
  protected async doInitialize(): Promise<void> {
    // React特定的初始化逻辑
    if (this._config.debug) {
      console.warn('[React Adapter] Initialized with config:', this._config)
    }
  }

  /**
   * 创建React组件实例
   */
  createComponent(
    props: ComponentProps,
    handlers?: EventHandlers,
    hooks?: LifecycleHooks
  ): ReactComponentInstance {
    if (!this._initialized) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'React adapter not initialized'
      )
    }

    // 创建组件状态
    const state = this.createComponentState()
    
    // 创建临时容器用于初始化渲染上下文
    const tempContainer = document.createElement('div')
    const context = this.createRenderContext(tempContainer)
    
    // 创建组件方法
    const methods = this.createComponentMethods(state, context, handlers)
    
    // 创建React组件实例
    const instance: ReactComponentInstance = {
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
    this._reactInstances.set(instance, instance)

    // 初始化组件属性
    this.updateProps(instance, props)

    return instance
  }

  /**
   * 挂载组件到容器
   */
  async mount(component: unknown, container: HTMLElement): Promise<void> {
    const instance = this._reactInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid React component instance'
      )
    }

    try {
      // 执行挂载前钩子（类似componentWillMount）
      instance.hooks?.beforeMount?.()

      // 将渲染上下文的容器替换为实际容器
      if (instance.context.canvas) {
        container.appendChild(instance.context.canvas)
      }
      instance.context.container = container
      instance.context.initialized = true

      // 标记为已挂载
      instance.mounted = true

      // 执行挂载后钩子（类似componentDidMount）
      instance.hooks?.mounted?.()

      // 设置状态更新函数（模拟React的setState）
      instance.setState = (updater) => {
        const newState = updater(instance.state)
        Object.assign(instance.state, newState)
        
        // 触发重新渲染
        if (instance.mounted) {
          this.renderCurrentPage(instance.state, instance.context).catch(error => {
            this._handleError(error)
          })
        }
      }

      // 设置强制更新函数（模拟React的forceUpdate）
      instance.forceUpdate = () => {
        if (instance.mounted) {
          this.renderCurrentPage(instance.state, instance.context).catch(error => {
            this._handleError(error)
          })
        }
      }

      // 如果有文档，开始渲染
      if (instance.state.document) {
        await this.renderCurrentPage(instance.state, instance.context)
      }

      if (this._config.debug) {
        console.warn('[React Adapter] Component mounted to container')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.RENDER_ERROR,
        'Failed to mount React component',
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
    const instance = this._reactInstances.get(component)
    if (!instance) {
      throw createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid React component instance'
      )
    }

    try {
      // 执行更新前钩子（类似componentWillUpdate）
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
      }

      // 更新禁用状态
      if (typeof props.disabled === 'boolean' && instance.context.container) {
        if (props.disabled) {
          instance.context.container.style.pointerEvents = 'none'
          instance.context.container.style.opacity = '0.6'
        } else {
          instance.context.container.style.pointerEvents = 'auto'
          instance.context.container.style.opacity = '1'
        }
      }

      // 执行更新后钩子（类似componentDidUpdate）
      instance.hooks?.updated?.()

      if (this._config.debug) {
        console.warn('[React Adapter] Component props updated:', props)
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.VALIDATION_ERROR,
        'Failed to update React component props',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 卸载组件
   */
  unmount(component: unknown): void {
    const instance = this._reactInstances.get(component)
    if (!instance) {
      return
    }

    try {
      // 执行卸载前钩子（类似componentWillUnmount）
      instance.hooks?.beforeUnmount?.()

      // 执行清理函数
      instance.cleanup.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          console.error('[React Adapter] Cleanup error:', error)
        }
      })

      // 清理DOM
      if (instance.context.canvas && instance.context.canvas.parentNode) {
        instance.context.canvas.parentNode.removeChild(instance.context.canvas)
      }

      // 清理状态
      instance.mounted = false
      instance.context.initialized = false
      instance.setState = undefined
      instance.forceUpdate = undefined

      // 执行卸载后钩子
      instance.hooks?.unmounted?.()

      // 从映射中移除
      this._components.delete(component)
      this._reactInstances.delete(component)

      if (this._config.debug) {
        console.warn('[React Adapter] Component unmounted')
      }
    } catch (error) {
      const pdfError = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to unmount React component',
        error
      )
      this._handleError(pdfError)
    }
  }

  /**
   * 框架特定的销毁实现
   */
  protected doDestroy(): void {
    // 清理所有React实例
    this._reactInstances = new WeakMap()
    
    if (this._config.debug) {
      console.warn('[React Adapter] Destroyed')
    }
  }

  /**
   * 获取组件状态（React特有）
   */
  getComponentState(component: unknown): ComponentState | null {
    const instance = this._reactInstances.get(component)
    return instance ? { ...instance.state } : null
  }

  /**
   * 设置组件状态（React特有）
   */
  setComponentState(
    component: unknown,
    updater: (prevState: ComponentState) => ComponentState
  ): void {
    const instance = this._reactInstances.get(component)
    if (instance && instance.setState) {
      instance.setState(updater)
    }
  }

  /**
   * 强制更新组件（React特有）
   */
  forceUpdateComponent(component: unknown): void {
    const instance = this._reactInstances.get(component)
    if (instance && instance.forceUpdate) {
      instance.forceUpdate()
    }
  }

  /**
   * 加载PDF文档
   */
  private async _loadDocument(instance: ReactComponentInstance, source: any): Promise<void> {
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
 * 创建React适配器实例
 */
export function createReactAdapter(config?: Partial<AdapterConfig>): ReactAdapter {
  const defaultConfig: AdapterConfig = {
    framework: FrameworkType.REACT,
    componentName: 'PdfViewer',
    debug: false,
    ...config
  }
  
  return new ReactAdapter(defaultConfig)
}