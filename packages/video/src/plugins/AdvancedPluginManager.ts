/**
 * 高级插件管理器
 * 基于 xgplayer 的设计理念，提供更强大的插件管理功能
 */

import type { IPlayer, IPlugin, PluginMetadata } from '../types';
import { EventManager } from '../core/EventManager';

/**
 * 插件依赖关系
 */
export interface PluginDependency {
  name: string;
  version?: string;
  optional?: boolean;
}

/**
 * 插件生命周期钩子
 */
export interface PluginLifecycleHooks {
  beforeInit?: () => Promise<void> | void;
  afterInit?: () => Promise<void> | void;
  beforeDestroy?: () => Promise<void> | void;
  afterDestroy?: () => Promise<void> | void;
  onPlayerReady?: () => Promise<void> | void;
  onPlayerError?: (error: Error) => Promise<void> | void;
}

/**
 * 扩展的插件元数据
 */
export interface ExtendedPluginMetadata extends PluginMetadata {
  dependencies?: PluginDependency[];
  conflicts?: string[];
  priority?: number;
  lazy?: boolean;
  hooks?: PluginLifecycleHooks;
}

/**
 * 插件注册信息
 */
export interface PluginRegistration {
  plugin: IPlugin;
  metadata: ExtendedPluginMetadata;
  initialized: boolean;
  enabled: boolean;
  loadTime?: number;
}

/**
 * 插件加载选项
 */
export interface PluginLoadOptions {
  force?: boolean;
  skipDependencyCheck?: boolean;
  timeout?: number;
}

/**
 * 高级插件管理器
 */
export class AdvancedPluginManager {
  private readonly player: IPlayer;
  private readonly eventManager: EventManager;
  private readonly plugins = new Map<string, PluginRegistration>();
  private readonly loadingQueue = new Set<string>();
  private readonly initializationOrder: string[] = [];

  constructor(player: IPlayer) {
    this.player = player;
    this.eventManager = new EventManager();
    this.setupPlayerEventListeners();
  }

  /**
   * 注册插件
   */
  register(plugin: IPlugin, metadata: ExtendedPluginMetadata): void {
    const name = metadata.name;
    
    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`);
    }

    // 检查冲突
    if (metadata.conflicts) {
      for (const conflictName of metadata.conflicts) {
        if (this.plugins.has(conflictName)) {
          throw new Error(`Plugin "${name}" conflicts with "${conflictName}"`);
        }
      }
    }

    const registration: PluginRegistration = {
      plugin,
      metadata,
      initialized: false,
      enabled: true
    };

    this.plugins.set(name, registration);
    this.eventManager.emit('plugin:registered', { name, metadata });
  }

  /**
   * 异步加载插件
   */
  async load(name: string, options: PluginLoadOptions = {}): Promise<void> {
    const registration = this.plugins.get(name);
    if (!registration) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    if (registration.initialized && !options.force) {
      return;
    }

    if (this.loadingQueue.has(name)) {
      // 等待正在加载的插件
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Plugin "${name}" loading timeout`));
        }, options.timeout || 10000);

        const checkLoaded = () => {
          if (!this.loadingQueue.has(name)) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loadingQueue.add(name);

    try {
      const startTime = performance.now();

      // 检查依赖
      if (!options.skipDependencyCheck) {
        await this.checkDependencies(registration.metadata);
      }

      // 执行生命周期钩子
      if (registration.metadata.hooks?.beforeInit) {
        await registration.metadata.hooks.beforeInit();
      }

      // 初始化插件
      await registration.plugin.init();
      registration.initialized = true;
      registration.loadTime = performance.now() - startTime;

      // 执行生命周期钩子
      if (registration.metadata.hooks?.afterInit) {
        await registration.metadata.hooks.afterInit();
      }

      this.initializationOrder.push(name);
      this.eventManager.emit('plugin:loaded', { name, loadTime: registration.loadTime });

    } catch (error) {
      this.eventManager.emit('plugin:error', { name, error });
      throw error;
    } finally {
      this.loadingQueue.delete(name);
    }
  }

  /**
   * 批量加载插件
   */
  async loadAll(names?: string[], options: PluginLoadOptions = {}): Promise<void> {
    const pluginNames = names || Array.from(this.plugins.keys());
    
    // 按优先级排序
    const sortedNames = pluginNames.sort((a, b) => {
      const priorityA = this.plugins.get(a)?.metadata.priority || 0;
      const priorityB = this.plugins.get(b)?.metadata.priority || 0;
      return priorityB - priorityA;
    });

    // 并行加载非依赖插件，串行加载有依赖的插件
    const loadPromises: Promise<void>[] = [];
    
    for (const name of sortedNames) {
      const registration = this.plugins.get(name);
      if (!registration) continue;

      if (registration.metadata.dependencies?.length) {
        // 有依赖的插件需要等待依赖加载完成
        await this.load(name, options);
      } else {
        // 无依赖的插件可以并行加载
        loadPromises.push(this.load(name, options));
      }
    }

    await Promise.all(loadPromises);
  }

  /**
   * 卸载插件
   */
  async unload(name: string): Promise<void> {
    const registration = this.plugins.get(name);
    if (!registration || !registration.initialized) {
      return;
    }

    try {
      // 执行生命周期钩子
      if (registration.metadata.hooks?.beforeDestroy) {
        await registration.metadata.hooks.beforeDestroy();
      }

      // 销毁插件
      await registration.plugin.destroy();
      registration.initialized = false;

      // 执行生命周期钩子
      if (registration.metadata.hooks?.afterDestroy) {
        await registration.metadata.hooks.afterDestroy();
      }

      // 从初始化顺序中移除
      const index = this.initializationOrder.indexOf(name);
      if (index > -1) {
        this.initializationOrder.splice(index, 1);
      }

      this.eventManager.emit('plugin:unloaded', { name });

    } catch (error) {
      this.eventManager.emit('plugin:error', { name, error });
      throw error;
    }
  }

  /**
   * 启用/禁用插件
   */
  setEnabled(name: string, enabled: boolean): void {
    const registration = this.plugins.get(name);
    if (!registration) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    registration.enabled = enabled;
    
    if (registration.plugin.setEnabled) {
      registration.plugin.setEnabled(enabled);
    }

    this.eventManager.emit('plugin:toggled', { name, enabled });
  }

  /**
   * 获取插件信息
   */
  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name)?.plugin;
  }

  /**
   * 获取插件注册信息
   */
  getRegistration(name: string): PluginRegistration | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有插件列表
   */
  getPlugins(): Map<string, PluginRegistration> {
    return new Map(this.plugins);
  }

  /**
   * 获取已初始化的插件列表
   */
  getInitializedPlugins(): string[] {
    return Array.from(this.plugins.entries())
      .filter(([, registration]) => registration.initialized)
      .map(([name]) => name);
  }

  /**
   * 获取插件性能统计
   */
  getPerformanceStats(): Record<string, { loadTime: number; initialized: boolean }> {
    const stats: Record<string, { loadTime: number; initialized: boolean }> = {};
    
    for (const [name, registration] of this.plugins) {
      stats[name] = {
        loadTime: registration.loadTime || 0,
        initialized: registration.initialized
      };
    }

    return stats;
  }

  /**
   * 检查插件依赖
   */
  private async checkDependencies(metadata: ExtendedPluginMetadata): Promise<void> {
    if (!metadata.dependencies) return;

    for (const dep of metadata.dependencies) {
      const depRegistration = this.plugins.get(dep.name);
      
      if (!depRegistration) {
        if (!dep.optional) {
          throw new Error(`Required dependency "${dep.name}" is not registered`);
        }
        continue;
      }

      if (!depRegistration.initialized) {
        await this.load(dep.name);
      }

      // 检查版本兼容性
      if (dep.version && depRegistration.metadata.version !== dep.version) {
        console.warn(`Dependency version mismatch: ${dep.name} requires ${dep.version}, but ${depRegistration.metadata.version} is loaded`);
      }
    }
  }

  /**
   * 设置播放器事件监听器
   */
  private setupPlayerEventListeners(): void {
    this.player.on('player:ready', async () => {
      // 触发所有插件的 onPlayerReady 钩子
      for (const [name, registration] of this.plugins) {
        if (registration.initialized && registration.metadata.hooks?.onPlayerReady) {
          try {
            await registration.metadata.hooks.onPlayerReady();
          } catch (error) {
            console.error(`Plugin "${name}" onPlayerReady hook failed:`, error);
          }
        }
      }
    });

    this.player.on('player:error', async (data: { error: Error }) => {
      // 触发所有插件的 onPlayerError 钩子
      for (const [name, registration] of this.plugins) {
        if (registration.initialized && registration.metadata.hooks?.onPlayerError) {
          try {
            await registration.metadata.hooks.onPlayerError(data.error);
          } catch (error) {
            console.error(`Plugin "${name}" onPlayerError hook failed:`, error);
          }
        }
      }
    });
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    // 按初始化顺序的逆序卸载插件
    const unloadPromises = this.initializationOrder
      .slice()
      .reverse()
      .map(name => this.unload(name));

    await Promise.all(unloadPromises);
    
    this.plugins.clear();
    this.loadingQueue.clear();
    this.initializationOrder.length = 0;
    this.eventManager.clear();
  }

  /**
   * 监听插件事件
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventManager.on(event, listener);
  }

  /**
   * 移除插件事件监听器
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventManager.off(event, listener);
  }
}
