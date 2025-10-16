/**
 * 媒体相关插件导出
 */

export { default as ImagePlugin } from './image'
export { default as MediaDialogPlugin } from './media-dialog'
export { default as ImageResizePlugin } from './image-resize'
export { default as MediaContextMenuPlugin } from './media-context-menu'
export { default as MediaCommandsPlugin } from './media-commands'

// 批量导出所有媒体插�?
export const mediaPlugins = [
  'ImagePlugin',
  'MediaDialogPlugin',
  'ImageResizePlugin',
  'MediaContextMenuPlugin'
]

