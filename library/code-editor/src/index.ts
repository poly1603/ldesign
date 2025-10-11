export { CodeEditor, createCodeEditor } from './core/CodeEditor'
export { EnhancedCodeEditor, createEnhancedCodeEditor } from './core/EnhancedCodeEditor'
export type {
  CodeEditorOptions,
  CodeEditorConfig,
  CodeEditorEvents,
  ICodeEditor,
  EditorTheme,
  EditorLanguage,
  EditorState,
  ExtendedCodeEditorConfig,
  LoadingState,
  PluginConfig,
  WorkerConfig
} from './types'

// 工具函数导出
export { setupMonacoWorkers, preloadLanguages } from './utils/workers'
export { PluginManager, registerCommonSnippets } from './utils/plugins'
export { registerVueLanguage, registerReactLanguage } from './utils/languages'
export { registerEmmetProvider } from './utils/emmet'

// Monaco Editor 类型导出
export type { editor, languages, IRange, IPosition, Position } from 'monaco-editor'
