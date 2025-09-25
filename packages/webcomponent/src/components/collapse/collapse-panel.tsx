import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';

let idSeed = 0;

/**
 * CollapsePanel 折叠面板项
 */
@Component({
  tag: 'ldesign-collapse-panel',
  styleUrl: 'collapse-panel.less',
  shadow: false,
})
export class LdesignCollapsePanel {
  @Element() el!: HTMLElement;

  /** 面板唯一标识（由父级匹配） */
  @Prop({ mutable: true }) name?: string;
  /** 头部文本（可用 slot="header" 覆盖） */
  @Prop() header?: string;
  /** 右侧附加区（可用 slot="extra" 覆盖） */
  @Prop() extra?: string;
  /** 禁用 */
  @Prop() disabled: boolean = false;
  /** 展开图标名称（默认 chevron-right） */
  @Prop() expandIcon: string = 'chevron-right';
  /** 图标位置（由父级传入，也可单独覆盖） */
  @Prop({ mutable: true, reflect: true }) expandIconPlacement: 'left' | 'right' = 'left';

  /** 首次激活才渲染内容（懒渲染） */
  @Prop() lazy: boolean = false;
  /** 收起后是否销毁内容（优先级高于 lazy） */
  @Prop() destroyOnClose: boolean = false;

  /** 激活状态（由父级控制） */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  /** 冒泡给父级，用于切换 */
  @Event() ldesignCollapseItemToggle!: EventEmitter<{ name: string }>;

  @State() hasRendered: boolean = false;

  private headerId = `ld-col-h-${++idSeed}`;
  private contentId = `ld-col-c-${idSeed}`;
  private contentRef?: HTMLDivElement;

  componentWillLoad() {
    if (!this.name) this.name = `panel-${idSeed}`;
    if (!this.lazy) this.hasRendered = true;
    if (this.active) this.hasRendered = true;
  }

  componentDidLoad() {
    // 初始化内容高度，无闪烁
    const el = this.contentRef;
    if (!el) return;
    el.style.display = 'block';
    if (this.active) {
      el.style.overflow = '';
      el.style.height = 'auto';
    } else {
      el.style.overflow = 'hidden';
      el.style.height = '0px';
    }
  }

  @Watch('active')
  onActiveChange(isActive: boolean) {
    if (isActive) {
      this.hasRendered = true;
      this.animateOpen();
    } else {
      this.animateClose();
    }
  }

  private prefersReduceMotion(): boolean {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { return false; }
  }

  private animateOpen() {
    const el = this.contentRef;
    if (!el) return;

    // 若用户偏好减少动画，直接展开
    if (this.prefersReduceMotion()) {
      el.style.display = 'block';
      el.style.overflow = '';
      el.style.height = 'auto';
      return;
    }

    el.style.display = 'block';
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    requestAnimationFrame(() => {
      const sh = el.scrollHeight;
      el.style.height = `${sh}px`;
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.height = 'auto';
      el.style.overflow = '';
    };
    el.addEventListener('transitionend', onEnd);
  }

  private animateClose() {
    const el = this.contentRef;
    if (!el) return;

    if (this.prefersReduceMotion()) {
      // 直接收起
      el.style.overflow = 'hidden';
      el.style.height = '0px';
      return;
    }

    const h = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = `${h}px`;
    requestAnimationFrame(() => {
      el.style.height = '0px';
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      // 保持 height:0; overflow:hidden 即可
    };
    el.addEventListener('transitionend', onEnd);
  }

  private shouldRender() {
    if (this.destroyOnClose) return this.active;
    if (this.lazy) return this.active || this.hasRendered;
    return true;
  }

  private onHeaderClick = (e: MouseEvent) => {
    e.preventDefault();
    if (this.disabled) return;
    this.ldesignCollapseItemToggle.emit({ name: this.name! });
  };

  private onHeaderKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.ldesignCollapseItemToggle.emit({ name: this.name! });
    }
  };

  render() {
    const cls = {
      'ldesign-collapse-panel': true,
      'ldesign-collapse-panel--active': this.active,
      'ldesign-collapse-panel--disabled': this.disabled,
      [`ldesign-collapse-panel--icon-${this.expandIconPlacement}`]: true,
    } as any;

    const icon = (
      <span class={{
        'ldesign-collapse-panel__arrow': true,
        'ldesign-collapse-panel__arrow--active': this.active,
      }} aria-hidden="true">
        <ldesign-icon name={this.expandIcon} size="small" />
      </span>
    );

    return (
      <Host class={cls}>
        <div
          class="ldesign-collapse-panel__header"
          role="button"
          tabindex={this.disabled ? -1 : 0}
          id={this.headerId}
          aria-controls={this.contentId}
          aria-expanded={this.active ? 'true' : 'false'}
          aria-disabled={this.disabled ? 'true' : 'false'}
          onClick={this.onHeaderClick}
          onKeyDown={this.onHeaderKeyDown}
        >
          {this.expandIconPlacement === 'left' && icon}
          <div class="ldesign-collapse-panel__header-main">
            <slot name="header">{this.header}</slot>
          </div>
          <div class="ldesign-collapse-panel__extra">
            <slot name="extra">{this.extra}</slot>
          </div>
          {this.expandIconPlacement === 'right' && icon}
        </div>

        <div
          class="ldesign-collapse-panel__content"
          id={this.contentId}
          role="region"
          aria-labelledby={this.headerId}
          ref={el => (this.contentRef = el as HTMLDivElement)}
        >
          <div class="ldesign-collapse-panel__content-inner">
            {this.shouldRender() ? <slot></slot> : null}
          </div>
        </div>
      </Host>
    );
  }
}