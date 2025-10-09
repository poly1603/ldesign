/**
 * @fileoverview Drawer component utility functions
 * @module drawer.utils
 */

import {
  DrawerPlacement,
  SizePreset,
  DrawerState,
  AnimationType,
  AnimationEasing,
  CloseReason,
  DrawerOptions,
  SnapPoint,
} from './drawer.types';

/** 抽屉堆栈管理 */
export const drawerStack: HTMLElement[] = [];

/** 容器滚动锁定管理 */
const containerLocks = new WeakMap<HTMLElement, { count: number; originalStyle: string }>();

/** 获取默认大小 */
export function getDefaultSize(placement: DrawerPlacement, preset?: SizePreset): string {
  const sizeMap: Record<SizePreset, Record<DrawerPlacement, string>> = {
    xs: { left: '200px', right: '200px', top: '100px', bottom: '100px' },
    sm: { left: '300px', right: '300px', top: '150px', bottom: '150px' },
    md: { left: '400px', right: '400px', top: '200px', bottom: '200px' },
    lg: { left: '600px', right: '600px', top: '300px', bottom: '300px' },
    xl: { left: '800px', right: '800px', top: '400px', bottom: '400px' },
    full: { left: '100%', right: '100%', top: '100%', bottom: '100%' },
    auto: { left: 'auto', right: 'auto', top: 'auto', bottom: 'auto' },
  };

  if (preset && sizeMap[preset]) {
    return sizeMap[preset][placement];
  }

  // 默认大小
  return placement === 'left' || placement === 'right' ? '400px' : '300px';
}

/** 解析大小值 */
export function parseSize(size: number | string | SizePreset, placement: DrawerPlacement): string {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  if (typeof size === 'string') {
    // 检查是否为预设值
    if (['xs', 'sm', 'md', 'lg', 'xl', 'full', 'auto'].includes(size)) {
      return getDefaultSize(placement, size as SizePreset);
    }
    return size;
  }

  return getDefaultSize(placement);
}

/** 计算实际大小 */
export function calculateActualSize(
  size: string,
  containerSize: number,
  minSize?: string,
  maxSize?: string
): number {
  let actualSize: number;

  if (size.endsWith('%')) {
    actualSize = (containerSize * parseFloat(size)) / 100;
  } else if (size.endsWith('px')) {
    actualSize = parseFloat(size);
  } else if (size.endsWith('vh')) {
    actualSize = (window.innerHeight * parseFloat(size)) / 100;
  } else if (size.endsWith('vw')) {
    actualSize = (window.innerWidth * parseFloat(size)) / 100;
  } else {
    actualSize = parseFloat(size) || 400;
  }

  // 应用最小值限制
  if (minSize) {
    const min = calculateActualSize(minSize, containerSize);
    actualSize = Math.max(actualSize, min);
  }

  // 应用最大值限制
  if (maxSize) {
    const max = calculateActualSize(maxSize, containerSize);
    actualSize = Math.min(actualSize, max);
  }

  return actualSize;
}

/** 获取变换样式 */
export function getTransformStyle(
  placement: DrawerPlacement,
  progress: number,
  size: string
): string {
  const offset = `calc(${size} * ${1 - progress})`;

  switch (placement) {
    case 'left':
      return `translateX(-${offset})`;
    case 'right':
      return `translateX(${offset})`;
    case 'top':
      return `translateY(-${offset})`;
    case 'bottom':
      return `translateY(${offset})`;
    default:
      return '';
  }
}

/** 获取动画类名 */
export function getAnimationClass(
  type: AnimationType,
  state: DrawerState,
  placement: DrawerPlacement
): string {
  const baseClass = `drawer-animation-${type}`;
  const stateClass = `drawer-${state}`;
  const placementClass = `drawer-${placement}`;

  return `${baseClass} ${stateClass} ${placementClass}`;
}

/** 获取缓动函数 */
export function getEasingFunction(easing: AnimationEasing): string {
  const easingMap: Record<AnimationEasing, string> = {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'cubic-bezier': 'cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return easingMap[easing] || 'ease';
}

/** 锁定容器滚动 */
export function lockContainerScroll(container: HTMLElement): void {
  const lock = containerLocks.get(container) || { count: 0, originalStyle: '' };

  if (lock.count === 0) {
    lock.originalStyle = container.style.overflow;
    container.style.overflow = 'hidden';
  }

  lock.count++;
  containerLocks.set(container, lock);
}

/** 解锁容器滚动 */
export function unlockContainerScroll(container: HTMLElement): void {
  const lock = containerLocks.get(container);

  if (!lock) return;

  lock.count--;

  if (lock.count === 0) {
    container.style.overflow = lock.originalStyle;
    containerLocks.delete(container);
  } else {
    containerLocks.set(container, lock);
  }
}

/** 锁定页面滚动 - 优化版本，防止页面抖动 */
export function lockPageScroll(): void {
  // 计算滚动条宽度
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  // 保存原始样式（用于恢复）
  if (!document.body.hasAttribute('data-scroll-locked')) {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
    const originalPosition = window.getComputedStyle(document.body).position;
    
    document.body.setAttribute('data-scroll-locked', 'true');
    document.body.setAttribute('data-original-overflow', originalOverflow);
    document.body.setAttribute('data-original-padding-right', originalPaddingRight);
    document.body.setAttribute('data-original-position', originalPosition);
    
    // 保存当前滚动位置
    const scrollY = window.scrollY || window.pageYOffset;
    document.body.setAttribute('data-scroll-y', scrollY.toString());
  }
  
  // 锁定滚动
  document.body.style.overflow = 'hidden';
  
  // 补偿滚动条宽度，防止内容抖动
  if (scrollbarWidth > 0) {
    const currentPadding = parseInt(document.body.getAttribute('data-original-padding-right') || '0');
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    
    // 同时补偿 fixed 元素（如头部导航栏）
    const fixedElements = document.querySelectorAll('[data-fixed-compensate]');
    fixedElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const originalPadding = window.getComputedStyle(htmlEl).paddingRight;
      htmlEl.setAttribute('data-original-padding-right', originalPadding);
      const currentPadding = parseInt(originalPadding) || 0;
      htmlEl.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    });
  }
  
  // 移动设备的额外处理：使用 position: fixed 防止滚动突破
  // 仅在 iOS 上使用，因为 overflow:hidden 在 iOS 上不可靠
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (isIOS) {
    const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  }
}

/** 解锁页面滚动 - 优化版本，恢复原始状态 */
export function unlockPageScroll(): void {
  if (!document.body.hasAttribute('data-scroll-locked')) {
    return;
  }
  
  // 恢复原始样式
  const originalOverflow = document.body.getAttribute('data-original-overflow') || '';
  const originalPaddingRight = document.body.getAttribute('data-original-padding-right') || '';
  const originalPosition = document.body.getAttribute('data-original-position') || '';
  const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0');
  
  document.body.style.overflow = originalOverflow;
  document.body.style.paddingRight = originalPaddingRight;
  
  // 移除标记
  document.body.removeAttribute('data-scroll-locked');
  document.body.removeAttribute('data-original-overflow');
  document.body.removeAttribute('data-original-padding-right');
  document.body.removeAttribute('data-original-position');
  document.body.removeAttribute('data-scroll-y');
  
  // 恢复 fixed 元素的 padding
  const fixedElements = document.querySelectorAll('[data-fixed-compensate][data-original-padding-right]');
  fixedElements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    const originalPadding = htmlEl.getAttribute('data-original-padding-right') || '';
    htmlEl.style.paddingRight = originalPadding;
    htmlEl.removeAttribute('data-original-padding-right');
  });
  
  // iOS 的特殊处理：恢复位置和滚动
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (isIOS) {
    document.body.style.position = originalPosition;
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }
}

/** 管理抽屉堆栈 */
export function addToStack(element: HTMLElement): void {
  drawerStack.push(element);
  updateStackZIndex();
}

/** 从堆栈中移除 */
export function removeFromStack(element: HTMLElement): void {
  const index = drawerStack.indexOf(element);
  if (index > -1) {
    drawerStack.splice(index, 1);
    updateStackZIndex();
  }
}

/** 更新堆栈 z-index */
export function updateStackZIndex(): void {
  drawerStack.forEach((drawer, index) => {
    const zIndex = 1000 + index * 10;
    drawer.style.zIndex = String(zIndex);
  });
}

/** 获取栈顶抽屉 */
export function getTopDrawer(): HTMLElement | undefined {
  return drawerStack[drawerStack.length - 1];
}

/** 判断是否为栈顶 */
export function isTopDrawer(element: HTMLElement): boolean {
  return getTopDrawer() === element;
}

/** 查找最近的吸附点 */
export function findNearestSnapPoint(
  value: number,
  snapPoints: SnapPoint[],
  threshold: number
): SnapPoint | null {
  let nearest: SnapPoint | null = null;
  let minDistance = threshold;

  for (const point of snapPoints) {
    if (point.disabled) continue;

    const distance = Math.abs(value - point.value);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  }

  return nearest;
}

/** 应用阻尼效果 */
export function applyDamping(delta: number, factor: number): number {
  return delta * factor;
}

/** 计算滑动速度 */
export function calculateVelocity(
  startPos: number,
  endPos: number,
  duration: number
): number {
  if (duration === 0) return 0;
  return Math.abs(endPos - startPos) / duration;
}

/** 判断是否应该触发滑动关闭 */
export function shouldTriggerSwipeClose(
  progress: number,
  velocity: number,
  threshold: number,
  velocityThreshold: number = 0.3
): boolean {
  return progress >= threshold || velocity >= velocityThreshold;
}

/** 创建防抖函数 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/** 创建节流函数 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/** 获取焦点捕获元素 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
  ).filter((el) => el.offsetParent !== null);
}

/** 捕获焦点 */
export function trapFocus(container: HTMLElement, autoFocus: boolean = true): void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (autoFocus) {
    firstElement.focus();
  }

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // 保存清理函数
  (container as any).__focusTrapCleanup = () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/** 释放焦点捕获 */
export function releaseFocusTrap(container: HTMLElement): void {
  const cleanup = (container as any).__focusTrapCleanup;
  if (cleanup) {
    cleanup();
    delete (container as any).__focusTrapCleanup;
  }
}

/** 获取容器元素 */
export function getContainer(container?: string | HTMLElement): HTMLElement {
  if (!container) {
    return document.body;
  }

  if (typeof container === 'string') {
    const element = document.querySelector<HTMLElement>(container);
    return element || document.body;
  }

  return container;
}

/** 合并选项 */
export function mergeOptions(
  defaults: Partial<DrawerOptions>,
  options: Partial<DrawerOptions>
): DrawerOptions {
  return {
    ...defaults,
    ...options,
    keyboard: mergeKeyboardConfig(defaults.keyboard, options.keyboard),
    animation: mergeAnimationConfig(defaults.animation, options.animation),
    resize: mergeResizeConfig(defaults.resize, options.resize),
    swipe: mergeSwipeConfig(defaults.swipe, options.swipe),
    header: mergeHeaderConfig(defaults.header, options.header),
    footer: mergeFooterConfig(defaults.footer, options.footer),
    loading: mergeLoadingConfig(defaults.loading, options.loading),
    performance: mergePerformanceConfig(defaults.performance, options.performance),
    a11y: mergeA11yConfig(defaults.a11y, options.a11y),
  } as DrawerOptions;
}

// 配置合并辅助函数
function mergeKeyboardConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeAnimationConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeResizeConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeSwipeConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeHeaderConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeFooterConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b;
  if (typeof a === 'boolean') return b || a;
  return { ...a, ...b };
}

function mergeLoadingConfig(a: any, b: any): any {
  if (typeof b === 'boolean') return b ? { show: true } : { show: false };
  if (typeof a === 'boolean') return b || (a ? { show: true } : { show: false });
  return { ...a, ...b };
}

function mergePerformanceConfig(a: any, b: any): any {
  return { ...a, ...b };
}

function mergeA11yConfig(a: any, b: any): any {
  return { ...a, ...b };
}

/** 生成唯一ID */
export function generateId(prefix: string = 'drawer'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** 判断是否为移动设备 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/** 判断是否支持触摸 */
export function isTouch(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/** 获取触摸或鼠标事件坐标 */
export function getEventCoordinates(event: TouchEvent | MouseEvent): { x: number; y: number } {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  if ('clientX' in event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  return { x: 0, y: 0 };
}

/** 判断是否为有效的关闭原因 */
export function isValidCloseReason(reason: any): reason is CloseReason {
  return ['mask', 'escape', 'button', 'swipe', 'api', 'route'].includes(reason);
}

/** 等待动画完成 */
export function waitForAnimation(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/** 触发自定义事件 */
export function emitCustomEvent(
  element: HTMLElement,
  eventName: string,
  detail?: any
): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(event);
}

/** 计算过渡持续时间 */
export function getTransitionDuration(element: HTMLElement): number {
  const style = getComputedStyle(element);
  const duration = style.transitionDuration;

  if (!duration || duration === '0s') return 0;

  // 解析持续时间（支持 ms 和 s）
  if (duration.endsWith('ms')) {
    return parseFloat(duration);
  }

  if (duration.endsWith('s')) {
    return parseFloat(duration) * 1000;
  }

  return 0;
}

/** 预加载资源 */
export function preloadResources(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        if (url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        } else {
          fetch(url)
            .then(() => resolve())
            .catch(reject);
        }
      });
    })
  );
}

/** 格式化大小显示 */
export function formatSize(size: number): string {
  if (size < 100) {
    return `${size}px`;
  }

  if (size < 1000) {
    return `${size}px`;
  }

  return `${(size / 1000).toFixed(1)}rem`;
}