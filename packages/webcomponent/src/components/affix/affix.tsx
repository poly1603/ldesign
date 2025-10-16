import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

/**
 * Affix 固钉组件
 * - 将元素固定在页面（或指定滚动容器）顶部
 * - 默认基于窗口滚动容器，支持设置 offsetTop、target(container) 与 zIndex
 */
@Component({
  tag: 'ldesign-affix',
  styleUrl: 'affix.less',
  shadow: false,
})
export class LdesignAffix {
  @Element() el!: HTMLElement;

  /**
   * 距离顶部的偏移量（触发吸顶的阈值）
   */
  @Prop() offset: number = 0;

  /**
   * 指定滚动容器（CSS 选择器）。默认为 window
   * 例如：'#scrollable' 或 '.scroll-area'
   */
  @Prop() target?: string;

  /**
   * 自定义层级
   */
  @Prop() zIndex: number = 1000;

  /**
   * 是否在指定滚动容器内部吸附（使用 position: sticky 策略）
   * 仅当设置了 target 且 target 不是 window 时生效
   */
  @Prop() withinTarget: boolean = false;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 吸附状态变化事件
   */
  @Event() ldesignAffixChange!: EventEmitter<boolean>;

  /** 当前是否处于吸附状态 */
  @State() private affixed: boolean = false;

  /** 固定时的样式（position、top、left、width、zIndex） */
  @State() private affixStyle?: { [key: string]: string };

  /** 占位元素高度（吸附后保持页面布局不抖动） */
  @State() private placeholderHeight: number = 0;

  private scrollContainer: Window | HTMLElement = window;
  private placeholderEl?: HTMLElement;
  private contentEl?: HTMLElement;
  private removeScrollListener?: () => void;
  private removeResizeListener?: () => void;
  private ticking = false;

  // 监听相关属性变化，重新绑定容器和测量
  @Watch('target')
  @Watch('offset')
  @Watch('disabled')
  async onPropsChange() {
    this.unbind();
    await this.bind();
    this.updatePosition();
  }

  async componentDidLoad() {
    await this.bind();
    this.updatePosition();
  }

  disconnectedCallback() {
    this.unbind();
  }

  private async bind() {
    // 解析滚动容器
    if (this.target) {
      const el = document.querySelector(this.target) as HTMLElement | null;
      this.scrollContainer = el || window;
    } else {
      this.scrollContainer = window;
    }

    const onScroll = () => this.onScroll();
    const onResize = () => this.onResize();

    if (this.isWindow(this.scrollContainer)) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      this.removeScrollListener = () => window.removeEventListener('scroll', onScroll);
      this.removeResizeListener = () => window.removeEventListener('resize', onResize);
    } else {
      this.scrollContainer.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      this.removeScrollListener = () => this.scrollContainer instanceof HTMLElement && this.scrollContainer.removeEventListener('scroll', onScroll);
      this.removeResizeListener = () => window.removeEventListener('resize', onResize);
    }
  }

  private unbind() {
    this.removeScrollListener?.();
    this.removeScrollListener = undefined;
    this.removeResizeListener?.();
    this.removeResizeListener = undefined;
  }

  private isWindow(c: Window | HTMLElement): c is Window {
    return (c as Window).window === window;
  }

  private onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.updatePosition();
    });
  }

  private onResize() {
    // 尺寸变化时也需要重新测量
    this.updatePosition(true);
  }

  /**
   * 核心测量与固定逻辑
   */
  private updatePosition(forceWidthRecalc = false) {
    if (!this.placeholderEl || !this.contentEl) return;

    // 禁用时恢复为普通流
    if (this.disabled) {
      if (this.affixed) {
        this.affixed = false;
        this.ldesignAffixChange.emit(false);
      }
      this.affixStyle = undefined;
      this.placeholderHeight = 0;
      return;
    }

    const isWin = this.isWindow(this.scrollContainer);
    const useStickyInTarget = this.withinTarget && !isWin;

    const placeholderRect = this.placeholderEl.getBoundingClientRect();
    const containerRect = isWin
      ? { top: 0, bottom: window.innerHeight }
      : (this.scrollContainer as HTMLElement).getBoundingClientRect();

    const topThreshold = containerRect.top + (this.offset || 0);
    const shouldAffix = placeholderRect.top <= topThreshold;

    if (useStickyInTarget) {
      // container 内部吸附：使用 position: sticky，避免与页面其它固定元素重叠
      this.affixStyle = {
        position: 'sticky',
        top: `${Math.max(this.offset, 0)}px`,
        zIndex: String(this.zIndex),
      };
      this.placeholderHeight = 0;

      // sticky 模式下仍然根据阈值触发事件（用于外部感知状态）
      if (shouldAffix !== this.affixed) {
        this.affixed = shouldAffix;
        this.ldesignAffixChange.emit(this.affixed);
      }
      return;
    }

    if (shouldAffix) {
      const width = forceWidthRecalc ? this.placeholderEl.offsetWidth : (this.affixStyle ? parseFloat(this.affixStyle.width || '0') : 0) || this.placeholderEl.offsetWidth;
      const left = placeholderRect.left;
      const top = topThreshold;

      this.affixStyle = {
        position: 'fixed',
        top: `${Math.max(top, 0)}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: String(this.zIndex),
      };

      const contentHeight = this.contentEl.offsetHeight;
      this.placeholderHeight = contentHeight;

      if (!this.affixed) {
        this.affixed = true;
        this.ldesignAffixChange.emit(true);
      }
    } else {
      // 还原
      if (this.affixed) {
        this.affixed = false;
        this.ldesignAffixChange.emit(false);
      }
      this.affixStyle = undefined;
      this.placeholderHeight = 0;
    }
  }

  private setPlaceholderRef = (el?: HTMLElement) => {
    this.placeholderEl = el || undefined;
  };

  private setContentRef = (el?: HTMLElement) => {
    this.contentEl = el || undefined;
  };

  render() {
    return (
      <Host class={{ 'ldesign-affix': true, 'ldesign-affix--affixed': this.affixed }}>
        <div class="ldesign-affix__placeholder" ref={this.setPlaceholderRef} style={{ height: this.placeholderHeight ? `${this.placeholderHeight}px` : undefined }}></div>
        <div class="ldesign-affix__content" ref={this.setContentRef} style={this.affixStyle}>
          <slot />
        </div>
      </Host>
    );
  }
}
