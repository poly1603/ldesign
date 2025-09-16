/**
 * DOM相关类型定义
 */

// ==================== DOM元素类型 ====================

/**
 * 支持的容器元素类型
 */
export type ContainerElement = HTMLElement | string | null;

/**
 * 事件目标类型
 */
export type EventTarget = HTMLElement | Document | Window;

/**
 * DOM选择器类型
 */
export type DOMSelector = string | HTMLElement | NodeList | HTMLElement[];

// ==================== 位置和尺寸类型 ====================

/**
 * 位置信息接口
 */
export interface Position {
  /** X坐标 */
  x: number;
  
  /** Y坐标 */
  y: number;
  
  /** 左边距 */
  left: number;
  
  /** 顶部距离 */
  top: number;
  
  /** 右边距 */
  right: number;
  
  /** 底部距离 */
  bottom: number;
}

/**
 * 尺寸信息接口
 */
export interface Size {
  /** 宽度 */
  width: number;
  
  /** 高度 */
  height: number;
}

/**
 * 边界信息接口
 */
export interface Bounds extends Position, Size {}

/**
 * 滚动信息接口
 */
export interface ScrollInfo {
  /** 水平滚动距离 */
  scrollLeft: number;
  
  /** 垂直滚动距离 */
  scrollTop: number;
  
  /** 可滚动宽度 */
  scrollWidth: number;
  
  /** 可滚动高度 */
  scrollHeight: number;
}

/**
 * 视口信息接口
 */
export interface ViewportInfo {
  /** 视口宽度 */
  width: number;
  
  /** 视口高度 */
  height: number;
  
  /** 滚动信息 */
  scroll: ScrollInfo;
}

// ==================== 样式相关类型 ====================

/**
 * CSS样式对象类型
 */
export type CSSStyleObject = Partial<CSSStyleDeclaration> | Record<string, string | number>;

/**
 * CSS类名类型
 */
export type CSSClassName = string | string[] | Record<string, boolean> | null | undefined;

/**
 * CSS变量类型
 */
export interface CSSVariables {
  [key: string]: string | number;
}

/**
 * 样式配置接口
 */
export interface StyleConfig {
  /** 内联样式 */
  style?: CSSStyleObject;
  
  /** CSS类名 */
  className?: CSSClassName;
  
  /** CSS变量 */
  variables?: CSSVariables;
  
  /** 是否重要 */
  important?: boolean;
}

// ==================== 事件相关类型 ====================

/**
 * DOM事件类型映射
 */
export interface DOMEventMap {
  click: MouseEvent;
  dblclick: MouseEvent;
  mousedown: MouseEvent;
  mouseup: MouseEvent;
  mousemove: MouseEvent;
  mouseenter: MouseEvent;
  mouseleave: MouseEvent;
  mouseover: MouseEvent;
  mouseout: MouseEvent;
  contextmenu: MouseEvent;
  
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  keypress: KeyboardEvent;
  
  focus: FocusEvent;
  blur: FocusEvent;
  focusin: FocusEvent;
  focusout: FocusEvent;
  
  input: InputEvent;
  change: Event;
  
  touchstart: TouchEvent;
  touchmove: TouchEvent;
  touchend: TouchEvent;
  touchcancel: TouchEvent;
  
  scroll: Event;
  resize: Event;
  
  load: Event;
  unload: Event;
  beforeunload: BeforeUnloadEvent;
  
  animationstart: AnimationEvent;
  animationend: AnimationEvent;
  animationiteration: AnimationEvent;
  
  transitionstart: TransitionEvent;
  transitionend: TransitionEvent;
  transitionrun: TransitionEvent;
  transitioncancel: TransitionEvent;
}

/**
 * DOM事件名称类型
 */
export type DOMEventName = keyof DOMEventMap;

/**
 * DOM事件处理器类型
 */
export type DOMEventHandler<T extends DOMEventName = DOMEventName> = 
  (event: DOMEventMap[T]) => void;

/**
 * 事件监听器配置
 */
export interface EventListenerOptions {
  /** 是否捕获 */
  capture?: boolean;
  
  /** 是否只执行一次 */
  once?: boolean;
  
  /** 是否被动 */
  passive?: boolean;
  
  /** 信号 */
  signal?: AbortSignal;
}

// ==================== 动画相关类型 ====================

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画持续时间 (毫秒) */
  duration?: number;
  
  /** 动画延迟 (毫秒) */
  delay?: number;
  
  /** 动画缓动函数 */
  easing?: string;
  
  /** 动画填充模式 */
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  
  /** 动画方向 */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  
  /** 动画迭代次数 */
  iterations?: number | 'infinite';
}

/**
 * 过渡配置接口
 */
export interface TransitionConfig {
  /** 过渡属性 */
  property?: string | string[];
  
  /** 过渡持续时间 (毫秒) */
  duration?: number;
  
  /** 过渡缓动函数 */
  easing?: string;
  
  /** 过渡延迟 (毫秒) */
  delay?: number;
}

// ==================== 拖拽相关类型 ====================

/**
 * 拖拽数据接口
 */
export interface DragData {
  /** 拖拽开始位置 */
  startPosition: Position;
  
  /** 当前位置 */
  currentPosition: Position;
  
  /** 偏移量 */
  offset: Position;
  
  /** 拖拽元素 */
  element: HTMLElement;
  
  /** 拖拽数据 */
  data?: any;
}

/**
 * 拖拽配置接口
 */
export interface DragConfig {
  /** 拖拽手柄选择器 */
  handle?: string;
  
  /** 拖拽约束 */
  constraint?: 'horizontal' | 'vertical' | 'none';
  
  /** 拖拽边界 */
  bounds?: Bounds | HTMLElement;
  
  /** 是否启用拖拽 */
  enabled?: boolean;
  
  /** 拖拽阈值 */
  threshold?: number;
}

// ==================== 触摸相关类型 ====================

/**
 * 触摸点信息接口
 */
export interface TouchPoint {
  /** 触摸点ID */
  identifier: number;
  
  /** X坐标 */
  clientX: number;
  
  /** Y坐标 */
  clientY: number;
  
  /** 页面X坐标 */
  pageX: number;
  
  /** 页面Y坐标 */
  pageY: number;
  
  /** 屏幕X坐标 */
  screenX: number;
  
  /** 屏幕Y坐标 */
  screenY: number;
}

/**
 * 手势数据接口
 */
export interface GestureData {
  /** 手势类型 */
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'pan';
  
  /** 开始位置 */
  startPosition: Position;
  
  /** 结束位置 */
  endPosition: Position;
  
  /** 速度 */
  velocity: number;
  
  /** 方向 */
  direction: 'up' | 'down' | 'left' | 'right';
  
  /** 距离 */
  distance: number;
  
  /** 持续时间 */
  duration: number;
}

// ==================== 工具函数类型 ====================

/**
 * DOM查询函数类型
 */
export type QueryFunction = (selector: string, context?: Element | Document) => HTMLElement | null;

/**
 * DOM查询所有函数类型
 */
export type QueryAllFunction = (selector: string, context?: Element | Document) => NodeListOf<HTMLElement>;

/**
 * DOM创建函数类型
 */
export type CreateElementFunction = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, any>,
  children?: (HTMLElement | string)[]
) => HTMLElementTagNameMap[K];

/**
 * DOM操作回调函数类型
 */
export type DOMCallback = (element: HTMLElement) => void;

/**
 * DOM观察器回调函数类型
 */
export type DOMObserverCallback = (entries: any[], observer: any) => void;

// ==================== 响应式相关类型 ====================

/**
 * 媒体查询配置接口
 */
export interface MediaQueryConfig {
  /** 查询字符串 */
  query: string;
  
  /** 匹配时的回调 */
  onMatch?: () => void;
  
  /** 不匹配时的回调 */
  onUnmatch?: () => void;
}

/**
 * 断点配置接口
 */
export interface BreakpointConfig {
  /** 断点名称 */
  name: string;
  
  /** 最小宽度 */
  minWidth?: number;
  
  /** 最大宽度 */
  maxWidth?: number;
  
  /** 媒体查询字符串 */
  mediaQuery?: string;
}

/**
 * 响应式配置接口
 */
export interface ResponsiveConfig {
  /** 断点列表 */
  breakpoints: BreakpointConfig[];
  
  /** 默认断点 */
  defaultBreakpoint?: string;
  
  /** 是否启用触摸检测 */
  enableTouchDetection?: boolean;
  
  /** 是否启用设备检测 */
  enableDeviceDetection?: boolean;
}
