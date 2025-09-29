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
  icon?: string; // 按钮图标
}

// 加载状态配置
export interface LoadingConfig {
  show: boolean;
  text?: string;
  spinner?: boolean;
}

// 头部配置
export interface HeaderConfig {
  title?: string;
  subtitle?: string;
  icon?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: Array<{
    icon: string;
    tooltip?: string;
    onClick: () => void;
  }>;
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

  /** 是否可调整大小（桌面端和移动端统一配置） */
  @Prop() resizable: boolean = false;
  
  /** 调整大小的手柄位置（'edge' | 'handle'） */
  @Prop() resizeMode: 'edge' | 'handle' = 'edge';

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

  /** 是否启用滑动关闭（支持所有方向） */
  @Prop() swipeToClose: boolean = true;

  /** 滑动关闭的阈值（百分比） */
  @Prop() swipeThreshold: number = 0.3;
  
  /** 滑动关闭的触发区域（'anywhere' | 'handle' | 'header'） */
  @Prop() swipeTriggerArea: 'anywhere' | 'handle' | 'header' = 'handle';
  
  /** 拖动手柄的高度（像素，用于 handle 模式） */
  @Prop() handleHeight: number = 40;

  /** 是否显示进入/退出动画 */
  @Prop() animation: boolean = true;

  /** 动画持续时间（毫秒） */
  @Prop() animationDuration: number = 300;

  /** 是否在关闭时保留状态 */
  @Prop() preserveState: boolean = false;

  /** 是否显示头部分割线 */
  @Prop() headerBorder: boolean = true;

  /** 内容区域内边距 */
  @Prop() bodyPadding: string | boolean = true;

  /** 是否全屏显示 */
  @Prop() fullscreen: boolean = false;

  /** 是否可以全屏切换 */
  @Prop() fullscreenable: boolean = false;

  /** 加载状态配置 */
  @Prop() loading: LoadingConfig | boolean = false;

  /** 头部高级配置 */
  @Prop() headerConfig: HeaderConfig = {};

  /** 是否显示进度条 */
  @Prop() showProgress: boolean = false;

  /** 进度条百分比 */
  @Prop() progressPercent: number = 0;

  /** 自定义类名 */
  @Prop() customClass: string = '';

  /** 是否启用暗黑模式 */
  @Prop() darkMode: boolean = false;

  /** 打开时的回调 */
  @Prop() onOpen: () => void | Promise<void>;

  /** 关闭前的钩子（返回false阻止关闭） */
  @Prop() beforeClose: () => boolean | Promise<boolean>;

  /** 是否显示最小化按钮 */
  @Prop() minimizable: boolean = false;

  /** 是否处于最小化状态 */
  @Prop() minimized: boolean = false;

  /** 抽屉层级模式（normal | high | top） */
  @Prop() level: 'normal' | 'high' | 'top' = 'normal';

  /** 内容延迟加载（毫秒） */
  @Prop() lazyLoad: number = 0;

  /** 是否启用虚拟滚动（适用于大量内容） */
  @Prop() virtualScroll: boolean = false;

  /** 是否显示内容区域边框 */
  @Prop() contentBorder: boolean = false;

  /** 是否启用内容区域阴影 */
  @Prop() contentShadow: boolean = false;

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

  /** 内部状态：是否全屏 */
  @State() isFullscreen: boolean = false;

  /** 内部状态：是否最小化 */
  @State() isMinimized: boolean = false;

  /** 内部状态：内容是否加载 */
  @State() contentLoaded: boolean = false;

  /** 内部状态：当前加载状态 */
  @State() isLoading: boolean = false;

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

  /** 事件：全屏切换 */
  @Event() ldesignFullscreenChange: EventEmitter<boolean>;

  /** 事件：最小化切换 */
  @Event() ldesignMinimizeChange: EventEmitter<boolean>;

  /** 事件：加载状态变化 */
  @Event() ldesignLoadingChange: EventEmitter<boolean>;

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
    // 统一处理调整大小功能
    if (this.resizable) {
      this.initResize();
    }
    // 统一处理滑动关闭功能
    if (this.swipeToClose) {
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
    // 不再锁定页面滚动，让页面内容保持可滚动
    // 只在容器模式下限制容器滚动
    if (this.isInContainer()) {
      const c = this.containerEl as HTMLElement;
      if (c) this.applyContainerOverflow(c);
      this.bindScrollLock();
    }
    // 移除页面滚动锁定，避免压缩页面内容
  }

  private enableBodyScroll() {
    if (this.isInContainer()) {
      this.unbindScrollLock();
      const c = this.containerEl as HTMLElement;
      if (c) this.restoreContainerOverflow(c);
    }
    // 移除页面滚动解锁，因为我们不再锁定它
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
    
    // 重置状态
    this.dragOffset = 0;
    this.isDragging = false;
    if (this.fullscreen) {
      this.isFullscreen = true;
    }
    if (this.minimized) {
      this.isMinimized = true;
    }
    
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
    // 执行关闭前钩子
    if (this.beforeClose) {
      const canClose = await this.beforeClose();
      if (!canClose) return;
    }
    this.ldesignClose.emit();
    await this.hide();
  }

  /** 切换全屏 */
  @Method()
  async toggleFullscreen() {
    if (!this.fullscreenable) return;
    this.isFullscreen = !this.isFullscreen;
    this.ldesignFullscreenChange.emit(this.isFullscreen);
    
    if (this.isFullscreen) {
      // 保存当前尺寸
      this.beforeFullscreenSize = this.currentSize;
      this.currentSize = '100%';
    } else {
      // 恢复之前的尺寸
      this.currentSize = this.beforeFullscreenSize || this.size;
    }
  }

  /** 切换最小化 */
  @Method()
  async toggleMinimize() {
    if (!this.minimizable) return;
    this.isMinimized = !this.isMinimized;
    this.ldesignMinimizeChange.emit(this.isMinimized);
  }

  /** 设置加载状态 */
  @Method()
  async setLoading(loading: boolean | LoadingConfig) {
    this.loading = loading;
    this.isLoading = typeof loading === 'boolean' ? loading : loading.show;
    this.ldesignLoadingChange.emit(this.isLoading);
  }

  /** 更新进度 */
  @Method()
  async updateProgress(percent: number) {
    this.progressPercent = Math.max(0, Math.min(100, percent));
  }

  private beforeFullscreenSize: number | string;

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
    if (this.isFullscreen || this.fullscreen) classes.push('ldesign-drawer--fullscreen');
    if (this.isMinimized) classes.push('ldesign-drawer--minimized');
    if (this.darkMode) classes.push('ldesign-drawer--dark');
    if (this.isLoading) classes.push('ldesign-drawer--loading');
    if (this.customClass) classes.push(this.customClass);
    
    // 层级模式
    classes.push(`ldesign-drawer--level-${this.level}`);
    
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
    const config = this.headerConfig || {};
    
    if (!this.drawerTitle && !config.title && !this.closable && !hasHeaderSlot && !this.fullscreenable && !this.minimizable) {
      return null;
    }
    
    return (
      <div class={{
        'ldesign-drawer__header': true,
        'ldesign-drawer__header--border': this.headerBorder
      }}>
        {/* 返回按钮 */}
        {config.showBack && (
          <button class="ldesign-drawer__back" onClick={() => config.onBack && config.onBack()}>
            <ldesign-icon name="arrow-left"></ldesign-icon>
          </button>
        )}
        
        {/* 图标 */}
        {config.icon && (
          <div class="ldesign-drawer__header-icon">
            <ldesign-icon name={config.icon}></ldesign-icon>
          </div>
        )}
        
        {/* 标题区域 */}
        <div class="ldesign-drawer__title-wrapper">
          <div class="ldesign-drawer__title">
            {hasHeaderSlot ? <slot name="header" /> : (config.title || this.drawerTitle || '')}
          </div>
          {config.subtitle && (
            <div class="ldesign-drawer__subtitle">{config.subtitle}</div>
          )}
        </div>
        
        {/* 操作按钮区域 */}
        <div class="ldesign-drawer__header-actions">
          {/* 自定义操作按钮 */}
          {config.actions?.map(action => (
            <button 
              class="ldesign-drawer__action" 
              title={action.tooltip}
              onClick={() => action.onClick()}
            >
              <ldesign-icon name={action.icon}></ldesign-icon>
            </button>
          ))}
          
          {/* 最小化按钮 */}
          {this.minimizable && (
            <button 
              class="ldesign-drawer__minimize" 
              aria-label="Minimize"
              onClick={() => this.toggleMinimize()}
            >
              <ldesign-icon name={this.isMinimized ? 'maximize-2' : 'minimize-2'}></ldesign-icon>
            </button>
          )}
          
          {/* 全屏按钮 */}
          {this.fullscreenable && (
            <button 
              class="ldesign-drawer__fullscreen" 
              aria-label="Fullscreen"
              onClick={() => this.toggleFullscreen()}
            >
              <ldesign-icon name={this.isFullscreen ? 'minimize' : 'maximize'}></ldesign-icon>
            </button>
          )}
          
          {/* 关闭按钮 */}
          {this.closable && (
            <button class="ldesign-drawer__close" aria-label="Close" onClick={() => this.close()}>
              <ldesign-icon name="x"></ldesign-icon>
            </button>
          )}
        </div>
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
                  'ldesign-drawer__footer-button--disabled': button.disabled,
                  'ldesign-drawer__footer-button--with-icon': !!button.icon
                }}
                disabled={button.disabled || button.loading}
                onClick={() => button.onClick && button.onClick()}
              >
                {button.loading && <span class="ldesign-drawer__button-spinner" />}
                {button.icon && !button.loading && (
                  <ldesign-icon name={button.icon} class="ldesign-drawer__button-icon" />
                )}
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  private renderResizeHandle() {
    // 统一显示调整手柄（桌面端和移动端）
    if (!this.resizable || this.resizeMode !== 'edge') return null;

    const placement = this.placement;
    return (
      <div
        class={{
          'ldesign-drawer__resize-handle': true,
          [`ldesign-drawer__resize-handle--${placement}`]: true,
          'ldesign-drawer__resize-handle--active': this.isResizing,
          'ldesign-drawer__resize-handle--mobile': this.isMobileDevice()
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
  
  private renderSwipeHandle() {
    // 渲染滑动手柄区域（用于 swipeTriggerArea === 'handle' 模式）
    if (!this.swipeToClose || this.swipeTriggerArea !== 'handle') return null;
    
    const placement = this.placement;
    
    return (
      <div 
        class={{
          'ldesign-drawer__swipe-handle': true,
          [`ldesign-drawer__swipe-handle--${placement}`]: true,
          'ldesign-drawer__swipe-handle--dragging': this.isDragging
        }}
        style={{ 
          height: placement === 'top' || placement === 'bottom' ? `${this.handleHeight}px` : undefined,
          width: placement === 'left' || placement === 'right' ? `${this.handleHeight}px` : undefined
        }}
      >
        <div class="ldesign-drawer__swipe-handle-bar" />
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

  private renderProgress() {
    if (!this.showProgress) return null;
    
    return (
      <div class="ldesign-drawer__progress">
        <div 
          class="ldesign-drawer__progress-bar" 
          style={{ width: `${this.progressPercent}%` }}
        />
      </div>
    );
  }

  private renderLoading() {
    if (!this.isLoading) return null;
    
    const config = typeof this.loading === 'object' ? this.loading : { show: true, spinner: true };
    
    return (
      <div class="ldesign-drawer__loading">
        {config.spinner !== false && (
          <div class="ldesign-drawer__loading-spinner">
            <div class="ldesign-drawer__loading-spin" />
          </div>
        )}
        {config.text && (
          <div class="ldesign-drawer__loading-text">{config.text}</div>
        )}
      </div>
    );
  }

  private renderBody() {
    const getPadding = () => {
      if (this.bodyPadding === false) return '0';
      if (typeof this.bodyPadding === 'string') return this.bodyPadding;
      return '16px 20px';
    };

    return (
      <div class={{
        'ldesign-drawer__body': true,
        'ldesign-drawer__body--border': this.contentBorder,
        'ldesign-drawer__body--shadow': this.contentShadow,
        'ldesign-drawer__body--virtual': this.virtualScroll
      }} style={{ padding: getPadding() }}>
        {this.isLoading ? (
          this.renderLoading()
        ) : this.lazyLoad && !this.contentLoaded ? (
          <div class="ldesign-drawer__lazy-placeholder">
            <div class="ldesign-drawer__lazy-loading">加载中...</div>
          </div>
        ) : (
          <slot />
        )}
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
      
      // 延迟加载内容
      if (this.lazyLoad && !this.contentLoaded && this.isVisible) {
        setTimeout(() => {
          this.contentLoaded = true;
        }, this.lazyLoad);
      }
    }, 0);

    // 执行打开回调
    if (this.isVisible && this.onOpen) {
      setTimeout(() => this.onOpen(), 50);
    }

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
            'ldesign-drawer__panel--fullscreen': this.isFullscreen || this.fullscreen,
            'ldesign-drawer__panel--minimized': this.isMinimized,
          }} style={this.panelStyle()}>
            {this.renderResizeHandle()}
            {this.renderSwipeHandle()}
            {this.renderProgress()}
            <div class="ldesign-drawer__content">
              {this.renderHeader()}
              {this.renderBody()}
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
    e.stopPropagation();
    this.startResize(e.clientX, e.clientY);
    document.addEventListener('mousemove', this.handleResizeMouseMove);
    document.addEventListener('mouseup', this.handleResizeMouseUp);
    // 添加临时样式防止选中文本
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.placement === 'left' || this.placement === 'right' ? 'col-resize' : 'row-resize';
  };

  private handleResizeMouseMove = (e: MouseEvent) => {
    this.doResize(e.clientX, e.clientY);
  };

  private handleResizeMouseUp = () => {
    this.endResize();
    document.removeEventListener('mousemove', this.handleResizeMouseMove);
    document.removeEventListener('mouseup', this.handleResizeMouseUp);
    // 恢复样式
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  private handleResizeTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    this.startResize(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', this.handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleResizeTouchEnd);
    document.addEventListener('touchcancel', this.handleResizeTouchEnd);
    // 移动端也禁用文本选择
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
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
    document.removeEventListener('touchcancel', this.handleResizeTouchEnd);
    // 恢复样式
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  };

  private startResize(x: number, y: number) {
    this.isResizing = true;
    this.startPosition = { x, y };
    const currentSize = this.getCurrentSizeInPixels();
    this.startSize = currentSize;
    // 获取当前面板元素并保存引用
    if (!this.panelElement) {
      this.panelElement = this.el.querySelector('.ldesign-drawer__panel') as HTMLElement;
    }
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

    let newSize = this.startSize + delta;
    
    // 获取限制范围
    const min = this.parseSize(this.minSize);
    const max = this.parseSize(this.maxSize);
    
    // 在边界处应用阻尼效果
    if (this.damping) {
      if (newSize < min) {
        // 超出最小值时的阻尼
        const overMin = min - newSize;
        newSize = min - overMin * this.dampingFactor;
      } else if (newSize > max) {
        // 超出最大值时的阻尼
        const overMax = newSize - max;
        newSize = max + overMax * this.dampingFactor;
      }
    } else {
      // 不启用阻尼时直接限制
      newSize = Math.max(min, Math.min(max, newSize));
    }

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
    // 立即更新样式，不等待下一帧
    if (this.panelElement) {
      if (this.placement === 'left' || this.placement === 'right') {
        this.panelElement.style.width = `${newSize}px`;
      } else {
        this.panelElement.style.height = `${newSize}px`;
      }
    }
    this.ldesignSizeChange.emit({ size: this.currentSize, placement: this.placement });
  }

  private endResize() {
    if (!this.isResizing) return;
    this.isResizing = false;
    this.currentSnapPoint = null;
    this.showSnapIndicator = false;
    // 确保最终尺寸在范围内
    const min = this.parseSize(this.minSize);
    const max = this.parseSize(this.maxSize);
    const currentPixels = this.getCurrentSizeInPixels();
    const finalSize = Math.max(min, Math.min(max, currentPixels));
    if (finalSize !== currentPixels) {
      this.currentSize = `${finalSize}px`;
      if (this.panelElement) {
        if (this.placement === 'left' || this.placement === 'right') {
          this.panelElement.style.width = `${finalSize}px`;
        } else {
          this.panelElement.style.height = `${finalSize}px`;
        }
      }
    }
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
    const target = e.target as HTMLElement;
    
    // 根据 swipeTriggerArea 配置决定是否允许拖动
    if (this.swipeTriggerArea === 'handle') {
      // 只在手柄区域允许拖动
      const isSwipeHandle = target.closest('.ldesign-drawer__swipe-handle');
      if (!isSwipeHandle) return;
    } else if (this.swipeTriggerArea === 'header') {
      // 只在头部区域允许拖动
      const isHeader = target.closest('.ldesign-drawer__header');
      if (!isHeader) return;
    }
    // swipeTriggerArea === 'anywhere' 时任何位置都可以拖动
    
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
      // 触发重新渲染 - 使用状态更新来触发重渲染
      this.currentSize = this.currentSize || this.size;
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
