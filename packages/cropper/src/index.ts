/**
 * @file 图片裁剪器主入口
 * @description 导出所有公共 API 和类型定义
 */

// 导入样式
import './styles/index.less'

// 核心类型
export type {
  // 基础类型
  Point,
  Size,
  Rectangle,
  CropArea,
  Transform,
  ImageInfo,

  // 配置类型
  CropperConfig,
  CropperOptions,
  OutputConfig,
  ThemeConfig,
  I18nConfig,
  ToolbarConfig,

  // 事件类型
  CropperEventData,
  CropperEventListener,

  // 实例接口
  CropperInstance,
} from './types'

// 枚举类型
export {
  CropShape,
  ImageFormat,
  CropQuality,
  CropperEventType,
} from './types'

// 核心功能
export {
  CropperCore,
  EventEmitter,
  ImageLoader,
  CanvasRenderer,
  CropAreaManager,
} from './core'

export type {
  ImageLoadOptions,
  ImageLoadResult,
  RenderConfig,
  CropConstraints,
} from './core'

// 工具函数
export {
  MathUtils,
  DOMUtils,
  ImageUtils,
  ColorUtils,
  PerformanceUtils,
} from './utils'

// 适配器系统
export {
  BaseAdapter,
  VueAdapter,
  ReactAdapter,
  AngularAdapter,
  VanillaAdapter,
  AdapterFactory,
  AdapterRegistry,
  AdapterState,
  useVueCropper,
  VueCropperPlugin,
  createUseCropper,
  createCropperComponent,
  createWithCropper,
  createCropperContext,
  createCropperService,
  createAngularCropperComponent,
  createCropperDirective,
  createCropperModule,
} from './adapters'

export type {
  AdapterOptions,
  VueAdapterOptions,
  ReactAdapterOptions,
  AngularAdapterOptions,
  VanillaAdapterOptions,
  UseCropperOptions,
  UseCropperReturn,
  CropperComponentProps,
  WithCropperProps,
  CropperContextValue,
  CropperDirectiveConfig,
  CropperService,
  CropperComponentInterface,
  CropperModuleConfig,
} from './adapters'

// 配置和主题系统
export {
  ConfigManager,
  ThemeManager,
  I18nManager,
  PresetManager,
  ConfigSystem,
} from './config'

export type {
  ConfigChangeEvent,
  ConfigValidationResult,
  ThemeMode,
  ThemeVariables,
  BuiltinTheme,
  MessageMap,
  LanguagePack,
  InterpolationParams,
  PresetConfig,
  PresetCategory,
} from './config'

// 性能优化系统
export {
  MemoryManager,
  PerformanceMonitor,
  LargeImageProcessor,
  PerformanceSystem,
} from './performance'

export type {
  MemoryStats,
  Disposable,
  MemoryWarningLevel,
  PerformanceMetrics,
  PerformanceStats,
  PerformanceWarningLevel,
  ImageTile,
  LargeImageConfig,
  ProcessingProgress,
} from './performance'

// Web Workers系统
export {
  ImageWorkerManager,
  WorkerSystem,
} from './workers'

export type {
  WorkerMessage,
  WorkerMessageType,
  ImageProcessParams,
  CropParams,
  ResizeParams,
  FilterParams,
  RotateParams,
  FlipParams,
} from './workers'

// 高级功能系统
export {
  HistoryManager,
  BatchProcessor,
  AdvancedSystem,
} from './advanced'

export type {
  HistoryItem,
  HistoryState,
  BatchTask,
  BatchConfig,
  BatchProgress,
  BatchResult,
} from './advanced'

// 主要的裁剪器类
export { Cropper } from './cropper'

// 默认导出
export { Cropper as default } from './cropper'
