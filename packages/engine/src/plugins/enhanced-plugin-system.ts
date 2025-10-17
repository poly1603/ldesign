/**
 * 增强的插件系统
 * 支持插件互访、共享状态、生命周期集成
 */

import type { Engine, Logger } from '../types'
import { computed, type ComputedRef, reactive, ref, watch } from 'vue'

// ==================== 类型定义 ====================

export interface EnhancedPlugin {
  name: string
  version?: string
  dependencies?: string[]
  exports?: Record<string, unknown>  // 插件对外暴露的 API
  state?: Record<string, unknown>    // 插件私有状态
  sharedState?: Record<string, unknown>  // 插件共享状态
  
  // 生命周期钩子
  beforeInstall?: (context: PluginContext) => Promise<void> | void
  install: (context: PluginContext) => Promise<void> | void
  afterInstall?: (context: PluginContext) => Promise<void> | void
  
  beforeUninstall?: (context: PluginContext) => Promise<void> | void
  uninstall?: (context: PluginContext) => Promise<void> | void
  afterUninstall?: (context: PluginContext) => Promise<void> | void
  
  // 插件方法
  onStateChange?: (key: string, value: unknown, oldValue: unknown) => void
  onPluginRegistered?: (plugin: EnhancedPlugin) => void
  onPluginUnregistered?: (pluginName: string) => void
  
  // 中间件集成
  middleware?: PluginMiddleware[]
}

export interface PluginMiddleware {
  name: string
  phase: 'before' | 'after' | 'around'
  handler: (context: MiddlewareContext, next?: () => Promise<void>) => Promise<void> | void
  priority?: number
}

export interface PluginContext {
  engine: Engine
  logger: Logger
  
  // 插件互访 API
  getPlugin: (name: string) => EnhancedPlugin | undefined
  callPlugin: <T = unknown>(name: string, method: string, ...args: unknown[]) => T
  usePlugin: <T = unknown>(name: string) => T
  
  // 共享状态 API
  getSharedState: <T = unknown>(key: string) => T
  setSharedState: <T = unknown>(key: string, value: T) => void
  watchSharedState: <T = unknown>(key: string, callback: (value: T, oldValue: T) => void) => () => void
  
  // 生命周期 API
  onLifecycle: (phase: string, handler: () => void) => () => void
  
  // 中间件 API
  registerMiddleware: (middleware: PluginMiddleware) => void
  unregisterMiddleware: (name: string) => void
}

export interface MiddlewareContext {
  plugin: string
  method: string
  args: unknown[]
  result?: unknown
  error?: Error
  metadata?: Record<string, unknown>
}

// ==================== 实现 ====================

export class EnhancedPluginSystem {
  private plugins = new Map<string, EnhancedPlugin>()
  private pluginStates = new Map<string, any>()  // 插件私有状态
  private sharedState = reactive<Record<string, unknown>>({})  // 全局共享状态
  private pluginExports = new Map<string, any>()  // 插件导出的 API
  private middlewares = new Map<string, PluginMiddleware[]>()
  private lifecycleHandlers = new Map<string, Set<() => void>>()
  private engine?: Engine
  private logger?: Logger
  
  // 插件依赖图
  private dependencyGraph = new Map<string, Set<string>>()
  private reverseDependencyGraph = new Map<string, Set<string>>()

  constructor(engine?: Engine) {
    this.engine = engine
    this.logger = engine?.logger
    this.initialize()
  }

  private initialize(): void {
    // 监听全局状态变化
    watch(this.sharedState, (newVal, oldVal) => {
      this.notifyStateChange(newVal, oldVal)
    }, { deep: true })
  }

  // ==================== 插件注册 ====================

  async register(plugin: EnhancedPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 检查依赖
    this.checkDependencies(plugin)

    // 创建插件上下文
    const context = this.createPluginContext(plugin)

    try {
      // 执行 beforeInstall 钩子
      if (plugin.beforeInstall) {
        await plugin.beforeInstall(context)
      }

      // 触发生命周期事件
      await this.triggerLifecycle(`plugin:${plugin.name}:beforeInstall`)

      // 初始化插件状态
      if (plugin.state) {
        this.pluginStates.set(plugin.name, reactive(plugin.state))
      }

      // 初始化共享状态
      if (plugin.sharedState) {
        Object.entries(plugin.sharedState).forEach(([key, value]) => {
          this.sharedState[`${plugin.name}:${key}`] = value
        })
      }

      // 注册中间件
      if (plugin.middleware) {
        plugin.middleware.forEach(mw => {
          this.registerPluginMiddleware(plugin.name, mw)
        })
      }

      // 安装插件
      await plugin.install(context)
      
      // 保存插件导出
      if (plugin.exports) {
        this.pluginExports.set(plugin.name, plugin.exports)
      }

      // 注册插件
      this.plugins.set(plugin.name, plugin)
      this.updateDependencyGraph(plugin)

      // 执行 afterInstall 钩子
      if (plugin.afterInstall) {
        await plugin.afterInstall(context)
      }

      // 触发生命周期事件
      await this.triggerLifecycle(`plugin:${plugin.name}:afterInstall`)

      // 通知其他插件
      this.notifyPluginRegistered(plugin)

      this.logger?.info(`Plugin "${plugin.name}" registered successfully`)

    } catch (error) {
      // 回滚
      this.rollbackPlugin(plugin)
      throw error
    }
  }

  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    // 检查依赖关系
    const dependents = this.reverseDependencyGraph.get(name)
    if (dependents && dependents.size > 0) {
      throw new Error(`Cannot unregister "${name}": required by ${Array.from(dependents).join(', ')}`)
    }

    const context = this.createPluginContext(plugin)

    try {
      // 执行 beforeUninstall 钩子
      if (plugin.beforeUninstall) {
        await plugin.beforeUninstall(context)
      }

      // 触发生命周期事件
      await this.triggerLifecycle(`plugin:${name}:beforeUninstall`)

      // 卸载插件
      if (plugin.uninstall) {
        await plugin.uninstall(context)
      }

      // 清理状态
      this.pluginStates.delete(name)
      this.pluginExports.delete(name)
      
      // 清理共享状态
      Object.keys(this.sharedState).forEach(key => {
        if (key.startsWith(`${name}:`)) {
          delete this.sharedState[key]
        }
      })

      // 清理中间件
      this.middlewares.delete(name)

      // 从注册表中移除
      this.plugins.delete(name)
      this.updateDependencyGraphOnRemoval(name)

      // 执行 afterUninstall 钩子
      if (plugin.afterUninstall) {
        await plugin.afterUninstall(context)
      }

      // 触发生命周期事件
      await this.triggerLifecycle(`plugin:${name}:afterUninstall`)

      // 通知其他插件
      this.notifyPluginUnregistered(name)

      this.logger?.info(`Plugin "${name}" unregistered successfully`)

    } catch (error) {
      this.logger?.error(`Failed to unregister plugin "${name}"`, error)
      throw error
    }
  }

  // ==================== 插件互访 ====================

  getPlugin(name: string): EnhancedPlugin | undefined {
    return this.plugins.get(name)
  }

  callPlugin<T = unknown>(pluginName: string, method: string, ...args: unknown[]): T {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`)
    }

    const exports = this.pluginExports.get(pluginName)
    if (!exports || typeof exports[method] !== 'function') {
      throw new Error(`Method "${method}" not found in plugin "${pluginName}"`)
    }

    // 执行中间件
    const context: MiddlewareContext = {
      plugin: pluginName,
      method,
      args,
      metadata: {}
    }

    return this.executeWithMiddleware(context, () => {
      return exports[method](...args)
    }) as T
  }

  usePlugin<T = unknown>(name: string): T {
    const exports = this.pluginExports.get(name)
    if (!exports) {
      throw new Error(`Plugin "${name}" not found or has no exports`)
    }
    return exports as T
  }

  // ==================== 共享状态管理 ====================

  getSharedState<T = unknown>(key: string): T {
    const keys = key.split('.')
    let current: any = this.sharedState
    
    for (const k of keys) {
      if (current === undefined || current === null) {
        return undefined as T
      }
      current = current[k]
    }
    
    return current as T
  }

  setSharedState<T = unknown>(key: string, value: T): void {
    const keys = key.split('.')
    let current: any = this.sharedState
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }
    
    current[keys[keys.length - 1]] = value
  }

  watchSharedState<T = unknown>(
    key: string,
    callback: (value: T, oldValue: T) => void
  ): () => void {
    return watch(
      () => this.getSharedState<T>(key),
      (newVal, oldVal) => callback(newVal, oldVal),
      { deep: true }
    )
  }

  // 创建响应式计算属性
  createComputed<T>(getter: () => T): ComputedRef<T> {
    return computed(getter)
  }

  // 创建响应式引用
  createRef<T>(value: T): ReturnType<typeof ref> {
    return ref(value)
  }

  // ==================== 生命周期管理 ====================

  onLifecycle(phase: string, handler: () => void): () => void {
    if (!this.lifecycleHandlers.has(phase)) {
      this.lifecycleHandlers.set(phase, new Set())
    }
    
    const handlers = this.lifecycleHandlers.get(phase)!
    handlers.add(handler)
    
    return () => {
      handlers.delete(handler)
    }
  }

  async triggerLifecycle(phase: string): Promise<void> {
    const handlers = this.lifecycleHandlers.get(phase)
    if (!handlers) return

    for (const handler of handlers) {
      try {
        await handler()
      } catch (error) {
        this.logger?.error(`Error in lifecycle handler for phase "${phase}"`, error)
      }
    }
  }

  // ==================== 中间件集成 ====================

  private registerPluginMiddleware(pluginName: string, middleware: PluginMiddleware): void {
    if (!this.middlewares.has(pluginName)) {
      this.middlewares.set(pluginName, [])
    }
    
    const middlewares = this.middlewares.get(pluginName)!
    middlewares.push(middleware)
    
    // 按优先级排序
    middlewares.sort((a, b) => (a.priority || 50) - (b.priority || 50))
  }

  private async executeWithMiddleware<T>(
    context: MiddlewareContext,
    executor: () => T
  ): Promise<T> {
    const middlewares = this.getAllMiddlewares()
    let index = 0

    const next = async (): Promise<T> => {
      if (index >= middlewares.length) {
        // 执行实际方法
        try {
          const result = await executor()
          context.result = result
          return result
        } catch (error) {
          context.error = error as Error
          throw error
        }
      }

      const middleware = middlewares[index++]
      
      if (middleware.phase === 'before') {
        await middleware.handler(context)
        return next()
      } else if (middleware.phase === 'after') {
        const result = await next()
        await middleware.handler(context)
        return result
      } else {
        // around
        return middleware.handler(context, next as any) as Promise<T>
      }
    }

    return next()
  }

  private getAllMiddlewares(): PluginMiddleware[] {
    const allMiddlewares: PluginMiddleware[] = []
    
    this.middlewares.forEach(middlewares => {
      allMiddlewares.push(...middlewares)
    })
    
    return allMiddlewares.sort((a, b) => (a.priority || 50) - (b.priority || 50))
  }

  // ==================== 私有方法 ====================

  private createPluginContext(plugin: EnhancedPlugin): PluginContext {
    return {
      engine: this.engine!,
      logger: this.logger!,
      
      // 插件互访
      getPlugin: (name: string) => this.getPlugin(name),
      callPlugin: (name: string, method: string, ...args: unknown[]) => 
        this.callPlugin(name, method, ...args),
      usePlugin: (name: string) => this.usePlugin(name),
      
      // 共享状态
      getSharedState: (key: string) => this.getSharedState(key),
      setSharedState: (key: string, value: unknown) => this.setSharedState(key, value),
      watchSharedState: (key: string, callback: any) => this.watchSharedState(key, callback),
      
      // 生命周期
      onLifecycle: (phase: string, handler: () => void) => this.onLifecycle(phase, handler),
      
      // 中间件
      registerMiddleware: (middleware: PluginMiddleware) => 
        this.registerPluginMiddleware(plugin.name, middleware),
      unregisterMiddleware: (name: string) => {
        const middlewares = this.middlewares.get(plugin.name)
        if (middlewares) {
          const index = middlewares.findIndex(m => m.name === name)
          if (index > -1) {
            middlewares.splice(index, 1)
          }
        }
      }
    }
  }

  private checkDependencies(plugin: EnhancedPlugin): void {
    if (!plugin.dependencies) return

    const missing = plugin.dependencies.filter(dep => !this.plugins.has(dep))
    if (missing.length > 0) {
      throw new Error(`Missing dependencies for "${plugin.name}": ${missing.join(', ')}`)
    }
  }

  private updateDependencyGraph(plugin: EnhancedPlugin): void {
    if (!plugin.dependencies) return

    this.dependencyGraph.set(plugin.name, new Set(plugin.dependencies))
    
    plugin.dependencies.forEach(dep => {
      if (!this.reverseDependencyGraph.has(dep)) {
        this.reverseDependencyGraph.set(dep, new Set())
      }
      this.reverseDependencyGraph.get(dep)!.add(plugin.name)
    })
  }

  private updateDependencyGraphOnRemoval(name: string): void {
    // 移除正向依赖
    this.dependencyGraph.delete(name)
    
    // 移除反向依赖
    this.reverseDependencyGraph.forEach(deps => {
      deps.delete(name)
    })
    this.reverseDependencyGraph.delete(name)
  }

  private rollbackPlugin(plugin: EnhancedPlugin): void {
    // 清理已注册的资源
    this.pluginStates.delete(plugin.name)
    this.pluginExports.delete(plugin.name)
    this.middlewares.delete(plugin.name)
    
    // 清理共享状态
    Object.keys(this.sharedState).forEach(key => {
      if (key.startsWith(`${plugin.name}:`)) {
        delete this.sharedState[key]
      }
    })
  }

  private notifyPluginRegistered(plugin: EnhancedPlugin): void {
    this.plugins.forEach(p => {
      if (p.onPluginRegistered) {
        try {
          p.onPluginRegistered(plugin)
        } catch (error) {
          this.logger?.error(`Error notifying plugin "${p.name}" of registration`, error)
        }
      }
    })
  }

  private notifyPluginUnregistered(name: string): void {
    this.plugins.forEach(p => {
      if (p.onPluginUnregistered) {
        try {
          p.onPluginUnregistered(name)
        } catch (error) {
          this.logger?.error(`Error notifying plugin "${p.name}" of unregistration`, error)
        }
      }
    })
  }

  private notifyStateChange(newVal: Record<string, unknown>, oldVal: Record<string, unknown>): void {
    // 找出变化的键
    const changedKeys = new Set<string>()
    
    Object.keys(newVal).forEach(key => {
      if (newVal[key] !== oldVal[key]) {
        changedKeys.add(key)
      }
    })
    
    Object.keys(oldVal).forEach(key => {
      if (!(key in newVal)) {
        changedKeys.add(key)
      }
    })
    
    // 通知插件
    changedKeys.forEach(key => {
      this.plugins.forEach(plugin => {
        if (plugin.onStateChange) {
          try {
            plugin.onStateChange(key, newVal[key], oldVal[key])
          } catch (error) {
            this.logger?.error(`Error notifying plugin "${plugin.name}" of state change`, error)
          }
        }
      })
    })
  }

  // ==================== 公共 API ====================

  /**
   * 获取插件状态
   */
  getPluginState<T = unknown>(pluginName: string): T | undefined {
    return this.pluginStates.get(pluginName)
  }

  /**
   * 获取所有共享状态
   */
  getAllSharedState(): Record<string, unknown> {
    return { ...this.sharedState }
  }

  /**
   * 获取插件依赖图
   */
  getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph)
  }

  /**
   * 获取所有已注册的插件
   */
  getAllPlugins(): EnhancedPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已注册
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 销毁系统
   */
  async destroy(): Promise<void> {
    // 按依赖顺序卸载所有插件
    const sortedPlugins = this.topologicalSort()
    
    for (const pluginName of sortedPlugins.reverse()) {
      await this.unregister(pluginName)
    }
    
    // 清理资源
    this.lifecycleHandlers.clear()
    this.sharedState = reactive({})
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    
    const visit = (node: string) => {
      if (visited.has(node)) return
      visited.add(node)
      
      const deps = this.dependencyGraph.get(node)
      if (deps) {
        deps.forEach(dep => visit(dep))
      }
      
      result.push(node)
    }
    
    this.plugins.forEach((_, name) => visit(name))
    
    return result
  }
}

// 导出工厂函数
export function createEnhancedPluginSystem(engine?: Engine): EnhancedPluginSystem {
  return new EnhancedPluginSystem(engine)
}