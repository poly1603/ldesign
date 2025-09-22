/**
 * 无障碍访问工具
 * 提供键盘导航、屏幕阅读器支持等功能
 */

/**
 * 键盘导航管理器
 */
export class KeyboardNavigationManager {
  private container: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;
  private enabled = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  /**
   * 初始化键盘导航
   */
  private init(): void {
    this.updateFocusableElements();
    this.bindEvents();
  }

  /**
   * 更新可聚焦元素列表
   */
  updateFocusableElements(): void {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="slider"]:not([disabled])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  /**
   * 绑定键盘事件
   */
  private bindEvents(): void {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.container.addEventListener('focusin', this.handleFocusIn.bind(this));
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'Escape':
        this.handleEscape(event);
        break;
    }
  }

  /**
   * 处理 Tab 导航
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const direction = event.shiftKey ? -1 : 1;
    let nextIndex = this.currentIndex + direction;

    if (nextIndex < 0) {
      nextIndex = this.focusableElements.length - 1;
    } else if (nextIndex >= this.focusableElements.length) {
      nextIndex = 0;
    }

    this.focusElement(nextIndex);
    event.preventDefault();
  }

  /**
   * 处理方向键导航
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const currentElement = this.focusableElements[this.currentIndex];
    if (!currentElement) return;

    // 根据元素类型和布局决定导航行为
    const role = currentElement.getAttribute('role');
    
    if (role === 'slider') {
      this.handleSliderNavigation(event, currentElement);
    } else {
      // 默认方向键导航
      const direction = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
      const nextIndex = Math.max(0, Math.min(this.focusableElements.length - 1, this.currentIndex + direction));
      this.focusElement(nextIndex);
    }

    event.preventDefault();
  }

  /**
   * 处理滑块导航
   */
  private handleSliderNavigation(event: KeyboardEvent, element: HTMLElement): void {
    const step = event.shiftKey ? 10 : 1;
    const direction = ['ArrowUp', 'ArrowRight'].includes(event.key) ? 1 : -1;
    
    // 触发自定义事件
    const customEvent = new CustomEvent('slider:navigate', {
      detail: { direction, step }
    });
    element.dispatchEvent(customEvent);
  }

  /**
   * 处理激活事件
   */
  private handleActivation(event: KeyboardEvent): void {
    const currentElement = this.focusableElements[this.currentIndex];
    if (currentElement) {
      currentElement.click();
      event.preventDefault();
    }
  }

  /**
   * 处理 Escape 键
   */
  private handleEscape(event: KeyboardEvent): void {
    // 关闭菜单或对话框
    const openMenu = this.container.querySelector('[aria-expanded="true"]');
    if (openMenu) {
      openMenu.setAttribute('aria-expanded', 'false');
      openMenu.focus();
      event.preventDefault();
    }
  }

  /**
   * 处理焦点进入事件
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    const index = this.focusableElements.indexOf(target);
    if (index !== -1) {
      this.currentIndex = index;
    }
  }

  /**
   * 聚焦指定元素
   */
  focusElement(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentIndex = index;
      this.focusableElements[index].focus();
    }
  }

  /**
   * 启用/禁用键盘导航
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * 屏幕阅读器支持
 */
export class ScreenReaderSupport {
  private announcer: HTMLElement;

  constructor() {
    this.createAnnouncer();
  }

  /**
   * 创建屏幕阅读器公告元素
   */
  private createAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';
    
    document.body.appendChild(this.announcer);
  }

  /**
   * 公告消息
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // 清除消息以便下次公告
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  /**
   * 公告播放状态
   */
  announcePlayState(isPlaying: boolean): void {
    const message = isPlaying ? 'Video playing' : 'Video paused';
    this.announce(message);
  }

  /**
   * 公告时间更新
   */
  announceTimeUpdate(currentTime: number, duration: number): void {
    const current = this.formatTime(currentTime);
    const total = this.formatTime(duration);
    const message = `${current} of ${total}`;
    this.announce(message, 'polite');
  }

  /**
   * 公告音量变化
   */
  announceVolumeChange(volume: number, muted: boolean): void {
    if (muted) {
      this.announce('Muted');
    } else {
      this.announce(`Volume ${Math.round(volume * 100)}%`);
    }
  }

  /**
   * 公告全屏状态
   */
  announceFullscreenChange(isFullscreen: boolean): void {
    const message = isFullscreen ? 'Entered fullscreen' : 'Exited fullscreen';
    this.announce(message);
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
}

/**
 * 高对比度模式检测
 */
export class HighContrastDetector {
  private mediaQuery: MediaQueryList;
  private callbacks: Array<(isHighContrast: boolean) => void> = [];

  constructor() {
    // 检测高对比度模式
    this.mediaQuery = window.matchMedia('(prefers-contrast: high)');
    this.mediaQuery.addEventListener('change', this.handleChange.bind(this));
  }

  /**
   * 检查是否启用高对比度模式
   */
  isHighContrast(): boolean {
    return this.mediaQuery.matches;
  }

  /**
   * 监听高对比度模式变化
   */
  onChange(callback: (isHighContrast: boolean) => void): void {
    this.callbacks.push(callback);
  }

  private handleChange(): void {
    const isHighContrast = this.isHighContrast();
    this.callbacks.forEach(callback => callback(isHighContrast));
  }
}

/**
 * 减少动画偏好检测
 */
export class ReducedMotionDetector {
  private mediaQuery: MediaQueryList;
  private callbacks: Array<(prefersReducedMotion: boolean) => void> = [];

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.mediaQuery.addEventListener('change', this.handleChange.bind(this));
  }

  /**
   * 检查是否偏好减少动画
   */
  prefersReducedMotion(): boolean {
    return this.mediaQuery.matches;
  }

  /**
   * 监听减少动画偏好变化
   */
  onChange(callback: (prefersReducedMotion: boolean) => void): void {
    this.callbacks.push(callback);
  }

  private handleChange(): void {
    const prefersReducedMotion = this.prefersReducedMotion();
    this.callbacks.forEach(callback => callback(prefersReducedMotion));
  }
}

/**
 * 焦点管理器
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];

  /**
   * 保存当前焦点
   */
  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement);
    }
  }

  /**
   * 恢复焦点
   */
  restoreFocus(): void {
    const element = this.focusStack.pop();
    if (element && element.focus) {
      element.focus();
    }
  }

  /**
   * 设置焦点陷阱
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * 全局无障碍访问实例
 */
export const screenReaderSupport = new ScreenReaderSupport();
export const highContrastDetector = new HighContrastDetector();
export const reducedMotionDetector = new ReducedMotionDetector();
export const focusManager = new FocusManager();
