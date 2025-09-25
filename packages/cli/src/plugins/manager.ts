/**
 * 插件管理器 - 高级功能
 */

import { Plugin, CLIContext } from '../types/index';
import { EventEmitter } from 'events';

export interface PluginManagerEvents {
  'plugin:loading': (name: string) => void;
  'plugin:loaded': (plugin: Plugin) => void;
  'plugin:unloading': (name: string) => void;
  'plugin:unloaded': (name: string) => void;
  'plugin:error': (name: string, error: Error) => void;
}

export class AdvancedPluginManager extends EventEmitter {
  private context: CLIContext;
  private loadOrder: string[] = [];
  private dependencies: Map<string, string[]> = new Map();

  constructor(context: CLIContext) {
    super();
    this.context = context;
  }

  /**
   * 分析插件依赖关系
   */
  analyzeDependencies(plugins: Plugin[]): void {
    this.dependencies.clear();
    
    for (const plugin of plugins) {
      const deps = this.extractDependencies(plugin);
      this.dependencies.set(plugin.name, deps);
    }
  }

  /**
   * 提取插件依赖
   */
  private extractDependencies(plugin: Plugin): string[] {
    const deps: string[] = [];
    
    // 从插件元数据中提取依赖
    if ((plugin as any).dependencies) {
      deps.push(...(plugin as any).dependencies);
    }
    
    // 从插件配置中提取依赖
    if ((plugin as any).peerDependencies) {
      deps.push(...(plugin as any).peerDependencies);
    }
    
    return deps;
  }

  /**
   * 计算加载顺序
   */
  calculateLoadOrder(pluginNames: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`检测到循环依赖: ${name}`);
      }
      
      if (visited.has(name)) {
        return;
      }

      visiting.add(name);
      
      const deps = this.dependencies.get(name) || [];
      for (const dep of deps) {
        if (pluginNames.includes(dep)) {
          visit(dep);
        }
      }
      
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of pluginNames) {
      visit(name);
    }

    this.loadOrder = order;
    return order;
  }

  /**
   * 验证插件兼容性
   */
  validateCompatibility(plugin: Plugin): boolean {
    // 检查版本兼容性
    if ((plugin as any).engines) {
      const engines = (plugin as any).engines;
      
      if (engines.node) {
        const nodeVersion = process.version;
        if (!this.satisfiesVersion(nodeVersion, engines.node)) {
          this.context.logger.error(`插件 ${plugin.name} 需要 Node.js ${engines.node}，当前版本 ${nodeVersion}`);
          return false;
        }
      }
      
      if (engines.ldesign) {
        // 检查 CLI 版本兼容性
        const cliVersion = '1.0.0'; // 从 package.json 获取
        if (!this.satisfiesVersion(cliVersion, engines.ldesign)) {
          this.context.logger.error(`插件 ${plugin.name} 需要 LDesign CLI ${engines.ldesign}，当前版本 ${cliVersion}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查版本是否满足要求
   */
  private satisfiesVersion(current: string, required: string): boolean {
    // 简单的版本检查，实际应该使用 semver 库
    return true; // 暂时返回 true
  }

  /**
   * 创建插件沙箱
   */
  createSandbox(plugin: Plugin): any {
    // 为插件创建隔离的执行环境
    const sandbox = {
      // 提供安全的 API
      console: {
        log: (...args: any[]) => this.context.logger.info(`[${plugin.name}]`, ...args),
        warn: (...args: any[]) => this.context.logger.warn(`[${plugin.name}]`, ...args),
        error: (...args: any[]) => this.context.logger.error(`[${plugin.name}]`, ...args)
      },
      
      // 提供插件 API
      api: {
        registerCommand: (command: any) => {
          // 注册命令的安全包装
        },
        registerMiddleware: (middleware: any) => {
          // 注册中间件的安全包装
        }
      }
    };

    return sandbox;
  }

  /**
   * 监控插件性能
   */
  monitorPerformance(plugin: Plugin, operation: string, fn: () => Promise<any>): Promise<any> {
    const start = Date.now();
    
    return fn().finally(() => {
      const duration = Date.now() - start;
      this.context.logger.debug(`插件 ${plugin.name} ${operation} 耗时: ${duration}ms`);
      
      // 如果耗时过长，发出警告
      if (duration > 5000) {
        this.context.logger.warn(`插件 ${plugin.name} ${operation} 耗时过长: ${duration}ms`);
      }
    });
  }

  /**
   * 插件热重载
   */
  async hotReload(pluginName: string): Promise<void> {
    this.emit('plugin:unloading', pluginName);
    
    try {
      // 清除模块缓存
      this.clearModuleCache(pluginName);
      
      // 重新加载插件
      const config = this.context.config.plugins?.find(p => 
        typeof p === 'string' ? p === pluginName : p.name === pluginName
      );
      
      if (config) {
        // 这里需要调用 PluginManager 的 loadPlugin 方法
        this.context.logger.info(`热重载插件: ${pluginName}`);
        this.emit('plugin:loaded', this.context.plugins.get(pluginName)!);
      }
    } catch (error) {
      this.emit('plugin:error', pluginName, error as Error);
      throw error;
    }
  }

  /**
   * 清除模块缓存
   */
  private clearModuleCache(pluginName: string): void {
    // 清除 Node.js 模块缓存
    const moduleId = require.resolve(pluginName);
    delete require.cache[moduleId];
  }

  /**
   * 获取插件统计信息
   */
  getStats(): any {
    const plugins = Array.from(this.context.plugins.values());
    
    return {
      total: plugins.length,
      loaded: plugins.filter(p => (p as any).loaded).length,
      failed: plugins.filter(p => (p as any).failed).length,
      loadOrder: this.loadOrder,
      dependencies: Object.fromEntries(this.dependencies)
    };
  }
}
