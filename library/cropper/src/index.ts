/**
 * @ldesign/cropper - Main entry point
 * A powerful, flexible image cropper library that works with any framework
 */

// Core
export { Cropper } from './core/Cropper'
export { CropBox } from './core/CropBox'
export { ImageProcessor } from './core/ImageProcessor'
export { InteractionManager } from './core/InteractionManager'

// Types
export type {
  CropperOptions,
  CropBoxData,
  ImageData,
  CanvasData,
  ContainerData,
  CropData,
  GetCroppedCanvasOptions,
  Point,
  Rectangle,
  Action,
  DragMode,
  ViewMode,
  ImageFormat,
  InternalData,
  CropperEvent,
  CropperPlugin
} from './types'

// Utils
export * from './utils'

// Default export
export { Cropper as default } from './core/Cropper'
