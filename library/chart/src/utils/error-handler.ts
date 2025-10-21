/**
 * 统一错误处理系统 - 详细错误信息、恢复建议、优雅降级
 */

/**
 * 错误级别
 */
export enum ErrorLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 错误类型
 */
export enum ErrorType {
  INITIALIZATION = 'initialization',
  CONFIGURATION = 'configuration',
  DATA_PARSING = 'data_parsing',
  RENDERING = 'rendering',
  MEMORY = 'memory',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * 图表错误
 */
export class ChartError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public level: ErrorLevel = ErrorLevel.ERROR,
    public code?: string,
    public details?: any,
    public recoverable = true
  ) {
    super(message);
    this.name = 'ChartError';

    // 保持正确的堆栈追踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChartError);
    }
  }

  /**
   * 获取恢复建议
   */
  getRecoverySuggestion(): string {
    switch (this.type) {
      case ErrorType.INITIALIZATION:
        return '请检查容器是否存在且可见，ECharts 模块是否正确加载';
      case ErrorType.CONFIGURATION:
        return '请检查配置参数是否正确，参考文档中的配置示例';
      case ErrorType.DATA_PARSING:
        return '请检查数据格式是否正确，确保数据符合预期结构';
      case ErrorType.RENDERING:
        return '请尝试减少数据量，或启用虚拟渲染模式';
      case ErrorType.MEMORY:
        return '请尝试清理不使用的图表实例，或减少缓存大小';
      case ErrorType.NETWORK:
        return '请检查网络连接，或使用本地数据源';
      default:
        return '请查看详细错误信息并参考文档';
    }
  }

  /**
   * 转换为JSON
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      level: this.level,
      code: this.code,
      details: this.details,
      recoverable: this.recoverable,
      stack: this.stack,
      suggestion: this.getRecoverySuggestion(),
    };
  }
}

/**
 * 错误记录
 */
interface ErrorLog {
  timestamp: number;
  error: ChartError;
  context?: any;
}

/**
 * 错误处理器配置
 */
interface ErrorHandlerConfig {
  enableConsoleLog?: boolean;
  enableCollection?: boolean;
  maxLogs?: number;
  onError?: (error: ChartError, context?: any) => void;
  production?: boolean;
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private logs: ErrorLog[] = [];
  private config: Required<ErrorHandlerConfig>;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableConsoleLog: config.enableConsoleLog ?? true,
      enableCollection: config.enableCollection ?? true,
      maxLogs: config.maxLogs ?? 100,
      onError: config.onError ?? (() => { }),
      production: config.production ?? process.env.NODE_ENV === 'production',
    };
  }

  /**
   * 处理错误
   */
  handle(error: Error | ChartError, context?: any): void {
    const chartError = error instanceof ChartError
      ? error
      : this.wrapError(error);

    // 记录错误
    if (this.config.enableCollection) {
      this.logError(chartError, context);
    }

    // 控制台输出
    if (this.config.enableConsoleLog) {
      this.consoleLog(chartError, context);
    }

    // 触发回调
    try {
      this.config.onError(chartError, context);
    } catch (callbackError) {
      console.error('Error callback failed:', callbackError);
    }
  }

  /**
   * 包装普通错误为 ChartError
   */
  private wrapError(error: Error): ChartError {
    return new ChartError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorLevel.ERROR,
      undefined,
      { originalError: error }
    );
  }

  /**
   * 记录错误
   */
  private logError(error: ChartError, context?: any): void {
    this.logs.push({
      timestamp: Date.now(),
      error,
      context,
    });

    // 限制日志数量
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * 控制台输出
   */
  private consoleLog(error: ChartError, context?: any): void {
    const message = `[${error.type}] ${error.message}`;
    const suggestion = error.getRecoverySuggestion();

    switch (error.level) {
      case ErrorLevel.INFO:
        console.info(message, { context, suggestion });
        break;
      case ErrorLevel.WARN:
        console.warn(message, { context, suggestion });
        break;
      case ErrorLevel.ERROR:
        console.error(message, { context, suggestion });
        break;
      case ErrorLevel.FATAL:
        console.error('FATAL:', message, { context, suggestion, stack: error.stack });
        break;
    }

    // 开发模式下输出完整错误
    if (!this.config.production) {
      console.debug('Error details:', error.toJSON());
    }
  }

  /**
   * 获取错误日志
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * 清除错误日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 获取错误统计
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byLevel: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    for (const log of this.logs) {
      const { type, level } = log.error;
      byType[type] = (byType[type] || 0) + 1;
      byLevel[level] = (byLevel[level] || 0) + 1;
    }

    return {
      total: this.logs.length,
      byType,
      byLevel,
    };
  }

  /**
   * 尝试恢复
   */
  tryRecover(
    fn: () => any,
    fallback: () => any,
    context?: any
  ): any {
    try {
      return fn();
    } catch (error) {
      this.handle(error as Error, context);
      return fallback();
    }
  }

  /**
   * 异步尝试恢复
   */
  async tryRecoverAsync(
    fn: () => Promise<any>,
    fallback: () => Promise<any>,
    context?: any
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return await fallback();
    }
  }

  /**
   * 创建错误
   */
  static createError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    level: ErrorLevel = ErrorLevel.ERROR,
    details?: any
  ): ChartError {
    return new ChartError(message, type, level, undefined, details);
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures: Array<{ name: string; duration: number; timestamp: number }> = [];
  private maxMeasures = 100;

  /**
   * 标记开始
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * 测量耗时
   */
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (startTime === undefined) {
      console.warn(`Performance mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;

    this.measures.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // 限制记录数量
    if (this.measures.length > this.maxMeasures) {
      this.measures.shift();
    }

    // 清除标记
    this.marks.delete(startMark);

    return duration;
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    measures: typeof this.measures;
    average: number;
    slowest: typeof this.measures[0] | null;
  } {
    if (this.measures.length === 0) {
      return {
        measures: [],
        average: 0,
        slowest: null,
      };
    }

    const total = this.measures.reduce((sum, m) => sum + m.duration, 0);
    const average = total / this.measures.length;
    const slowest = this.measures.reduce((a, b) =>
      a.duration > b.duration ? a : b
    );

    return {
      measures: [...this.measures],
      average,
      slowest,
    };
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

// 全局实例
export const errorHandler = new ErrorHandler();
export const performanceMonitor = new PerformanceMonitor();

