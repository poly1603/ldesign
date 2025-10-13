// 核心导出
export { createCodeEditor, CodeEditor } from './core/CodeEditor'
export { createEnhancedCodeEditor, EnhancedCodeEditor } from './core/EnhancedCodeEditor'

// 类型导出
export * from './types'

// 工具导出
export { ThemeManager, themeManager } from './utils/themes'
export { EditorFeatureManager, createFeatureManager } from './utils/features'
export { PluginManager, registerCommonSnippets } from './utils/plugins'
export { 
  normalizeLanguage, 
  getLanguageByExtension,
  getRecommendedPlugins,
  supportsFormatting,
  getDefaultTabSize 
} from './utils/language-utils'

// 工具函数导出
export { setupMonacoWorkers, preloadLanguages } from './utils/workers'
export { registerVueLanguage, registerReactLanguage } from './utils/languages'
export { registerEmmetProvider } from './utils/emmet'

// Monaco Editor 类型导出
export type { editor, languages, IRange, IPosition, Position } from 'monaco-editor'
