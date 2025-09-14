/**
 * DatePicker 核心类型定义
 */

import type {
  DateValue,
  DateRange,
  SelectionMode,
  ViewMode,
  DeviceType,
  ThemeType,
  LocaleType,
  DatePickerOptions,
  DatePickerEvents,
  ValidationResult
} from './index';

// DatePicker 实例接口
export interface IDatePicker {
  // 基础方法
  mount(element: HTMLElement): void;
  unmount(): void;
  destroy(): void;
  
  // 值操作
  getValue(): DateValue | DateValue[] | DateRange;
  setValue(value: DateValue | DateValue[] | DateRange): void;
  clear(): void;
  
  // 状态控制
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
  
  // 配置更新
  updateOptions(options: Partial<DatePickerOptions>): void;
  getOptions(): DatePickerOptions;
  
  // 事件监听
  on<K extends keyof DatePickerEvents>(event: K, callback: DatePickerEvents[K]): void;
  off<K extends keyof DatePickerEvents>(event: K, callback?: DatePickerEvents[K]): void;
  emit<K extends keyof DatePickerEvents>(event: K, ...args: Parameters<DatePickerEvents[K]>): void;
  
  // 验证
  validate(): ValidationResult;
  
  // 国际化
  setLocale(locale: LocaleType): void;
  getLocale(): LocaleType;
  
  // 主题
  setTheme(theme: ThemeType): void;
  getTheme(): ThemeType;
  
  // 设备检测
  getDeviceType(): DeviceType;
  
  // 状态查询
  isDisabled(): boolean;
  isReadonly(): boolean;
  isEmpty(): boolean;
}

// DatePicker 构造函数参数
export interface DatePickerConstructorOptions extends DatePickerOptions {
  // 可以在这里添加构造函数特有的选项
}

// DatePicker 内部状态
export interface DatePickerState {
  /** 当前值 */
  value: DateValue | DateValue[] | DateRange;
  /** 是否可见 */
  visible: boolean;
  /** 当前视图模式 */
  currentMode: ViewMode;
  /** 当前年份 */
  currentYear: number;
  /** 当前月份 */
  currentMonth: number;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
  /** 是否已挂载 */
  mounted: boolean;
}

// 内部事件类型
export interface InternalEvents {
  /** 状态改变 */
  'state-change': (state: Partial<DatePickerState>) => void;
  /** 渲染完成 */
  'render-complete': () => void;
  /** 挂载完成 */
  'mount-complete': () => void;
  /** 卸载完成 */
  'unmount-complete': () => void;
  /** 错误发生 */
  'error': (error: Error) => void;
}

// 渲染上下文
export interface RenderContext {
  /** 容器元素 */
  container: HTMLElement;
  /** 当前状态 */
  state: DatePickerState;
  /** 配置选项 */
  options: DatePickerOptions;
  /** 设备类型 */
  deviceType: DeviceType;
  /** 是否为移动端 */
  isMobile: boolean;
  /** 容器尺寸 */
  containerSize: {
    width: number;
    height: number;
  };
}

// 选择器配置
export interface PickerConfig {
  /** 选择器类型 */
  type: ViewMode;
  /** 选择模式 */
  selectionMode: SelectionMode;
  /** 最小值 */
  min?: DateValue;
  /** 最大值 */
  max?: DateValue;
  /** 禁用的值 */
  disabled?: DateValue[];
  /** 步长 */
  step?: number;
  /** 格式化函数 */
  formatter?: (value: DateValue) => string;
  /** 解析函数 */
  parser?: (text: string) => DateValue;
}

// 动画配置
export interface AnimationConfig {
  /** 动画类型 */
  type: 'fade' | 'slide' | 'scale' | 'none';
  /** 动画持续时间 */
  duration: number;
  /** 动画缓动函数 */
  easing: string;
  /** 动画方向 */
  direction?: 'up' | 'down' | 'left' | 'right';
}

// 位置配置
export interface PositionConfig {
  /** 弹出位置 */
  placement: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** 偏移量 */
  offset: {
    x: number;
    y: number;
  };
  /** 是否自动调整位置 */
  autoAdjust: boolean;
  /** 边界元素 */
  boundary?: HTMLElement;
}

// 虚拟滚动配置
export interface VirtualScrollConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 项目高度 */
  itemHeight: number;
  /** 可见项目数量 */
  visibleCount: number;
  /** 缓冲区大小 */
  bufferSize: number;
  /** 滚动阈值 */
  threshold: number;
}
