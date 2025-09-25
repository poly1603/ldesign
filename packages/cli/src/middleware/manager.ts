/**
 * 中间件管理器 - 高级功能
 */

import { Middleware, CLIContext } from '../types/index';
import { EventEmitter } from 'events';

export interface MiddlewareManagerEvents {
  'middleware:before': (name: string) => void;
  'middleware:after': (name: string, duration: number) => void;
  'middleware:error': (name: string, error: Error) => void;
  'middleware:skip': (name: string, reason: string) => void;
}

export class AdvancedMiddlewareManager extends EventEmitter {
  private context: CLIContext;
  private middleware: Middleware[] = [];
  private executionStats: Map<string, MiddlewareStats> = new Map();

  constructor(context: CLIContext) {
    super();
    this.context = context;
  }

  /**
   * 注册中间件
   */
  register(middleware: Middleware): void {
    if (!this.validateMiddleware(middleware)) {
      throw new Error(`中间件验证失败: ${middleware.name}`);
    }

    // 检查是否已存在
    const existing = this.middleware.find(m => m.name === middleware.name);
    if (existing) {
      this.context.logger.warn(`中间件已存在，将被替换: ${middleware.name}`);
      this.unregister(middleware.name);
    }

    this.middleware.push(middleware);
    this.sortByPriority();
    
    // 初始化统计信息
    this.executionStats.set(middleware.name, {
      executions: 0,
      totalDuration: 0,
      averageDuration: 0,
      errors: 0,
      lastExecution: null
    });

    this.context.logger.debug(`注册中间件: ${middleware.name}`);
  }

  /**
   * 条件执行中间件
   */
  async executeConditional(
    condition: (context: CLIContext) => boolean,
    finalHandler: () => Promise<void>
  ): Promise<void> {
    const applicableMiddleware = this.middleware.filter(mw => {
      // 检查中间件是否应该执行
      if ((mw as any).condition) {
        return (mw as any).condition(this.context);
      }
      return condition(this.context);
    });

    await this.executeMiddlewareChain(applicableMiddleware, finalHandler);
  }

  /**
   * 执行中间件链
   */
  private async executeMiddlewareChain(
    middleware: Middleware[],
    finalHandler: () => Promise<void>
  ): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= middleware.length) {
        await finalHandler();
        return;
      }

      const mw = middleware[index++];
      const stats = this.executionStats.get(mw.name)!;
      
      this.emit('middleware:before', mw.name);
      
      const start = Date.now();
      
      try {
        await this.executeWithTimeout(mw, next);
        
        const duration = Date.now() - start;
        this.updateStats(stats, duration, false);
        this.emit('middleware:after', mw.name, duration);
        
      } catch (error) {
        const duration = Date.now() - start;
        this.updateStats(stats, duration, true);
        this.emit('middleware:error', mw.name, error as Error);
        throw error;
      }
    };

    await next();
  }

  /**
   * 带超时的中间件执行
   */
  private async executeWithTimeout(
    middleware: Middleware,
    next: () => Promise<void>
  ): Promise<void> {
    const timeout = (middleware as any).timeout || 30000; // 默认 30 秒超时
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`中间件 ${middleware.name} 执行超时`));
      }, timeout);
    });

    const executionPromise = middleware.execute(this.context, next);

    await Promise.race([executionPromise, timeoutPromise]);
  }

  /**
   * 更新统计信息
   */
  private updateStats(stats: MiddlewareStats, duration: number, isError: boolean): void {
    stats.executions++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.executions;
    stats.lastExecution = new Date();
    
    if (isError) {
      stats.errors++;
    }
  }

  /**
   * 中间件缓存
   */
  private cache: Map<string, any> = new Map();

  /**
   * 缓存中间件结果
   */
  async executeWithCache(
    cacheKey: string,
    middleware: Middleware,
    next: () => Promise<void>
  ): Promise<void> {
    if (this.cache.has(cacheKey)) {
      this.context.logger.debug(`使用缓存结果: ${cacheKey}`);
      return this.cache.get(cacheKey);
    }

    const result = await middleware.execute(this.context, next);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  /**
   * 中间件分组执行
   */
  async executeGroup(groupName: string, finalHandler: () => Promise<void>): Promise<void> {
    const groupMiddleware = this.middleware.filter(mw => 
      (mw as any).group === groupName
    );

    if (groupMiddleware.length === 0) {
      this.context.logger.debug(`中间件组为空: ${groupName}`);
      await finalHandler();
      return;
    }

    await this.executeMiddlewareChain(groupMiddleware, finalHandler);
  }

  /**
   * 并行执行中间件
   */
  async executeParallel(finalHandler: () => Promise<void>): Promise<void> {
    const parallelMiddleware = this.middleware.filter(mw => 
      (mw as any).parallel === true
    );
    
    const sequentialMiddleware = this.middleware.filter(mw => 
      (mw as any).parallel !== true
    );

    // 并行执行标记为并行的中间件
    if (parallelMiddleware.length > 0) {
      await Promise.all(
        parallelMiddleware.map(mw => 
          mw.execute(this.context, async () => {})
        )
      );
    }

    // 顺序执行其他中间件
    await this.executeMiddlewareChain(sequentialMiddleware, finalHandler);
  }

  /**
   * 获取中间件统计信息
   */
  getStats(): MiddlewareStatsReport {
    const stats: MiddlewareStatsReport = {
      total: this.middleware.length,
      byName: {},
      summary: {
        totalExecutions: 0,
        totalDuration: 0,
        totalErrors: 0,
        averageDuration: 0
      }
    };

    for (const [name, stat] of this.executionStats) {
      stats.byName[name] = { ...stat };
      stats.summary.totalExecutions += stat.executions;
      stats.summary.totalDuration += stat.totalDuration;
      stats.summary.totalErrors += stat.errors;
    }

    if (stats.summary.totalExecutions > 0) {
      stats.summary.averageDuration = stats.summary.totalDuration / stats.summary.totalExecutions;
    }

    return stats;
  }

  /**
   * 清除统计信息
   */
  clearStats(): void {
    this.executionStats.clear();
    this.context.logger.debug('清除中间件统计信息');
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
      return priorityB - priorityA;
    });
  }

  /**
   * 移除中间件
   */
  unregister(name: string): boolean {
    const index = this.middleware.findIndex(m => m.name === name);
    if (index !== -1) {
      this.middleware.splice(index, 1);
      this.executionStats.delete(name);
      this.context.logger.debug(`移除中间件: ${name}`);
      return true;
    }
    return false;
  }
}

interface MiddlewareStats {
  executions: number;
  totalDuration: number;
  averageDuration: number;
  errors: number;
  lastExecution: Date | null;
}

interface MiddlewareStatsReport {
  total: number;
  byName: Record<string, MiddlewareStats>;
  summary: {
    totalExecutions: number;
    totalDuration: number;
    totalErrors: number;
    averageDuration: number;
  };
}
