/**
 * 插件管理器实现
 * 负责插件的注册、实例化、生命周期管理和依赖解析
 */

import type {
  PluginManager as IPluginManager,
  IPlugin,
  IPlayer,
  PluginConfig,
  PluginMetadata,
  PluginConstructor,
  PluginOptions,
  PluginFilter,
  PluginSorter,
  PluginValidator,
  EventListener,
  PlayerEventMap
} from '../types';

import { EventManager } from './EventManager';

/**
 * 插件注册信息
 */
interface PluginRegistration {
  constructor: PluginConstructor;
  metadata: PluginMetadata;
  options: PluginOptions;
}

/**
 * 插件实例信息
 */
interface PluginInstance {
  plugin: IPlugin;
  config: PluginConfig;
  dependencies: string[];
  dependents: Set<string>;
}

/**
 * 插件管理器实现
 */
export class PluginManager implements IPluginManager {
  private readonly player: IPlayer;
  private readonly eventManager: EventManager;
  private readonly registrations: Map<string, PluginRegistration>;
  private readonly instances: Map<string, PluginInstance>;
  private readonly validators: PluginValidator[];
  private readonly middlewares: Array<(name: string, plugin: IPlugin, next: () => void) => void>;
  private filter?: PluginFilter;
  private sorter?: PluginSorter;

  constructor(player: IPlayer) {
    this.player = player;
    this.eventManager = new EventManager();
    this.registrations = new Map();
    this.instances = new Map();
    this.validators = [];
    this.middlewares = [];
  }

  // ==================== 插件注册 ====================

  register(name: string, plugin: PluginConstructor, options: PluginOptions = {}): void {
    // 验证插件
    for (const validator of this.validators) {
      const result = validator(name, plugin, options);
      if (result !== true) {
        throw new Error(`Plugin validation failed: ${result}`);
      }
    }

    // 创建元数据
    const metadata: PluginMetadata = {
      name,
      version: '1.0.0',
      type: 'ui' as any,
      ...options.metadata
    };

    // 注册插件
    this.registrations.set(name, {
      constructor: plugin,
      metadata,
      options
    });

    this.eventManager.emit('plugin:register' as any, { pluginName: name, plugin });
  }

  unregister(name: string): void {
    // 销毁实例
    if (this.instances.has(name)) {
      this.destroy(name);
    }

    // 移除注册
    this.registrations.delete(name);
    this.eventManager.emit('plugin:unregister' as any, { pluginName: name });
  }

  // ==================== 插件实例化 ====================

  create(name: string, config: PluginConfig = {}): IPlugin | null {
    const registration = this.registrations.get(name);
    if (!registration) {
      throw new Error(`Plugin ${name} is not registered`);
    }

    try {
      // 创建插件实例
      const plugin = new registration.constructor(
        this.player,
        { ...registration.options.config, ...config },
        registration.metadata
      );

      // 解析依赖
      const dependencies = this.resolveDependencies(name);

      // 创建实例信息
      const instanceInfo: PluginInstance = {
        plugin,
        config: { ...registration.options.config, ...config },
        dependencies,
        dependents: new Set()
      };

      // 添加依赖关系
      for (const depName of dependencies) {
        const depInstance = this.instances.get(depName);
        if (depInstance) {
          depInstance.dependents.add(name);
          plugin.addDependency(depName, depInstance.plugin);
        }
      }

      this.instances.set(name, instanceInfo);

      // 执行中间件
      this.executeMiddlewares(name, plugin);

      this.eventManager.emit('plugin:ready' as any, { pluginName: name, plugin });
      return plugin;

    } catch (error) {
      this.eventManager.emit('plugin:error' as any, { pluginName: name, error });
      throw error;
    }
  }

  destroy(name: string): void {
    const instanceInfo = this.instances.get(name);
    if (!instanceInfo) return;

    try {
      // 移除依赖关系
      for (const depName of instanceInfo.dependencies) {
        const depInstance = this.instances.get(depName);
        if (depInstance) {
          depInstance.dependents.delete(name);
        }
      }

      // 检查是否有其他插件依赖此插件
      if (instanceInfo.dependents.size > 0) {
        console.warn(`Plugin ${name} has dependents: ${Array.from(instanceInfo.dependents).join(', ')}`);
      }

      // 销毁插件
      instanceInfo.plugin.destroy();
      this.instances.delete(name);

    } catch (error) {
      this.eventManager.emit('plugin:error' as any, { pluginName: name, error });
      throw error;
    }
  }

  // ==================== 插件查询 ====================

  get<T extends IPlugin = IPlugin>(name: string): T | null {
    const instanceInfo = this.instances.get(name);
    return instanceInfo ? (instanceInfo.plugin as T) : null;
  }

  has(name: string): boolean {
    return this.instances.has(name);
  }

  list(): string[] {
    const plugins = Array.from(this.instances.keys());
    
    if (this.sorter) {
      const instances = plugins.map(name => this.instances.get(name)!.plugin);
      instances.sort(this.sorter);
      return instances.map(plugin => plugin.name);
    }
    
    return plugins;
  }

  // ==================== 插件状态管理 ====================

  enable(name: string): void {
    const plugin = this.get(name);
    if (plugin) {
      plugin.enable();
      this.eventManager.emit('plugin:enable' as any, { pluginName: name });
    }
  }

  disable(name: string): void {
    const plugin = this.get(name);
    if (plugin) {
      plugin.disable();
      this.eventManager.emit('plugin:disable' as any, { pluginName: name });
    }
  }

  enableAll(): void {
    for (const name of this.instances.keys()) {
      this.enable(name);
    }
  }

  disableAll(): void {
    for (const name of this.instances.keys()) {
      this.disable(name);
    }
  }

  // ==================== 插件生命周期管理 ====================

  async mount(name: string, container?: HTMLElement): Promise<void> {
    const plugin = this.get(name);
    if (plugin) {
      await plugin.mount(container);
    }
  }

  async unmount(name: string): Promise<void> {
    const plugin = this.get(name);
    if (plugin) {
      await plugin.unmount();
    }
  }

  async mountAll(container?: HTMLElement): Promise<void> {
    const plugins = this.getFilteredAndSortedPlugins();
    
    for (const plugin of plugins) {
      try {
        await plugin.mount(container);
      } catch (error) {
        console.error(`Failed to mount plugin ${plugin.name}:`, error);
      }
    }
  }

  async unmountAll(): Promise<void> {
    const plugins = this.getFilteredAndSortedPlugins().reverse();
    
    for (const plugin of plugins) {
      try {
        await plugin.unmount();
      } catch (error) {
        console.error(`Failed to unmount plugin ${plugin.name}:`, error);
      }
    }
  }

  // ==================== 依赖管理 ====================

  resolveDependencies(name: string): string[] {
    const registration = this.registrations.get(name);
    if (!registration || !registration.metadata.dependencies) {
      return [];
    }

    const dependencies: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const resolve = (pluginName: string): void => {
      if (visiting.has(pluginName)) {
        throw new Error(`Circular dependency detected: ${pluginName}`);
      }
      
      if (visited.has(pluginName)) {
        return;
      }

      visiting.add(pluginName);
      
      const pluginRegistration = this.registrations.get(pluginName);
      if (pluginRegistration && pluginRegistration.metadata.dependencies) {
        for (const dep of pluginRegistration.metadata.dependencies) {
          resolve(dep);
          if (!dependencies.includes(dep)) {
            dependencies.push(dep);
          }
        }
      }

      visiting.delete(pluginName);
      visited.add(pluginName);
    };

    for (const dep of registration.metadata.dependencies) {
      resolve(dep);
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
    }

    return dependencies;
  }

  checkDependencies(name: string): boolean {
    try {
      const dependencies = this.resolveDependencies(name);
      return dependencies.every(dep => this.instances.has(dep));
    } catch (error) {
      return false;
    }
  }

  // ==================== 配置管理 ====================

  updateConfig(name: string, config: Partial<PluginConfig>): void {
    const instanceInfo = this.instances.get(name);
    if (instanceInfo) {
      Object.assign(instanceInfo.config, config);
      instanceInfo.plugin.updateConfig(config);
    }
  }

  getConfig(name: string): PluginConfig | null {
    const instanceInfo = this.instances.get(name);
    return instanceInfo ? { ...instanceInfo.config } : null;
  }

  // ==================== 事件代理 ====================

  proxy<K extends keyof PlayerEventMap>(
    pluginName: string,
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    const plugin = this.get(pluginName);
    if (plugin) {
      plugin.on(event, listener);
    }
  }

  // ==================== 工具方法 ====================

  addValidator(validator: PluginValidator): void {
    this.validators.push(validator);
  }

  addMiddleware(middleware: (name: string, plugin: IPlugin, next: () => void) => void): void {
    this.middlewares.push(middleware);
  }

  setFilter(filter: PluginFilter): void {
    this.filter = filter;
  }

  setSorter(sorter: PluginSorter): void {
    this.sorter = sorter;
  }

  // ==================== 清理 ====================

  clear(): void {
    // 销毁所有实例
    for (const name of Array.from(this.instances.keys())) {
      this.destroy(name);
    }

    // 清理注册
    this.registrations.clear();
    this.validators.length = 0;
    this.middlewares.length = 0;
    this.filter = undefined;
    this.sorter = undefined;

    this.eventManager.clear();
  }

  // ==================== 事件系统 ====================

  on<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    this.eventManager.on(event, listener);
  }

  off<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    this.eventManager.off(event, listener);
  }

  once<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    this.eventManager.once(event, listener);
  }

  emit<K extends keyof PlayerEventMap>(
    event: K,
    data: PlayerEventMap[K]
  ): void {
    this.eventManager.emit(event, data);
  }

  removeAllListeners(event?: keyof PlayerEventMap): void {
    this.eventManager.removeAllListeners(event);
  }

  listenerCount(event: keyof PlayerEventMap): number {
    return this.eventManager.listenerCount(event);
  }

  listeners<K extends keyof PlayerEventMap>(
    event: K
  ): EventListener<PlayerEventMap[K]>[] {
    return this.eventManager.listeners(event);
  }

  // ==================== 私有方法 ====================

  private getFilteredAndSortedPlugins(): IPlugin[] {
    let plugins = Array.from(this.instances.values()).map(info => info.plugin);
    
    if (this.filter) {
      plugins = plugins.filter(this.filter);
    }
    
    if (this.sorter) {
      plugins.sort(this.sorter);
    }
    
    return plugins;
  }

  private executeMiddlewares(name: string, plugin: IPlugin): void {
    let index = 0;
    
    const next = (): void => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(name, plugin, next);
      }
    };
    
    next();
  }
}

/**
 * 创建插件管理器实例
 */
export function createPluginManager(player: IPlayer): PluginManager {
  return new PluginManager(player);
}
