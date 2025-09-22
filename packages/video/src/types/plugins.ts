/**
 * 插件系统类型定义
 * 提供完整的插件架构和生命周期管理类型支持
 */

import type { EventEmitter, EventListener, PlayerEventMap } from './events';
import type { IPlayer, PluginPosition } from './index';

// 插件生命周期阶段
export enum PluginLifecycle {
  CREATED = 'created',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  MOUNTING = 'mounting',
  MOUNTED = 'mounted',
  UPDATING = 'updating',
  UPDATED = 'updated',
  UNMOUNTING = 'unmounting',
  UNMOUNTED = 'unmounted',
  DESTROYED = 'destroyed',
  ERROR = 'error'
}

// 插件状态
export enum PluginState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error'
}

// 插件类型
export enum PluginType {
  CORE = 'core',           // 核心插件（播放控制等）
  UI = 'ui',               // UI 插件（控制栏、按钮等）
  FUNCTIONAL = 'functional', // 功能插件（弹幕、字幕等）
  ENHANCEMENT = 'enhancement', // 增强插件（截图、画中画等）
  THEME = 'theme',         // 主题插件
  MIDDLEWARE = 'middleware' // 中间件插件
}

// 插件优先级
export enum PluginPriority {
  HIGHEST = 1000,
  HIGH = 800,
  NORMAL = 500,
  LOW = 200,
  LOWEST = 100
}

// 插件元数据接口
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  type: PluginType;
  priority?: PluginPriority;
  dependencies?: string[];
  peerDependencies?: string[];
  conflicts?: string[];
}

// 插件配置接口
export interface PluginConfig {
  // 基础配置
  enabled?: boolean;
  position?: PluginPosition;
  order?: number;
  lazy?: boolean;
  
  // 样式配置
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  
  // 行为配置
  autoHide?: boolean;
  hideDelay?: number;
  clickThrough?: boolean;
  
  // 响应式配置
  responsive?: boolean;
  breakpoints?: Record<string, any>;
  
  // 国际化配置
  i18n?: Record<string, any>;
  
  // 自定义配置
  [key: string]: any;
}

// 插件选项接口
export interface PluginOptions {
  config?: PluginConfig;
  metadata?: Partial<PluginMetadata>;
  container?: HTMLElement;
  template?: string | (() => string);
  styles?: string | (() => string);
}

// 插件上下文接口
export interface PluginContext {
  player: IPlayer;
  config: PluginConfig;
  metadata: PluginMetadata;
  container?: HTMLElement;
  element?: HTMLElement;
  state: PluginState;
  lifecycle: PluginLifecycle;
  dependencies: Map<string, IPlugin>;
}

// 插件生命周期钩子接口
export interface PluginLifecycleHooks {
  // 创建前
  beforeCreate?(context: PluginContext): void | Promise<void>;
  
  // 创建后
  created?(context: PluginContext): void | Promise<void>;
  
  // 初始化前
  beforeInit?(context: PluginContext): void | Promise<void>;
  
  // 初始化后
  initialized?(context: PluginContext): void | Promise<void>;
  
  // 挂载前
  beforeMount?(context: PluginContext): void | Promise<void>;
  
  // 挂载后
  mounted?(context: PluginContext): void | Promise<void>;
  
  // 更新前
  beforeUpdate?(context: PluginContext, changes: Partial<PluginConfig>): void | Promise<void>;
  
  // 更新后
  updated?(context: PluginContext, changes: Partial<PluginConfig>): void | Promise<void>;
  
  // 卸载前
  beforeUnmount?(context: PluginContext): void | Promise<void>;
  
  // 卸载后
  unmounted?(context: PluginContext): void | Promise<void>;
  
  // 销毁前
  beforeDestroy?(context: PluginContext): void | Promise<void>;
  
  // 销毁后
  destroyed?(context: PluginContext): void | Promise<void>;
  
  // 错误处理
  errorCaptured?(context: PluginContext, error: Error): boolean | void;
}

// 插件基础接口
export interface IPlugin extends EventEmitter, PluginLifecycleHooks {
  // 基础属性
  readonly name: string;
  readonly version: string;
  readonly type: PluginType;
  readonly metadata: PluginMetadata;
  readonly config: PluginConfig;
  readonly player: IPlayer;
  readonly context: PluginContext;
  
  // 状态属性
  readonly state: PluginState;
  readonly lifecycle: PluginLifecycle;
  readonly isEnabled: boolean;
  readonly isVisible: boolean;
  readonly isReady: boolean;
  
  // DOM 属性
  readonly element?: HTMLElement;
  readonly container?: HTMLElement;
  
  // 生命周期方法
  init(): void | Promise<void>;
  mount(container?: HTMLElement): void | Promise<void>;
  unmount(): void | Promise<void>;
  destroy(): void | Promise<void>;
  
  // 状态控制方法
  enable(): void;
  disable(): void;
  show(): void;
  hide(): void;
  toggle(): void;
  
  // 配置方法
  updateConfig(config: Partial<PluginConfig>): void;
  getConfig<T = any>(key?: string): T;
  setConfig<T = any>(key: string, value: T): void;
  
  // 依赖管理
  addDependency(name: string, plugin: IPlugin): void;
  removeDependency(name: string): void;
  getDependency<T extends IPlugin = IPlugin>(name: string): T | null;
  
  // 渲染方法
  render?(): string | HTMLElement | void;
  update?(): void;
  
  // 样式方法
  addClass(className: string): void;
  removeClass(className: string): void;
  hasClass(className: string): boolean;
  setStyle(property: string, value: string): void;
  setStyle(styles: Partial<CSSStyleDeclaration>): void;
  
  // 事件方法
  bindEvents?(): void;
  unbindEvents?(): void;
}

// 插件管理器接口
export interface PluginManager extends EventEmitter {
  // 插件注册
  register(name: string, plugin: PluginConstructor, options?: PluginOptions): void;
  unregister(name: string): void;
  
  // 插件实例化
  create(name: string, config?: PluginConfig): IPlugin | null;
  destroy(name: string): void;
  
  // 插件查询
  get<T extends IPlugin = IPlugin>(name: string): T | null;
  has(name: string): boolean;
  list(): string[];
  
  // 插件状态管理
  enable(name: string): void;
  disable(name: string): void;
  enableAll(): void;
  disableAll(): void;
  
  // 插件生命周期管理
  mount(name: string, container?: HTMLElement): Promise<void>;
  unmount(name: string): Promise<void>;
  mountAll(container?: HTMLElement): Promise<void>;
  unmountAll(): Promise<void>;
  
  // 依赖管理
  resolveDependencies(name: string): string[];
  checkDependencies(name: string): boolean;
  
  // 配置管理
  updateConfig(name: string, config: Partial<PluginConfig>): void;
  getConfig(name: string): PluginConfig | null;
  
  // 事件代理
  proxy<K extends keyof PlayerEventMap>(
    pluginName: string,
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void;
  
  // 清理
  clear(): void;
}

// 插件构造函数类型
export type PluginConstructor = new (
  player: IPlayer,
  config: PluginConfig,
  metadata: PluginMetadata
) => IPlugin;

// 插件工厂函数类型
export type PluginFactory = (
  player: IPlayer,
  config: PluginConfig,
  metadata: PluginMetadata
) => IPlugin;

// 插件装饰器类型
export type PluginDecorator = <T extends PluginConstructor>(
  target: T
) => T;

// 插件中间件类型
export type PluginMiddleware = (
  context: PluginContext,
  next: () => void | Promise<void>
) => void | Promise<void>;

// 插件过滤器类型
export type PluginFilter = (plugin: IPlugin) => boolean;

// 插件排序器类型
export type PluginSorter = (a: IPlugin, b: IPlugin) => number;

// 插件验证器类型
export type PluginValidator = (
  name: string,
  plugin: PluginConstructor,
  options?: PluginOptions
) => boolean | string;

// 插件加载器接口
export interface PluginLoader {
  // 加载插件
  load(url: string): Promise<PluginConstructor>;
  
  // 预加载插件
  preload(urls: string[]): Promise<PluginConstructor[]>;
  
  // 卸载插件
  unload(url: string): void;
  
  // 检查是否已加载
  isLoaded(url: string): boolean;
  
  // 获取加载状态
  getLoadStatus(url: string): 'loading' | 'loaded' | 'error' | 'unloaded';
}

// 插件注册表接口
export interface PluginRegistry {
  // 注册插件
  register(metadata: PluginMetadata, constructor: PluginConstructor): void;
  
  // 注销插件
  unregister(name: string): void;
  
  // 查找插件
  find(name: string): { metadata: PluginMetadata; constructor: PluginConstructor } | null;
  
  // 列出所有插件
  list(): PluginMetadata[];
  
  // 按类型查找
  findByType(type: PluginType): PluginMetadata[];
  
  // 搜索插件
  search(query: string): PluginMetadata[];
  
  // 检查兼容性
  checkCompatibility(name: string, version: string): boolean;
}
