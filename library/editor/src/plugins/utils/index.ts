/**
 * 宸ュ叿绫绘彃浠跺鍑?
 */

// export { default as EmojiPlugin } from './emoji'  // Emoji module doesn't exist yet
export { default as FindReplacePlugin } from './find-replace'
export { default as ExportMarkdownPlugin } from './export-markdown'
export { default as FullscreenPlugin } from './fullscreen'
export { default as HistoryPlugin } from './history'
export { default as WordCountPlugin } from './word-count'
export { default as ContextMenuPlugin } from './context-menu'

// 鎵归噺瀵煎嚭鎵€鏈夊伐鍏锋彃浠?
export const utilPlugins = [
  // 'EmojiPlugin',  // Commented out until emoji plugin is implemented
  'FindReplacePlugin',
  'ExportMarkdownPlugin',
  'FullscreenPlugin',
  'HistoryPlugin',
  'WordCountPlugin',
  'ContextMenuPlugin'
]
