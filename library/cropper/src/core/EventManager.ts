/**
 * @ldesign/cropper 事件管理器
 * 
 * 负责处理用户交互事件，包括鼠标、触摸、键盘事件的统一管理和分发
 */

import type {
  Point,
  CropperEvent,
  MouseEventData,
  TouchEventData,
  KeyboardEventData,
  GestureType,
  GestureEvent
} from '../types';
import {
  distance,
  angle,
  isPointInRect
} from '../utils/math';
import {
  debounce,
  throttle,
  addEventListenerSafe,
  removeEventListenerSafe
} from '../utils/event';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 事件管理器配置
// ============================================================================

/**
 * 事件管理器配置接口
 */
export interface EventManagerConfig {
  /** 是否启用鼠标事件 */
  enableMouse: boolean;
  /** 是否启用触摸事件 */
  enableTouch: boolean;
  /** 是否启用键盘事件 */
  enableKeyboard: boolean;
  /** 是否启用手势识别 */
  enableGestures: boolean;
  /** 双击检测时间间隔（毫秒） */
  doubleClickDelay: number;
  /** 长按检测时间（毫秒） */
  longPressDelay: number;
  /** 手势识别阈值 */
  gestureThreshold: number;
  /** 事件节流间隔（毫秒） */
  throttleDelay: number;
  /** 事件防抖间隔（毫秒） */
  debounceDelay: number;
  /** 是否阻止默认行为 */
  preventDefault: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation: boolean;
}

/**
 * 默认事件管理器配置
 */
export const DEFAULT_EVENT_CONFIG: EventManagerConfig = {
  enableMouse: true,
  enableTouch: true,
  enableKeyboard: true,
  enableGestures: true,
  doubleClickDelay: 300,
  longPressDelay: 500,
  gestureThreshold: 10,
  throttleDelay: 16, // ~60fps
  debounceDelay: 100,
  preventDefault: true,
  stopPropagation: true
};

// ============================================================================
// 交互状态
// ============================================================================

/**
 * 交互状态接口
 */
export interface InteractionState {
  /** 是否正在交互 */
  active: boolean;
  /** 交互类型 */
  type: 'mouse' | 'touch' | 'keyboard' | null;
  /** 开始位置 */
  startPoint: Point | null;
  /** 当前位置 */
  currentPoint: Point | null;
  /** 上一次位置 */
  lastPoint: Point | null;
  /** 交互开始时间 */
  startTime: number;
  /** 按下的按键 */
  pressedKeys: Set<string>;
  /** 触摸点信息 */
  touches: Map<number, Point>;
  /** 当前手势 */
  currentGesture: GestureType | null;
  /** 手势数据 */
  gestureData: any;
}

// ============================================================================
// 事件管理器类
// ============================================================================

/**
 * 事件管理器类
 * 负责处理用户交互事件的统一管理和分发
 */
export class EventManager {
  private config: EventManagerConfig;
  private container: HTMLElement;
  private state: InteractionState;
  private eventListeners: Map<string, Set<(event: CropperEvent) => void>> = new Map();
  private boundHandlers: Map<string, EventListener> = new Map();
  private lastClickTime: number = 0;
  private longPressTimer?: number;
  private gestureStartDistance?: number;
  private gestureStartAngle?: number;

  constructor(container: HTMLElement, config: Partial<EventManagerConfig> = {}) {
    this.config = { ...DEFAULT_EVENT_CONFIG, ...config };
    this.container = container;
    this.state = this.createInitialState();

    this.setupEventListeners();
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  addEventListener(type: string, listener: (event: CropperEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  removeEventListener(type: string, listener: (event: CropperEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 获取当前交互状态
   * @returns 交互状态
   */
  getState(): InteractionState {
    return { ...this.state };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<EventManagerConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupEventListeners();
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.removeAllEventListeners();
    this.eventListeners.clear();
    this.clearTimers();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.removeAllEventListeners();

    // 鼠标事件
    if (this.config.enableMouse) {
      this.addBoundEventListener('mousedown', this.handleMouseDown.bind(this));
      this.addBoundEventListener('mousemove', throttle(this.handleMouseMove.bind(this), this.config.throttleDelay));
      this.addBoundEventListener('mouseup', this.handleMouseUp.bind(this));
      this.addBoundEventListener('wheel', this.handleWheel.bind(this));
      this.addBoundEventListener('contextmenu', this.handleContextMenu.bind(this));
    }

    // 触摸事件
    if (this.config.enableTouch) {
      this.addBoundEventListener('touchstart', this.handleTouchStart.bind(this));
      this.addBoundEventListener('touchmove', throttle(this.handleTouchMove.bind(this), this.config.throttleDelay));
      this.addBoundEventListener('touchend', this.handleTouchEnd.bind(this));
      this.addBoundEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }

    // 键盘事件
    if (this.config.enableKeyboard) {
      this.addBoundEventListener('keydown', this.handleKeyDown.bind(this), document);
      this.addBoundEventListener('keyup', this.handleKeyUp.bind(this), document);
    }

    // 其他事件
    this.addBoundEventListener('blur', this.handleBlur.bind(this), window);
    this.addBoundEventListener('resize', debounce(this.handleResize.bind(this), this.config.debounceDelay), window);
  }

  /**
   * 添加绑定的事件监听器
   * @param type 事件类型
   * @param handler 处理函数
   * @param target 目标元素
   */
  private addBoundEventListener(type: string, handler: EventListener, target: EventTarget = this.container): void {
    const key = `${type}-${target === this.container ? 'container' : 'global'}`;
    this.boundHandlers.set(key, handler);
    this.addEventListenerSafe(target, type, handler);
  }

  /**
   * 安全添加事件监听器
   * @param target 目标元素
   * @param type 事件类型
   * @param handler 处理函数
   */
  private addEventListenerSafe(target: EventTarget, type: string, handler: EventListener): void {
    try {
      target.addEventListener(type, handler, { passive: false });
    } catch (error) {
      console.warn(`Failed to add event listener for ${type}:`, error);
    }
  }

  /**
   * 安全移除事件监听器
   * @param target 目标元素
   * @param type 事件类型
   * @param handler 处理函数
   */
  private removeEventListenerSafe(target: EventTarget, type: string, handler: EventListener): void {
    try {
      target.removeEventListener(type, handler);
    } catch (error) {
      console.warn(`Failed to remove event listener for ${type}:`, error);
    }
  }

  /**
   * 移除所有事件监听器
   */
  private removeAllEventListeners(): void {
    this.boundHandlers.forEach((handler, key) => {
      const [type, targetType] = key.split('-');
      const target = targetType === 'container' ? this.container :
        targetType === 'document' ? document : window;
      this.removeEventListenerSafe(target, type, handler);
    });
    this.boundHandlers.clear();
  }

  /**
   * 处理鼠标按下事件
   * @param event 鼠标事件
   */
  private handleMouseDown(event: MouseEvent): void {
    const startTime = performance.now();

    try {
      if (this.config.preventDefault) event.preventDefault();
      if (this.config.stopPropagation) event.stopPropagation();

      const point = this.getMousePoint(event);
      this.startInteraction('mouse', point);

      // 检测双击
      const currentTime = Date.now();
      if (currentTime - this.lastClickTime < this.config.doubleClickDelay) {
        this.emitEvent('double-click', {
          type: 'double-click',
          point,
          button: event.button,
          timestamp: currentTime
        });
      }
      this.lastClickTime = currentTime;

      // 开始长按检测
      this.startLongPressDetection(point);

      this.emitEvent('mouse-down', {
        type: 'mouse-down',
        point,
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        timestamp: currentTime
      });

      globalPerformanceMonitor.record('event-mouse-down', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('event-mouse-down-error', performance.now() - startTime);
      console.error('Error handling mouse down:', error);
    }
  }

  /**
   * 处理鼠标移动事件
   * @param event 鼠标事件
   */
  private handleMouseMove(event: MouseEvent): void {
    const point = this.getMousePoint(event);

    if (this.state.active && this.state.type === 'mouse') {
      this.updateInteraction(point);

      this.emitEvent('mouse-move', {
        type: 'mouse-move',
        point,
        delta: this.calculateDelta(point),
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        timestamp: Date.now()
      });
    } else {
      this.emitEvent('mouse-hover', {
        type: 'mouse-hover',
        point,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 处理鼠标抬起事件
   * @param event 鼠标事件
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const point = this.getMousePoint(event);
    this.endInteraction(point);

    this.clearTimers();

    this.emitEvent('mouse-up', {
      type: 'mouse-up',
      point,
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      timestamp: Date.now()
    });
  }

  /**
   * 处理滚轮事件
   * @param event 滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const point = this.getMousePoint(event);
    const delta = {
      x: event.deltaX,
      y: event.deltaY,
      z: event.deltaZ
    };

    this.emitEvent('wheel', {
      type: 'wheel',
      point,
      delta,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      timestamp: Date.now()
    });
  }

  /**
   * 处理右键菜单事件
   * @param event 鼠标事件
   */
  private handleContextMenu(event: MouseEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const point = this.getMousePoint(event);
    this.emitEvent('context-menu', {
      type: 'context-menu',
      point,
      timestamp: Date.now()
    });
  }

  /**
   * 处理触摸开始事件
   * @param event 触摸事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const touches = this.getTouchPoints(event);
    const primaryTouch = touches[0];

    if (touches.length === 1) {
      this.startInteraction('touch', primaryTouch);
      this.startLongPressDetection(primaryTouch);
    }

    // 更新触摸点信息
    this.updateTouches(event);

    // 手势识别
    if (this.config.enableGestures && touches.length >= 2) {
      this.startGestureDetection(touches);
    }

    this.emitEvent('touch-start', {
      type: 'touch-start',
      point: primaryTouch,
      touches,
      timestamp: Date.now()
    });
  }

  /**
   * 处理触摸移动事件
   * @param event 触摸事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const touches = this.getTouchPoints(event);
    const primaryTouch = touches[0];

    if (this.state.active && this.state.type === 'touch') {
      this.updateInteraction(primaryTouch);
    }

    // 更新触摸点信息
    this.updateTouches(event);

    // 手势识别
    if (this.config.enableGestures && touches.length >= 2) {
      this.updateGestureDetection(touches);
    }

    this.emitEvent('touch-move', {
      type: 'touch-move',
      point: primaryTouch,
      touches,
      delta: this.calculateDelta(primaryTouch),
      timestamp: Date.now()
    });
  }

  /**
   * 处理触摸结束事件
   * @param event 触摸事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.config.preventDefault) event.preventDefault();
    if (this.config.stopPropagation) event.stopPropagation();

    const touches = this.getTouchPoints(event);
    const primaryTouch = touches[0] || this.state.currentPoint || { x: 0, y: 0 };

    if (event.touches.length === 0) {
      this.endInteraction(primaryTouch);
      this.clearTimers();
    }

    // 更新触摸点信息
    this.updateTouches(event);

    // 结束手势识别
    if (this.config.enableGestures) {
      this.endGestureDetection();
    }

    this.emitEvent('touch-end', {
      type: 'touch-end',
      point: primaryTouch,
      touches,
      timestamp: Date.now()
    });
  }

  /**
   * 处理触摸取消事件
   * @param event 触摸事件
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.handleTouchEnd(event);
  }

  /**
   * 处理键盘按下事件
   * @param event 键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.state.pressedKeys.add(event.code);

    this.emitEvent('key-down', {
      type: 'key-down',
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now()
    });
  }

  /**
   * 处理键盘抬起事件
   * @param event 键盘事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.state.pressedKeys.delete(event.code);

    this.emitEvent('key-up', {
      type: 'key-up',
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now()
    });
  }

  /**
   * 处理失焦事件
   * @param event 失焦事件
   */
  private handleBlur(event: FocusEvent): void {
    this.endInteraction();
    this.clearTimers();
    this.state.pressedKeys.clear();

    this.emitEvent('blur', {
      type: 'blur',
      timestamp: Date.now()
    });
  }

  /**
   * 处理窗口大小改变事件
   * @param event 大小改变事件
   */
  private handleResize(event: Event): void {
    this.emitEvent('resize', {
      type: 'resize',
      timestamp: Date.now()
    });
  }

  /**
   * 开始交互
   * @param type 交互类型
   * @param point 开始位置
   */
  private startInteraction(type: 'mouse' | 'touch', point: Point): void {
    this.state.active = true;
    this.state.type = type;
    this.state.startPoint = point;
    this.state.currentPoint = point;
    this.state.lastPoint = point;
    this.state.startTime = Date.now();
  }

  /**
   * 更新交互
   * @param point 当前位置
   */
  private updateInteraction(point: Point): void {
    this.state.lastPoint = this.state.currentPoint;
    this.state.currentPoint = point;
  }

  /**
   * 结束交互
   * @param point 结束位置
   */
  private endInteraction(point?: Point): void {
    if (point) {
      this.state.currentPoint = point;
    }

    this.state.active = false;
    this.state.type = null;
    this.state.currentGesture = null;
    this.state.gestureData = null;
  }

  /**
   * 创建初始状态
   * @returns 初始状态
   */
  private createInitialState(): InteractionState {
    return {
      active: false,
      type: null,
      startPoint: null,
      currentPoint: null,
      lastPoint: null,
      startTime: 0,
      pressedKeys: new Set(),
      touches: new Map(),
      currentGesture: null,
      gestureData: null
    };
  }

  /**
   * 获取鼠标位置
   * @param event 鼠标事件
   * @returns 鼠标位置
   */
  private getMousePoint(event: MouseEvent): Point {
    const rect = this.container.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * 获取触摸位置
   * @param event 触摸事件
   * @returns 触摸位置数组
   */
  private getTouchPoints(event: TouchEvent): Point[] {
    const rect = this.container.getBoundingClientRect();
    return Array.from(event.touches).map(touch => ({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }));
  }

  /**
   * 更新触摸点信息
   * @param event 触摸事件
   */
  private updateTouches(event: TouchEvent): void {
    this.state.touches.clear();
    Array.from(event.touches).forEach((touch, index) => {
      const rect = this.container.getBoundingClientRect();
      this.state.touches.set(touch.identifier, {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    });
  }

  /**
   * 计算移动增量
   * @param currentPoint 当前位置
   * @returns 移动增量
   */
  private calculateDelta(currentPoint: Point): Point {
    if (!this.state.lastPoint) {
      return { x: 0, y: 0 };
    }
    return {
      x: currentPoint.x - this.state.lastPoint.x,
      y: currentPoint.y - this.state.lastPoint.y
    };
  }

  /**
   * 开始长按检测
   * @param point 位置
   */
  private startLongPressDetection(point: Point): void {
    this.clearTimers();
    this.longPressTimer = window.setTimeout(() => {
      this.emitEvent('long-press', {
        type: 'long-press',
        point,
        timestamp: Date.now()
      });
    }, this.config.longPressDelay);
  }

  /**
   * 开始手势检测
   * @param touches 触摸点
   */
  private startGestureDetection(touches: Point[]): void {
    if (touches.length >= 2) {
      this.gestureStartDistance = distance(touches[0], touches[1]);
      this.gestureStartAngle = angle(touches[0], touches[1]);
      this.state.currentGesture = 'pinch';
      this.state.gestureData = {
        startDistance: this.gestureStartDistance,
        startAngle: this.gestureStartAngle,
        currentDistance: this.gestureStartDistance,
        currentAngle: this.gestureStartAngle
      };
    }
  }

  /**
   * 更新手势检测
   * @param touches 触摸点
   */
  private updateGestureDetection(touches: Point[]): void {
    if (touches.length >= 2 && this.state.currentGesture === 'pinch') {
      const currentDistance = distance(touches[0], touches[1]);
      const currentAngle = angle(touches[0], touches[1]);

      this.state.gestureData = {
        ...this.state.gestureData,
        currentDistance,
        currentAngle
      };

      const gestureEvent: GestureEvent = {
        type: 'pinch',
        scale: currentDistance / this.gestureStartDistance!,
        rotation: currentAngle - this.gestureStartAngle!,
        center: {
          x: (touches[0].x + touches[1].x) / 2,
          y: (touches[0].y + touches[1].y) / 2
        },
        distance: currentDistance,
        timestamp: Date.now()
      };

      this.emitEvent('gesture', gestureEvent);
    }
  }

  /**
   * 结束手势检测
   */
  private endGestureDetection(): void {
    this.state.currentGesture = null;
    this.state.gestureData = null;
    this.gestureStartDistance = undefined;
    this.gestureStartAngle = undefined;
  }

  /**
   * 清除定时器
   */
  private clearTimers(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  /**
   * 发射事件
   * @param type 事件类型
   * @param event 事件数据
   */
  private emitEvent(type: string, event: CropperEvent): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * 创建初始手势状态
   * @returns 初始手势状态
   */
  private createInitialGestureState(): any {
    return {
      active: false,
      type: null,
      startDistance: 0,
      startAngle: 0,
      currentDistance: 0,
      currentAngle: 0
    };
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: any): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.removeAllEventListeners();
    this.eventListeners.clear();
    this.gestureState = this.createInitialGestureState();
  }


}
