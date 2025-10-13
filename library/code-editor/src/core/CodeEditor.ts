import * as monaco from 'monaco-editor'
import { normalizeLanguage } from '../utils/language-utils'
import type {
  CodeEditorConfig,
  CodeEditorOptions,
  EditorLanguage,
  EditorTheme,
  EditorState
} from '../types'

/**
 * 代码编辑器核心类
 * 基于 Monaco Editor 的高性能、框架无关的代码编辑器
 */
export class CodeEditor {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private container: HTMLElement
  private config: CodeEditorConfig
  private disposables: monaco.IDisposable[] = []

  /**
   * 创建代码编辑器实例
   * @param container - 编辑器容器元素
   * @param config - 编辑器配置
   */
  constructor(container: HTMLElement, config: CodeEditorConfig = {}) {
    this.container = container
    this.config = config
    this.init()
  }

  /**
   * 初始化编辑器
   */
  private init(): void {
    const options = this.buildMonacoOptions()

    this.editor = monaco.editor.create(this.container, options)

    this.setupEventListeners()

    // 触发就绪事件
    if (this.config.on?.ready) {
      this.config.on.ready(this.editor)
    }

    // 响应容器大小变化
    this.setupResizeObserver()
  }

  /**
   * 构建 Monaco 编辑器选项
   */
  private buildMonacoOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
    const {
      language = 'javascript',
      theme = 'vs-dark',
      value = '',
      readOnly = false,
      autoComplete = true,
      folding = true,
      lineNumbers = 'on',
      minimap = true,
      fontSize = 14,
      tabSize = 2,
      insertSpaces = true,
      wordWrap = 'off',
      scrollbar = {},
      monacoOptions = {}
    } = this.config

    // Normalize language names (tsx -> typescriptreact, etc.)
    const normalizedLanguage = normalizeLanguage(language)

    return {
      value,
      language: normalizedLanguage,
      theme,
      readOnly,
      fontSize,
      tabSize,
      insertSpaces,
      wordWrap,
      lineNumbers,
      folding,
      automaticLayout: true,
      minimap: {
        enabled: minimap
      },
      scrollbar: {
        vertical: scrollbar.vertical || 'auto',
        horizontal: scrollbar.horizontal || 'auto',
        verticalScrollbarSize: scrollbar.verticalScrollbarSize || 10,
        horizontalScrollbarSize: scrollbar.horizontalScrollbarSize || 10,
        useShadows: false
      },
      quickSuggestions: autoComplete,
      suggestOnTriggerCharacters: autoComplete,
      parameterHints: {
        enabled: autoComplete
      },
      ...monacoOptions
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.editor) return

    const { on } = this.config

    // 内容改变事件
    if (on?.change) {
      const changeDisposable = this.editor.onDidChangeModelContent((e) => {
        on.change!(this.getValue(), e)
      })
      this.disposables.push(changeDisposable)
    }

    // 光标位置改变事件
    if (on?.cursorChange) {
      const cursorDisposable = this.editor.onDidChangeCursorPosition((e) => {
        on.cursorChange!(e.position)
      })
      this.disposables.push(cursorDisposable)
    }

    // 聚焦事件
    if (on?.focus) {
      const focusDisposable = this.editor.onDidFocusEditorText(() => {
        on.focus!()
      })
      this.disposables.push(focusDisposable)
    }

    // 失焦事件
    if (on?.blur) {
      const blurDisposable = this.editor.onDidBlurEditorText(() => {
        on.blur!()
      })
      this.disposables.push(blurDisposable)
    }
  }

  /**
   * 设置 ResizeObserver 以响应容器大小变化
   */
  private setupResizeObserver(): void {
    if (!this.editor) return

    const resizeObserver = new ResizeObserver(() => {
      this.editor?.layout()
    })

    resizeObserver.observe(this.container)

    // 将 ResizeObserver 添加到 disposables
    this.disposables.push({
      dispose: () => resizeObserver.disconnect()
    })
  }

  /**
   * 获取编辑器值
   */
  getValue(): string {
    return this.editor?.getValue() || ''
  }

  /**
   * 设置编辑器值
   */
  setValue(value: string): void {
    this.editor?.setValue(value)
  }

  /**
   * 获取选中的文本
   */
  getSelection(): string {
    if (!this.editor) return ''
    const selection = this.editor.getSelection()
    if (!selection) return ''
    return this.editor.getModel()?.getValueInRange(selection) || ''
  }

  /**
   * 设置选中的文本
   */
  setSelection(selection: monaco.IRange): void {
    this.editor?.setSelection(selection)
  }

  /**
   * 插入文本
   */
  insertText(text: string, position?: monaco.IPosition): void {
    if (!this.editor) return

    const pos = position || this.editor.getPosition()
    if (!pos) return

    this.editor.executeEdits('insert', [
      {
        range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        text
      }
    ])
  }

  /**
   * 格式化代码
   */
  async format(): Promise<void> {
    if (!this.editor) return
    await this.editor.getAction('editor.action.formatDocument')?.run()
  }

  /**
   * 设置语言
   */
  setLanguage(language: EditorLanguage): void {
    if (!this.editor) return
    const model = this.editor.getModel()
    if (model) {
      // Normalize language names
      const normalizedLanguage = normalizeLanguage(language)
      monaco.editor.setModelLanguage(model, normalizedLanguage)
    }
  }

  /**
   * 设置主题
   */
  setTheme(theme: EditorTheme): void {
    monaco.editor.setTheme(theme)
  }

  /**
   * 设置只读
   */
  setReadOnly(readOnly: boolean): void {
    this.editor?.updateOptions({ readOnly })
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.editor?.focus()
  }

  /**
   * 获取光标位置
   */
  getPosition(): monaco.Position | null {
    return this.editor?.getPosition() || null
  }

  /**
   * 设置光标位置
   */
  setPosition(position: monaco.IPosition): void {
    this.editor?.setPosition(position)
  }

  /**
   * 撤销
   */
  undo(): void {
    this.editor?.trigger('keyboard', 'undo', null)
  }

  /**
   * 重做
   */
  redo(): void {
    this.editor?.trigger('keyboard', 'redo', null)
  }

  /**
   * 获取 Monaco 编辑器实例
   */
  getEditor(): monaco.editor.IStandaloneCodeEditor {
    if (!this.editor) {
      throw new Error('Editor is not initialized')
    }
    return this.editor
  }

  /**
   * 更新选项
   */
  updateOptions(options: CodeEditorOptions): void {
    if (!this.editor) return

    // 更新配置
    this.config = { ...this.config, ...options }

    // 更新 Monaco 选项
    const monacoOptions = this.buildMonacoOptions()
    this.editor.updateOptions(monacoOptions)

    // 如果语言改变，更新语言
    if (options.language) {
      this.setLanguage(options.language)
    }

    // 如果主题改变，更新主题
    if (options.theme) {
      this.setTheme(options.theme)
    }
  }

  /**
   * 获取编辑器状态
   */
  getState(): EditorState {
    const position = this.getPosition()
    const model = this.editor?.getModel()

    return {
      language: (model?.getLanguageId() || 'javascript') as EditorLanguage,
      theme: this.config.theme || 'vs-dark',
      position,
      lineNumber: position?.lineNumber || 0,
      column: position?.column || 0,
      lineCount: model?.getLineCount() || 0,
      readOnly: this.config.readOnly || false
    }
  }

  /**
   * 销毁编辑器
   */
  dispose(): void {
    // 清理所有事件监听器
    this.disposables.forEach(d => d.dispose())
    this.disposables = []

    // 销毁编辑器实例
    this.editor?.dispose()
    this.editor = null

    // 触发销毁事件
    if (this.config.on?.dispose) {
      this.config.on.dispose()
    }
  }
}

/**
 * 创建代码编辑器的便捷函数
 */
export function createCodeEditor(
  container: HTMLElement | string,
  config: CodeEditorConfig = {}
): CodeEditor {
  const element = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)
    : container

  if (!element) {
    throw new Error('Container element not found')
  }

  return new CodeEditor(element, config)
}
