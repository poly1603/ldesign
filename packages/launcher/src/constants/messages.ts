/**
 * 消息常量定义
 * 
 * 定义各种用户界面消息和提示文本
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  /** 服务器启动成功 */
  SERVER_STARTED: '开发服务器启动成功',
  /** 服务器停止成功 */
  SERVER_STOPPED: '服务器已停止',
  /** 构建成功 */
  BUILD_SUCCESS: '构建完成',
  /** 预览服务器启动成功 */
  PREVIEW_STARTED: '预览服务器启动成功',
  /** 配置加载成功 */
  CONFIG_LOADED: '配置文件加载成功',
  /** 插件加载成功 */
  PLUGIN_LOADED: '插件加载成功',
  /** 缓存清理成功 */
  CACHE_CLEARED: '缓存清理完成',
  /** 依赖安装成功 */
  DEPENDENCIES_INSTALLED: '依赖安装完成'
} as const

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  /** 服务器启动失败 */
  SERVER_START_FAILED: '服务器启动失败',
  /** 端口被占用 */
  PORT_IN_USE: '端口已被占用',
  /** 配置文件未找到 */
  CONFIG_NOT_FOUND: '配置文件未找到',
  /** 配置文件格式错误 */
  CONFIG_INVALID: '配置文件格式错误',
  /** 构建失败 */
  BUILD_FAILED: '构建失败',
  /** 插件加载失败 */
  PLUGIN_LOAD_FAILED: '插件加载失败',
  /** 文件不存在 */
  FILE_NOT_FOUND: '文件不存在',
  /** 权限不足 */
  PERMISSION_DENIED: '权限不足',
  /** 网络连接失败 */
  NETWORK_ERROR: '网络连接失败',
  /** 内存不足 */
  OUT_OF_MEMORY: '内存不足',
  /** 磁盘空间不足 */
  DISK_FULL: '磁盘空间不足',
  /** 不支持的文件格式 */
  UNSUPPORTED_FORMAT: '不支持的文件格式',
  /** 依赖缺失 */
  MISSING_DEPENDENCY: '缺少必要的依赖',
  /** 版本不兼容 */
  VERSION_INCOMPATIBLE: '版本不兼容'
} as const

/**
 * 警告消息
 */
export const WARNING_MESSAGES = {
  /** 配置项已废弃 */
  CONFIG_DEPRECATED: '配置项已废弃',
  /** 插件版本过旧 */
  PLUGIN_OUTDATED: '插件版本过旧',
  /** 性能警告 */
  PERFORMANCE_WARNING: '性能警告',
  /** 内存使用过高 */
  HIGH_MEMORY_USAGE: '内存使用过高',
  /** CPU 使用过高 */
  HIGH_CPU_USAGE: 'CPU 使用过高',
  /** 文件过大 */
  LARGE_FILE_SIZE: '文件大小过大',
  /** 构建时间过长 */
  SLOW_BUILD: '构建时间过长',
  /** 热更新失败 */
  HMR_FAILED: '热更新失败',
  /** 缓存失效 */
  CACHE_INVALID: '缓存已失效',
  /** 依赖版本冲突 */
  DEPENDENCY_CONFLICT: '依赖版本冲突'
} as const

/**
 * 信息消息
 */
export const INFO_MESSAGES = {
  /** 正在启动服务器 */
  STARTING_SERVER: '正在启动开发服务器...',
  /** 正在停止服务器 */
  STOPPING_SERVER: '正在停止服务器...',
  /** 正在构建 */
  BUILDING: '正在构建项目...',
  /** 正在加载配置 */
  LOADING_CONFIG: '正在加载配置文件...',
  /** 正在加载插件 */
  LOADING_PLUGINS: '正在加载插件...',
  /** 正在清理缓存 */
  CLEARING_CACHE: '正在清理缓存...',
  /** 正在安装依赖 */
  INSTALLING_DEPENDENCIES: '正在安装依赖...',
  /** 正在检查更新 */
  CHECKING_UPDATES: '正在检查更新...',
  /** 正在优化代码 */
  OPTIMIZING: '正在优化代码...',
  /** 正在生成文件 */
  GENERATING_FILES: '正在生成文件...',
  /** 正在压缩文件 */
  COMPRESSING: '正在压缩文件...'
} as const

/**
 * CLI 帮助消息
 */
export const CLI_HELP_MESSAGES = {
  /** 主帮助信息 */
  MAIN_HELP: `
使用方法: launcher <command> [options]

命令:
  dev      启动开发服务器
  build    执行生产构建
  preview  预览构建结果
  test     运行测试
  dashboard 启动仪表板
  ai       AI辅助优化
  config   配置管理
  plugin   插件管理
  cache    缓存管理
  help     显示帮助信息
  version  显示版本信息

选项:
  --config <file>    指定配置文件路径
  --mode <mode>      指定运行模式 (development, production, test)
  --port <port>      指定端口号
  --host <host>      指定主机地址
  --open [path]      自动打开浏览器
  --force            强制重新构建依赖
  --debug            启用调试模式
  --silent           静默模式
  --help             显示帮助信息
  --version          显示版本信息

示例:
  launcher dev                    启动开发服务器
  launcher dev --port 8080        在端口 8080 启动开发服务器
  launcher build                  执行生产构建
  launcher build --watch          启用监听模式构建
  launcher preview                预览构建结果
  launcher config --list          列出所有配置项
`,

  /** dev 命令帮助 */
  DEV_HELP: `
使用方法: launcher dev [options]

启动开发服务器，支持热模块替换和实时重载。

选项:
  --port <port>      指定端口号 (默认: 3000)
  --host <host>      指定主机地址 (默认: localhost)
  --open [path]      自动打开浏览器到指定路径
  --https            启用 HTTPS
  --force            强制重新构建依赖
  --config <file>    指定配置文件路径
  --mode <mode>      指定运行模式 (默认: development)

示例:
  launcher dev                    启动开发服务器
  launcher dev --port 8080        在端口 8080 启动
  launcher dev --host 0.0.0.0     允许外部访问
  launcher dev --open             启动后自动打开浏览器
  launcher dev --https            启用 HTTPS
`,

  /** build 命令帮助 */
  BUILD_HELP: `
使用方法: launcher build [options]

执行生产构建，生成优化后的静态文件。

选项:
  --outDir <dir>     指定输出目录 (默认: dist)
  --sourcemap        生成 sourcemap 文件
  --minify           压缩代码 (默认: true)
  --watch            启用监听模式
  --target <target>  指定构建目标
  --report           生成构建报告
  --config <file>    指定配置文件路径
  --mode <mode>      指定运行模式 (默认: production)

示例:
  launcher build                  执行生产构建
  launcher build --watch          启用监听模式构建
  launcher build --sourcemap      生成 sourcemap
  launcher build --outDir build   输出到 build 目录
`,

  /** preview 命令帮助 */
  PREVIEW_HELP: `
使用方法: launcher preview [options]

预览构建结果，启动静态文件服务器。

选项:
  --port <port>      指定端口号 (默认: 4173)
  --host <host>      指定主机地址 (默认: localhost)
  --open [path]      自动打开浏览器到指定路径
  --https            启用 HTTPS
  --config <file>    指定配置文件路径

示例:
  launcher preview                预览构建结果
  launcher preview --port 8080    在端口 8080 预览
  launcher preview --open         启动后自动打开浏览器
`,

  /** config 命令帮助 */
  CONFIG_HELP: `
使用方法: launcher config <action> [options]

配置管理工具，用于查看和修改配置。

操作:
  list               列出所有配置项
  get <key>          获取指定配置项的值
  set <key> <value>  设置指定配置项的值
  delete <key>       删除指定配置项
  validate           验证配置文件
  init               初始化配置文件

选项:
  --config <file>    指定配置文件路径
  --global           操作全局配置

示例:
  launcher config list            列出所有配置项
  launcher config get server.port 获取服务器端口配置
  launcher config set server.port 8080 设置服务器端口
  launcher config validate        验证配置文件
`,

  /** ai 命令帮助 */
  AI_HELP: `
使用方法: launcher ai [options]

AI辅助优化工具，分析项目并提供智能优化建议。

选项:
  --project <path>   指定项目路径 (默认: 当前目录)
  --auto             自动应用高优先级建议
  --export <file>    导出分析报告
  --analyze-only     仅分析，不应用建议
  --config <file>    指定配置文件路径

示例:
  launcher ai                     分析当前项目并交互式优化
  launcher ai --auto              自动应用高优先级优化
  launcher ai --export report.json 导出分析报告
  launcher ai --analyze-only      仅分析项目
`,

  /** test 命令帮助 */
  TEST_HELP: `
使用方法: launcher test [options]

运行测试套件，支持单元测试和集成测试。

选项:
  --watch            监听文件变化并重新运行测试
  --coverage         生成测试覆盖率报告
  --filter <pattern> 过滤测试文件
  --bail             遇到失败立即停止
  --config <file>    指定测试配置文件

示例:
  launcher test                   运行所有测试
  launcher test --watch           监听模式运行测试
  launcher test --coverage        生成覆盖率报告
  launcher test --filter unit     只运行单元测试
`,

  /** dashboard 命令帮助 */
  DASHBOARD_HELP: `
使用方法: launcher dashboard [options]

启动可视化监控面板，实时查看项目状态和性能指标。

选项:
  --port <port>      指定端口号 (默认: 9000)
  --host <host>      指定主机地址 (默认: localhost)
  --open             自动打开浏览器
  --config <file>    指定配置文件路径

示例:
  launcher dashboard              启动监控面板
  launcher dashboard --port 8090  在端口 8090 启动
  launcher dashboard --open       启动后自动打开浏览器
`,

  /** plugin 命令帮助 */
  PLUGIN_HELP: `
使用方法: launcher plugin <action> [options]

插件管理工具，支持安装、卸载、更新和管理插件。

操作:
  list               列出已安装的插件
  search <keyword>   搜索插件市场
  install <name>     安装插件
  uninstall <name>   卸载插件
  update <name>      更新插件
  info <name>        查看插件详情
  enable <name>      启用插件
  disable <name>     禁用插件

选项:
  --version <ver>    指定插件版本
  --force            强制操作
  --dev              安装为开发依赖
  --global           全局安装

示例:
  launcher plugin list            列出已安装插件
  launcher plugin search vue      搜索Vue相关插件
  launcher plugin install @ldesign/plugin-vue3  安装Vue3插件
  launcher plugin update all      更新所有插件
`,

  /** cache 命令帮助 */
  CACHE_HELP: `
使用方法: launcher cache <action> [options]

缓存管理工具，管理构建缓存和依赖缓存。

操作:
  clean              清理所有缓存
  clear <type>       清理指定类型缓存
  list               列出缓存信息
  size               显示缓存大小
  verify             验证缓存完整性

选项:
  --force            强制清理
  --keep-deps        保留依赖缓存
  --keep-build       保留构建缓存

示例:
  launcher cache clean            清理所有缓存
  launcher cache clear build      清理构建缓存
  launcher cache size             查看缓存大小
  launcher cache verify           验证缓存
`
} as const

/**
 * 进度消息
 */
export const PROGRESS_MESSAGES = {
  /** 初始化 */
  INITIALIZING: '正在初始化...',
  /** 解析依赖 */
  RESOLVING_DEPENDENCIES: '正在解析依赖...',
  /** 转换代码 */
  TRANSFORMING: '正在转换代码...',
  /** 生成代码 */
  GENERATING: '正在生成代码...',
  /** 优化代码 */
  OPTIMIZING: '正在优化代码...',
  /** 写入文件 */
  WRITING_FILES: '正在写入文件...',
  /** 压缩文件 */
  COMPRESSING: '正在压缩文件...',
  /** 完成 */
  COMPLETED: '已完成'
} as const

/**
 * 状态消息
 */
export const STATUS_MESSAGES = {
  /** 空闲状态 */
  IDLE: '空闲',
  /** 启动中 */
  STARTING: '启动中',
  /** 运行中 */
  RUNNING: '运行中',
  /** 构建中 */
  BUILDING: '构建中',
  /** 预览中 */
  PREVIEWING: '预览中',
  /** 停止中 */
  STOPPING: '停止中',
  /** 已停止 */
  STOPPED: '已停止',
  /** 错误状态 */
  ERROR: '错误',
  /** 重启中 */
  RESTARTING: '重启中'
} as const

/**
 * 提示消息
 */
export const PROMPT_MESSAGES = {
  /** 确认操作 */
  CONFIRM_ACTION: '确认执行此操作吗？',
  /** 选择配置文件 */
  SELECT_CONFIG: '请选择配置文件:',
  /** 输入端口号 */
  INPUT_PORT: '请输入端口号:',
  /** 输入主机地址 */
  INPUT_HOST: '请输入主机地址:',
  /** 选择运行模式 */
  SELECT_MODE: '请选择运行模式:',
  /** 输入输出目录 */
  INPUT_OUT_DIR: '请输入输出目录:',
  /** 确认覆盖文件 */
  CONFIRM_OVERWRITE: '文件已存在，是否覆盖？',
  /** 确认删除 */
  CONFIRM_DELETE: '确认删除吗？',
  /** 输入插件名称 */
  INPUT_PLUGIN_NAME: '请输入插件名称:',
  /** 选择插件版本 */
  SELECT_PLUGIN_VERSION: '请选择插件版本:'
} as const

/**
 * 时间格式化消息
 */
export const TIME_MESSAGES = {
  /** 毫秒 */
  MILLISECONDS: 'ms',
  /** 秒 */
  SECONDS: 's',
  /** 分钟 */
  MINUTES: 'm',
  /** 小时 */
  HOURS: 'h',
  /** 天 */
  DAYS: 'd',
  /** 刚刚 */
  JUST_NOW: '刚刚',
  /** 几秒前 */
  SECONDS_AGO: '秒前',
  /** 几分钟前 */
  MINUTES_AGO: '分钟前',
  /** 几小时前 */
  HOURS_AGO: '小时前',
  /** 几天前 */
  DAYS_AGO: '天前'
} as const

/**
 * 文件大小格式化消息
 */
export const SIZE_MESSAGES = {
  /** 字节 */
  BYTES: 'B',
  /** 千字节 */
  KILOBYTES: 'KB',
  /** 兆字节 */
  MEGABYTES: 'MB',
  /** 吉字节 */
  GIGABYTES: 'GB',
  /** 太字节 */
  TERABYTES: 'TB'
} as const
