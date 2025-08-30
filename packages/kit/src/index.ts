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

// 导出核心工具模块
export * from './utils'
export * from './filesystem'
export * from './network'
export * from './process'
export * from './database'
export * from './logger'
export * from './config'
export * from './cache'
export * from './events'
export * from './validation'
// export * from './archive' // 暂时禁用，需要修复类型错误
export * from './git'
export * from './package'
export * from './cli'
export * from './ssl'
export * from './inquirer'
export * from './notification'
export * from './performance'

// 便捷导入
export {
  // 工具函数
  ArrayUtils,
  AsyncUtils,
  ObjectUtils,
  PathUtils,
  StringUtils,
  DateUtils,
  NumberUtils,
  ValidationUtils,
  CryptoUtils,
  RandomUtils
} from './utils'

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
  // 日志系统
  Logger,
  LoggerManager,
  ConsoleLogger,
  FileLogger,
  ProgressBar,
  Timer,
  ErrorHandler
} from './logger'

export {
  // 配置管理
  ConfigManager,
  ConfigLoader,
  ConfigValidator,
  ConfigWatcher,
  EnvConfig,
  SchemaValidator
} from './config'

export {
  // 缓存系统
  CacheManager,
  MemoryCache,
  FileCache,
  RedisCache,
  CacheSerializer,
  AbstractCacheStore
} from './cache'

export {
  // 事件系统
  EventEmitter,
  EventBus,
  EventMiddleware,
  EventStore,
  TypedEventEmitter
} from './events'

export {
  // 验证系统
  Validator,
  RuleEngine,
  SchemaValidator as ValidationSchemaValidator,
  FormValidator,
  ValidationRules
} from './validation'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version
}
