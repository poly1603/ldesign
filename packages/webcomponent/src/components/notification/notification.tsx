import { Component, Prop, State, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * Notification 通知提醒
 * 位于页面角落的全局通知，支持标题、描述、操作区与自动关闭。
 */
@Component({
  tag: 'ldesign-notification',
  styleUrl: 'notification.less',
  shadow: false,
})
export class LdesignNotification {
  @Element() el!: HTMLElement;

  /** 通知类型 */
  @Prop() type: NotificationType = 'info';

  /** 标题 */
  @Prop() notificationTitle?: string;

  /** 描述文案（也可使用默认 slot 自定义内容） */
  @Prop() description?: string;

  /** 自动关闭的时长（毫秒）；设为 0 则不自动关闭 */
  @Prop() duration: number = 4500;

  /** 是否显示关闭按钮 */
  @Prop() closable: boolean = true;

  /** 是否显示图标 */
  @Prop() showIcon: boolean = true;

  /** 悬浮时是否暂停计时 */
  @Prop() pauseOnHover: boolean = true;

  /** 出现位置 */
  @Prop() placement: NotificationPlacement = 'top-right';

  /** 内部：是否可见（用于过渡动画） */
  @State() private isVisible = false;

  /** 内部：是否处于关闭过渡阶段 */
  @State() private isClosing = false;

  /** 关闭事件 */
  @Event() ldesignClose!: EventEmitter<void>;

  private closeTimer?: number;

  connectedCallback() {
    // 将自身移动到对应的全局容器，保证堆叠与定位
    this.ensureContainerAndMount();
  }

  componentDidLoad() {
    // 下一帧触发展示动画
    requestAnimationFrame(() => {
      this.isVisible = true;
    });

    this.startTimer();
  }

  disconnectedCallback() {
    this.clearTimer();
  }

  /** 手动关闭（带高度收起动画，带动后续通知平滑归位） */
  @Method()
  async close() {
    if (this.isClosing) return;
    this.clearTimer();

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
      root.classList.add('ldesign-notification--leaving');
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

  private startTimer() {
    if (this.duration && this.duration > 0) {
      this.closeTimer = (setTimeout(() => this.close(), this.duration) as unknown) as number;
    }
  }

  private clearTimer() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer as unknown as number);
      this.closeTimer = undefined;
    }
  }

  private handleMouseEnter = () => {
    if (!this.pauseOnHover) return;
    this.clearTimer();
  };

  private handleMouseLeave = () => {
    if (!this.pauseOnHover) return;
    // 简化：重新计时一整轮
    this.startTimer();
  };

  private ensureContainerAndMount() {
    const base = 'ldesign-notification__container';
    const placeClass = `${base}--${this.placement}`;
    let container = document.querySelector(`.${base}.${placeClass}`) as HTMLElement | null;

    if (!container) {
      container = document.createElement('div');
      container.className = `${base} ${placeClass}`;
      document.body.appendChild(container);
    }

    // 若父节点不是容器，则将自身移动到容器中
    if (this.el.parentElement !== container) {
      container.appendChild(this.el);
    }
  }

  private getIconName() {
    switch (this.type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'x-circle';
      default:
        return 'info';
    }
  }

  private isRightSide() {
    return this.placement.endsWith('right');
  }

  private getHostClass() {
    return [
      'ldesign-notification',
      `ldesign-notification--${this.type}`,
      this.isRightSide() ? 'ldesign-notification--from-right' : 'ldesign-notification--from-left',
      this.isVisible && !this.isClosing ? 'ldesign-notification--visible' : '',
      this.isClosing ? 'ldesign-notification--leaving' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  render() {
    return (
      <Host
        role="alert"
        aria-live="polite"
        class={this.getHostClass()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div class="ldesign-notification__inner">
          {this.showIcon && (
            <span class="ldesign-notification__icon-wrap">
              <ldesign-icon class="ldesign-notification__icon" name={this.getIconName()} />
            </span>
          )}
          <div class="ldesign-notification__content">
            {this.notificationTitle && <div class="ldesign-notification__title">{this.notificationTitle}</div>}
            <div class="ldesign-notification__desc">
              <slot>{this.description}</slot>
            </div>
            <div class="ldesign-notification__actions">
              <slot name="actions"></slot>
            </div>
          </div>
          {this.closable && (
            <button class="ldesign-notification__close" aria-label="Close" onClick={() => this.close()}>
              <ldesign-icon name="x" />
            </button>
          )}
        </div>
      </Host>
    );
  }
}
