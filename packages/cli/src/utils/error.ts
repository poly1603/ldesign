/**
 * 错误处理工具
 */

import chalk from 'chalk';
import { Logger } from '../types/index';

/**
 * CLI 错误基类
 */
export class CLIError extends Error {
  public code: string;
  public exitCode: number;

  constructor(message: string, code = 'CLI_ERROR', exitCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.exitCode = exitCode;
  }
}

/**
 * 命令错误
 */
export class CommandError extends CLIError {
  constructor(message: string, command?: string) {
    super(message, 'COMMAND_ERROR');
    if (command) {
      this.message = `命令 "${command}" 执行失败: ${message}`;
    }
  }
}

/**
 * 配置错误
 */
export class ConfigError extends CLIError {
  constructor(message: string, path?: string) {
    super(message, 'CONFIG_ERROR');
    if (path) {
      this.message = `配置错误 (${path}): ${message}`;
    }
  }
}

/**
 * 插件错误
 */
export class PluginError extends CLIError {
  constructor(message: string, pluginName?: string) {
    super(message, 'PLUGIN_ERROR');
    if (pluginName) {
      this.message = `插件 "${pluginName}" 错误: ${message}`;
    }
  }
}

/**
 * 模板错误
 */
export class TemplateError extends CLIError {
  constructor(message: string, templateName?: string) {
    super(message, 'TEMPLATE_ERROR');
    if (templateName) {
      this.message = `模板 "${templateName}" 错误: ${message}`;
    }
  }
}

/**
 * 网络错误
 */
export class NetworkError extends CLIError {
  constructor(message: string, url?: string) {
    super(message, 'NETWORK_ERROR');
    if (url) {
      this.message = `网络请求失败 (${url}): ${message}`;
    }
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private logger: Logger;
  private debug: boolean;

  constructor(logger: Logger, debug = false) {
    this.logger = logger;
    this.debug = debug;
  }

  /**
   * 处理错误
   */
  handle(error: Error): void {
    if (error instanceof CLIError) {
      this.handleCLIError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  /**
   * 处理 CLI 错误
   */
  private handleCLIError(error: CLIError): void {
    this.logger.error(chalk.red('✖'), error.message);
    
    if (this.debug && error.stack) {
      this.logger.debug('\n堆栈跟踪:');
      this.logger.debug(error.stack);
    }
    
    this.showErrorHelp(error);
    process.exit(error.exitCode);
  }

  /**
   * 处理未知错误
   */
  private handleUnknownError(error: Error): void {
    this.logger.error(chalk.red('✖'), '发生未知错误:', error.message);
    
    if (this.debug && error.stack) {
      this.logger.debug('\n堆栈跟踪:');
      this.logger.debug(error.stack);
    }
    
    this.logger.info('\n如果问题持续存在，请报告此错误:');
    this.logger.info('https://github.com/ldesign/ldesign/issues');
    
    process.exit(1);
  }

  /**
   * 显示错误帮助
   */
  private showErrorHelp(error: CLIError): void {
    switch (error.code) {
      case 'COMMAND_ERROR':
        this.logger.info('\n💡 提示:');
        this.logger.info('  - 检查命令拼写是否正确');
        this.logger.info('  - 使用 --help 查看可用选项');
        this.logger.info('  - 确保所有必需参数都已提供');
        break;
        
      case 'CONFIG_ERROR':
        this.logger.info('\n💡 提示:');
        this.logger.info('  - 检查配置文件语法是否正确');
        this.logger.info('  - 确保所有必需字段都已设置');
        this.logger.info('  - 参考文档了解配置选项');
        break;
        
      case 'PLUGIN_ERROR':
        this.logger.info('\n💡 提示:');
        this.logger.info('  - 确保插件已正确安装');
        this.logger.info('  - 检查插件版本兼容性');
        this.logger.info('  - 查看插件文档了解配置要求');
        break;
        
      case 'NETWORK_ERROR':
        this.logger.info('\n💡 提示:');
        this.logger.info('  - 检查网络连接');
        this.logger.info('  - 确认代理设置是否正确');
        this.logger.info('  - 稍后重试');
        break;
    }
  }

  /**
   * 设置调试模式
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}

/**
 * 全局错误处理器
 */
export function setupGlobalErrorHandler(logger: Logger, debug = false): void {
  const errorHandler = new ErrorHandler(logger, debug);

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
    errorHandler.handle(error);
  });

  // 处理未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的 Promise 拒绝:', reason);
    if (reason instanceof Error) {
      errorHandler.handle(reason);
    } else {
      errorHandler.handle(new Error(String(reason)));
    }
  });

  // 处理警告
  process.on('warning', (warning) => {
    if (debug) {
      logger.warn('警告:', warning.message);
      if (warning.stack) {
        logger.debug(warning.stack);
      }
    }
  });
}

/**
 * 创建错误处理器
 */
export function createErrorHandler(logger: Logger, debug = false): ErrorHandler {
  return new ErrorHandler(logger, debug);
}

/**
 * 包装异步函数以处理错误
 */
export function wrapAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: ErrorHandler
): (...args: T) => Promise<R | void> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handle(error as Error);
    }
  };
}

/**
 * 断言函数
 */
export function assert(condition: any, message: string, ErrorClass = CLIError): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * 验证必需参数
 */
export function requireParam(value: any, name: string): void {
  assert(value !== undefined && value !== null, `缺少必需参数: ${name}`, CommandError);
}

/**
 * 验证文件存在
 */
export function requireFile(path: string): void {
  const fs = require('fs');
  assert(fs.existsSync(path), `文件不存在: ${path}`, CLIError);
}
