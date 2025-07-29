import type { App } from 'vue'

/**
 * 插件接口
 */
export interface IPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件安装方法 */
  install(engine: IEngine, options?: any): void | Promise<void>
  /** 插件卸载方法 */
  uninstall?(engine: IEngine): void | Promise<void>
}

/**
 * 引擎接口
 */
export interface IEngine {
  /** 引擎版本 */
  version: string
  /** Vue应用实例 */
  app?: App
  /** 事件总线 */
  eventBus: IEventBus
  /** 生命周期管理器 */
  lifecycle: ILifecycle
  /** 安装插件 */
  use(plugin: IPlugin | PluginInstaller, options?: any): Promise<this>
  /** 卸载插件 */
  unuse(pluginName: string): Promise<this>
  /** 获取插件 */
  getPlugin(name: string): IPlugin | undefined
  /** 获取所有插件 */
  getPlugins(): IPlugin[]
  /** 启动引擎 */
  start(): Promise<void>
  /** 停止引擎 */
  stop(): Promise<void>
  /** 销毁引擎 */
  destroy(): Promise<void>
}

/**
 * 事件总线接口
 */
export interface IEventBus {
  /** 监听事件 */
  on(event: string, handler: EventHandler): void
  /** 监听一次事件 */
  once(event: string, handler: EventHandler): void
  /** 取消监听事件 */
  off(event: string, handler?: EventHandler): void
  /** 触发事件 */
  emit(event: string, ...args: any[]): void
  /** 清空所有事件监听器 */
  clear(): void
}

/**
 * 生命周期接口
 */
export interface ILifecycle {
  /** 注册生命周期钩子 */
  hook(phase: LifecyclePhase, handler: LifecycleHandler): void
  /** 执行生命周期钩子 */
  execute(phase: LifecyclePhase, ...args: any[]): Promise<void>
  /** 获取当前阶段 */
  getCurrentPhase(): LifecyclePhase | null
}

/**
 * 事件处理器类型
 */
export type EventHandler = (...args: any[]) => void

/**
 * 生命周期处理器类型
 */
export type LifecycleHandler = (...args: any[]) => void | Promise<void>

/**
 * 插件安装器类型
 */
export type PluginInstaller = (engine: IEngine, options?: any) => void | Promise<void>

/**
 * 生命周期阶段
 */
export enum LifecyclePhase {
  BEFORE_START = 'before:start',
  STARTING = 'starting',
  STARTED = 'started',
  BEFORE_STOP = 'before:stop',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  BEFORE_DESTROY = 'before:destroy',
  DESTROYING = 'destroying',
  DESTROYED = 'destroyed'
}

/**
 * 引擎配置
 */
export interface EngineConfig {
  /** 是否启用调试模式 */
  debug?: boolean
  /** 插件配置 */
  plugins?: PluginConfig[]
  /** 自定义配置 */
  [key: string]: any
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 插件实例或安装器 */
  plugin: IPlugin | PluginInstaller
  /** 插件选项 */
  options?: any
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 引擎状态
 */
export enum EngineState {
  IDLE = 'idle',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  DESTROYED = 'destroyed'
}