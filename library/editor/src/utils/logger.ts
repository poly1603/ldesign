/**
 * Logger Utility
 * 
 * A configurable logging utility for the editor.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
}

/**
 * Logger class
 */
export class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: LogLevel.WARN,
      prefix: 'ERE',
      timestamp: true,
      colors: true,
      ...options,
    };
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.options.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.options.level;
  }

  /**
   * Debug log
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Info log
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Warning log
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Error log
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Log with specific level
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.options.level) {
      return;
    }

    const parts: string[] = [];

    // Add timestamp
    if (this.options.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Add prefix
    if (this.options.prefix) {
      parts.push(`[${this.options.prefix}]`);
    }

    // Add level
    parts.push(`[${LogLevel[level]}]`);

    // Add message
    parts.push(message);

    const logMessage = parts.join(' ');

    // Choose console method and color
    switch (level) {
      case LogLevel.DEBUG:
        if (this.options.colors) {
          console.debug(`%c${logMessage}`, 'color: #6b7280', ...args);
        } else {
          console.debug(logMessage, ...args);
        }
        break;

      case LogLevel.INFO:
        if (this.options.colors) {
          console.info(`%c${logMessage}`, 'color: #3b82f6', ...args);
        } else {
          console.info(logMessage, ...args);
        }
        break;

      case LogLevel.WARN:
        if (this.options.colors) {
          console.warn(`%c${logMessage}`, 'color: #f59e0b', ...args);
        } else {
          console.warn(logMessage, ...args);
        }
        break;

      case LogLevel.ERROR:
        if (this.options.colors) {
          console.error(`%c${logMessage}`, 'color: #ef4444', ...args);
        } else {
          console.error(logMessage, ...args);
        }
        break;
    }
  }

  /**
   * Create a child logger with additional prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix ? `${this.options.prefix}:${prefix}` : prefix,
    });
  }

  /**
   * Time a function execution
   */
  time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    this.debug(`Timer started: ${label}`);
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.debug(`Timer finished: ${label} (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Timer failed: ${label} (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  }

  /**
   * Time an async function execution
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`Async timer started: ${label}`);
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`Async timer finished: ${label} (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Async timer failed: ${label} (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  }
}

// Default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
});
