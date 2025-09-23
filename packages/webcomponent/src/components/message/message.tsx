import { Component, Prop, State, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

/**
 * Message 全局提示
 * 轻量级的全局反馈，常用于操作后的轻量提示
 */
@Component({
  tag: 'ldesign-message',
  styleUrl: 'message.less',
  shadow: false,
})
export class LdesignMessage {
  @Element() el!: HTMLElement;

  /** 提示类型 */
  @Prop() type: MessageType = 'info';

  /** 自动关闭的时长（毫秒）；设为 0 则不自动关闭 */
  @Prop() duration: number = 3000;

  /** 是否显示关闭按钮 */
  @Prop() closable: boolean = false;

  /** 是否显示图标 */
  @Prop() showIcon: boolean = true;

  /** 简单文本内容（也可使用 slot 自定义内容） */
  @Prop() message?: string;

  /** 悬浮时是否暂停计时 */
  @Prop() pauseOnHover: boolean = true;

  /** 出现位置（当前仅支持 top，预留 bottom 扩展） */
  @Prop() placement: 'top' | 'bottom' = 'top';

  /** 内部：是否可见（用于过渡动画） */
  @State() private isVisible = false;

  /** 内部：是否处于关闭过渡阶段 */
  @State() private isClosing = false;

  /** 关闭事件 */
  @Event() ldesignClose: EventEmitter<void>;

  private closeTimer?: number;

  connectedCallback() {
    // 将自身移动到全局容器，保证堆叠与定位
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

  /** 手动关闭（带高度收起动画，带动后续消息平滑上移） */
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
      root.classList.add('ldesign-message--leaving');
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
    // 重新计时：剩余时间策略简单化为重新计满一轮
    this.startTimer();
  };

  private ensureContainerAndMount() {
    const base = 'ldesign-message__container';
    const placeClass = this.placement === 'bottom' ? `${base}--bottom` : `${base}--top`;
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

  private getHostClass() {
    return [
      'ldesign-message',
      `ldesign-message--${this.type}`,
      this.isVisible && !this.isClosing ? 'ldesign-message--visible' : '',
      this.isClosing ? 'ldesign-message--leaving' : '',
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
        <div class="ldesign-message__inner">
          {this.showIcon && (
            <span class="ldesign-message__icon-wrap">
              <ldesign-icon class="ldesign-message__icon" name={this.getIconName()} />
            </span>
          )}
          <div class="ldesign-message__content">
            <slot>{this.message}</slot>
          </div>
          {this.closable && (
            <button class="ldesign-message__close" aria-label="Close" onClick={() => this.close()}>
              <ldesign-icon name="x" />
            </button>
          )}
        </div>
      </Host>
    );
  }
}
