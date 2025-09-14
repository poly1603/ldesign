/**
 * LDesign DatePicker 组件库入口文件
 * 导出所有公共 API 和类型定义
 */

// 导出核心类
export { DatePicker } from './core/DatePicker';
export { Calendar } from './core/Calendar';
export { EventManager } from './core/EventManager';
export { ThemeManager } from './core/ThemeManager';

// 导出选择器类 (暂时注释，待实现)
// export { YearPicker } from './pickers/YearPicker';
// export { MonthPicker } from './pickers/MonthPicker';
// export { DatePickerCore } from './pickers/DatePicker';
// export { DateTimePicker } from './pickers/DateTimePicker';

// 导出工具类
export { DateUtils } from './utils/DateUtils';
export { DOMUtils } from './utils/DOMUtils';
export { ValidationUtils } from './utils/ValidationUtils';

// 导出框架适配器 (暂时注释，待实现)
// export { VueAdapter } from './adapters/vue';
// export { ReactAdapter } from './adapters/react';
// export { AngularAdapter } from './adapters/angular';

// 导出所有类型定义
export type {
  DateValue,
  DateRange,
  SelectionMode,
  ViewMode,
  DeviceType,
  ThemeType,
  LocaleType,
  DateFormatOptions,
  DatePickerOptions,
  DatePickerEvents,
  CalendarCell,
  CalendarData,
  ValidationResult,
  LocaleConfig,
  ThemeConfig,
  FrameworkAdapter
} from './types';

// 导出样式
import './styles/index.less';

// 版本信息
export const version = '1.0.0';

// 默认导出主类
import { DatePicker } from './core/DatePicker';
export default DatePicker;
