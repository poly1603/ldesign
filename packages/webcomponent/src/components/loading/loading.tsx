import { Component, Prop, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * Loading 加载组件
 * 轻量的加载指示器，支持两种形态：spinner | dots
 */
@Component({
  tag: 'ldesign-loading',
  styleUrl: 'loading.less',
  shadow: false,
})
export class LdesignLoading {
  @Element() el!: HTMLElement;

  /** 是否处于加载中 */
  @Prop() spinning: boolean = true;

  /** 加载指示类型 */
  @Prop() type: 'spinner' | 'dots' = 'spinner';

  /** 尺寸 */
  @Prop() size: Size = 'medium';

  /** 说明文字 */
  @Prop() tip?: string;

  /** 垂直布局（图标在上、文字在下） */
  @Prop() vertical: boolean = false;

  /** 全屏模式（覆盖整个视口） */
  @Prop() fullscreen: boolean = false;

  /** 全屏时是否显示遮罩背景 */
  @Prop() mask: boolean = true;

  /** 全屏时的层级（可选） */
  @Prop() zIndex?: number;

  /** 全屏时是否锁定页面滚动 */
  @Prop() lockScroll: boolean = true;

  private originalBodyOverflow?: string;

  componentDidLoad() {
    this.updateScrollLock();
  }

  disconnectedCallback() {
    this.unlockScroll();
  }

  @Watch('spinning')
  onSpinChange() {
    this.updateScrollLock();
  }

  @Watch('fullscreen')
  onFullscreenChange() {
    this.updateScrollLock();
  }

  @Watch('lockScroll')
  onLockScrollChange() {
    this.updateScrollLock();
  }

  private updateScrollLock() {
    if (typeof document === 'undefined') return;
    if (this.fullscreen && this.spinning && this.lockScroll) {
      if (this.originalBodyOverflow === undefined) {
        this.originalBodyOverflow = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    } else {
      this.unlockScroll();
    }
  }

  private unlockScroll() {
    if (typeof document === 'undefined') return;
    if (this.originalBodyOverflow !== undefined) {
      document.body.style.overflow = this.originalBodyOverflow;
      this.originalBodyOverflow = undefined;
    } else {
      // 回退为默认
      document.body.style.overflow = '';
    }
  }

  private getHostClass() {
    return [
      'ldesign-loading',
      `ldesign-loading--${this.size}`,
      `ldesign-loading--type-${this.type}`,
      this.vertical ? 'ldesign-loading--vertical' : '',
      this.fullscreen ? 'ldesign-loading--fullscreen' : '',
      this.fullscreen && this.mask ? 'ldesign-loading--with-mask' : '',
      this.spinning ? '' : 'ldesign-loading--hidden',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private renderIndicator() {
    if (this.type === 'dots') {
      return (
        <span class="ldesign-loading__dots" aria-hidden="true">
          <span class="ldesign-loading__dot" />
          <span class="ldesign-loading__dot" />
          <span class="ldesign-loading__dot" />
        </span>
      );
    }

    // spinner
    return <span class="ldesign-loading__spinner" aria-hidden="true" />;
  }

  render() {
    const styleObj = this.fullscreen && this.zIndex != null ? { zIndex: `${this.zIndex}` } : undefined;
    return (
      <Host
        role="status"
        aria-live="polite"
        aria-busy={this.spinning ? 'true' : 'false'}
        class={this.getHostClass()}
        style={styleObj as any}
      >
        {this.renderIndicator()}
        {this.tip && <span class="ldesign-loading__tip">{this.tip}</span>}
        <span class="ldesign-loading__content"><slot /></span>
        {/* 提供无障碍隐藏文本，若没有 tip 则给出默认文案 */}
        {!this.tip && (
          <span class="ldesign__sr-only">Loading</span>
        )}
      </Host>
    );
  }
}
