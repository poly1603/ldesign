/**
 * 统一错误处理
 */

export class PluginError extends Error {
  constructor(
    public pluginName: string,
    message: string,
    public code?: string,
    public cause?: Error
  ) {
    super(`[${pluginName}] ${message}`)
    this.name = 'PluginError'
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private handlers = new Map<string, (error: Error) => void>()
  private defaultHandler?: (error: Error) => void
  
  /**
   * 注册错误处理器
   */
  register(code: string, handler: (error: Error) => void) {
    this.handlers.set(code, handler)
  }
  
  /**
   * 设置默认处理器
   */
  setDefault(handler: (error: Error) => void) {
    this.defaultHandler = handler
  }
  
  /**
   * 处理错误
   */
  handle(error: Error) {
    if (error instanceof PluginError && error.code) {
      const handler = this.handlers.get(error.code)
      if (handler) {
        handler(error)
        return
      }
    }
    
    if (this.defaultHandler) {
      this.defaultHandler(error)
    } else {
      console.error(error)
    }
  }
  
  /**
   * 包装函数，自动捕获错误
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    pluginName: string
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args)
        if (result instanceof Promise) {
          return result.catch(error => {
            this.handle(new PluginError(pluginName, error.message, undefined, error))
          })
        }
        return result
      } catch (error) {
        this.handle(new PluginError(pluginName, (error as Error).message, undefined, error as Error))
      }
    }) as T
  }
}

/**
 * 全局错误处理器
 */
export const globalErrorHandler = new ErrorHandler()

/**
 * 设置默认错误处理
 */
globalErrorHandler.setDefault((error) => {
  if (import.meta.env.DEV) {
    console.error('[Plugin Error]', error)
  } else {
    console.error('An error occurred:', error.message)
  }
})

/**
 * 创建插件专用的错误处理器
 */
export function createPluginErrorHandler(pluginName: string) {
  return {
    /**
     * 抛出插件错误
     */
    throw(message: string, code?: string): never {
      throw new PluginError(pluginName, message, code)
    },
    
    /**
     * 包装函数
     */
    wrap<T extends (...args: any[]) => any>(fn: T): T {
      return globalErrorHandler.wrap(fn, pluginName)
    },
    
    /**
     * 处理错误
     */
    handle(error: Error) {
      globalErrorHandler.handle(
        error instanceof PluginError 
          ? error 
          : new PluginError(pluginName, error.message, undefined, error)
      )
    }
  }
}