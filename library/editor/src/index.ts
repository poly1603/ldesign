/**
 * @ldesign/editor
 * 功能强大、扩展性强的富文本编辑器
 */

// 核心
export { Editor } from './core/Editor'
export { Schema, defaultSchema } from './core/Schema'
export { Document } from './core/Document'
export { Selection, SelectionManager } from './core/Selection'
export { CommandManager, KeymapManager } from './core/Command'
export { Plugin, PluginManager, createPlugin } from './core/Plugin'
export { EventEmitter } from './core/EventEmitter'
export { OptimizedEventEmitter } from './core/OptimizedEventEmitter'

// 编辑器构建器
export {
  EditorBuilder,
  createEditor,
  createLightweightEditor,
  createFullFeaturedEditor,
  createFormatOnlyEditor
} from './core/EditorBuilder'

// 功能开关
export {
  FeatureFlags,
  getFeatureFlags,
  resetFeatureFlags,
  FeatureCategory
} from './core/FeatureFlags'
export type { Feature } from './core/FeatureFlags'

// 懒加载
export {
  LazyLoader,
  getLazyLoader,
  resetLazyLoader
} from './core/LazyLoader'
export type { LoaderFunction, LoadOptions } from './core/LazyLoader'

// 插件系统
export {
  PluginRegistry,
  getPluginRegistry,
  resetPluginRegistry,
  PluginCategory
} from './core/PluginRegistry'
export type {
  PluginConfig,
  PluginMetadata,
  PluginLoader
} from './core/PluginRegistry'

// 插件基类
export { BasePlugin } from './core/base/BasePlugin'
export type { BasePluginConfig } from './core/base/BasePlugin'

// 插件
export * from './plugins'

// UI
export { Toolbar } from './ui/Toolbar'
export { ToolbarManager } from './ui/ToolbarManager'
export type {
  ToolbarManagerConfig,
  ToolbarGroupConfig
} from './ui/ToolbarManager'
export { createIcon, getIconHTML } from './ui/icons'
export { createColorPicker, showColorPicker } from './ui/ColorPicker'
export { createDropdown, showDropdown } from './ui/Dropdown'
export { showEmojiPicker } from './ui/EmojiPicker'
export { 
  UnifiedDialog, 
  showUnifiedDialog, 
  showConfirmDialog, 
  showAlertDialog, 
  showPromptDialog 
} from './ui/UnifiedDialog'
export { showTableDialog } from './ui/TableDialog'
export { createFindReplaceDialog, showFindReplaceDialog } from './ui/FindReplaceDialog'
export { showTableGridSelector, showEnhancedTableGridSelector } from './ui/TableGridSelector'
export { showAISuggestionsOverlay } from './ui/AISuggestionsOverlay'
export { showAIConfigDialog } from './ui/AIConfigDialog'
export { showAIDialog, AIMockUtils, type AIDialogType } from './ui/AIDialog'
export { SettingsPanel, showSettingsPanel } from './ui/SettingsPanel'
export { UploadProgress, createUploadProgress, showUploadProgress } from './ui/UploadProgress'
export type { UploadProgressOptions } from './ui/UploadProgress'
export { FeatureManagerPanel, showFeatureManager } from './ui/FeatureManagerPanel'
export { ConfigWizard, showConfigWizard } from './ui/ConfigWizard'
export { ConfigComparison, showConfigComparison } from './ui/ConfigComparison'
export { ConfigPreview, showConfigPreview } from './ui/ConfigPreview'
export { PluginMarketPanel, showPluginMarket } from './ui/PluginMarketPanel'

// UI组件工厂
export { 
  ComponentFactory, 
  getComponentFactory,
  createButton,
  createIconButton,
  createInput,
  createSelect,
  createCheckbox
} from './ui/base/ComponentFactory'
export type { 
  ButtonOptions, 
  InputOptions, 
  SelectOptions, 
  DialogOptions,
  ButtonType
} from './ui/base/ComponentFactory'

// 类型
export type * from './types'

// 配置管理
export { 
  ConfigManager, 
  getConfigManager, 
  resetConfigManager 
} from './config/ConfigManager'
export type { EditorConfig } from './config/ConfigManager'

// 预设配置
export {
  getPreset,
  getPresetNames,
  presetDescriptions,
  presets,
  blogPreset,
  cmsPreset,
  collaborationPreset,
  markdownPreset,
  notePreset,
  emailPreset,
  commentPreset,
  mobilePreset,
  richTextPreset,
  aiEnhancedPreset,
  codeDocPreset,
  minimalPreset
} from './config/presets'
export type { PresetName } from './config/presets'

// 配置工具
export {
  ConfigValidator,
  getConfigValidator,
  validateConfig,
  autoFixConfig
} from './config/ConfigValidator'
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion
} from './config/ConfigValidator'

// 图标管理
export { 
  IconManager, 
  getIconManager, 
  resetIconManager 
} from './icons/IconManager'
export type { 
  IconSet, 
  IconDefinition, 
  IconSetType, 
  IconStyle, 
  IconRenderOptions, 
  IconManagerConfig,
  EditorIconMap,
  IconCategory
} from './icons/types'
export { LucideIconSet } from './icons/sets/lucide'
export { FeatherIconSet } from './icons/sets/feather'
export { MaterialIconSet } from './icons/sets/material'

// 主题管理
export { 
  ThemeManager, 
  getThemeManager,
  setTheme,
  getCurrentTheme,
  getAvailableThemes
} from './theme'
export type { 
  Theme, 
  ThemeColors, 
  ThemeFonts, 
  ThemeSpacing, 
  ThemeBorders 
} from './theme'

// 多语言管理
export { 
  I18nManager, 
  getI18n,
  t
} from './i18n'
export type { I18nConfig, LocaleMessages } from './i18n'

// 性能监控
export {
  PerformanceMonitor,
  getPerformanceMonitor,
  measure,
  startTimer,
  endTimer
} from './utils/PerformanceMonitor'
export type {
  PerformanceMetrics,
  PerformanceEntry
} from './utils/PerformanceMonitor'

// 配置示例
export {
  pluginConfigExample,
  toolbarConfigExample,
  performanceConfigExample,
  editorConfigExample,
  lightweightConfig,
  fullFeaturedConfig
} from './config/editor.config.example'

// AI 功能
export { AIService, getAIService, resetAIService } from './ai/AIService'
export { DeepSeekProvider } from './ai/providers/DeepSeekProvider'
export { OpenAIProvider } from './ai/providers/OpenAIProvider'
export { ClaudeProvider } from './ai/providers/ClaudeProvider'
export type { 
  AIConfig, 
  AIProvider, 
  AIModelConfig, 
  AIRequest, 
  AIResponse, 
  AIRequestType,
  AIProviderInterface 
} from './ai/types'
export { defaultAIConfig } from './ai/types'

// 错误处理
export {
  ErrorBoundary,
  getErrorBoundary,
  captureError,
  withErrorBoundary
} from './core/ErrorBoundary'
export type { ErrorInfo, ErrorBoundaryConfig } from './core/ErrorBoundary'

// 工具函数
export {
  debounce,
  throttle,
  LRUCache,
  delay,
  retry,
  Batcher,
  deepClone,
  deepMerge,
  generateId,
  clamp,
  isEmpty,
  formatFileSize,
  formatDuration
} from './utils/helpers'

// 简化工具
export { $, on, ui, str, cmd, css, classNames } from './utils/simplify'

// 快捷函数
export { quick, editor, batch, debug, optimize } from './utils/shortcuts'

// 自动优化
export {
  AutoOptimizer,
  getAutoOptimizer,
  startAutoOptimization,
  stopAutoOptimization
} from './utils/AutoOptimizer'
export type {
  OptimizationSuggestion,
  AutoOptimizerConfig
} from './utils/AutoOptimizer'

// 插件市场
export {
  PluginMarket,
  getPluginMarket
} from './marketplace/PluginMarket'
export type { MarketplacePlugin } from './marketplace/PluginMarket'

// 样式
import './styles/editor.css'
import './styles/ai.css'

// 默认导出
export { Editor as default } from './core/Editor'

// 应用表格补丁 - 自动替换旧的表格插入功能
import { patchTableInsertCommand } from './plugins/table-patch'
export { patchTableInsertCommand } from './plugins/table-patch'

// 自动应用补丁
if (typeof window !== 'undefined') {
  // 延迟执行，确保编辑器已初始化
  setTimeout(() => {
    patchTableInsertCommand()
  }, 500)
}
