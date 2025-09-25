/**
 * 插件管理器
 */

import createJiti from 'jiti';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginConfig, CLIContext } from '../types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PluginManager {
  private context: CLIContext;
  private jiti: any;

  constructor(context: CLIContext) {
    this.context = context;
    this.jiti = createJiti(__filename, {
      interopDefault: true,
      esmResolve: true
    });
  }

  /**
   * 加载所有插件
   */
  async loadPlugins(): Promise<void> {
    const pluginConfigs = this.context.config.plugins || [];

    for (const config of pluginConfigs) {
      try {
        // 如果是字符串，转换为插件配置对象
        const pluginConfig = typeof config === 'string'
          ? { name: config, enabled: true }
          : config;
        this.context.logger.debug(`正在加载插件: ${pluginConfig.name}`);
        await this.loadPlugin(pluginConfig);
        this.context.logger.debug(`插件加载成功: ${pluginConfig.name}`);
      } catch (error) {
        const configName = typeof config === 'string' ? config : config.name;
        this.context.logger.error(`加载插件失败: ${configName}`, error);
      }
    }
  }

  /**
   * 加载单个插件
   */
  async loadPlugin(config: PluginConfig): Promise<void> {
    if (config.enabled === false) {
      this.context.logger.debug(`跳过已禁用的插件: ${config.name}`);
      return;
    }

    try {
      const plugin = await this.resolvePlugin(config.name);
      
      if (!this.validatePlugin(plugin)) {
        throw new Error(`插件验证失败: ${config.name}`);
      }

      // 注册插件
      this.context.plugins.set(plugin.name, plugin);
      
      // 初始化插件
      if (plugin.init) {
        await plugin.init(this.context);
      }

      this.context.logger.debug(`插件加载成功: ${plugin.name}@${plugin.version}`);
    } catch (error) {
      this.context.logger.error(`插件加载失败: ${config.name}`, error);
      throw error;
    }
  }

  /**
   * 解析插件
   */
  private async resolvePlugin(name: string): Promise<Plugin> {
    let pluginPath: string;

    // 判断是否为本地路径
    if (name.startsWith('./') || name.startsWith('../') || name.startsWith('/')) {
      pluginPath = resolve(this.context.cwd, name);
    } else {
      // 尝试从 node_modules 解析
      try {
        pluginPath = require.resolve(name, { paths: [this.context.cwd] });
      } catch {
        // 如果解析失败，尝试添加常见前缀
        const prefixes = ['@ldesign/plugin-', 'ldesign-plugin-', ''];
        for (const prefix of prefixes) {
          try {
            pluginPath = require.resolve(`${prefix}${name}`, { paths: [this.context.cwd] });
            break;
          } catch {
            continue;
          }
        }
        
        if (!pluginPath!) {
          throw new Error(`无法解析插件: ${name}`);
        }
      }
    }

    // 使用 jiti 加载插件
    const pluginModule = await this.jiti.import(pluginPath);
    
    // 支持多种导出格式
    return pluginModule.default || pluginModule.plugin || pluginModule;
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: any): plugin is Plugin {
    if (!plugin || typeof plugin !== 'object') {
      this.context.logger.error('插件必须是一个对象');
      return false;
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      this.context.logger.error('插件必须有一个有效的名称');
      return false;
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      this.context.logger.error(`插件 ${plugin.name} 必须有一个有效的版本号`);
      return false;
    }

    return true;
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.context.plugins.get(name);
    
    if (!plugin) {
      this.context.logger.warn(`插件不存在: ${name}`);
      return;
    }

    try {
      // 调用插件销毁方法
      if (plugin.destroy) {
        await plugin.destroy(this.context);
      }

      // 从上下文中移除
      this.context.plugins.delete(name);
      
      this.context.logger.debug(`插件卸载成功: ${name}`);
    } catch (error) {
      this.context.logger.error(`插件卸载失败: ${name}`, error);
      throw error;
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): Plugin | undefined {
    return this.context.plugins.get(name);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.context.plugins.values());
  }

  /**
   * 重新加载插件
   */
  async reloadPlugin(name: string): Promise<void> {
    await this.unloadPlugin(name);
    
    const config = this.context.config.plugins?.find(p => p.name === name);
    if (config) {
      await this.loadPlugin(config);
    } else {
      throw new Error(`插件配置不存在: ${name}`);
    }
  }

  /**
   * 检查插件是否已加载
   */
  isLoaded(name: string): boolean {
    return this.context.plugins.has(name);
  }
}
