/**
 * @ldesign/cropper 事件系统类型定义
 * 
 * 定义完整的事件系统类型，支持丰富的事件交互
 */

import type { Point, Rect, CropArea, ImageTransform } from './index';

// ============================================================================
// 基础事件类型
// ============================================================================

/**
 * 基础事件接口
 * 所有事件的基础结构
 */
export interface BaseEvent {
  /** 事件类型 */
  type: string;
  /** 事件时间戳 */
  timestamp: number;
  /** 是否可取消 */
  cancelable: boolean;
  /** 是否已取消 */
  cancelled: boolean;
  /** 取消事件 */
  preventDefault(): void;
  /** 停止传播 */
  stopPropagation(): void;
}

/**
 * 鼠标事件接口
 * 鼠标相关事件的数据结构
 */
export interface MouseEventData extends BaseEvent {
  /** 鼠标位置 */
  point: Point;
  /** 鼠标按钮 */
  button: number;
  /** 是否按下Ctrl键 */
  ctrlKey: boolean;
  /** 是否按下Shift键 */
  shiftKey: boolean;
  /** 是否按下Alt键 */
  altKey: boolean;
  /** 原始鼠标事件 */
  originalEvent: MouseEvent;
}

/**
 * 触摸事件接口
 * 触摸相关事件的数据结构
 */
export interface TouchEventData extends BaseEvent {
  /** 触摸点列表 */
  touches: Point[];
  /** 触摸中心点 */
  center: Point;
  /** 触摸距离（双指） */
  distance?: number;
  /** 触摸角度（双指） */
  angle?: number;
  /** 原始触摸事件 */
  originalEvent: TouchEvent;
}

/**
 * 键盘事件接口
 * 键盘相关事件的数据结构
 */
export interface KeyboardEventData extends BaseEvent {
  /** 按键代码 */
  keyCode: number;
  /** 按键名称 */
  key: string;
  /** 是否按下Ctrl键 */
  ctrlKey: boolean;
  /** 是否按下Shift键 */
  shiftKey: boolean;
  /** 是否按下Alt键 */
  altKey: boolean;
  /** 原始键盘事件 */
  originalEvent: KeyboardEvent;
}

// ============================================================================
// 裁剪器特定事件类型
// ============================================================================

/**
 * 裁剪器就绪事件
 * 当裁剪器初始化完成时触发
 */
export interface ReadyEvent extends BaseEvent {
  type: 'ready';
  /** 裁剪器实例 */
  cropper: any;
}

/**
 * 图片加载事件
 * 当图片加载完成时触发
 */
export interface ImageLoadEvent extends BaseEvent {
  type: 'imageLoad';
  /** 图片元素 */
  image: HTMLImageElement;
  /** 图片信息 */
  imageInfo: {
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  };
}

/**
 * 图片错误事件
 * 当图片加载失败时触发
 */
export interface ImageErrorEvent extends BaseEvent {
  type: 'imageError';
  /** 错误信息 */
  error: Error;
  /** 图片源 */
  src: string;
}

/**
 * 裁剪开始事件
 * 当开始裁剪操作时触发
 */
export interface CropStartEvent extends BaseEvent {
  type: 'cropStart';
  /** 裁剪区域 */
  cropArea: CropArea;
  /** 操作类型 */
  action: 'move' | 'resize' | 'rotate';
  /** 鼠标/触摸位置 */
  point: Point;
}

/**
 * 裁剪移动事件
 * 当裁剪区域移动时触发
 */
export interface CropMoveEvent extends BaseEvent {
  type: 'cropMove';
  /** 当前裁剪区域 */
  cropArea: CropArea;
  /** 上一个裁剪区域 */
  previousCropArea: CropArea;
  /** 操作类型 */
  action: 'move' | 'resize' | 'rotate';
  /** 移动距离 */
  delta: Point;
}

/**
 * 裁剪结束事件
 * 当裁剪操作结束时触发
 */
export interface CropEndEvent extends BaseEvent {
  type: 'cropEnd';
  /** 最终裁剪区域 */
  cropArea: CropArea;
  /** 操作类型 */
  action: 'move' | 'resize' | 'rotate';
  /** 是否有变化 */
  changed: boolean;
}

/**
 * 缩放事件
 * 当图片缩放时触发
 */
export interface ZoomEvent extends BaseEvent {
  type: 'zoom';
  /** 缩放比例 */
  scale: number;
  /** 上一个缩放比例 */
  previousScale: number;
  /** 缩放中心点 */
  center: Point;
  /** 缩放类型 */
  zoomType: 'wheel' | 'pinch' | 'button';
}

/**
 * 旋转事件
 * 当图片旋转时触发
 */
export interface RotateEvent extends BaseEvent {
  type: 'rotate';
  /** 旋转角度（弧度） */
  rotation: number;
  /** 上一个旋转角度 */
  previousRotation: number;
  /** 旋转增量 */
  delta: number;
  /** 旋转中心点 */
  center: Point;
}

/**
 * 翻转事件
 * 当图片翻转时触发
 */
export interface FlipEvent extends BaseEvent {
  type: 'flip';
  /** 翻转方向 */
  direction: 'horizontal' | 'vertical';
  /** 当前变换状态 */
  transform: ImageTransform;
}

/**
 * 重置事件
 * 当重置裁剪器时触发
 */
export interface ResetEvent extends BaseEvent {
  type: 'reset';
  /** 重置类型 */
  resetType: 'all' | 'crop' | 'transform';
}

/**
 * 销毁事件
 * 当销毁裁剪器时触发
 */
export interface DestroyEvent extends BaseEvent {
  type: 'destroy';
  /** 销毁原因 */
  reason?: string;
}

/**
 * 错误事件
 * 当发生错误时触发
 */
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  /** 错误对象 */
  error: Error;
  /** 错误类型 */
  errorType: 'load' | 'render' | 'operation' | 'validation';
  /** 错误上下文 */
  context?: any;
}

// ============================================================================
// 事件联合类型
// ============================================================================

/**
 * 所有事件类型的联合
 */
export type CropperEvent = 
  | ReadyEvent
  | ImageLoadEvent
  | ImageErrorEvent
  | CropStartEvent
  | CropMoveEvent
  | CropEndEvent
  | ZoomEvent
  | RotateEvent
  | FlipEvent
  | ResetEvent
  | DestroyEvent
  | ErrorEvent;

/**
 * 事件类型映射
 * 事件名称到事件对象的映射
 */
export interface EventTypeMap {
  ready: ReadyEvent;
  imageLoad: ImageLoadEvent;
  imageError: ImageErrorEvent;
  cropStart: CropStartEvent;
  cropMove: CropMoveEvent;
  cropEnd: CropEndEvent;
  zoom: ZoomEvent;
  rotate: RotateEvent;
  flip: FlipEvent;
  reset: ResetEvent;
  destroy: DestroyEvent;
  error: ErrorEvent;
}

/**
 * 事件监听器类型
 * 泛型事件监听器，支持类型安全的事件处理
 */
export type EventListener<T extends keyof EventTypeMap = keyof EventTypeMap> = 
  (event: EventTypeMap[T]) => void | boolean;

/**
 * 事件监听器选项
 * 配置事件监听器的行为
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean;
  /** 是否在捕获阶段执行 */
  capture?: boolean;
  /** 是否是被动监听器 */
  passive?: boolean;
  /** 优先级 */
  priority?: number;
}

/**
 * 事件发射器接口
 * 定义事件发射器的基本方法
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on<T extends keyof EventTypeMap>(
    type: T, 
    listener: EventListener<T>, 
    options?: EventListenerOptions
  ): void;
  
  /** 移除事件监听器 */
  off<T extends keyof EventTypeMap>(
    type: T, 
    listener: EventListener<T>
  ): void;
  
  /** 添加一次性事件监听器 */
  once<T extends keyof EventTypeMap>(
    type: T, 
    listener: EventListener<T>
  ): void;
  
  /** 触发事件 */
  emit<T extends keyof EventTypeMap>(
    type: T, 
    event: EventTypeMap[T]
  ): boolean;
  
  /** 移除所有监听器 */
  removeAllListeners(type?: keyof EventTypeMap): void;
  
  /** 获取监听器数量 */
  listenerCount(type: keyof EventTypeMap): number;
  
  /** 获取所有监听器 */
  listeners<T extends keyof EventTypeMap>(type: T): EventListener<T>[];
}

// ============================================================================
// 手势识别相关类型
// ============================================================================

/**
 * 手势类型
 * 支持的手势类型
 */
export type GestureType = 
  | 'tap'           // 单击
  | 'doubleTap'     // 双击
  | 'longPress'     // 长按
  | 'pan'           // 拖拽
  | 'pinch'         // 捏合
  | 'rotate'        // 旋转
  | 'swipe';        // 滑动

/**
 * 手势事件接口
 * 手势识别事件的数据结构
 */
export interface GestureEvent extends BaseEvent {
  /** 手势类型 */
  gestureType: GestureType;
  /** 手势中心点 */
  center: Point;
  /** 手势开始点 */
  startPoint: Point;
  /** 手势当前点 */
  currentPoint: Point;
  /** 手势速度 */
  velocity?: Point;
  /** 手势距离 */
  distance?: number;
  /** 手势角度 */
  angle?: number;
  /** 手势缩放比例 */
  scale?: number;
  /** 手势持续时间 */
  duration: number;
}

/**
 * 手势配置接口
 * 手势识别的配置选项
 */
export interface GestureConfig {
  /** 是否启用手势识别 */
  enabled: boolean;
  /** 双击间隔时间（毫秒） */
  doubleTapInterval: number;
  /** 长按时间（毫秒） */
  longPressTime: number;
  /** 最小拖拽距离 */
  minPanDistance: number;
  /** 最小捏合距离变化 */
  minPinchDistance: number;
  /** 最小旋转角度变化 */
  minRotateAngle: number;
  /** 滑动最小速度 */
  minSwipeVelocity: number;
}
