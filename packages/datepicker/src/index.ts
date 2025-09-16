/**
 * LDesign DatePicker 组件库
 * 跨平台日期选择器组件库，支持 PC、平板、手机三端响应式适配，框架无关实现
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== 核心类导出 ====================

// 主要API类
export { DatePicker } from './core/DatePicker';

// 日历核心类
export { Calendar } from './core/Calendar';

// 事件管理类
export { EventManager } from './core/EventManager';

// 主题管理类
export { ThemeManager } from './core/ThemeManager';

// ==================== 工具类导出 ====================

// 日期工具类
export { DateUtils } from './utils/DateUtils';

// DOM工具类
export { DOMUtils } from './utils/DOMUtils';

// 验证工具类
export { ValidationUtils } from './utils/ValidationUtils';

// ==================== 类型定义导出 ====================

// 基础类型
export type {
  DatePickerMode,
  SelectionType,
  DeviceType,
  ThemeType,
  ViewMode,
  DateFormat,
  DateValue,
  DateRange,
  MultipleDates,
  DatePickerValue,
  DatePickerConfig,
  CalendarCell,
  CalendarData,
  ThemeConfig,
  EventListener,
  EventListenerConfig,
  EventData,
  DeepPartial,
  DeepReadonly,
  Callback,
  AsyncCallback
} from './types';

// 事件相关类型
export type {
  DatePickerEventName,
  DatePickerEventData,
  DatePickerEventHandlers,
  DatePickerEventHandler,
  BaseEventData,
  ChangeEventData,
  SelectEventData,
  ClearEventData,
  OpenCloseEventData,
  ViewChangeEventData,
  MonthChangeEventData,
  YearChangeEventData,
  ThemeChangeEventData,
  DeviceChangeEventData,
  ErrorEventData,
  FocusEventData,
  ReadyEventData,
  DestroyEventData
} from './types/events';

// 验证相关类型
export type {
  ValidationRuleType,
  ValidationSeverity,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationInfo,
  ValidationRule,
  ValidationConfig,
  ValidationContext,
  Validator,
  RequiredRule,
  MinDateRule,
  MaxDateRule,
  DateRangeRule,
  FormatRule,
  CustomRule,
  WeekdayRule,
  HolidayRule,
  BusinessDayRule
} from './types/validation';

// DOM相关类型
export type {
  ContainerElement,
  EventTarget,
  DOMSelector,
  Position,
  Size,
  Bounds,
  ScrollInfo,
  ViewportInfo,
  CSSStyleObject,
  CSSClassName,
  CSSVariables,
  StyleConfig,
  DOMEventMap,
  DOMEventName,
  DOMEventHandler,
  EventListenerOptions,
  AnimationConfig,
  TransitionConfig,
  DragData,
  DragConfig,
  TouchPoint,
  GestureData,
  MediaQueryConfig,
  BreakpointConfig,
  ResponsiveConfig
} from './types/dom';

// ==================== 常量导出 ====================

// 事件名称常量
export { DatePickerEvents } from './types/events';

// 预定义验证规则
export { PreDefinedRules } from './types/validation';

// ==================== 默认配置导出 ====================

/**
 * 默认日期选择器配置
 */
export const DEFAULT_CONFIG: DatePickerConfig = {
  mode: 'date',
  selectionType: 'single',
  placeholder: '请选择日期',
  format: 'YYYY-MM-DD',
  disabled: false,
  readonly: false,
  clearable: true,
  showToday: true,
  showTime: false,
  deviceType: 'auto',
  theme: 'auto',
  locale: 'zh-CN',
  autoClose: true,
  placement: 'auto'
};

/**
 * 默认主题配置
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  type: 'light',
  primaryColor: '#1890ff',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#d9d9d9',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  borderRadius: '6px'
};

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  {
    name: 'mobile',
    maxWidth: 767,
    mediaQuery: '(max-width: 767px)'
  },
  {
    name: 'tablet',
    minWidth: 768,
    maxWidth: 1023,
    mediaQuery: '(min-width: 768px) and (max-width: 1023px)'
  },
  {
    name: 'desktop',
    minWidth: 1024,
    mediaQuery: '(min-width: 1024px)'
  }
];

// ==================== 工具函数导出 ====================

/**
 * 创建日期选择器实例
 * @param config 配置选项
 * @returns 日期选择器实例
 */
export function createDatePicker(config?: Partial<DatePickerConfig>): DatePicker {
  return new DatePicker(config);
}

/**
 * 创建主题管理器实例
 * @param config 主题配置
 * @returns 主题管理器实例
 */
export function createThemeManager(config?: Partial<ThemeConfig>): ThemeManager {
  return new ThemeManager(config);
}

/**
 * 检测设备类型
 * @returns 设备类型
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  
  const width = window.innerWidth;
  
  if (width <= 767) {
    return 'mobile';
  } else if (width <= 1023) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * 检测系统主题
 * @returns 主题类型
 */
export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

/**
 * 格式化日期
 * @param date 日期值
 * @param format 格式字符串
 * @returns 格式化后的字符串
 */
export function formatDate(date: DateValue, format: string = 'YYYY-MM-DD'): string {
  return DateUtils.format(date, format);
}

/**
 * 解析日期字符串
 * @param dateString 日期字符串
 * @param format 格式字符串
 * @returns 日期对象
 */
export function parseDate(dateString: string, format?: string): Date | null {
  return DateUtils.parse(dateString, format);
}

/**
 * 验证日期
 * @param date 日期值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateDate(date: DateValue, rules: ValidationRule[]): ValidationResult {
  return ValidationUtils.validate(date, rules);
}

// ==================== 版本信息 ====================

/**
 * 组件库版本信息
 */
export const VERSION = '1.0.0';

/**
 * 组件库名称
 */
export const NAME = '@ldesign/datepicker';

/**
 * 组件库描述
 */
export const DESCRIPTION = '跨平台日期选择器组件库，支持 PC、平板、手机三端响应式适配，框架无关实现';

// ==================== 默认导出 ====================

/**
 * 默认导出日期选择器类
 */
export default DatePicker;
