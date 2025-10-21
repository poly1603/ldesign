/**
 * 响应式调整观察器 - Intersection Observer、智能防抖、断点支持
 */

import { debounce, throttle } from './helpers';

/**
 * 响应式断点
 */
export interface Breakpoint {
  name: string;
  minWidth?: number;
  maxWidth?: number;
  config?: any;
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  debounce?: number;
  throttle?: number;
  breakpoints?: Breakpoint[];
  enableVisibilityDetection?: boolean;
}

/**
 * 图表响应式管理器（增强版）
 */
export class ChartResizeObserver {
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private callback: () => void;
  private originalCallback: () => void;
  private debounceDelay: number;
  private throttleDelay?: number;
  private breakpoints: Breakpoint[] = [];
  private currentBreakpoint?: Breakpoint;
  private isVisible = true;
  private enableVisibilityDetection: boolean;

  constructor(callback: () => void, config: number | ResponsiveConfig = 100) {
    this.originalCallback = callback;

    if (typeof config === 'number') {
      this.debounceDelay = config;
      this.enableVisibilityDetection = false;
      this.callback = debounce(callback, config);
    } else {
      this.debounceDelay = config.debounce ?? 100;
      this.throttleDelay = config.throttle;
      this.breakpoints = config.breakpoints ?? [];
      this.enableVisibilityDetection = config.enableVisibilityDetection ?? true;

      // 智能防抖/节流策略
      if (this.throttleDelay) {
        this.callback = throttle(debounce(callback, this.debounceDelay), this.throttleDelay);
      } else {
        this.callback = debounce(callback, this.debounceDelay);
      }
    }
  }

  /**
   * 观察元素（增强版）
   */
  observe(element: HTMLElement): void {
    if (!element) return;

    this.disconnect();

    // ResizeObserver
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          // 检查断点变化
          this.checkBreakpoint(entry.contentRect.width);

          // 只在可见时触发回调
          if (!this.enableVisibilityDetection || this.isVisible) {
            this.callback();
          }
        }
      }
    });

    this.resizeObserver.observe(element);

    // IntersectionObserver（可见性检测）
    if (this.enableVisibilityDetection) {
      this.setupVisibilityObserver(element);
    }
  }

  /**
   * 设置可见性观察器
   */
  private setupVisibilityObserver(element: HTMLElement): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === element) {
            const wasVisible = this.isVisible;
            this.isVisible = entry.isIntersecting;

            // 从不可见变为可见时，触发一次更新
            if (!wasVisible && this.isVisible) {
              this.originalCallback();
            }
          }
        }
      },
      {
        threshold: 0.1, // 至少 10% 可见
        rootMargin: '50px', // 提前 50px 触发
      }
    );

    this.intersectionObserver.observe(element);
  }

  /**
   * 检查断点变化
   */
  private checkBreakpoint(width: number): void {
    if (this.breakpoints.length === 0) return;

    const matchedBreakpoint = this.breakpoints.find(bp => {
      const minMatch = bp.minWidth === undefined || width >= bp.minWidth;
      const maxMatch = bp.maxWidth === undefined || width <= bp.maxWidth;
      return minMatch && maxMatch;
    });

    // 断点变化时触发额外回调
    if (matchedBreakpoint && matchedBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = matchedBreakpoint;
      // 可以触发断点变化事件
    }
  }

  /**
   * 停止观察
   */
  disconnect(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  /**
   * 更新防抖延迟
   */
  updateDebounce(delay: number): void {
    this.debounceDelay = delay;
    this.callback = debounce(this.originalCallback, delay);
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): Breakpoint | undefined {
    return this.currentBreakpoint;
  }

  /**
   * 检查是否可见
   */
  getVisibility(): boolean {
    return this.isVisible;
  }

  /**
   * 手动触发回调
   */
  trigger(): void {
    this.originalCallback();
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

