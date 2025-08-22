/**
 * 工具函数模块
 * 提供常用的辅助函数和工具方法
 */

import { spawn, type SpawnOptions } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @fileoverview 工具函数统一导出
 * @author ViteLauncher Team
 * @since 1.0.0
 */

// 文件系统工具
export {
  exists,
  isDirectory,
  isFile,
  getFileInfo,
  ensureDir,
  readFile,
  writeFile,
  copyFile,
  copyDir,
  remove,
  searchFiles,
  getDirectorySize,
  readPackageJson,
  writePackageJson,
  formatFileSize,
  getRelativePath,
  normalizePath,
  isTextFile,
} from './file'

// 通用工具
export {
  deepClone,
  debounce,
  throttle,
  retry,
  sleep,
  generateRandomString,
  generateUUID,
  isValidEmail,
  isValidUrl,
  isValidPort,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  truncate,
  deepMerge,
  unique,
  chunk,
  flatten,
  intersection,
  union,
  difference,
  get,
  set,
  compose,
  pipe,
  memoize,
} from './common'

// 日志工具
export {
  Logger,
  logger,
  createProgressLogger,
  createTimer,
  createLogGroup,
  logTable,
  logObject,
  logFileOperation,
  logHttpRequest,
  logError,
} from './logger'

// 验证工具
export {
  validateProjectName,
  validateFrameworkType,
  validatePort,
  validatePath,
  createValidator,
  ValidationError,
} from './validation'

// 模板工具
export {
  TemplateEngine,
  renderTemplate,
  loadTemplate,
  createTemplateFromProject,
} from './template'

// 性能监控工具
export {
  PerformanceMonitor,
  measurePerformance,
  getSystemInfo,
  monitorMemoryUsage,
} from './performance'
