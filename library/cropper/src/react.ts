/**
 * @file React 入口文件
 * @description React 适配器的独立入口
 */

export { ReactCropper, default } from './adapters/react'
export type { ReactCropperProps, ReactCropperRef } from './adapters/react'

// 重新导出核心功能
export { Cropper } from './core/Cropper'
export type {
  CropperOptions,
  CropData,
  ImageInfo,
  ImageSource,
  CropOutputOptions,
} from './types'
export {
  CropShape,
  ImageFormat,
  CropperEventType,
  AspectRatio,
} from './types'
