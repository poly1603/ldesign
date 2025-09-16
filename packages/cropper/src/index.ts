/**
 * @ldesign/cropper - 主入口文件
 * 
 * 导出图片裁剪插件的所有公共 API
 */

// 导出类型定义
export type {
  // 基础类型
  Point,
  Size,
  Rect,
  Transform,
  
  // 裁剪相关类型
  CropShape,
  AspectRatio,
  CropData,
  CropOptions,
  
  // 图像相关类型
  ImageSource,
  ImageFormat,
  ImageQuality,
  ImageMetadata,
  ImageProcessOptions,
  
  // 导出相关类型
  ExportOptions,
  ExportResult,
  
  // 事件相关类型
  CropperEventType,
  CropperEventData,
  CropperEventListener,
  CropperEventMap,
  
  // 配置相关类型
  Theme,
  Language,
  ControlPointStyle,
  GridConfig,
  MaskConfig,
  ToolbarConfig,
  CropperConfig,
  
  // API 接口
  CropperAPI
} from './types';

// 导出常量
export * from './constants';

// 导出工具函数
export * from './utils';

// 导出核心类
export { EventEmitter } from './core/EventEmitter';
export { ImageLoader } from './core/ImageLoader';
export { CanvasRenderer } from './core/CanvasRenderer';
export { CropAreaManager } from './core/CropAreaManager';
export { Cropper } from './core/Cropper';

// 导出交互类
export { EventHandler } from './interaction/EventHandler';
export { InteractionController } from './interaction/InteractionController';

// 导出图像处理类
export { ImageProcessor } from './processing/ImageProcessor';
export { TransformProcessor } from './processing/TransformProcessor';

// 导出UI组件类
export { Toolbar } from './ui/Toolbar';
export { ControlPanel } from './ui/ControlPanel';

// 导出Vue集成（可选依赖）
export * from './vue';

// 导出高级功能类
export { EffectsProcessor } from './advanced/EffectsProcessor';
export { ShapeProcessor } from './advanced/ShapeProcessor';

// 导出性能优化类
export { PerformanceMonitor } from './performance/PerformanceMonitor';
export { MemoryManager } from './performance/MemoryManager';

// 导出 Vue 3 集成
export {
  ImageCropper,
  useCropper,
  vCropper,
  getCropperInstance,
  install as installVue
} from './vue';
export type {
  UseCropperOptions,
  UseCropperReturn,
  CropperDirectiveValue
} from './vue';

// 导出样式
import './styles/index.less';

// 版本信息
export const version = VERSION;
