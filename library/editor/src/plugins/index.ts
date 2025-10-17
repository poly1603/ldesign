/**
 * 插件导出 - 优化后的结构
 */

// 格式化插件
export * from './formatting'

// 媒体插件
export * from './media'

// 文本结构插件
export * from './text'

// 表格插件
export * from './table'
export * from './table-enhanced'

// 工具插件
export * from './utils'

// Emoji 插件
export * from './emoji'

// 代码块插件
export { CodeBlockPlugin } from './codeblock'

// AI 插件
export { default as AIPlugin } from './ai'

// 模板插件
export { default as TemplatePlugin } from './template'
export { getTemplateManager } from './template'

// 聚合导出所有插件集合
import { formattingPlugins } from './formatting'
import { mediaPlugins } from './media'
import { textPlugins } from './text'
import { tablePlugins } from './table'
import { utilPlugins } from './utils'

export const allPlugins = [
  ...formattingPlugins,
  ...mediaPlugins,
  ...textPlugins,
  ...tablePlugins,
  ...utilPlugins,
  // 单独插件
  'EmojiPlugin',
  'AIPlugin',
  'TemplatePlugin'
]

// 默认插件集合（保持向后兼容）
export const defaultPlugins = [
  'AIPlugin',  // AI功能默认启用
  'FormattingPlugin',
  'HeadingPlugin',
  'ListPlugin',
  'BlockquotePlugin',
  'LinkPlugin',
  'ImagePlugin',
  'TablePlugin',
  'HistoryPlugin',
  'AlignPlugin',
  'ColorPlugin',
  'FontPlugin',
  'IndentPlugin',
  'FindReplacePlugin'
]

// 扩展插件集合
export const extendedPlugins = [
  ...defaultPlugins,
  'CodeBlockPlugin',
  'HorizontalRulePlugin',
  'ScriptPlugin',
  'LineHeightPlugin',
  'TextTransformPlugin',
  'FullscreenPlugin',
  'WordCountPlugin',
  'ExportMarkdownPlugin',
  'MediaDialogPlugin',
  'MediaContextMenuPlugin',
  'ImageResizePlugin',
  'EmojiPlugin',
  'ContextMenuPlugin',
  'EnhancedTablePlugin',
  'AIPlugin'
]
