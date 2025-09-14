/**
 * LDesign DatePicker 类型定义
 * 定义所有核心接口和类型
 */

// 基础日期值类型
export type DateValue = Date | string | number | null | undefined;

// 日期范围类型
export interface DateRange {
  /** 开始日期 */
  start: DateValue;
  /** 结束日期 */
  end: DateValue;
}

// 选择模式类型
export type SelectionMode = 'single' | 'multiple' | 'range';

// 视图模式类型
export type ViewMode = 'year' | 'month' | 'date' | 'datetime' | 'time';

// 设备类型
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 主题类型
export type ThemeType = 'light' | 'dark' | 'auto';

// 语言类型
export type LocaleType = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | string;

// 日期格式化选项
export interface DateFormatOptions {
  /** 年份格式 */
  year?: 'numeric' | '2-digit';
  /** 月份格式 */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  /** 日期格式 */
  day?: 'numeric' | '2-digit';
  /** 小时格式 */
  hour?: 'numeric' | '2-digit';
  /** 分钟格式 */
  minute?: 'numeric' | '2-digit';
  /** 秒格式 */
  second?: 'numeric' | '2-digit';
  /** 12/24小时制 */
  hour12?: boolean;
}

// 日期选择器配置选项
export interface DatePickerOptions {
  /** 选择模式 */
  mode?: ViewMode;
  /** 选择类型 */
  selectionType?: SelectionMode;
  /** 日期格式 */
  format?: string;
  /** 语言设置 */
  locale?: LocaleType;
  /** 主题设置 */
  theme?: ThemeType;
  /** 是否启用响应式 */
  responsive?: boolean;
  /** 最小日期 */
  minDate?: DateValue;
  /** 最大日期 */
  maxDate?: DateValue;
  /** 禁用的日期 */
  disabledDates?: DateValue[];
  /** 默认值 */
  defaultValue?: DateValue | DateValue[] | DateRange;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示今天按钮 */
  showToday?: boolean;
  /** 是否显示清空按钮 */
  showClear?: boolean;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 是否自动关闭 */
  autoClose?: boolean;
  /** 弹出位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>;
  /** 容器元素 */
  container?: HTMLElement | string;
  /** 是否追加到 body */
  appendToBody?: boolean;
  /** z-index 值 */
  zIndex?: number;
  /** 动画持续时间 */
  animationDuration?: number;
  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean;
  /** 虚拟滚动项目高度 */
  itemHeight?: number;
  /** 可见项目数量 */
  visibleItemCount?: number;
}

// 事件类型定义
export interface DatePickerEvents {
  /** 值改变事件 */
  'change': (value: DateValue | DateValue[] | DateRange) => void;
  /** 选择事件 */
  'select': (value: DateValue) => void;
  /** 清空事件 */
  'clear': () => void;
  /** 显示事件 */
  'show': () => void;
  /** 隐藏事件 */
  'hide': () => void;
  /** 确认事件 */
  'confirm': (value: DateValue | DateValue[] | DateRange) => void;
  /** 取消事件 */
  'cancel': () => void;
  /** 视图改变事件 */
  'view-change': (mode: ViewMode) => void;
  /** 月份改变事件 */
  'month-change': (year: number, month: number) => void;
  /** 年份改变事件 */
  'year-change': (year: number) => void;
  /** 挂载完成事件 */
  'mount-complete': () => void;
  /** 渲染完成事件 */
  'render-complete': () => void;
  /** 卸载完成事件 */
  'unmount-complete': () => void;
}

// 日历单元格数据
export interface CalendarCell {
  /** 日期值 */
  date: Date;
  /** 显示文本 */
  text: string;
  /** 是否为当前月 */
  isCurrentMonth: boolean;
  /** 是否为今天 */
  isToday: boolean;
  /** 是否被选中 */
  isSelected: boolean;
  /** 是否在范围内 */
  isInRange: boolean;
  /** 是否为范围开始 */
  isRangeStart: boolean;
  /** 是否为范围结束 */
  isRangeEnd: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
  /** 是否为周末 */
  isWeekend: boolean;
  /** 自定义类名 */
  className?: string;
}

// 日历数据
export interface CalendarData {
  /** 年份 */
  year: number;
  /** 月份 */
  month: number;
  /** 日历单元格数据 */
  cells: CalendarCell[];
  /** 周标题 */
  weekdays: string[];
}

// 验证结果
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  message?: string;
  /** 错误代码 */
  code?: string;
}

// 国际化配置
export interface LocaleConfig {
  /** 语言代码 */
  code: string;
  /** 语言名称 */
  name: string;
  /** 月份名称 */
  months: string[];
  /** 月份简称 */
  monthsShort: string[];
  /** 星期名称 */
  weekdays: string[];
  /** 星期简称 */
  weekdaysShort: string[];
  /** 星期最简称 */
  weekdaysMin: string[];
  /** 今天文本 */
  today: string;
  /** 清空文本 */
  clear: string;
  /** 确认文本 */
  confirm: string;
  /** 取消文本 */
  cancel: string;
  /** 占位符文本 */
  placeholder: {
    date: string;
    month: string;
    year: string;
    time: string;
    datetime: string;
  };
}

// 主题配置
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** CSS 变量 */
  variables: Record<string, string>;
}

// 框架适配器接口
export interface FrameworkAdapter {
  /** 适配器名称 */
  name: string;
  /** 创建组件 */
  createComponent: (options: DatePickerOptions) => unknown;
  /** 更新属性 */
  updateProps: (component: unknown, props: Partial<DatePickerOptions>) => void;
  /** 销毁组件 */
  destroy: (component: unknown) => void;
}

// 导出其他类型文件的类型
export type * from './DatePicker';
export type * from './Calendar';
