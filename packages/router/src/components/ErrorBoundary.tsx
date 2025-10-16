/**
 * 路由错误边界组件
 * 捕获路由渲染过程中的错误并提供友好的错误界面
 */

import {
  type Component,
  defineComponent,
  h,
  onErrorCaptured,
  type PropType,
  ref,
} from 'vue'

/**
 * 错误信息类型
 */
export interface RouteErrorInfo {
  /** 错误对象 */
  error: Error
  /** 错误发生的路由路径 */
  route: string
  /** 错误发生的时间戳 */
  timestamp: number
  /** 错误组件信息 */
  component?: string
  /** 错误类型 */
  type: 'render' | 'async' | 'navigation' | 'unknown'
  /** 堆栈信息 */
  stack?: string
}

/**
 * 错误边界组件属性
 */
export interface ErrorBoundaryProps {
  /** 自定义错误组件 */
  fallback?: Component
  /** 错误处理函数 */
  onError?: (error: RouteErrorInfo) => void
  /** 是否在开发环境显示详细错误 */
  showDetails?: boolean
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 是否自动重试 */
  autoRetry?: boolean
  /** 错误消息映射 */
  errorMessages?: Record<string, string>
  /** 是否记录错误日志 */
  logErrors?: boolean
}

/**
 * 默认错误组件
 */
const DefaultErrorComponent = defineComponent({
  name: 'DefaultErrorComponent',
  props: {
    error: {
      type: Object as PropType<RouteErrorInfo>,
      required: true,
    },
    onRetry: {
      type: Function as PropType<() => void>,
      required: true,
    },
    showDetails: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isDetailsVisible = ref(false)

    const toggleDetails = () => {
      isDetailsVisible.value = !isDetailsVisible.value
    }

    const getErrorMessage = (error: RouteErrorInfo): string => {
      if (error.type === 'navigation') {
        return '页面导航失败，请稍后重试'
      }
      if (error.type === 'async') {
        return '页面加载失败，请检查网络连接'
      }
      if (error.type === 'render') {
        return '页面渲染出错，请刷新页面'
      }
      return '发生未知错误，请联系管理员'
    }

    return () =>
      h('div', { class: 'route-error-boundary' }, [
        h('div', { class: 'error-container' }, [
          h('div', { class: 'error-icon' }, '⚠️'),
          h('h2', { class: 'error-title' }, '糟糕！出现了一些问题'),
          h('p', { class: 'error-message' }, getErrorMessage(props.error)),
          h('div', { class: 'error-actions' }, [
            h(
              'button',
              {
                class: 'retry-button',
                onClick: props.onRetry,
              },
              '重试',
            ),
            props.showDetails
            && h(
              'button',
              {
                class: 'details-button',
                onClick: toggleDetails,
              },
              isDetailsVisible.value ? '隐藏详情' : '显示详情',
            ),
          ]),
          props.showDetails
          && isDetailsVisible.value
          && h('div', { class: 'error-details' }, [
            h('pre', { class: 'error-stack' }, props.error.stack || props.error.error.stack),
            h('div', { class: 'error-meta' }, [
              h('p', `路由: ${props.error.route}`),
              h('p', `时间: ${new Date(props.error.timestamp).toLocaleString()}`),
              h('p', `类型: ${props.error.type}`),
            ]),
          ]),
        ]),
      ])
  },
})

/**
 * 错误边界组件
 */
export const ErrorBoundary = defineComponent({
  name: 'RouterErrorBoundary',
  props: {
    fallback: {
      type: Object as PropType<Component>,
      default: () => DefaultErrorComponent,
    },
    onError: {
      type: Function as PropType<(error: RouteErrorInfo) => void>,
    },
    showDetails: {
      type: Boolean,
      default: (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || false,
    },
    retryDelay: {
      type: Number,
      default: 1000,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    autoRetry: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    logErrors: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const hasError = ref(false)
    const errorInfo = ref<RouteErrorInfo | null>(null)
    const retryCount = ref(0)
    const isRetrying = ref(false)

    // 重置错误状态
    const reset = () => {
      hasError.value = false
      errorInfo.value = null
      retryCount.value = 0
      isRetrying.value = false
    }

    // 重试逻辑
    const retry = async () => {
      if (isRetrying.value)
        return

      isRetrying.value = true
      retryCount.value++

      // 延迟后重置
      setTimeout(() => {
        reset()
      }, props.retryDelay)
    }

    // 错误分类
    const classifyError = (error: Error): RouteErrorInfo['type'] => {
      const message = error.message.toLowerCase()

      if (message.includes('navigation') || message.includes('route')) {
        return 'navigation'
      }
      if (message.includes('async') || message.includes('promise') || message.includes('fetch')) {
        return 'async'
      }
      if (message.includes('render') || message.includes('component')) {
        return 'render'
      }
      return 'unknown'
    }

    // 捕获错误
    onErrorCaptured((error: Error, instance) => {
      const route = window.location.pathname

      errorInfo.value = {
        error,
        route,
        timestamp: Date.now(),
        component: instance?.$options.name || 'Unknown',
        type: classifyError(error),
        stack: error.stack,
      }

      hasError.value = true

      // 记录错误日志
      if (props.logErrors) {
        console.error('[RouterErrorBoundary] Caught error:', {
          error,
          route,
          component: errorInfo.value.component,
          type: errorInfo.value.type,
        })
      }

      // 调用错误处理函数
      if (props.onError) {
        props.onError(errorInfo.value)
      }

      // 自动重试
      if (props.autoRetry && retryCount.value < props.maxRetries) {
        setTimeout(() => retry(), props.retryDelay * (retryCount.value + 1))
      }

      // 阻止错误继续向上传播
      return false
    })

    return () => {
      if (hasError.value && errorInfo.value) {
        // 渲染错误组件
        return h(props.fallback, {
          error: errorInfo.value,
          onRetry: retry,
          showDetails: props.showDetails,
        })
      }

      // 正常渲染子组件
      return slots.default?.()
    }
  },
})

/**
 * 全局错误处理器
 */
export class RouteErrorHandler {
  private static instance: RouteErrorHandler
  private errors: RouteErrorInfo[] = []
  private maxErrors = 100
  private listeners: Set<(error: RouteErrorInfo) => void> = new Set()

  private constructor() {
    this.setupGlobalHandlers()
  }

  static getInstance(): RouteErrorHandler {
    if (!RouteErrorHandler.instance) {
      RouteErrorHandler.instance = new RouteErrorHandler()
    }
    return RouteErrorHandler.instance
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    // 处理未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        error: new Error(event.reason),
        route: window.location.pathname,
        timestamp: Date.now(),
        type: 'async',
      })
    })

    // 处理全局错误
    window.addEventListener('error', (event) => {
      this.handleError({
        error: event.error || new Error(event.message),
        route: window.location.pathname,
        timestamp: Date.now(),
        type: 'unknown',
      })
    })
  }

  /**
   * 处理错误
   */
  handleError(error: RouteErrorInfo): void {
    // 添加到错误列表
    this.errors.push(error)

    // 限制错误列表大小
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 通知所有监听器
    this.listeners.forEach(listener => listener(error))
  }

  /**
   * 添加错误监听器
   */
  onError(listener: (error: RouteErrorInfo) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 获取所有错误
   */
  getErrors(): RouteErrorInfo[] {
    return [...this.errors]
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count = 10): RouteErrorInfo[] {
    return this.errors.slice(-count)
  }

  /**
   * 清除所有错误
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number
    byType: Record<string, number>
    byRoute: Record<string, number>
  } {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<string, number>,
      byRoute: {} as Record<string, number>,
    }

    this.errors.forEach((error) => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1

      // 按路由统计
      stats.byRoute[error.route] = (stats.byRoute[error.route] || 0) + 1
    })

    return stats
  }
}

/**
 * 创建错误边界包装器
 * @param component 要包装的组件
 * @param options 错误边界选项
 */
export function withErrorBoundary(
  component: Component,
  options?: Partial<ErrorBoundaryProps>,
): Component {
  return defineComponent({
    name: `WithErrorBoundary(${component.name || 'Anonymous'})`,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          ErrorBoundary,
          options,
          {
            default: () => h(component, attrs, slots),
          },
        )
    },
  })
}

/**
 * 错误恢复策略
 */
export const ErrorRecoveryStrategies = {
  /**
   * 重新加载页面
   */
  reload: () => {
    window.location.reload()
  },

  /**
   * 导航到首页
   */
  goHome: (router: any) => {
    router.push('/')
  },

  /**
   * 返回上一页
   */
  goBack: (router: any) => {
    router.back()
  },

  /**
   * 清除缓存并重试
   */
  clearCacheAndRetry: () => {
    // 清除本地存储
    localStorage.clear()
    sessionStorage.clear()

    // 清除缓存
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => caches.delete(name))
      })
    }

    // 重新加载
    window.location.reload()
  },
}

export default ErrorBoundary
