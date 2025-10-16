import { Component, Prop, State, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'custom';
export type AlertVariant = 'filled' | 'outlined' | 'light' | 'gradient';
export type AlertSize = 'small' | 'medium' | 'large';

/**
 * Alert 警告信息
 * 用于在页面中展示重要的提示信息，支持多种状态、样式变体、尺寸、标题/描述、操作区与可关闭。
 */
@Component({
  tag: 'ldesign-alert',
  styleUrl: 'alert.less',
  shadow: false,
})
export class LdesignAlert {
  @Element() el!: HTMLElement;

  /** 警告类型 */
  @Prop() type: AlertType = 'info';

  /** 样式变体 */
  @Prop() variant: AlertVariant = 'light';

  /** 尺寸 */
  @Prop() size: AlertSize = 'medium';

  /** 标题（避开标准 HTMLElement.title 冲突） */
  @Prop() alertTitle?: string;

  /** 描述（也可通过默认 slot 自定义内容） */
  @Prop() description?: string;

  /** 是否显示关闭按钮 */
  @Prop() closable: boolean = false;

  /** 是否显示图标 */
  @Prop() showIcon: boolean = true;

  /** 自定义图标名称 */
  @Prop() iconName?: string;

  /** 自定义颜色（仅在 type 为 custom 时生效） */
  @Prop() color?: string;

  /** 横幅样式（常用于页面顶部） */
  @Prop() banner: boolean = false;

  /** 是否带有阴影效果 */
  @Prop() shadow: boolean = false;

  /** 是否启用动画效果 */
  @Prop() animated: boolean = true;

  /** 是否为紧凑模式 */
  @Prop() compact: boolean = false;

  /** 是否圆角 */
  @Prop() rounded: boolean = true;

  /** 自定义边框宽度 */
  @Prop() borderWidth: number = 1;

  /** 启用滚动公告（Marquee） */
  @Prop() marquee: boolean = false;
  /** 滚动速度（px/s） */
  @Prop() marqueeSpeed: number = 60;
  /** 悬停时是否暂停 */
  @Prop() marqueePauseOnHover: boolean = true;
  /** 方向 */
  @Prop() marqueeDirection: 'left' | 'right' = 'left';
  /** 两段内容之间的间距（px） */
  @Prop() marqueeGap: number = 24;

  /** 内部：是否处于关闭过渡阶段 */
  @State() private isClosing = false;
  /** 内部：滚动计算 */
  @State() private trackWidth = 0;
  @State() private containerWidth = 0;
  @State() private cloneHTML: string = '';

  private marqueeHost?: HTMLElement;
  private marqueeTrack?: HTMLElement;
  private resizeObserver?: ResizeObserver;

  /** actions 是否有内容（避免空容器占位） */
  @State() private hasActions = false;
  private mutationObserver?: MutationObserver;

  /** 关闭事件 */
  @Event() ldesignClose!: EventEmitter<void>;

  componentDidLoad() {
    if (this.marquee) {
      this.setupMarquee();
    }
    this.updateHasActions();
    // 监听 host 子节点变化，动态判断是否存在 actions
    this.mutationObserver = new MutationObserver(() => this.updateHasActions());
    this.mutationObserver.observe(this.el, { childList: true, subtree: true, attributes: true });
  }

  disconnectedCallback() {
    this.teardownMarquee();
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
  }

  private setupMarquee() {
    const apply = () => this.measureMarquee();
    // 多次尝试，适配异步渲染的插槽内容
    setTimeout(apply, 0);
    setTimeout(apply, 60);
    setTimeout(apply, 180);

    // 监听尺寸变化
    // 使用 typeof 判断支持情况，避免某些 TS 环境下的窄化问题
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.measureMarquee());
      if (this.marqueeHost) this.resizeObserver.observe(this.marqueeHost);
      if (this.marqueeTrack) this.resizeObserver.observe(this.marqueeTrack);
    } else {
      window.addEventListener('resize', this.handleWindowResize as any, { passive: true } as any);
    }
  }

  private teardownMarquee() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    } else {
      window.removeEventListener('resize', this.handleWindowResize as any);
    }
  }

  private handleWindowResize = () => this.measureMarquee();

  private updateHasActions() {
    // 查找带有 slot="actions" 的直接或间接子节点
    const has = !!this.el.querySelector('[slot="actions"]');
    this.hasActions = has;
  }

  private measureMarquee() {
    if (!this.marqueeHost || !this.marqueeTrack) return;
    const cRect = this.marqueeHost.getBoundingClientRect();
    const tRect = this.marqueeTrack.getBoundingClientRect();
    this.containerWidth = Math.ceil(cRect.width);
    this.trackWidth = Math.ceil(Math.max(this.marqueeTrack.scrollWidth, tRect.width));
    // 克隆当前 track 内容用于无缝滚动
    this.cloneHTML = this.marqueeTrack.innerHTML;
  }

  private getMarqueeDurationSec(): number {
    const distance = (this.trackWidth || 0) + (this.marqueeGap || 0);
    const speed = Math.max(10, this.marqueeSpeed || 60);
    return distance / speed;
  }

  /** 手动关闭（带高度收起动画） */
  @Method()
  async close() {
    if (this.isClosing) return;

    const root = this.el as HTMLElement;

    // 计算当前高度，并固定为像素值，便于从固定值过渡到 0
    const rect = root.getBoundingClientRect();
    root.style.height = `${rect.height}px`;
    root.style.boxSizing = 'border-box';
    root.style.overflow = 'hidden';

    // 触发一次重排，确保浏览器采纳上面的内联高度
    root.getBoundingClientRect();

    this.isClosing = true;

    // 下一帧开始收起动画
    requestAnimationFrame(() => {
      root.classList.add('ldesign-alert--leaving');
      root.style.height = '0px';
    });

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      root.removeEventListener('transitionend', onEnd);
      this.ldesignClose.emit();
      root.remove();
    };
    root.addEventListener('transitionend', onEnd, { once: true } as any);
  }

  private getIconName() {
    // 如果提供了自定义图标名称，优先使用
    if (this.iconName) {
      return this.iconName;
    }
    
    switch (this.type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'x-circle';
      case 'custom':
        return 'star'; // 默认自定义图标
      default:
        return 'info';
    }
  }

  private getHostClass() {
    return [
      'ldesign-alert',
      `ldesign-alert--${this.type}`,
      `ldesign-alert--${this.variant}`,
      `ldesign-alert--${this.size}`,
      this.banner ? 'ldesign-alert--banner' : '',
      this.shadow ? 'ldesign-alert--shadow' : '',
      this.animated ? 'ldesign-alert--animated' : '',
      this.compact ? 'ldesign-alert--compact' : '',
      !this.rounded ? 'ldesign-alert--no-rounded' : '',
      this.marquee ? 'ldesign-alert--has-marquee' : '',
      this.isClosing ? 'ldesign-alert--leaving' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  render() {
    const marqueeVars: any = this.marquee
      ? {
          '--track-width': `${this.trackWidth}px`,
          '--marquee-gap': `${this.marqueeGap}px`,
          '--marquee-duration': `${this.getMarqueeDurationSec()}s`,
        }
      : undefined;

    const customStyles: any = {};
    if (this.type === 'custom' && this.color) {
      customStyles['--alert-custom-color'] = this.color;
    }
    if (this.borderWidth !== 1) {
      customStyles['--alert-border-width'] = `${this.borderWidth}px`;
    }

    return (
      <Host 
        role="alert" 
        aria-live="polite" 
        class={this.getHostClass()}
        style={{ ...customStyles }}
      >
        <div class="ldesign-alert__inner">
          {this.showIcon && (
            <span class="ldesign-alert__icon-wrap">
              <ldesign-icon class="ldesign-alert__icon" name={this.getIconName()} />
            </span>
          )}
          <div class="ldesign-alert__content">
            {this.alertTitle && <div class="ldesign-alert__title">{this.alertTitle}</div>}
            <div
              class={{
                'ldesign-alert__desc': true,
                'ldesign-alert__marquee': !!this.marquee,
                'ldesign-alert__marquee--right': this.marquee && this.marqueeDirection === 'right',
              }}
              ref={(el) => (this.marqueeHost = el as HTMLElement)}
              style={marqueeVars}
              onMouseEnter={() => {
                if (this.marquee && this.marqueePauseOnHover && this.marqueeHost) {
                  this.marqueeHost.classList.add('is-paused');
                }
              }}
              onMouseLeave={() => {
                if (this.marquee && this.marqueePauseOnHover && this.marqueeHost) {
                  this.marqueeHost.classList.remove('is-paused');
                }
              }}
            >
              {this.marquee ? (
                <div class="ldesign-alert__marquee-inner">
                  <span class="ldesign-alert__marquee-track" ref={(el) => (this.marqueeTrack = el as HTMLElement)}>
                    <slot>{this.description}</slot>
                  </span>
                  <span class="ldesign-alert__marquee-track" innerHTML={this.cloneHTML}></span>
                </div>
              ) : (
                <slot>{this.description}</slot>
              )}
            </div>
            {this.hasActions && (
              <div class="ldesign-alert__actions" part="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <slot name="actions"></slot>
              </div>
            )}
          </div>
          {this.closable && (
            <button class="ldesign-alert__close" aria-label="Close" onClick={() => this.close()}>
              <ldesign-icon name="x" />
            </button>
          )}
        </div>
      </Host>
    );
  }
}
