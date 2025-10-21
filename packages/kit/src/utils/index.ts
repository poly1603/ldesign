/**
 * 通用工具函数模块
 * 提供字符串、数组、对象、异步、数据结构等常用工具函数
 */

// 数组工具
export * from './array-utils'
export { ArrayUtils } from './array-utils'

// 异步工具
export * from './async-utils'
export { AsyncUtils } from './async-utils'

// Base64 工具
export * from './base64-utils'
export { Base64Utils } from './base64-utils'

// 颜色工具
export * from './color-utils'
export { ColorUtils } from './color-utils'

// 加密工具
export * from './crypto-utils'
export { CryptoUtils } from './crypto-utils'

// 数据结构工具
export * from './data-structure-utils'
export {
  Queue,
  Stack,
  Deque,
  PriorityQueue,
  LinkedList,
  TreeNode,
  BinaryTreeNode,
  LRUCache,
} from './data-structure-utils'

// 日期工具
export * from './date-utils'
export { DateUtils } from './date-utils'

// 装饰器工具
export {
  memoize,
  debounce,
  throttle,
  retry as retryDecorator,
  timeout as timeoutDecorator,
  log as logDecorator,
  measure,
  validate as validateDecorator,
  deprecated,
  readonly,
  singleton,
  bind,
  lock,
  conditional,
  transform,
  catchError,
  before,
  after,
  around,
  rateLimit,
} from './decorator-utils'

// 环境变量工具
export * from './env-utils'
export { EnvUtils } from './env-utils'

// 错误处理工具
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  FileSystemError as ErrorFileSystemError,
  NetworkError as ErrorNetworkError,
  DatabaseError as ErrorDatabaseError,
  BusinessError,
  ErrorUtils,
  ErrorCode,
  ErrorLevel,
  errorBoundary,
  retry as retryErrorHandler,
} from './error-utils'

export type {
  ErrorMetadata,
  ErrorHandler,
  ErrorFilter,
} from './error-utils'

// 文件工具
export * from './file-utils'
export { FileUtils } from './file-utils'

// 格式化工具
export * from './format-utils'
export { FormatUtils } from './format-utils'

// HTTP 工具
export * from './http-utils'
export { HttpUtils } from './http-utils'

// JSON 工具
export * from './json-utils'
export { JsonUtils } from './json-utils'

// 数字工具
export * from './number-utils'
export { NumberUtils } from './number-utils'

// 对象工具
export * from './object-utils'
export { ObjectUtils } from './object-utils'

// 路径工具
export * from './path-utils'
export { PathUtils } from './path-utils'

// Promise 工具
export * from './promise-utils'
export { PromiseUtils } from './promise-utils'

// 随机工具
export * from './random-utils'
export { RandomUtils } from './random-utils'

// 正则表达式工具
export * from './regex-utils'
export { RegexUtils, Patterns } from './regex-utils'

// 安全工具
export * from './security-utils'
export { SecurityUtils, HashUtils, TokenUtils } from './security-utils'

// 字符串工具
export * from './string-utils'
export { StringUtils } from './string-utils'

// 系统工具
export * from './system-utils'
export { SystemUtils } from './system-utils'

// 测试工具
export * from './test-utils'
export {
  Spy,
  SpyManager,
  Stub,
  StubManager,
  MockBuilder,
  TestDataGenerator,
  TimeUtils,
} from './test-utils'

// 树工具
export * from './tree-utils'
export { TreeUtils } from './tree-utils'

// URL 工具
export * from './url-utils'
export { UrlUtils } from './url-utils'

// 验证工具
export * from './validation-utils'
export { ValidationUtils } from './validation-utils'
