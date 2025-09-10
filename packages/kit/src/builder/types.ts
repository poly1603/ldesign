/**
 * Builder CLI 类型定义
 */

/**
 * Builder CLI 选项
 */
export interface BuilderCLIOptions {
  /** 工作目录 */
  cwd?: string
  /** 配置文件路径 */
  config?: string
  /** 是否显示详细日志 */
  verbose?: boolean
  /** 是否静默模式 */
  silent?: boolean
}

/**
 * CLI 命令接口
 */
export interface CLICommand {
  /** 命令名称 */
  name: string
  /** 命令描述 */
  description: string
  /** 命令别名 */
  alias?: string[]
  /** 命令选项 */
  options?: CommandOption[]
  /** 命令执行函数 */
  action: <A = unknown, O = Record<string, unknown>>(args: A, options: O) => Promise<void>
}

/**
 * 命令选项
 */
export interface CommandOption {
  /** 选项名称 */
  name: string
  /** 选项描述 */
  description: string
  /** 选项类型 */
  type?: 'string' | 'boolean' | 'number'
  /** 默认值 */
  default?: unknown
  /** 是否必需 */
  required?: boolean
  /** 选项别名 */
  alias?: string
}

/**
 * 配置文件接口
 */
export interface ConfigFile {
  /** 配置文件路径 */
  path: string
  /** 配置内容 */
  config: BuildOptions
  /** 是否存在 */
  exists: boolean
}

/**
 * Build 命令选项
 */
export interface BuildCommand {
  /** 构建模式 */
  mode?: 'development' | 'production'
  /** 是否监听模式 */
  watch?: boolean
  /** 是否清理输出目录 */
  clean?: boolean
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 是否压缩代码 */
  minify?: boolean
  /** 输出目录 */
  outDir?: string
  /** 输出格式 */
  formats?: string | string[]
  /** 是否生成类型声明文件 */
  dts?: boolean
}

/**
 * Dev 命令选项
 */
export interface DevCommand {
  /** 端口号 */
  port?: number
  /** 主机地址 */
  host?: string
  /** 是否自动打开浏览器 */
  open?: boolean
  /** 防抖延迟 */
  debounce?: number
}

/**
 * Analyze 命令选项
 */
export interface AnalyzeCommand {
  /** 分析深度 */
  depth?: number
  /** 是否包含依赖分析 */
  dependencies?: boolean
  /** 是否生成报告 */
  report?: boolean
  /** 报告输出路径 */
  output?: string
}

/**
 * Init 命令选项
 */
export interface InitCommand {
  /** 项目模板 */
  template?: 'vanilla' | 'vue' | 'react' | 'typescript' | 'library'
  /** 是否使用 TypeScript */
  typescript?: boolean
  /** 项目名称 */
  name?: string
  /** 输出目录 */
  output?: string
  /** 是否覆盖已存在的文件 */
  force?: boolean
}

/**
 * 本地 BuildOptions 定义（与 @ldesign/builder 松耦合）
 */
export interface BuildOptions {
  input?: string | string[] | Record<string, string>
  outDir?: string
  formats?: string[]
  external?: string[]
  globals?: Record<string, string>
  plugins?: unknown[]
  rollupOptions?: Record<string, unknown>
  output?: unknown
  [key: string]: unknown
}

/** 运行结果类型（与 @ldesign/builder 松耦合） */
export interface BuildResult {
  success: boolean
  outputs: Array<{ fileName: string, size: number }>
  duration: number
  errors?: Array<{ message: string }>
}

export type WatchResult = unknown

export interface AnalyzeResult {
  projectType: string
  stats: Record<string, unknown>
  files: unknown[]
  entryPoints: string[]
  recommendations: string[]
  issues: string[]
}

export interface InitResult {
  success: boolean
  path: string
  files: string[]
}
