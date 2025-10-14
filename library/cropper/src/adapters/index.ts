/**
 * Framework Adapters - All implementations
 * 
 * Provides component, hook, and directive support for Vue, React, and Angular
 */

// Vue 3 exports - Component, Composable, and Directive
export {
  VueCropper,
  useCropper as useVueCropper,
  vCropper,
  cropperDirective as vCropperDirective,
  getCropperInstance as getVueCropperInstance
} from './vue'
export type {
  UseCropperOptions as UseVueCropperOptions,
  CropperDirectiveValue as VueCropperDirectiveValue
} from './vue'

// React exports - Component and Hook
export {
  ReactCropper,
  useCropper as useReactCropper
} from './react'
export type {
  ReactCropperProps,
  ReactCropperRef,
  UseCropperOptions as UseReactCropperOptions
} from './react'

// Angular exports - Component
export {
  AngularCropperComponent
} from './angular'
