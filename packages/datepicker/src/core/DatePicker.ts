/**
 * DatePicker主要API类
 * 实现统一API、设备检测、DOM渲染、配置管理等功能
 */

import type {
  DatePickerConfig,
  DatePickerValue,
  DeviceType,
  ContainerElement,
  DatePickerEventName,
  DatePickerEventHandler
} from '../types';

import { Calendar } from './Calendar';
import { ThemeManager } from './ThemeManager';
import { EventManager } from '../utils/EventManager';
import { DOMUtils } from '../utils/DOMUtils';
import { DateUtils } from '../utils/DateUtils';
import { ValidationUtils } from '../utils/ValidationUtils';

/**
 * DatePicker类
 */
export class DatePicker {
  /** 配置选项 */
  private config: Required<DatePickerConfig>;
  
  /** 日历实例 */
  private calendar: Calendar;
  
  /** 主题管理器 */
  private themeManager: ThemeManager;
  
  /** 事件管理器 */
  private eventManager: EventManager;
  
  /** 容器元素 */
  private container?: HTMLElement;
  
  /** 输入框元素 */
  private inputElement?: HTMLInputElement;
  
  /** 弹出层元素 */
  private popupElement?: HTMLElement;
  
  /** 当前设备类型 */
  private deviceType: DeviceType;
  
  /** 是否已挂载 */
  private mounted: boolean = false;
  
  /** 是否已打开 */
  private opened: boolean = false;
  
  /** 当前值 */
  private currentValue: DatePickerValue = null;
  
  /** 媒体查询监听器 */
  private mediaQueryListeners: MediaQueryList[] = [];
  
  // ==================== 构造函数 ====================
  
  /**
   * 构造函数
   * @param config 配置选项
   */
  constructor(config: Partial<DatePickerConfig> = {}) {
    // 合并默认配置
    this.config = this.mergeConfig(config);
    
    // 检测设备类型
    this.deviceType = this.detectDeviceType();
    
    // 初始化组件
    this.eventManager = new EventManager({ performanceMonitoring: true });
    this.themeManager = new ThemeManager({ type: this.config.theme });
    this.calendar = new Calendar({
      viewMode: this.getViewModeFromPickerMode(),
      selectionType: this.config.selectionType,
      minDate: this.config.minDate,
      maxDate: this.config.maxDate,
      disabledDates: this.config.disabledDates,
      locale: this.config.locale
    });
    
    // 设置初始值
    if (this.config.value !== undefined) {
      this.setValue(this.config.value);
    } else if (this.config.defaultValue !== undefined) {
      this.setValue(this.config.defaultValue);
    }
    
    // 绑定事件
    this.bindEvents();
    
    // 设置响应式监听
    this.setupResponsiveListeners();
  }
  
  // ==================== 配置方法 ====================
  
  /**
   * 合并配置
   * @param config 用户配置
   * @returns 完整配置
   */
  private mergeConfig(config: Partial<DatePickerConfig>): Required<DatePickerConfig> {
    return {
      mode: 'date',
      selectionType: 'single',
      defaultValue: null,
      value: undefined,
      placeholder: '请选择日期',
      format: 'YYYY-MM-DD',
      disabled: false,
      readonly: false,
      clearable: true,
      showToday: true,
      showTime: false,
      minDate: undefined,
      maxDate: undefined,
      disabledDates: undefined,
      deviceType: 'auto',
      theme: 'auto',
      locale: 'zh-CN',
      className: '',
      style: {},
      autoClose: true,
      placement: 'auto',
      ...config
    };
  }
  
  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<DatePickerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };
    
    // 更新日历配置
    if (config.minDate !== undefined) {
      this.calendar.setMinDate(config.minDate);
    }
    
    if (config.maxDate !== undefined) {
      this.calendar.setMaxDate(config.maxDate);
    }
    
    if (config.disabledDates !== undefined) {
      this.calendar.setDisabledDates(config.disabledDates);
    }
    
    if (config.selectionType !== undefined) {
      this.calendar.setSelectionType(config.selectionType);
    }
    
    if (config.locale !== undefined) {
      this.calendar.setLocale(config.locale);
    }
    
    // 更新主题
    if (config.theme !== undefined) {
      this.themeManager.setTheme(config.theme);
    }
    
    // 重新渲染
    if (this.mounted) {
      this.render();
    }
    
    // 触发配置变化事件
    this.eventManager.emit('configChange', {
      config: this.config,
      oldConfig,
      changedKeys: Object.keys(config)
    });
  }
  
  // ==================== 挂载方法 ====================
  
  /**
   * 挂载到容器
   * @param container 容器元素
   */
  mount(container: ContainerElement): void {
    if (this.mounted) {
      console.warn('DatePicker已经挂载，请先卸载');
      return;
    }
    
    // 获取容器元素
    this.container = DOMUtils.getElement(container);
    if (!this.container) {
      throw new Error('无效的容器元素');
    }
    
    // 创建DOM结构
    this.createDOM();
    
    // 绑定DOM事件
    this.bindDOMEvents();
    
    // 渲染组件
    this.render();
    
    this.mounted = true;
    
    // 触发挂载事件
    this.eventManager.emit('mount', {
      container: this.container
    });
  }
  
  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }
    
    // 关闭弹出层
    this.close();
    
    // 移除DOM事件
    this.unbindDOMEvents();
    
    // 清理DOM
    this.cleanupDOM();
    
    // 清理响应式监听器
    this.cleanupResponsiveListeners();
    
    this.mounted = false;
    this.container = undefined;
    
    // 触发卸载事件
    this.eventManager.emit('unmount', {});
  }
  
  // ==================== 值操作方法 ====================
  
  /**
   * 设置值
   * @param value 新值
   */
  setValue(value: DatePickerValue): void {
    const oldValue = this.currentValue;
    
    // 验证值
    if (value !== null && value !== undefined) {
      const validationResult = this.validateValue(value);
      if (!validationResult.valid) {
        console.warn('设置的值无效:', validationResult.errors);
        return;
      }
    }
    
    this.currentValue = value;
    
    // 更新日历选择
    this.updateCalendarSelection();
    
    // 更新输入框显示
    this.updateInputDisplay();
    
    // 触发值变化事件
    this.eventManager.emit('change', {
      value: this.currentValue,
      oldValue,
      formattedValue: this.getFormattedValue()
    });
  }
  
  /**
   * 获取值
   * @returns 当前值
   */
  getValue(): DatePickerValue {
    return this.currentValue;
  }
  
  /**
   * 获取格式化后的值
   * @returns 格式化字符串
   */
  getFormattedValue(): string {
    if (!this.currentValue) {
      return '';
    }
    
    if (this.config.selectionType === 'single') {
      const date = DateUtils.toDate(this.currentValue);
      return date ? DateUtils.format(date, this.config.format) : '';
    }
    
    if (this.config.selectionType === 'range') {
      const range = this.currentValue as any;
      if (range && range.start && range.end) {
        const startStr = DateUtils.format(range.start, this.config.format);
        const endStr = DateUtils.format(range.end, this.config.format);
        return `${startStr} ~ ${endStr}`;
      }
    }
    
    if (this.config.selectionType === 'multiple') {
      const dates = this.currentValue as any[];
      if (Array.isArray(dates)) {
        return dates
          .map(date => DateUtils.format(date, this.config.format))
          .join(', ');
      }
    }
    
    return '';
  }
  
  /**
   * 清除值
   */
  clear(): void {
    if (!this.config.clearable) {
      return;
    }
    
    const oldValue = this.currentValue;
    this.currentValue = null;
    
    // 清除日历选择
    this.calendar.clearSelection();
    
    // 更新输入框显示
    this.updateInputDisplay();
    
    // 触发清除事件
    this.eventManager.emit('clear', {
      previousValue: oldValue
    });
    
    // 触发值变化事件
    this.eventManager.emit('change', {
      value: null,
      oldValue,
      formattedValue: ''
    });
  }
  
  // ==================== 弹出层控制方法 ====================
  
  /**
   * 打开弹出层
   */
  open(): void {
    if (this.opened || this.config.disabled || this.config.readonly) {
      return;
    }
    
    if (!this.popupElement) {
      this.createPopup();
    }
    
    // 显示弹出层
    this.showPopup();
    
    this.opened = true;
    
    // 触发打开事件
    this.eventManager.emit('open', {
      userTriggered: true
    });
  }
  
  /**
   * 关闭弹出层
   */
  close(): void {
    if (!this.opened) {
      return;
    }
    
    // 隐藏弹出层
    this.hidePopup();
    
    this.opened = false;
    
    // 触发关闭事件
    this.eventManager.emit('close', {
      userTriggered: true
    });
  }
  
  /**
   * 切换弹出层状态
   */
  toggle(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // ==================== 设备检测方法 ====================
  
  /**
   * 检测设备类型
   * @returns 设备类型
   */
  private detectDeviceType(): DeviceType {
    if (this.config.deviceType !== 'auto') {
      return this.config.deviceType;
    }
    
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
   * 更新设备类型
   * @param deviceType 新设备类型
   */
  private updateDeviceType(deviceType: DeviceType): void {
    const oldDeviceType = this.deviceType;
    this.deviceType = deviceType;
    
    // 重新渲染以适应新设备
    if (this.mounted) {
      this.render();
    }
    
    // 触发设备变化事件
    this.eventManager.emit('deviceChange', {
      deviceType,
      oldDeviceType,
      screenWidth: window.innerWidth
    });
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 根据选择器模式获取视图模式
   * @returns 视图模式
   */
  private getViewModeFromPickerMode() {
    switch (this.config.mode) {
      case 'year':
        return 'year';
      case 'month':
        return 'month';
      case 'date':
      case 'datetime':
      case 'time':
      default:
        return 'day';
    }
  }
  
  /**
   * 验证值
   * @param value 要验证的值
   * @returns 验证结果
   */
  private validateValue(value: DatePickerValue) {
    // 这里可以添加更多验证逻辑
    return { valid: true, errors: [] };
  }
  
  /**
   * 更新日历选择
   */
  private updateCalendarSelection(): void {
    // 清除当前选择
    this.calendar.clearSelection();
    
    if (!this.currentValue) {
      return;
    }
    
    // 根据选择类型更新选择
    if (this.config.selectionType === 'single') {
      this.calendar.selectDate(this.currentValue);
    } else if (this.config.selectionType === 'range') {
      const range = this.currentValue as any;
      if (range && range.start) {
        this.calendar.selectDate(range.start);
        if (range.end) {
          this.calendar.selectDate(range.end);
        }
      }
    } else if (this.config.selectionType === 'multiple') {
      const dates = this.currentValue as any[];
      if (Array.isArray(dates)) {
        dates.forEach(date => this.calendar.selectDate(date));
      }
    }
  }
  
  /**
   * 更新输入框显示
   */
  private updateInputDisplay(): void {
    if (this.inputElement) {
      this.inputElement.value = this.getFormattedValue();
    }
  }

  // ==================== DOM操作方法 ====================

  /**
   * 创建DOM结构
   */
  private createDOM(): void {
    if (!this.container) return;

    // 创建输入框
    this.inputElement = DOMUtils.createElement('input', {
      type: 'text',
      className: 'ld-datepicker-input',
      placeholder: this.config.placeholder,
      readonly: this.config.readonly,
      disabled: this.config.disabled
    });

    // 创建包装器
    const wrapper = DOMUtils.createElement('div', {
      className: `ld-datepicker ${this.config.className}`.trim()
    });

    // 应用自定义样式
    if (this.config.style) {
      DOMUtils.setStyle(wrapper, this.config.style);
    }

    // 添加设备类型类名
    DOMUtils.addClass(wrapper, `ld-datepicker--${this.deviceType}`);

    // 组装DOM
    wrapper.appendChild(this.inputElement);
    this.container.appendChild(wrapper);

    // 如果需要清除按钮
    if (this.config.clearable) {
      const clearButton = DOMUtils.createElement('button', {
        type: 'button',
        className: 'ld-datepicker-clear',
        innerHTML: '×'
      });
      wrapper.appendChild(clearButton);
    }
  }

  /**
   * 创建弹出层
   */
  private createPopup(): void {
    this.popupElement = DOMUtils.createElement('div', {
      className: 'ld-datepicker-popup'
    });

    // 添加设备类型类名
    DOMUtils.addClass(this.popupElement, `ld-datepicker-popup--${this.deviceType}`);

    // 添加到body
    document.body.appendChild(this.popupElement);

    // 渲染日历
    this.renderCalendar();
  }

  /**
   * 渲染日历
   */
  private renderCalendar(): void {
    if (!this.popupElement) return;

    // 清空内容
    DOMUtils.empty(this.popupElement);

    // 获取日历数据
    const calendarData = this.calendar.generateCalendarData();

    // 创建日历头部
    const header = this.createCalendarHeader(calendarData);
    this.popupElement.appendChild(header);

    // 创建日历主体
    const body = this.createCalendarBody(calendarData);
    this.popupElement.appendChild(body);

    // 创建日历底部
    if (this.config.showToday || this.config.clearable) {
      const footer = this.createCalendarFooter();
      this.popupElement.appendChild(footer);
    }
  }

  /**
   * 创建日历头部
   * @param data 日历数据
   * @returns 头部元素
   */
  private createCalendarHeader(data: any): HTMLElement {
    const header = DOMUtils.createElement('div', {
      className: 'ld-datepicker-header'
    });

    // 上一年按钮
    const prevYearBtn = DOMUtils.createElement('button', {
      type: 'button',
      className: 'ld-datepicker-prev-year',
      innerHTML: '«'
    });

    // 上一月按钮
    const prevMonthBtn = DOMUtils.createElement('button', {
      type: 'button',
      className: 'ld-datepicker-prev-month',
      innerHTML: '‹'
    });

    // 标题
    const title = DOMUtils.createElement('div', {
      className: 'ld-datepicker-title',
      innerHTML: data.monthTitle
    });

    // 下一月按钮
    const nextMonthBtn = DOMUtils.createElement('button', {
      type: 'button',
      className: 'ld-datepicker-next-month',
      innerHTML: '›'
    });

    // 下一年按钮
    const nextYearBtn = DOMUtils.createElement('button', {
      type: 'button',
      className: 'ld-datepicker-next-year',
      innerHTML: '»'
    });

    header.appendChild(prevYearBtn);
    header.appendChild(prevMonthBtn);
    header.appendChild(title);
    header.appendChild(nextMonthBtn);
    header.appendChild(nextYearBtn);

    return header;
  }

  /**
   * 创建日历主体
   * @param data 日历数据
   * @returns 主体元素
   */
  private createCalendarBody(data: any): HTMLElement {
    const body = DOMUtils.createElement('div', {
      className: 'ld-datepicker-body'
    });

    if (data.viewMode === 'day') {
      // 创建星期标题
      const weekdays = DOMUtils.createElement('div', {
        className: 'ld-datepicker-weekdays'
      });

      data.weekdays.forEach((weekday: string) => {
        const cell = DOMUtils.createElement('div', {
          className: 'ld-datepicker-weekday',
          textContent: weekday
        });
        weekdays.appendChild(cell);
      });

      body.appendChild(weekdays);
    }

    // 创建日期网格
    const grid = DOMUtils.createElement('div', {
      className: 'ld-datepicker-grid'
    });

    data.cells.forEach((cell: any) => {
      const cellElement = this.createCalendarCell(cell);
      grid.appendChild(cellElement);
    });

    body.appendChild(grid);

    return body;
  }

  /**
   * 创建日历单元格
   * @param cell 单元格数据
   * @returns 单元格元素
   */
  private createCalendarCell(cell: any): HTMLElement {
    const cellElement = DOMUtils.createElement('div', {
      className: 'ld-datepicker-cell',
      textContent: cell.text,
      'data-date': cell.date.toISOString()
    });

    // 添加状态类名
    if (cell.isToday) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--today');
    if (cell.isSelected) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--selected');
    if (cell.isInRange) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--in-range');
    if (cell.isRangeStart) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--range-start');
    if (cell.isRangeEnd) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--range-end');
    if (cell.isDisabled) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--disabled');
    if (cell.isWeekend) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--weekend');
    if (!cell.isCurrentMonth) DOMUtils.addClass(cellElement, 'ld-datepicker-cell--other-month');

    return cellElement;
  }

  /**
   * 创建日历底部
   * @returns 底部元素
   */
  private createCalendarFooter(): HTMLElement {
    const footer = DOMUtils.createElement('div', {
      className: 'ld-datepicker-footer'
    });

    if (this.config.showToday) {
      const todayBtn = DOMUtils.createElement('button', {
        type: 'button',
        className: 'ld-datepicker-today',
        textContent: '今天'
      });
      footer.appendChild(todayBtn);
    }

    if (this.config.clearable) {
      const clearBtn = DOMUtils.createElement('button', {
        type: 'button',
        className: 'ld-datepicker-clear-btn',
        textContent: '清除'
      });
      footer.appendChild(clearBtn);
    }

    return footer;
  }

  /**
   * 显示弹出层
   */
  private showPopup(): void {
    if (!this.popupElement || !this.inputElement) return;

    // 计算位置
    const inputRect = this.inputElement.getBoundingClientRect();
    const popupRect = this.popupElement.getBoundingClientRect();

    let top = inputRect.bottom + window.scrollY;
    let left = inputRect.left + window.scrollX;

    // 检查是否超出视口
    const viewport = DOMUtils.getViewportSize();

    if (left + popupRect.width > viewport.width) {
      left = viewport.width - popupRect.width - 10;
    }

    if (top + popupRect.height > viewport.height + window.scrollY) {
      top = inputRect.top + window.scrollY - popupRect.height;
    }

    // 设置位置
    DOMUtils.setStyle(this.popupElement, {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: '1000'
    });

    // 显示
    DOMUtils.addClass(this.popupElement, 'ld-datepicker-popup--visible');
  }

  /**
   * 隐藏弹出层
   */
  private hidePopup(): void {
    if (this.popupElement) {
      DOMUtils.removeClass(this.popupElement, 'ld-datepicker-popup--visible');
    }
  }

  /**
   * 渲染组件
   */
  private render(): void {
    if (!this.mounted) return;

    // 更新输入框显示
    this.updateInputDisplay();

    // 如果弹出层已打开，重新渲染日历
    if (this.opened && this.popupElement) {
      this.renderCalendar();
    }
  }

  /**
   * 清理DOM
   */
  private cleanupDOM(): void {
    if (this.popupElement) {
      DOMUtils.remove(this.popupElement);
      this.popupElement = undefined;
    }

    if (this.container) {
      DOMUtils.empty(this.container);
    }

    this.inputElement = undefined;
  }

  // ==================== 事件绑定方法 ====================

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 绑定日历事件
    this.calendar.onDateSelect((data) => {
      this.handleDateSelect(data);
    });

    this.calendar.onNavigate((data) => {
      this.handleCalendarNavigate(data);
    });

    // 绑定主题事件
    this.themeManager.onThemeChange((data) => {
      this.handleThemeChange(data);
    });
  }

  /**
   * 绑定DOM事件
   */
  private bindDOMEvents(): void {
    if (!this.inputElement) return;

    // 输入框点击事件
    DOMUtils.addEventListener(this.inputElement, 'click', () => {
      this.open();
    });

    // 输入框键盘事件
    DOMUtils.addEventListener(this.inputElement, 'keydown', (e) => {
      this.handleInputKeydown(e);
    });

    // 全局点击事件（用于关闭弹出层）
    DOMUtils.addEventListener(document, 'click', (e) => {
      this.handleDocumentClick(e);
    });
  }

  /**
   * 解绑DOM事件
   */
  private unbindDOMEvents(): void {
    // 这里应该移除事件监听器，但由于我们没有保存引用，
    // 在实际项目中应该保存事件处理器的引用以便正确移除
  }

  /**
   * 处理日期选择
   * @param data 选择数据
   */
  private handleDateSelect(data: any): void {
    // 更新当前值
    if (this.config.selectionType === 'single') {
      this.setValue(data.date);
    } else if (this.config.selectionType === 'range') {
      this.setValue(data.selectedRange);
    } else if (this.config.selectionType === 'multiple') {
      this.setValue(data.selectedDates);
    }

    // 如果是单选且设置了自动关闭，则关闭弹出层
    if (this.config.selectionType === 'single' && this.config.autoClose) {
      this.close();
    }

    // 触发选择事件
    this.eventManager.emit('select', {
      date: data.date,
      cell: data.cell || null,
      isMultiple: this.config.selectionType === 'multiple',
      isRange: this.config.selectionType === 'range'
    });
  }

  /**
   * 处理日历导航
   * @param data 导航数据
   */
  private handleCalendarNavigate(data: any): void {
    // 重新渲染日历
    if (this.opened) {
      this.renderCalendar();
    }

    // 触发月份变化事件
    this.eventManager.emit('monthChange', data);
  }

  /**
   * 处理主题变化
   * @param data 主题数据
   */
  private handleThemeChange(data: any): void {
    // 重新渲染以应用新主题
    this.render();

    // 触发主题变化事件
    this.eventManager.emit('themeChange', data);
  }

  /**
   * 处理输入框键盘事件
   * @param e 键盘事件
   */
  private handleInputKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.toggle();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.open();
        break;
    }
  }

  /**
   * 处理文档点击事件
   * @param e 点击事件
   */
  private handleDocumentClick(e: MouseEvent): void {
    if (!this.opened || !this.popupElement || !this.inputElement) {
      return;
    }

    const target = e.target as HTMLElement;

    // 如果点击的是输入框或弹出层内部，不关闭
    if (this.inputElement.contains(target) || this.popupElement.contains(target)) {
      return;
    }

    // 关闭弹出层
    this.close();
  }

  // ==================== 响应式方法 ====================

  /**
   * 设置响应式监听器
   */
  private setupResponsiveListeners(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // 移动端断点
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');

    const handleMediaChange = () => {
      const newDeviceType = this.detectDeviceType();
      if (newDeviceType !== this.deviceType) {
        this.updateDeviceType(newDeviceType);
      }
    };

    // 添加监听器
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleMediaChange);
      tabletQuery.addEventListener('change', handleMediaChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleMediaChange);
      tabletQuery.addListener(handleMediaChange);
    }

    this.mediaQueryListeners = [mobileQuery, tabletQuery];
  }

  /**
   * 清理响应式监听器
   */
  private cleanupResponsiveListeners(): void {
    this.mediaQueryListeners.forEach(query => {
      if (query.removeEventListener) {
        query.removeEventListener('change', () => {});
      } else if (query.removeListener) {
        query.removeListener(() => {});
      }
    });

    this.mediaQueryListeners = [];
  }

  // ==================== 公共API方法 ====================

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @returns 监听器ID
   */
  on<T extends DatePickerEventName>(
    eventName: T,
    handler: DatePickerEventHandler<T>
  ): string {
    return this.eventManager.on(eventName, handler);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param listenerId 监听器ID
   */
  off(eventName: DatePickerEventName, listenerId: string): void {
    this.eventManager.off(eventName, listenerId);
  }

  /**
   * 获取配置
   * @returns 当前配置
   */
  getConfig(): Required<DatePickerConfig> {
    return { ...this.config };
  }

  /**
   * 获取设备类型
   * @returns 当前设备类型
   */
  getDeviceType(): DeviceType {
    return this.deviceType;
  }

  /**
   * 检查是否已挂载
   * @returns 是否已挂载
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * 检查是否已打开
   * @returns 是否已打开
   */
  isOpened(): boolean {
    return this.opened;
  }

  /**
   * 获取日历实例
   * @returns 日历实例
   */
  getCalendar(): Calendar {
    return this.calendar;
  }

  /**
   * 获取主题管理器
   * @returns 主题管理器实例
   */
  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  // ==================== 销毁方法 ====================

  /**
   * 销毁组件
   */
  destroy(): void {
    // 卸载组件
    this.unmount();

    // 销毁子组件
    this.calendar.destroy();
    this.themeManager.destroy();
    this.eventManager.removeAllListeners();

    // 触发销毁事件
    this.eventManager.emit('destroy', {
      reason: 'manual'
    });
  }
}
