import type * as Monaco from 'monaco-editor'

/**
 * 编辑器主题类型
 */
export type EditorTheme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light' | string

/**
 * 编辑器语言类型
 */
export type EditorLanguage =
  | 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'scss'
  | 'python' | 'java' | 'cpp' | 'csharp' | 'php' | 'ruby' | 'go'
  | 'rust' | 'swift' | 'kotlin' | 'dart' | 'vue' | 'markdown'
  | 'xml' | 'yaml' | 'sql' | 'shell' | 'dockerfile' | string

/**
 * 编辑器配置选项
 */
export interface CodeEditorOptions {
  /** 编辑器语言 */
  language?: EditorLanguage
  /** 编辑器主题 */
  theme?: EditorTheme
  /** 初始值 */
  value?: string
  /** 是否只读 */
  readOnly?: boolean
  /** 是否启用自动补全 */
  autoComplete?: boolean
  /** 是否启用代码折叠 */
  folding?: boolean
  /** 是否显示行号 */
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval'
  /** 是否启用 minimap */
  minimap?: boolean
  /** 字体大小 */
  fontSize?: number
  /** Tab 大小 */
  tabSize?: number
  /** 是否使用空格代替 Tab */
  insertSpaces?: boolean
  /** 是否自动换行 */
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded'
  /** 是否启用滚动条 */
  scrollbar?: {
    vertical?: 'auto' | 'visible' | 'hidden'
    horizontal?: 'auto' | 'visible' | 'hidden'
    verticalScrollbarSize?: number
    horizontalScrollbarSize?: number
  }
  /** Monaco Editor 原生选项 */
  monacoOptions?: Monaco.editor.IStandaloneEditorConstructionOptions
}

/**
 * 编辑器事件类型
 */
export interface CodeEditorEvents {
  /** 内容改变事件 */
  change?: (value: string, event: Monaco.editor.IModelContentChangedEvent) => void
  /** 光标位置改变事件 */
  cursorChange?: (position: Monaco.Position) => void
  /** 编辑器聚焦事件 */
  focus?: () => void
  /** 编辑器失焦事件 */
  blur?: () => void
  /** 编辑器就绪事件 */
  ready?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 编辑器销毁事件 */
  dispose?: () => void
}

/**
 * 编辑器完整配置
 */
export interface CodeEditorConfig extends CodeEditorOptions {
  /** 事件监听器 */
  on?: CodeEditorEvents
}

/**
 * 编辑器实例方法
 */
export interface ICodeEditor {
  /** 获取编辑器值 */
  getValue(): string
  /** 设置编辑器值 */
  setValue(value: string): void
  /** 获取选中的文本 */
  getSelection(): string
  /** 设置选中的文本 */
  setSelection(selection: Monaco.IRange): void
  /** 插入文本 */
  insertText(text: string, position?: Monaco.IPosition): void
  /** 格式化代码 */
  format(): Promise<void>
  /** 设置语言 */
  setLanguage(language: EditorLanguage): void
  /** 设置主题 */
  setTheme(theme: EditorTheme): void
  /** 设置只读 */
  setReadOnly(readOnly: boolean): void
  /** 聚焦 */
  focus(): void
  /** 获取光标位置 */
  getPosition(): Monaco.Position | null
  /** 设置光标位置 */
  setPosition(position: Monaco.IPosition): void
  /** 撤销 */
  undo(): void
  /** 重做 */
  redo(): void
  /** 获取 Monaco 编辑器实例 */
  getEditor(): Monaco.editor.IStandaloneCodeEditor
  /** 更新选项 */
  updateOptions(options: CodeEditorOptions): void
  /** 销毁编辑器 */
  dispose(): void
}

/**
 * 编辑器状态信息
 */
export interface EditorState {
  /** 当前语言 */
  language: EditorLanguage
  /** 当前主题 */
  theme: EditorTheme
  /** 当前光标位置 */
  position: Monaco.Position | null
  /** 当前行号 */
  lineNumber: number
  /** 当前列号 */
  column: number
  /** 总行数 */
  lineCount: number
  /** 是否只读 */
  readOnly: boolean
}

// 导出扩展类型
export * from './extended'
