/**
 * @file Vue 入口文件
 * @description Vue 适配器的独立入口
 */

export { VueCropper, default } from './adapters/vue'
export type { VueCropperProps, VueCropperEmits, VueCropperInstance } from './adapters/vue'

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
