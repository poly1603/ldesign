/**
 * 插件基类实现
 * 提供插件的基础功能和生命周期管理
 */

import type {
  IPlugin,
  IPlayer,
  PluginConfig,
  PluginMetadata,
  PluginContext,
  PluginType,
  EventListener,
  PlayerEventMap
} from '../types';
import { PluginState, PluginLifecycle } from '../types';

/**
 * 插件基类
 * 所有插件都应该继承自这个基类
 */
export abstract class BasePlugin implements IPlugin {
  protected readonly _player: IPlayer;
  protected readonly _config: PluginConfig;
  protected readonly _metadata: PluginMetadata;
  protected readonly _context: PluginContext;
  protected _state: PluginState;
  protected _lifecycle: PluginLifecycle;
  protected _enabled: boolean;
  protected _visible: boolean;
  protected _ready: boolean;
  protected _element?: HTMLElement;
  protected _container?: HTMLElement;
  protected readonly _dependencies: Map<string, IPlugin>;
  protected readonly _eventListeners: Map<string, Set<EventListener>>;

  constructor(player: IPlayer, config: PluginConfig, metadata: PluginMetadata) {
    this._player = player;
    this._config = { ...config };
    this._metadata = { ...metadata };
    this._state = PluginState.INACTIVE;
    this._lifecycle = PluginLifecycle.CREATED;
    this._enabled = config.enabled !== false;
    this._visible = true;
    this._ready = false;
    this._dependencies = new Map();
    this._eventListeners = new Map();

    // 创建插件上下文
    this._context = {
      player: this._player,
      config: this._config,
      metadata: this._metadata,
      container: this._container,
      element: this._element,
      state: this._state,
      lifecycle: this._lifecycle,
      dependencies: this._dependencies
    };

    // 调用生命周期钩子
    this.callLifecycleHook('beforeCreate');
    this.callLifecycleHook('created');
  }

  // ==================== 基础属性 ====================

  get name(): string {
    return this._metadata.name;
  }

  get version(): string {
    return this._metadata.version;
  }

  get type(): PluginType {
    return this._metadata.type;
  }

  get metadata(): PluginMetadata {
    return { ...this._metadata };
  }

  get config(): PluginConfig {
    return { ...this._config };
  }

  get player(): IPlayer {
    return this._player;
  }

  get context(): PluginContext {
    return { ...this._context };
  }

  get state(): PluginState {
    return this._state;
  }

  get lifecycle(): PluginLifecycle {
    return this._lifecycle;
  }

  get isEnabled(): boolean {
    return this._enabled;
  }

  get isVisible(): boolean {
    return this._visible;
  }

  get isReady(): boolean {
    return this._ready;
  }

  get isInitialized(): boolean {
    return this._lifecycle === PluginLifecycle.INITIALIZED;
  }

  get element(): HTMLElement | undefined {
    return this._element;
  }

  get container(): HTMLElement | undefined {
    return this._container;
  }

  // ==================== 生命周期方法 ====================

  async init(): Promise<void> {
    if (this._lifecycle !== PluginLifecycle.CREATED) {
      throw new Error(`Cannot initialize plugin in ${this._lifecycle} state`);
    }

    try {
      this.setLifecycle(PluginLifecycle.INITIALIZING);
      await this.callLifecycleHook('beforeInit');

      // 执行初始化逻辑
      await this.onInit();

      this.setLifecycle(PluginLifecycle.INITIALIZED);
      await this.callLifecycleHook('initialized');

      this._ready = true;
      this.setState(PluginState.ACTIVE);

    } catch (error) {
      this.setLifecycle(PluginLifecycle.ERROR);
      this.setState(PluginState.ERROR);
      throw error;
    }
  }

  async mount(container?: HTMLElement): Promise<void> {
    if (this._lifecycle !== PluginLifecycle.INITIALIZED) {
      throw new Error(`Cannot mount plugin in ${this._lifecycle} state`);
    }

    try {
      this.setLifecycle(PluginLifecycle.MOUNTING);
      await this.callLifecycleHook('beforeMount');

      if (container) {
        this._container = container;
        this._context.container = container;
      }

      // 执行挂载逻辑
      await this.onMount();

      this.setLifecycle(PluginLifecycle.MOUNTED);
      await this.callLifecycleHook('mounted');

    } catch (error) {
      this.setLifecycle(PluginLifecycle.ERROR);
      this.setState(PluginState.ERROR);
      throw error;
    }
  }

  async unmount(): Promise<void> {
    if (this._lifecycle !== PluginLifecycle.MOUNTED) {
      return;
    }

    try {
      this.setLifecycle(PluginLifecycle.UNMOUNTING);
      await this.callLifecycleHook('beforeUnmount');

      // 执行卸载逻辑
      await this.onUnmount();

      this.setLifecycle(PluginLifecycle.UNMOUNTED);
      await this.callLifecycleHook('unmounted');

    } catch (error) {
      this.setLifecycle(PluginLifecycle.ERROR);
      this.setState(PluginState.ERROR);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this._lifecycle === PluginLifecycle.DESTROYED) {
      return;
    }

    try {
      await this.callLifecycleHook('beforeDestroy');

      // 卸载插件
      if (this._lifecycle === PluginLifecycle.MOUNTED) {
        await this.unmount();
      }

      // 执行销毁逻辑
      await this.onDestroy();

      // 清理事件监听器
      this.removeAllEventListeners();

      // 清理依赖
      this._dependencies.clear();

      // 移除DOM元素
      if (this._element && this._element.parentNode) {
        this._element.parentNode.removeChild(this._element);
      }

      this.setLifecycle(PluginLifecycle.DESTROYED);
      await this.callLifecycleHook('destroyed');

    } catch (error) {
      this.setLifecycle(PluginLifecycle.ERROR);
      this.setState(PluginState.ERROR);
      throw error;
    }
  }

  // ==================== 状态控制方法 ====================

  enable(): void {
    if (!this._enabled) {
      this._enabled = true;
      this.setState(PluginState.ACTIVE);
      this.onEnable();
    }
  }

  disable(): void {
    if (this._enabled) {
      this._enabled = false;
      this.setState(PluginState.DISABLED);
      this.onDisable();
    }
  }

  show(): void {
    if (!this._visible) {
      this._visible = true;
      this.onShow();
    }
  }

  hide(): void {
    if (this._visible) {
      this._visible = false;
      this.onHide();
    }
  }

  toggle(): void {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // ==================== 配置方法 ====================

  updateConfig(config: Partial<PluginConfig>): void {
    const oldConfig = { ...this._config };
    Object.assign(this._config, config);
    this._context.config = this._config;

    this.callLifecycleHook('beforeUpdate', config);
    this.onConfigUpdate(oldConfig, this._config);
    this.callLifecycleHook('updated', config);
  }

  getConfig<T = any>(key?: string): T {
    if (key) {
      return this._config[key] as T;
    }
    return this._config as T;
  }

  setConfig<T = any>(key: string, value: T): void {
    this.updateConfig({ [key]: value });
  }

  // ==================== 依赖管理 ====================

  addDependency(name: string, plugin: IPlugin): void {
    this._dependencies.set(name, plugin);
    this._context.dependencies = this._dependencies;
  }

  removeDependency(name: string): void {
    this._dependencies.delete(name);
    this._context.dependencies = this._dependencies;
  }

  getDependency<T extends IPlugin = IPlugin>(name: string): T | null {
    return (this._dependencies.get(name) as T) || null;
  }

  // ==================== 样式方法 ====================

  addClass(className: string): void {
    if (this._element) {
      this._element.classList.add(className);
    }
  }

  removeClass(className: string): void {
    if (this._element) {
      this._element.classList.remove(className);
    }
  }

  hasClass(className: string): boolean {
    return this._element ? this._element.classList.contains(className) : false;
  }

  setStyle(property: string, value: string): void;
  setStyle(styles: Partial<CSSStyleDeclaration>): void;
  setStyle(propertyOrStyles: string | Partial<CSSStyleDeclaration>, value?: string): void {
    if (!this._element) return;

    if (typeof propertyOrStyles === 'string' && value !== undefined) {
      (this._element.style as any)[propertyOrStyles] = value;
    } else if (typeof propertyOrStyles === 'object') {
      Object.assign(this._element.style, propertyOrStyles);
    }
  }

  // ==================== 事件方法 ====================

  on<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    const eventName = event as string;

    if (!this._eventListeners.has(eventName)) {
      this._eventListeners.set(eventName, new Set());
    }
    this._eventListeners.get(eventName)!.add(listener);

    this._player.on(event, listener);
  }

  off<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    const eventName = event as string;

    const listeners = this._eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this._eventListeners.delete(eventName);
      }
    }

    this._player.off(event, listener);
  }

  once<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    const wrappedListener = (data: PlayerEventMap[K]) => {
      this.off(event, wrappedListener as any);
      listener(data);
    };
    this.on(event, wrappedListener as any);
  }

  emit<K extends keyof PlayerEventMap>(
    event: K,
    data: PlayerEventMap[K]
  ): void {
    this._player.emit(event, ...([data] as Parameters<PlayerEventMap[K]>));
  }

  removeAllListeners(event?: keyof PlayerEventMap): void {
    if (event) {
      const eventName = event as string;
      const listeners = this._eventListeners.get(eventName);
      if (listeners) {
        for (const listener of listeners) {
          this._player.off(event, listener);
        }
        this._eventListeners.delete(eventName);
      }
    } else {
      for (const [eventName, listeners] of this._eventListeners) {
        for (const listener of listeners) {
          this._player.off(eventName as any, listener);
        }
      }
      this._eventListeners.clear();
    }
  }

  // ==================== 抽象方法 ====================

  protected abstract onInit(): void | Promise<void>;
  protected abstract onMount(): void | Promise<void>;
  protected abstract onUnmount(): void | Promise<void>;
  protected abstract onDestroy(): void | Promise<void>;

  // ==================== 可选的生命周期钩子 ====================

  protected onEnable(): void { }
  protected onDisable(): void { }
  protected onShow(): void { }
  protected onHide(): void { }
  protected onConfigUpdate(oldConfig: PluginConfig, newConfig: PluginConfig): void { }

  // ==================== 私有方法 ====================

  private setState(state: PluginState): void {
    this._state = state;
    this._context.state = state;
  }

  private setLifecycle(lifecycle: PluginLifecycle): void {
    this._lifecycle = lifecycle;
    this._context.lifecycle = lifecycle;
  }

  private async callLifecycleHook(hook: string, ...args: any[]): Promise<void> {
    const method = (this as any)[hook];
    if (typeof method === 'function') {
      try {
        await method.call(this, this._context, ...args);
      } catch (error) {
        console.error(`Error in ${hook} hook for plugin ${this.name}:`, error);
        if ((this as any).errorCaptured) {
          const handled = await (this as any).errorCaptured(this._context, error);
          if (!handled) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
  }

  private removeAllEventListeners(): void {
    this.removeAllListeners();
  }
}
