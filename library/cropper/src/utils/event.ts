/**
 * @ldesign/cropper 事件处理工具函数
 * 
 * 提供事件监听、手势识别、防抖节流等事件处理工具函数
 */

import type { Point, GestureType } from '../types';

// ============================================================================
// 基础事件工具
// ============================================================================

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 一次性事件监听器
 * @param element 元素
 * @param event 事件名
 * @param handler 处理函数
 * @param options 选项
 */
export function once<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  const onceHandler = (e: HTMLElementEventMap[K]) => {
    handler(e);
    element.removeEventListener(event, onceHandler, options);
  };
  element.addEventListener(event, onceHandler, options);
}

/**
 * 事件委托
 * @param container 容器元素
 * @param selector 目标选择器
 * @param event 事件名
 * @param handler 处理函数
 */
export function delegate<K extends keyof HTMLElementEventMap>(
  container: HTMLElement,
  selector: string,
  event: K,
  handler: (event: HTMLElementEventMap[K], target: Element) => void
): void {
  container.addEventListener(event, (e) => {
    const target = (e.target as Element).closest(selector);
    if (target) {
      handler(e, target);
    }
  });
}

// ============================================================================
// 鼠标事件工具
// ============================================================================

/**
 * 获取鼠标相对于元素的位置
 * @param event 鼠标事件
 * @param element 目标元素
 * @returns 相对位置
 */
export function getMousePosition(event: MouseEvent, element: Element): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

/**
 * 检查是否为左键点击
 * @param event 鼠标事件
 * @returns 是否为左键
 */
export function isLeftClick(event: MouseEvent): boolean {
  return event.button === 0;
}

/**
 * 检查是否为右键点击
 * @param event 鼠标事件
 * @returns 是否为右键
 */
export function isRightClick(event: MouseEvent): boolean {
  return event.button === 2;
}

/**
 * 检查是否为中键点击
 * @param event 鼠标事件
 * @returns 是否为中键
 */
export function isMiddleClick(event: MouseEvent): boolean {
  return event.button === 1;
}

/**
 * 获取滚轮方向
 * @param event 滚轮事件
 * @returns 滚轮方向（1向上，-1向下，0无滚动）
 */
export function getWheelDirection(event: WheelEvent): number {
  if (event.deltaY > 0) return -1; // 向下滚动
  if (event.deltaY < 0) return 1;  // 向上滚动
  return 0;
}

/**
 * 获取滚轮增量
 * @param event 滚轮事件
 * @returns 标准化的滚轮增量
 */
export function getWheelDelta(event: WheelEvent): number {
  // 标准化不同浏览器的滚轮增量
  let delta = 0;
  
  if (event.deltaY) {
    delta = -event.deltaY;
  } else if ((event as any).wheelDelta) {
    delta = (event as any).wheelDelta;
  } else if ((event as any).detail) {
    delta = -(event as any).detail * 40;
  }
  
  // 限制增量范围
  return Math.max(-1, Math.min(1, delta / 120));
}

// ============================================================================
// 触摸事件工具
// ============================================================================

/**
 * 获取触摸点相对于元素的位置
 * @param touch 触摸点
 * @param element 目标元素
 * @returns 相对位置
 */
export function getTouchPosition(touch: Touch, element: Element): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

/**
 * 获取所有触摸点的位置
 * @param event 触摸事件
 * @param element 目标元素
 * @returns 触摸点位置数组
 */
export function getTouchPositions(event: TouchEvent, element: Element): Point[] {
  return Array.from(event.touches).map(touch => getTouchPosition(touch, element));
}

/**
 * 计算触摸点的中心位置
 * @param touches 触摸点数组
 * @returns 中心位置
 */
export function getTouchCenter(touches: Point[]): Point {
  if (touches.length === 0) return { x: 0, y: 0 };
  
  const sum = touches.reduce(
    (acc, touch) => ({ x: acc.x + touch.x, y: acc.y + touch.y }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / touches.length,
    y: sum.y / touches.length
  };
}

/**
 * 计算两个触摸点之间的距离
 * @param touch1 第一个触摸点
 * @param touch2 第二个触摸点
 * @returns 距离
 */
export function getTouchDistance(touch1: Point, touch2: Point): number {
  const dx = touch2.x - touch1.x;
  const dy = touch2.y - touch1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两个触摸点之间的角度
 * @param touch1 第一个触摸点
 * @param touch2 第二个触摸点
 * @returns 角度（弧度）
 */
export function getTouchAngle(touch1: Point, touch2: Point): number {
  return Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x);
}

/**
 * 计算触摸缩放比例
 * @param currentDistance 当前距离
 * @param initialDistance 初始距离
 * @returns 缩放比例
 */
export function getTouchScale(currentDistance: number, initialDistance: number): number {
  return initialDistance > 0 ? currentDistance / initialDistance : 1;
}

/**
 * 计算触摸旋转角度
 * @param currentAngle 当前角度
 * @param initialAngle 初始角度
 * @returns 旋转角度差
 */
export function getTouchRotation(currentAngle: number, initialAngle: number): number {
  let rotation = currentAngle - initialAngle;
  
  // 标准化角度到 -π 到 π 范围
  while (rotation > Math.PI) rotation -= 2 * Math.PI;
  while (rotation < -Math.PI) rotation += 2 * Math.PI;
  
  return rotation;
}

// ============================================================================
// 手势识别
// ============================================================================

/**
 * 手势识别器类
 */
export class GestureRecognizer {
  private startTime: number = 0;
  private startPosition: Point = { x: 0, y: 0 };
  private currentPosition: Point = { x: 0, y: 0 };
  private lastTapTime: number = 0;
  private tapCount: number = 0;
  private isLongPress: boolean = false;
  private longPressTimer: number | undefined;
  
  // 配置参数
  private readonly doubleTapInterval: number = 300; // 双击间隔
  private readonly longPressTime: number = 500;     // 长按时间
  private readonly minPanDistance: number = 10;     // 最小拖拽距离
  private readonly maxTapDistance: number = 10;     // 最大点击距离

  /**
   * 开始手势识别
   * @param position 起始位置
   */
  start(position: Point): void {
    this.startTime = Date.now();
    this.startPosition = { ...position };
    this.currentPosition = { ...position };
    this.isLongPress = false;
    
    // 设置长按定时器
    this.longPressTimer = window.setTimeout(() => {
      this.isLongPress = true;
      this.onGesture('longPress', {
        center: this.currentPosition,
        startPoint: this.startPosition,
        currentPoint: this.currentPosition,
        duration: Date.now() - this.startTime
      });
    }, this.longPressTime);
  }

  /**
   * 更新手势位置
   * @param position 当前位置
   */
  move(position: Point): void {
    this.currentPosition = { ...position };
    
    const distance = this.getDistance();
    if (distance > this.minPanDistance && !this.isLongPress) {
      this.clearLongPressTimer();
      this.onGesture('pan', {
        center: this.currentPosition,
        startPoint: this.startPosition,
        currentPoint: this.currentPosition,
        distance,
        velocity: this.getVelocity(),
        duration: Date.now() - this.startTime
      });
    }
  }

  /**
   * 结束手势识别
   */
  end(): void {
    this.clearLongPressTimer();
    
    const distance = this.getDistance();
    const duration = Date.now() - this.startTime;
    
    if (!this.isLongPress && distance <= this.maxTapDistance) {
      // 检测点击或双击
      const now = Date.now();
      if (now - this.lastTapTime <= this.doubleTapInterval) {
        this.tapCount++;
        if (this.tapCount === 2) {
          this.onGesture('doubleTap', {
            center: this.currentPosition,
            startPoint: this.startPosition,
            currentPoint: this.currentPosition,
            duration
          });
          this.tapCount = 0;
        }
      } else {
        this.tapCount = 1;
        // 延迟触发单击，等待可能的双击
        setTimeout(() => {
          if (this.tapCount === 1) {
            this.onGesture('tap', {
              center: this.currentPosition,
              startPoint: this.startPosition,
              currentPoint: this.currentPosition,
              duration
            });
          }
          this.tapCount = 0;
        }, this.doubleTapInterval);
      }
      this.lastTapTime = now;
    } else if (distance > this.minPanDistance) {
      // 检测滑动
      const velocity = this.getVelocity();
      if (velocity.x > 0.5 || velocity.y > 0.5) {
        this.onGesture('swipe', {
          center: this.currentPosition,
          startPoint: this.startPosition,
          currentPoint: this.currentPosition,
          velocity,
          distance,
          duration
        });
      }
    }
  }

  /**
   * 取消手势识别
   */
  cancel(): void {
    this.clearLongPressTimer();
    this.tapCount = 0;
  }

  /**
   * 获取当前距离
   */
  private getDistance(): number {
    const dx = this.currentPosition.x - this.startPosition.x;
    const dy = this.currentPosition.y - this.startPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取当前速度
   */
  private getVelocity(): Point {
    const duration = Date.now() - this.startTime;
    if (duration === 0) return { x: 0, y: 0 };
    
    const dx = this.currentPosition.x - this.startPosition.x;
    const dy = this.currentPosition.y - this.startPosition.y;
    
    return {
      x: Math.abs(dx) / duration,
      y: Math.abs(dy) / duration
    };
  }

  /**
   * 清除长按定时器
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  /**
   * 手势事件回调（需要被重写）
   * @param type 手势类型
   * @param data 手势数据
   */
  protected onGesture(type: GestureType, data: any): void {
    // 子类重写此方法来处理手势事件
  }
}

// ============================================================================
// 键盘事件工具
// ============================================================================

/**
 * 检查是否按下了修饰键
 * @param event 键盘事件
 * @returns 修饰键状态
 */
export function getModifierKeys(event: KeyboardEvent): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
} {
  return {
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey
  };
}

/**
 * 检查是否为特定的键盘组合
 * @param event 键盘事件
 * @param key 键名
 * @param modifiers 修饰键
 * @returns 是否匹配
 */
export function isKeyCombo(
  event: KeyboardEvent,
  key: string,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
): boolean {
  const eventModifiers = getModifierKeys(event);
  
  return event.key.toLowerCase() === key.toLowerCase() &&
         eventModifiers.ctrl === (modifiers.ctrl || false) &&
         eventModifiers.shift === (modifiers.shift || false) &&
         eventModifiers.alt === (modifiers.alt || false) &&
         eventModifiers.meta === (modifiers.meta || false);
}

/**
 * 阻止默认行为和事件传播
 * @param event 事件对象
 */
export function preventDefault(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}
