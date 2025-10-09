/**
 * @fileoverview Drawer component type definitions
 * @module drawer.types
 */

/** 抽屉位置 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/** 抽屉大小单位 */
export type DrawerSizeUnit = 'px' | '%' | 'vh' | 'vw' | 'rem' | 'em';

/** 动画类型 */
export type AnimationType = 'slide' | 'fade' | 'zoom' | 'rotate' | 'flip' | 'bounce' | 'elastic';

/** 动画缓动函数 */
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';

/** 主题类型 */
export type DrawerTheme = 'light' | 'dark' | 'auto' | 'custom';

/** 拖拽手柄位置 */
export type ResizeHandlePosition = 'edge' | 'corner' | 'both';

/** 滑动关闭触发区域 */
export type SwipeTriggerArea = 'anywhere' | 'handle' | 'header' | 'edge';

/** 焦点捕获策略 */
export type FocusTrapStrategy = 'strict' | 'loose' | 'disabled';

/** 关闭原因 */
export type CloseReason = 'mask' | 'escape' | 'button' | 'swipe' | 'api' | 'route';

/** 抽屉状态 */
export type DrawerState = 'closed' | 'opening' | 'open' | 'closing' | 'minimized' | 'maximized';

/** 滚动行为 */
export type ScrollBehavior = 'lock' | 'unlock' | 'overlay' | 'push';

/** 按钮类型 */
export type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'link';

/** 尺寸预设 */
export type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

/** 抽屉层级 */
export type DrawerLevel = 'normal' | 'high' | 'top' | 'modal';


/** 吸附点配置 */
export interface SnapPoint {
  value: number;
  label?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

/** 按钮配置 */
export interface DrawerButton {
  id?: string;
  text: string;
  type?: ButtonType;
  onClick?: (event: MouseEvent) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  tooltip?: string;
  className?: string;
  hidden?: boolean;
  confirm?: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  };
}

/** 加载状态配置 */
export interface LoadingConfig {
  show: boolean;
  text?: string;
  spinner?: boolean;
  overlay?: boolean;
  progress?: number;
  cancelable?: boolean;
}

/** 头部配置 */
export interface HeaderConfig {
  title?: string;
  subtitle?: string;
  icon?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  actions?: HeaderAction[];
  sticky?: boolean;
  className?: string;
  height?: number | string;
}

/** 头部操作 */
export interface HeaderAction {
  id?: string;
  icon: string;
  tooltip?: string;
  onClick: (event: MouseEvent) => void;
  disabled?: boolean;
  badge?: string | number;
  className?: string;
}

/** 底部配置 */
export interface FooterConfig {
  show?: boolean;
  sticky?: boolean;
  className?: string;
  height?: number | string;
  buttons?: DrawerButton[];
  align?: 'left' | 'center' | 'right' | 'space-between';
}

/** 动画配置 */
export interface AnimationConfig {
  enabled: boolean;
  type?: AnimationType;
  duration?: number;
  delay?: number;
  easing?: AnimationEasing;
  customAnimation?: string;
}

/** 拖拽配置 */
export interface ResizeConfig {
  enabled: boolean;
  handlePosition?: ResizeHandlePosition;
  minSize?: number | string;
  maxSize?: number | string;
  snapPoints?: SnapPoint[];
  snapThreshold?: number;
  preserveAspectRatio?: boolean;
  showGuides?: boolean;
  showSizeHint?: boolean;
}

/** 滑动配置 */
export interface SwipeConfig {
  enabled: boolean;
  threshold?: number;
  velocity?: number;
  triggerArea?: SwipeTriggerArea;
  direction?: 'horizontal' | 'vertical' | 'both';
  preventScroll?: boolean;
  damping?: number;
}

/** 键盘配置 */
export interface KeyboardConfig {
  enabled: boolean;
  closeOnEsc?: boolean;
  focusTrap?: FocusTrapStrategy;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  tabIndex?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

/** 无障碍配置 */
export interface A11yConfig extends KeyboardConfig {
  role?: string;
  ariaModal?: boolean;
  ariaLive?: 'polite' | 'assertive' | 'off';
  announceOpen?: string;
  announceClose?: string;
  labelledBy?: string;
}

/** 虚拟化配置 */
export interface VirtualizationConfig {
  enabled: boolean;
  itemHeight?: number;
  buffer?: number;
  threshold?: number;
  scrollDebounce?: number;
}

/** 性能配置 */
export interface PerformanceConfig {
  lazyLoad?: boolean;
  preload?: boolean;
  virtualization?: VirtualizationConfig;
  debounceResize?: number;
  throttleScroll?: number;
  useTransform?: boolean;
  useWillChange?: boolean;
  gpuAcceleration?: boolean;
}


/** 抽屉选项 */
export interface DrawerOptions {
  placement?: DrawerPlacement;
  size?: number | string | SizePreset;
  mask?: boolean;
  maskClosable?: boolean;
  maskStyle?: Partial<CSSStyleDeclaration>;
  maskClass?: string;
  closable?: boolean;
  keyboard?: boolean | KeyboardConfig;
  animation?: boolean | AnimationConfig;
  resize?: boolean | ResizeConfig;
  swipe?: boolean | SwipeConfig;
  header?: boolean | HeaderConfig;
  footer?: boolean | FooterConfig;
  loading?: boolean | LoadingConfig;
  theme?: DrawerTheme;
  level?: DrawerLevel;
  container?: string | HTMLElement;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  zIndex?: number;
  rounded?: boolean;
  borderRadius?: string;
  padding?: string | boolean;
  scroll?: ScrollBehavior;
  fullscreen?: boolean;
  fullscreenable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  performance?: PerformanceConfig;
  a11y?: A11yConfig;
  destroyOnClose?: boolean;
  beforeOpen?: () => boolean | Promise<boolean>;
  beforeClose?: (reason?: CloseReason) => boolean | Promise<boolean>;
  afterOpen?: () => void;
  afterClose?: () => void;
  onStateChange?: (state: DrawerState) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onSwipe?: (progress: number) => void;
}

/** 抽屉实例方法 */
export interface DrawerInstance {
  open(): Promise<void>;
  close(reason?: CloseReason): Promise<void>;
  toggle(): Promise<void>;
  minimize(): void;
  maximize(): void;
  restore(): void;
  resize(size: number | string): void;
  snapTo(point: SnapPoint): void;
  showLoading(config?: Partial<LoadingConfig>): void;
  hideLoading(): void;
  setHeader(config: Partial<HeaderConfig>): void;
  setFooter(config: Partial<FooterConfig>): void;
  updateOptions(options: Partial<DrawerOptions>): void;
  destroy(): void;
  getState(): DrawerState;
  getSize(): { width: number; height: number };
  isOpen(): boolean;
  isMinimized(): boolean;
  isMaximized(): boolean;
  focus(): void;
  blur(): void;
}

/** 事件详情 */
export interface DrawerEventDetail {
  drawer: DrawerInstance;
  state?: DrawerState;
  reason?: CloseReason;
  size?: { width: number; height: number };
  progress?: number;
}

/** 抽屉管理器配置 */
export interface DrawerManagerConfig {
  maxStack?: number;
  defaultOptions?: Partial<DrawerOptions>;
  container?: HTMLElement;
  zIndexBase?: number;
  singleton?: boolean;
}

/** 抽屉管理器 */
export interface DrawerManager {
  create(options: DrawerOptions): DrawerInstance;
  open(id: string, options?: DrawerOptions): Promise<DrawerInstance>;
  close(id: string, reason?: CloseReason): Promise<void>;
  closeAll(reason?: CloseReason): Promise<void>;
  get(id: string): DrawerInstance | undefined;
  getAll(): DrawerInstance[];
  has(id: string): boolean;
  destroy(id: string): void;
  destroyAll(): void;
  setDefault(options: Partial<DrawerOptions>): void;
  getStack(): DrawerInstance[];
  getTop(): DrawerInstance | undefined;
}

/** 预设配置 */
export interface DrawerPreset {
  name: string;
  options: Partial<DrawerOptions>;
  description?: string;
  icon?: string;
}

/** 国际化配置 */
export interface DrawerI18n {
  locale: string;
  messages: {
    close?: string;
    minimize?: string;
    maximize?: string;
    restore?: string;
    loading?: string;
    confirm?: string;
    cancel?: string;
    [key: string]: string | undefined;
  };
}