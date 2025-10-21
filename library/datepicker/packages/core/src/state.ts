/**
 * 日期选择器状态管理
 */

import type {
  PickerType,
  ViewType,
  PickerValue,
  DateValue,
  DateRangeValue,
  DatesValue,
  DisabledDateFunc,
  DisabledTimeFunc,
  Shortcut,
  Locale,
  WeekDay,
} from '@ldesign/datepicker-shared';
import { EventEmitter, cloneDate, parseDate } from '@ldesign/datepicker-shared';

export interface DatePickerState {
  // 当前选中的值
  value: PickerValue;
  
  // 临时选择的值（用于范围选择）
  tempValue: PickerValue;
  
  // 当前视图类型
  view: ViewType;
  
  // 当前显示的日期（用于面板导航）
  currentDate: Date;
  
  // 是否显示面板
  visible: boolean;
  
  // 是否聚焦
  focused: boolean;
  
  // 范围选择的起始日期（临时）
  rangeStart: Date | null;
  
  // 悬停的日期（用于范围预览）
  hoverDate: Date | null;
  
  // 当前面板索引（范围选择时有两个面板）
  panelIndex: number;
}

export interface DatePickerConfig {
  type: PickerType;
  format?: string;
  valueFormat?: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  defaultValue?: PickerValue;
  defaultTime?: Date | [Date, Date];
  disabledDate?: DisabledDateFunc;
  disabledTime?: DisabledTimeFunc;
  shortcuts?: Shortcut[];
  clearable?: boolean;
  editable?: boolean;
  unlinkPanels?: boolean;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
  showWeekNumber?: boolean;
  locale?: Locale;
  
  // 回调
  onChange?: (value: PickerValue) => void;
  onInput?: (value: PickerValue) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onClear?: () => void;
  onVisibleChange?: (visible: boolean) => void;
  onPanelChange?: (date: Date, mode: ViewType) => void;
}

export class DatePickerCore {
  private state: DatePickerState;
  private config: Required<Omit<DatePickerConfig, 'onChange' | 'onInput' | 'onBlur' | 'onFocus' | 'onClear' | 'onVisibleChange' | 'onPanelChange'>>;
  private emitter: EventEmitter;

  constructor(config: DatePickerConfig) {
    this.emitter = new EventEmitter();
    
    // 初始化配置（带默认值）
    this.config = {
      type: config.type,
      format: config.format || this.getDefaultFormat(config.type),
      valueFormat: config.valueFormat || 'YYYY-MM-DD HH:mm:ss',
      placeholder: config.placeholder || '选择日期',
      startPlaceholder: config.startPlaceholder || '开始日期',
      endPlaceholder: config.endPlaceholder || '结束日期',
      rangeSeparator: config.rangeSeparator || '至',
      defaultValue: config.defaultValue || this.getDefaultValue(config.type),
      defaultTime: config.defaultTime || this.getDefaultTime(config.type),
      disabledDate: config.disabledDate || (() => false),
      disabledTime: config.disabledTime || (() => ({})),
      shortcuts: config.shortcuts || [],
      clearable: config.clearable ?? true,
      editable: config.editable ?? true,
      unlinkPanels: config.unlinkPanels ?? false,
      weekStartsOn: config.weekStartsOn ?? 1,
      use12Hours: config.use12Hours ?? false,
      showWeekNumber: config.showWeekNumber ?? false,
      locale: config.locale || ({} as Locale), // 会在外部传入
    };

    // 初始化状态
    this.state = {
      value: this.config.defaultValue,
      tempValue: this.config.defaultValue,
      view: this.getDefaultView(config.type),
      currentDate: new Date(),
      visible: false,
      focused: false,
      rangeStart: null,
      hoverDate: null,
      panelIndex: 0,
    };

    // 注册回调
    if (config.onChange) this.on('change', config.onChange);
    if (config.onInput) this.on('input', config.onInput);
    if (config.onBlur) this.on('blur', config.onBlur);
    if (config.onFocus) this.on('focus', config.onFocus);
    if (config.onClear) this.on('clear', config.onClear);
    if (config.onVisibleChange) this.on('visible-change', config.onVisibleChange);
    if (config.onPanelChange) this.on('panel-change', config.onPanelChange);
  }

  // 事件订阅
  on(event: string, handler: (...args: any[]) => void): () => void {
    return this.emitter.on(event, handler);
  }

  // 事件触发
  private emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  // 获取状态
  getState(): Readonly<DatePickerState> {
    return { ...this.state };
  }

  // 获取配置
  getConfig(): Readonly<typeof this.config> {
    return { ...this.config };
  }

  // 设置值
  setValue(value: PickerValue): void {
    this.state.value = value;
    this.state.tempValue = value;
    this.emit('change', value);
    this.emit('input', value);
  }

  // 选择日期
  selectDate(date: Date): void {
    const { type } = this.config;

    if (this.isDateDisabled(date)) {
      return;
    }

    if (type === 'date' || type === 'datetime') {
      this.setValue(date);
      if (type === 'date') {
        this.setVisible(false);
      }
    } else if (type === 'dates') {
      const currentDates = (this.state.value as DatesValue) || [];
      const index = currentDates.findIndex((d) => d.getTime() === date.getTime());
      
      if (index > -1) {
        currentDates.splice(index, 1);
      } else {
        currentDates.push(date);
      }
      
      this.setValue([...currentDates]);
    } else if (type === 'week') {
      // 星期选择逻辑将在后面实现
      this.setValue(date);
      this.setVisible(false);
    } else if (this.isRangeType(type)) {
      this.selectRangeDate(date);
    }
  }

  // 选择范围日期
  private selectRangeDate(date: Date): void {
    if (!this.state.rangeStart) {
      this.state.rangeStart = date;
      this.state.tempValue = [date, null];
      this.emit('input', this.state.tempValue);
    } else {
      const start = this.state.rangeStart;
      const end = date;
      
      const value: DateRangeValue = start <= end ? [start, end] : [end, start];
      this.setValue(value);
      this.state.rangeStart = null;
      this.setVisible(false);
    }
  }

  // 清除选择
  clear(): void {
    this.setValue(this.getDefaultValue(this.config.type));
    this.emit('clear');
  }

  // 设置可见性
  setVisible(visible: boolean): void {
    if (this.state.visible !== visible) {
      this.state.visible = visible;
      this.emit('visible-change', visible);
      
      if (visible) {
        // 面板打开时，重置当前日期
        const value = this.state.value;
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0 && value[0]) {
              this.state.currentDate = cloneDate(value[0]);
            }
          } else if (value instanceof Date) {
            this.state.currentDate = cloneDate(value);
          }
        }
      } else {
        // 面板关闭时，重置临时状态
        this.state.rangeStart = null;
        this.state.hoverDate = null;
      }
    }
  }

  // 切换视图
  changeView(view: ViewType): void {
    this.state.view = view;
    this.emit('panel-change', this.state.currentDate, view);
  }

  // 导航到上一个周期
  navigatePrev(): void {
    const { view } = this.state;
    const { currentDate } = this.state;
    
    if (view === 'date') {
      this.state.currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    } else if (view === 'month') {
      this.state.currentDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    } else if (view === 'year') {
      this.state.currentDate = new Date(currentDate.getFullYear() - 10, currentDate.getMonth(), 1);
    }
    
    this.emit('panel-change', this.state.currentDate, view);
  }

  // 导航到下一个周期
  navigateNext(): void {
    const { view } = this.state;
    const { currentDate } = this.state;
    
    if (view === 'date') {
      this.state.currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else if (view === 'month') {
      this.state.currentDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
    } else if (view === 'year') {
      this.state.currentDate = new Date(currentDate.getFullYear() + 10, currentDate.getMonth(), 1);
    }
    
    this.emit('panel-change', this.state.currentDate, view);
  }

  // 设置悬停日期
  setHoverDate(date: Date | null): void {
    this.state.hoverDate = date;
  }

  // 判断日期是否禁用
  isDateDisabled(date: Date): boolean {
    return this.config.disabledDate(date);
  }

  // 判断是否是范围类型
  private isRangeType(type: PickerType): boolean {
    return type.endsWith('range');
  }

  // 获取默认格式
  private getDefaultFormat(type: PickerType): string {
    const formatMap: Record<PickerType, string> = {
      date: 'YYYY-MM-DD',
      dates: 'YYYY-MM-DD',
      week: 'YYYY-[W]ww',
      month: 'YYYY-MM',
      year: 'YYYY',
      quarter: 'YYYY-[Q]Q',
      datetime: 'YYYY-MM-DD HH:mm:ss',
      time: 'HH:mm:ss',
      daterange: 'YYYY-MM-DD',
      datetimerange: 'YYYY-MM-DD HH:mm:ss',
      monthrange: 'YYYY-MM',
      yearrange: 'YYYY',
    };
    return formatMap[type] || 'YYYY-MM-DD';
  }

  // 获取默认值
  private getDefaultValue(type: PickerType): PickerValue {
    if (type === 'dates') {
      return [];
    } else if (this.isRangeType(type)) {
      return [null, null];
    }
    return null;
  }

  // 获取默认时间
  private getDefaultTime(type: PickerType): Date | [Date, Date] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (this.isRangeType(type)) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return [now, end];
    }
    
    return now;
  }

  // 获取默认视图
  private getDefaultView(type: PickerType): ViewType {
    if (type === 'time') return 'time';
    if (type === 'month' || type === 'monthrange') return 'month';
    if (type === 'year' || type === 'yearrange') return 'year';
    return 'date';
  }

  // 销毁
  destroy(): void {
    this.emitter.clear();
  }
}





