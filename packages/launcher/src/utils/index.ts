/**
 * 工具函数模块入口
 * 导出所有工具类和便捷函数，保持向后兼容性
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

// 导入所有工具模块
export { FileUtils } from './file'
export { ProcessUtils, type ExecResult } from './process'
export { StringUtils } from './string'
export { ObjectUtils } from './object'
export { ValidationUtils, type ValidationResult, type ProjectNameValidationOptions } from './validation'

// 重新导出便捷函数，保持向后兼容
export {
  exists,
  isDirectory,
  isFile,
  ensureDir,
  readJson,
  writeJson,
  copyFile,
  copyDir,
  remove,
  getFileSize,
  findFiles,
} from './file'

export {
  exec,
  isCommandAvailable,
  getPackageManager,
  getNodeVersion,
  installDependencies,
  runScript,
  isPortInUse,
  findAvailablePort,
} from './process'

export {
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  formatBytes,
  formatTime,
  randomString,
  truncate,
  capitalize,
  trim,
  isEmpty,
  reverse,
  repeat,
  template,
  slugify,
} from './string'

export {
  deepMerge,
  deepClone,
  isObject,
  get,
  set,
  has,
  unset,
  getPaths,
  flatten,
  unflatten,
  filter,
  map,
} from './object'

export {
  validateProjectName,
  validatePort,
  validateUrl,
  validateEmail,
  validateSemVer,
  validatePath,
  validateJson,
  validateIp,
} from './validation'

/**
 * 日志工具类
 * 提供统一的日志输出格式和颜色化显示
 */
export class LoggerUtils {
  private static readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
  }

  /**
   * 输出信息日志
   * @param message 消息
   * @param prefix 前缀
   */
  static info(message: string, prefix = 'INFO'): void {
    console.log(`${this.colors.blue}[${prefix}]${this.colors.reset} ${message}`)
  }

  /**
   * 输出成功日志
   * @param message 消息
   * @param prefix 前缀
   */
  static success(message: string, prefix = 'SUCCESS'): void {
    console.log(`${this.colors.green}[${prefix}]${this.colors.reset} ${message}`)
  }

  /**
   * 输出警告日志
   * @param message 消息
   * @param prefix 前缀
   */
  static warn(message: string, prefix = 'WARN'): void {
    console.warn(`${this.colors.yellow}[${prefix}]${this.colors.reset} ${message}`)
  }

  /**
   * 输出错误日志
   * @param message 消息
   * @param prefix 前缀
   */
  static error(message: string, prefix = 'ERROR'): void {
    console.error(`${this.colors.red}[${prefix}]${this.colors.reset} ${message}`)
  }

  /**
   * 输出调试日志
   * @param message 消息
   * @param prefix 前缀
   */
  static debug(message: string, prefix = 'DEBUG'): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(`${this.colors.gray}[${prefix}]${this.colors.reset} ${message}`)
    }
  }
}

// 导出日志工具便捷函数
export const { info, success, warn, error, debug } = LoggerUtils