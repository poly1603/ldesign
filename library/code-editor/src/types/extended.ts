import type { CodeEditorConfig } from './index'

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
  /** 加载状态变化回调 */
  onLoadingChange?: (state: LoadingState) => void
}
