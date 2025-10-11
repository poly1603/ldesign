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
export { createTableDialog, showTableDialog } from './ui/TableDialog'
export { createFindReplaceDialog, showFindReplaceDialog } from './ui/FindReplaceDialog'

// 类型
export type * from './types'

// 样式
import './styles/editor.css'

// 默认导出
export { Editor as default } from './core/Editor'
