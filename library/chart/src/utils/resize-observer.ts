/**
 * 响应式调整观察器
 */

import { debounce } from './helpers';

/**
 * 图表响应式管理器
 */
export class ChartResizeObserver {
  private observer: ResizeObserver | null = null;
  private callback: () => void;
  private debounceDelay: number;

  constructor(callback: () => void, debounceDelay = 100) {
    this.callback = debounce(callback, debounceDelay);
    this.debounceDelay = debounceDelay;
  }

  /**
   * 观察元素
   */
  observe(element: HTMLElement): void {
    if (!element) return;

    this.disconnect();

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          this.callback();
        }
      }
    });

    this.observer.observe(element);
  }

  /**
   * 停止观察
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 更新防抖延迟
   */
  updateDebounce(delay: number): void {
    this.debounceDelay = delay;
    this.callback = debounce(this.callback, delay);
  }
}

/**
 * 获取元素尺寸
 */
export function getElementSize(element: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 判断元素是否可见
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

