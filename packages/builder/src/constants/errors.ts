/**
 * 错误码和错误信息常量
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 配置相关错误 (1000-1999)
  CONFIG_NOT_FOUND = 'E1001',
  CONFIG_PARSE_ERROR = 'E1002',
  CONFIG_VALIDATION_ERROR = 'E1003',
  CONFIG_MERGE_ERROR = 'E1004',
  CONFIG_TRANSFORM_ERROR = 'E1005',
  
  // 构建相关错误 (2000-2999)
  BUILD_FAILED = 'E2001',
  BUILD_TIMEOUT = 'E2002',
  BUILD_CANCELLED = 'E2003',
  BUILD_OUT_OF_MEMORY = 'E2004',
  BUILD_DEPENDENCY_ERROR = 'E2005',
  
  // 适配器相关错误 (3000-3999)
  ADAPTER_NOT_FOUND = 'E3001',
  ADAPTER_INIT_ERROR = 'E3002',
  ADAPTER_NOT_AVAILABLE = 'E3003',
  ADAPTER_VERSION_MISMATCH = 'E3004',
  ADAPTER_CONFIG_ERROR = 'E3005',
  
  // 插件相关错误 (4000-4999)
  PLUGIN_NOT_FOUND = 'E4001',
  PLUGIN_LOAD_ERROR = 'E4002',
  PLUGIN_INIT_ERROR = 'E4003',
  PLUGIN_EXECUTION_ERROR = 'E4004',
  PLUGIN_DEPENDENCY_ERROR = 'E4005',
  
  // 文件系统相关错误 (5000-5999)
  FILE_NOT_FOUND = 'E5001',
  FILE_READ_ERROR = 'E5002',
  FILE_WRITE_ERROR = 'E5003',
  DIRECTORY_NOT_FOUND = 'E5004',
  PERMISSION_DENIED = 'E5005',
  
  // 依赖相关错误 (6000-6999)
  DEPENDENCY_NOT_FOUND = 'E6001',
  DEPENDENCY_VERSION_CONFLICT = 'E6002',
  DEPENDENCY_INSTALL_ERROR = 'E6003',
  DEPENDENCY_RESOLUTION_ERROR = 'E6004',
  
  // 网络相关错误 (7000-7999)
  NETWORK_ERROR = 'E7001',
  DOWNLOAD_ERROR = 'E7002',
  UPLOAD_ERROR = 'E7003',
  TIMEOUT_ERROR = 'E7004',
  
  // 系统相关错误 (8000-8999)
  SYSTEM_ERROR = 'E8001',
  PLATFORM_NOT_SUPPORTED = 'E8002',
  NODE_VERSION_MISMATCH = 'E8003',
  INSUFFICIENT_RESOURCES = 'E8004',
  
  // 用户输入错误 (9000-9999)
  INVALID_INPUT = 'E9001',
  INVALID_OPTION = 'E9002',
  INVALID_PATH = 'E9003',
  INVALID_FORMAT = 'E9004',
  MISSING_REQUIRED_OPTION = 'E9005'
}

/**
 * 错误信息映射
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 配置相关错误
  [ErrorCode.CONFIG_NOT_FOUND]: '配置文件未找到',
  [ErrorCode.CONFIG_PARSE_ERROR]: '配置文件解析失败',
  [ErrorCode.CONFIG_VALIDATION_ERROR]: '配置验证失败',
  [ErrorCode.CONFIG_MERGE_ERROR]: '配置合并失败',
  [ErrorCode.CONFIG_TRANSFORM_ERROR]: '配置转换失败',
  
  // 构建相关错误
  [ErrorCode.BUILD_FAILED]: '构建失败',
  [ErrorCode.BUILD_TIMEOUT]: '构建超时',
  [ErrorCode.BUILD_CANCELLED]: '构建被取消',
  [ErrorCode.BUILD_OUT_OF_MEMORY]: '构建内存不足',
  [ErrorCode.BUILD_DEPENDENCY_ERROR]: '构建依赖错误',
  
  // 适配器相关错误
  [ErrorCode.ADAPTER_NOT_FOUND]: '适配器未找到',
  [ErrorCode.ADAPTER_INIT_ERROR]: '适配器初始化失败',
  [ErrorCode.ADAPTER_NOT_AVAILABLE]: '适配器不可用',
  [ErrorCode.ADAPTER_VERSION_MISMATCH]: '适配器版本不匹配',
  [ErrorCode.ADAPTER_CONFIG_ERROR]: '适配器配置错误',
  
  // 插件相关错误
  [ErrorCode.PLUGIN_NOT_FOUND]: '插件未找到',
  [ErrorCode.PLUGIN_LOAD_ERROR]: '插件加载失败',
  [ErrorCode.PLUGIN_INIT_ERROR]: '插件初始化失败',
  [ErrorCode.PLUGIN_EXECUTION_ERROR]: '插件执行失败',
  [ErrorCode.PLUGIN_DEPENDENCY_ERROR]: '插件依赖错误',
  
  // 文件系统相关错误
  [ErrorCode.FILE_NOT_FOUND]: '文件未找到',
  [ErrorCode.FILE_READ_ERROR]: '文件读取失败',
  [ErrorCode.FILE_WRITE_ERROR]: '文件写入失败',
  [ErrorCode.DIRECTORY_NOT_FOUND]: '目录未找到',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  
  // 依赖相关错误
  [ErrorCode.DEPENDENCY_NOT_FOUND]: '依赖未找到',
  [ErrorCode.DEPENDENCY_VERSION_CONFLICT]: '依赖版本冲突',
  [ErrorCode.DEPENDENCY_INSTALL_ERROR]: '依赖安装失败',
  [ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: '依赖解析失败',
  
  // 网络相关错误
  [ErrorCode.NETWORK_ERROR]: '网络错误',
  [ErrorCode.DOWNLOAD_ERROR]: '下载失败',
  [ErrorCode.UPLOAD_ERROR]: '上传失败',
  [ErrorCode.TIMEOUT_ERROR]: '网络超时',
  
  // 系统相关错误
  [ErrorCode.SYSTEM_ERROR]: '系统错误',
  [ErrorCode.PLATFORM_NOT_SUPPORTED]: '平台不支持',
  [ErrorCode.NODE_VERSION_MISMATCH]: 'Node.js 版本不匹配',
  [ErrorCode.INSUFFICIENT_RESOURCES]: '系统资源不足',
  
  // 用户输入错误
  [ErrorCode.INVALID_INPUT]: '无效输入',
  [ErrorCode.INVALID_OPTION]: '无效选项',
  [ErrorCode.INVALID_PATH]: '无效路径',
  [ErrorCode.INVALID_FORMAT]: '无效格式',
  [ErrorCode.MISSING_REQUIRED_OPTION]: '缺少必需选项'
}

/**
 * 错误建议映射
 */
export const ERROR_SUGGESTIONS: Record<ErrorCode, string> = {
  // 配置相关错误
  [ErrorCode.CONFIG_NOT_FOUND]: '请在项目根目录创建 builder.config.ts 配置文件',
  [ErrorCode.CONFIG_PARSE_ERROR]: '请检查配置文件语法是否正确',
  [ErrorCode.CONFIG_VALIDATION_ERROR]: '请检查配置项是否符合要求',
  [ErrorCode.CONFIG_MERGE_ERROR]: '请检查配置合并逻辑',
  [ErrorCode.CONFIG_TRANSFORM_ERROR]: '请检查配置转换规则',
  
  // 构建相关错误
  [ErrorCode.BUILD_FAILED]: '请检查构建日志获取详细错误信息',
  [ErrorCode.BUILD_TIMEOUT]: '请增加构建超时时间或优化构建配置',
  [ErrorCode.BUILD_CANCELLED]: '构建被用户或系统取消',
  [ErrorCode.BUILD_OUT_OF_MEMORY]: '请增加系统内存或优化构建配置',
  [ErrorCode.BUILD_DEPENDENCY_ERROR]: '请检查项目依赖是否正确安装',
  
  // 适配器相关错误
  [ErrorCode.ADAPTER_NOT_FOUND]: '请安装对应的打包器依赖',
  [ErrorCode.ADAPTER_INIT_ERROR]: '请检查打包器是否正确安装',
  [ErrorCode.ADAPTER_NOT_AVAILABLE]: '请确保打包器依赖已正确安装',
  [ErrorCode.ADAPTER_VERSION_MISMATCH]: '请升级或降级打包器版本',
  [ErrorCode.ADAPTER_CONFIG_ERROR]: '请检查适配器配置是否正确',
  
  // 插件相关错误
  [ErrorCode.PLUGIN_NOT_FOUND]: '请安装对应的插件依赖',
  [ErrorCode.PLUGIN_LOAD_ERROR]: '请检查插件是否正确安装',
  [ErrorCode.PLUGIN_INIT_ERROR]: '请检查插件配置是否正确',
  [ErrorCode.PLUGIN_EXECUTION_ERROR]: '请检查插件执行环境',
  [ErrorCode.PLUGIN_DEPENDENCY_ERROR]: '请检查插件依赖是否满足',
  
  // 文件系统相关错误
  [ErrorCode.FILE_NOT_FOUND]: '请检查文件路径是否正确',
  [ErrorCode.FILE_READ_ERROR]: '请检查文件权限和文件完整性',
  [ErrorCode.FILE_WRITE_ERROR]: '请检查目录权限和磁盘空间',
  [ErrorCode.DIRECTORY_NOT_FOUND]: '请检查目录路径是否正确',
  [ErrorCode.PERMISSION_DENIED]: '请检查文件或目录权限',
  
  // 依赖相关错误
  [ErrorCode.DEPENDENCY_NOT_FOUND]: '请运行 npm install 安装依赖',
  [ErrorCode.DEPENDENCY_VERSION_CONFLICT]: '请解决依赖版本冲突',
  [ErrorCode.DEPENDENCY_INSTALL_ERROR]: '请检查网络连接和包管理器配置',
  [ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: '请检查依赖解析配置',
  
  // 网络相关错误
  [ErrorCode.NETWORK_ERROR]: '请检查网络连接',
  [ErrorCode.DOWNLOAD_ERROR]: '请检查网络连接和下载地址',
  [ErrorCode.UPLOAD_ERROR]: '请检查网络连接和上传权限',
  [ErrorCode.TIMEOUT_ERROR]: '请检查网络连接或增加超时时间',
  
  // 系统相关错误
  [ErrorCode.SYSTEM_ERROR]: '请检查系统环境和权限',
  [ErrorCode.PLATFORM_NOT_SUPPORTED]: '请使用支持的操作系统',
  [ErrorCode.NODE_VERSION_MISMATCH]: '请升级 Node.js 到支持的版本',
  [ErrorCode.INSUFFICIENT_RESOURCES]: '请释放系统资源或增加硬件配置',
  
  // 用户输入错误
  [ErrorCode.INVALID_INPUT]: '请检查输入参数格式',
  [ErrorCode.INVALID_OPTION]: '请使用有效的选项参数',
  [ErrorCode.INVALID_PATH]: '请使用有效的文件或目录路径',
  [ErrorCode.INVALID_FORMAT]: '请使用正确的格式',
  [ErrorCode.MISSING_REQUIRED_OPTION]: '请提供必需的选项参数'
}

/**
 * 错误分类
 */
export const ERROR_CATEGORIES = {
  CONFIGURATION: [
    ErrorCode.CONFIG_NOT_FOUND,
    ErrorCode.CONFIG_PARSE_ERROR,
    ErrorCode.CONFIG_VALIDATION_ERROR,
    ErrorCode.CONFIG_MERGE_ERROR,
    ErrorCode.CONFIG_TRANSFORM_ERROR
  ],
  BUILD: [
    ErrorCode.BUILD_FAILED,
    ErrorCode.BUILD_TIMEOUT,
    ErrorCode.BUILD_CANCELLED,
    ErrorCode.BUILD_OUT_OF_MEMORY,
    ErrorCode.BUILD_DEPENDENCY_ERROR
  ],
  ADAPTER: [
    ErrorCode.ADAPTER_NOT_FOUND,
    ErrorCode.ADAPTER_INIT_ERROR,
    ErrorCode.ADAPTER_NOT_AVAILABLE,
    ErrorCode.ADAPTER_VERSION_MISMATCH,
    ErrorCode.ADAPTER_CONFIG_ERROR
  ],
  PLUGIN: [
    ErrorCode.PLUGIN_NOT_FOUND,
    ErrorCode.PLUGIN_LOAD_ERROR,
    ErrorCode.PLUGIN_INIT_ERROR,
    ErrorCode.PLUGIN_EXECUTION_ERROR,
    ErrorCode.PLUGIN_DEPENDENCY_ERROR
  ],
  FILESYSTEM: [
    ErrorCode.FILE_NOT_FOUND,
    ErrorCode.FILE_READ_ERROR,
    ErrorCode.FILE_WRITE_ERROR,
    ErrorCode.DIRECTORY_NOT_FOUND,
    ErrorCode.PERMISSION_DENIED
  ],
  DEPENDENCY: [
    ErrorCode.DEPENDENCY_NOT_FOUND,
    ErrorCode.DEPENDENCY_VERSION_CONFLICT,
    ErrorCode.DEPENDENCY_INSTALL_ERROR,
    ErrorCode.DEPENDENCY_RESOLUTION_ERROR
  ],
  NETWORK: [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.DOWNLOAD_ERROR,
    ErrorCode.UPLOAD_ERROR,
    ErrorCode.TIMEOUT_ERROR
  ],
  SYSTEM: [
    ErrorCode.SYSTEM_ERROR,
    ErrorCode.PLATFORM_NOT_SUPPORTED,
    ErrorCode.NODE_VERSION_MISMATCH,
    ErrorCode.INSUFFICIENT_RESOURCES
  ],
  USER_INPUT: [
    ErrorCode.INVALID_INPUT,
    ErrorCode.INVALID_OPTION,
    ErrorCode.INVALID_PATH,
    ErrorCode.INVALID_FORMAT,
    ErrorCode.MISSING_REQUIRED_OPTION
  ]
} as const

/**
 * 错误严重程度
 */
export const ERROR_SEVERITY = {
  [ErrorCode.CONFIG_NOT_FOUND]: 'high',
  [ErrorCode.CONFIG_PARSE_ERROR]: 'high',
  [ErrorCode.CONFIG_VALIDATION_ERROR]: 'medium',
  [ErrorCode.BUILD_FAILED]: 'high',
  [ErrorCode.BUILD_TIMEOUT]: 'medium',
  [ErrorCode.ADAPTER_NOT_FOUND]: 'high',
  [ErrorCode.PLUGIN_NOT_FOUND]: 'medium',
  [ErrorCode.FILE_NOT_FOUND]: 'medium',
  [ErrorCode.DEPENDENCY_NOT_FOUND]: 'high',
  [ErrorCode.NETWORK_ERROR]: 'low',
  [ErrorCode.SYSTEM_ERROR]: 'high',
  [ErrorCode.INVALID_INPUT]: 'low'
} as const
