import { Component, Prop, h, Host, Element, State, Watch } from '@stencil/core';

/**
 * BackTop 返回顶部组件
 * - 支持窗口根滚动回到顶部
 * - 支持指定容器内部滚动回到顶部（通过 target 选择器）
 * - 支持设置滚动动画速度（px/s）
 */
@Component({
  tag: 'ldesign-backtop',
  styleUrl: 'backtop.less',
  shadow: false,
})
export class LdesignBacktop {
  @Element() el!: HTMLElement;

  /**
   * 指定滚动容器（CSS 选择器）。不传则使用 window
   * 例如：'#scrollable' 或 '.scroll-area'
   */
  @Prop() target?: string;

  /**
   *滚动动画速度（像素/秒）。值越大，速度越快。
   * 最终动画时长 = 当前滚动距离 / speed
   * 当 speed <= 0 时，将立即跳到顶部
   * @default 1200
   */
  @Prop() speed: number = 1200;

  /**
   * 出现的滚动阈值（px）。当滚动距离超过该值时显示返回顶部按钮
   * @default 200
   */
  @Prop() visibilityHeight: number = 200;

  /** 是否可见（根据滚动距离控制） */
  @State() visible: boolean = false;

  /** 内联定位样式（用于 target 容器时固定在容器内部） */
  @State() positionStyle: any = {};

  private scrollContainer: HTMLElement | Window = typeof window !== 'undefined' ? window : (undefined as any);
  private buttonEl?: HTMLElement;

  connectedCallback() {
    this.bindScroll();
    this.bindGlobalListeners();
  }

  componentDidLoad() {
    this.buttonEl = this.el.querySelector('.ldesign-backtop') as HTMLElement | undefined;
    this.updatePosition();
  }

  disconnectedCallback() {
    this.unbindScroll();
    this.unbindGlobalListeners();
  }

  @Watch('target')
  handleTargetChange() {
    this.unbindScroll();
    this.bindScroll();
    this.updatePosition();
  }

  private bindScroll() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const container = this.resolveTarget();
    this.scrollContainer = container;

    const handler = this.handleScroll as EventListener;
    if (container === window) {
      window.addEventListener('scroll', handler, { passive: true });
      this.updateVisible(this.getScrollTop(window));
    } else {
      (container as HTMLElement).addEventListener('scroll', handler, { passive: true } as any);
      this.updateVisible(this.getScrollTop(container as HTMLElement));
    }

    this.updatePosition();
  }

  private unbindScroll() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const handler = this.handleScroll as EventListener;

    if (this.scrollContainer) {
      if (this.scrollContainer === window) {
        window.removeEventListener('scroll', handler as any);
      } else {
        (this.scrollContainer as HTMLElement).removeEventListener('scroll', handler as any);
      }
    }
  }

  private bindGlobalListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', this.updatePosition as EventListener, { passive: true } as any);
    // 当页面发生滚动（非容器滚动）时也更新位置，保持贴紧容器
    window.addEventListener('scroll', this.updatePosition as EventListener, { passive: true } as any);
  }

  private unbindGlobalListeners() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', this.updatePosition as EventListener);
    window.removeEventListener('scroll', this.updatePosition as EventListener);
  }

  private resolveTarget(): HTMLElement | Window {
    if (!this.target) return window;
    try {
      const el = document.querySelector(this.target) as HTMLElement | null;
      return el || window;
    } catch (e) {
      return window;
    }
  }

  private getScrollTop(el: HTMLElement | Window): number {
    if (el === window) {
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }
    return (el as HTMLElement).scrollTop || 0;
  }

  private setScrollTop(el: HTMLElement | Window, value: number) {
    if (el === window) {
      window.scrollTo(0, value);
    } else {
      (el as HTMLElement).scrollTop = value;
    }
  }

  private handleScroll = () => {
    const top = this.getScrollTop(this.scrollContainer);
    this.updateVisible(top);
    this.updatePosition();
  };

  private updateVisible(top: number) {
    this.visible = top >= (this.visibilityHeight || 0);
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private getButtonSize(): number {
    const fallback = 44;
    try {
      const el = this.buttonEl || (this.el.querySelector('.ldesign-backtop') as HTMLElement | null);
      if (!el) return fallback;
      const rect = el.getBoundingClientRect();
      return Math.max(1, Math.round(Math.max(rect.width, rect.height)));
    } catch {
      return fallback;
    }
  }

  private updatePosition = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const container = this.scrollContainer || window;
    const inside = container !== window;

    if (!inside) {
      // 固定在窗口右下角
      this.positionStyle = {
        position: 'fixed',
        right: '40px',
        bottom: '40px',
        left: 'auto',
        top: 'auto'
      };
      return;
    }

    const rect = (container as HTMLElement).getBoundingClientRect();
    const offset = 16; // 容器内边距偏移
    const size = this.getButtonSize();

    const left = Math.max(rect.left, Math.round(rect.right - offset - size));
    const top = Math.max(rect.top, Math.round(rect.bottom - offset - size));

    this.positionStyle = {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      right: 'auto',
      bottom: 'auto'
    };
  };

  private scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const container = this.scrollContainer || window;

    const start = this.getScrollTop(container);
    if (start <= 0) return;

    const speed = Number(this.speed);
    if (!speed || speed <= 0) {
      this.setScrollTop(container, 0);
      return;
    }

    const duration = Math.max(120, (start / speed) * 1000); // 至少 120ms，避免太突兀
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = this.easeOutCubic(progress);
      const current = Math.round(start * (1 - eased));
      this.setScrollTop(container, current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.setScrollTop(container, 0);
      }
    };

    requestAnimationFrame(animate);
  };

  render() {
    const style = {
      ...this.positionStyle,
    } as any;

    const inside = this.scrollContainer && this.scrollContainer !== window;
    const cls = `ldesign-backtop${inside ? ' ldesign-backtop--inside' : ''}${this.visible ? ' ldesign-backtop--visible' : ''}`;

    return (
      <Host>
        <div
          class={cls}
          role="button"
          aria-label="回到顶部"
          aria-hidden={this.visible ? 'false' : 'true'}
          tabIndex={this.visible ? 0 : -1}
          style={style}
          onClick={this.scrollToTop}
        >
          <slot>
            <ldesign-icon name="arrow-up" class="ldesign-backtop__icon" />
          </slot>
        </div>
      </Host>
    );
  }
}
