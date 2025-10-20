/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
  stack?: string;
}

/**
 * 日志处理函数类型
 */
export type LogHandler = (entry: LogEntry) => void;

/**
 * Logger - 日志管理器
 * 提供统一的日志记录和错误处理
 */
export class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.WARN;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private handlers: Set<LogHandler> = new Set();
  private enabled = true;

  private constructor() {
    // 单例模式
  }

  /**
   * 获取Logger实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 启用日志
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用日志
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 添加日志处理函数
   */
  addHandler(handler: LogHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * 移除所有处理函数
   */
  removeAllHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Debug 日志
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info 日志
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warn 日志
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error 日志
   */
  error(message: string, error?: Error | any): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.ERROR, message, error, stack);
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    if (!this.enabled || level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
      stack
    };

    // 添加到日志列表
    this.logs.push(entry);

    // 保持日志数量限制
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 调用所有处理函数
    this.handlers.forEach((handler) => {
      try {
        handler(entry);
      } catch (error) {
        console.error('Error in log handler:', error);
      }
    });

    // 默认控制台输出
    this.consoleOutput(entry);
  }

  /**
   * 控制台输出
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data || '');
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  /**
   * 获取日志历史
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = level !== undefined
      ? this.logs.filter((log) => log.level === level)
      : this.logs;

    if (limit) {
      logs = logs.slice(-limit);
    }

    return logs;
  }

  /**
   * 清除日志历史
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 设置最大日志数量
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max);
    }
  }

  /**
   * 导出日志为JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 导出日志为文本
   */
  exportLogsAsText(): string {
    return this.logs
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = LogLevel[entry.level];
        const data = entry.data ? `\n  Data: ${JSON.stringify(entry.data)}` : '';
        const stack = entry.stack ? `\n  Stack: ${entry.stack}` : '';
        return `[${timestamp}] [${level}] ${entry.message}${data}${stack}`;
      })
      .join('\n');
  }

  /**
   * 下载日志文件
   */
  downloadLogs(filename = `map-logs-${Date.now()}.txt`): void {
    const content = this.exportLogsAsText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

/**
 * 错误类型
 */
export enum ErrorType {
  INITIALIZATION = 'INITIALIZATION',
  RENDERING = 'RENDERING',
  DATA_LOADING = 'DATA_LOADING',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

/**
 * MapError - 自定义地图错误类
 */
export class MapError extends Error {
  type: ErrorType;
  data?: any;
  timestamp: number;

  constructor(type: ErrorType, message: string, data?: any) {
    super(message);
    this.name = 'MapError';
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();

    // 维护堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MapError);
    }
  }

  /**
   * 转换为JSON
   */
  toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * 创建标准化的错误
 */
export function createMapError(
  type: ErrorType,
  message: string,
  data?: any
): MapError {
  const error = new MapError(type, message, data);
  Logger.getInstance().error(message, error);
  return error;
}

// 导出便捷的日志函数
const logger = Logger.getInstance();

export const debug = (message: string, data?: any) => logger.debug(message, data);
export const info = (message: string, data?: any) => logger.info(message, data);
export const warn = (message: string, data?: any) => logger.warn(message, data);
export const error = (message: string, err?: Error | any) => logger.error(message, err);

export default Logger;









