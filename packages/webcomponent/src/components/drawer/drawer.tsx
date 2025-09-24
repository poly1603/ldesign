import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer 抽屉组件
 * 从屏幕边缘滑出一个面板，常用于显示导航、表单或详情
 */
@Component({
  tag: 'ldesign-drawer',
  styleUrl: 'drawer.less',
  shadow: false,
})
export class LdesignDrawer {
  @Element() el!: HTMLElement;

  /** 是否显示抽屉 */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /** 抽屉出现的位置 */
  @Prop() placement: DrawerPlacement = 'right';

  /** 面板尺寸（left/right 为宽度，top/bottom 为高度）。可为数字（px）或任意 CSS 长度 */
  @Prop() size: number | string = 360;

  /** 是否显示遮罩层 */
  @Prop() mask: boolean = true;

  /** 点击遮罩是否关闭 */
  @Prop() maskClosable: boolean = true;

  /** 是否允许按下 ESC 关闭 */
  @Prop() closeOnEsc: boolean = true;

  /** 是否显示右上角关闭按钮 */
  @Prop() closable: boolean = true;

  /** 标题文本（可通过 slot=header 自定义头部） */
  @Prop() drawerTitle?: string;

  /** z-index */
  @Prop() zIndex: number = 1000;

  /** 内部状态：当前是否可见（控制渲染/展示） */
  @State() isVisible: boolean = false;

  /** 内部状态：是否处于关闭动画阶段 */
  @State() isClosing: boolean = false;

  /** 内部状态：面板是否处于“打开位移”状态（用于触发过渡） */
  @State() isPanelOpen: boolean = false;

  /** 事件：可见性变化 */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  /** 事件：关闭 */
  @Event() ldesignClose: EventEmitter<void>;

  private maskElement?: HTMLElement;
  private escHandler?: (e: KeyboardEvent) => void;
  private closeTimer?: number;

  /** 背景滚动锁（不隐藏滚动条，仅阻止页面滚动） */
  private scrollLockHandler = (e: Event) => {
    if (!this.isVisible) return;
    const body = this.el.querySelector('.ldesign-drawer__body') as HTMLElement | null;
    if (!body) {
      e.preventDefault();
      return;
    }
    const target = e.target as Node | null;
    if (!target || !body.contains(target)) {
      e.preventDefault();
    }
  };

  private keyScrollLockHandler = (e: KeyboardEvent) => {
    if (!this.isVisible) return;
    const keys = ['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '];
    if (keys.includes(e.key)) {
      const body = this.el.querySelector('.ldesign-drawer__body') as HTMLElement | null;
      if (!body) {
        e.preventDefault();
        return;
      }
      const active = (document.activeElement as HTMLElement) || null;
      if (!active || !body.contains(active)) {
        e.preventDefault();
      }
    }
  };

  private bindScrollLock() {
    document.addEventListener('wheel', this.scrollLockHandler, { passive: false } as any);
    document.addEventListener('touchmove', this.scrollLockHandler, { passive: false } as any);
    document.addEventListener('keydown', this.keyScrollLockHandler, { passive: false } as any);
  }

  private unbindScrollLock() {
    document.removeEventListener('wheel', this.scrollLockHandler as any, false);
    document.removeEventListener('touchmove', this.scrollLockHandler as any, false);
    document.removeEventListener('keydown', this.keyScrollLockHandler as any, false);
  }

  @Watch('visible')
  watchVisible(newVal: boolean) {
    if (newVal) {
      this.show();
    } else {
      this.hide();
    }
  }

  componentDidLoad() {
    this.maskElement = this.el.querySelector('.ldesign-drawer__mask') as HTMLElement;
    if (this.visible) {
      this.show(false);
    }
    if (this.closeOnEsc) {
      this.bindEsc();
    }
  }

  disconnectedCallback() {
    this.unbindEsc();
    this.enableBodyScroll();
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
    this.isPanelOpen = false;
    this.unbindScrollLock();
  }

  private bindEsc() {
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }

  private unbindEsc() {
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = undefined;
    }
  }

  private disableBodyScroll() {
    // 改为滚动锁，不隐藏滚动条，避免页面抖动
    this.bindScrollLock();
  }

  private enableBodyScroll() {
    this.unbindScrollLock();
  }

  /** 显示抽屉 */
  @Method()
  async show(emit: boolean = true) {
    if (this.isVisible) return;
    this.isClosing = false;
    this.isVisible = true;
    this.visible = true;
    this.disableBodyScroll();
    // 下一帧再添加“open”类，确保过渡触发
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.isVisible) this.isPanelOpen = true;
      });
    });
    if (emit) this.ldesignVisibleChange.emit(true);
  }

  /** 隐藏抽屉（带动画） */
  @Method()
  async hide() {
    if (!this.isVisible || this.isClosing) return;
    this.isPanelOpen = false; // 先移除打开类，触发位移离场
    this.isClosing = true;
    // 300ms 动画后真正隐藏
    this.closeTimer = window.setTimeout(() => {
      this.isClosing = false;
      this.isVisible = false;
      this.visible = false;
      this.enableBodyScroll();
      this.ldesignVisibleChange.emit(false);
    }, 300);
  }

  /** 关闭（等价于 hide），同时触发 close 事件 */
  @Method()
  async close() {
    this.ldesignClose.emit();
    await this.hide();
  }

  private handleMaskClick = (event: Event) => {
    if (!this.maskClosable) return;
    if (event.target === this.maskElement) {
      this.close();
    }
  };

  private getRootClasses() {
    const classes = ['ldesign-drawer'];
    if (this.isVisible) classes.push('ldesign-drawer--visible');
    if (this.isClosing) classes.push('ldesign-drawer--closing');
    classes.push(`ldesign-drawer--${this.placement}`);
    return classes.join(' ');
  }

  private panelStyle(): { [k: string]: string } {
    const style: { [k: string]: string } = { zIndex: String(this.zIndex + 1) };
    const val = this.size;
    const sizeValue = typeof val === 'number' ? `${val}px` : (val || '').toString();
    if (this.placement === 'left' || this.placement === 'right') {
      style.width = sizeValue || '360px';
    } else {
      style.height = sizeValue || '360px';
    }
    return style;
  }

  private renderHeader() {
    const hasHeaderSlot = !!this.el.querySelector('[slot="header"]');
    if (!this.drawerTitle && !this.closable && !hasHeaderSlot) return null;
    return (
      <div class="ldesign-drawer__header">
        <div class="ldesign-drawer__title">
          {hasHeaderSlot ? <slot name="header" /> : (this.drawerTitle || '')}
        </div>
        {this.closable && (
          <button class="ldesign-drawer__close" aria-label="Close" onClick={() => this.close()}>
            <ldesign-icon name="x"></ldesign-icon>
          </button>
        )}
      </div>
    );
  }

  render() {
    // 注意：mask 元素每次渲染重新查询引用
    // 以便 handleMaskClick 判断点击来源
    setTimeout(() => this.maskElement = this.el.querySelector('.ldesign-drawer__mask') as HTMLElement, 0);

    return (
      <Host style={{ zIndex: String(this.zIndex) }}>
        <div class={this.getRootClasses()} role="dialog" aria-modal="true" aria-hidden={this.isVisible ? 'false' : 'true'}>
          {this.mask && (
            <div class="ldesign-drawer__mask" onClick={this.handleMaskClick}></div>
          )}
          <div class={{
            'ldesign-drawer__panel': true,
            'ldesign-drawer__panel--open': this.isPanelOpen,
            'ldesign-drawer__panel--closing': this.isClosing,
            [`ldesign-drawer__panel--${this.placement}`]: true,
          }} style={this.panelStyle()}>
            <div class="ldesign-drawer__content">
              {this.renderHeader()}
              <div class="ldesign-drawer__body">
                <slot />
              </div>
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}