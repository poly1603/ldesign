import * as monaco from 'monaco-editor'
import { CodeEditor } from './CodeEditor'
import type {
  ExtendedCodeEditorConfig,
  LoadingState,
  ICodeEditor
} from '../types'
import { setupMonacoWorkers, preloadLanguages } from '../utils/workers'
import { PluginManager, registerCommonSnippets } from '../utils/plugins'
import { 
  getLanguageByExtension, 
  getRecommendedPlugins,
  configureLanguageDefaults,
  getDefaultTabSize 
} from '../utils/language-utils'
import { ThemeManager } from '../utils/themes'
import { EditorFeatureManager } from '../utils/features'

/**
 * 增强型代码编辑器
 * 包含 Loading 状态、插件系统、主题管理、高级功能等
 */
export class EnhancedCodeEditor extends CodeEditor {
  private loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    message: ''
  }
  private loadingOverlay: HTMLElement | null = null
  private pluginManager: PluginManager
  private themeManager: ThemeManager
  private featureManager: EditorFeatureManager
  private extendedConfig: ExtendedCodeEditorConfig
  private _isInitialized: boolean = false

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
    this.themeManager = ThemeManager.getInstance()
    this.featureManager = new EditorFeatureManager()
    this.loadingOverlay = loadingOverlay

    // 异步初始化
    this.asyncInit()
  }

  /**
   * 异步初始化编辑器
   */
  private async asyncInit(): Promise<void> {
    try {
      this.updateLoadingState(true, 10, '正在初始化编辑器核心...')

      // 等待编辑器基础初始化完成
      await this.waitForEditor()

      this.updateLoadingState(true, 20, '正在配置 Monaco Editor Workers...')

      // 配置 Workers
      setupMonacoWorkers(this.extendedConfig.workers)

      this.updateLoadingState(true, 30, '正在配置语言支持...')

      // 配置语言
      const language = this.extendedConfig.language || 'javascript'
      configureLanguageDefaults(language)
      await preloadLanguages([language])

      // 设置语言特定的 tabSize
      const tabSize = this.extendedConfig.tabSize || getDefaultTabSize(language)
      this.getEditor()?.updateOptions({ tabSize })

      this.updateLoadingState(true, 40, '正在加载主题...')

      // 配置主题
      await this.initializeThemes()

      this.updateLoadingState(true, 50, '正在加载插件...')

      // 加载插件
      if (this.extendedConfig.plugins) {
        await this.pluginManager.loadByConfig(this.extendedConfig.plugins)
      }

      // 加载常用代码片段
      if (this.extendedConfig.plugins?.snippets !== false) {
        registerCommonSnippets()
      }

      // 根据语言自动加载对应插件
      const recommendedPlugins = getRecommendedPlugins(language)
      if (recommendedPlugins.length > 0) {
        await this.pluginManager.loadPlugins(recommendedPlugins)
      }

      this.updateLoadingState(true, 70, '正在配置编辑器功能...')

      // 配置高级功能
      await this.initializeFeatures()

      this.updateLoadingState(true, 85, '正在优化性能设置...')

      // 应用性能优化
      this.applyPerformanceOptimizations()

      this.updateLoadingState(true, 95, '正在完成初始化...')

      // 配置格式化
      this.configureFormatting()

      // 配置验证
      this.configureValidation()

      // 配置快捷键
      this.configureKeybindings()

      this.updateLoadingState(true, 100, '加载完成')
      this._isInitialized = true

      // 触发初始化完成回调
      if (this.extendedConfig.onInitialized) {
        this.extendedConfig.onInitialized()
      }

      // 延迟移除 loading，让用户看到完成状态
      setTimeout(() => {
        this.hideLoading()
      }, 300)
    } catch (error) {
      console.error('编辑器初始化失败:', error)
      this.updateLoadingState(false, 0, '加载失败')
      this.hideLoading()
      
      // 触发错误回调
      if (this.extendedConfig.onError) {
        this.extendedConfig.onError(error as Error)
      }
    }
  }

  /**
   * 等待编辑器实例准备就绪
   */
  private async waitForEditor(): Promise<void> {
    return new Promise((resolve) => {
      const checkEditor = () => {
        try {
          const editor = this.getEditor()
          if (editor) {
            resolve()
          } else {
            setTimeout(checkEditor, 50)
          }
        } catch {
          setTimeout(checkEditor, 50)
        }
      }
      checkEditor()
    })
  }

  /**
   * 初始化主题
   */
  private async initializeThemes(): Promise<void> {
    const themeConfig = this.extendedConfig.themes
    
    if (!themeConfig) return

    // 注册自定义主题
    if (themeConfig.custom) {
      themeConfig.custom.forEach(({ name, data }) => {
        this.themeManager.registerTheme(name, data)
      })
    }

    // 应用主题
    if (themeConfig.followSystem) {
      // 跟随系统主题
      const theme = this.themeManager.applySystemTheme()
      if (themeConfig.onThemeChange) {
        themeConfig.onThemeChange(theme)
      }

      // 监听系统主题变化
      this.themeManager.watchSystemTheme((theme) => {
        if (themeConfig.onThemeChange) {
          themeConfig.onThemeChange(theme)
        }
      })
    } else if (themeConfig.default) {
      // 应用默认主题
      this.setTheme(themeConfig.default)
    }
  }

  /**
   * 初始化编辑器功能
   */
  private async initializeFeatures(): Promise<void> {
    const editor = this.getEditor()
    if (!editor) return

    this.featureManager.setEditor(editor)

    // 配置功能
    if (this.extendedConfig.features) {
      this.featureManager.configureFeatures(this.extendedConfig.features)
    }

    // 启用所有增强功能
    if (this.extendedConfig.features?.multiCursor) {
      this.featureManager.enableMultiCursor()
    }
    if (this.extendedConfig.features?.bracketMatching) {
      this.featureManager.enableSmartBrackets()
    }
    if (this.extendedConfig.features?.folding) {
      this.featureManager.enhanceFolding()
    }
    if (this.extendedConfig.features?.find) {
      this.featureManager.enableEnhancedFind()
    }
    if (this.extendedConfig.features?.smartSelect) {
      this.featureManager.enableSmartSelect()
    }
    if (this.extendedConfig.features?.columnSelection) {
      this.featureManager.enableColumnSelection()
    }
    if (this.extendedConfig.features?.minimap) {
      this.featureManager.enhanceMinimap()
    }

    // 添加自定义快捷键
    this.featureManager.addCustomKeybindings()
    this.featureManager.addContextMenuItems()
  }

  /**
   * 应用性能优化
   */
  private applyPerformanceOptimizations(): void {
    const perfConfig = this.extendedConfig.performance
    if (!perfConfig) return

    const editor = this.getEditor()
    if (!editor) return

    const options: any = {}

    if (perfConfig.virtualScrolling !== undefined) {
      options.smoothScrolling = perfConfig.virtualScrolling
    }

    if (perfConfig.largeFileOptimizations) {
      options.largeFileOptimizations = true
      // 设置大文件阈值
      if (perfConfig.largeFileThreshold) {
        const model = editor.getModel()
        if (model && model.getValue().length > perfConfig.largeFileThreshold) {
          options.renderWhitespace = 'none'
          options.renderControlCharacters = false
          options.fontLigatures = false
          options.minimap = { enabled: false }
        }
      }
    }

    if (perfConfig.syntaxHighlightCache) {
      options.useShadowDOM = true
    }

    editor.updateOptions(options)
  }

  /**
   * 配置格式化
   */
  private configureFormatting(): void {
    const formatConfig = this.extendedConfig.formatting
    if (!formatConfig) return

    const editor = this.getEditor()
    if (!editor) return

    // 配置格式化选项
    if (formatConfig.formatOnType) {
      editor.updateOptions({ formatOnType: true })
    }
    if (formatConfig.formatOnPaste) {
      editor.updateOptions({ formatOnPaste: true })
    }

    // 自动格式化
    if (formatConfig.formatOnSave) {
      // 这里可以添加保存时格式化的逻辑
      console.log('Format on save enabled')
    }
  }

  /**
   * 配置验证
   */
  private configureValidation(): void {
    const validationConfig = this.extendedConfig.validation
    if (!validationConfig || !validationConfig.enabled) return

    // 配置验证选项
    const language = this.extendedConfig.language || 'javascript'
    
    // 这里可以根据语言配置相应的验证规则
    console.log('Validation configured for', language)
  }

  /**
   * 配置快捷键
   */
  private configureKeybindings(): void {
    const keybindingsConfig = this.extendedConfig.keybindings
    if (!keybindingsConfig) return

    const editor = this.getEditor()
    if (!editor) return

    // 添加自定义快捷键
    if (keybindingsConfig.custom) {
      keybindingsConfig.custom.forEach(({ key, command, when }) => {
        // 这里可以解析快捷键字符串并添加到编辑器
        console.log('Custom keybinding:', key, command, when)
      })
    }

    // 配置快捷键方案
    if (keybindingsConfig.scheme) {
      console.log('Keybinding scheme:', keybindingsConfig.scheme)
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
   * 设置主题
   */
  setTheme(theme: string): void {
    super.setTheme(theme)
    const themeConfig = this.extendedConfig.themes
    if (themeConfig?.onThemeChange) {
      themeConfig.onThemeChange(theme)
    }
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[] {
    return this.themeManager.getAvailableThemes()
  }

  /**
   * 获取功能管理器
   */
  getFeatureManager(): EditorFeatureManager {
    return this.featureManager
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * 根据文件名设置语言
   */
  setLanguageByFilename(filename: string): void {
    const language = getLanguageByExtension(filename)
    this.setLanguage(language)
  }

  /**
   * 获取初始化状态
   */
  get isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * 获取编辑器统计信息
   */
  getStats(): any {
    return this.featureManager.getEditorStats()
  }

  /**
   * 创建 Diff 编辑器
   */
  createDiffEditor(
    container: HTMLElement,
    original: string,
    modified: string,
    language?: string
  ): monaco.editor.IStandaloneDiffEditor {
    return this.featureManager.createDiffEditor(container, original, modified, language)
  }

  /**
   * 销毁编辑器
   */
  dispose(): void {
    this.featureManager.dispose()
    super.dispose()
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
