/**
 * @fileoverview Drawer anchor positioning utilities
 * @module drawer.anchor
 */

import { DrawerPlacement, AnchorConfig, AnchorAlign } from './drawer.types';

/** 锚点定位结果 */
export interface AnchorPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  placement: DrawerPlacement;
  maskBounds?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/** 元素边界信息 */
interface ElementBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * 获取元素边界信息
 */
function getElementBounds(element: HTMLElement): ElementBounds {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2 + window.scrollX,
    centerY: rect.top + rect.height / 2 + window.scrollY
  };
}

/**
 * 获取视口边界
 */
function getViewportBounds(): ElementBounds {
  return {
    top: window.scrollY,
    left: window.scrollX,
    right: window.innerWidth + window.scrollX,
    bottom: window.innerHeight + window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    centerX: window.innerWidth / 2 + window.scrollX,
    centerY: window.innerHeight / 2 + window.scrollY
  };
}

/**
 * 获取滚动容器边界
 */
function getScrollParentBounds(element: HTMLElement): ElementBounds {
  let parent: HTMLElement | null = element.parentElement;
  
  while (parent) {
    const overflow = window.getComputedStyle(parent).overflow;
    if (overflow === 'auto' || overflow === 'scroll') {
      return getElementBounds(parent);
    }
    parent = parent.parentElement;
  }
  
  return getViewportBounds();
}

/**
 * 获取边界限制范围
 */
function getBoundaryBounds(
  boundary: HTMLElement | string | 'viewport' | 'scrollParent',
  anchorElement: HTMLElement
): ElementBounds {
  if (boundary === 'viewport') {
    return getViewportBounds();
  }
  
  if (boundary === 'scrollParent') {
    return getScrollParentBounds(anchorElement);
  }
  
  const boundaryElement = typeof boundary === 'string'
    ? document.querySelector(boundary) as HTMLElement
    : boundary;
  
  if (boundaryElement) {
    return getElementBounds(boundaryElement);
  }
  
  return getViewportBounds();
}

/**
 * 计算锚点定位的抽屉位置
 */
export function calculateAnchorPosition(
  anchorElement: HTMLElement,
  drawerSize: { width: number; height: number },
  config: AnchorConfig
): AnchorPosition {
  const anchorBounds = getElementBounds(anchorElement);
  const boundaryBounds = getBoundaryBounds(
    config.boundary || 'viewport',
    anchorElement
  );
  
  const placement = config.placement || 'bottom';
  const align = config.align || 'start';
  const offset = config.offset || { x: 0, y: 0 };
  
  let position: AnchorPosition = {
    top: 0,
    left: 0,
    width: drawerSize.width,
    height: drawerSize.height,
    placement
  };
  
  // 根据placement计算基础位置
  switch (placement) {
    case 'top':
      position.top = anchorBounds.top - drawerSize.height + (offset.y || 0);
      position.left = calculateHorizontalAlign(
        anchorBounds,
        drawerSize.width,
        align
      ) + (offset.x || 0);
      
      // 设置遮罩范围（上方区域）
      if (config.maskPartial) {
        position.maskBounds = {
          top: boundaryBounds.top,
          left: boundaryBounds.left,
          width: boundaryBounds.width,
          height: anchorBounds.top - boundaryBounds.top
        };
      }
      break;
      
    case 'bottom':
      position.top = anchorBounds.bottom + (offset.y || 0);
      position.left = calculateHorizontalAlign(
        anchorBounds,
        drawerSize.width,
        align
      ) + (offset.x || 0);
      
      // 设置遮罩范围（下方区域）
      if (config.maskPartial) {
        position.maskBounds = {
          top: anchorBounds.bottom,
          left: boundaryBounds.left,
          width: boundaryBounds.width,
          height: boundaryBounds.bottom - anchorBounds.bottom
        };
      }
      break;
      
    case 'left':
      position.left = anchorBounds.left - drawerSize.width + (offset.x || 0);
      position.top = calculateVerticalAlign(
        anchorBounds,
        drawerSize.height,
        align
      ) + (offset.y || 0);
      
      // 设置遮罩范围（左侧区域）
      if (config.maskPartial) {
        position.maskBounds = {
          top: boundaryBounds.top,
          left: boundaryBounds.left,
          width: anchorBounds.left - boundaryBounds.left,
          height: boundaryBounds.height
        };
      }
      break;
      
    case 'right':
      position.left = anchorBounds.right + (offset.x || 0);
      position.top = calculateVerticalAlign(
        anchorBounds,
        drawerSize.height,
        align
      ) + (offset.y || 0);
      
      // 设置遮罩范围（右侧区域）
      if (config.maskPartial) {
        position.maskBounds = {
          top: boundaryBounds.top,
          left: anchorBounds.right,
          width: boundaryBounds.right - anchorBounds.right,
          height: boundaryBounds.height
        };
      }
      break;
  }
  
  // 自动翻转位置（如果启用）
  if (config.flip) {
    position = tryFlipPosition(
      position,
      anchorBounds,
      boundaryBounds,
      drawerSize,
      config
    );
  }
  
  // 约束在边界内（如果启用）
  if (config.constrain) {
    position = constrainPosition(position, boundaryBounds);
  }
  
  return position;
}

/**
 * 计算水平对齐位置
 */
function calculateHorizontalAlign(
  anchorBounds: ElementBounds,
  drawerWidth: number,
  align: AnchorAlign
): number {
  switch (align) {
    case 'start':
      return anchorBounds.left;
    case 'center':
      return anchorBounds.centerX - drawerWidth / 2;
    case 'end':
      return anchorBounds.right - drawerWidth;
    case 'auto':
    default:
      // 自动对齐：优先居中，如果空间不够则调整
      const center = anchorBounds.centerX - drawerWidth / 2;
      if (center < 0) {
        return anchorBounds.left;
      }
      if (center + drawerWidth > window.innerWidth) {
        return anchorBounds.right - drawerWidth;
      }
      return center;
  }
}

/**
 * 计算垂直对齐位置
 */
function calculateVerticalAlign(
  anchorBounds: ElementBounds,
  drawerHeight: number,
  align: AnchorAlign
): number {
  switch (align) {
    case 'start':
      return anchorBounds.top;
    case 'center':
      return anchorBounds.centerY - drawerHeight / 2;
    case 'end':
      return anchorBounds.bottom - drawerHeight;
    case 'auto':
    default:
      // 自动对齐：优先居中，如果空间不够则调整
      const center = anchorBounds.centerY - drawerHeight / 2;
      if (center < 0) {
        return anchorBounds.top;
      }
      if (center + drawerHeight > window.innerHeight) {
        return anchorBounds.bottom - drawerHeight;
      }
      return center;
  }
}

/**
 * 尝试翻转位置
 */
function tryFlipPosition(
  position: AnchorPosition,
  anchorBounds: ElementBounds,
  boundaryBounds: ElementBounds,
  drawerSize: { width: number; height: number },
  config: AnchorConfig
): AnchorPosition {
  const { placement } = position;
  let shouldFlip = false;
  let flippedPlacement: DrawerPlacement = placement;
  
  // 检查是否需要翻转
  switch (placement) {
    case 'top':
      if (position.top < boundaryBounds.top) {
        shouldFlip = true;
        flippedPlacement = 'bottom';
      }
      break;
    case 'bottom':
      if (position.top + drawerSize.height > boundaryBounds.bottom) {
        shouldFlip = true;
        flippedPlacement = 'top';
      }
      break;
    case 'left':
      if (position.left < boundaryBounds.left) {
        shouldFlip = true;
        flippedPlacement = 'right';
      }
      break;
    case 'right':
      if (position.left + drawerSize.width > boundaryBounds.right) {
        shouldFlip = true;
        flippedPlacement = 'left';
      }
      break;
  }
  
  // 如果需要翻转，重新计算位置
  if (shouldFlip) {
    const flippedConfig = { ...config, placement: flippedPlacement, flip: false };
    return calculateAnchorPosition(
      document.querySelector(`[data-anchor-id="${anchorBounds.centerX}-${anchorBounds.centerY}"]`) as HTMLElement || anchorBounds as any,
      drawerSize,
      flippedConfig
    );
  }
  
  return position;
}

/**
 * 约束位置在边界内
 */
function constrainPosition(
  position: AnchorPosition,
  boundaryBounds: ElementBounds
): AnchorPosition {
  const constrained = { ...position };
  
  // 约束水平位置
  if (constrained.left < boundaryBounds.left) {
    constrained.left = boundaryBounds.left;
  } else if (constrained.left + constrained.width > boundaryBounds.right) {
    constrained.left = boundaryBounds.right - constrained.width;
  }
  
  // 约束垂直位置
  if (constrained.top < boundaryBounds.top) {
    constrained.top = boundaryBounds.top;
  } else if (constrained.top + constrained.height > boundaryBounds.bottom) {
    constrained.top = boundaryBounds.bottom - constrained.height;
  }
  
  return constrained;
}

/**
 * 监听锚点元素位置变化
 */
export function observeAnchorPosition(
  anchorElement: HTMLElement,
  callback: () => void,
  config: AnchorConfig
): () => void {
  const observers: Array<() => void> = [];
  
  // 监听滚动事件
  if (config.followScroll) {
    const scrollHandler = throttle(callback, 16);
    window.addEventListener('scroll', scrollHandler, true);
    observers.push(() => window.removeEventListener('scroll', scrollHandler, true));
  }
  
  // 监听窗口大小变化
  if (config.autoUpdate) {
    const resizeHandler = throttle(callback, 100);
    window.addEventListener('resize', resizeHandler);
    observers.push(() => window.removeEventListener('resize', resizeHandler));
  }
  
  // 使用IntersectionObserver监听元素可见性
  if ('IntersectionObserver' in window && config.autoUpdate) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: [0, 1] }
    );
    observer.observe(anchorElement);
    observers.push(() => observer.disconnect());
  }
  
  // 使用ResizeObserver监听元素大小变化
  if ('ResizeObserver' in window && config.autoUpdate) {
    const observer = new ResizeObserver(throttle(callback, 100));
    observer.observe(anchorElement);
    observers.push(() => observer.disconnect());
  }
  
  // 返回清理函数
  return () => {
    observers.forEach(cleanup => cleanup());
  };
}

/**
 * 创建部分遮罩元素
 */
export function createPartialMask(
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  },
  className: string = 'drawer-partial-mask'
): HTMLElement {
  const mask = document.createElement('div');
  mask.className = className;
  mask.style.cssText = `
    position: fixed;
    top: ${bounds.top}px;
    left: ${bounds.left}px;
    width: ${bounds.width}px;
    height: ${bounds.height}px;
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    z-index: 999;
  `;
  return mask;
}

/**
 * 节流函数
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;
  
  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

/**
 * 获取鼠标点击位置作为锚点
 */
export function getClickPosition(event: MouseEvent): AnchorPosition {
  return {
    top: event.clientY + window.scrollY,
    left: event.clientX + window.scrollX,
    width: 0,
    height: 0,
    placement: 'bottom'
  };
}

/**
 * 根据锚点配置创建虚拟锚点元素
 */
export function createVirtualAnchor(
  x: number,
  y: number
): HTMLElement {
  const anchor = document.createElement('div');
  anchor.style.position = 'absolute';
  anchor.style.top = `${y}px`;
  anchor.style.left = `${x}px`;
  anchor.style.width = '1px';
  anchor.style.height = '1px';
  anchor.style.visibility = 'hidden';
  anchor.style.pointerEvents = 'none';
  anchor.setAttribute('data-virtual-anchor', 'true');
  document.body.appendChild(anchor);
  return anchor;
}

/**
 * 清理虚拟锚点
 */
export function cleanupVirtualAnchor(anchor: HTMLElement): void {
  if (anchor && anchor.getAttribute('data-virtual-anchor') === 'true') {
    anchor.remove();
  }
}