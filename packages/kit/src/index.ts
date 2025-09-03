/**
 * @ldesign/kit - Node.js 开发工具库
 * 
 * 提供文件系统、网络、压缩、Git、NPM、SSL、进程管理、日志、配置等常用工具
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导出所有类型定义
export * from './types'

// 导出核心工具模块 - 避免冲突的具体导出
export {
  ArrayUtils,
  AsyncUtils,
  ObjectUtils,
  PathUtils,
  StringUtils,
  DateUtils,
  NumberUtils,
  ValidationUtils,
  CryptoUtils,
  RandomUtils,
  SystemUtils,
  HttpUtils,
  HttpRequestOptions,
  HttpResponse as UtilsHttpResponse // Renamed to avoid conflict
} from './utils'

export * from './filesystem'
export * from './network'
export * from './process'
export * from './database'

// Export project module with renamed conflicting types
export {
  ProjectDetector,
  DependencyAnalyzer,
  BuildToolDetector,
  PackageManagerDetector,
  ProjectType,
  PackageManager as ProjectPackageManager,
  BuildTool,
  BuildToolFeature,
  PackageManagerFeature,
  createProjectDetector,
  createDependencyAnalyzer,
  createBuildToolDetector,
  createPackageManagerDetector,
  detectProjectType,
  detectBuildTools,
  detectPackageManager,
  analyzeDependencies
} from './project'

// Specific exports to avoid conflicts
export {
  Logger,
  LoggerManager,
  ConsoleLogger,
  FileLogger,
  Timer,
  ErrorHandler,
  BenchmarkResult as LoggerBenchmarkResult // Renamed to avoid conflict
} from './logger'

export {
  ConfigManager,
  ConfigLoader,
  ConfigValidator,
  ConfigWatcher,
  EnvConfig,
  SchemaValidator as ConfigSchemaValidator, // Renamed to avoid conflict
  ConfigCache,
  ConfigHotReload,
  ValidationError as ConfigValidationError, // Renamed to avoid conflict
  ValidationResult as ConfigValidationResult, // Renamed to avoid conflict  
  ValidationRule as ConfigValidationRule // Renamed to avoid conflict
} from './config'

export {
  CacheManager,
  MemoryCache,
  FileCache,
  RedisCache,
  AbstractCacheStore,
  CacheStoreDecorator,
  CompressedCacheStore,
  SerializedCacheStore,
  NamespacedCacheStore,
  CacheSerializer
} from './cache'

export * from './events'
export * from './validation'
export * from './archive'
export * from './git'
export * from './package'
export * from './cli'
export * from './ssl'
export * from './inquirer'
export * from './notification'
export * from './performance'
export * from './builder'

// 便捷导入

export {
  // 文件系统
  FileSystem,
  FileUtils,
  DirectoryUtils,
  PathResolver,
  FileWatcher,
  TempManager
} from './filesystem'

export {
  // 网络工具
  HttpClient,
  HttpServer,
  NetworkUtils,
  RequestBuilder,
  ResponseHandler
} from './network'



export {
  // 进程管理
  ProcessManager,
  ProcessUtils,
  CommandRunner,
  ServiceManager,
  DaemonManager
} from './process'



export {
  // 数据库工具
  DatabaseManager,
  QueryBuilder,
  SchemaBuilder,
  MigrationManager,
  ConnectionPool,
  TransactionManager
} from './database'



export {
  // IconFont 工具
  SvgToIconFont,
  IconFontGenerator,
  CssGenerator
} from './iconfont'

export {
  // 脚手架系统
  ScaffoldManager,
  TemplateManager,
  PluginManager,
  EnvironmentManager,
  CliBuilder
} from './scaffold'

export {
  // 控制台 UI 组件
  ProgressBar,
  LoadingSpinner,
  StatusIndicator,
  MultiProgress,
  ConsoleTheme
} from './console'


export {
  // 事件系统
  EventEmitter,
  EventBus,
  EventMiddleware,
  EventStore,
  TypedEventEmitter
} from './events'


export {
  // 构建工具
  ViteBuilder,
  RollupBuilder,
  BuilderFactory,
  BuilderUtils,
  createViteBuilder,
  createRollupBuilder,
  createViteBuilderWithPreset,
  createRollupBuilderWithPreset,
  BuiltinPresets
} from './builder'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version
}
