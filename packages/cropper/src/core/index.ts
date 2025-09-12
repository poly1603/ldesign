/**
 * @file 核心模块导出
 * @description 导出所有核心功能模块
 */

// 事件系统
export { EventEmitter } from './event-emitter'

// 图片加载
export { ImageLoader } from './image-loader'
export type { ImageLoadOptions, ImageLoadResult } from './image-loader'

// Canvas 渲染
export { CanvasRenderer } from './canvas-renderer'
export type { RenderConfig } from './canvas-renderer'

// 裁剪区域管理
export { CropAreaManager } from './crop-area-manager'
export type { CropConstraints } from './crop-area-manager'

// 裁剪器核心
export { CropperCore } from './cropper-core'
