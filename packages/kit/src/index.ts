/**
 * @ldesign/kit - Node.js 开发工具库
 *
 * 提供文件系统、网络、压缩、Git、NPM、SSL、进程管理、日志、配置等常用工具
 *
 * @author LDesign Team
 * @version 1.0.0
 */

export * from './archive'

export {
  AbstractCacheStore,
  CacheManager,
  CacheSerializer,
  CacheStoreDecorator,
  CompressedCacheStore,
  FileCache,
  MemoryCache,
  NamespacedCacheStore,
  RedisCache,
  SerializedCacheStore,
} from './cache'
export * from './cli'
export {
  ConfigCache,
  ConfigHotReload,
  ConfigLoader,
  ConfigManager,
  SchemaValidator as ConfigSchemaValidator, // Renamed to avoid conflict
  ConfigValidator,
  ConfigWatcher,
  EnvConfig,
} from './config'

export type {
  ValidationError as ConfigValidationError, // Renamed to avoid conflict
  ValidationResult as ConfigValidationResult, // Renamed to avoid conflict
  ValidationRule as ConfigValidationRule, // Renamed to avoid conflict
} from './config'
export {
  ConsoleTheme,
  LoadingSpinner,
  MultiProgress,
  // 控制台 UI 组件
  ProgressBar,
  StatusIndicator,
} from './console'

export * from './database'

export {
  ConnectionPool,
  // 数据库工具
  DatabaseManager,
  MigrationManager,
  QueryBuilder,
  SchemaBuilder,
  TransactionManager,
} from './database'

export * from './events'

export {
  EventBus,
  // 事件系统
  EventEmitter,
  EventMiddleware,
  EventStore,
  TypedEventEmitter,
} from './events'

export * from './filesystem'
export {
  DirectoryUtils,
  // 文件系统
  FileSystem,
  FileUtils,
  FileWatcher,
  PathResolver,
  TempManager,
} from './filesystem'
export * from './git'
export {
  CssGenerator,
  IconFontGenerator,
  // IconFont 工具
  SvgToIconFont,
} from './iconfont'
export * from './inquirer'
// Specific exports to avoid conflicts
export { ConsoleLogger, ErrorHandler, FileLogger, Logger, LoggerManager, Timer } from './logger'

export type {
  BenchmarkResult as LoggerBenchmarkResult, // Renamed to avoid conflict
} from './logger'
export * from './network'
export {
  // 网络工具
  HttpClient,
  HttpServer,
  NetworkUtils,
  RequestBuilder,
  ResponseHandler,
} from './network'
export * from './notification'
export * from './package'

// 便捷导入

export * from './performance'

export * from './process'

export {
  CommandRunner,
  DaemonManager,
  // 进程管理
  ProcessManager,
  ProcessUtils,
  ServiceManager,
} from './process'

// Export project module with renamed conflicting types
export {
  analyzeDependencies,
  BuildTool,
  BuildToolDetector,
  BuildToolFeature,
  createBuildToolDetector,
  createDependencyAnalyzer,
  createPackageManagerDetector,
  createProjectDetector,
  DependencyAnalyzer,
  detectBuildTools,
  detectPackageManager,
  detectProjectType,
  PackageManagerDetector,
  PackageManagerFeature,
  ProjectDetector,
  PackageManager as ProjectPackageManager,
  ProjectType,
} from './project'

export {
  CliBuilder,
  EnvironmentManager,
  PluginManager,
  // 脚手架系统
  ScaffoldManager,
  TemplateManager,
} from './scaffold'

export * from './ssl'

// 导出所有类型定义
export * from './types'

// 导出核心工具模块 - 避免冲突的具体导出
export {
  ArrayUtils,
  AsyncUtils,
  CryptoUtils,
  DateUtils,
  HttpUtils,
  NumberUtils,
  ObjectUtils,
  PathUtils,
  RandomUtils,
  StringUtils,
  SystemUtils,
  ValidationUtils,
} from './utils'

export type {
  HttpRequestOptions,
  HttpResponse as UtilsHttpResponse, // Renamed to avoid conflict
} from './utils'

export * from './validation'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version,
}
