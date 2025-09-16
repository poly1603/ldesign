/**
 * @ldesign/cropper - 事件处理器
 * 
 * 统一处理鼠标、触摸和键盘事件
 */

import type { Point } from '../types';
import { getTouchPoint, getMousePoint, throttle, debounce } from '../utils';

/**
 * 事件类型
 */
export type InteractionEventType = 
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'wheel'
  | 'keydown'
  | 'keyup';

/**
 * 事件数据
 */
export interface InteractionEventData {
  type: InteractionEventType;
  point: Point;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  key?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  originalEvent: Event;
}

/**
 * 事件监听器
 */
export type InteractionEventListener = (data: InteractionEventData) => void;

/**
 * 事件处理器类
 * 
 * 统一处理各种输入事件，提供一致的事件接口
 */
export class EventHandler {
  private element: HTMLElement;
  private listeners: Map<InteractionEventType, Set<InteractionEventListener>> = new Map();
  private isPointerDown: boolean = false;
  private lastPointerPosition: Point = { x: 0, y: 0 };
  private pointerStartPosition: Point = { x: 0, y: 0 };
  private touchStartDistance: number = 0;
  private touchStartScale: number = 1;

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标事件
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // 触摸事件
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

    // 滚轮事件
    this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // 阻止默认的上下文菜单
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseUp.bind(this));

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));

    this.element.removeEventListener('wheel', this.handleWheel.bind(this));

    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    
    this.isPointerDown = true;
    this.lastPointerPosition = getMousePoint(event);
    this.pointerStartPosition = { ...this.lastPointerPosition };

    this.emit('pointerdown', {
      type: 'pointerdown',
      point: this.lastPointerPosition,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event
    });
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove = throttle((event: MouseEvent): void => {
    const currentPoint = getMousePoint(event);
    
    if (this.isPointerDown) {
      const deltaX = currentPoint.x - this.lastPointerPosition.x;
      const deltaY = currentPoint.y - this.lastPointerPosition.y;

      this.emit('pointermove', {
        type: 'pointermove',
        point: currentPoint,
        deltaX,
        deltaY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        originalEvent: event
      });
    }

    this.lastPointerPosition = currentPoint;
  }, 16); // 60fps

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.isPointerDown) return;

    this.isPointerDown = false;
    const currentPoint = getMousePoint(event);

    this.emit('pointerup', {
      type: 'pointerup',
      point: currentPoint,
      deltaX: currentPoint.x - this.pointerStartPosition.x,
      deltaY: currentPoint.y - this.pointerStartPosition.y,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event
    });
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 1) {
      // 单指触摸
      this.isPointerDown = true;
      this.lastPointerPosition = getTouchPoint(event);
      this.pointerStartPosition = { ...this.lastPointerPosition };

      this.emit('pointerdown', {
        type: 'pointerdown',
        point: this.lastPointerPosition,
        originalEvent: event
      });
    } else if (event.touches.length === 2) {
      // 双指触摸（缩放/旋转）
      this.isPointerDown = false;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      this.touchStartDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      this.touchStartScale = 1;
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove = throttle((event: TouchEvent): void => {
    event.preventDefault();

    if (event.touches.length === 1 && this.isPointerDown) {
      // 单指拖拽
      const currentPoint = getTouchPoint(event);
      const deltaX = currentPoint.x - this.lastPointerPosition.x;
      const deltaY = currentPoint.y - this.lastPointerPosition.y;

      this.emit('pointermove', {
        type: 'pointermove',
        point: currentPoint,
        deltaX,
        deltaY,
        originalEvent: event
      });

      this.lastPointerPosition = currentPoint;
    } else if (event.touches.length === 2) {
      // 双指缩放
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = currentDistance / this.touchStartDistance;
      const centerPoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      this.emit('wheel', {
        type: 'wheel',
        point: centerPoint,
        scale: scale / this.touchStartScale,
        originalEvent: event
      });

      this.touchStartScale = scale;
    }
  }, 16); // 60fps

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.isPointerDown && event.touches.length === 0) {
      this.isPointerDown = false;
      
      const currentPoint = event.changedTouches.length > 0 
        ? getTouchPoint(event) 
        : this.lastPointerPosition;

      this.emit('pointerup', {
        type: 'pointerup',
        point: currentPoint,
        deltaX: currentPoint.x - this.pointerStartPosition.x,
        deltaY: currentPoint.y - this.pointerStartPosition.y,
        originalEvent: event
      });
    }
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel = debounce((event: WheelEvent): void => {
    event.preventDefault();

    const point = getMousePoint(event);
    const scale = event.deltaY > 0 ? 0.9 : 1.1;

    this.emit('wheel', {
      type: 'wheel',
      point,
      scale,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event
    });
  }, 50);

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.emit('keydown', {
      type: 'keydown',
      point: { x: 0, y: 0 },
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event
    });
  }

  /**
   * 处理键盘抬起事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.emit('keyup', {
      type: 'keyup',
      point: { x: 0, y: 0 },
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event
    });
  }

  /**
   * 添加事件监听器
   */
  on(type: InteractionEventType, listener: InteractionEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(type: InteractionEventType, listener?: InteractionEventListener): void {
    const eventListeners = this.listeners.get(type);
    if (!eventListeners) return;

    if (listener) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(type);
      }
    } else {
      this.listeners.delete(type);
    }
  }

  /**
   * 触发事件
   */
  private emit(type: InteractionEventType, data: InteractionEventData): void {
    const eventListeners = this.listeners.get(type);
    if (!eventListeners) return;

    const listeners = Array.from(eventListeners);
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    }
  }

  /**
   * 销毁事件处理器
   */
  destroy(): void {
    this.removeEventListeners();
    this.listeners.clear();
  }
}
