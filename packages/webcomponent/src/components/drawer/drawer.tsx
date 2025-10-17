import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import {
  DrawerPlacement,
  DrawerState,
  CloseReason,
  DrawerButton,
  LoadingConfig,
  HeaderConfig,
  FooterConfig,
  AnimationConfig,
  ResizeConfig,
  SwipeConfig,
  KeyboardConfig,
  SnapPoint,
  DrawerTheme,
  DrawerLevel,
  SizePreset,
} from './drawer.types';
import {
  parseSize,
  calculateActualSize,
  getTransformStyle,
  getAnimationClass,
  getEasingFunction,
  lockPageScroll,
  unlockPageScroll,
  addToStack,
  removeFromStack,
  isTopDrawer,
  findNearestSnapPoint,
  calculateVelocity,
  shouldTriggerSwipeClose,
  debounce,
  throttle,
  trapFocus,
  releaseFocusTrap,
  getContainer,
  generateId,
  isMobile,
  isTouch,
  getEventCoordinates,
  waitForAnimation,
  emitCustomEvent,
} from './drawer.utils';

/**
 * @slot - 抽屉主内容区域
 * @slot header - 自定义头部内容
 * @slot footer - 自定义底部内容
 * @slot loading - 自定义加载状态
 * @slot extra - 头部右侧额外内容
 */
@Component({
  tag: 'ldesign-drawer',
  styleUrl: 'drawer.less',
  shadow: true,
})
export class LdesignDrawer {
  @Element() el!: HTMLElement;

  // ==================== 基础属性 ====================

  /** 是否显示抽屉 */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /** 抽屉位置 */
  @Prop() placement: DrawerPlacement = 'right';

  /** 抽屉大小 */
  @Prop() size: number | string | SizePreset = 'md';

  /** 是否显示遮罩 */
  @Prop() mask: boolean = true;

  /** 点击遮罩是否关闭 */
  @Prop() maskClosable: boolean = true;

  /** 遮罩样式类名 */
  @Prop() maskClass: string = '';

  /** 是否显示关闭按钮 */
  @Prop() closable: boolean = true;

  /** z-index 层级 */
  @Prop() zIndex: number = 1000;

  /** 容器选择器或元素 */
  @Prop() container?: string | HTMLElement;

  /** 自定义类名 */
  @Prop() customClass: string = '';

  /** 主题 */
  @Prop() theme: DrawerTheme = 'light';

  /** 抽屉层级 */
  @Prop() level: DrawerLevel = 'normal';

  // ==================== 标题和内容 ====================

  /** 标题 */
  @Prop() drawerTitle?: string;

  /** 副标题 */
  @Prop() subtitle?: string;

  /** 标题图标 */
  @Prop() icon?: string;

  /** 是否显示返回按钮 */
  @Prop() showBack: boolean = false;

  /** 内容内边距 */
  @Prop() padding: string | boolean = true;

  // ==================== 动画配置 ====================

  /** 是否启用动画 */
  @Prop() animation: boolean = true;

  /** 动画类型 */
  @Prop() animationType: string = 'slide';

  /** 动画持续时间（毫秒） */
  @Prop() animationDuration: number = 300;

  /** 动画缓动函数 */
  @Prop() animationEasing: string = 'ease-in-out';

  // ==================== 调整大小 ====================

  /** 是否可调整大小 */
  @Prop() resizable: boolean = false;

  /** 最小尺寸 */
  @Prop() minSize: number | string = 200;

  /** 最大尺寸 */
  @Prop() maxSize: number | string = '90%';

  /** 吸附点 */
  @Prop() snapPoints: SnapPoint[] = [];

  /** 吸附阈值 */
  @Prop() snapThreshold: number = 30;

  /** 是否显示尺寸提示 */
  @Prop() showSizeHint: boolean = true;

  // ==================== 滑动关闭 ====================

  /** 是否启用滑动关闭 */
  @Prop() swipeToClose: boolean = false;

  /** 滑动阈值（0-1） */
  @Prop() swipeThreshold: number = 0.3;

  /** 滑动触发区域 */
  @Prop({ mutable: true }) swipeTriggerArea: 'anywhere' | 'handle' | 'header' | 'edge' = 'edge';

  // ==================== 键盘和无障碍 ====================

  /** 按 ESC 关闭 */
  @Prop() closeOnEsc: boolean = true;

  /** 自动聚焦 */
  @Prop() autoFocus: boolean = true;

  /** 焦点捕获 */
  @Prop() focusTrap: boolean = true;

  /** 恢复焦点 */
  @Prop() restoreFocus: boolean = true;

  /** ARIA 标签 */
  @Prop() ariaLabelText?: string;

  // ==================== 样式定制 ====================

  /** 是否启用圆角 */
  @Prop() rounded: boolean = true;

  /** 圆角大小 */
  @Prop() borderRadius: string = '8px';

  /** 是否全屏 */
  @Prop() fullscreen: boolean = false;

  /** 是否可全屏切换 */
  @Prop() fullscreenable: boolean = false;

  /** 是否可最小化 */
  @Prop() minimizable: boolean = false;

  /** 是否可最大化 */
  @Prop() maximizable: boolean = false;

  // ==================== 底部按钮 ====================

  /** 底部按钮配置 */
  @Prop() footerButtons: DrawerButton[] = [];

  /** 底部按钮对齐方式 */
  @Prop() footerAlign: 'left' | 'center' | 'right' | 'space-between' = 'right';

  /** 是否显示底部边框 */
  @Prop() footerBorder: boolean = true;

  // ==================== 头部配置 ====================

  /** 是否显示头部边框 */
  @Prop() headerBorder: boolean = true;

  /** 头部是否吸顶 */
  @Prop() headerSticky: boolean = false;

  // ==================== 加载状态 ====================

  /** 是否显示加载状态 */
  @Prop() loading: boolean = false;

  /** 加载文本 */
  @Prop() loadingText: string = '加载中...';

  // ==================== 高级功能 ====================

  /** 关闭时销毁 */
  @Prop() destroyOnClose: boolean = false;

  /** 是否锁定页面滚动 */
  @Prop() lockScroll: boolean = true;

  /** 性能优化：使用 transform */
  @Prop() useTransform: boolean = true;

  /** 性能优化：GPU 加速 */
  @Prop() gpuAcceleration: boolean = true;
  
  /** 性能优化：使用虚拟滚动 */
  @Prop() virtualScroll: boolean = false;
  
  /** 性能优化：懒加载内容 */
  @Prop() lazyLoad: boolean = false;
  
  /** 性能优化：使用 CSS contain */
  @Prop() cssContain: boolean = true;

  // ==================== 状态 ====================

  @State() currentState: DrawerState = 'closed';
  @State() currentSize: string = '400px';
  @State() isResizing: boolean = false;
  @State() isSwiping: boolean = false;
  @State() swipeProgress: number = 0;
  @State() isMinimized: boolean = false;
  @State() isMaximized: boolean = false;
  @State() isFullscreen: boolean = false;
  @State() isAnimating: boolean = false; // 用于控制动画触发
  @State() isMobileDevice: boolean = false; // 是否为移动设备
  @State() touchStartX: number = 0; // 触摸起始点
  @State() touchStartY: number = 0;
  @State() isDragging: boolean = false; // 是否正在拖动

  // ==================== 事件 ====================

  /** 打开前触发 */
  @Event() drawerBeforeOpen!: EventEmitter<void>;

  /** 打开后触发 */
  @Event() drawerOpen!: EventEmitter<void>;

  /** 关闭前触发 */
  @Event() drawerBeforeClose!: EventEmitter<{ reason: CloseReason }>;

  /** 关闭后触发 */
  @Event() drawerClose!: EventEmitter<{ reason: CloseReason }>;

  /** 状态变化 */
  @Event() drawerStateChange!: EventEmitter<{ state: DrawerState }>;

  /** 大小变化 */
  @Event() drawerResize!: EventEmitter<{ drawerWidth: number; drawerHeight: number }>;

  /** 滑动进度变化 */
  @Event() drawerSwipe!: EventEmitter<{ progress: number }>;

  // ==================== 私有属性 ====================

  private drawerId: string;
  private drawerRef!: HTMLDivElement;
  private contentRef!: HTMLDivElement;
  private resizeHandleRef?: HTMLDivElement;
  private containerElement?: HTMLElement;
  private previousFocusedElement?: HTMLElement;
  private resizeStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private resizeStartSize: number = 0;
  private swipeStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private swipeStartTime: number = 0;
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private touchVelocity: number = 0; // 触摸速度
  private lastTouchTime: number = 0;
  private lastTouchX: number = 0;
  private lastTouchY: number = 0;
  private rafId?: number; // RequestAnimationFrame ID
  private performanceMode: boolean = false; // 性能模式
  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;
  private contentLoaded: boolean = false;
  private throttledResize?: () => void;
  private throttledScroll?: () => void;

  // ==================== 生命周期 ====================

  componentWillLoad() {
    this.drawerId = generateId('ldesign-drawer');
    this.currentSize = parseSize(this.size, this.placement);
    
    // 检查用户是否明确指定了 swipeTriggerArea
    const hasUserSpecifiedTriggerArea = this.el.hasAttribute('swipe-trigger-area');
    
    // 检测移动设备
    this.isMobileDevice = this.detectMobileDevice();
    
    // 移动设备默认调整
    if (this.isMobileDevice) {
      this.adjustForMobile(hasUserSpecifiedTriggerArea);
    }
    
    // 初始化全屏状态
    this.isFullscreen = this.fullscreen;
    
    // 处理字符串 "false" 的情况（HTML 属性传递）
    // 在 HTML 中 visible="false" 会被当作字符串，需要转换为布尔值
    if (this.visible === 'false' as any || this.visible === false || !this.visible) {
      this.visible = false;
      this.currentState = 'closed';
    }
    
    // 性能模式检测
    this.performanceMode = this.shouldUsePerformanceMode();
    
  }

  componentDidLoad() {
    // 设置容器
    if (this.container) {
      this.containerElement = getContainer(this.container);
      if (this.containerElement !== document.body) {
        this.containerElement.appendChild(this.el);
      }
    }

    // 初始化可见状态
    if (this.visible) {
      this.handleOpen();
    }

    // 设置 resize observer
    this.setupResizeObserver();
    
    // 设置性能优化监听器
    this.setupPerformanceOptimizations();
    
    // 监听设备方向变化
    this.setupOrientationListener();
    
    // 设置视口变化监听
    this.setupViewportListener();
    
    // 关键修复：使用原生事件监听器绑定触摸事件
    // Shadow DOM 模式下 JSX 的事件绑定可能不可靠
    this.setupTouchListeners();
    
  }

  disconnectedCallback() {
    // 移除触摸事件监听器
    if (this.drawerRef) {
      this.drawerRef.removeEventListener('touchstart', this.handleSwipeStart as any);
      this.drawerRef.removeEventListener('touchmove', this.handleSwipeMove as any);
      this.drawerRef.removeEventListener('touchend', this.handleSwipeEnd as any);
    }
    
    this.cleanup();
  }

  // ==================== Watch ====================

  @Watch('visible')
  handleVisibleChange(newValue: boolean, oldValue: boolean) {
    if (newValue === oldValue) return;

    if (newValue) {
      this.handleOpen();
    } else {
      this.handleClose('api');
    }
  }

  @Watch('size')
  handleSizeChange(newValue: number | string | SizePreset) {
    this.currentSize = parseSize(newValue, this.placement);
    this.emitResizeEvent();
  }

  @Watch('fullscreen')
  handleFullscreenChange(newValue: boolean) {
    this.isFullscreen = newValue;
  }

  // ==================== 公开方法 ====================

  /** 打开抽屉 */
  @Method()
  async open() {
    if (this.currentState === 'open' || this.currentState === 'opening') {
      return;
    }

    this.visible = true;
  }

  /** 关闭抽屉 */
  @Method()
  async close(reason: CloseReason = 'api') {
    if (this.currentState === 'closed' || this.currentState === 'closing') {
      return;
    }

    await this.handleClose(reason);
  }

  /** 切换显示状态 */
  @Method()
  async toggle() {
    if (this.visible) {
      await this.close();
    } else {
      await this.open();
    }
  }

  /** 最小化 */
  @Method()
  async minimize() {
    this.isMinimized = true;
    this.currentState = 'minimized';
    this.drawerStateChange.emit({ state: 'minimized' });
  }

  /** 最大化 */
  @Method()
  async maximize() {
    this.isMaximized = true;
    this.currentState = 'maximized';
    this.drawerStateChange.emit({ state: 'maximized' });
  }

  /** 恢复 */
  @Method()
  async restore() {
    this.isMinimized = false;
    this.isMaximized = false;
    this.currentState = 'open';
    this.drawerStateChange.emit({ state: 'open' });
  }

  /** 调整大小 */
  @Method()
  async resize(size: number | string) {
    this.currentSize = parseSize(size, this.placement);
    this.emitResizeEvent();
  }

  /** 吸附到指定点 */
  @Method()
  async snapTo(point: SnapPoint) {
    const containerSize = this.getContainerSize();
    const newSize = calculateActualSize(
      `${point.value}px`,
      containerSize,
      this.minSize.toString(),
      this.maxSize.toString()
    );
    this.currentSize = `${newSize}px`;
    this.emitResizeEvent();
  }

  /** 显示加载状态 */
  @Method()
  async showLoading(text?: string) {
    this.loading = true;
    if (text) {
      this.loadingText = text;
    }
  }

  /** 隐藏加载状态 */
  @Method()
  async hideLoading() {
    this.loading = false;
  }

  /** 获取当前状态 */
  @Method()
  async getState(): Promise<DrawerState> {
    return this.currentState;
  }

  /** 获取当前尺寸 */
  @Method()
  async getSize(): Promise<{ drawerWidth: number; drawerHeight: number }> {
    if (!this.drawerRef) {
      return { drawerWidth: 0, drawerHeight: 0 };
    }

    return {
      drawerWidth: this.drawerRef.offsetWidth,
      drawerHeight: this.drawerRef.offsetHeight,
    };
  }

  // ==================== 私有方法 ====================

  private async handleOpen() {
    this.drawerBeforeOpen.emit();
    
    // 保存当前焦点元素
    if (this.restoreFocus) {
      this.previousFocusedElement = document.activeElement as HTMLElement;
    }

    // 添加到堆栈
    addToStack(this.el);

    // 锁定滚动
    if (this.lockScroll) {
      lockPageScroll();
    }

    // 第 1 步：设置为 opening 状态，但还不触发动画
    this.currentState = 'opening';
    this.isAnimating = false; // 确保初始为 false
    this.drawerStateChange.emit({ state: 'opening' });

    // 第 2 步：等待浏览器完成初始渲染
    // 使用单次 RAF，避免强制 reflow 造成卡顿
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(undefined);
        });
      });
    });
    
    // 第 3 步：现在触发动画
    this.isAnimating = true; // 这会触发重新渲染，加上 drawer-visible 类
    
    // 第 4 步：等待动画完成
    if (this.animation) {
      // 移动端使用实际设置的动画时长，不强制缩短
      await waitForAnimation(this.animationDuration);
    }

    // 第 6 步：动画完成，设置最终状态
    this.currentState = 'open';
    this.drawerStateChange.emit({ state: 'open' });
    this.drawerOpen.emit();

    // 焦点捕获
    if (this.focusTrap && this.contentRef) {
      trapFocus(this.contentRef, this.autoFocus);
    }
  }

  private async handleClose(reason: CloseReason) {
    this.drawerBeforeClose.emit({ reason });
    
    // 移除 isAnimating 以触发关闭动画
    this.isAnimating = false;
    this.currentState = 'closing';
    this.drawerStateChange.emit({ state: 'closing' });

    // 释放焦点捕获
    if (this.focusTrap && this.contentRef) {
      releaseFocusTrap(this.contentRef);
    }

    // 恢复焦点
    if (this.restoreFocus && this.previousFocusedElement) {
      this.previousFocusedElement.focus();
    }

    // 从堆栈移除
    removeFromStack(this.el);

    // 解锁滚动
    if (this.lockScroll && !isTopDrawer(this.el)) {
      unlockPageScroll();
    }

    // 等待动画
    if (this.animation) {
      // 移动端使用实际设置的动画时长，不强制缩短
      await waitForAnimation(this.animationDuration);
    }

    this.currentState = 'closed';
    this.drawerStateChange.emit({ state: 'closed' });
    this.drawerClose.emit({ reason });
    this.visible = false;

    // 销毁内容
    if (this.destroyOnClose) {
      this.el.innerHTML = '';
    }
  }

  private handleMaskClick = () => {
    if (this.maskClosable && isTopDrawer(this.el)) {
      this.close('mask');
    }
  };

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.closeOnEsc && isTopDrawer(this.el)) {
      event.preventDefault();
      this.close('escape');
    }
  };

  private handleCloseClick = () => {
    this.close('button');
  };

  private handleBackClick = () => {
    this.close('button');
  };

  private handleFullscreenToggle = () => {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreen = this.isFullscreen;
  };

  // ==================== 调整大小 ====================

  private handleResizeStart = (event: MouseEvent | TouchEvent) => {
    if (!this.resizable) return;

    event.preventDefault();
    this.isResizing = true;

    const coords = getEventCoordinates(event);
    this.resizeStartPos = coords;
    this.resizeStartSize = this.getCurrentSizeInPixels();

    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd);
    document.addEventListener('touchmove', this.handleResizeMove);
    document.addEventListener('touchend', this.handleResizeEnd);

    this.el.classList.add('drawer-resizing');
  };

  private handleResizeMove = throttle((event: MouseEvent | TouchEvent) => {
    if (!this.isResizing) return;

    const coords = getEventCoordinates(event);
    let delta = 0;

    switch (this.placement) {
      case 'left':
        delta = coords.x - this.resizeStartPos.x;
        break;
      case 'right':
        delta = this.resizeStartPos.x - coords.x;
        break;
      case 'top':
        delta = coords.y - this.resizeStartPos.y;
        break;
      case 'bottom':
        delta = this.resizeStartPos.y - coords.y;
        break;
    }

    const newSize = this.resizeStartSize + delta;
    const containerSize = this.getContainerSize();
    const constrainedSize = calculateActualSize(
      `${newSize}px`,
      containerSize,
      this.minSize.toString(),
      this.maxSize.toString()
    );

    // 检查吸附点
    if (this.snapPoints.length > 0) {
      const snapPoint = findNearestSnapPoint(
        constrainedSize,
        this.snapPoints,
        this.snapThreshold
      );

      if (snapPoint) {
        this.currentSize = `${snapPoint.value}px`;
      } else {
        this.currentSize = `${constrainedSize}px`;
      }
    } else {
      this.currentSize = `${constrainedSize}px`;
    }
  }, 16); // 约 60fps

  private handleResizeEnd = () => {
    if (!this.isResizing) return;

    this.isResizing = false;

    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
    document.removeEventListener('touchmove', this.handleResizeMove);
    document.removeEventListener('touchend', this.handleResizeEnd);

    this.el.classList.remove('drawer-resizing');
    this.emitResizeEvent();
  };

  // ==================== 滑动关闭 ====================

  private handleSwipeStart = (event: TouchEvent | MouseEvent) => {
    // 更详细的调试日志
    
    
    
    
    
    
    
    
    if (!this.swipeToClose) {
      
      return;
    }

    // 检查触发区域
    const target = event.target as HTMLElement;
    
    
    const isTriggerArea = this.isSwipeTriggerArea(target, event);
    
    
    
    if (!isTriggerArea) {
      
      return;
    }
    
    

    const coords = getEventCoordinates(event);
    this.swipeStartPos = coords;
    this.swipeStartTime = Date.now();
    this.isSwiping = true;
    
    // 移动设备优化
    if (this.isMobileDevice && event instanceof TouchEvent) {
      this.touchStartX = coords.x;
      this.touchStartY = coords.y;
      this.lastTouchX = coords.x;
      this.lastTouchY = coords.y;
      this.lastTouchTime = Date.now();
      this.touchVelocity = 0;
      
      // 防止默认滚动行为
      if (this.shouldPreventScroll(target)) {
        event.preventDefault();
      }
    }
  };

  private handleSwipeMove = (event: TouchEvent | MouseEvent) => {
    if (!this.isSwiping) return;

    const coords = getEventCoordinates(event);
    let delta = 0;
    
    
    
    // 计算触摸速度（移动设备）
    if (this.isMobileDevice && event instanceof TouchEvent) {
      const currentTime = Date.now();
      const timeDelta = currentTime - this.lastTouchTime;
      
      if (timeDelta > 0) {
        const xVelocity = (coords.x - this.lastTouchX) / timeDelta;
        const yVelocity = (coords.y - this.lastTouchY) / timeDelta;
        
        // 根据方向计算速度
        this.touchVelocity = this.placement === 'left' || this.placement === 'right'
          ? Math.abs(xVelocity)
          : Math.abs(yVelocity);
      }
      
      this.lastTouchX = coords.x;
      this.lastTouchY = coords.y;
      this.lastTouchTime = currentTime;
    }

    switch (this.placement) {
      case 'left':
        delta = coords.x - this.swipeStartPos.x;
        if (delta > 0) delta = 0; // 只允许向左滑动
        break;
      case 'right':
        delta = this.swipeStartPos.x - coords.x;
        if (delta > 0) delta = 0; // 只允许向右滑动
        break;
      case 'top':
        delta = coords.y - this.swipeStartPos.y;
        if (delta > 0) delta = 0; // 只允许向上滑动
        break;
      case 'bottom':
        delta = this.swipeStartPos.y - coords.y;
        if (delta > 0) delta = 0; // 只允许向下滑动
        break;
    }

    const currentSize = this.getCurrentSizeInPixels();
    this.swipeProgress = Math.abs(delta) / currentSize;
    
    // 使用 RAF 优化渲染（性能模式）
    if (this.performanceMode) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.drawerSwipe.emit({ progress: this.swipeProgress });
      });
    } else {
      this.drawerSwipe.emit({ progress: this.swipeProgress });
    }
  };

  private handleSwipeEnd = () => {
    
    
    if (!this.isSwiping) return;

    const duration = Date.now() - this.swipeStartTime;
    const distance = this.swipeProgress * this.getCurrentSizeInPixels();
    
    // 使用触摸速度优化关闭判断（移动设备）
    let velocity = calculateVelocity(0, distance, duration);
    if (this.isMobileDevice && this.touchVelocity > 0) {
      velocity = Math.max(velocity, this.touchVelocity * 1000); // 转换为像素/秒
    }
    
    // 移动设备降低阈值，更容易触发关闭
    const threshold = this.isMobileDevice ? this.swipeThreshold * 0.8 : this.swipeThreshold;
    
    if (shouldTriggerSwipeClose(this.swipeProgress, velocity, threshold)) {
      
      this.close('swipe');
    } else {
      
      // 弹性回弹动画
      this.animateSwipeBack();
    }

    this.isSwiping = false;
    this.swipeProgress = 0;
    this.touchVelocity = 0;
  };

  private isSwipeTriggerArea(target: HTMLElement, event?: TouchEvent | MouseEvent): boolean {
    
    
    if (this.swipeTriggerArea === 'anywhere') {
      
      return true;
    }

    if (this.swipeTriggerArea === 'handle') {
      const isHandle = target.classList.contains('drawer-swipe-handle') || 
                       target.closest('.drawer-swipe-handle') !== null;
      
      return isHandle;
    }

    if (this.swipeTriggerArea === 'header') {
      const isHeader = target.closest('.drawer-header') !== null;
      
      return isHeader;
    }

    if (this.swipeTriggerArea === 'edge') {
      // 检查是否在边缘区域（例如前 20px）
      // 注意：边缘应该是滑动起始的边缘
      // - 左侧抽屉：右边缘（向左滑动关闭）
      // - 右侧抽屉：左边缘（向右滑动关闭）
      // - 顶部抽屉：底边缘（向上滑动关闭）
      // - 底部抽屉：顶边缘（向下滑动关闭）
      if (!event || !this.drawerRef) {
        
        return false;
      }
      
      const rect = this.drawerRef.getBoundingClientRect();
      const coords = getEventCoordinates(event);
      let isEdge = false;
      let distance = 0;

      switch (this.placement) {
        case 'left':
          // 左侧抽屉：检查右边缘（靠近屏幕中央）
          distance = rect.right - coords.x;
          isEdge = distance < 20;
          break;
        case 'right':
          // 右侧抽屉：检查左边缘（靠近屏幕中央）
          distance = coords.x - rect.left;
          isEdge = distance < 20;
          break;
        case 'top':
          // 顶部抽屉：检查底边缘
          distance = rect.bottom - coords.y;
          isEdge = distance < 20;
          break;
        case 'bottom':
          // 底部抽屉：检查顶边缘
          distance = coords.y - rect.top;
          isEdge = distance < 20;
          break;
      }
      
      
      
      return isEdge;
    }

    
    return false;
  }

  // ==================== 移动设备支持方法 ====================
  
  private detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobile || (isTouchDevice && isSmallScreen);
  }
  
  private adjustForMobile(hasUserSpecifiedTriggerArea: boolean = false) {
    // 移动设备默认调整
    if (!this.swipeToClose) {
      this.swipeToClose = true; // 默认启用滑动关闭
    }
    
    // 只有在用户没有明确指定触发区域时，才修改为 anywhere
    // 如果用户明确设置了 swipe-trigger-area="edge"，就保持用户的选择
    if (!hasUserSpecifiedTriggerArea && this.swipeTriggerArea === 'edge') {
      this.swipeTriggerArea = 'anywhere';
      
    } else if (hasUserSpecifiedTriggerArea) {
      
    }
    
    // 调整默认尺寸
    if (this.size === 'md' || this.size === 400) {
      this.size = this.placement === 'bottom' || this.placement === 'top' ? '60%' : '85%';
    }
    
    // 移动设备不修改动画时长，使用用户设置或默认值
    // 这样可以保证动画流畅性
    
    // 默认启用 GPU 加速
    this.gpuAcceleration = true;
  }
  
  private shouldUsePerformanceMode(): boolean {
    // 检测是否需要启用性能模式
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const isSlowConnection = (navigator as any).connection && 
      ((navigator as any).connection.effectiveType === '2g' || 
       (navigator as any).connection.effectiveType === 'slow-2g');
    
    return this.isMobileDevice || isLowEndDevice || isSlowConnection;
  }
  
  // 关键修复：使用原生事件监听器绑定触摸事件
  private setupTouchListeners() {
    
    
    
    
    if (!this.drawerRef) {
      console.error('[Drawer Setup] drawerRef not found!');
      return;
    }
    
    // 移除之前可能绑定的监听器
    this.drawerRef.removeEventListener('touchstart', this.handleSwipeStart as any);
    this.drawerRef.removeEventListener('touchmove', this.handleSwipeMove as any);
    this.drawerRef.removeEventListener('touchend', this.handleSwipeEnd as any);
    
    // 添加触摸事件监听器
    this.drawerRef.addEventListener('touchstart', this.handleSwipeStart as any, { passive: false });
    this.drawerRef.addEventListener('touchmove', this.handleSwipeMove as any, { passive: false });
    this.drawerRef.addEventListener('touchend', this.handleSwipeEnd as any, { passive: true });
    
    
  }
  
  private shouldPreventScroll(target: HTMLElement): boolean {
    // 判断是否应该阻止滚动
    const isScrollable = target.scrollHeight > target.clientHeight ||
                        target.scrollWidth > target.clientWidth;
    
    return !isScrollable && this.swipeTriggerArea === 'anywhere';
  }
  
  private animateSwipeBack() {
    // 弹性回弹动画
    const duration = 200;
    const startTime = Date.now();
    const startProgress = this.swipeProgress;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        this.swipeProgress = 0;
        return;
      }
      
      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.swipeProgress = startProgress * (1 - easeOut);
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
  
  private setupOrientationListener() {
    if (!this.isMobileDevice) return;
    
    const handleOrientationChange = debounce(() => {
      // 重新计算尺寸
      const newSize = parseSize(this.size, this.placement);
      if (newSize !== this.currentSize) {
        this.currentSize = newSize;
        this.emitResizeEvent();
      }
    }, 300);
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }
  
  private setupViewportListener() {
    if (!this.isMobileDevice) return;
    
    // 监听虚拟键盘等导致的视口变化
    const visualViewport = (window as any).visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }
  }
  
  private handleViewportResize = debounce(() => {
    if (this.placement === 'bottom' && this.visible) {
      // 底部抽屉需要适应虚拟键盘
      const visualViewport = (window as any).visualViewport;
      if (visualViewport && visualViewport.height < window.innerHeight) {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        this.el.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        this.el.style.removeProperty('--keyboard-height');
      }
    }
  }, 100);
  
  // ==================== 性能优化方法 ====================
  
  private setupPerformanceOptimizations() {
    // 设置 Intersection Observer 进行懒加载
    if (this.lazyLoad && 'IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    }
    
    // 设置 Mutation Observer 监听内容变化
    if ('MutationObserver' in window) {
      this.setupMutationObserver();
    }
    
    // 优化滚动性能
    this.optimizeScrollPerformance();
    
    // 设置节流的事件处理器
    this.setupThrottledHandlers();
  }
  
  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.contentLoaded) {
          this.loadContent();
        }
      });
    }, options);
    
    if (this.contentRef) {
      this.intersectionObserver.observe(this.contentRef);
    }
  }
  
  private setupMutationObserver() {
    const options = {
      childList: true,
      subtree: true,
      characterData: true
    };
    
    this.mutationObserver = new MutationObserver(
      debounce(() => {
        this.handleContentMutation();
      }, 100)
    );
    
    if (this.contentRef) {
      this.mutationObserver.observe(this.contentRef, options);
    }
  }
  
  private handleContentMutation() {
    // 内容变化时重新计算布局
    if (this.visible && this.currentState === 'open') {
      this.emitResizeEvent();
    }
  }
  
  private loadContent() {
    // 懒加载内容
    this.contentLoaded = true;
    
    // 触发内容加载事件
    const event = new CustomEvent('drawerContentLoad', {
      detail: { drawerId: this.drawerId }
    });
    this.el.dispatchEvent(event);
  }
  
  private optimizeScrollPerformance() {
    if (!this.contentRef) return;
    
    // 添加滚动优化样式
    if (this.performanceMode) {
      // 使用setAttribute来设置webkit前缀属性
      this.contentRef.style.setProperty('-webkit-overflow-scrolling', 'touch');
      (this.contentRef.style as any)['-webkit-overflow-scrolling'] = 'touch';
    }
    
    // 监听滚动事件（节流）
    this.throttledScroll = throttle(() => {
      this.handleScroll();
    }, 100);
    
    this.contentRef.addEventListener('scroll', this.throttledScroll, { passive: true });
  }
  
  private handleScroll() {
    if (!this.contentRef) return;
    
    const scrollTop = this.contentRef.scrollTop;
    const scrollHeight = this.contentRef.scrollHeight;
    const clientHeight = this.contentRef.clientHeight;
    
    // 触发滚动事件
    const event = new CustomEvent('drawerScroll', {
      detail: {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollPercent: scrollTop / (scrollHeight - clientHeight)
      }
    });
    this.el.dispatchEvent(event);
  }
  
  private setupThrottledHandlers() {
    // 创建节流版本的处理器
    this.throttledResize = throttle(() => {
      this.emitResizeEvent();
    }, 100);
  }
  
  // ==================== 辅助方法 ====================

  private getCurrentSizeInPixels(): number {
    if (!this.drawerRef) return 0;

    return this.placement === 'left' || this.placement === 'right'
      ? this.drawerRef.offsetWidth
      : this.drawerRef.offsetHeight;
  }

  private getContainerSize(): number {
    const container = this.containerElement || document.body;
    return this.placement === 'left' || this.placement === 'right'
      ? container.offsetWidth
      : container.offsetHeight;
  }

  private emitResizeEvent() {
    if (this.drawerRef) {
      this.drawerResize.emit({
        drawerWidth: this.drawerRef.offsetWidth,
        drawerHeight: this.drawerRef.offsetHeight,
      });
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(
      debounce(() => {
        this.emitResizeEvent();
      }, 100)
    );

    if (this.drawerRef) {
      this.resizeObserver.observe(this.drawerRef);
    }
  }

  private cleanup() {
    removeFromStack(this.el);

    if (this.lockScroll) {
      unlockPageScroll();
    }

    if (this.focusTrap && this.contentRef) {
      releaseFocusTrap(this.contentRef);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    document.removeEventListener('keydown', this.handleEscapeKey);
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
    document.removeEventListener('touchmove', this.handleResizeMove);
    document.removeEventListener('touchend', this.handleResizeEnd);
    
    // 清理移动设备监听器
    if (this.isMobileDevice) {
      window.removeEventListener('orientationchange', this.handleViewportResize);
      window.removeEventListener('resize', this.handleViewportResize);
    }
    
  }

  private getDrawerStyle() {
    const style: { [key: string]: string } = {};
    
    style['z-index'] = this.zIndex.toString();

    // 设置尺寸
      if (this.placement === 'left' || this.placement === 'right') {
        style['width'] = this.currentSize;
        
        // 全屏模式特殊处理
        if (this.isFullscreen) {
          style['width'] = '100vw';
          style['height'] = '100vh';
          style['max-width'] = '100vw';
          style['max-height'] = '100vh';
          // 确保左右抽屉在全屏时铺满整个视口
          style['left'] = '0';
          style['right'] = '0';
          style['top'] = '0';
          style['bottom'] = '0';
        } else {
          // 非全屏模式：移动端关键修复
          // 确保内联样式也包含 max-width 约束，防止宽度超出视口
          if (this.isMobileDevice) {
            style['max-width'] = '100vw';
          }
        }
      } else {
        style['height'] = this.currentSize;
        
        // 全屏模式特殊处理
        if (this.isFullscreen) {
          style['width'] = '100vw';
          style['height'] = '100vh';
          style['max-width'] = '100vw';
          style['max-height'] = '100vh';
          // 确保上下抽屉在全屏时铺满整个视口
          style['left'] = '0';
          style['right'] = '0';
          style['top'] = '0';
          style['bottom'] = '0';
        } else {
          // 非全屏模式：移动端关键修复
          // 确保内联样式也包含 max-height 约束
          if (this.isMobileDevice) {
            style['max-height'] = '100vh';
          }
        }
      }

    // 圆角
    if (this.rounded) {
      style['border-radius'] = this.borderRadius;
    }

    // 动画 - 只在自定义动画时长或缓动函数时覆盖 CSS
    if (this.animation && !this.isSwiping) {
      // 只在非默认值时设置，否则使用 CSS 中的 transition
      if (this.animationDuration !== 300 || this.animationEasing !== 'ease-in-out') {
        style['transition'] = `transform ${this.animationDuration}ms ${getEasingFunction(
          this.animationEasing as any
        )}`;
      }
    } else if (!this.animation) {
      // 如果禁用动画，显式设置 transition: none
      style['transition'] = 'none';
    }

    // 滑动时禁用 transition
    if (this.isSwiping) {
      style['transition'] = 'none';
    }

    // GPU 加速和性能优化
    if (this.gpuAcceleration) {
      style['will-change'] = 'transform';
      style['backface-visibility'] = 'hidden'; // 避免不必要的重绘
      
      // 注意：不在这里设置 transform，避免覆盖动画的 transform
      // GPU 加速由 CSS 的 translateX/Y/Z 自动触发
    }
    
    // CSS containment 优化
    if (this.cssContain) {
      style['contain'] = 'layout style paint';
    }

    // 滑动进度
    if (this.isSwiping && this.swipeProgress > 0) {
      style['transform'] = getTransformStyle(this.placement, 1 - this.swipeProgress, this.currentSize);
    }

    return style;
  }

  private getContainerClass() {
    const classes = ['ldesign-drawer-container'];

    // 关键修复：只有当 isAnimating 为 true 时才添加 drawer-visible
    // 这样可以确保：
    // 1. opening 状态且 isAnimating=false：初始位置（隐藏）
    // 2. opening 状态且 isAnimating=true：触发动画（显示）
    // 3. open 状态：始终显示
    if ((this.currentState === 'opening' && this.isAnimating) || this.currentState === 'open') {
      classes.push('drawer-visible');
    }
    
    if (this.currentState) classes.push(`drawer-${this.currentState}`);
    if (this.placement) classes.push(`drawer-${this.placement}`);
    if (this.theme) classes.push(`drawer-theme-${this.theme}`);
    if (this.isResizing) classes.push('drawer-resizing');
    if (this.isSwiping) classes.push('drawer-swiping');
    if (this.isMinimized) classes.push('drawer-minimized');
    if (this.isMaximized) classes.push('drawer-maximized');
    if (this.isFullscreen) classes.push('drawer-fullscreen');
    if (this.isMobileDevice) classes.push('drawer-mobile');
    if (this.performanceMode) classes.push('drawer-performance');
    if (this.customClass) classes.push(this.customClass);

    return classes.join(' ');
  }

  // ==================== 渲染 ====================

  render() {
    // 始终渲染 DOM 结构，通过 CSS 类控制显示/隐藏
    // 这样可以确保组件的方法（如 open()）始终可用

    return (
      <Host class={this.getContainerClass()}>
        {/* 遮罩层 */}
        {this.mask && (
          <div
            class={`drawer-mask ${this.maskClass}`}
            onClick={this.handleMaskClick}
            style={{ zIndex: (this.zIndex - 1).toString() }}
          />
        )}

        {/* 抽屉主体 */}
        <div
          ref={(el) => {
            if (el && el !== this.drawerRef) {
              this.drawerRef = el!;
              // 重新设置触摸监听器（当 ref 更新时）
              if (this.currentState !== 'closed') {
                this.setupTouchListeners();
              }
            }
          }}
          class="drawer-wrapper"
          style={this.getDrawerStyle()}
          role="dialog"
          aria-modal="true"
          aria-label={this.ariaLabelText || this.drawerTitle}
          onKeyDown={this.handleEscapeKey}
        >
          {/* 头部 */}
          {this.renderHeader()}

          {/* 内容 */}
          {this.renderContent()}

          {/* 底部 */}
          {this.renderFooter()}

          {/* 调整大小手柄 */}
          {this.resizable && this.renderResizeHandle()}

          {/* 滑动手柄 */}
          {this.swipeToClose && this.renderSwipeHandle()}

          {/* 加载状态 */}
          {this.loading && this.renderLoading()}
        </div>
      </Host>
    );
  }

  private renderHeader() {
    const hasHeader = this.drawerTitle || this.subtitle || this.showBack || this.closable || this.el.querySelector('[slot="header"]');

    if (!hasHeader) return null;

    return (
      <div class={`drawer-header ${this.headerBorder ? 'drawer-header-border' : ''} ${this.headerSticky ? 'drawer-header-sticky' : ''}`}>
        <div class="drawer-header-content">
          {this.showBack && (
            <button 
              class="drawer-back-btn" 
              onClick={this.handleBackClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                this.handleBackClick();
              }}
              aria-label="返回"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
              </svg>
            </button>
          )}

          {this.icon && <span class="drawer-icon">{this.icon}</span>}

          <div class="drawer-title-wrapper">
            {this.drawerTitle && <h3 class="drawer-title">{this.drawerTitle}</h3>}
            {this.subtitle && <p class="drawer-subtitle">{this.subtitle}</p>}
          </div>

          <div class="drawer-header-actions">
            <slot name="extra" />

            {this.fullscreenable && (
              <button
                class="drawer-action-btn"
                onClick={this.handleFullscreenToggle}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  this.handleFullscreenToggle();
                }}
                aria-label={this.isFullscreen ? '退出全屏' : '全屏'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  {this.isFullscreen ? (
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor" />
                  ) : (
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor" />
                  )}
                </svg>
              </button>
            )}

            {this.minimizable && (
              <button 
                class="drawer-action-btn" 
                onClick={() => this.minimize()}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  this.minimize();
                }}
                aria-label="最小化"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19 13H5v-2h14v2z" fill="currentColor" />
                </svg>
              </button>
            )}

            {this.closable && (
              <button 
                class="drawer-close-btn" 
                onClick={this.handleCloseClick}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  this.handleCloseClick();
                }}
                aria-label="关闭"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <slot name="header" />
      </div>
    );
  }

  private renderContent() {
    const paddingStyle = this.padding === true ? '24px' : this.padding === false ? '0' : this.padding;

    return (
      <div
        ref={(el) => (this.contentRef = el!)}
        class="drawer-content"
        style={{ 
          padding: paddingStyle,
          ...(this.virtualScroll && { overflowAnchor: 'none' }) // 虚拟滚动优化
        }}
      >
        <slot />
      </div>
    );
  }

  private renderFooter() {
    const hasFooter = this.footerButtons.length > 0 || this.el.querySelector('[slot="footer"]');

    if (!hasFooter) return null;

    return (
      <div class={`drawer-footer ${this.footerBorder ? 'drawer-footer-border' : ''}`}>
        <slot name="footer" />

        {this.footerButtons.length > 0 && (
          <div class={`drawer-footer-buttons drawer-footer-${this.footerAlign}`}>
            {this.footerButtons.map((button) => (
              <button
                key={button.id || button.text}
                class={`drawer-btn drawer-btn-${button.type || 'default'} ${button.className || ''}`}
                disabled={button.disabled || button.loading}
                onClick={(e) => button.onClick?.(e)}
                aria-label={button.tooltip}
              >
                {button.loading ? (
                  <span class="drawer-btn-loading">⏳</span>
                ) : button.icon ? (
                  <span class="drawer-btn-icon">{button.icon}</span>
                ) : null}
                <span class="drawer-btn-text">{button.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  private renderResizeHandle() {
    const handleClass = `drawer-resize-handle drawer-resize-handle-${this.placement}`;

    return (
      <div
        ref={(el) => (this.resizeHandleRef = el)}
        class={handleClass}
        onMouseDown={this.handleResizeStart}
        onTouchStart={this.handleResizeStart}
      >
        {this.showSizeHint && this.isResizing && (
          <div class="drawer-size-hint">{this.currentSize}</div>
        )}
      </div>
    );
  }

  private renderSwipeHandle() {
    if (this.swipeTriggerArea !== 'handle') return null;

    return (
      <div class="drawer-swipe-handle">
        <div class="drawer-swipe-indicator" />
      </div>
    );
  }

  private renderLoading() {
    return (
      <div class="drawer-loading-overlay">
        <slot name="loading">
          <div class="drawer-loading-content">
            <div class="drawer-loading-spinner" />
            {this.loadingText && <p class="drawer-loading-text">{this.loadingText}</p>}
          </div>
        </slot>
      </div>
    );
  }
}