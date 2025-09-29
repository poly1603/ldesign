import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { lockPageScroll, unlockPageScroll } from '../../utils/scroll-lock';

// 全局栈：用于管理多层抽屉（确保 ESC/遮罩仅作用于栈顶，并进行 z-index 叠加）
const __drawerStack: any[] = [];
// 容器 overflow 锁：同一容器内可能有多个抽屉并存，使用计数避免提前恢复
const __containerOverflowLocks: WeakMap<HTMLElement, { count: number; original: string | null }> = new WeakMap();

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

// 预设的吸附点
export interface SnapPoint {
  value: number; // 百分比或像素值
  label?: string; // 可选标签
}

// 底部按钮配置
export interface DrawerButton {
  text: string;
  type?: 'primary' | 'default' | 'danger' | 'success' | 'warning';
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

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

  /** 是否启用圆角 */
  @Prop() rounded: boolean = false;

  /** 圆角大小 */
  @Prop() borderRadius: string = '12px';

  /** 是否可调整大小 */
  @Prop() resizable: boolean = false;

  /** 最小尺寸（像素或百分比） */
  @Prop() minSize: number | string = 200;

  /** 最大尺寸（像素或百分比） */
  @Prop() maxSize: number | string = '80%';

  /** 吸附点配置 */
  @Prop() snapPoints: SnapPoint[] = [];

  /** 吸附阈值（像素） */
  @Prop() snapThreshold: number = 50;

  /** 是否启用阻尼效果 */
  @Prop() damping: boolean = true;

  /** 阻尼系数（0-1） */
  @Prop() dampingFactor: number = 0.5;

  /** 自定义底部按钮 */
  @Prop() footerButtons: DrawerButton[] = [];

  /** 是否显示底部分割线 */
  @Prop() footerBorder: boolean = true;

  /** 是否启用键盘导航 */
  @Prop() keyboardNavigation: boolean = true;

  /** 自动聚焦到第一个可交互元素 */
  @Prop() autoFocus: boolean = true;

  /** 是否显示调整大小的提示 */
  @Prop() showResizeHint: boolean = true;

  /** 是否在移动端启用手势关闭 */
  @Prop() swipeToClose: boolean = true;

  /** 手势关闭的阈值（百分比） */
  @Prop() swipeThreshold: number = 0.3;

  /** 是否显示进入/退出动画 */
  @Prop() animation: boolean = true;

  /** 动画持续时间（毫秒） */
  @Prop() animationDuration: number = 300;

  /** 是否在关闭时保留状态 */
  @Prop() preserveState: boolean = false;

  /** 内部状态：当前是否可见（控制渲染/展示） */
  @State() isVisible: boolean = false;

  /** 内部状态：是否处于关闭动画阶段 */
  @State() isClosing: boolean = false;

  /** 内部状态：面板是否处于"打开位移"状态（用于触发过渡） */
  @State() isPanelOpen: boolean = false;

  /** 内部状态：当前尺寸 */
  @State() currentSize: number | string;

  /** 内部状态：是否正在调整大小 */
  @State() isResizing: boolean = false;

  /** 内部状态：是否正在拖动（用于手势） */
  @State() isDragging: boolean = false;

  /** 内部状态：当前拖动的偏移量 */
  @State() dragOffset: number = 0;

  /** 内部状态：显示吸附指示器 */
  @State() showSnapIndicator: boolean = false;

  /** 内部状态：当前吸附点 */
  @State() currentSnapPoint: SnapPoint | null = null;

  /** 事件：可见性变化 */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  /** 事件：关闭 */
  @Event() ldesignClose: EventEmitter<void>;

  /** 事件：尺寸变化 */
  @Event() ldesignSizeChange: EventEmitter<{ size: number | string; placement: DrawerPlacement }>;  

  /** 事件：调整大小开始 */
  @Event() ldesignResizeStart: EventEmitter<void>;

  /** 事件：调整大小结束 */
  @Event() ldesignResizeEnd: EventEmitter<{ size: number | string }>;

  /** 事件：吸附到点 */
  @Event() ldesignSnapToPoint: EventEmitter<SnapPoint>;

  private maskElement?: HTMLElement;
  private escHandler?: (e: KeyboardEvent) => void;
  private closeTimer?: number;
  private panelElement?: HTMLElement;
  private resizeHandleElement?: HTMLElement;
  private startSize: number = 0;
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private touchStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private touchStartTime: number = 0;
  private animationFrame?: number;
  private resizeObserver?: ResizeObserver;

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
    // 初始化当前尺寸
    this.currentSize = this.size;
  }

  componentDidLoad() {
    // 兜底再尝试一次，防止部分环境下升级时机导致首次未移动
    this.moveToContainer();

    this.maskElement = this.el.querySelector('.ldesign-drawer__mask') as HTMLElement;
    this.panelElement = this.el.querySelector('.ldesign-drawer__panel') as HTMLElement;
    this.resizeHandleElement = this.el.querySelector('.ldesign-drawer__resize-handle') as HTMLElement;

    if (this.visible) {
      this.show(false);
    }
    if (this.closeOnEsc) {
      this.bindEsc();
    }
    // 移动端不启用拖拽调整大小
    if (this.resizable && !this.isMobileDevice()) {
      this.initResize();
    }
    if (this.swipeToClose && this.isMobileDevice()) {
      this.initSwipeGestures();
    }
    if (this.keyboardNavigation) {
      this.initKeyboardNavigation();
    }
    
    // 监听窗口大小变化
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    this.unbindEsc();
    this.enableBodyScroll();
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.isPanelOpen = false;
    this.unbindScrollLock();
    this.cleanupResize();
    this.cleanupSwipeGestures();
    window.removeEventListener('resize', this.handleResize);
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
    
    // 重置拖动状态
    this.dragOffset = 0;
    this.isDragging = false;
    
    // 下一帧再添加"open"类，确保过渡触发
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.isVisible) {
          this.isPanelOpen = true;
          if (this.autoFocus) {
            this.focusFirstElement();
          }
        }
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
    
    const duration = this.animation ? this.animationDuration : 0;
    
    // 动画后真正隐藏
    this.closeTimer = window.setTimeout(() => {
      this.isClosing = false;
      this.isVisible = false;
      this.visible = false;
      this.enableBodyScroll();
      // 出栈（恢复前一层的 inert）
      this.removeFromStack();
      this.ldesignVisibleChange.emit(false);
      
      // 如果不保留状态，重置尺寸
      if (!this.preserveState) {
        this.currentSize = this.size;
        this.dragOffset = 0;
      }
    }, duration);
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
    if (this.rounded) classes.push('ldesign-drawer--rounded');
    if (this.resizable) classes.push('ldesign-drawer--resizable');
    if (this.isResizing) classes.push('ldesign-drawer--resizing');
    if (this.isDragging) classes.push('ldesign-drawer--dragging');
    if (this.showSnapIndicator) classes.push('ldesign-drawer--snapping');
    if (this.isMobileDevice()) classes.push('ldesign-drawer--mobile');
    return classes.join(' ');
  }

  private baseZ(): number { return typeof this.assignedZIndex === 'number' ? (this.assignedZIndex as number) : (this.zIndex || 1000); }

  private panelStyle(): { [k: string]: string } {
    const style: { [k: string]: string } = { zIndex: String(this.baseZ() + 1) };
    const isMobile = this.isMobileDevice();
    
    // 使用当前尺寸或默认尺寸
    let val = this.currentSize || this.size;
    
    // 移动端特殊处理
    if (isMobile) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      if (this.placement === 'left' || this.placement === 'right') {
        // 移动端左右抽屉默认占 85% 宽度
        if (!this.currentSize) {
          val = Math.min(vw * 0.85, 400);
        }
        // 限制最大宽度
        if (typeof val === 'number' && val > vw * 0.9) {
          val = vw * 0.9;
        }
      } else {
        // 移动端上下抽屉默认占 70% 高度
        if (!this.currentSize) {
          val = vh * 0.7;
        }
        // 限制最大高度
        if (typeof val === 'number' && val > vh * 0.85) {
          val = vh * 0.85;
        }
      }
    }
    
    const sizeValue = typeof val === 'number' ? `${val}px` : (val || '').toString();
    
    if (this.placement === 'left' || this.placement === 'right') {
      style.width = sizeValue || '360px';
      // 移动端高度始终100%
      if (isMobile) {
        style.height = '100%';
      }
    } else {
      style.height = sizeValue || '360px';
      // 移动端宽度始终100%
      if (isMobile) {
        style.width = '100%';
      }
    }
    
    // 圆角
    if (this.rounded) {
      if (this.placement === 'left') {
        style.borderRadius = `0 ${this.borderRadius} ${this.borderRadius} 0`;
      } else if (this.placement === 'right') {
        style.borderRadius = `${this.borderRadius} 0 0 ${this.borderRadius}`;
      } else if (this.placement === 'top') {
        style.borderRadius = `0 0 ${this.borderRadius} ${this.borderRadius}`;
      } else if (this.placement === 'bottom') {
        style.borderRadius = `${this.borderRadius} ${this.borderRadius} 0 0`;
      }
    }
    
    // 拖动偏移
    if (this.isDragging && this.dragOffset > 0) {
      let transform = '';
      if (this.placement === 'left') transform = `translateX(-${this.dragOffset}px)`;
      else if (this.placement === 'right') transform = `translateX(${this.dragOffset}px)`;
      else if (this.placement === 'top') transform = `translateY(-${this.dragOffset}px)`;
      else if (this.placement === 'bottom') transform = `translateY(${this.dragOffset}px)`;
      style.transform = transform;
    }
    
    // 动画持续时间
    if (this.animation) {
      style.transitionDuration = `${this.animationDuration}ms`;
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

  private renderFooter() {
    const hasFooterSlot = !!this.el.querySelector('[slot="footer"]');
    if (!hasFooterSlot && this.footerButtons.length === 0) return null;

    return (
      <div class={{
        'ldesign-drawer__footer': true,
        'ldesign-drawer__footer--border': this.footerBorder
      }}>
        {hasFooterSlot ? (
          <slot name="footer" />
        ) : (
          <div class="ldesign-drawer__footer-buttons">
            {this.footerButtons.map(button => (
              <button
                class={{
                  'ldesign-drawer__footer-button': true,
                  [`ldesign-drawer__footer-button--${button.type || 'default'}`]: true,
                  'ldesign-drawer__footer-button--loading': button.loading,
                  'ldesign-drawer__footer-button--disabled': button.disabled
                }}
                disabled={button.disabled || button.loading}
                onClick={() => button.onClick && button.onClick()}
              >
                {button.loading && <span class="ldesign-drawer__button-spinner" />}
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  private renderResizeHandle() {
    // 移动端不显示调整手柄
    if (!this.resizable || this.isMobileDevice()) return null;

    const placement = this.placement;
    return (
      <div
        class={{
          'ldesign-drawer__resize-handle': true,
          [`ldesign-drawer__resize-handle--${placement}`]: true,
          'ldesign-drawer__resize-handle--active': this.isResizing
        }}
        title={this.showResizeHint ? '拖动调整大小' : ''}
      >
        <div class="ldesign-drawer__resize-line" />
        {this.showResizeHint && this.isResizing && (
          <div class="ldesign-drawer__resize-hint">
            {Math.round(this.getCurrentSizeInPixels())}px
          </div>
        )}
      </div>
    );
  }

  private renderSnapIndicator() {
    if (!this.showSnapIndicator || !this.currentSnapPoint) return null;

    return (
      <div class="ldesign-drawer__snap-indicator">
        <div class="ldesign-drawer__snap-label">
          {this.currentSnapPoint.label || `吸附到 ${this.currentSnapPoint.value}`}
        </div>
      </div>
    );
  }

  render() {
    // 注意：mask 元素每次渲染重新查询引用
    // 以便 handleMaskClick 判断点击来源
    setTimeout(() => {
      this.maskElement = this.el.querySelector('.ldesign-drawer__mask') as HTMLElement;
      this.panelElement = this.el.querySelector('.ldesign-drawer__panel') as HTMLElement;
      this.resizeHandleElement = this.el.querySelector('.ldesign-drawer__resize-handle') as HTMLElement;
    }, 0);

    return (
      <Host>
        <div class={this.getRootClasses()} style={this.getRootStyle()} role="dialog" aria-modal="true" aria-hidden={this.isVisible ? 'false' : 'true'}>
          {this.mask && (
            <div class={{
              'ldesign-drawer__mask': true,
              'ldesign-drawer__mask--transparent': this.isDragging
            }} onClick={this.handleMaskClick}></div>
          )}
          <div class={{
            'ldesign-drawer__panel': true,
            'ldesign-drawer__panel--open': this.isPanelOpen,
            'ldesign-drawer__panel--closing': this.isClosing,
            [`ldesign-drawer__panel--${this.placement}`]: true,
            'ldesign-drawer__panel--rounded': this.rounded,
            'ldesign-drawer__panel--resizing': this.isResizing,
            'ldesign-drawer__panel--dragging': this.isDragging,
          }} style={this.panelStyle()}>
            {this.renderResizeHandle()}
            <div class="ldesign-drawer__content">
              {this.renderHeader()}
              <div class="ldesign-drawer__body">
                <slot />
              </div>
              {this.renderFooter()}
            </div>
            {this.renderSnapIndicator()}
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
    // 根节点需要携带实例化的 z-index，确保多层时按栈顶顺序覆盖
    const style: { [k: string]: string } = { zIndex: String(this.baseZ()) };
    // 在容器内使用绝对定位以铺满容器
    if (this.isInContainer()) {
      style.position = 'absolute';
    }
    return style;
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

  // ── 调整大小功能 ──────────────────────────────────────────────
  private initResize() {
    if (!this.resizable || !this.resizeHandleElement) return;

    // 鼠标事件
    this.resizeHandleElement.addEventListener('mousedown', this.handleResizeMouseDown);
    // 触摸事件
    this.resizeHandleElement.addEventListener('touchstart', this.handleResizeTouchStart, { passive: false });
  }

  private cleanupResize() {
    if (this.resizeHandleElement) {
      this.resizeHandleElement.removeEventListener('mousedown', this.handleResizeMouseDown);
      this.resizeHandleElement.removeEventListener('touchstart', this.handleResizeTouchStart);
    }
    document.removeEventListener('mousemove', this.handleResizeMouseMove);
    document.removeEventListener('mouseup', this.handleResizeMouseUp);
    document.removeEventListener('touchmove', this.handleResizeTouchMove);
    document.removeEventListener('touchend', this.handleResizeTouchEnd);
  }

  private handleResizeMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.startResize(e.clientX, e.clientY);
    document.addEventListener('mousemove', this.handleResizeMouseMove);
    document.addEventListener('mouseup', this.handleResizeMouseUp);
  };

  private handleResizeMouseMove = (e: MouseEvent) => {
    this.doResize(e.clientX, e.clientY);
  };

  private handleResizeMouseUp = () => {
    this.endResize();
    document.removeEventListener('mousemove', this.handleResizeMouseMove);
    document.removeEventListener('mouseup', this.handleResizeMouseUp);
  };

  private handleResizeTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    this.startResize(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', this.handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleResizeTouchEnd);
  };

  private handleResizeTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    this.doResize(touch.clientX, touch.clientY);
  };

  private handleResizeTouchEnd = () => {
    this.endResize();
    document.removeEventListener('touchmove', this.handleResizeTouchMove);
    document.removeEventListener('touchend', this.handleResizeTouchEnd);
  };

  private startResize(x: number, y: number) {
    this.isResizing = true;
    this.startPosition = { x, y };
    const currentSize = this.getCurrentSizeInPixels();
    this.startSize = currentSize;
    this.ldesignResizeStart.emit();
  }

  private doResize(x: number, y: number) {
    if (!this.isResizing) return;

    let delta = 0;
    if (this.placement === 'left') {
      delta = x - this.startPosition.x;
    } else if (this.placement === 'right') {
      delta = this.startPosition.x - x;
    } else if (this.placement === 'top') {
      delta = y - this.startPosition.y;
    } else if (this.placement === 'bottom') {
      delta = this.startPosition.y - y;
    }

    // 应用阻尼效果
    if (this.damping) {
      delta = delta * this.dampingFactor;
    }

    let newSize = this.startSize + delta;
    
    // 限制尺寸范围
    const min = this.parseSize(this.minSize);
    const max = this.parseSize(this.maxSize);
    newSize = Math.max(min, Math.min(max, newSize));

    // 检查吸附点
    if (this.snapPoints.length > 0) {
      for (const point of this.snapPoints) {
        const snapValue = this.parseSize(point.value);
        if (Math.abs(newSize - snapValue) < this.snapThreshold) {
          newSize = snapValue;
          if (this.currentSnapPoint !== point) {
            this.currentSnapPoint = point;
            this.showSnapIndicator = true;
            this.ldesignSnapToPoint.emit(point);
            setTimeout(() => {
              this.showSnapIndicator = false;
            }, 1000);
          }
          break;
        }
      }
    }

    this.currentSize = `${newSize}px`;
    this.ldesignSizeChange.emit({ size: this.currentSize, placement: this.placement });
  }

  private endResize() {
    this.isResizing = false;
    this.currentSnapPoint = null;
    this.showSnapIndicator = false;
    this.ldesignResizeEnd.emit({ size: this.currentSize });
  }

  // ── 手势功能 ──────────────────────────────────────────────
  private initSwipeGestures() {
    if (!this.panelElement) return;
    this.panelElement.addEventListener('touchstart', this.handleSwipeStart, { passive: false });
  }

  private cleanupSwipeGestures() {
    if (this.panelElement) {
      this.panelElement.removeEventListener('touchstart', this.handleSwipeStart);
    }
    document.removeEventListener('touchmove', this.handleSwipeMove);
    document.removeEventListener('touchend', this.handleSwipeEnd);
  }

  private handleSwipeStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    this.touchStartTime = Date.now();
    this.isDragging = true;
    document.addEventListener('touchmove', this.handleSwipeMove, { passive: false });
    document.addEventListener('touchend', this.handleSwipeEnd);
  };

  private handleSwipeMove = (e: TouchEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    let offset = 0;
    if (this.placement === 'left' || this.placement === 'right') {
      offset = touch.clientX - this.touchStartPosition.x;
    } else {
      offset = touch.clientY - this.touchStartPosition.y;
    }

    // 只允许向关闭方向拖动
    if (
      (this.placement === 'left' && offset < 0) ||
      (this.placement === 'right' && offset > 0) ||
      (this.placement === 'top' && offset < 0) ||
      (this.placement === 'bottom' && offset > 0)
    ) {
      this.dragOffset = Math.abs(offset);
    }
  };

  private handleSwipeEnd = () => {
    if (!this.isDragging) return;
    
    const panelSize = this.getCurrentSizeInPixels();
    const threshold = panelSize * this.swipeThreshold;
    const velocity = this.calculateVelocity();

    if (this.dragOffset > threshold || velocity > 0.5) {
      this.close();
    } else {
      // 弹回动画
      this.animateBack();
    }

    this.isDragging = false;
    this.dragOffset = 0;
    document.removeEventListener('touchmove', this.handleSwipeMove);
    document.removeEventListener('touchend', this.handleSwipeEnd);
  };

  private animateBack() {
    const animate = () => {
      this.dragOffset = this.dragOffset * 0.8;
      if (this.dragOffset > 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.dragOffset = 0;
      }
    };
    animate();
  }

  private calculateVelocity(): number {
    const duration = Date.now() - this.touchStartTime;
    return this.dragOffset / duration;
  }

  // ── 键盘导航 ──────────────────────────────────────────────
  private initKeyboardNavigation() {
    this.el.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  private handleKeyboardNavigation = (e: KeyboardEvent) => {
    if (!this.keyboardNavigation || !this.isVisible) return;

    // Tab 键循环焦点
    if (e.key === 'Tab') {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length === 0) return;

      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = focusableElements.indexOf(activeElement);

      if (e.shiftKey) {
        // Shift+Tab: 向前
        if (currentIndex <= 0) {
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
      } else {
        // Tab: 向后
        if (currentIndex === focusableElements.length - 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
      }
    }

    // Arrow keys for resize
    if (this.resizable && e.ctrlKey) {
      const step = e.shiftKey ? 50 : 10;
      let newSize = this.getCurrentSizeInPixels();

      if (
        (this.placement === 'left' || this.placement === 'right') &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        e.preventDefault();
        newSize += e.key === 'ArrowRight' ? step : -step;
        this.currentSize = `${Math.max(this.parseSize(this.minSize), Math.min(this.parseSize(this.maxSize), newSize))}px`;
        this.ldesignSizeChange.emit({ size: this.currentSize, placement: this.placement });
      } else if (
        (this.placement === 'top' || this.placement === 'bottom') &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown')
      ) {
        e.preventDefault();
        newSize += e.key === 'ArrowDown' ? step : -step;
        this.currentSize = `${Math.max(this.parseSize(this.minSize), Math.min(this.parseSize(this.maxSize), newSize))}px`;
        this.ldesignSizeChange.emit({ size: this.currentSize, placement: this.placement });
      }
    }
  };

  private getFocusableElements(): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.el.querySelectorAll(selector));
  }

  private focusFirstElement() {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      setTimeout(() => focusableElements[0].focus(), 100);
    }
  }

  // ── 工具方法 ──────────────────────────────────────────────
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  private handleResize = () => {
    // 窗口大小变化时重新计算
    if (this.isVisible && this.isMobileDevice()) {
      // 触发重新渲染
      this.el.forceUpdate();
    }
  };

  private getCurrentSizeInPixels(): number {
    const current = this.currentSize || this.size;
    return this.parseSize(current);
  }

  private parseSize(size: number | string): number {
    if (typeof size === 'number') return size;
    if (typeof size === 'string') {
      if (size.endsWith('%')) {
        const percentage = parseFloat(size) / 100;
        return this.placement === 'left' || this.placement === 'right'
          ? window.innerWidth * percentage
          : window.innerHeight * percentage;
      }
      return parseFloat(size) || 360;
    }
    return 360;
  }

}
