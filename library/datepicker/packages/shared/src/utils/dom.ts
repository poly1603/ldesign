/**
 * DOM 工具函数
 */

/**
 * 判断是否在浏览器环境
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * 获取滚动条宽度
 */
export function getScrollbarWidth(): number {
  if (!isBrowser) return 0;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);
  
  return scrollbarWidth;
}

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 点击外部
 */
export function onClickOutside(
  element: HTMLElement,
  callback: () => void
): () => void {
  if (!isBrowser) return () => {};
  
  const listener = (event: MouseEvent) => {
    if (!element.contains(event.target as Node)) {
      callback();
    }
  };
  
  document.addEventListener('click', listener, true);
  
  return () => {
    document.removeEventListener('click', listener, true);
  };
}

/**
 * 获取元素位置
 */
export function getElementPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}





