/**
 * @ldesign/kit 核心类型定义
 */

// 通用类型
export type Awaitable<T> = T | Promise<T>
export type MaybeArray<T> = T | T[]
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志条目
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: unknown
  module?: string
}

// 日志选项
export interface LoggerOptions {
  level?: LogLevel
  timestamp?: boolean
  colors?: boolean
  module?: string
  file?: string
  maxFiles?: number
  maxSize?: number
}

// 文件信息
export interface FileInfo {
  path: string
  name: string
  ext: string
  size: number
  mtime: Date
  isDirectory: boolean
  isFile: boolean
}

// 文件扫描选项
export interface ScanOptions {
  includePatterns?: string[]
  ignorePatterns?: string[]
  maxDepth?: number
  followSymlinks?: boolean
  extensions?: string[]
}

// 进程执行选项
export interface ExecOptions {
  cwd?: string
  env?: Record<string, string>
  timeout?: number
  encoding?: BufferEncoding
  shell?: boolean | string
  stdio?: 'pipe' | 'inherit' | 'ignore'
  silent?: boolean
}

// 进程执行结果
export interface ExecResult {
  stdout: string
  stderr: string
  exitCode: number
  signal?: string
  killed: boolean
  timedOut: boolean
}

// 网络请求选项
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  headers?: Record<string, string>
  body?: string | Buffer | FormData
  timeout?: number
  retries?: number
  proxy?: string
  followRedirects?: boolean
  maxRedirects?: number
}

// 下载选项
export interface DownloadOptions {
  timeout?: number
  retries?: number
  proxy?: string
  headers?: Record<string, string>
  onProgress?: (downloaded: number, total: number) => void
  resumable?: boolean
}

// 简单压缩选项
export interface SimpleArchiveOptions {
  compression?: 'none' | 'gzip' | 'brotli'
  level?: number
  password?: string
  exclude?: string[]
  include?: string[]
  onProgress?: (processed: number, total: number) => void
}

// Git 信息
export interface GitInfo {
  branch: string
  commit: string
  tag?: string
  remote?: string
  isDirty: boolean
  ahead: number
  behind: number
}

// 包信息 (基础版本)
export interface BasicPackageInfo {
  name: string
  version: string
  description?: string
  main?: string
  module?: string
  types?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

// SSL 证书选项
export interface SSLOptions {
  commonName: string
  organization?: string
  organizationUnit?: string
  country?: string
  state?: string
  locality?: string
  validityDays?: number
  keySize?: number
  algorithm?: 'rsa' | 'ec' | 'ed25519'
  hashAlgorithm?: 'sha256' | 'sha384' | 'sha512'
}

// CLI 命令选项 (基础版本)
export interface BasicCommandOptions {
  name: string
  description: string
  usage?: string
  examples?: string[]
  options?: OptionDefinition[]
  action: (...args: any[]) => Awaitable<void>
}

// CLI 选项定义 (基础版本)
export interface BasicOptionDefinition {
  name: string
  alias?: string
  description: string
  type?: 'string' | 'number' | 'boolean'
  default?: any
  required?: boolean
  choices?: string[]
}

// 询问选项
export interface PromptOptions {
  type: 'text' | 'password' | 'confirm' | 'select' | 'multiselect' | 'number'
  name: string
  message: string
  initial?: any
  choices?: Array<{ title: string; value: any; description?: string }>
  validate?: (value: any) => boolean | string
  format?: (value: any) => any
}

// 通知选项
export interface NotificationOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  icon?: string
  sound?: boolean
  timeout?: number
  urgency?: 'low' | 'normal' | 'critical'
  actions?: NotificationAction[]
  persistent?: boolean
  subtitle?: string
  progress?: number
  onClick?: () => void
}

// 性能测量结果
export interface PerformanceResult {
  name: string
  duration: number
  memory?: {
    used: number
    total: number
  }
  cpu?: number
  timestamp: Date
}

// 数据库连接选项
export interface DatabaseOptions {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb'
  host?: string
  port?: number
  database: string
  username?: string
  password?: string
  ssl?: boolean
  pool?: {
    min?: number
    max?: number
    idle?: number
  }
}

// 重试选项
export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
  factor?: number
  maxDelay?: number
  onRetry?: (error: Error, attempt: number) => void
}

// 配置加载选项
export interface ConfigOptions {
  cwd?: string
  configFile?: string
  schema?: any
  defaults?: Record<string, any>
  env?: boolean
  envPrefix?: string
}

// 错误类型
export class KitError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'KitError'
  }
}

// 文件系统错误
export class FileSystemError extends KitError {
  constructor(
    message: string,
    public path?: string,
    cause?: Error
  ) {
    super(message, 'FILESYSTEM_ERROR', cause)
    this.name = 'FileSystemError'
  }
}

// 网络错误
export class NetworkError extends KitError {
  constructor(
    message: string,
    public url?: string,
    cause?: Error
  ) {
    super(message, 'NETWORK_ERROR', cause)
    this.name = 'NetworkError'
  }
}

// 进程错误
export class ProcessError extends KitError {
  constructor(
    message: string,
    public command?: string,
    public exitCode?: number,
    cause?: Error
  ) {
    super(message, 'PROCESS_ERROR', cause)
    this.name = 'ProcessError'
  }
}

export class DatabaseError extends KitError {
  constructor(message: string, cause?: Error) {
    super(message, 'DATABASE_ERROR', cause)
    this.name = 'DatabaseError'
  }
}

// 数据库连接接口
export interface DatabaseConnection {
  type: string
  host: string
  port: number
  database: string
  username: string
  connected: boolean
  lastActivity: Date
  connect(): Promise<void>
  disconnect(): Promise<void>
  query(sql: string, params?: any[]): Promise<QueryResult>
  beginTransaction(): Promise<QueryResult>
  commit(): Promise<QueryResult>
  rollback(): Promise<QueryResult>
}

// 查询结果接口
export interface QueryResult {
  rows: any[]
  rowCount: number
  fields: any[]
  duration?: number
}

// 数据库配置接口
export interface DatabaseConfig {
  connections?: Record<string, DatabaseOptions>
  default?: string
}

// 网络相关类型
export interface HttpClientOptions {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  validateStatus?: (status: number) => boolean
  maxRedirects?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any) => boolean
}

export interface HttpRequest {
  method: string
  url: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  responseType?: string
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: HttpRequest
  url?: string
  duration?: number
}

export interface HttpServerOptions {
  port?: number
  host?: string
  https?: boolean
  httpsOptions?: any
  cors?: boolean | any
  compression?: boolean
  bodyParser?: boolean
  maxBodySize?: number
  timeout?: number
  keepAliveTimeout?: number
}

export interface HttpContext {
  request: {
    method: string
    url: string
    path: string
    query: Record<string, any>
    headers: Record<string, any>
    body: any
    params: Record<string, string>
    ip: string
    userAgent: string
  }
  response: {
    status: (code: number) => any
    header: (name: string, value: string) => any
    headers: (headers: Record<string, string>) => any
    send: (data: any) => void
    json: (data: any) => void
    file: (filePath: string) => void
    redirect: (url: string, status?: number) => void
    headersSent: boolean
  }
  state: Record<string, any>
}

export type RouteHandler = (context: HttpContext) => Promise<void> | void
export type Middleware = (context: HttpContext, next: () => void) => Promise<void> | void

export interface RequestInterceptor {
  (config: HttpRequest): HttpRequest | Promise<HttpRequest>
}

export interface ResponseInterceptor {
  (response: HttpResponse): HttpResponse | Promise<HttpResponse>
}

export interface RetryOptions {
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any) => boolean
}

// 配置错误
export class ConfigError extends KitError {
  constructor(
    message: string,
    public configPath?: string,
    cause?: Error
  ) {
    super(message, 'CONFIG_ERROR', cause)
    this.name = 'ConfigError'
  }
}

// 日志传输器接口
export interface LogTransport {
  log(entry: LogEntry): Promise<void>
}

// 日志格式化器接口
export interface LogFormatter {
  format(entry: LogEntry): string
}

// 扩展的日志条目接口
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: unknown
  module?: string
  type?: string
}

// 扩展的日志选项接口
export interface LoggerOptions {
  level?: LogLevel
  timestamp?: boolean
  colors?: boolean
  module?: string
  file?: string
  maxFiles?: number
  maxSize?: number
  maxLogs?: number
  silent?: boolean
}

// 配置管理相关类型
export interface ConfigOptions {
  configFile?: string
  configDir?: string
  envPrefix?: string
  envSeparator?: string
  watch?: boolean
  strict?: boolean
  allowUnknown?: boolean
  caseSensitive?: boolean
  freezeConfig?: boolean
  validateOnLoad?: boolean
  mergeArrays?: boolean
}

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ConfigValue[]
  | { [key: string]: ConfigValue }

export interface ConfigSchema {
  type?: string | string[]
  properties?: Record<string, ConfigSchema>
  items?: ConfigSchema
  required?: boolean
  default?: any
  enum?: any[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  pattern?: string
  validate?: (value: any) => boolean | string
}

export interface SchemaValidationError {
  path: string
  message: string
  value: any
  schema: ConfigSchema
}

// 缓存系统相关类型
export interface CacheOptions {
  defaultTTL?: number
  maxSize?: number
  strategy?: EvictionStrategy
  prefix?: string
  serialize?: boolean
  compress?: boolean
  namespace?: string
}

export type EvictionStrategy = 'lru' | 'lfu' | 'fifo' | 'random'

export interface CacheEntry<T = any> {
  value: T
  expiresAt?: number
  createdAt: number
}

export interface CacheStats {
  hits: number
  misses: number
  keys: number
  size: number
  memory: number
  hitRate?: number
  sets?: number
  deletes?: number
  evictions?: number
  errors?: number
}

export interface CacheStore {
  get<T = any>(key: string): Promise<T | undefined>
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>
  has(key: string): Promise<boolean>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  getStats(): Promise<CacheStats>
  mget?<T = any>(keys: string[]): Promise<Map<string, T>>
  mset?<T = any>(entries: Map<string, T>, ttl?: number): Promise<void>
  mdel?(keys: string[]): Promise<number>
  keys?(pattern?: string): Promise<string[]>
  expire?(key: string, ttl: number): Promise<boolean>
  ttl?(key: string): Promise<number>
  destroy?(): Promise<void>
  on(event: string, listener: (...args: any[]) => void): void
  off(event: string, listener: (...args: any[]) => void): void
  removeAllListeners(): void
}

// 事件系统相关类型
export type EventListener = (...args: any[]) => void | Promise<void>

export interface EventOptions {
  maxListeners?: number
  enableStats?: boolean
}

export interface EventStats {
  emitCount: number
  listenerCount: number
  lastEmittedAt?: Date
  averageExecutionTime: number
  totalExecutionTime: number
}

export interface EventBusOptions {
  enableWildcard?: boolean
  enableNamespaces?: boolean
  enableFilters?: boolean
  enableMiddleware?: boolean
  maxListeners?: number
  enableStats?: boolean
}

export type EventFilter = (event: string, args: any[]) => boolean

export interface EventRecord {
  id: string
  event: string
  data: any
  metadata: Record<string, any>
  timestamp: Date
  sequence: number
}

export interface EventStoreOptions {
  maxEvents?: number
  enableSnapshots?: boolean
  snapshotInterval?: number
  enableCompression?: boolean
  enableEncryption?: boolean
  encryptionKey?: string
  persistToDisk?: boolean
  storageDir?: string
}

export interface EventQuery {
  event?: string | string[]
  from?: Date
  to?: Date
  fromSequence?: number
  toSequence?: number
  metadata?: Record<string, any>
  orderBy?: {
    field: string
    direction?: 'asc' | 'desc'
  }
  limit?: number
  offset?: number
}

// 验证系统相关类型
export interface ValidationRule {
  code?: string
  message?: string | ((field: string, value: any) => string)
  defaultMessage?: string
  validator: (
    value: any,
    data?: any,
    context?: any
  ) => boolean | Promise<boolean> | ValidationRuleResult
  transformer?: (value: any, data?: any, context?: any) => any
  condition?: (value: any, data?: any, context?: any) => boolean
  async?: boolean
}

export interface ValidationRuleResult {
  valid: boolean
  message?: string
  code?: string
  transformedValue?: any
  warning?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  data?: any
  transformedValue?: any
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value: any
}

export interface ValidationContext {
  validator?: any
  options?: any
  originalData?: any
  [key: string]: any
}

export interface ValidatorOptions {
  stopOnFirstError?: boolean
  allowUnknownFields?: boolean
  stripUnknownFields?: boolean
  enableAsync?: boolean
  enableCustomMessages?: boolean
  locale?: string
}

export interface BusinessRule {
  id: string
  name: string
  description?: string
  priority?: number
  dependencies?: string[]
  condition?: (context: RuleContext) => boolean | Promise<boolean>
  execute: (context: RuleContext) => RuleResult | Promise<RuleResult>
  async?: boolean
}

export interface RuleContext {
  data: any
  metadata?: Record<string, any>
  [key: string]: any
}

export interface RuleResult {
  ruleId: string
  success: boolean
  message?: string
  data?: any
  error?: Error
  executionTime?: number
  metadata?: Record<string, any>
  skipped?: boolean
}

export interface RuleEngineOptions {
  enableAsync?: boolean
  enableCaching?: boolean
  enableProfiling?: boolean
  maxExecutionTime?: number
  enableParallelExecution?: boolean
  stopOnFirstFailure?: boolean
}

export interface ValidationSchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null'
  enum?: any[]
  const?: any
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  exclusiveMaximum?: number
  multipleOf?: number
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  items?: ValidationSchema
  minProperties?: number
  maxProperties?: number
  required?: string[]
  properties?: Record<string, ValidationSchema>
  additionalProperties?: boolean | ValidationSchema
  default?: any
  custom?: (
    value: any,
    schema: ValidationSchema,
    path: string
  ) => { valid: boolean; message?: string; code?: string }
}

export interface SchemaValidationResult {
  valid: boolean
  errors: Array<{
    path: string
    message: string
    code: string
    value: any
  }>
  warnings: Array<{
    path: string
    message: string
    code: string
    value: any
  }>
  data: any
}

export interface SchemaValidatorOptions {
  strict?: boolean
  allowAdditionalProperties?: boolean
  removeAdditionalProperties?: boolean
  useDefaults?: boolean
  coerceTypes?: boolean
  validateFormats?: boolean
  enableCustomKeywords?: boolean
}

export interface FormValidationRule {
  code?: string
  message?: string | ((field: string, value: any) => string)
  validator?: (
    value: any,
    formData: any,
    field: string
  ) => boolean | Promise<boolean> | ValidationRuleResult
  transformer?: (value: any, formData: any, field: string) => any
  condition?: (value: any, formData: any, field: string) => boolean
  fields?: string[]
  async?: boolean
}

export interface FormValidationResult {
  valid: boolean
  errors: Record<string, ValidationError[]>
  warnings: Record<string, ValidationError[]>
  fieldResults: Record<string, FieldValidationResult>
  crossFieldErrors: any[]
  data: Record<string, any>
}

export interface FieldValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  transformedValue?: any
}

export interface FormValidatorOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
  showErrorsImmediately?: boolean
  stopOnFirstError?: boolean
  enableRealTimeValidation?: boolean
  debounceTime?: number
  enableCrossFieldValidation?: boolean
}

// 导出 Archive 模块类型
export * from './archive'

// Git 模块类型
export interface GitOptions {
  timeout?: number
  encoding?: BufferEncoding
  maxBuffer?: number
}

export interface GitStatus {
  staged: string[]
  unstaged: string[]
  untracked: string[]
  conflicted: string[]
  clean: boolean
}

export interface GitCommit {
  hash: string
  author: string
  email: string
  date: Date
  message: string
}

export interface GitBranch {
  name: string
  current: boolean
  remote: boolean
}

export interface GitRemote {
  name: string
  url: string
  type: string
}

export interface GitTag {
  name: string
}

export interface GitDiff {
  file: string
  additions: number
  deletions: number
}

export interface GitConfig {
  [key: string]: string
}

export interface GitRepositoryInfo {
  root: string
  currentBranch: string
  latestCommit: string
  status: GitStatus
  remotes: GitRemote[]
  tags: GitTag[]
  config: GitConfig
  isClean: boolean
}

export interface GitFileStatus {
  status:
    | 'unmodified'
    | 'modified'
    | 'added'
    | 'deleted'
    | 'renamed'
    | 'copied'
    | 'untracked'
    | 'conflicted'
  staged: boolean
}

// Package 模块类型
export type PackageManagerType = 'npm' | 'yarn' | 'pnpm'

export interface PackageManagerOptions {
  timeout?: number
  encoding?: BufferEncoding
  maxBuffer?: number
  registry?: string
  packageManager?: PackageManagerType
}

export interface PackageJsonData {
  name: string
  version: string
  description?: string
  main?: string
  scripts?: Record<string, string>
  author?: string | { name: string; email?: string; url?: string }
  license?: string
  homepage?: string
  repository?: string | { type: string; url: string }
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [key: string]: any
}

export interface PackageInfo {
  name: string
  version: string
  description?: string
  author?: string | { name: string; email?: string; url?: string }
  license?: string
  homepage?: string
  repository?: string | { type: string; url: string }
  keywords: string[]
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
}

export interface DependencyInfo {
  name: string
  version: string
  resolved?: string
  dependencies: Record<string, any>
}

export interface InstallOptions {
  dev?: boolean
  global?: boolean
  exact?: boolean
}

export interface DependencyAnalysis {
  total: number
  production: number
  development: number
  peer: number
  optional: number
  outdated: Array<{
    name: string
    current: string
    wanted: string
    latest: string
  }>
  duplicates: string[]
  unused: string[]
  security: Array<{
    name: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
    description: string
  }>
}

export interface SecurityAudit {
  vulnerabilities: Array<{
    name: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  summary: {
    total: number
    low: number
    moderate: number
    high: number
    critical: number
  }
}

// CLI 模块类型
export interface CommandOptions {
  name: string
  description: string
  usage?: string
  options?: OptionDefinition[]
  examples?: string[]
  action: (args: ParsedArgs, context?: CLIContext) => Promise<void> | void
}

export interface OptionDefinition {
  name: string
  alias?: string
  description: string
  type: 'string' | 'number' | 'boolean'
  required?: boolean
  default?: any
  choices?: string[]
}

export interface ParsedArgs {
  command: string | null
  options: Record<string, any>
  args: string[]
  unknown: string[]
}

export interface ParserOptions {
  allowUnknownOptions?: boolean
  stopAtFirstUnknown?: boolean
  caseSensitive?: boolean
  helpOption?: boolean
  versionOption?: boolean
  version?: string
  description?: string
}

export interface CLIAppOptions {
  name?: string
  version?: string
  description?: string
  exitOnError?: boolean
  exitOnSuccess?: boolean
  colors?: boolean
  interactive?: boolean
}

export interface CLIContext {
  command: string
  args: string[]
  options: Record<string, any>
  app: any
  formatter: any
  prompt: any
}

export interface PromptOptions {
  type: 'text' | 'password' | 'confirm' | 'select' | 'multiselect' | 'number'
  message: string
  initial?: any
  choices?: Array<{ title: string; value: any; description?: string }>
}

export interface PromptManagerOptions {
  enabled?: boolean
  input?: NodeJS.ReadableStream
  output?: NodeJS.WritableStream
}

export interface OutputFormatterOptions {
  colors?: boolean
  indent?: number
  maxWidth?: number
}

export interface KeyPair {
  publicKey: string
  privateKey: string
  algorithm: string
  keySize: number
}

export interface CertificateRequest {
  subject: {
    commonName: string
    organization?: string
    organizationalUnit?: string
    locality?: string
    state?: string
    country?: string
    emailAddress?: string
  }
}

export interface CertificateInfo {
  subject: CertificateRequest['subject']
  issuer: CertificateRequest['subject']
  serialNumber: string
  notBefore: string
  notAfter: string
  algorithm: string
  publicKey: string
  extensions: string[]
}

export interface SSLConfig {
  cert: string
  key: string
  passphrase?: string
  ca?: string[]
  requestCert?: boolean
  rejectUnauthorized?: boolean
}

export interface SSLValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Inquirer 模块类型
export interface InquirerOptions {
  input?: NodeJS.ReadableStream
  output?: NodeJS.WritableStream
  colors?: boolean
}

export type QuestionType =
  | 'input'
  | 'password'
  | 'confirm'
  | 'list'
  | 'checkbox'
  | 'number'
  | 'editor'
  | 'autocomplete'

export interface ChoiceOption<T = any> {
  name: string
  value: T
  description?: string
  disabled?: boolean | string
}

export type InquirerValidationResult = boolean | string | Promise<boolean | string>

export interface Question {
  type: QuestionType
  name: string
  message: string
  default?: any | ((answers: Record<string, any>) => any)
  choices?: ChoiceOption<any>[]
  validate?: (value: any) => InquirerValidationResult
  when?: (answers: Record<string, any>) => boolean
  transform?: (value: any) => any
  mask?: string
  pageSize?: number
  source?: (input: string) => Promise<string[]> | string[]
}

export interface Answer {
  [key: string]: any
}

export interface NotificationConfig {
  appName?: string
  icon?: string
  sound?: boolean
  persistent?: boolean
  maxHistory?: number
}

export interface NotificationHistory {
  id: string
  title: string
  message: string
  icon?: string
  timestamp: Date
  clicked: boolean
  dismissed: boolean
}

export interface NotificationAction {
  id: string
  title: string
  callback: () => void
}

export interface SystemTrayOptions {
  title: string
  icon?: string
  tooltip?: string
  menu?: Array<{
    label: string
    click: () => void
    type?: 'normal' | 'separator' | 'submenu'
    enabled?: boolean
  }>
}

// Performance 模块类型
export interface PerformanceConfig {
  maxMetrics?: number
  enableGC?: boolean
  enableMemory?: boolean
  enableCPU?: boolean
  sampleInterval?: number
}

export interface PerformanceMetrics {
  name: string
  type: 'timer' | 'memory' | 'cpu' | 'measure'
  value: number
  timestamp: Date
  unit: string
}

export interface BenchmarkResult {
  name: string
  iterations: number
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
  medianTime: number
  p95Time: number
  p99Time: number
  standardDeviation: number
  opsPerSecond: number
  timestamp: Date
}

export interface MemorySnapshot {
  rss: number
  heapTotal: number
  heapUsed: number
  external: number
  arrayBuffers: number
  timestamp: Date
}

export interface CPUSnapshot {
  user: number
  system: number
  timestamp: Date
}
