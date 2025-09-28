import { RippleOptions, RippleInstance, RippleAttributes } from './types';

/**
 * LRipple Web Component
 * 高性能水波纹效果组件
 */
export class LRipple extends HTMLElement {
  private container: HTMLElement | null = null;
  private ripples: RippleInstance[] = [];
  private options: Required<RippleOptions>;
  private isTouch = false;
  private animationFrame: number | null = null;
  private observer: MutationObserver | null = null;

  // 默认配置
  private static readonly DEFAULT_OPTIONS: Required<RippleOptions> = {
    color: 'currentColor',
    opacity: 0.24,
    duration: 600,
    fadeOutDuration: 300,
    radius: 'auto',
    centered: false,
    disabled: false,
    trigger: 'pointerdown',
    touchEnabled: true,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    maxRipples: 10,
    unbounded: false
  };

  // 可观察的属性
  static get observedAttributes(): string[] {
    return [
      'ripple-color',
      'ripple-opacity',
      'ripple-duration',
      'ripple-fade-out-duration',
      'ripple-radius',
      'ripple-centered',
      'ripple-disabled',
      'ripple-trigger',
      'ripple-touch-enabled',
      'ripple-easing',
      'ripple-max-ripples',
      'ripple-unbounded'
    ];
  }

  constructor() {
    super();
    this.options = { ...LRipple.DEFAULT_OPTIONS };
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
  }

  connectedCallback(): void {
    this.setup();
    this.attachEventListeners();
    this.observeParentChanges();
  }

  disconnectedCallback(): void {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    
    const option = this.attributeToOption(name);
    if (option) {
      this.updateOption(option, newValue);
    }
  }

  /**
   * 初始化设置
   */
  private setup(): void {
    // 添加样式
    if (!document.querySelector('#l-ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'l-ripple-styles';
      style.textContent = this.getStyles();
      document.head.appendChild(style);
    }

    // 设置父元素
    const parent = this.parentElement;
    if (parent) {
      parent.classList.add('l-ripple-target');
      
      // 创建容器
      this.container = document.createElement('div');
      this.container.className = 'l-ripple';
      
      if (this.options.unbounded) {
        this.container.classList.add('l-ripple--unbounded');
      }
      
      this.appendChild(this.container);
    }

    // 从属性初始化选项
    this.initializeFromAttributes();
  }

  /**
   * 从HTML属性初始化选项
   */
  private initializeFromAttributes(): void {
    const attributes = this.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const option = this.attributeToOption(attr.name);
      if (option) {
        this.updateOption(option, attr.value);
      }
    }
  }

  /**
   * 将属性名转换为选项名
   */
  private attributeToOption(attrName: string): keyof RippleOptions | null {
    const map: Record<string, keyof RippleOptions> = {
      'ripple-color': 'color',
      'ripple-opacity': 'opacity',
      'ripple-duration': 'duration',
      'ripple-fade-out-duration': 'fadeOutDuration',
      'ripple-radius': 'radius',
      'ripple-centered': 'centered',
      'ripple-disabled': 'disabled',
      'ripple-trigger': 'trigger',
      'ripple-touch-enabled': 'touchEnabled',
      'ripple-easing': 'easing',
      'ripple-max-ripples': 'maxRipples',
      'ripple-unbounded': 'unbounded'
    };
    return map[attrName] || null;
  }

  /**
   * 更新选项值
   */
  private updateOption(option: keyof RippleOptions, value: string | null): void {
    if (value === null) return;

    switch (option) {
      case 'opacity':
      case 'duration':
      case 'fadeOutDuration':
      case 'maxRipples':
        this.options[option] = parseFloat(value) || LRipple.DEFAULT_OPTIONS[option];
        break;
      case 'radius':
        this.options.radius = value === 'auto' ? 'auto' : parseFloat(value);
        break;
      case 'centered':
      case 'disabled':
      case 'touchEnabled':
      case 'unbounded':
        this.options[option] = value === 'true';
        break;
      case 'trigger':
        if (['click', 'mousedown', 'pointerdown'].includes(value)) {
          this.options.trigger = value as 'click' | 'mousedown' | 'pointerdown';
        }
        break;
      default:
        (this.options as any)[option] = value;
    }

    // 更新容器类
    if (option === 'unbounded' && this.container) {
      this.container.classList.toggle('l-ripple--unbounded', this.options.unbounded);
    }
  }

  /**
   * 添加事件监听器
   */
  private attachEventListeners(): void {
    const parent = this.parentElement;
    if (!parent) return;

    // 根据触发方式添加事件
    const trigger = this.options.trigger;
    if (trigger === 'click') {
      parent.addEventListener('click', this.handlePointerDown);
    } else if (trigger === 'mousedown') {
      parent.addEventListener('mousedown', this.handlePointerDown);
      parent.addEventListener('mouseup', this.handlePointerUp);
      parent.addEventListener('mouseleave', this.handlePointerLeave);
    } else {
      parent.addEventListener('pointerdown', this.handlePointerDown);
      parent.addEventListener('pointerup', this.handlePointerUp);
      parent.addEventListener('pointercancel', this.handlePointerUp);
      parent.addEventListener('pointerleave', this.handlePointerLeave);
    }

    // 触摸设备优化
    if ('ontouchstart' in window && this.options.touchEnabled) {
      parent.addEventListener('touchstart', () => { this.isTouch = true; }, { passive: true });
    }
  }

  /**
   * 处理指针按下事件
   */
  private handlePointerDown(event: Event): void {
    if (this.options.disabled) return;

    const e = event as PointerEvent | MouseEvent | TouchEvent;
    
    // 触摸设备上忽略鼠标事件
    if (this.isTouch && e.type === 'mousedown') return;

    // 限制波纹数量
    if (this.ripples.length >= this.options.maxRipples) {
      this.removeOldestRipple();
    }

    const rect = this.container?.getBoundingClientRect();
    if (!rect || !this.container) return;

    let x: number, y: number;

    if (this.options.centered) {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      x = clientX - rect.left;
      y = clientY - rect.top;
    }

    this.createRipple(x, y);

    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('rippleStart', { detail: { x, y } }));
  }

  /**
   * 创建波纹效果
   */
  private createRipple(x: number, y: number): void {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const size = this.calculateRippleSize(rect, x, y);
    
    const rippleElement = document.createElement('div');
    rippleElement.className = 'l-ripple__element';
    
    // 设置样式变量
    rippleElement.style.width = `${size}px`;
    rippleElement.style.height = `${size}px`;
    rippleElement.style.left = `${x - size / 2}px`;
    rippleElement.style.top = `${y - size / 2}px`;
    
    // CSS变量用于动画
    rippleElement.style.setProperty('--ripple-x', `${x - size / 2}px`);
    rippleElement.style.setProperty('--ripple-y', `${y - size / 2}px`);
    rippleElement.style.setProperty('--ripple-opacity', String(this.options.opacity));
    rippleElement.style.setProperty('--ripple-duration', `${this.options.duration}ms`);
    rippleElement.style.setProperty('--ripple-fade-duration', `${this.options.fadeOutDuration}ms`);
    rippleElement.style.setProperty('--ripple-easing', this.options.easing);
    
    // 设置颜色
    if (this.options.color !== 'currentColor') {
      rippleElement.style.backgroundColor = this.options.color;
    }
    
    this.container.appendChild(rippleElement);
    
    // 强制重排以触发动画
    rippleElement.offsetHeight;
    
    // 添加动画类
    rippleElement.classList.add('l-ripple__element--expanding');
    
    // 创建波纹实例
    const rippleInstance: RippleInstance = {
      element: rippleElement,
      startTime: Date.now(),
      x,
      y,
      size,
      isRemoving: false
    };
    
    this.ripples.push(rippleInstance);
    
    // 如果是点击触发，自动移除
    if (this.options.trigger === 'click') {
      setTimeout(() => {
        this.fadeOutRipple(rippleInstance);
      }, this.options.duration);
    }
  }

  /**
   * 计算波纹大小
   */
  private calculateRippleSize(rect: DOMRect, x: number, y: number): number {
    if (this.options.radius !== 'auto') {
      return this.options.radius * 2;
    }

    // 计算到四个角的最大距离
    const distanceToCorners = [
      Math.sqrt(x ** 2 + y ** 2),
      Math.sqrt((rect.width - x) ** 2 + y ** 2),
      Math.sqrt(x ** 2 + (rect.height - y) ** 2),
      Math.sqrt((rect.width - x) ** 2 + (rect.height - y) ** 2)
    ];

    return Math.max(...distanceToCorners) * 2;
  }

  /**
   * 处理指针抬起事件
   */
  private handlePointerUp(): void {
    this.fadeOutAllRipples();
  }

  /**
   * 处理指针离开事件
   */
  private handlePointerLeave(): void {
    this.fadeOutAllRipples();
  }

  /**
   * 淡出所有波纹
   */
  private fadeOutAllRipples(): void {
    this.ripples.forEach(ripple => {
      if (!ripple.isRemoving) {
        const elapsed = Date.now() - ripple.startTime;
        const delay = Math.max(0, this.options.duration - elapsed);
        
        setTimeout(() => {
          this.fadeOutRipple(ripple);
        }, delay);
      }
    });
  }

  /**
   * 淡出单个波纹
   */
  private fadeOutRipple(ripple: RippleInstance): void {
    if (ripple.isRemoving) return;
    
    ripple.isRemoving = true;
    ripple.element.classList.remove('l-ripple__element--expanding');
    ripple.element.classList.add('l-ripple__element--fading-out');
    
    setTimeout(() => {
      this.removeRipple(ripple);
    }, this.options.fadeOutDuration);

    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('rippleEnd'));
  }

  /**
   * 移除波纹
   */
  private removeRipple(ripple: RippleInstance): void {
    const index = this.ripples.indexOf(ripple);
    if (index > -1) {
      this.ripples.splice(index, 1);
      ripple.element.remove();
    }
  }

  /**
   * 移除最旧的波纹
   */
  private removeOldestRipple(): void {
    if (this.ripples.length > 0) {
      const oldest = this.ripples[0];
      this.fadeOutRipple(oldest);
    }
  }

  /**
   * 观察父元素变化
   */
  private observeParentChanges(): void {
    const parent = this.parentElement;
    if (!parent) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          this.options.disabled = parent.hasAttribute('disabled');
        }
      });
    });

    this.observer.observe(parent, { attributes: true, attributeFilter: ['disabled'] });
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    const parent = this.parentElement;
    if (parent) {
      parent.classList.remove('l-ripple-target');
      parent.removeEventListener('click', this.handlePointerDown);
      parent.removeEventListener('mousedown', this.handlePointerDown);
      parent.removeEventListener('mouseup', this.handlePointerUp);
      parent.removeEventListener('mouseleave', this.handlePointerLeave);
      parent.removeEventListener('pointerdown', this.handlePointerDown);
      parent.removeEventListener('pointerup', this.handlePointerUp);
      parent.removeEventListener('pointercancel', this.handlePointerUp);
      parent.removeEventListener('pointerleave', this.handlePointerLeave);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.ripples.forEach(ripple => ripple.element.remove());
    this.ripples = [];

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  /**
   * 获取内联样式
   */
  private getStyles(): string {
    return `
      /* Ripple容器样式 */
      .l-ripple {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        border-radius: inherit;
        z-index: 0;
      }

      /* 无边界模式 */
      .l-ripple--unbounded {
        overflow: visible;
      }

      /* 波纹元素样式 */
      .l-ripple__element {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        will-change: transform, opacity;
        background: currentColor;
        transform: translate3d(0, 0, 0) scale(0);
      }

      /* 波纹展开动画 */
      @keyframes ripple-expand {
        from {
          transform: translate3d(var(--ripple-x), var(--ripple-y), 0) scale(0);
          opacity: var(--ripple-opacity, 0.24);
        }
        to {
          transform: translate3d(var(--ripple-x), var(--ripple-y), 0) scale(1);
          opacity: var(--ripple-opacity, 0.24);
        }
      }

      /* 波纹消失动画 */
      @keyframes ripple-fade-out {
        from {
          opacity: var(--ripple-opacity, 0.24);
        }
        to {
          opacity: 0;
        }
      }

      /* 波纹动画类 */
      .l-ripple__element--expanding {
        animation: ripple-expand var(--ripple-duration, 600ms) var(--ripple-easing, cubic-bezier(0.4, 0, 0.2, 1)) forwards;
      }

      .l-ripple__element--fading-out {
        animation: ripple-fade-out var(--ripple-fade-duration, 300ms) ease-out forwards;
      }

      /* 高性能模式 - 使用GPU加速 */
      .l-ripple--performance {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      .l-ripple--performance .l-ripple__element {
        transform-origin: center;
        contain: layout style paint;
      }

      /* 父元素样式 */
      .l-ripple-target {
        position: relative;
        overflow: hidden;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
      }

      /* 禁用状态 */
      .l-ripple-target[disabled],
      .l-ripple-target.l-ripple--disabled {
        cursor: not-allowed;
        pointer-events: none;
      }

      /* 确保z-index正确层叠 */
      .l-ripple-target > * {
        position: relative;
        z-index: 1;
      }

      /* 响应式优化 */
      @media (hover: none) {
        .l-ripple--touch-optimized .l-ripple__element {
          transition-duration: 300ms;
        }
      }

      /* 减少动画模式 */
      @media (prefers-reduced-motion: reduce) {
        .l-ripple__element {
          animation-duration: 1ms !important;
          transition-duration: 1ms !important;
        }
      }
    `;
  }

  /**
   * 公开API：手动触发波纹
   */
  public trigger(x?: number, y?: number): void {
    if (this.options.disabled || !this.container) return;

    const rect = this.container.getBoundingClientRect();
    const centerX = x ?? rect.width / 2;
    const centerY = y ?? rect.height / 2;

    this.createRipple(centerX, centerY);
    
    setTimeout(() => {
      this.fadeOutAllRipples();
    }, 100);
  }

  /**
   * 公开API：更新配置
   */
  public updateOptions(options: Partial<RippleOptions>): void {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        this.updateOption(key as keyof RippleOptions, String(value));
      }
    });
  }

  /**
   * 公开API：启用波纹
   */
  public enable(): void {
    this.options.disabled = false;
    this.removeAttribute('ripple-disabled');
  }

  /**
   * 公开API：禁用波纹
   */
  public disable(): void {
    this.options.disabled = true;
    this.setAttribute('ripple-disabled', 'true');
  }

  /**
   * 公开API：销毁组件
   */
  public destroy(): void {
    this.cleanup();
    this.remove();
  }
}

// 注册自定义元素
if (!customElements.get('l-ripple')) {
  customElements.define('l-ripple', LRipple);
}