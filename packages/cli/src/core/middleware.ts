/**
 * 中间件管理器
 */

import { Middleware, MiddlewareConfig, CLIContext } from '../types/index';

export class MiddlewareManager {
  private context: CLIContext;
  private middleware: Middleware[] = [];

  constructor(context: CLIContext) {
    this.context = context;
  }

  /**
   * 注册中间件
   */
  async registerMiddleware(): Promise<void> {
    // 注册配置中的中间件
    const middlewareConfigs = this.context.config.middleware || [];
    
    for (const config of middlewareConfigs) {
      try {
        await this.registerFromConfig(config);
      } catch (error) {
        this.context.logger.error(`注册中间件失败: ${config.name}`, error);
      }
    }

    // 注册插件中的中间件
    for (const plugin of this.context.plugins.values()) {
      if (plugin.middleware) {
        for (const middleware of plugin.middleware) {
          this.register(middleware);
        }
      }
    }

    // 按优先级排序
    this.sortByPriority();
  }

  /**
   * 从配置注册中间件
   */
  private async registerFromConfig(config: MiddlewareConfig): Promise<void> {
    if (config.enabled === false) {
      this.context.logger.debug(`跳过已禁用的中间件: ${config.name}`);
      return;
    }

    // 这里可以实现从外部文件加载中间件的逻辑
    // 暂时跳过，因为主要是内置和插件中间件
    this.context.logger.debug(`配置中间件: ${config.name}`);
  }

  /**
   * 注册中间件
   */
  register(middleware: Middleware): void {
    if (!this.validateMiddleware(middleware)) {
      throw new Error(`中间件验证失败: ${(middleware as any)?.name || 'unknown'}`);
    }

    // 检查是否已存在
    const existing = this.middleware.find(m => m.name === middleware.name);
    if (existing) {
      this.context.logger.warn(`中间件已存在，将被替换: ${middleware.name}`);
      this.unregister(middleware.name);
    }

    this.middleware.push(middleware);
    this.context.logger.debug(`注册中间件: ${middleware.name}`);
  }

  /**
   * 移除中间件
   */
  unregister(name: string): boolean {
    const index = this.middleware.findIndex(m => m.name === name);
    if (index !== -1) {
      this.middleware.splice(index, 1);
      this.context.logger.debug(`移除中间件: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * 执行中间件链
   */
  async execute(finalHandler: () => Promise<void>): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middleware.length) {
        // 所有中间件都执行完毕，执行最终处理器
        await finalHandler();
        return;
      }

      const middleware = this.middleware[index++];
      
      try {
        await middleware.execute(this.context, next);
      } catch (error) {
        this.context.logger.error(`中间件执行失败: ${middleware.name}`, error);
        throw error;
      }
    };

    await next();
  }

  /**
   * 验证中间件
   */
  private validateMiddleware(middleware: any): middleware is Middleware {
    if (!middleware || typeof middleware !== 'object') {
      this.context.logger.error('中间件必须是一个对象');
      return false;
    }

    if (!middleware.name || typeof middleware.name !== 'string') {
      this.context.logger.error('中间件必须有一个有效的名称');
      return false;
    }

    if (!middleware.execute || typeof middleware.execute !== 'function') {
      this.context.logger.error(`中间件 ${middleware.name} 必须有一个有效的执行函数`);
      return false;
    }

    return true;
  }

  /**
   * 按优先级排序中间件
   */
  private sortByPriority(): void {
    this.middleware.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA; // 优先级高的先执行
    });
  }

  /**
   * 获取中间件
   */
  getMiddleware(name: string): Middleware | undefined {
    return this.middleware.find(m => m.name === name);
  }

  /**
   * 获取所有中间件
   */
  getAllMiddleware(): Middleware[] {
    return [...this.middleware];
  }

  /**
   * 清空所有中间件
   */
  clear(): void {
    this.middleware = [];
    this.context.logger.debug('清空所有中间件');
  }

  /**
   * 获取中间件数量
   */
  count(): number {
    return this.middleware.length;
  }

  /**
   * 检查中间件是否存在
   */
  has(name: string): boolean {
    return this.middleware.some(m => m.name === name);
  }
}
