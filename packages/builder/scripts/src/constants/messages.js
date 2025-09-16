"use strict";
/**
 * 用户消息常量
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERFORMANCE_MESSAGES = exports.ADAPTER_MESSAGES = exports.PLUGIN_MESSAGES = exports.CONFIG_MESSAGES = exports.CLI_MESSAGES = exports.LOG_LEVEL_MESSAGES = exports.MESSAGE_TEMPLATES = exports.CONFIRMATION_MESSAGES = exports.STATUS_MESSAGES = exports.TIP_MESSAGES = exports.HELP_MESSAGES = exports.PROGRESS_MESSAGES = exports.USER_MESSAGES = exports.WARNING_MESSAGES = exports.INFO_MESSAGES = exports.SUCCESS_MESSAGES = void 0;
/**
 * 成功消息
 */
exports.SUCCESS_MESSAGES = {
    BUILD_COMPLETE: '构建完成',
    BUILD_SUCCESS: '构建成功',
    CONFIG_LOADED: '配置加载成功',
    CONFIG_VALIDATED: '配置验证通过',
    PLUGIN_LOADED: '插件加载成功',
    ADAPTER_INITIALIZED: '适配器初始化成功',
    CACHE_HIT: '缓存命中',
    WATCH_STARTED: '监听模式已启动',
    LIBRARY_DETECTED: '库类型检测成功'
};
/**
 * 信息消息
 */
exports.INFO_MESSAGES = {
    BUILD_STARTING: '开始构建...',
    CONFIG_LOADING: '正在加载配置...',
    PLUGIN_LOADING: '正在加载插件...',
    ADAPTER_SWITCHING: '正在切换适配器...',
    CACHE_CLEARING: '正在清理缓存...',
    WATCH_CHANGE_DETECTED: '检测到文件变化',
    LIBRARY_DETECTING: '正在检测库类型...',
    PERFORMANCE_ANALYZING: '正在分析性能...'
};
/**
 * 警告消息
 */
exports.WARNING_MESSAGES = {
    CONFIG_DEPRECATED: '配置项已废弃',
    PLUGIN_DEPRECATED: '插件已废弃',
    LARGE_BUNDLE_SIZE: '打包文件过大',
    SLOW_BUILD_TIME: '构建时间过长',
    MEMORY_USAGE_HIGH: '内存使用过高',
    CACHE_MISS: '缓存未命中',
    DEPENDENCY_OUTDATED: '依赖版本过旧',
    EXPERIMENTAL_FEATURE: '使用了实验性功能'
};
/**
 * 用户消息
 */
exports.USER_MESSAGES = {
    BUILD_FAILED: '构建失败',
    CONFIG_INVALID: '配置无效',
    PLUGIN_ERROR: '插件错误',
    ADAPTER_ERROR: '适配器错误',
    FILE_NOT_FOUND: '文件未找到',
    DEPENDENCY_MISSING: '依赖缺失',
    NETWORK_ERROR: '网络错误',
    PERMISSION_DENIED: '权限不足',
    OUT_OF_MEMORY: '内存不足',
    TIMEOUT: '操作超时'
};
/**
 * 进度消息
 */
exports.PROGRESS_MESSAGES = {
    INITIALIZING: '初始化中...',
    LOADING_CONFIG: '加载配置中...',
    DETECTING_LIBRARY: '检测库类型中...',
    LOADING_PLUGINS: '加载插件中...',
    RESOLVING_MODULES: '解析模块中...',
    TRANSFORMING_CODE: '转换代码中...',
    GENERATING_BUNDLE: '生成打包文件中...',
    WRITING_FILES: '写入文件中...',
    OPTIMIZING: '优化中...',
    FINALIZING: '完成中...'
};
/**
 * 帮助消息
 */
exports.HELP_MESSAGES = {
    USAGE: '使用方法',
    OPTIONS: '选项',
    EXAMPLES: '示例',
    COMMANDS: '命令',
    CONFIG: '配置',
    PLUGINS: '插件',
    TROUBLESHOOTING: '故障排除',
    FAQ: '常见问题'
};
/**
 * 提示消息
 */
exports.TIP_MESSAGES = {
    PERFORMANCE_OPTIMIZATION: '性能优化提示',
    BUNDLE_SIZE_OPTIMIZATION: '包大小优化提示',
    CACHE_USAGE: '缓存使用提示',
    PLUGIN_RECOMMENDATION: '插件推荐',
    CONFIG_SUGGESTION: '配置建议',
    BEST_PRACTICES: '最佳实践',
    TROUBLESHOOTING_GUIDE: '故障排除指南'
};
/**
 * 状态消息
 */
exports.STATUS_MESSAGES = {
    IDLE: '空闲',
    INITIALIZING: '初始化中',
    BUILDING: '构建中',
    WATCHING: '监听中',
    ERROR: '错误',
    COMPLETE: '完成',
    CANCELLED: '已取消',
    PAUSED: '已暂停'
};
/**
 * 确认消息
 */
exports.CONFIRMATION_MESSAGES = {
    OVERWRITE_FILE: '文件已存在，是否覆盖？',
    DELETE_CACHE: '是否清理缓存？',
    SWITCH_BUNDLER: '是否切换打包器？',
    INSTALL_DEPENDENCY: '是否安装依赖？',
    UPDATE_CONFIG: '是否更新配置？',
    CONTINUE_BUILD: '是否继续构建？',
    ABORT_BUILD: '是否中止构建？'
};
/**
 * 格式化消息模板
 */
exports.MESSAGE_TEMPLATES = {
    BUILD_TIME: '构建时间: {time}ms',
    BUNDLE_SIZE: '打包大小: {size}',
    MEMORY_USAGE: '内存使用: {memory}MB',
    CACHE_HIT_RATE: '缓存命中率: {rate}%',
    FILE_COUNT: '文件数量: {count}',
    PLUGIN_COUNT: '插件数量: {count}',
    ERROR_COUNT: '错误数量: {count}',
    WARNING_COUNT: '警告数量: {count}',
    PROGRESS: '进度: {current}/{total} ({percent}%)',
    VERSION: '版本: {version}'
};
/**
 * 日志级别消息
 */
exports.LOG_LEVEL_MESSAGES = {
    silent: '静默模式',
    error: '仅显示错误',
    warn: '显示警告和错误',
    info: '显示信息、警告和错误',
    debug: '显示调试信息',
    verbose: '显示详细信息'
};
/**
 * 命令行消息
 */
exports.CLI_MESSAGES = {
    WELCOME: '欢迎使用 @ldesign/builder',
    VERSION: '版本信息',
    HELP: '帮助信息',
    INVALID_COMMAND: '无效命令',
    MISSING_ARGUMENT: '缺少参数',
    UNKNOWN_OPTION: '未知选项',
    COMMAND_SUCCESS: '命令执行成功',
    COMMAND_FAILED: '命令执行失败'
};
/**
 * 配置消息
 */
exports.CONFIG_MESSAGES = {
    LOADING: '正在加载配置文件...',
    LOADED: '配置文件加载成功',
    NOT_FOUND: '未找到配置文件，使用默认配置',
    INVALID: '配置文件格式错误',
    VALIDATING: '正在验证配置...',
    VALIDATED: '配置验证通过',
    MERGING: '正在合并配置...',
    MERGED: '配置合并完成',
    WATCHING: '正在监听配置文件变化...',
    CHANGED: '配置文件已更改，重新加载中...'
};
/**
 * 插件消息
 */
exports.PLUGIN_MESSAGES = {
    LOADING: '正在加载插件: {name}',
    LOADED: '插件加载成功: {name}',
    FAILED: '插件加载失败: {name}',
    INITIALIZING: '正在初始化插件: {name}',
    INITIALIZED: '插件初始化成功: {name}',
    EXECUTING: '正在执行插件: {name}',
    EXECUTED: '插件执行完成: {name}',
    ERROR: '插件执行错误: {name}',
    DISABLED: '插件已禁用: {name}',
    DEPRECATED: '插件已废弃: {name}'
};
/**
 * 适配器消息
 */
exports.ADAPTER_MESSAGES = {
    DETECTING: '正在检测可用的适配器...',
    DETECTED: '检测到适配器: {name}',
    INITIALIZING: '正在初始化适配器: {name}',
    INITIALIZED: '适配器初始化成功: {name}',
    SWITCHING: '正在切换到适配器: {name}',
    SWITCHED: '适配器切换成功: {name}',
    NOT_AVAILABLE: '适配器不可用: {name}',
    VERSION_MISMATCH: '适配器版本不匹配: {name}',
    CONFIG_ERROR: '适配器配置错误: {name}'
};
/**
 * 性能消息
 */
exports.PERFORMANCE_MESSAGES = {
    ANALYZING: '正在分析性能...',
    ANALYZED: '性能分析完成',
    SLOW_BUILD: '构建速度较慢，建议优化',
    LARGE_BUNDLE: '打包文件较大，建议优化',
    HIGH_MEMORY: '内存使用较高，建议优化',
    CACHE_EFFECTIVE: '缓存效果良好',
    CACHE_INEFFECTIVE: '缓存效果不佳，建议检查配置',
    OPTIMIZATION_SUGGESTION: '性能优化建议: {suggestion}'
};
