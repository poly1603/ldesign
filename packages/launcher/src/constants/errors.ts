/**
 * 错误常量定义
 * 
 * 定义各种错误代码和错误类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 错误代码枚举
 * 定义系统中使用的错误代码
 */
export enum ErrorCode {
  // 通用错误 (1000-1099)
  /** 未知错误 */
  UNKNOWN_ERROR = 1000,
  /** 参数无效 */
  INVALID_ARGUMENT = 1001,
  /** 操作超时 */
  TIMEOUT = 1002,
  /** 操作被取消 */
  CANCELLED = 1003,
  /** 权限不足 */
  PERMISSION_DENIED = 1004,
  /** 资源不存在 */
  NOT_FOUND = 1005,
  /** 资源已存在 */
  ALREADY_EXISTS = 1006,
  /** 操作不支持 */
  NOT_SUPPORTED = 1007,
  /** 状态无效 */
  INVALID_STATE = 1008,
  /** 资源耗尽 */
  RESOURCE_EXHAUSTED = 1009,

  // 配置相关错误 (1100-1199)
  /** 配置文件未找到 */
  CONFIG_NOT_FOUND = 1100,
  /** 配置文件格式错误 */
  CONFIG_INVALID_FORMAT = 1101,
  /** 配置验证失败 */
  CONFIG_VALIDATION_FAILED = 1102,
  /** 配置加载失败 */
  CONFIG_LOAD_FAILED = 1103,
  /** 配置保存失败 */
  CONFIG_SAVE_FAILED = 1104,
  /** 配置项缺失 */
  CONFIG_MISSING_REQUIRED = 1105,
  /** 配置项类型错误 */
  CONFIG_TYPE_MISMATCH = 1106,
  /** 配置项值无效 */
  CONFIG_INVALID_VALUE = 1107,
  /** 配置文件权限错误 */
  CONFIG_PERMISSION_ERROR = 1108,
  /** 配置合并失败 */
  CONFIG_MERGE_FAILED = 1109,

  // 服务器相关错误 (1200-1299)
  /** 服务器启动失败 */
  SERVER_START_FAILED = 1200,
  /** 服务器停止失败 */
  SERVER_STOP_FAILED = 1201,
  /** 端口被占用 */
  PORT_IN_USE = 1202,
  /** 端口无效 */
  INVALID_PORT = 1203,
  /** 主机地址无效 */
  INVALID_HOST = 1204,
  /** SSL 证书错误 */
  SSL_CERTIFICATE_ERROR = 1205,
  /** 代理配置错误 */
  PROXY_CONFIG_ERROR = 1206,
  /** 中间件错误 */
  MIDDLEWARE_ERROR = 1207,
  /** 服务器内部错误 */
  SERVER_INTERNAL_ERROR = 1208,
  /** 网络连接失败 */
  NETWORK_CONNECTION_FAILED = 1209,

  // 构建相关错误 (1300-1399)
  /** 构建失败 */
  BUILD_FAILED = 1300,
  /** 构建超时 */
  BUILD_TIMEOUT = 1301,
  /** 构建被取消 */
  BUILD_CANCELLED = 1302,
  /** 输出目录创建失败 */
  OUTPUT_DIR_CREATE_FAILED = 1303,
  /** 文件写入失败 */
  FILE_WRITE_FAILED = 1304,
  /** 代码转换失败 */
  CODE_TRANSFORM_FAILED = 1305,
  /** 依赖解析失败 */
  DEPENDENCY_RESOLVE_FAILED = 1306,
  /** 模块未找到 */
  MODULE_NOT_FOUND = 1307,
  /** 语法错误 */
  SYNTAX_ERROR = 1308,
  /** 类型检查失败 */
  TYPE_CHECK_FAILED = 1309,

  // 插件相关错误 (1400-1499)
  /** 插件加载失败 */
  PLUGIN_LOAD_FAILED = 1400,
  /** 插件初始化失败 */
  PLUGIN_INIT_FAILED = 1401,
  /** 插件执行失败 */
  PLUGIN_EXECUTION_FAILED = 1402,
  /** 插件配置错误 */
  PLUGIN_CONFIG_ERROR = 1403,
  /** 插件版本不兼容 */
  PLUGIN_VERSION_INCOMPATIBLE = 1404,
  /** 插件依赖缺失 */
  PLUGIN_DEPENDENCY_MISSING = 1405,
  /** 插件冲突 */
  PLUGIN_CONFLICT = 1406,
  /** 插件未找到 */
  PLUGIN_NOT_FOUND = 1407,
  /** 插件权限错误 */
  PLUGIN_PERMISSION_ERROR = 1408,
  /** 插件卸载失败 */
  PLUGIN_UNLOAD_FAILED = 1409,

  // 文件系统相关错误 (1500-1599)
  /** 文件未找到 */
  FILE_NOT_FOUND = 1500,
  /** 文件读取失败 */
  FILE_READ_FAILED = 1501,
  /** 文件写入失败 */
  FILE_WRITE_FAILED_FS = 1502,
  /** 文件删除失败 */
  FILE_DELETE_FAILED = 1503,
  /** 目录创建失败 */
  DIRECTORY_CREATE_FAILED = 1504,
  /** 目录删除失败 */
  DIRECTORY_DELETE_FAILED = 1505,
  /** 文件权限错误 */
  FILE_PERMISSION_ERROR = 1506,
  /** 磁盘空间不足 */
  DISK_SPACE_INSUFFICIENT = 1507,
  /** 文件格式不支持 */
  FILE_FORMAT_UNSUPPORTED = 1508,
  /** 文件大小超限 */
  FILE_SIZE_EXCEEDED = 1509,

  // 缓存相关错误 (1600-1699)
  /** 缓存初始化失败 */
  CACHE_INIT_FAILED = 1600,
  /** 缓存读取失败 */
  CACHE_READ_FAILED = 1601,
  /** 缓存写入失败 */
  CACHE_WRITE_FAILED = 1602,
  /** 缓存清理失败 */
  CACHE_CLEAR_FAILED = 1603,
  /** 缓存损坏 */
  CACHE_CORRUPTED = 1604,
  /** 缓存过期 */
  CACHE_EXPIRED = 1605,
  /** 缓存空间不足 */
  CACHE_SPACE_INSUFFICIENT = 1606,
  /** 缓存配置错误 */
  CACHE_CONFIG_ERROR = 1607,
  /** 缓存连接失败 */
  CACHE_CONNECTION_FAILED = 1608,
  /** 缓存序列化失败 */
  CACHE_SERIALIZATION_FAILED = 1609,

  // 依赖相关错误 (1700-1799)
  /** 依赖安装失败 */
  DEPENDENCY_INSTALL_FAILED = 1700,
  /** 依赖版本冲突 */
  DEPENDENCY_VERSION_CONFLICT = 1701,
  /** 依赖缺失 */
  DEPENDENCY_MISSING = 1702,
  /** 依赖解析失败 */
  DEPENDENCY_RESOLUTION_FAILED = 1703,
  /** 包管理器未找到 */
  PACKAGE_MANAGER_NOT_FOUND = 1704,
  /** 包管理器执行失败 */
  PACKAGE_MANAGER_EXECUTION_FAILED = 1705,
  /** 依赖循环引用 */
  DEPENDENCY_CIRCULAR_REFERENCE = 1706,
  /** 依赖下载失败 */
  DEPENDENCY_DOWNLOAD_FAILED = 1707,
  /** 依赖验证失败 */
  DEPENDENCY_VERIFICATION_FAILED = 1708,
  /** 依赖更新失败 */
  DEPENDENCY_UPDATE_FAILED = 1709,

  // 性能相关错误 (1800-1899)
  /** 内存不足 */
  OUT_OF_MEMORY = 1800,
  /** CPU 使用过高 */
  HIGH_CPU_USAGE = 1801,
  /** 响应超时 */
  RESPONSE_TIMEOUT = 1802,
  /** 性能监控失败 */
  PERFORMANCE_MONITORING_FAILED = 1803,
  /** 资源泄漏 */
  RESOURCE_LEAK = 1804,
  /** 性能阈值超限 */
  PERFORMANCE_THRESHOLD_EXCEEDED = 1805,
  /** 并发限制超限 */
  CONCURRENCY_LIMIT_EXCEEDED = 1806,
  /** 队列满 */
  QUEUE_FULL = 1807,
  /** 连接池耗尽 */
  CONNECTION_POOL_EXHAUSTED = 1808,
  /** 性能降级 */
  PERFORMANCE_DEGRADATION = 1809,

  // CLI 相关错误 (1900-1999)
  /** 命令未找到 */
  COMMAND_NOT_FOUND = 1900,
  /** 命令参数无效 */
  INVALID_COMMAND_ARGUMENT = 1901,
  /** 命令执行失败 */
  COMMAND_EXECUTION_FAILED = 1902,
  /** 用户输入无效 */
  INVALID_USER_INPUT = 1903,
  /** 交互模式失败 */
  INTERACTIVE_MODE_FAILED = 1904,
  /** 终端不支持 */
  TERMINAL_NOT_SUPPORTED = 1905,
  /** 输出格式错误 */
  OUTPUT_FORMAT_ERROR = 1906,
  /** 帮助信息生成失败 */
  HELP_GENERATION_FAILED = 1907,
  /** 版本信息获取失败 */
  VERSION_INFO_FAILED = 1908,
  /** CLI 初始化失败 */
  CLI_INIT_FAILED = 1909
}

/**
 * 错误类型映射
 * 将错误代码映射到错误类型
 */
export const ERROR_TYPES = {
  [ErrorCode.UNKNOWN_ERROR]: 'UnknownError',
  [ErrorCode.INVALID_ARGUMENT]: 'InvalidArgumentError',
  [ErrorCode.TIMEOUT]: 'TimeoutError',
  [ErrorCode.CANCELLED]: 'CancelledError',
  [ErrorCode.PERMISSION_DENIED]: 'PermissionDeniedError',
  [ErrorCode.NOT_FOUND]: 'NotFoundError',
  [ErrorCode.ALREADY_EXISTS]: 'AlreadyExistsError',
  [ErrorCode.NOT_SUPPORTED]: 'NotSupportedError',
  [ErrorCode.INVALID_STATE]: 'InvalidStateError',
  [ErrorCode.RESOURCE_EXHAUSTED]: 'ResourceExhaustedError',

  [ErrorCode.CONFIG_NOT_FOUND]: 'ConfigNotFoundError',
  [ErrorCode.CONFIG_INVALID_FORMAT]: 'ConfigInvalidFormatError',
  [ErrorCode.CONFIG_VALIDATION_FAILED]: 'ConfigValidationError',
  [ErrorCode.CONFIG_LOAD_FAILED]: 'ConfigLoadError',
  [ErrorCode.CONFIG_SAVE_FAILED]: 'ConfigSaveError',
  [ErrorCode.CONFIG_MISSING_REQUIRED]: 'ConfigMissingRequiredError',
  [ErrorCode.CONFIG_TYPE_MISMATCH]: 'ConfigTypeMismatchError',
  [ErrorCode.CONFIG_INVALID_VALUE]: 'ConfigInvalidValueError',
  [ErrorCode.CONFIG_PERMISSION_ERROR]: 'ConfigPermissionError',
  [ErrorCode.CONFIG_MERGE_FAILED]: 'ConfigMergeError',

  [ErrorCode.SERVER_START_FAILED]: 'ServerStartError',
  [ErrorCode.SERVER_STOP_FAILED]: 'ServerStopError',
  [ErrorCode.PORT_IN_USE]: 'PortInUseError',
  [ErrorCode.INVALID_PORT]: 'InvalidPortError',
  [ErrorCode.INVALID_HOST]: 'InvalidHostError',
  [ErrorCode.SSL_CERTIFICATE_ERROR]: 'SSLCertificateError',
  [ErrorCode.PROXY_CONFIG_ERROR]: 'ProxyConfigError',
  [ErrorCode.MIDDLEWARE_ERROR]: 'MiddlewareError',
  [ErrorCode.SERVER_INTERNAL_ERROR]: 'ServerInternalError',
  [ErrorCode.NETWORK_CONNECTION_FAILED]: 'NetworkConnectionError',

  [ErrorCode.BUILD_FAILED]: 'BuildError',
  [ErrorCode.BUILD_TIMEOUT]: 'BuildTimeoutError',
  [ErrorCode.BUILD_CANCELLED]: 'BuildCancelledError',
  [ErrorCode.OUTPUT_DIR_CREATE_FAILED]: 'OutputDirCreateError',
  [ErrorCode.FILE_WRITE_FAILED]: 'FileWriteError',
  [ErrorCode.CODE_TRANSFORM_FAILED]: 'CodeTransformError',
  [ErrorCode.DEPENDENCY_RESOLVE_FAILED]: 'DependencyResolveError',
  [ErrorCode.MODULE_NOT_FOUND]: 'ModuleNotFoundError',
  [ErrorCode.SYNTAX_ERROR]: 'SyntaxError',
  [ErrorCode.TYPE_CHECK_FAILED]: 'TypeCheckError',

  [ErrorCode.PLUGIN_LOAD_FAILED]: 'PluginLoadError',
  [ErrorCode.PLUGIN_INIT_FAILED]: 'PluginInitError',
  [ErrorCode.PLUGIN_EXECUTION_FAILED]: 'PluginExecutionError',
  [ErrorCode.PLUGIN_CONFIG_ERROR]: 'PluginConfigError',
  [ErrorCode.PLUGIN_VERSION_INCOMPATIBLE]: 'PluginVersionError',
  [ErrorCode.PLUGIN_DEPENDENCY_MISSING]: 'PluginDependencyError',
  [ErrorCode.PLUGIN_CONFLICT]: 'PluginConflictError',
  [ErrorCode.PLUGIN_NOT_FOUND]: 'PluginNotFoundError',
  [ErrorCode.PLUGIN_PERMISSION_ERROR]: 'PluginPermissionError',
  [ErrorCode.PLUGIN_UNLOAD_FAILED]: 'PluginUnloadError'
} as const

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  /** 低级别 - 不影响核心功能 */
  LOW = 'low',
  /** 中级别 - 影响部分功能 */
  MEDIUM = 'medium',
  /** 高级别 - 影响核心功能 */
  HIGH = 'high',
  /** 严重级别 - 系统无法正常运行 */
  CRITICAL = 'critical'
}

/**
 * 错误分类
 */
export enum ErrorCategory {
  /** 系统错误 */
  SYSTEM = 'system',
  /** 配置错误 */
  CONFIG = 'config',
  /** 网络错误 */
  NETWORK = 'network',
  /** 文件系统错误 */
  FILESYSTEM = 'filesystem',
  /** 用户输入错误 */
  USER_INPUT = 'user_input',
  /** 依赖错误 */
  DEPENDENCY = 'dependency',
  /** 插件错误 */
  PLUGIN = 'plugin',
  /** 构建错误 */
  BUILD = 'build',
  /** 性能错误 */
  PERFORMANCE = 'performance'
}

/**
 * 错误恢复策略
 */
export enum ErrorRecoveryStrategy {
  /** 无需恢复 */
  NONE = 'none',
  /** 重试操作 */
  RETRY = 'retry',
  /** 回退到默认值 */
  FALLBACK = 'fallback',
  /** 重启服务 */
  RESTART = 'restart',
  /** 用户干预 */
  USER_INTERVENTION = 'user_intervention',
  /** 系统重置 */
  SYSTEM_RESET = 'system_reset'
}
