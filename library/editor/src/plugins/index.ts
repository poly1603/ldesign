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

// 工具插件
export * from './utils'

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
  ...utilPlugins
]

// 默认插件集合（保持向后兼容）
export const defaultPlugins = [
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
  'ContextMenuPlugin'
]
