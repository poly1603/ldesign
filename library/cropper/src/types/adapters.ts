/**
 * @ldesign/cropper 多框架适配器类型定义
 * 
 * 定义Vue、React、Angular等框架适配器的类型接口
 */

import type { CropperConfig } from './config';
import type { CropperEvent } from './events';
import type { Cropper } from '../core/Cropper';

// ============================================================================
// 通用适配器类型
// ============================================================================

/**
 * 框架类型
 */
export type FrameworkType = 'vue' | 'react' | 'angular' | 'vanilla';

/**
 * 适配器基础接口
 */
export interface BaseAdapter {
  /** 框架类型 */
  framework: FrameworkType;
  /** 适配器版本 */
  version: string;
  /** 是否已初始化 */
  initialized: boolean;
  /** 初始化适配器 */
  initialize(): void;
  /** 销毁适配器 */
  destroy(): void;
}

/**
 * 组件适配器接口
 */
export interface ComponentAdapter<T = any> extends BaseAdapter {
  /** 创建组件实例 */
  createComponent(config: T): any;
  /** 更新组件属性 */
  updateProps(instance: any, props: Partial<T>): void;
  /** 绑定事件 */
  bindEvents(instance: any, events: Record<string, Function>): void;
  /** 解绑事件 */
  unbindEvents(instance: any): void;
}

// ============================================================================
// Vue 3 适配器类型
// ============================================================================

/**
 * Vue 3 组件属性接口
 */
export interface VueCropperProps {
  /** 裁剪器配置 */
  config?: Partial<CropperConfig>;
  /** 图片源 */
  src?: string | File | HTMLImageElement;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** CSS类名 */
  class?: string;
  /** 内联样式 */
  style?: Record<string, any>;
  /** 自定义属性 */
  [key: string]: any;
}

/**
 * Vue 3 组件事件接口
 */
export interface VueCropperEvents {
  /** 裁剪器初始化完成 */
  'onReady'?: (cropper: Cropper) => void;
  /** 图片加载完成 */
  'onImageLoad'?: (event: CropperEvent) => void;
  /** 裁剪区域变化 */
  'onCropChange'?: (event: CropperEvent) => void;
  /** 变换操作 */
  'onTransform'?: (event: CropperEvent) => void;
  /** 导出完成 */
  'onExport'?: (event: CropperEvent) => void;
  /** 错误事件 */
  'onError'?: (error: Error) => void;
}

/**
 * Vue 3 组合式API返回类型
 */
export interface VueCropperComposable {
  /** 裁剪器实例 */
  cropper: Ref<Cropper | null>;
  /** 容器元素引用 */
  containerRef: Ref<HTMLElement | null>;
  /** 是否已准备就绪 */
  ready: Ref<boolean>;
  /** 是否加载中 */
  loading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<Error | null>;
  /** 初始化裁剪器 */
  initialize: (config?: Partial<CropperConfig>) => Promise<void>;
  /** 设置图片源 */
  setImage: (src: string | File | HTMLImageElement) => Promise<void>;
  /** 获取裁剪结果 */
  getCropData: () => any;
  /** 导出图片 */
  exportImage: (options?: any) => Promise<Blob>;
  /** 重置裁剪器 */
  reset: () => void;
  /** 销毁裁剪器 */
  destroy: () => void;
}

// ============================================================================
// React 适配器类型
// ============================================================================

/**
 * React 组件属性接口
 */
export interface ReactCropperProps {
  /** 裁剪器配置 */
  config?: Partial<CropperConfig>;
  /** 图片源 */
  src?: string | File | HTMLImageElement;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** CSS类名 */
  className?: string;
  /** 内联样式 */
  style?: React.CSSProperties;
  /** 裁剪器准备就绪回调 */
  onReady?: (cropper: Cropper) => void;
  /** 图片加载完成回调 */
  onImageLoad?: (event: CropperEvent) => void;
  /** 裁剪区域变化回调 */
  onCropChange?: (event: CropperEvent) => void;
  /** 变换操作回调 */
  onTransform?: (event: CropperEvent) => void;
  /** 导出完成回调 */
  onExport?: (event: CropperEvent) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * React Hook 返回类型
 */
export interface ReactCropperHook {
  /** 裁剪器实例 */
  cropper: Cropper | null;
  /** 容器元素引用 */
  containerRef: React.RefObject<HTMLDivElement>;
  /** 是否已准备就绪 */
  ready: boolean;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 初始化裁剪器 */
  initialize: (config?: Partial<CropperConfig>) => Promise<void>;
  /** 设置图片源 */
  setImage: (src: string | File | HTMLImageElement) => Promise<void>;
  /** 获取裁剪结果 */
  getCropData: () => any;
  /** 导出图片 */
  exportImage: (options?: any) => Promise<Blob>;
  /** 重置裁剪器 */
  reset: () => void;
  /** 销毁裁剪器 */
  destroy: () => void;
}

// ============================================================================
// Angular 适配器类型
// ============================================================================

/**
 * Angular 组件输入属性接口
 */
export interface AngularCropperInputs {
  /** 裁剪器配置 */
  config?: Partial<CropperConfig>;
  /** 图片源 */
  src?: string | File | HTMLImageElement;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
}

/**
 * Angular 组件输出事件接口
 */
export interface AngularCropperOutputs {
  /** 裁剪器准备就绪事件 */
  ready: EventEmitter<Cropper>;
  /** 图片加载完成事件 */
  imageLoad: EventEmitter<CropperEvent>;
  /** 裁剪区域变化事件 */
  cropChange: EventEmitter<CropperEvent>;
  /** 变换操作事件 */
  transform: EventEmitter<CropperEvent>;
  /** 导出完成事件 */
  export: EventEmitter<CropperEvent>;
  /** 错误事件 */
  error: EventEmitter<Error>;
}

/**
 * Angular 服务接口
 */
export interface AngularCropperService {
  /** 创建裁剪器实例 */
  createCropper(container: ElementRef, config?: Partial<CropperConfig>): Promise<Cropper>;
  /** 销毁裁剪器实例 */
  destroyCropper(cropper: Cropper): void;
  /** 获取所有活动的裁剪器实例 */
  getActiveCroppers(): Cropper[];
  /** 全局配置 */
  setGlobalConfig(config: Partial<CropperConfig>): void;
  /** 获取全局配置 */
  getGlobalConfig(): Partial<CropperConfig>;
}

// ============================================================================
// 适配器配置类型
// ============================================================================

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  /** 框架类型 */
  framework: FrameworkType;
  /** 是否启用开发模式 */
  development?: boolean;
  /** 是否启用调试 */
  debug?: boolean;
  /** 全局配置 */
  globalConfig?: Partial<CropperConfig>;
  /** 自定义组件名称 */
  componentName?: string;
  /** 自定义指令名称 */
  directiveName?: string;
  /** 插件选项 */
  plugins?: any[];
}

/**
 * 适配器工厂接口
 */
export interface AdapterFactory {
  /** 创建Vue适配器 */
  createVueAdapter(config?: AdapterConfig): VueAdapter;
  /** 创建React适配器 */
  createReactAdapter(config?: AdapterConfig): ReactAdapter;
  /** 创建Angular适配器 */
  createAngularAdapter(config?: AdapterConfig): AngularAdapter;
}

// ============================================================================
// 具体适配器接口
// ============================================================================

/**
 * Vue 适配器接口
 */
export interface VueAdapter extends ComponentAdapter<VueCropperProps> {
  /** 安装Vue插件 */
  install(app: any, options?: AdapterConfig): void;
  /** 创建组合式API */
  createComposable(): (props?: VueCropperProps) => VueCropperComposable;
  /** 创建组件 */
  createComponent(): any;
  /** 创建指令 */
  createDirective(): any;
}

/**
 * React 适配器接口
 */
export interface ReactAdapter extends ComponentAdapter<ReactCropperProps> {
  /** 创建React组件 */
  createComponent(): React.ComponentType<ReactCropperProps>;
  /** 创建React Hook */
  createHook(): (config?: Partial<CropperConfig>) => ReactCropperHook;
  /** 创建高阶组件 */
  createHOC(): <P extends object>(Component: React.ComponentType<P>) => React.ComponentType<P & ReactCropperProps>;
  /** 创建Context */
  createContext(): {
    Provider: React.ComponentType<{ value: Cropper | null; children: React.ReactNode }>;
    Consumer: React.ComponentType<{ children: (cropper: Cropper | null) => React.ReactNode }>;
    useContext: () => Cropper | null;
  };
}

/**
 * Angular 适配器接口
 */
export interface AngularAdapter extends ComponentAdapter<AngularCropperInputs> {
  /** 创建Angular模块 */
  createModule(): any;
  /** 创建Angular组件 */
  createComponent(): any;
  /** 创建Angular指令 */
  createDirective(): any;
  /** 创建Angular服务 */
  createService(): any;
  /** 创建Angular管道 */
  createPipe(): any;
}

// ============================================================================
// 适配器事件类型
// ============================================================================

/**
 * 适配器事件类型
 */
export type AdapterEventType = 
  | 'adapter:initialized'
  | 'adapter:destroyed'
  | 'component:created'
  | 'component:mounted'
  | 'component:updated'
  | 'component:unmounted'
  | 'cropper:ready'
  | 'cropper:error';

/**
 * 适配器事件接口
 */
export interface AdapterEvent {
  /** 事件类型 */
  type: AdapterEventType;
  /** 事件目标 */
  target: BaseAdapter;
  /** 事件数据 */
  data?: any;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 适配器事件处理器类型
 */
export type AdapterEventHandler = (event: AdapterEvent) => void;

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 框架检测结果
 */
export interface FrameworkDetection {
  /** 检测到的框架 */
  framework: FrameworkType | null;
  /** 框架版本 */
  version: string | null;
  /** 是否支持 */
  supported: boolean;
  /** 检测置信度 */
  confidence: number;
}

/**
 * 适配器注册信息
 */
export interface AdapterRegistration {
  /** 适配器名称 */
  name: string;
  /** 框架类型 */
  framework: FrameworkType;
  /** 适配器版本 */
  version: string;
  /** 适配器实例 */
  adapter: BaseAdapter;
  /** 注册时间 */
  registeredAt: Date;
}

// ============================================================================
// 类型守卫和工具函数类型
// ============================================================================

/**
 * 框架检测函数类型
 */
export type FrameworkDetector = () => FrameworkDetection;

/**
 * 适配器创建函数类型
 */
export type AdapterCreator<T extends BaseAdapter> = (config?: AdapterConfig) => T;

/**
 * 组件包装器类型
 */
export type ComponentWrapper<T = any> = (component: any, props: T) => any;

// ============================================================================
// 导入声明（用于类型检查）
// ============================================================================

// Vue 3 类型声明
declare global {
  interface Ref<T = any> {
    value: T;
  }
  
  interface EventEmitter<T = any> {
    emit(value: T): void;
  }
  
  interface ElementRef {
    nativeElement: HTMLElement;
  }
}

// React 类型声明
declare namespace React {
  interface CSSProperties {
    [key: string]: any;
  }
  
  interface RefObject<T> {
    readonly current: T | null;
  }
  
  interface ReactNode {}
  
  interface ComponentType<P = {}> {
    (props: P): ReactNode;
  }
}

// 导出所有类型
export type {
  // 重新导出以确保类型可用
  Ref,
  EventEmitter,
  ElementRef
};
