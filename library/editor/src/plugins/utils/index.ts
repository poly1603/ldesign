/**
 * 工具类插件导出
 */

export { EmojiPlugin } from '../emoji'
export { default as FindReplacePlugin } from './find-replace'
export { default as ExportMarkdownPlugin } from './export-markdown'
export { default as FullscreenPlugin } from './fullscreen'
export { default as HistoryPlugin } from './history'
export { default as WordCountPlugin } from './word-count'
export { default as ContextMenuPlugin } from './context-menu'

// 批量导出所有工具插件
export const utilPlugins = [
  'EmojiPlugin',
  'FindReplacePlugin',
  'ExportMarkdownPlugin',
  'FullscreenPlugin',
  'HistoryPlugin',
  'WordCountPlugin',
  'ContextMenuPlugin'
]
