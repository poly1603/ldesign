/**
 * 日志工具
 */

import chalk from 'chalk';
import { Logger } from '../types/index';

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  prefix?: string;
  timestamp?: boolean;
}

export class ConsoleLogger implements Logger {
  private level: string;
  private prefix: string;
  private timestamp: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.prefix = options.prefix || 'ldesign';
    this.timestamp = options.timestamp || false;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message), ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.format('success', message), ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private format(level: string, message: string): string {
    let formatted = '';

    // 添加时间戳
    if (this.timestamp) {
      const now = new Date().toISOString();
      formatted += chalk.gray(`[${now}] `);
    }

    // 添加前缀
    formatted += chalk.blue(`[${this.prefix}] `);

    // 添加级别标识
    switch (level) {
      case 'debug':
        formatted += chalk.gray('[DEBUG] ');
        break;
      case 'info':
        formatted += chalk.cyan('[INFO] ');
        break;
      case 'warn':
        formatted += chalk.yellow('[WARN] ');
        break;
      case 'error':
        formatted += chalk.red('[ERROR] ');
        break;
      case 'success':
        formatted += chalk.green('[SUCCESS] ');
        break;
    }

    // 添加消息
    formatted += message;

    return formatted;
  }

  setLevel(level: string): void {
    this.level = level;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
}

/**
 * 创建默认日志器
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new ConsoleLogger(options);
}
