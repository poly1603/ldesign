/**
 * @file Angular 入口文件
 * @description Angular 适配器的独立入口
 */

export {
  AngularCropperComponent,
  AngularCropperModule,
  default,
} from './adapters/angular'

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
