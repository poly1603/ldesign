/**
 * 事件常量定义
 * 
 * 定义系统中使用的事件名称和事件相关常量
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * Launcher 核心事件
 */
export const LAUNCHER_EVENTS = {
  /** 状态变更事件 */
  STATUS_CHANGE: 'launcher:status:change',
  /** 配置变更事件 */
  CONFIG_CHANGE: 'launcher:config:change',
  /** 初始化完成事件 */
  INITIALIZED: 'launcher:initialized',
  /** 销毁事件 */
  DESTROYED: 'launcher:destroyed',
  /** 错误事件 */
  ERROR: 'launcher:error',
  /** 警告事件 */
  WARNING: 'launcher:warning',
  /** 日志事件 */
  LOG: 'launcher:log',
  /** 性能监控事件 */
  PERFORMANCE: 'launcher:performance',
  /** 内存使用事件 */
  MEMORY_USAGE: 'launcher:memory:usage',
  /** CPU 使用事件 */
  CPU_USAGE: 'launcher:cpu:usage'
} as const

/**
 * 服务器相关事件
 */
export const SERVER_EVENTS = {
  /** 服务器启动事件 */
  START: 'server:start',
  /** 服务器停止事件 */
  STOP: 'server:stop',
  /** 服务器重启事件 */
  RESTART: 'server:restart',
  /** 服务器就绪事件 */
  READY: 'server:ready',
  /** 服务器错误事件 */
  ERROR: 'server:error',
  /** 请求事件 */
  REQUEST: 'server:request',
  /** 响应事件 */
  RESPONSE: 'server:response',
  /** 连接事件 */
  CONNECTION: 'server:connection',
  /** 断开连接事件 */
  DISCONNECT: 'server:disconnect',
  /** 中间件事件 */
  MIDDLEWARE: 'server:middleware',
  /** 代理事件 */
  PROXY: 'server:proxy',
  /** SSL 事件 */
  SSL: 'server:ssl'
} as const

/**
 * 构建相关事件
 */
export const BUILD_EVENTS = {
  /** 构建开始事件 */
  START: 'build:start',
  /** 构建结束事件 */
  END: 'build:end',
  /** 构建错误事件 */
  ERROR: 'build:error',
  /** 构建警告事件 */
  WARNING: 'build:warning',
  /** 构建进度事件 */
  PROGRESS: 'build:progress',
  /** 文件变更事件 */
  FILE_CHANGE: 'build:file:change',
  /** 依赖解析事件 */
  DEPENDENCY_RESOLVE: 'build:dependency:resolve',
  /** 代码转换事件 */
  TRANSFORM: 'build:transform',
  /** 代码生成事件 */
  GENERATE: 'build:generate',
  /** 代码优化事件 */
  OPTIMIZE: 'build:optimize',
  /** 文件写入事件 */
  WRITE: 'build:write',
  /** 构建完成事件 */
  COMPLETE: 'build:complete',
  /** 构建取消事件 */
  CANCEL: 'build:cancel'
} as const

/**
 * 插件相关事件
 */
export const PLUGIN_EVENTS = {
  /** 插件注册事件 */
  REGISTER: 'plugin:register',
  /** 插件卸载事件 */
  UNREGISTER: 'plugin:unregister',
  /** 插件启用事件 */
  ENABLE: 'plugin:enable',
  /** 插件禁用事件 */
  DISABLE: 'plugin:disable',
  /** 插件加载事件 */
  LOAD: 'plugin:load',
  /** 插件卸载事件 */
  UNLOAD: 'plugin:unload',
  /** 插件初始化事件 */
  INIT: 'plugin:init',
  /** 插件销毁事件 */
  DESTROY: 'plugin:destroy',
  /** 插件错误事件 */
  ERROR: 'plugin:error',
  /** 插件执行事件 */
  EXECUTE: 'plugin:execute',
  /** 插件配置变更事件 */
  CONFIG_CHANGE: 'plugin:config:change',
  /** 插件依赖解析事件 */
  DEPENDENCY_RESOLVE: 'plugin:dependency:resolve'
} as const

/**
 * 配置相关事件
 */
export const CONFIG_EVENTS = {
  /** 配置加载事件 */
  LOAD: 'config:load',
  /** 配置保存事件 */
  SAVE: 'config:save',
  /** 配置变更事件 */
  CHANGE: 'config:change',
  /** 配置验证事件 */
  VALIDATE: 'config:validate',
  /** 配置合并事件 */
  MERGE: 'config:merge',
  /** 配置重置事件 */
  RESET: 'config:reset',
  /** 配置错误事件 */
  ERROR: 'config:error',
  /** 配置文件监听事件 */
  FILE_WATCH: 'config:file:watch',
  /** 配置热重载事件 */
  HOT_RELOAD: 'config:hot:reload',
  /** 配置缓存事件 */
  CACHE: 'config:cache'
} as const

/**
 * 文件系统相关事件
 */
export const FILE_EVENTS = {
  /** 文件创建事件 */
  CREATE: 'file:create',
  /** 文件删除事件 */
  DELETE: 'file:delete',
  /** 文件修改事件 */
  CHANGE: 'file:change',
  /** 文件移动事件 */
  MOVE: 'file:move',
  /** 文件复制事件 */
  COPY: 'file:copy',
  /** 文件读取事件 */
  READ: 'file:read',
  /** 文件写入事件 */
  WRITE: 'file:write',
  /** 目录创建事件 */
  DIR_CREATE: 'file:dir:create',
  /** 目录删除事件 */
  DIR_DELETE: 'file:dir:delete',
  /** 文件监听事件 */
  WATCH: 'file:watch',
  /** 文件权限变更事件 */
  PERMISSION_CHANGE: 'file:permission:change',
  /** 文件大小变更事件 */
  SIZE_CHANGE: 'file:size:change'
} as const

/**
 * 缓存相关事件
 */
export const CACHE_EVENTS = {
  /** 缓存命中事件 */
  HIT: 'cache:hit',
  /** 缓存未命中事件 */
  MISS: 'cache:miss',
  /** 缓存设置事件 */
  SET: 'cache:set',
  /** 缓存获取事件 */
  GET: 'cache:get',
  /** 缓存删除事件 */
  DELETE: 'cache:delete',
  /** 缓存清理事件 */
  CLEAR: 'cache:clear',
  /** 缓存过期事件 */
  EXPIRE: 'cache:expire',
  /** 缓存错误事件 */
  ERROR: 'cache:error',
  /** 缓存统计事件 */
  STATS: 'cache:stats',
  /** 缓存压缩事件 */
  COMPRESS: 'cache:compress',
  /** 缓存序列化事件 */
  SERIALIZE: 'cache:serialize',
  /** 缓存反序列化事件 */
  DESERIALIZE: 'cache:deserialize'
} as const

/**
 * CLI 相关事件
 */
export const CLI_EVENTS = {
  /** 命令开始事件 */
  COMMAND_START: 'cli:command:start',
  /** 命令结束事件 */
  COMMAND_END: 'cli:command:end',
  /** 命令错误事件 */
  COMMAND_ERROR: 'cli:command:error',
  /** 用户输入事件 */
  USER_INPUT: 'cli:user:input',
  /** 输出事件 */
  OUTPUT: 'cli:output',
  /** 进度更新事件 */
  PROGRESS_UPDATE: 'cli:progress:update',
  /** 交互开始事件 */
  INTERACTIVE_START: 'cli:interactive:start',
  /** 交互结束事件 */
  INTERACTIVE_END: 'cli:interactive:end',
  /** 帮助显示事件 */
  HELP_DISPLAY: 'cli:help:display',
  /** 版本显示事件 */
  VERSION_DISPLAY: 'cli:version:display',
  /** 选项解析事件 */
  OPTION_PARSE: 'cli:option:parse',
  /** 参数验证事件 */
  ARGUMENT_VALIDATE: 'cli:argument:validate'
} as const

/**
 * 网络相关事件
 */
export const NETWORK_EVENTS = {
  /** 网络连接事件 */
  CONNECT: 'network:connect',
  /** 网络断开事件 */
  DISCONNECT: 'network:disconnect',
  /** 网络请求事件 */
  REQUEST: 'network:request',
  /** 网络响应事件 */
  RESPONSE: 'network:response',
  /** 网络错误事件 */
  ERROR: 'network:error',
  /** 网络超时事件 */
  TIMEOUT: 'network:timeout',
  /** 网络重试事件 */
  RETRY: 'network:retry',
  /** 网络状态变更事件 */
  STATUS_CHANGE: 'network:status:change',
  /** 带宽监控事件 */
  BANDWIDTH_MONITOR: 'network:bandwidth:monitor',
  /** 延迟监控事件 */
  LATENCY_MONITOR: 'network:latency:monitor',
  /** 代理事件 */
  PROXY: 'network:proxy',
  /** SSL 握手事件 */
  SSL_HANDSHAKE: 'network:ssl:handshake'
} as const

/**
 * 性能相关事件
 */
export const PERFORMANCE_EVENTS = {
  /** 性能监控开始事件 */
  MONITOR_START: 'performance:monitor:start',
  /** 性能监控结束事件 */
  MONITOR_END: 'performance:monitor:end',
  /** 内存使用事件 */
  MEMORY_USAGE: 'performance:memory:usage',
  /** CPU 使用事件 */
  CPU_USAGE: 'performance:cpu:usage',
  /** 磁盘使用事件 */
  DISK_USAGE: 'performance:disk:usage',
  /** 网络使用事件 */
  NETWORK_USAGE: 'performance:network:usage',
  /** 性能警告事件 */
  WARNING: 'performance:warning',
  /** 性能阈值超限事件 */
  THRESHOLD_EXCEEDED: 'performance:threshold:exceeded',
  /** 性能基准测试事件 */
  BENCHMARK: 'performance:benchmark',
  /** 性能分析事件 */
  PROFILE: 'performance:profile',
  /** 垃圾回收事件 */
  GARBAGE_COLLECTION: 'performance:gc',
  /** 事件循环延迟事件 */
  EVENT_LOOP_DELAY: 'performance:event:loop:delay'
} as const

/**
 * 热更新相关事件
 */
export const HMR_EVENTS = {
  /** 热更新开始事件 */
  START: 'hmr:start',
  /** 热更新结束事件 */
  END: 'hmr:end',
  /** 热更新错误事件 */
  ERROR: 'hmr:error',
  /** 模块更新事件 */
  MODULE_UPDATE: 'hmr:module:update',
  /** 样式更新事件 */
  STYLE_UPDATE: 'hmr:style:update',
  /** 组件更新事件 */
  COMPONENT_UPDATE: 'hmr:component:update',
  /** 全量重载事件 */
  FULL_RELOAD: 'hmr:full:reload',
  /** 连接建立事件 */
  CONNECTION_ESTABLISHED: 'hmr:connection:established',
  /** 连接断开事件 */
  CONNECTION_LOST: 'hmr:connection:lost',
  /** 客户端连接事件 */
  CLIENT_CONNECT: 'hmr:client:connect',
  /** 客户端断开事件 */
  CLIENT_DISCONNECT: 'hmr:client:disconnect',
  /** 更新可用事件 */
  UPDATE_AVAILABLE: 'hmr:update:available'
} as const

/**
 * 事件优先级
 */
export enum EventPriority {
  /** 低优先级 */
  LOW = 0,
  /** 普通优先级 */
  NORMAL = 1,
  /** 高优先级 */
  HIGH = 2,
  /** 紧急优先级 */
  URGENT = 3
}

/**
 * 事件传播模式
 */
export enum EventPropagation {
  /** 不传播 */
  NONE = 'none',
  /** 向上传播 */
  BUBBLE = 'bubble',
  /** 向下传播 */
  CAPTURE = 'capture',
  /** 双向传播 */
  BOTH = 'both'
}

/**
 * 事件处理模式
 */
export enum EventHandlingMode {
  /** 同步处理 */
  SYNC = 'sync',
  /** 异步处理 */
  ASYNC = 'async',
  /** 延迟处理 */
  DEFERRED = 'deferred',
  /** 批量处理 */
  BATCH = 'batch'
}
