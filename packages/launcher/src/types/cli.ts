/**
 * CLI 相关类型定义
 * 
 * 定义命令行工具的相关类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { LogLevel, Mode, FilePath, Host, Port } from './common'

/**
 * CLI 命令枚举
 * 定义支持的命令行命令
 */
export enum CliCommand {
  /** 启动开发服务器 */
  DEV = 'dev',
  /** 执行生产构建 */
  BUILD = 'build',
  /** 预览构建结果 */
  PREVIEW = 'preview',
  /** 配置管理 */
  CONFIG = 'config',
  /** 显示帮助信息 */
  HELP = 'help',
  /** 显示版本信息 */
  VERSION = 'version'
}

/**
 * CLI 选项接口
 * 定义命令行选项的结构
 */
export interface CliOptions {
  /** 配置文件路径 */
  config?: FilePath

  /** 运行模式 */
  mode?: Mode

  /** 环境名称 */
  environment?: string

  /** 端口号 */
  port?: Port

  /** 主机地址 */
  host?: Host

  /** 是否自动打开浏览器 */
  open?: boolean | string

  /** 是否强制重新构建依赖 */
  force?: boolean

  /** 是否启用调试模式 */
  debug?: boolean

  /** 是否启用静默模式 */
  silent?: boolean

  /** 日志级别 */
  logLevel?: LogLevel

  /** 输出目录 */
  outDir?: FilePath

  /** 是否生成 sourcemap */
  sourcemap?: boolean

  /** 是否压缩代码 */
  minify?: boolean

  /** 是否启用监听模式 */
  watch?: boolean

  /** 是否清空输出目录 */
  emptyOutDir?: boolean

  /** 构建目标 */
  target?: string

  /** 是否生成构建报告 */
  report?: boolean

  /** 是否启用 HTTPS */
  https?: boolean

  /** 工作目录 */
  cwd?: FilePath

  /** 环境变量 */
  env?: Record<string, string>

  /** 是否启用 CORS */
  cors?: boolean

  /** 是否严格端口模式 */
  strictPort?: boolean

  /** 是否输出 JSON 格式 */
  json?: boolean

  /** 是否显示详细信息 */
  verbose?: boolean

  /** 是否启用 SSR 模式 */
  ssr?: boolean

  /** 是否分析构建产物 */
  analyze?: boolean

  /** 是否显示所有信息 */
  all?: boolean

  /** 是否美化输出格式 */
  pretty?: boolean

  /** 是否清除屏幕 */
  clearScreen?: boolean

  /** 插件类别过滤 */
  category?: string

  /** 插件类型过滤 */
  type?: string

  /** 是否只显示官方插件 */
  official?: boolean

  /** 是否只显示已安装插件 */
  installed?: boolean

  /** 排序方式 */
  sort?: string

  /** 排序顺序 */
  order?: 'asc' | 'desc'

  /** 限制数量 */
  limit?: string

  /** 指定版本 */
  version?: string

  /** 开发依赖模式 */
  dev?: boolean

  /** 包管理器 */
  pm?: 'npm' | 'pnpm' | 'yarn'

  /** 跳过依赖安装 */
  'skip-deps'?: boolean

  /** 是否检查过期 */
  outdated?: boolean
}

/**
 * CLI 上下文接口
 * 定义 CLI 运行时的上下文信息
 */
export interface CliContext {
  /** 当前命令 */
  command: CliCommand

  /** 命令选项 */
  options: CliOptions

  /** 命令参数 */
  args: string[]

  /** 工作目录 */
  cwd: FilePath

  /** 配置文件路径 */
  configFile?: FilePath

  /** 是否为交互模式 */
  interactive: boolean

  /** 终端信息 */
  terminal: TerminalInfo

  /** 环境信息 */
  environment: EnvironmentInfo
}

/**
 * 终端信息接口
 * 定义终端的相关信息
 */
export interface TerminalInfo {
  /** 终端宽度 */
  width: number

  /** 终端高度 */
  height: number

  /** 是否支持颜色 */
  supportsColor: boolean

  /** 是否为 TTY */
  isTTY: boolean

  /** 终端类型 */
  type?: string

  /** 是否支持 Unicode */
  supportsUnicode: boolean
}

/**
 * 环境信息接口
 * 定义运行环境的相关信息
 */
export interface EnvironmentInfo {
  /** Node.js 版本 */
  nodeVersion: string

  /** npm 版本 */
  npmVersion?: string

  /** pnpm 版本 */
  pnpmVersion?: string

  /** yarn 版本 */
  yarnVersion?: string

  /** 操作系统 */
  os: string

  /** CPU 架构 */
  arch: string

  /** 内存大小 */
  memory: number

  /** 环境变量 */
  env: Record<string, string>
}

/**
 * CLI 命令定义接口
 * 定义单个 CLI 命令的结构
 */
export interface CliCommandDefinition {
  /** 命令名称 */
  name: string

  /** 命令别名 */
  aliases?: string[]

  /** 命令描述 */
  description: string

  /** 命令用法 */
  usage?: string

  /** 命令选项 */
  options: CliOptionDefinition[]

  /** 命令示例 */
  examples?: CliExample[]

  /** 命令处理函数 */
  handler: (context: CliContext) => Promise<void> | void

  /** 命令验证函数 */
  validate?: (context: CliContext) => boolean | string
}

/**
 * CLI 选项定义接口
 * 定义单个 CLI 选项的结构
 */
export interface CliOptionDefinition {
  /** 选项名称 */
  name: string

  /** 选项别名 */
  alias?: string

  /** 选项描述 */
  description: string

  /** 选项类型 */
  type: 'string' | 'number' | 'boolean' | 'array'

  /** 默认值 */
  default?: any

  /** 是否必需 */
  required?: boolean

  /** 选项值的选择范围 */
  choices?: string[]

  /** 选项验证函数 */
  validate?: (value: any) => boolean | string
}

/**
 * CLI 示例接口
 * 定义命令使用示例的结构
 */
export interface CliExample {
  /** 示例描述 */
  description: string

  /** 示例命令 */
  command: string
}

/**
 * CLI 输出接口
 * 定义 CLI 输出的结构
 */
export interface CliOutput {
  /** 输出类型 */
  type: 'info' | 'success' | 'warning' | 'error' | 'debug'

  /** 输出消息 */
  message: string

  /** 输出数据 */
  data?: any

  /** 时间戳 */
  timestamp: number

  /** 是否需要换行 */
  newline?: boolean

  /** 输出样式 */
  style?: OutputStyle
}

/**
 * 输出样式接口
 * 定义输出文本的样式
 */
export interface OutputStyle {
  /** 文本颜色 */
  color?: string

  /** 背景颜色 */
  backgroundColor?: string

  /** 是否加粗 */
  bold?: boolean

  /** 是否斜体 */
  italic?: boolean

  /** 是否下划线 */
  underline?: boolean

  /** 是否删除线 */
  strikethrough?: boolean
}

/**
 * CLI 进度信息接口
 * 定义进度显示的结构
 */
export interface CliProgress {
  /** 当前进度（0-100） */
  percentage: number

  /** 进度描述 */
  message: string

  /** 当前步骤 */
  current: number

  /** 总步骤数 */
  total: number

  /** 是否完成 */
  completed: boolean

  /** 开始时间 */
  startTime: number

  /** 估计剩余时间 */
  estimatedTimeRemaining?: number
}

/**
 * CLI 交互选项接口
 * 定义交互式输入的选项
 */
export interface CliInteractiveOption {
  /** 选项类型 */
  type: 'input' | 'select' | 'multiselect' | 'confirm' | 'password'

  /** 提示消息 */
  message: string

  /** 默认值 */
  default?: any

  /** 选择项（用于 select 和 multiselect） */
  choices?: CliChoice[]

  /** 验证函数 */
  validate?: (value: any) => boolean | string

  /** 转换函数 */
  transform?: (value: any) => any

  /** 是否必需 */
  required?: boolean
}

/**
 * CLI 选择项接口
 * 定义选择列表中的选项
 */
export interface CliChoice {
  /** 选项名称 */
  name: string

  /** 选项值 */
  value: any

  /** 选项描述 */
  description?: string

  /** 是否禁用 */
  disabled?: boolean

  /** 是否默认选中 */
  checked?: boolean
}

/**
 * CLI 配置接口
 * 定义 CLI 工具的配置
 */
export interface CliConfig {
  /** 工具名称 */
  name: string

  /** 工具版本 */
  version: string

  /** 工具描述 */
  description: string

  /** 支持的命令 */
  commands: CliCommandDefinition[]

  /** 全局选项 */
  globalOptions: CliOptionDefinition[]

  /** 帮助配置 */
  help: HelpConfig

  /** 主题配置 */
  theme: ThemeConfig
}

/**
 * 帮助配置接口
 * 定义帮助信息的配置
 */
export interface HelpConfig {
  /** 是否显示示例 */
  showExamples: boolean

  /** 是否显示别名 */
  showAliases: boolean

  /** 是否显示默认值 */
  showDefaults: boolean

  /** 帮助文本的最大宽度 */
  maxWidth: number

  /** 自定义帮助模板 */
  template?: string
}

/**
 * 主题配置接口
 * 定义 CLI 输出的主题配置
 */
export interface ThemeConfig {
  /** 主色调 */
  primary: string

  /** 成功色 */
  success: string

  /** 警告色 */
  warning: string

  /** 错误色 */
  error: string

  /** 信息色 */
  info: string

  /** 调试色 */
  debug: string

  /** 是否启用颜色 */
  enableColors: boolean

  /** 是否启用图标 */
  enableIcons: boolean
}

/**
 * CLI 事件类型枚举
 * 定义 CLI 相关的事件类型
 */
export enum CliEvent {
  /** 命令开始事件 */
  COMMAND_START = 'commandStart',
  /** 命令结束事件 */
  COMMAND_END = 'commandEnd',
  /** 命令错误事件 */
  COMMAND_ERROR = 'commandError',
  /** 用户输入事件 */
  USER_INPUT = 'userInput',
  /** 输出事件 */
  OUTPUT = 'output',
  /** 进度更新事件 */
  PROGRESS_UPDATE = 'progressUpdate'
}

/**
 * CLI 事件数据接口
 * 定义 CLI 事件携带的数据
 */
export interface CliEventData {
  [CliEvent.COMMAND_START]: {
    command: CliCommand
    options: CliOptions
    timestamp: number
  }

  [CliEvent.COMMAND_END]: {
    command: CliCommand
    exitCode: number
    duration: number
    timestamp: number
  }

  [CliEvent.COMMAND_ERROR]: {
    command: CliCommand
    error: Error
    timestamp: number
  }

  [CliEvent.USER_INPUT]: {
    prompt: string
    input: string
    timestamp: number
  }

  [CliEvent.OUTPUT]: {
    output: CliOutput
    timestamp: number
  }

  [CliEvent.PROGRESS_UPDATE]: {
    progress: CliProgress
    timestamp: number
  }
}
