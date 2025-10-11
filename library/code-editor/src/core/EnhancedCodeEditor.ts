import * as monaco from 'monaco-editor'
import { CodeEditor } from './CodeEditor'
import type {
  ExtendedCodeEditorConfig,
  LoadingState,
  ICodeEditor
} from '../types'
import { setupMonacoWorkers, preloadLanguages } from '../utils/workers'
import { PluginManager, registerCommonSnippets } from '../utils/plugins'
import { normalizeLanguage } from '../utils/language-utils'

/**
 * 增强型代码编辑器
 * 包含 Loading 状态、插件系统等高级功能
 */
export class EnhancedCodeEditor extends CodeEditor {
  private loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    message: ''
  }
  private loadingOverlay: HTMLElement | null = null
  private pluginManager: PluginManager
  private extendedConfig: ExtendedCodeEditorConfig

  constructor(container: HTMLElement, config: ExtendedCodeEditorConfig = {}) {
    // 在初始化编辑器前显示 loading
    const showLoading = config.showLoading !== false
    const loadingOverlay = showLoading ? EnhancedCodeEditor.createLoadingOverlay(container, config.loadingText) : null

    // 存储扩展配置
    const extendedConfig = config

    // 调用父类构造函数前先不初始化
    // 我们需要异步初始化
    super(container, { ...config, value: config.value || '' })

    this.extendedConfig = extendedConfig
    this.pluginManager = PluginManager.getInstance()
    this.loadingOverlay = loadingOverlay

    // 异步初始化
    this.asyncInit()
  }

  /**
   * 异步初始化编辑器
   */
  private async asyncInit(): Promise<void> {
    try {
      this.updateLoadingState(true, 20, '正在配置 Monaco Editor Workers...')

      // 配置 Workers
      setupMonacoWorkers()

      this.updateLoadingState(true, 40, '正在预加载语言支持...')

      // 预加载语言
      const language = this.extendedConfig.language || 'javascript'
      await preloadLanguages([language])

      this.updateLoadingState(true, 60, '正在加载插件...')

      // 加载插件
      if (this.extendedConfig.plugins) {
        await this.pluginManager.loadByConfig(this.extendedConfig.plugins)
      }

      // 加载常用代码片段
      if (this.extendedConfig.plugins?.snippets !== false) {
        registerCommonSnippets()
      }

      // 根据语言自动加载对应插件
      await this.loadLanguagePlugins(language)

      this.updateLoadingState(true, 100, '加载完成')

      // 延迟移除 loading，让用户看到完成状态
      setTimeout(() => {
        this.hideLoading()
      }, 300)
    } catch (error) {
      console.error('编辑器初始化失败:', error)
      this.updateLoadingState(false, 0, '加载失败')
      this.hideLoading()
    }
  }

  /**
   * 根据语言加载对应插件
   */
  private async loadLanguagePlugins(language: string): Promise<void> {
    const plugins: string[] = []

    // 标准化语言名称（tsx -> typescriptreact, jsx -> javascriptreact）
    const normalizedLanguage = normalizeLanguage(language)

    if (['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(normalizedLanguage)) {
      plugins.push('typescript')
    }

    if (normalizedLanguage === 'vue') {
      plugins.push('vue')
      // Emmet 会在 Vue 插件中自动注册
    }

    if (['typescriptreact', 'javascriptreact'].includes(normalizedLanguage)) {
      plugins.push('react')
      // Emmet 会在 React 插件中自动注册
    }

    if (['html', 'css', 'scss', 'less'].includes(normalizedLanguage)) {
      plugins.push('emmet')
    }

    if (plugins.length > 0) {
      await this.pluginManager.loadPlugins(plugins)
    }
  }

  /**
   * 更新加载状态
   */
  private updateLoadingState(isLoading: boolean, progress: number, message: string): void {
    this.loadingState = { isLoading, progress, message }

    // 更新 loading UI
    if (this.loadingOverlay) {
      const progressBar = this.loadingOverlay.querySelector<HTMLElement>('.ld-loading-progress')
      const messageEl = this.loadingOverlay.querySelector<HTMLElement>('.ld-loading-message')

      if (progressBar) {
        progressBar.style.width = `${progress}%`
      }

      if (messageEl) {
        messageEl.textContent = message
      }
    }

    // 触发回调
    if (this.extendedConfig.onLoadingChange) {
      this.extendedConfig.onLoadingChange(this.loadingState)
    }
  }

  /**
   * 隐藏 loading
   */
  private hideLoading(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.opacity = '0'
      setTimeout(() => {
        this.loadingOverlay?.remove()
        this.loadingOverlay = null
      }, 300)
    }
  }

  /**
   * 获取加载状态
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState }
  }

  /**
   * 创建 Loading 遮罩层
   */
  private static createLoadingOverlay(container: HTMLElement, customText?: string): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'ld-editor-loading-overlay'
    overlay.innerHTML = `
      <div class="ld-loading-spinner"></div>
      <div class="ld-loading-message">${customText || '正在初始化编辑器...'}</div>
      <div class="ld-loading-progress-container">
        <div class="ld-loading-progress"></div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .ld-editor-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(30, 30, 30, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: opacity 0.3s ease;
      }

      .ld-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: #667eea;
        border-radius: 50%;
        animation: ld-spin 0.8s linear infinite;
      }

      @keyframes ld-spin {
        to { transform: rotate(360deg); }
      }

      .ld-loading-message {
        margin-top: 20px;
        color: #fff;
        font-size: 14px;
      }

      .ld-loading-progress-container {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin-top: 15px;
        overflow: hidden;
      }

      .ld-loading-progress {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
        transition: width 0.3s ease;
        width: 0%;
      }
    `

    container.style.position = 'relative'
    container.appendChild(style)
    container.appendChild(overlay)

    return overlay
  }
}

/**
 * 创建增强型代码编辑器的便捷函数
 */
export function createEnhancedCodeEditor(
  container: HTMLElement | string,
  config: ExtendedCodeEditorConfig = {}
): ICodeEditor {
  const element = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)
    : container

  if (!element) {
    throw new Error('Container element not found')
  }

  return new EnhancedCodeEditor(element, config)
}
