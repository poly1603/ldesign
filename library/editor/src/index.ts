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

// 插件
export * from './plugins'

// UI
export { Toolbar } from './ui/Toolbar'
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

// 类型
export type * from './types'

// AI 功能
export { AIService, getAIService, resetAIService } from './ai/AIService'
export { DeepSeekProvider } from './ai/providers/DeepSeekProvider'
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
