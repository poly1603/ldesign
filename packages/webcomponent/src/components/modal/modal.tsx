import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { lockPageScroll, unlockPageScroll } from '../../utils/scroll-lock';
import type { ButtonType } from '../../types';
import { generateId } from '../../utils';
import { CloseIcon, MaximizeIcon, RestoreIcon } from './window-icons';

// 简单的全局栈管理，确保 ESC 仅关闭栈顶弹窗
const __modalStack: any[] = [];

export type ModalVariant = 'modal' | 'drawer-left' | 'drawer-right' | 'bottom-sheet';

export type ModalSize = 'small' | 'medium' | 'large' | 'full' | 'auto';

export type ModalAnimation = 'fade' | 'zoom' | 'slide-down' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-origin' | 'elastic' | 'wobble' | 'flip' | 'bounce' | 'rotate' | 'blur';

export type ModalTheme = 'light' | 'dark' | 'glass' | 'gradient' | 'neumorphism';

export interface ModalHeaderConfig {
  icon?: string;
  iconColor?: string;
  subtitle?: string;
  badge?: string | number;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * Modal 模态框组件
 */
@Component({
  tag: 'ldesign-modal',
  styleUrl: 'modal.less',
  shadow: false,
})
export class LdesignModal {
  @Element() el!: HTMLElement;


  /**
   * 是否显示模态框
   */
  @Prop({ mutable: true }) visible: boolean = false;

  /**
   * 模态框标题
   */
  @Prop() modalTitle?: string;

  /** 图标可配置 */
  @Prop() closeIcon: string = 'close';
  @Prop() maximizeIcon: string = 'maximize';
  @Prop() restoreIcon: string = 'restore';

  /**
   * 模态框尺寸
   */
  @Prop() size: ModalSize = 'medium';

  /**
   * 是否显示关闭按钮
   */
  @Prop() closable: boolean = true;

  /**
   * 是否显示遮罩层
   */
  @Prop() mask: boolean = true;

  /**
   * 点击遮罩层是否关闭
   */
  @Prop() maskClosable: boolean = true;

  /**
   * 按ESC键是否关闭
   */
  @Prop() keyboard: boolean = true;

  /**
   * 是否居中显示
   */
  @Prop() centered: boolean = false;

  /**
   * 是否可拖拽
   */
  @Prop() isDraggable: boolean = false;

  /**
   * 是否可调整大小
   */
  @Prop() resizable: boolean = false;

  /**
   * 自定义宽度
   */
  @Prop() width?: number | string;

  /**
   * 自定义高度
   */
  @Prop() height?: number | string;

  /**
   * 距离顶部的距离
   */
  @Prop() top?: number | string;

  /**
   * z-index
   */
  @Prop() zIndex: number = 1000;

  /**
   * 是否销毁子元素
   */
  @Prop() destroyOnClose: boolean = false;

  /**
   * 动画效果类型
   */
  @Prop() animation: ModalAnimation = 'zoom';

  /**
   * 是否可最大化
   */
  @Prop() maximizable: boolean = false;

  /**
   * 底部按钮文案和类型控制（仅在未自定义 footer 时生效）
   */
  @Prop() okText: string = '确定';
  @Prop() cancelText: string = '取消';
  @Prop() okType: ButtonType = 'primary';
  @Prop() cancelType: ButtonType = 'secondary';

  /** OK 按钮状态 */
  @Prop({ mutable: true }) okLoading: boolean = false;
  @Prop() okDisabled: boolean = false;

  /**
   * 关闭/确认前拦截钩子（函数属性，需 JS 赋值）
   */
  @Prop() beforeClose?: (reason: 'ok' | 'close' | 'mask' | 'esc' | 'api') => boolean | Promise<boolean>;
  @Prop() preOk?: () => boolean | Promise<boolean>;

  /** 焦点与可访问性 */
  @Prop() trapFocus: boolean = true;
  @Prop() initialFocus?: string;

  /** 调整大小边界 */
  @Prop() minWidth?: number;
  @Prop() minHeight?: number;
  @Prop() maxWidth?: number;
  @Prop() maxHeight?: number;

  /** 变体：抽屉/底部弹层等 */
  @Prop() variant: ModalVariant = 'modal';
  /** 响应式变体：根据断点自动切换 */
  @Prop() variantAt?: Partial<Record<'xs'|'sm'|'md'|'lg', ModalVariant>>;
  @Prop() breakpoints?: { xs: number; sm: number; md: number; lg: number };


  /** 动画参数（也可通过 CSS 变量覆盖）：duration(ms)、ease、animEase */
  @Prop() duration?: number;
  @Prop() ease?: string;
  @Prop() animEase?: string;

  /** 容器（选择器或元素）：若提供，则在加载时把组件节点移动到该容器下 */
  @Prop() getContainer?: string | HTMLElement;

  /** 软键盘（移动端）避让 */
  @Prop() avoidKeyboard: boolean = true;

  /** 向导模式 */
  @Prop() wizard: boolean = false;
  /** 步骤标题（JS 赋值） */
  @Prop() steps?: string[];
  /** 当前步骤（0-based，可受控） */
  @Prop({ mutable: true }) currentStep: number = 0;
  @Event() ldesignStepChange!: EventEmitter<number>;
  /** 向导步进前置钩子：返回 false 阻止切换 */
  @Prop() beforeStepChange?: (from: number, to: number) => boolean | Promise<boolean>;

  /** Drawer 边缘滑动关闭 */
  @Prop() drawerSwipeToClose: boolean = true;
  /** Drawer 滑动关闭阈值（距离）：默认 '30%'（以抽屉宽度为基准） */
  @Prop() drawerCloseThreshold?: number | string;

  /** 屏幕边缘滑动打开抽屉（需 destroyOnClose=false 以便组件常驻） */
  @Prop() openOnEdgeSwipe: boolean = false;
  /** 边缘感应宽度（px） */
  @Prop() edgeSwipeWidth: number = 24;
  
  /** 新增：深色模式 */
  @Prop() darkMode: boolean = false;
  /** 新增：自动检测系统深色模式 */
  @Prop() autoDetectDarkMode: boolean = true;
  /** 新增：是否支持画中画模式 */
  @Prop() enablePictureInPicture: boolean = false;
  /** 新增：是否启用手势操作 */
  @Prop() enableGestures: boolean = true;
  /** 新增：是否显示进度指示器 */
  @Prop() showProgress: boolean = false;
  /** 新增：当前进度（0-100） */
  @Prop({ mutable: true }) progress: number = 0;
  /** 新增：是否展示加载状态 */
  @Prop() loading: boolean = false;
  /** 新增：加载文字 */
  @Prop() loadingText: string = '加载中...';
  
  /** 新增：主题 */
  @Prop() theme: ModalTheme = 'light';
  /** 新增：模糊背景 */
  @Prop() blurBackground: boolean = false;
  /** 新增：模糊程度 */
  @Prop() blurAmount: number = 10;
  /** 新增：头部配置 */
  @Prop() headerConfig?: ModalHeaderConfig;
  /** 新增：是否显示头部分割线 */
  @Prop() showHeaderDivider: boolean = true;
  /** 新增：是否显示底部分割线 */
  @Prop() showFooterDivider: boolean = true;
  /** 新增：内容内边距 */
  @Prop() bodyPadding?: string | number;
  /** 新增：是否显示动画效果 */
  @Prop() animationEnabled: boolean = true;
  /** 新增：是否允许双击标题栏最大化 */
  @Prop() dblclickMaximize: boolean = true;
  /** 新增：是否显示阴影 */
  @Prop() showShadow: boolean = true;
  /** 新增：自定义类名 */
  @Prop() customClass?: string;
  /** 新增：是否禁用过渡效果 */
  @Prop() disableTransition: boolean = false;
  /** 新增：是否显示满屏按钮 */
  @Prop() showFullscreenButton: boolean = false;
  /** 新增：是否默认满屏 */
  @Prop() fullscreen: boolean = false;
  /** 新增：底部按钮对齐 */
  @Prop() footerAlign: 'left' | 'center' | 'right' | 'space-between' = 'right';
  /** 新增：是否显示取消按钮 */
  @Prop() showCancelButton: boolean = true;
  /** 新增：是否显示确认按钮 */
  @Prop() showOkButton: boolean = true;
  /** 新增：自定义按钮 */
  @Prop() customButtons?: Array<{
    text: string;
    type?: ButtonType;
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void | Promise<void>;
  }>;
  /** 新增：支持虚拟化滚动 */
  @Prop() virtualScroll: boolean = false;
  /** 新增：是否显示关闭动画 */
  @Prop() closeAnimation: boolean = true;

  /**
   * 模态框状态
   */
  @State() isVisible: boolean = false;

  /**
   * 是否正在动画中
   */
  @State() isAnimating: boolean = false;

  /**
   * 是否正在关闭动画中
   */
  @State() isClosing: boolean = false;

  /**
   * 是否最大化
   */
  @State() isMaximized: boolean = false;

  /**
   * 滚动阴影状态
   */
  @State() showHeaderShadow: boolean = false;
  @State() showFooterShadow: boolean = false;

  /**
   * 模态框元素引用
   */
  private modalElement?: HTMLElement;
  private titleId?: string;
  private bodyId?: string;
  
  /** 深色模式媒体查询 */
  private darkModeQuery?: MediaQueryList;
  /** 手势识别 */
  private gestureStartX?: number;
  private gestureStartY?: number;
  private gestureStartTime?: number;

  /**
   * 可滚动主体区域引用
   */
  private bodyElement?: HTMLElement;

  /** 背景滚动锁处理器 */
  private scrollLockHandler = (e: Event) => {
    if (!this.isVisible) return;
    const body = this.el.querySelector('.ldesign-modal__body') as HTMLElement | null;
    if (!body) {
      e.preventDefault();
      return;
    }
    const target = e.target as Node | null;
    // 允许在内容区滚动；其余位置（遮罩/页面）阻止默认滚动，避免页面抖动
    if (!target || !body.contains(target)) {
      e.preventDefault();
    }
  };

  private keyScrollLockHandler = (e: KeyboardEvent) => {
    if (!this.isVisible) return;
    const keys = ['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '];
    if (keys.includes(e.key)) {
      // 若焦点不在内容区，阻止页面滚动
      const body = this.el.querySelector('.ldesign-modal__body') as HTMLElement | null;
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
    document.addEventListener('wheel', this.scrollLockHandler, { passive: false });
    document.addEventListener('touchmove', this.scrollLockHandler, { passive: false });
    document.addEventListener('keydown', this.keyScrollLockHandler, { passive: false } as any);
  }

  private unbindScrollLock() {
    document.removeEventListener('wheel', this.scrollLockHandler as any, false);
    document.removeEventListener('touchmove', this.scrollLockHandler as any, false);
    document.removeEventListener('keydown', this.keyScrollLockHandler as any, false);
  }

  /**
   * 遮罩层元素引用
   */
  private maskElement?: HTMLElement;

  /**
   * 拖拽相关状态
   */
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private modalStartX: number = 0;
  private modalStartY: number = 0;


  /**
   * 调整大小相关状态
   */
  private isResizing: boolean = false;

  /** Drawer 滑动关闭状态 */
  private isDrawerSwiping: boolean = false;
  private drawerStartX: number = 0;
  private drawerStartTranslate: number = 0;
  // 记录最近一次滑动点，用于速率判定（预留）
  private drawerLastX: number = 0;
  private drawerLastT: number = 0;


  /** 打开前的焦点（用于关闭后恢复） */
  private openerEl?: HTMLElement | null;

  /** 响应式变体 */
  @State() effectiveVariant?: ModalVariant;

  /** VisualViewport 处理 */
  private vv?: any;
  private onVv = () => { this.applyKeyboardAvoid(); };
  private resizeDirection: string = '';

  private handleEdgePointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
    if (!this.openOnEdgeSwipe || this.isVisible) return;
    const vv = this.getCurrentVariant();
    if (!(vv === 'drawer-left' || vv === 'drawer-right')) return;
    const x = (e as PointerEvent).clientX ?? (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX;
    if (typeof x !== 'number') return;
    const edge = this.edgeSwipeWidth || 24;
    const w = window.innerWidth || document.documentElement.clientWidth;
    if ((vv === 'drawer-left' && x <= edge) || (vv === 'drawer-right' && (w - x) <= edge)) {
      this.setVisible(true);
    }
  };

  /** 最近一次指针位置（用于 zoom-origin 动画） */
  private lastPointerX?: number;
  private lastPointerY?: number;
  private lastPointerTime?: number;
  private pointerRecordListener = (e: PointerEvent | MouseEvent | TouchEvent) => {
    const x = (e as PointerEvent).clientX ?? (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX;
    const y = (e as PointerEvent).clientY ?? (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY;
    if (typeof x === 'number' && typeof y === 'number') {
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.lastPointerTime = performance.now();
    }
  };

  private attachPointerRecorders() {
    document.addEventListener('pointerdown', this.pointerRecordListener as any, { passive: true } as any);
    document.addEventListener('mousedown', this.pointerRecordListener as any, { passive: true } as any);
    document.addEventListener('touchstart', this.pointerRecordListener as any, { passive: true } as any);
  }
  private detachPointerRecorders() {
    document.removeEventListener('pointerdown', this.pointerRecordListener as any);
    document.removeEventListener('mousedown', this.pointerRecordListener as any);
    document.removeEventListener('touchstart', this.pointerRecordListener as any);
  }

  private getRecentPointer(threshold = 2000): { x: number; y: number } | null {
    if (this.lastPointerX == null || this.lastPointerY == null || this.lastPointerTime == null) return null;
    const now = performance.now();
    if (now - this.lastPointerTime <= threshold) return { x: this.lastPointerX, y: this.lastPointerY };
    return null;
  }

  private lastOpenViewportX?: number;
  private lastOpenViewportY?: number;

  private setOriginFromPoint(point: { x: number; y: number } | null, rememberOpen: boolean = false) {
    const dialog = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement | null;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (point) {
      // 使用像素值，允许起点在元素外部，才能产生“从点击点外部”放大的真实观感
      const pxX = Math.round(point.x - rect.left);
      const pxY = Math.round(point.y - rect.top);
      this.el.style.setProperty('--ld-modal-origin-x', `${pxX}px`);
      this.el.style.setProperty('--ld-modal-origin-y', `${pxY}px`);
      if (rememberOpen) {
        this.lastOpenViewportX = point.x;
        this.lastOpenViewportY = point.y;
      }
    } else {
      // 无点击点时回退到中心（百分比）
      this.el.style.setProperty('--ld-modal-origin-x', '50%');
      this.el.style.setProperty('--ld-modal-origin-y', '50%');
    }
  }

  private getCloseOriginPoint(): { x: number; y: number } | null {
    // 始终优先回到“打开时的起始点”
    if (this.lastOpenViewportX != null && this.lastOpenViewportY != null) {
      return { x: this.lastOpenViewportX, y: this.lastOpenViewportY };
    }
    // 兜底：使用最近点击点
    const p = this.getRecentPointer(3000);
    if (p) return p;
    return null;
  }
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private modalStartWidth: number = 0;
  private modalStartHeight: number = 0;
  private modalStartLeft: number = 0;
  private modalStartTop: number = 0;

  /**
   * 非可拖拽调整大小时，记录开始时的中心点（相对 wrap）
   */
  private modalCenterX: number = 0;
  private modalCenterY: number = 0;

  /**
   * 记忆上次关闭时的位置/尺寸（相对 wrap）
   */
  private lastLeft?: number;
  private lastTop?: number;
  private lastWidth?: number;
  private lastHeight?: number;

  /**
   * 用户是否通过拖拽/调整大小改变过位置或尺寸（用于决定是否保持居中）
   */
  private hasUserMoved: boolean = false;

  /**
   * resize 动画帧节流句柄
   */
  private resizeRaf?: number;

  /**
   * 显示状态变化事件
   */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  /**
   * 关闭事件
   */
  @Event() ldesignClose!: EventEmitter<void>;

  /**
   * 确认事件
   */
  @Event() ldesignOk!: EventEmitter<void>;

  /**
   * 监听visible属性变化
   */
  @Watch('visible')
  watchVisible(newValue: boolean) {
    if (newValue !== this.isVisible) {
      this.setVisibleInternal(newValue);
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.modalElement = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement;
    this.maskElement = this.el.querySelector('.ldesign-modal__mask') as HTMLElement;
    this.bodyElement = this.el.querySelector('.ldesign-modal__body') as HTMLElement;
    
    // 初始化深色模式
    this.initDarkMode();

    // 若指定容器，则把 Host 节点移动过去（只做一次）
    this.moveToContainer();

    if (this.visible) {
      this.setVisible(true);
    }

    // 绑定键盘事件
    if (this.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    // 监听窗口尺寸变化（居中时保持居中）
    window.addEventListener('resize', this.handleWindowResize, { passive: true });

    // 计算初始有效变体 & 监听尺寸变化
    this.updateEffectiveVariant();
    window.addEventListener('resize', this.updateEffectiveVariant as any, { passive: true });

    // 边缘滑动打开抽屉
    document.addEventListener('pointerdown', this.handleEdgePointerDown as any, { passive: true } as any);

    // 记录最近一次指针位置（zoom-origin 需要）
    this.attachPointerRecorders();
    
    // 初始化手势操作
    if (this.enableGestures) {
      this.initGestures();
    }
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    // 移除键盘事件
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 清理深色模式监听
    this.cleanupDarkMode();

    // 移除拖拽和调整大小事件
    this.unbindDragEvents();
    this.unbindResizeEvents();
    
    // 清理所有动画帧
    if (this.dragRaf) {
      cancelAnimationFrame(this.dragRaf);
      this.dragRaf = undefined;
    }
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = undefined;
    }

    // 窗口事件
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('resize', this.updateEffectiveVariant as any);
    document.removeEventListener('pointerdown', this.handleEdgePointerDown as any);
    this.detachPointerRecorders();
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = undefined;
    }

    // 取消滚动监听
    this.unbindBodyScroll();

    // 解除滚动锁
    this.unbindScrollLock();

    // 恢复 body 滚动状态（考虑到多个 Modal 叠加的情况）
    if (this.isVisible) {
      this.unlockBodyScroll();
    }

    // 清理引用
    this.modalElement = undefined;
    this.maskElement = undefined;

    // 重置状态
    this.isVisible = false;
    this.isAnimating = false;
    this.isClosing = false;
    this.isMaximized = false;
    this.isDragging = false;
    this.isResizing = false;
  }

  @Watch('getContainer')
  onGetContainerChange() { this.moveToContainer(); }

  /**
   * 计算当前有效变体
   */
  private updateEffectiveVariant = () => {
    const bp = this.breakpoints || { xs: 480, sm: 768, md: 1024, lg: 1280 };
    const w = window.innerWidth;
    const map = this.variantAt || {};
    const v = w < bp.xs ? map.xs : w < bp.sm ? map.sm : w < bp.md ? map.md : w < bp.lg ? map.lg : undefined;
    this.effectiveVariant = v || this.variant;
  };

  private getCurrentVariant(): ModalVariant { return (this.effectiveVariant || this.variant) as ModalVariant; }

  /**
   * 键盘事件处理（ESC 关闭、Enter 确认、Tab 焦点圈定）
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isVisible) return;

    // ESC 关闭
    if (event.key === 'Escape' && this.keyboard) {
      if (this.isTopMost()) this.attemptClose('esc');
      return;
    }

    // Enter 触发 OK（当 footer 未自定义时才有意义）
    if (event.key === 'Enter') {
      const target = event.target as HTMLElement | null;
      const tag = (target && target.tagName) ? target.tagName.toLowerCase() : '';
      // 在 textarea 中按回车不触发 OK
      if (tag !== 'textarea') {
        this.handleOkClick();
        return;
      }
    }

    // 焦点圈定（Trap Focus）
    if (this.trapFocus && event.key === 'Tab') {
      const dialog = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement | null;
      if (!dialog) return;
      const focusables = this.getFocusable(dialog);
      if (focusables.length === 0) {
        dialog.focus();
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !dialog.contains(active)) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (!active || active === last || !dialog.contains(active)) {
          first.focus();
          event.preventDefault();
        }
      }
    }
  };

  /**
   * 遮罩层点击事件
   */
  private handleMaskClick = (event: Event) => {
    // 记录点击点用于 zoom-origin 收拢
    const e = event as MouseEvent;
    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
      this.lastPointerX = e.clientX; this.lastPointerY = e.clientY; this.lastPointerTime = performance.now();
    }
    if (event.target === this.maskElement && this.maskClosable) {
      this.attemptClose('mask');
    }
  };

  /**
   * 关闭按钮点击事件
   */
  private handleCloseClick = (ev?: MouseEvent | TouchEvent) => {
    // 阻止事件冒泡，防止触发拖拽
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
      
      // 记录点击位置（兼容触摸事件）
      if ((ev as TouchEvent).touches) {
        const touch = (ev as TouchEvent).touches[0];
        if (touch) {
          this.lastPointerX = touch.clientX;
          this.lastPointerY = touch.clientY;
          this.lastPointerTime = performance.now();
        }
      } else if ((ev as MouseEvent).clientX != null && (ev as MouseEvent).clientY != null) {
        this.lastPointerX = (ev as MouseEvent).clientX;
        this.lastPointerY = (ev as MouseEvent).clientY;
        this.lastPointerTime = performance.now();
      }
    }
    this.attemptClose('close');
  };

  /**
   * 确认按钮点击事件
   */
  private handleOkClick = async () => {
    if (this.okDisabled || this.okLoading) return;

    // preOk 支持异步校验
    if (this.preOk) {
      try {
        this.okLoading = true;
        const pass = await this.preOk();
        if (!pass) { this.okLoading = false; return; }
      } catch (_) {
        this.okLoading = false; return;
      }
      this.okLoading = false;
    }

    // beforeClose 拦截（场景：ok）
    if (this.beforeClose) {
      const can = await Promise.resolve(this.beforeClose('ok'));
      if (!can) return;
    }

    this.ldesignOk.emit();
    this.setVisible(false);
  };

  /**
   * 最大化按钮点击事件
   */
  private handleMaximizeClick = () => {
    this.toggleMaximize();
  };

  /**
   * 拖拽开始（支持鼠标和触摸）
   */
  private handleDragStart = (event: MouseEvent | TouchEvent) => {
    if (!this.isDraggable || !this.modalElement) return;
    
    // 检查是否点击了按钮、图标或其子元素，如果是则不启动拖拽
    const target = event.target as HTMLElement;
    if (target) {
      // 检查是否点击了按钮、图标或操作区域
      const isInteractiveElement = 
        target.closest('ldesign-button') || 
        target.closest('ldesign-icon') ||
        target.closest('.ldesign-modal__close') || 
        target.closest('.ldesign-modal__maximize') ||
        target.closest('.ldesign-modal__actions') ||
        target.tagName === 'LDESIGN-BUTTON' ||
        target.tagName === 'LDESIGN-ICON' ||
        target.classList.contains('ldesign-modal__close') ||
        target.classList.contains('ldesign-modal__maximize');
      
      if (isInteractiveElement) {
        return; // 不启动拖拽，让图标/按钮正常工作
      }
    }

    this.isDragging = true;
    this.hasUserMoved = true;
    
    // 获取坐标（兼容触摸事件）
    const clientX = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    
    this.dragStartX = clientX;
    this.dragStartY = clientY;

    // 添加拖拽样式类
    this.modalElement.classList.add('dragging');

    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();
    this.modalStartX = rect.left - wrapRect.left;
    this.modalStartY = rect.top - wrapRect.top;

    // 如果模态框还在使用居中定位，转换为绝对定位（使用相对于 wrap 的像素值）
    const computedStyle = window.getComputedStyle(this.modalElement);
    if (computedStyle.position !== 'absolute' || computedStyle.transform.includes('translate')) {
      // 计算当前实际位置（相对于 wrap）
      const currentLeft = rect.left - wrapRect.left;
      const currentTop = rect.top - wrapRect.top;

      // 设置为绝对定位
      this.modalElement.style.position = 'absolute';
      this.modalElement.style.left = `${currentLeft}px`;
      this.modalElement.style.top = `${currentTop}px`;
      this.modalElement.style.transform = 'none';
      this.modalElement.style.margin = '0';

      // 更新起始位置
      this.modalStartX = currentLeft;
      this.modalStartY = currentTop;
    }

    this.bindDragEvents();
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * 拖拽中（支持鼠标和触摸）
   */
  private dragRaf?: number;
  private handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging || !this.modalElement) return;
    
    // 获取坐标（兼容触摸事件）
    const clientX = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    
    // 安全兜底：若鼠标已松开（仅针对鼠标事件）
    if (!(event as TouchEvent).touches && (event as MouseEvent).buttons === 0) { 
      this.handleDragEnd(); 
      return; 
    }

    // 使用 requestAnimationFrame 优化性能
    if (this.dragRaf) cancelAnimationFrame(this.dragRaf);
    this.dragRaf = requestAnimationFrame(() => {
      if (!this.isDragging || !this.modalElement) return;
      
      const deltaX = clientX - this.dragStartX;
      const deltaY = clientY - this.dragStartY;

    let newX = this.modalStartX + deltaX;
    let newY = this.modalStartY + deltaY;

    // 约束在可视区域内（以 wrap 为边界）
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const maxLeft = Math.max(0, wrap.clientWidth - this.modalElement.offsetWidth);
    const maxTop = Math.max(0, wrap.clientHeight - this.modalElement.offsetHeight);
    newX = Math.min(Math.max(0, newX), maxLeft);
    newY = Math.min(Math.max(0, newY), maxTop);

      // 应用并记忆
      this.modalElement.style.left = `${newX}px`;
      this.modalElement.style.top = `${newY}px`;
      this.modalElement.style.transform = 'none';

      this.lastLeft = newX;
      this.lastTop = newY;
    });
  };

  /**
   * 拖拽结束
   */
  private handleDragEnd = () => {
    this.isDragging = false;
    
    // 清理动画帧
    if (this.dragRaf) {
      cancelAnimationFrame(this.dragRaf);
      this.dragRaf = undefined;
    }

    // 移除拖拽样式类
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }

    this.unbindDragEvents();
  };

  /**
   * 绑定拖拽事件（支持鼠标和触摸）
   */
  private bindDragEvents() {
    // 鼠标事件
    document.addEventListener('mousemove', this.handleDragMove as EventListener);
    document.addEventListener('mouseup', this.handleDragEnd);
    // 触摸事件
    document.addEventListener('touchmove', this.handleDragMove as EventListener, { passive: false });
    document.addEventListener('touchend', this.handleDragEnd, { passive: false });
    document.addEventListener('touchcancel', this.handleDragEnd, { passive: false });
  }

  /**
   * 解绑拖拽事件（支持鼠标和触摸）
   */
  private unbindDragEvents() {
    // 鼠标事件
    document.removeEventListener('mousemove', this.handleDragMove as EventListener);
    document.removeEventListener('mouseup', this.handleDragEnd);
    // 触摸事件
    document.removeEventListener('touchmove', this.handleDragMove as EventListener);
    document.removeEventListener('touchend', this.handleDragEnd);
    document.removeEventListener('touchcancel', this.handleDragEnd);
  }

  /**
   * 调整大小开始（支持鼠标和触摸）
   */
  private handleResizeStart = (event: MouseEvent | TouchEvent, direction: string) => {
    if (!this.resizable || !this.modalElement) return;

    this.isResizing = true;
    this.resizeDirection = direction;
    
    // 获取坐标（兼容触摸事件）
    const clientX = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    
    this.resizeStartX = clientX;
    this.resizeStartY = clientY;

    // 添加调整大小样式类
    this.modalElement.classList.add('resizing');

    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();

    this.modalStartWidth = rect.width;
    this.modalStartHeight = rect.height;
    this.modalStartLeft = rect.left - wrapRect.left;
    this.modalStartTop = rect.top - wrapRect.top;

    // 非拖拽时记录中心点（相对 wrap）
    if (!this.isDraggable) {
      this.modalCenterX = this.modalStartLeft + this.modalStartWidth / 2;
      this.modalCenterY = this.modalStartTop + this.modalStartHeight / 2;
    }

    // 确保模态框使用绝对定位（相对 wrap）
    const computedStyle = window.getComputedStyle(this.modalElement);
    if (computedStyle.position !== 'absolute') {
      this.modalElement.style.position = 'absolute';
      this.modalElement.style.left = `${this.modalStartLeft}px`;
      this.modalElement.style.top = `${this.modalStartTop}px`;
      this.modalElement.style.transform = 'none';
      this.modalElement.style.margin = '0';
    }

    this.bindResizeEvents();
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * 调整大小中（支持鼠标和触摸）
   */
  private handleResizeMove = (event: MouseEvent | TouchEvent) => {
    if (!this.isResizing || !this.modalElement) return;
    
    // 获取坐标（兼容触摸事件）
    const clientX = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    
    // 安全兜底：若鼠标已松开（仅针对鼠标事件）
    if (!(event as TouchEvent).touches && (event as MouseEvent).buttons === 0) { 
      this.handleResizeEnd(); 
      return; 
    }

    // 使用 requestAnimationFrame 优化性能
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      if (!this.isResizing || !this.modalElement) return;
      
      const deltaX = clientX - this.resizeStartX;
      const deltaY = clientY - this.resizeStartY;

    const minW = this.minWidth ?? 200;
    const minH = this.minHeight ?? 150;

    let newWidth = this.modalStartWidth;
    let newHeight = this.modalStartHeight;
    let newLeft = this.modalStartLeft;
    let newTop = this.modalStartTop;

    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const maxWidth = wrap.clientWidth;
    const maxHeight = wrap.clientHeight;
    const limitMaxW = Math.min(maxWidth, this.maxWidth ?? maxWidth);
    const limitMaxH = Math.min(maxHeight, this.maxHeight ?? maxHeight);

    if (this.isDraggable) {
      // 单边调整，位置跟随边缘，中心不固定
      if (this.resizeDirection.includes('right')) {
        newWidth = Math.max(minW, this.modalStartWidth + deltaX);
      } else if (this.resizeDirection.includes('left')) {
        newWidth = Math.max(minW, this.modalStartWidth - deltaX);
        newLeft = this.modalStartLeft + (this.modalStartWidth - newWidth);
      }

      if (this.resizeDirection.includes('bottom')) {
        newHeight = Math.max(minH, this.modalStartHeight + deltaY);
      } else if (this.resizeDirection.includes('top')) {
        newHeight = Math.max(minH, this.modalStartHeight - deltaY);
        newTop = this.modalStartTop + (this.modalStartHeight - newHeight);
      }

      // 最大尺寸不超过容器及自定义上限
      newWidth = Math.min(newWidth, limitMaxW);
      newHeight = Math.min(newHeight, limitMaxH);

      // 边界约束
      const maxLeft = Math.max(0, maxWidth - newWidth);
      const maxTop = Math.max(0, maxHeight - newHeight);
      newLeft = Math.min(Math.max(0, newLeft), maxLeft);
      newTop = Math.min(Math.max(0, newTop), maxTop);

    } else {
      // 非可拖拽：以开始时的中心为锚点，双向等距伸缩
      let deltaW = 0;
      let deltaH = 0;
      if (this.resizeDirection.includes('right')) deltaW = 2 * deltaX;
      else if (this.resizeDirection.includes('left')) deltaW = -2 * deltaX;
      if (this.resizeDirection.includes('bottom')) deltaH = 2 * deltaY;
      else if (this.resizeDirection.includes('top')) deltaH = -2 * deltaY;

      newWidth = Math.max(minW, this.modalStartWidth + deltaW);
      newHeight = Math.max(minH, this.modalStartHeight + deltaH);

      // 限制不超过容器与自定义上限
      newWidth = Math.min(newWidth, limitMaxW);
      newHeight = Math.min(newHeight, limitMaxH);

      // 以固定中心点计算位置
      newLeft = this.modalCenterX - newWidth / 2;
      newTop = this.modalCenterY - newHeight / 2;

      // 边界约束（尽量保持中心，如有冲突优先不越界）
      const maxLeft = Math.max(0, maxWidth - newWidth);
      const maxTop = Math.max(0, maxHeight - newHeight);
      newLeft = Math.min(Math.max(0, newLeft), maxLeft);
      newTop = Math.min(Math.max(0, newTop), maxTop);
    }

    // 应用新的尺寸和位置
    this.modalElement.style.width = `${newWidth}px`;
    this.modalElement.style.height = `${newHeight}px`;
    this.modalElement.style.left = `${newLeft}px`;
    this.modalElement.style.top = `${newTop}px`;
    this.modalElement.style.transform = 'none';
    this.modalElement.style.position = 'absolute';
    this.modalElement.style.margin = '0';

      // 记忆
      this.lastLeft = newLeft;
      this.lastTop = newTop;
      this.lastWidth = newWidth;
      this.lastHeight = newHeight;
    });
  };

  /**
   * 调整大小结束
   */
  private handleResizeEnd = () => {
    this.isResizing = false;
    this.resizeDirection = '';
    
    // 清理动画帧
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = undefined;
    }

    // 移除调整大小样式类
    if (this.modalElement) {
      this.modalElement.classList.remove('resizing');
    }

    this.unbindResizeEvents();
  };

  /**
   * 绑定调整大小事件（支持鼠标和触摸）
   */
  private bindResizeEvents() {
    // 鼠标事件
    document.addEventListener('mousemove', this.handleResizeMove as EventListener);
    document.addEventListener('mouseup', this.handleResizeEnd);
    // 触摸事件
    document.addEventListener('touchmove', this.handleResizeMove as EventListener, { passive: false });
    document.addEventListener('touchend', this.handleResizeEnd, { passive: false });
    document.addEventListener('touchcancel', this.handleResizeEnd, { passive: false });
  }

  /**
   * 解绑调整大小事件（支持鼠标和触摸）
   */
  private unbindResizeEvents() {
    // 鼠标事件
    document.removeEventListener('mousemove', this.handleResizeMove as EventListener);
    document.removeEventListener('mouseup', this.handleResizeEnd);
    // 触摸事件
    document.removeEventListener('touchmove', this.handleResizeMove as EventListener);
    document.removeEventListener('touchend', this.handleResizeEnd);
    document.removeEventListener('touchcancel', this.handleResizeEnd);
  }




  /**
   * 显示模态框
   */
  @Method()
  async show() {
    this.setVisible(true);
  }

  /**
   * 隐藏模态框
   */
  @Method()
  async hide() {
    this.setVisible(false);
  }

  /**
   * 关闭模态框
   */
  @Method()
  async close() {
    await this.attemptClose('api');
  }

  /**
   * 最大化模态框
   */
  @Method()
  async maximize() {
    if (!this.modalElement || this.isMaximized) return;

    // 保存当前状态（相对于 wrap）
    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(this.modalElement);

    // 保存原始状态到dataset（相对 wrap 的像素值与尺寸）
    const origLeft = rect.left - wrapRect.left;
    const origTop = rect.top - wrapRect.top;
    const origWidth = this.modalElement.offsetWidth;
    const origHeight = this.modalElement.offsetHeight;

    this.modalElement.dataset.originalLeft = origLeft.toString();
    this.modalElement.dataset.originalTop = origTop.toString();
    this.modalElement.dataset.originalWidth = origWidth.toString();
    this.modalElement.dataset.originalHeight = origHeight.toString();
    this.modalElement.dataset.originalPosition = computedStyle.position;
    this.modalElement.dataset.originalTransform = computedStyle.transform;
    this.modalElement.dataset.originalMargin = computedStyle.margin;

    // 确保起始状态为绝对像素值（便于过渡）
    this.modalElement.style.position = 'absolute';
    this.modalElement.style.left = `${origLeft}px`;
    this.modalElement.style.top = `${origTop}px`;
    this.modalElement.style.width = `${origWidth}px`;
    this.modalElement.style.height = `${origHeight}px`;
    this.modalElement.style.transform = 'none';
    this.modalElement.style.margin = '0';

    // 设置最大化状态（触发过渡）
    this.isMaximized = true;
  }

  /**
   * 恢复模态框
   */
  @Method()
  async restore() {
    if (!this.modalElement || !this.isMaximized) return;

    // 先设置状态为非最大化，触发CSS transition
    this.isMaximized = false;

    // 等待一帧后恢复原始状态
    requestAnimationFrame(() => {
      if (!this.modalElement || this.isMaximized) return; // 防止在动画期间被重新最大化

      const originalLeft = this.modalElement.dataset.originalLeft;
      const originalTop = this.modalElement.dataset.originalTop;
      const originalWidth = this.modalElement.dataset.originalWidth;
      const originalHeight = this.modalElement.dataset.originalHeight;

      if (originalLeft && originalTop && originalWidth && originalHeight) {
        // 恢复为绝对定位 + 原像素尺寸/位置，保证过渡连贯
        this.modalElement.style.position = 'absolute';
        this.modalElement.style.left = `${originalLeft}px`;
        this.modalElement.style.top = `${originalTop}px`;
        this.modalElement.style.transform = 'none';
        this.modalElement.style.margin = '0';
        this.modalElement.style.width = `${originalWidth}px`;
        this.modalElement.style.height = `${originalHeight}px`;
      }
    });
  }

  /**
   * 切换最大化状态
   */
  @Method()
  async toggleMaximize() {
    if (this.isMaximized) {
      this.restore();
    } else {
      this.maximize();
    }
  }

  /**
   * 设置显示状态（内部使用，不触发Watch）
   */
  private setVisibleInternal(visible: boolean) {
    if (this.isVisible === visible) return;

    if (visible) {
      // 显示动画
      this.isAnimating = true;
      this.isClosing = false;
      this.isVisible = true;

      // 锁定背景滚动并隐藏页面滚动条
      this.bindScrollLock();
      this.lockBodyScroll();

      // zoom-origin 动画确保在首帧前设定 transform-origin
      if (this.animation === 'zoom-origin' && this.modalElement) {
        this.modalElement.style.visibility = 'hidden';
      }

      // 定位逻辑：优先恢复上次位置，否则按需居中
      if ((this.isDraggable || this.resizable || this.centered || this.maximizable) && this.modalElement) {
        this.modalElement.style.animation = this.animation === 'zoom-origin' ? 'none' : this.modalElement.style.animation;
        this.modalElement.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          if (this.isVisible) {
            this.applyLastPositionOrCenter();
            // 设置 zoom-origin 的起始点
            if (this.animation === 'zoom-origin') {
              try { this.setOriginFromPoint(this.getRecentPointer(), true); } catch (_) {}
            }
            this.modalElement!.style.visibility = 'visible';
            if (this.animation === 'zoom-origin') {
              void (this.modalElement as HTMLElement).offsetWidth;
              this.modalElement!.style.animation = '';
            }
          }
        });
      } else if (this.animation === 'zoom-origin' && this.modalElement) {
        // 非居中/拖拽等情况下也需要在首帧设置 origin
        requestAnimationFrame(() => {
          if (!this.isVisible) return;
          try { this.setOriginFromPoint(this.getRecentPointer(), true); } catch (_) {}
          this.modalElement!.style.visibility = 'visible';
          void (this.modalElement as HTMLElement).offsetWidth;
          this.modalElement!.style.animation = '';
        });
      }

      // 绑定滚动阴影
      this.bindBodyScrollSoon();

      // 动画结束后重置状态
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);

      // 入栈（作为栈顶）
      this.pushToStack();
    } else {
      // 关闭动画前：若是 zoom-origin，更新 origin
      if (this.animation === 'zoom-origin') {
        try { this.setOriginFromPoint(this.getCloseOriginPoint()); } catch (_) {}
      }

      // 关闭动画
      this.isAnimating = true;
      this.isClosing = true;

      // 等待动画完成后再隐藏，避免闪动
      setTimeout(() => {
        if (this.isClosing) { // 确保在动画期间没有被重新打开
          this.isVisible = false;
          this.isAnimating = false;
          this.isClosing = false;
          // 清理打开时记忆的起始点
          this.lastOpenViewportX = undefined;
          this.lastOpenViewportY = undefined;

          // 解除背景滚动锁
          this.unbindScrollLock();
          this.unlockBodyScroll();

          // 软键盘避让卸载
          this.detachKeyboardAvoid();

          // 出栈并恢复焦点
          this.removeFromStack();
          if (this.openerEl && document.contains(this.openerEl)) {
            try { this.openerEl.focus(); } catch (_) {}
          }
          this.openerEl = null;
        }
      }, 300);
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 设置显示状态（外部调用，同步visible属性）
   */
  private setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    if (visible) {
      // 记录 opener
      this.openerEl = (document.activeElement as HTMLElement) || null;

      // 显示动画
      this.isAnimating = true;
      this.isClosing = false;
      this.isVisible = true;
      this.visible = true;

      // 锁定背景滚动，并隐藏页面滚动条
      this.bindScrollLock();
      this.lockBodyScroll();

      // zoom-origin 动画：确保首帧前设定 transform-origin
      if (this.animation === 'zoom-origin' && this.modalElement) {
        this.modalElement.style.animation = 'none';
        this.modalElement.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          if (!this.isVisible) return;
          try { this.setOriginFromPoint(this.getRecentPointer(), true); } catch (_) {}
          this.modalElement!.style.visibility = 'visible';
          void (this.modalElement as HTMLElement).offsetWidth;
          this.modalElement!.style.animation = '';
        });
      }

      // 如果是拖拽模态框，尽早将居中定位转换为绝对定位，避免动画期间位置跳动
      if (this.isDraggable && this.modalElement) {
        // 打开瞬间先隐藏，等定位完成再显示，避免初帧位移闪烁
        this.modalElement.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          if (this.isVisible) {
            this.alignDialogToCenter();
            // 再次根据最终位置更新 origin（如果是 zoom-origin）
            if (this.animation === 'zoom-origin') {
              try { this.setOriginFromPoint(this.getRecentPointer()); } catch (_) {}
            }
            this.modalElement!.style.visibility = 'visible';
          }
        });
      }

      // 动画结束后重置状态
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);

      // 聚焦
      this.focusAfterOpen();

      // 移动端软键盘避让
      this.attachKeyboardAvoid();
    } else {
      // 关闭动画开始前：若是 zoom-origin，更新一次 origin（根据最近点击点或回退）
      if (this.animation === 'zoom-origin') {
        try { this.setOriginFromPoint(this.getCloseOriginPoint()); } catch (_) {}
      }

      // 关闭动画
      this.isAnimating = true;
      this.isClosing = true;

      // 等待动画完成后再隐藏，避免闪动
      setTimeout(() => {
        if (this.isClosing) { // 确保在动画期间没有被重新打开
          this.isVisible = false;
          this.visible = false;
          this.isAnimating = false;
          this.isClosing = false;
          // 清理打开时记忆的起始点
          this.lastOpenViewportX = undefined;
          this.lastOpenViewportY = undefined;

          // 解除背景滚动锁
          this.unbindScrollLock();
          this.unlockBodyScroll();

          // 出栈并恢复焦点
          this.removeFromStack();
          if (this.openerEl && document.contains(this.openerEl)) {
            try { this.openerEl.focus(); } catch (_) {}
          }
          this.openerEl = null;
        }
      }, 300);
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 获取模态框类名
   */
  private getModalClass() {
    const classes = ['ldesign-modal'];

    if (this.isVisible) {
      classes.push('ldesign-modal--visible');
    }

    if (this.centered) {
      classes.push('ldesign-modal--centered');
    }

    if (this.isDraggable) {
      classes.push('ldesign-modal--draggable');
    }

    if (this.isMaximized) {
      classes.push('ldesign-modal--maximized');
    }

    if (this.resizable) {
      classes.push('ldesign-modal--resizable');
    }

    // size=full 时为容器也打上标识，用于去掉 wrap padding
    if (this.size === 'full') {
      classes.push('ldesign-modal--fullsize');
    }

    // 变体：为容器增加标记（使用有效变体），便于样式去掉 wrap padding 等
    const vv = this.getCurrentVariant();
    if (vv === 'drawer-left' || vv === 'drawer-right') {
      classes.push('ldesign-modal--drawer');
    }
    if (vv === 'bottom-sheet') {
      classes.push('ldesign-modal--bottom-sheet');
    }

    // 添加动画类（zoom-origin 仅在 modal 变体下启用，否则回退为 zoom）
    if (this.animation) {
      let anim = this.animation as string;
      if (anim === 'zoom-origin' && vv !== 'modal') {
        anim = 'zoom';
      }
      if (this.isClosing) {
        classes.push(`ldesign-modal--${anim}-out`);
      } else {
        classes.push(`ldesign-modal--${anim}`);
      }
    }

    if (this.isClosing) {
      classes.push('ldesign-modal--closing');
    }

    return classes.join(' ');
  }

  /**
   * 获取对话框类名
   */
  private getDialogClass() {
    const classes = ['ldesign-modal__dialog'];

    classes.push(`ldesign-modal__dialog--${this.size}`);

    // 变体样式（使用有效变体）
    const vv = this.getCurrentVariant();
    if (vv && vv !== 'modal') {
      classes.push(`ldesign-modal__dialog--${vv}`);
    }

    return classes.join(' ');
  }

  private ensureAriaIds() {
    if (!this.titleId) this.titleId = `ld-modal-title-${generateId('id')}`;
    if (!this.bodyId) this.bodyId = `ld-modal-body-${generateId('id')}`;
  }

  private getWizardProgressStyle() {
    if (!this.wizard || !this.steps || this.steps.length <= 1) return { width: '0%' } as any;
    const ratio = Math.max(0, Math.min(1, this.currentStep / (this.steps.length - 1)));
    return { width: `${Math.round(ratio * 100)}%` } as any;
  }

  private parseSnap(v: number | string, wrapH: number): number {
    if (typeof v === 'number') {
      if (v > 0 && v <= 1) return v * wrapH; // 小数作为比例
      return v; // 像素
    }
    const s = String(v).trim();
    if (s.endsWith('%')) {
      const p = parseFloat(s) / 100;
      return Math.max(0, Math.min(1, p)) * wrapH;
    }
    if (s.endsWith('px')) {
      return parseFloat(s);
    }
    const n = parseFloat(s);
    if (!Number.isNaN(n)) return n;
    return wrapH; // 兜底：全高
  }


  /** 获取可聚焦元素 */
  private getFocusable(root: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]','area[href]','input:not([disabled])','select:not([disabled])','textarea:not([disabled])',
      'button:not([disabled])','iframe','object','embed','[tabindex]:not([tabindex="-1"])','[contenteditable=true]'
    ].join(',');
    const nodes = Array.from(root.querySelectorAll(selector)) as HTMLElement[];
    return nodes.filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  /**
   * 打开后聚焦管理
   */
  private focusAfterOpen() {
    const dialog = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement | null;
    if (!dialog) return;
    const tryInitial = () => {
      if (this.initialFocus) {
        const target = dialog.querySelector(this.initialFocus) as HTMLElement | null;
        if (target) { target.focus(); return true; }
      }
      const focusables = this.getFocusable(dialog);
      if (focusables.length) { focusables[0].focus(); return true; }
      dialog.setAttribute('tabindex','-1');
      dialog.focus();
      return true;
    };
    setTimeout(() => { tryInitial(); }, 0);
  }

  /**
   * 获取对话框样式
   */
  private getDialogStyle() {
    const style: any = {};

    if (this.width) {
      style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    if (this.height) {
      style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    if (this.top && !this.centered) {
      style.top = typeof this.top === 'number' ? `${this.top}px` : this.top;
    }

    return style;
  }

  /**
   * 获取内容区域类名
   */
  private getContentClass() {
    const classes = ['ldesign-modal__content'];

    // 如果没有标题和关闭按钮
    if (!this.modalTitle && !this.closable && !this.maximizable) {
      classes.push('ldesign-modal__content--no-header');
    }

    // 这里无法判断是否有 footer slot，需要在运行时判断
    // 可以通过检查 slot 内容来实现

    return classes.join(' ');
  }

  /**
   * 将对话框转换为相对于包裹容器的绝对居中位置（用于拖拽初次打开时）
   */
  private alignDialogToCenter() {
    if (!this.modalElement) return;
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement | null;
    if (!wrap) return;

    const dialog = this.modalElement as HTMLElement;
    // 使用已渲染尺寸进行计算（offset* 不受 transform 影响）
    const dialogWidth = dialog.offsetWidth;
    const dialogHeight = dialog.offsetHeight;
    const wrapWidth = wrap.clientWidth;
    const wrapHeight = wrap.clientHeight;

    // 考虑到 wrap 可能存在滚动条，中心点需加上滚动偏移
    const left = Math.max(0, wrap.scrollLeft + (wrapWidth - dialogWidth) / 2);
    const top = Math.max(0, wrap.scrollTop + (wrapHeight - dialogHeight) / 2);

    dialog.style.position = 'absolute';
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
    dialog.style.transform = 'none';
    dialog.style.margin = '0';
    // 若之前被隐藏，完成定位后显示
    if (dialog.style.visibility === 'hidden') {
      dialog.style.visibility = 'visible';
    }
  }

  /**
   * Host 移动到容器
   */
  private moveToContainer() {
    if (!this.getContainer) return;
    try {
      let target: HTMLElement | null = null;
      if (typeof this.getContainer === 'string') {
        target = document.querySelector(this.getContainer) as HTMLElement | null;
      } else if (this.getContainer && (this.getContainer as any).nodeType === 1) {
        target = this.getContainer as HTMLElement;
      }
      if (target && this.el.parentElement !== target) {
        target.appendChild(this.el);
      }
    } catch (_) {}
  }

  /**
   * 是否需要保持居中（centered=true 且未被用户拖动，或不可拖拽）
   */
  private shouldStickToCenter() {
    return this.centered && (!this.isDraggable || !this.hasUserMoved);
  }

  /**
   * 在某些情况下（窗口尺寸、属性变化）尝试重新居中
   */
  private repositionIfNeeded() {
    if (this.isVisible && this.shouldStickToCenter()) {
      this.alignDialogToCenter();
    }
  }

  /**
   * 窗口尺寸变化时，节流后重算位置
   */
  private handleWindowResize = () => {
    if (!this.isVisible || !this.shouldStickToCenter()) return;
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      this.alignDialogToCenter();
      this.resizeRaf = undefined;
    });
  };

  // 属性变化，保持居中
  @Watch('size') onSizeChange() { this.repositionIfNeeded(); }
  @Watch('width') onWidthChange() { this.repositionIfNeeded(); }
  @Watch('height') onHeightChange() { this.repositionIfNeeded(); }
  @Watch('centered') onCenteredChange() { this.repositionIfNeeded(); }

  /**
   * 绑定 body 滚动事件，稍后执行以等待 DOM 稳定
   */
  private bindBodyScrollSoon() {
    requestAnimationFrame(() => {
      this.bodyElement = this.el.querySelector('.ldesign-modal__body') as HTMLElement;
      this.unbindBodyScroll();
      if (this.bodyElement) {
        this.bodyElement.addEventListener('scroll', this.handleBodyScroll, { passive: true });
        this.updateScrollShadows();
      }
    });
  }

  private unbindBodyScroll() {
    if (this.bodyElement) {
      this.bodyElement.removeEventListener('scroll', this.handleBodyScroll);
    }
  }

  private handleBodyScroll = () => {
    this.updateScrollShadows();
  };

  private updateScrollShadows() {
    const body = this.el.querySelector('.ldesign-modal__body') as HTMLElement | null;
    if (!body) {
      this.showHeaderShadow = false;
      this.showFooterShadow = false;
      return;
    }
    const st = body.scrollTop;
    const sh = body.scrollHeight;
    const ch = body.clientHeight;
    this.showHeaderShadow = st > 0;
    this.showFooterShadow = st + ch < sh - 1;
  }

  /** 锁定/解锁页面滚动（委托给全局工具，支持多弹层叠加） */
  private lockBodyScroll() { lockPageScroll(); }
  private unlockBodyScroll() { unlockPageScroll(); }

  /**
   * 打开时优先恢复上次位置，否则按需居中
   */
  private applyLastPositionOrCenter() {
    if (!this.modalElement) return;

    const hasLast = this.lastLeft !== undefined && this.lastTop !== undefined;

    if (this.isDraggable) {
      // 可拖拽：优先恢复上次位置；若无记录则默认居中
      if (hasLast) {
        this.modalElement.style.position = 'absolute';
        this.modalElement.style.left = `${this.lastLeft}px`;
        this.modalElement.style.top = `${this.lastTop}px`;
        this.modalElement.style.transform = 'none';
        this.modalElement.style.margin = '0';
        if (this.lastWidth) this.modalElement.style.width = `${this.lastWidth}px`;
        if (this.lastHeight) this.modalElement.style.height = `${this.lastHeight}px`;
      } else {
        this.alignDialogToCenter();
      }
      return;
    }

    // 仅可调整大小或设置了 centered 的情况，按需居中
    const shouldCenter = this.shouldStickToCenter() || this.resizable;
    if (shouldCenter) {
      this.alignDialogToCenter();
    }
  }

  /** 软键盘避让 */
  private attachKeyboardAvoid() {
    if (!this.avoidKeyboard) return;
    const vv = (window as any).visualViewport;
    if (!vv) return;
    this.vv = vv;
    vv.addEventListener('resize', this.onVv, { passive: true } as any);
    vv.addEventListener('scroll', this.onVv, { passive: true } as any);
    this.applyKeyboardAvoid();
  }
  private detachKeyboardAvoid() {
    if (!this.vv) return;
    this.vv.removeEventListener('resize', this.onVv);
    this.vv.removeEventListener('scroll', this.onVv);
    this.vv = undefined;
    // 复位
    if (this.modalElement) this.modalElement.style.bottom = '';
  }
  private applyKeyboardAvoid() {
    if (!this.modalElement) return;
    if (this.getCurrentVariant() !== 'bottom-sheet') return;
    const vv = (window as any).visualViewport;
    if (!vv) return;
    const bottomInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    this.modalElement.style.bottom = bottomInset ? `${bottomInset}px` : '0px';
  }

  /** 统一尝试关闭 */
  private async attemptClose(reason: 'ok'|'close'|'mask'|'esc'|'api') {
    if (this.beforeClose) {
      const can = await Promise.resolve(this.beforeClose(reason));
      if (!can) return;
    }
    this.ldesignClose.emit();
    this.setVisible(false);
  }

  /** 栈操作与判定 */
  private inertTargets?: HTMLElement[];
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
    this.inertTargets = targets;
  }
  private clearInert() {
    if (!this.inertTargets) return;
    this.inertTargets.forEach((el) => {
      el.removeAttribute('aria-hidden');
      try { (el as any).removeAttribute('inert'); } catch (_) {}
    });
    this.inertTargets = undefined;
  }
  private pushToStack() {
    const prevTop = __modalStack[__modalStack.length - 1];
    if (prevTop && prevTop !== (this as any)) {
      try { prevTop.clearInert(); } catch (_) {}
    }
    const idx = __modalStack.indexOf(this as any);
    if (idx >= 0) __modalStack.splice(idx, 1);
    __modalStack.push(this as any);
    this.applyInert();
  }
  private removeFromStack() {
    const idx = __modalStack.indexOf(this as any);
    if (idx >= 0) __modalStack.splice(idx, 1);
    this.clearInert();
    const newTop = __modalStack[__modalStack.length - 1];
    if (newTop) {
      try { newTop.applyInert(); } catch (_) {}
    }
  }
  private isTopMost() {
    return __modalStack.length > 0 && __modalStack[__modalStack.length - 1] === (this as any);
  }
  
  /** 深色模式初始化 */
  private initDarkMode() {
    if (this.autoDetectDarkMode) {
      this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.handleDarkModeChange(this.darkModeQuery);
      this.darkModeQuery.addEventListener('change', this.handleDarkModeChange);
    }
    this.updateDarkModeClass();
  }
  
  private handleDarkModeChange = (e: MediaQueryList | MediaQueryListEvent) => {
    if (this.autoDetectDarkMode && !this.darkMode) {
      this.updateDarkModeClass(e.matches);
    }
  };
  
  private updateDarkModeClass(isDark?: boolean) {
    const shouldBeDark = isDark !== undefined ? isDark : this.darkMode;
    if (shouldBeDark) {
      this.el.classList.add('ldesign-modal--dark');
    } else {
      this.el.classList.remove('ldesign-modal--dark');
    }
  }
  
  private cleanupDarkMode() {
    if (this.darkModeQuery) {
      this.darkModeQuery.removeEventListener('change', this.handleDarkModeChange);
      this.darkModeQuery = undefined;
    }
  }
  
  /** 手势操作初始化 */
  private initGestures() {
    if (!this.modalElement) return;
    
    // 双指缩放手势
    let initialDistance = 0;
    let currentScale = 1;
    
    this.modalElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        e.preventDefault();
      }
    }, { passive: false });
    
    this.modalElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        currentScale = Math.min(Math.max(scale, 0.5), 2);
        if (this.modalElement) {
          this.modalElement.style.transform = `scale(${currentScale})`;
        }
        e.preventDefault();
      }
    }, { passive: false });
    
    this.modalElement.addEventListener('touchend', () => {
      if (currentScale < 0.8) {
        this.attemptClose('close');
      } else if (this.modalElement) {
        this.modalElement.style.transform = 'scale(1)';
      }
      initialDistance = 0;
      currentScale = 1;
    });
  }
  
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private isLastStep() { return !!(this.steps && this.currentStep >= (this.steps.length - 1)); }
  private async canStep(to: number) {
    if (!this.beforeStepChange) return true;
    try { return await Promise.resolve(this.beforeStepChange(this.currentStep, to)); }
    catch { return false; }
  }
  private async nextOrFinish() {
    if (this.wizard && this.steps && !this.isLastStep()) {
      const to = Math.min(this.currentStep + 1, this.steps.length - 1);
      if (!(await this.canStep(to))) return;
      this.currentStep = to;
      this.ldesignStepChange.emit(this.currentStep);
      return;
    }
    this.handleOkClick();
  }
  private async prevStep() {
    if (this.wizard && this.steps) {
      const to = Math.max(0, this.currentStep - 1);
      if (!(await this.canStep(to))) return;
      this.currentStep = to;
      this.ldesignStepChange.emit(this.currentStep);
    }
  }

  /** Drawer 边缘滑动关闭 */
  private handleDrawerSwipeStart(event: MouseEvent) {
    const vv = this.getCurrentVariant();
    if (!(vv === 'drawer-left' || vv === 'drawer-right')) return;
    if (!this.drawerSwipeToClose || !this.modalElement) return;
    if (event.button !== 0) return; // 仅左键
    this.isDrawerSwiping = true;
    this.drawerStartX = event.clientX;
    this.drawerStartTranslate = 0;
    this.drawerLastX = event.clientX; this.drawerLastT = performance.now();
    document.addEventListener('mousemove', this.handleDrawerSwipeMove);
    document.addEventListener('mouseup', this.handleDrawerSwipeEnd, { once: true } as any);
  }
  private handleDrawerSwipeMove = (event: MouseEvent) => {
    if (!this.isDrawerSwiping || !this.modalElement) return;
    // 安全兜底：若鼠标已松开，则结束滑动
    if ((event as MouseEvent).buttons === 0) { this.handleDrawerSwipeEnd(); return; }
    const vv = this.getCurrentVariant();
    const delta = event.clientX - this.drawerStartX;
    let t = delta;
    if (vv === 'drawer-left') t = Math.min(0, delta); // 向左为负
    if (vv === 'drawer-right') t = Math.max(0, delta); // 向右为正
    this.drawerStartTranslate = t;
    this.modalElement.style.transform = `translateX(${Math.round(t)}px)`;
    this.drawerLastX = event.clientX; this.drawerLastT = performance.now();
  };
  private handleDrawerSwipeEnd = () => {
    if (!this.modalElement) return;
    const w = this.modalElement.offsetWidth || 1;
    const distance = Math.abs(this.drawerStartTranslate);
    const th = this.parseSnap(this.drawerCloseThreshold ?? '30%', w);
    if (distance >= th) {
      // 关闭
      this.isDrawerSwiping = false;
      this.modalElement.style.transform = '';
      document.removeEventListener('mousemove', this.handleDrawerSwipeMove);
      this.attemptClose('close');
      return;
    }
    // 复位
    this.isDrawerSwiping = false;
    this.modalElement.style.transform = 'translateX(0px)';
    document.removeEventListener('mousemove', this.handleDrawerSwipeMove);
    document.removeEventListener('mouseup', this.handleDrawerSwipeEnd as any);
  };

  render() {
    // 只有在完全不可见且不在动画中且需要销毁时才返回null
    if (!this.isVisible && !this.isAnimating && this.destroyOnClose) {
      return null;
    }

    // 如果不可见且不在动画中，返回隐藏的元素而不是null
    const shouldShow = this.isVisible || this.isAnimating;

    this.ensureAriaIds();
    return (
      <Host
        role="dialog"
        aria-modal="true"
        aria-labelledby={this.modalTitle ? this.titleId : undefined}
        aria-describedby={this.bodyId}
        class={this.getModalClass()}
        style={{
          zIndex: this.zIndex.toString(),
          display: shouldShow ? 'block' : 'none',
          '--ld-modal-duration': this.duration ? `${this.duration}ms` : undefined,
          '--ld-modal-ease': this.ease || undefined,
          '--ld-modal-anim-ease': this.animEase || undefined,
        } as any}
      >
        {this.mask && (
          <div
            class="ldesign-modal__mask"
            onClick={this.handleMaskClick}
          />
        )}

        <div class="ldesign-modal__wrap">
          <div
            class={this.getDialogClass()}
            style={this.getDialogStyle()}
            onMouseDown={(e) => this.handleDrawerSwipeStart(e as any)}
          >
            <div class={this.getContentClass()}>
              {(this.modalTitle || this.closable) && (
                <div
                  class={`ldesign-modal__header ${this.isDraggable ? 'ldesign-modal__header--draggable' : ''} ${this.showHeaderShadow ? 'ldesign-modal__header--shadow' : ''}`}
                  onDblClick={this.maximizable ? this.handleMaximizeClick : null}
                  style={this.isDraggable ? { cursor: 'move' } : {}}
                >
                  {this.modalTitle && (
                    <div 
                      class="ldesign-modal__title" 
                      id={this.titleId}
                      onMouseDown={this.isDraggable ? (e) => this.handleDragStart(e) : null}
                      onTouchStart={this.isDraggable ? (e) => this.handleDragStart(e) : null}
                    >
                      {this.modalTitle}
                    </div>
                  )}

{this.wizard && Array.isArray(this.steps) && this.steps.length > 0 && (
                    <div class="ldesign-modal__wizard-header">
                      <div class="ldesign-modal__wizard-steps" aria-hidden="true">
                        {this.steps.map((t, i) => (
                          <span class={`ldesign-modal__wizard-step ${i <= this.currentStep ? 'is-active' : ''}`}>{i+1}</span>
                        ))}
                      </div>
                      <div class="ldesign-modal__wizard-progress" aria-hidden="true">
                        <div class="ldesign-modal__wizard-progress-inner" style={this.getWizardProgressStyle()} />
                      </div>
                    </div>
                  )}

                  <div class="ldesign-modal__actions">
                    {this.maximizable && (
                      <span
                        class="ldesign-modal__maximize"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.handleMaximizeClick();
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        title={this.isMaximized ? '还原' : '最大化'}
                        role="button"
                        tabindex="0"
                      >
                        {this.isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                      </span>
                    )}

                    {this.closable && (
                      <span
                        class="ldesign-modal__close"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.handleCloseClick(e as any);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        title="关闭"
                        role="button"
                        tabindex="0"
                      >
                        <CloseIcon />
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div class="ldesign-modal__body" id={this.bodyId}>
                {this.wizard && Array.isArray(this.steps) && this.steps.length > 0 ? (
                  <slot name={`step-${this.currentStep}`} />
                ) : (
                  <slot />
                )}
              </div>

              <div class={`ldesign-modal__footer ${this.showFooterShadow ? 'ldesign-modal__footer--shadow' : ''}`}>
                <slot name="footer">
                  {this.wizard ? (
                    <div class="ldesign-modal__footer-group">
                      <ldesign-button type={this.cancelType} onClick={this.handleCloseClick}>
                        取消
                      </ldesign-button>
                      <ldesign-button type="secondary" onClick={() => this.prevStep()} disabled={this.currentStep <= 0}>
                        上一步
                      </ldesign-button>
                      <ldesign-button type={this.okType} onClick={() => this.nextOrFinish()} loading={this.okLoading}>
                        {this.isLastStep() ? '完成' : '下一步'}
                      </ldesign-button>
                    </div>
                  ) : (
                    <div class="ldesign-modal__footer-group">
                      <ldesign-button type={this.cancelType} onClick={this.handleCloseClick}>
                        {this.cancelText}
                      </ldesign-button>
                      <ldesign-button type={this.okType} onClick={this.handleOkClick} loading={this.okLoading} disabled={this.okDisabled}>
                        {this.okText}
                      </ldesign-button>
                    </div>
                  )}
                </slot>
              </div>
            </div>

            {/* 调整大小手柄 */}
            {this.resizable && !this.isMaximized && (
              <div class="ldesign-modal__resize-handles">
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'top')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'top')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--right" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'right')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'right')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'bottom')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'bottom')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--left" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'left')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top-left" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'top-left')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'top-left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top-right" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'top-right')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'top-right')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom-left" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'bottom-left')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'bottom-left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom-right" 
                     onMouseDown={(e) => this.handleResizeStart(e, 'bottom-right')} 
                     onTouchStart={(e) => this.handleResizeStart(e, 'bottom-right')} />
              </div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
