/**
 * 工具函数类型定义
 * 包含通用工具函数、验证器等类型
 */

// 工具函数接口
export interface UtilityFunctions {
  // 类型检查
  isString: (value: unknown) => value is string
  isNumber: (value: unknown) => value is number
  isBoolean: (value: unknown) => value is boolean
  isFunction: (value: unknown) => value is (...args: unknown[]) => unknown
  isObject: (value: unknown) => value is Record<string, unknown>
  isArray: (value: unknown) => value is unknown[]
  isNull: (value: unknown) => value is null
  isUndefined: (value: unknown) => value is undefined
  isNullish: (value: unknown) => value is null | undefined
  isPrimitive: (value: unknown) => boolean
  isDate: (value: unknown) => value is Date
  isRegExp: (value: unknown) => value is RegExp
  isError: (value: unknown) => value is Error
  isPromise: (value: unknown) => value is Promise<unknown>
  isSymbol: (value: unknown) => value is symbol
  isBigInt: (value: unknown) => value is bigint

  // 数组操作
  chunk: <T>(array: T[], size: number) => T[][]
  compact: <T>(array: T[]) => T[]
  difference: <T>(array: T[], ...values: T[][]) => T[]
  intersection: <T>(...arrays: T[][]) => T[]
  union: <T>(...arrays: T[][]) => T[]
  unique: <T>(array: T[]) => T[]
  shuffle: <T>(array: T[]) => T[]
  sortBy: <T>(array: T[], key: keyof T | ((item: T) => unknown)) => T[]
  groupBy: <T>(
    array: T[],
    key: keyof T | ((item: T) => string)
  ) => Record<string, T[]>
  countBy: <T>(
    array: T[],
    key: keyof T | ((item: T) => string)
  ) => Record<string, number>

  // 对象操作
  keys: <T extends Record<string, unknown>>(obj: T) => (keyof T)[]
  values: <T extends Record<string, unknown>>(obj: T) => T[keyof T][]
  entries: <T extends Record<string, unknown>>(
    obj: T
  ) => [keyof T, T[keyof T]][]
  assign: <T extends Record<string, unknown>>(
    target: T,
    ...sources: Partial<T>[]
  ) => T
  merge: <T extends Record<string, unknown>>(
    target: T,
    ...sources: Partial<T>[]
  ) => T
  pick: <T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ) => Pick<T, K>
  omit: <T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ) => Omit<T, K>
  clone: <T>(value: T) => T
  deepClone: <T>(value: T) => T
  isEmpty: (value: unknown) => boolean
  isEqual: (a: unknown, b: unknown) => boolean
  isDeepEqual: (a: unknown, b: unknown) => boolean

  // 字符串操作
  capitalize: (str: string) => string
  camelCase: (str: string) => string
  kebabCase: (str: string) => string
  snakeCase: (str: string) => string
  pascalCase: (str: string) => string
  truncate: (str: string, length: number, suffix?: string) => string
  padStart: (str: string, length: number, char?: string) => string
  padEnd: (str: string, length: number, char?: string) => string
  repeat: (str: string, count: number) => string
  reverse: (str: string) => string
  escape: (str: string) => string
  unescape: (str: string) => string
  slugify: (str: string) => string

  // 数字操作
  clamp: (num: number, min: number, max: number) => number
  random: (min: number, max: number) => number
  randomInt: (min: number, max: number) => number
  round: (num: number, precision?: number) => number
  floor: (num: number, precision?: number) => number
  ceil: (num: number, precision?: number) => number
  formatNumber: (num: number, options?: NumberFormatOptions) => string
  parseNumber: (str: string) => number | null
  isInteger: (num: number) => boolean
  isFinite: (num: number) => boolean
  isNaN: (num: number) => boolean

  // 函数操作
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ) => T
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ) => T
  once: <T extends (...args: unknown[]) => unknown>(func: T) => T
  memoize: <T extends (...args: unknown[]) => unknown>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ) => T
  curry: <T extends (...args: unknown[]) => unknown>(
    func: T,
    arity?: number
  ) => (...args: unknown[]) => unknown
  compose: (
    ...funcs: ((...args: unknown[]) => unknown)[]
  ) => (...args: unknown[]) => unknown
  pipe: (
    ...funcs: ((...args: unknown[]) => unknown)[]
  ) => (...args: unknown[]) => unknown

  // 时间操作
  now: () => number
  formatDate: (date: Date, format?: string) => string
  parseDate: (str: string, format?: string) => Date | null
  addDays: (date: Date, days: number) => Date
  addMonths: (date: Date, months: number) => Date
  addYears: (date: Date, years: number) => Date
  differenceInDays: (date1: Date, date2: Date) => number
  differenceInMonths: (date1: Date, date2: Date) => number
  differenceInYears: (date1: Date, date2: Date) => number
  isToday: (date: Date) => boolean
  isYesterday: (date: Date) => boolean
  isTomorrow: (date: Date) => boolean
  isWeekend: (date: Date) => boolean
  isLeapYear: (year: number) => boolean

  // 验证器
  isEmail: (email: string) => boolean
  isURL: (url: string) => boolean
  isPhone: (phone: string) => boolean
  isCreditCard: (card: string) => boolean
  isPostalCode: (code: string, country?: string) => boolean
  isIPv4: (ip: string) => boolean
  isIPv6: (ip: string) => boolean
  isUUID: (uuid: string) => boolean
  isStrongPassword: (password: string) => boolean
  isAlphanumeric: (str: string) => boolean
  isNumeric: (str: string) => boolean
  isAlpha: (str: string) => boolean
  isLowercase: (str: string) => boolean
  isUppercase: (str: string) => boolean

  // 文件操作
  getFileExtension: (filename: string) => string
  getFileName: (filepath: string) => string
  getFilePath: (filepath: string) => string
  normalizePath: (path: string) => string
  joinPath: (...paths: string[]) => string
  resolvePath: (...paths: string[]) => string
  isAbsolutePath: (path: string) => boolean
  isRelativePath: (path: string) => boolean
  getRelativePath: (from: string, to: string) => string
  formatFileSize: (bytes: number) => string
  parseFileSize: (size: string) => number | null

  // 网络操作
  isValidURL: (url: string) => boolean
  parseURL: (url: string) => URL | null
  buildURL: (base: string, params: Record<string, unknown>) => string
  encodeURL: (url: string) => string
  decodeURL: (url: string) => string
  getDomain: (url: string) => string | null
  getProtocol: (url: string) => string | null
  getPath: (url: string) => string | null
  getQuery: (url: string) => Record<string, string> | null

  // 加密和哈希
  hash: (data: string, algorithm?: string) => Promise<string>
  hmac: (data: string, key: string, algorithm?: string) => Promise<string>
  encrypt: (data: string, key: string) => Promise<string>
  decrypt: (data: string, key: string) => Promise<string>
  generateRandomString: (length: number, charset?: string) => string
  generateUUID: () => string
  generateId: (prefix?: string) => string

  // 其他工具
  sleep: (ms: number) => Promise<void>
  retry: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<T>
  timeout: <T>(promise: Promise<T>, ms: number) => Promise<T>
  parallel: <T>(
    tasks: (() => Promise<T>)[],
    concurrency?: number
  ) => Promise<T[]>
  series: <T>(tasks: (() => Promise<T>)[]) => Promise<T[]>
  waterfall: <T>(tasks: ((...args: unknown[]) => Promise<T>)[]) => Promise<T>
  mapLimit: <T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
  ) => Promise<R[]>
}

// 数字格式化选项
export interface NumberFormatOptions {
  locale?: string
  style?: 'decimal' | 'currency' | 'percent'
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

// 重试选项
export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: 'fixed' | 'exponential' | 'linear'
  factor?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: Error) => void
}

// 工具管理器接口
export interface UtilityManager {
  register: (name: string, fn: (...args: unknown[]) => unknown) => void
  unregister: (name: string) => void
  get: (name: string) => ((...args: unknown[]) => unknown) | undefined
  getAll: () => Record<string, (...args: unknown[]) => unknown>
  execute: (name: string, ...args: unknown[]) => unknown
  validate: (name: string, ...args: unknown[]) => boolean
  getMetadata: (name: string) => UtilityMetadata | undefined
}

// 工具元数据
export interface UtilityMetadata {
  name: string
  description?: string
  category: string
  tags: string[]
  parameters: UtilityParameter[]
  returnType: string
  examples: string[]
  author?: string
  version: string
  deprecated?: boolean
  experimental?: boolean
}

// 工具参数
export interface UtilityParameter {
  name: string
  type: string
  required: boolean
  default?: unknown
  description?: string
  validator?: (value: unknown) => boolean
}

// 工具分类
export interface UtilityCategory {
  name: string
  description: string
  utilities: string[]
  icon?: string
  color?: string
}

// 工具搜索选项
export interface UtilitySearchOptions {
  query: string
  category?: string
  tags?: string[]
  deprecated?: boolean
  experimental?: boolean
  limit?: number
  offset?: number
}

// 工具搜索结果
export interface UtilitySearchResult {
  utilities: UtilityMetadata[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  suggestions: string[]
}
