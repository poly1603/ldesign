import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { lockPageScroll, unlockPageScroll } from '../../utils/scroll-lock';

// 全局栈：用于管理多层抽屉（确保 ESC/遮罩仅作用于栈顶，并进行 z-index 叠加）
const __drawerStack: any[] = [];
// 容器 overflow 锁：同一容器内可能有多个抽屉并存，使用计数避免提前恢复
const __containerOverflowLocks: WeakMap<HTMLElement, { count: number; original: string | null }> = new WeakMap();

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

  /** 容器（选择器或元素）：若提供，则把组件节点移动到该容器下 */
  @Prop() getContainer?: string | HTMLElement;

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

  // 容器引用与其原始 overflow（容器模式时在打开期间设置为 hidden 并在关闭时恢复）
  private containerEl?: HTMLElement | null;
  private assignedZIndex?: number;

  /** 背景滚动锁（不隐藏滚动条，仅阻止页面滚动） */
  private scrollLockHandler = (e: Event) => {
    // 仅当本实例为栈顶时才拦截滚动，避免多层抽屉相互“抢”事件
    if (!this.isVisible || !this.isTopMost()) return;
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
    // 仅当本实例为栈顶时才拦截按键滚动
    if (!this.isVisible || !this.isTopMost()) return;
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

  private scrollScopeTarget?: EventTarget;

  private bindScrollLock() {
    const target = this.isInContainer() ? (this.containerEl as HTMLElement) : document;
    this.scrollScopeTarget = target;
    (target as any).addEventListener('wheel', this.scrollLockHandler, { passive: false } as any);
    (target as any).addEventListener('touchmove', this.scrollLockHandler, { passive: false } as any);
    // 仅非容器模式时拦截键盘滚动，避免影响容器外页面
    if (!this.isInContainer()) {
      document.addEventListener('keydown', this.keyScrollLockHandler as any, { passive: false } as any);
    }
  }

  private unbindScrollLock() {
    const target = this.scrollScopeTarget || document;
    (target as any).removeEventListener('wheel', this.scrollLockHandler as any, false);
    (target as any).removeEventListener('touchmove', this.scrollLockHandler as any, false);
    document.removeEventListener('keydown', this.keyScrollLockHandler as any, false);
    this.scrollScopeTarget = undefined;
  }

  @Watch('visible')
  watchVisible(newVal: boolean) {
    if (newVal) {
      this.show();
    } else {
      this.hide();
    }
  }

  @Watch('getContainer')
  onGetContainerChange() {
    const prev = this.containerEl || null;
    this.moveToContainer();
    const next = this.containerEl || null;
    if (this.isVisible) {
      // 切换容器时，恢复之前容器的 overflow，并为新容器设置 overflow:hidden
      if (prev && prev !== document.body && prev !== document.documentElement) {
        this.restoreContainerOverflow(prev);
      }
      if (next && next !== document.body && next !== document.documentElement) {
        this.applyContainerOverflow(next);
      }
    }
  }

  componentWillLoad() {
    // 在初次渲染前尽早尝试移动到容器
    this.moveToContainer();
  }

  componentDidLoad() {
    // 兜底再尝试一次，防止部分环境下升级时机导致首次未移动
    this.moveToContainer();

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
        if (this.isTopMost()) this.close();
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
    // 容器模式：仅限制容器滚动并隐藏容器滚动条；全屏模式：锁定页面滚动
    if (this.isInContainer()) {
      const c = this.containerEl as HTMLElement;
      if (c) this.applyContainerOverflow(c);
    } else {
      lockPageScroll();
    }
    this.bindScrollLock();
  }

  private enableBodyScroll() {
    this.unbindScrollLock();
    if (this.isInContainer()) {
      const c = this.containerEl as HTMLElement;
      if (c) this.restoreContainerOverflow(c);
    } else {
      unlockPageScroll();
    }
  }

  /** 显示抽屉 */
  @Method()
  async show(emit: boolean = true) {
    if (this.isVisible) return;
    this.isClosing = false;

    // 确保挂载到目标容器，并入栈分配基础 z-index（先于渲染）
    this.moveToContainer();
    this.pushToStack();

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
      // 出栈（恢复前一层的 inert）
      this.removeFromStack();
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
      if (this.isTopMost()) this.close();
    }
  };

  private getRootClasses() {
    const classes = ['ldesign-drawer'];
    if (this.isVisible) classes.push('ldesign-drawer--visible');
    if (this.isClosing) classes.push('ldesign-drawer--closing');
    classes.push(`ldesign-drawer--${this.placement}`);
    if (this.isInContainer()) classes.push('ldesign-drawer--in-container');
    return classes.join(' ');
  }

  private baseZ(): number { return typeof this.assignedZIndex === 'number' ? (this.assignedZIndex as number) : (this.zIndex || 1000); }

  private panelStyle(): { [k: string]: string } {
    const style: { [k: string]: string } = { zIndex: String(this.baseZ() + 1) };
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
      <Host style={{ zIndex: String(this.baseZ()) }}>
        <div class={this.getRootClasses()} style={this.getRootStyle()} role="dialog" aria-modal="true" aria-hidden={this.isVisible ? 'false' : 'true'}>
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
  // ── 容器辅助 ─────────────────────────────────────────────
  private moveToContainer() {
    try {
      let target: HTMLElement | null = null;
      if (typeof this.getContainer === 'string') {
        target = document.querySelector(this.getContainer) as HTMLElement | null;
      } else if ((this.getContainer as any) && (this.getContainer as any).nodeType === 1) {
        target = this.getContainer as HTMLElement;
      } else {
        target = null;
      }
      if (target && this.el.parentElement !== target) {
        target.appendChild(this.el);
      }
      this.containerEl = target;
    } catch (_) { /* ignore */ }
  }

  private isInContainer(): boolean {
    // 只有显式指定了 getContainer（或通过 moveToContainer 成功记录）时才视为容器模式
    const c = this.containerEl;
    return !!(c && c !== document.body && c !== document.documentElement);
  }

  private getRootStyle(): { [k: string]: string } {
    // 在容器内使用绝对定位以铺满容器
    if (this.isInContainer()) {
      return { position: 'absolute' } as any;
    }
    return {} as any;
  }

  private applyContainerOverflow(container: HTMLElement) {
    if (!container) return;
    const rec = __containerOverflowLocks.get(container) || { count: 0, original: container.style.overflow || null };
    if (rec.count === 0) {
      rec.original = container.style.overflow || null;
      container.style.overflow = 'hidden';
    }
    rec.count += 1;
    __containerOverflowLocks.set(container, rec);
  }

  private restoreContainerOverflow(container: HTMLElement) {
    if (!container) return;
    const rec = __containerOverflowLocks.get(container);
    if (!rec) return;
    rec.count = Math.max(0, rec.count - 1);
    if (rec.count === 0) {
      if (rec.original == null || rec.original === '') container.style.removeProperty('overflow');
      else container.style.overflow = rec.original;
      __containerOverflowLocks.delete(container);
    } else {
      __containerOverflowLocks.set(container, rec);
    }
  }

  // ── 栈管理 ─────────────────────────────────────────────
  private getContainerElement(): HTMLElement {
    const p = this.el.parentElement;
    return p ?? document.body;
  }
  private applyInert() {
    const container = this.getContainerElement();
    const siblings = Array.from(container.children) as HTMLElement[];
    const me = this.el as HTMLElement;
    const targets = siblings.filter((el) => el !== me);
    targets.forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      try { (el as any).setAttribute('inert', ''); } catch (_) {}
    });
  }
  private clearInert() {
    const container = this.getContainerElement();
    const siblings = Array.from(container.children) as HTMLElement[];
    siblings.forEach((el) => {
      el.removeAttribute('aria-hidden');
      try { (el as any).removeAttribute('inert'); } catch (_) {}
    });
  }
  private pushToStack() {
    const prevTop = __drawerStack[__drawerStack.length - 1];
    if (prevTop && prevTop !== (this as any)) {
      try { prevTop.clearInert(); } catch (_) {}
    }
    const idx = __drawerStack.indexOf(this as any);
    if (idx >= 0) __drawerStack.splice(idx, 1);
    const prevZ = prevTop && typeof prevTop.assignedZIndex === 'number' ? prevTop.assignedZIndex : (this.zIndex || 1000);
    const base = Math.max(this.zIndex || 1000, (prevZ as number) + (prevTop ? 2 : 0));
    this.assignedZIndex = base;
    __drawerStack.push(this as any);
    this.applyInert();
  }
  private removeFromStack() {
    const idx = __drawerStack.indexOf(this as any);
    if (idx >= 0) __drawerStack.splice(idx, 1);
    this.clearInert();
    const newTop = __drawerStack[__drawerStack.length - 1];
    if (newTop) {
      try { newTop.applyInert(); } catch (_) {}
    }
    this.assignedZIndex = undefined;
  }
  private isTopMost() {
    return __drawerStack.length > 0 && __drawerStack[__drawerStack.length - 1] === (this as any);
  }
}
