import type { CodeEditorConfig } from './index'
import type { EditorFeatureConfig } from '../utils/features'

/**
 * 编辑器加载状态
 */
export interface LoadingState {
  isLoading: boolean
  progress: number
  message: string
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 是否启用 Emmet */
  emmet?: boolean
  /** 是否启用代码片段 */
  snippets?: boolean
  /** 是否启用括号高亮 */
  bracketMatching?: boolean
  /** 是否启用自动闭合标签 */
  autoClosingTags?: boolean
  /** 是否启用格式化 */
  formatOnPaste?: boolean
  /** 是否启用格式化 */
  formatOnType?: boolean
  /** 是否启用 Vue 支持 */
  vue?: boolean
  /** 是否启用 React/JSX 支持 */
  react?: boolean
  /** 是否启用 TypeScript 增强 */
  typescript?: boolean
  /** 是否启用 Python 支持 */
  python?: boolean
  /** 是否启用 Go 支持 */
  go?: boolean
  /** 是否启用 Rust 支持 */
  rust?: boolean
  /** 自定义插件列表 */
  custom?: string[]
}

/**
 * Monaco Worker 配置
 */
export interface WorkerConfig {
  /** 是否启用 TypeScript/JavaScript worker */
  typescript?: boolean
  /** 是否启用 JSON worker */
  json?: boolean
  /** 是否启用 CSS worker */
  css?: boolean
  /** 是否启用 HTML worker */
  html?: boolean
  /** 自定义 worker 路径 */
  workerPath?: string
  /** Worker 内存限制 (MB) */
  memoryLimit?: number
  /** Worker 超时时间 (ms) */
  timeout?: number
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 默认主题 */
  default?: string
  /** 是否自动跟随系统主题 */
  followSystem?: boolean
  /** 自定义主题列表 */
  custom?: Array<{
    name: string
    data: any
  }>
  /** 主题切换回调 */
  onThemeChange?: (theme: string) => void
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用虚拟滚动 */
  virtualScrolling?: boolean
  /** 是否启用大文件优化 */
  largeFileOptimizations?: boolean
  /** 大文件阈值 (字符数) */
  largeFileThreshold?: number
  /** 是否启用延迟加载 */
  lazyLoading?: boolean
  /** 渲染延迟 (ms) */
  renderDelay?: number
  /** 最大撤销栈大小 */
  maxUndoStackSize?: number
  /** 是否启用语法高亮缓存 */
  syntaxHighlightCache?: boolean
}

/**
 * 协作编辑配置
 */
export interface CollaborationConfig {
  /** 是否启用协作编辑 */
  enabled?: boolean
  /** WebSocket 服务器地址 */
  serverUrl?: string
  /** 用户信息 */
  user?: {
    id: string
    name: string
    color?: string
  }
  /** 协作房间 ID */
  roomId?: string
  /** 是否显示其他用户光标 */
  showCursors?: boolean
  /** 是否显示其他用户选择 */
  showSelections?: boolean
}

/**
 * 代码补全配置
 */
export interface CompletionConfig {
  /** 是否启用智能补全 */
  enabled?: boolean
  /** 触发字符 */
  triggerCharacters?: string[]
  /** 补全延迟 (ms) */
  delay?: number
  /** 是否显示文档 */
  showDocumentation?: boolean
  /** 是否显示参数提示 */
  showParameterHints?: boolean
  /** 自定义补全提供器 */
  customProviders?: string[]
  /** AI 补全配置 */
  ai?: {
    enabled?: boolean
    apiKey?: string
    model?: string
    maxTokens?: number
  }
}

/**
 * 验证配置
 */
export interface ValidationConfig {
  /** 是否启用实时验证 */
  enabled?: boolean
  /** 验证延迟 (ms) */
  delay?: number
  /** 是否显示错误装饰 */
  showDecorations?: boolean
  /** 是否显示问题面板 */
  showProblems?: boolean
  /** 自定义验证规则 */
  customRules?: Array<{
    language: string
    rules: any[]
  }>
}

/**
 * 格式化配置
 */
export interface FormattingConfig {
  /** 是否在保存时格式化 */
  formatOnSave?: boolean
  /** 是否在粘贴时格式化 */
  formatOnPaste?: boolean
  /** 是否在输入时格式化 */
  formatOnType?: boolean
  /** 格式化延迟 (ms) */
  delay?: number
  /** 自定义格式化器 */
  customFormatter?: string
  /** Prettier 配置 */
  prettier?: any
  /** ESLint 配置 */
  eslint?: any
}

/**
 * 快捷键配置
 */
export interface KeybindingsConfig {
  /** 自定义快捷键映射 */
  custom?: Array<{
    key: string
    command: string
    when?: string
  }>
  /** 是否使用 Vim 模式 */
  vimMode?: boolean
  /** 是否使用 Emacs 模式 */
  emacsMode?: boolean
  /** 快捷键方案 */
  scheme?: 'default' | 'vscode' | 'sublime' | 'atom' | 'vim' | 'emacs'
}

/**
 * 编辑器完整配置（扩展）
 */
export interface ExtendedCodeEditorConfig extends CodeEditorConfig {
  /** 是否显示 loading */
  showLoading?: boolean
  /** 自定义 loading 文本 */
  loadingText?: string
  /** 插件配置 */
  plugins?: PluginConfig
  /** Worker 配置 */
  workers?: WorkerConfig
  /** 主题配置 */
  themes?: ThemeConfig
  /** 功能配置 */
  features?: EditorFeatureConfig
  /** 性能配置 */
  performance?: PerformanceConfig
  /** 协作编辑配置 */
  collaboration?: CollaborationConfig
  /** 代码补全配置 */
  completion?: CompletionConfig
  /** 验证配置 */
  validation?: ValidationConfig
  /** 格式化配置 */
  formatting?: FormattingConfig
  /** 快捷键配置 */
  keybindings?: KeybindingsConfig
  /** 加载状态变化回调 */
  onLoadingChange?: (state: LoadingState) => void
  /** 编辑器初始化完成回调 */
  onInitialized?: () => void
  /** 错误处理回调 */
  onError?: (error: Error) => void
}

/**
 * 编辑器命令接口
 */
export interface IEditorCommand {
  id: string
  label: string
  keybindings?: number[]
  precondition?: string
  run: (editor: any, ...args: any[]) => void | Promise<void>
}

/**
 * 编辑器扩展接口
 */
export interface IEditorExtension {
  name: string
  version: string
  activate: (editor: any) => void | Promise<void>
  deactivate?: () => void | Promise<void>
  commands?: IEditorCommand[]
  languages?: string[]
  themes?: any[]
  snippets?: any[]
}

/**
 * 编辑器服务接口
 */
export interface IEditorService {
  /** 获取当前活动编辑器 */
  getActiveEditor(): any | null
  /** 获取所有编辑器 */
  getAllEditors(): any[]
  /** 打开文件 */
  openFile(path: string, options?: any): Promise<any>
  /** 保存文件 */
  saveFile(editor: any): Promise<boolean>
  /** 关闭编辑器 */
  closeEditor(editor: any): Promise<boolean>
  /** 注册扩展 */
  registerExtension(extension: IEditorExtension): void
  /** 执行命令 */
  executeCommand(commandId: string, ...args: any[]): Promise<any>
}
