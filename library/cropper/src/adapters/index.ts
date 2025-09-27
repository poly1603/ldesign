/**
 * @file 框架适配器入口文件
 * @description 导出所有框架适配器
 */

// Vue 适配器
export { VueCropper, default as VueCropperDefault } from './vue'
export type { VueCropperProps, VueCropperEmits, VueCropperInstance } from './vue'

// React 适配器
export { ReactCropper, default as ReactCropperDefault } from './react'
export type { ReactCropperProps, ReactCropperRef } from './react'

// Angular 适配器
export {
  AngularCropperComponent,
  AngularCropperModule,
  default as AngularCropperModuleDefault,
} from './angular'
