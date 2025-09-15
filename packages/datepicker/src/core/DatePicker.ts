/**
 * DatePicker 主类
 * 日期选择器的核心实现
 */

import type {
  DateValue,
  DateRange,
  DatePickerOptions,
  DatePickerEvents,
  DatePickerState,
  ValidationResult,
  LocaleType,
  ThemeType,
  DeviceType,
  IDatePicker
} from '../types';
import { Calendar } from './Calendar';
import { EventManager } from './EventManager';
import { ThemeManager } from './ThemeManager';
import { DateUtils } from '../utils/DateUtils';

/**
 * DatePicker 主类
 * 提供完整的日期选择器功能
 */
export class DatePicker implements IDatePicker {
  /** 事件管理器 */
  private eventManager = new EventManager();

  /** 主题管理器 */
  private themeManager = new ThemeManager();

  /** 日历实例 */
  private calendar: Calendar;

  /** 配置选项 */
  private options: any;

  /** 内部状态 */
  private state: DatePickerState;

  /** 容器元素 */
  private container: HTMLElement | null = null;

  /** 根元素 */
  private rootElement: HTMLElement | null = null;

  /** 设备类型 */
  private deviceType: DeviceType = 'desktop';

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: DatePickerOptions = {}) {
    // 初始化默认配置
    this.options = this.initializeOptions(options);

    // 初始化状态
    this.state = this.initializeState();

    // 创建日历实例
    this.calendar = new Calendar({
      initialYear: new Date().getFullYear(),
      initialMonth: new Date().getMonth(),
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disabledDates: this.options.disabledDates,
      firstDayOfWeek: 0 // 可以从选项中配置
    });

    // 检测设备类型
    this.detectDeviceType();

    // 设置主题
    if (this.options.theme) {
      this.themeManager.setTheme(this.options.theme);
    }

    // 绑定事件
    this.bindEvents();
  }

  /**
   * 初始化配置选项
   * @param options 用户配置
   * @returns 完整配置
   */
  private initializeOptions(options: DatePickerOptions): Required<DatePickerOptions> {
    return {
      mode: options.mode ?? 'date',
      selectionType: options.selectionType ?? 'single',
      format: options.format ?? 'YYYY-MM-DD',
      locale: options.locale ?? 'zh-CN',
      theme: options.theme ?? 'light',
      responsive: options.responsive ?? true,
      minDate: options.minDate ?? null,
      maxDate: options.maxDate ?? null,
      disabledDates: options.disabledDates ?? [],
      defaultValue: options.defaultValue ?? null,
      placeholder: options.placeholder ?? '请选择日期',
      clearable: options.clearable ?? true,
      readonly: options.readonly ?? false,
      disabled: options.disabled ?? false,
      showToday: options.showToday ?? true,
      showClear: options.showClear ?? true,
      showConfirm: options.showConfirm ?? false,
      autoClose: options.autoClose ?? true,
      placement: options.placement ?? 'bottom',
      className: options.className ?? '',
      style: options.style ?? {},
      container: options.container || document.body,
      appendToBody: options.appendToBody ?? false,
      zIndex: options.zIndex ?? 1000,
      animationDuration: options.animationDuration ?? 300,
      virtualScroll: options.virtualScroll ?? false,
      itemHeight: options.itemHeight ?? 32,
      visibleItemCount: options.visibleItemCount ?? 7
    };
  }

  /**
   * 初始化状态
   * @returns 初始状态
   */
  private initializeState(): DatePickerState {
    const now = new Date();

    return {
      value: this.options.defaultValue ?? null,
      visible: false,
      currentMode: this.options.mode,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
      loading: false,
      error: null,
      initialized: false,
      mounted: false
    };
  }

  /**
   * 检测设备类型
   */
  private detectDeviceType(): void {
    if (typeof window === 'undefined') {
      this.deviceType = 'desktop';
      return;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);

    if (isMobile && !isTablet) {
      this.deviceType = 'mobile';
    } else if (isTablet) {
      this.deviceType = 'tablet';
    } else {
      this.deviceType = 'desktop';
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听主题变化
    this.themeManager.on('theme-change', () => {
      this.emit('view-change', this.state.currentMode);
    });

    // 监听窗口大小变化（响应式）
    if (typeof window !== 'undefined' && this.options.responsive) {
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    this.detectDeviceType();
    // 重新渲染以适应新的设备类型
    if (this.state.mounted) {
      this.render();
    }
  }

  /**
   * 挂载到 DOM 元素
   * @param element 容器元素
   */
  mount(element: HTMLElement): void {
    if (this.state.mounted) {
      console.warn('[DatePicker] Already mounted, unmounting first');
      this.unmount();
    }

    this.container = element;
    this.createRootElement();
    this.render();

    this.state.mounted = true;
    this.state.initialized = true;

    this.emit('mount-complete');
  }

  /**
   * 创建根元素
   */
  private createRootElement(): void {
    if (!this.container) return;

    this.rootElement = document.createElement('div');
    this.rootElement.className = this.getRootClassName();

    // 应用自定义样式
    if (this.options.style) {
      Object.assign(this.rootElement.style, this.options.style);
    }

    this.container.appendChild(this.rootElement);
  }

  /**
   * 获取根元素类名
   * @returns 类名字符串
   */
  private getRootClassName(): string {
    const classes = [
      'ldesign-datepicker',
      `ldesign-datepicker--${this.options.mode}`,
      `ldesign-datepicker--${this.options.selectionType}`,
      `ldesign-datepicker--${this.deviceType}`
    ];

    if (this.options.disabled) classes.push('ldesign-datepicker--disabled');
    if (this.options.readonly) classes.push('ldesign-datepicker--readonly');
    if (this.state.visible) classes.push('ldesign-datepicker--visible');
    if (this.options.className) classes.push(this.options.className);

    return classes.join(' ');
  }

  /**
   * 渲染组件
   */
  private render(): void {
    if (!this.rootElement) return;

    // 更新根元素类名
    this.rootElement.className = this.getRootClassName();

    // 渲染内容
    this.rootElement.innerHTML = this.generateHTML();

    // 绑定 DOM 事件
    this.bindDOMEvents();

    this.emit('render-complete');
  }

  /**
   * 生成 HTML 内容
   * @returns HTML 字符串
   */
  private generateHTML(): string {
    const dropdownClass = `ldesign-datepicker__dropdown${this.state.visible ? ' ldesign-datepicker__dropdown--visible' : ''}`;

    return `
      <div class="ldesign-datepicker__input">
        ${this.generateInputHTML()}
      </div>
      <div class="${dropdownClass}">
        <div class="ldesign-datepicker__calendar">
          ${this.generateCalendarHTML()}
        </div>
      </div>
    `;
  }

  /**
   * 生成输入框 HTML
   * @returns 输入框 HTML 字符串
   */
  private generateInputHTML(): string {
    if (this.options.selectionType === 'range') {
      // 范围选择：两个输入框
      const startValue = this.getRangeStartValue();
      const endValue = this.getRangeEndValue();

      return `
        <div class="ldesign-datepicker__range-inputs">
          <input
            type="text"
            class="ldesign-datepicker__range-start"
            placeholder="开始日期"
            value="${startValue}"
            ${this.options.readonly ? 'readonly' : ''}
            ${this.options.disabled ? 'disabled' : ''}
          />
          <span class="ldesign-datepicker__range-separator">至</span>
          <input
            type="text"
            class="ldesign-datepicker__range-end"
            placeholder="结束日期"
            value="${endValue}"
            ${this.options.readonly ? 'readonly' : ''}
            ${this.options.disabled ? 'disabled' : ''}
          />
        </div>
      `;
    } else {
      // 单选或多选：单个输入框
      return `
        <input
          type="text"
          placeholder="${this.options.placeholder}"
          value="${this.getDisplayValue()}"
          ${this.options.readonly ? 'readonly' : ''}
          ${this.options.disabled ? 'disabled' : ''}
        />
      `;
    }
  }

  /**
   * 生成日历 HTML
   * @returns 日历 HTML 字符串
   */
  private generateCalendarHTML(): string {
    switch (this.options.mode) {
      case 'year':
        return this.generateYearCalendarHTML();
      case 'month':
        return this.generateMonthCalendarHTML();
      case 'datetime':
        return this.generateDateTimeCalendarHTML();
      case 'quarter':
        return this.generateQuarterCalendarHTML();
      case 'date':
      default:
        return this.generateDateCalendarHTML();
    }
  }

  /**
   * 生成日期日历 HTML
   * @returns 日期日历 HTML 字符串
   */
  private generateDateCalendarHTML(): string {
    const calendarData = this.calendar.getCalendarData(this.state.currentYear, this.state.currentMonth);

    let html = '<div class="ldesign-calendar ldesign-calendar--date">';

    // 头部
    html += `
      <div class="ldesign-calendar__header">
        <button class="ldesign-calendar__nav ldesign-calendar__nav--prev">&lt;</button>
        <div class="ldesign-calendar__title">${calendarData.year}年${calendarData.month + 1}月</div>
        <button class="ldesign-calendar__nav ldesign-calendar__nav--next">&gt;</button>
      </div>
    `;

    // 星期标题
    html += '<div class="ldesign-calendar__weekdays">';
    for (const weekday of calendarData.weekdays) {
      html += `<div class="ldesign-calendar__weekday">${weekday}</div>`;
    }
    html += '</div>';

    // 日期网格
    html += '<div class="ldesign-calendar__grid">';
    for (const cell of calendarData.cells) {
      const cellClass = `ldesign-calendar__cell ${cell.className || ''}`;
      html += `
        <div class="${cellClass}" data-date="${DateUtils.format(cell.date, 'YYYY-MM-DD')}" data-type="date">
          ${cell.text}
        </div>
      `;
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * 生成年份日历 HTML
   * @returns 年份日历 HTML 字符串
   */
  private generateYearCalendarHTML(): string {
    const currentYear = this.state.currentYear;
    const startYear = Math.floor(currentYear / 10) * 10;
    const endYear = startYear + 9;

    let html = '<div class="ldesign-calendar ldesign-calendar--year">';

    // 头部
    html += `
      <div class="ldesign-calendar__header">
        <button class="ldesign-calendar__nav ldesign-calendar__nav--prev">&lt;</button>
        <div class="ldesign-calendar__title">${startYear} - ${endYear}</div>
        <button class="ldesign-calendar__nav ldesign-calendar__nav--next">&gt;</button>
      </div>
    `;

    // 年份网格
    html += '<div class="ldesign-calendar__grid ldesign-calendar__grid--year">';
    for (let year = startYear; year <= endYear; year++) {
      const isSelected = this.isYearSelected(year);
      const cellClass = `ldesign-calendar__cell ${isSelected ? 'selected' : ''}`;
      html += `
        <div class="${cellClass}" data-year="${year}" data-type="year">
          ${year}
        </div>
      `;
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * 生成月份日历 HTML
   * @returns 月份日历 HTML 字符串
   */
  private generateMonthCalendarHTML(): string {
    const currentYear = this.state.currentYear;
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    let html = '<div class="ldesign-calendar ldesign-calendar--month">';

    // 头部
    html += `
      <div class="ldesign-calendar__header">
        <button class="ldesign-calendar__nav ldesign-calendar__nav--prev">&lt;</button>
        <div class="ldesign-calendar__title">${currentYear}年</div>
        <button class="ldesign-calendar__nav ldesign-calendar__nav--next">&gt;</button>
      </div>
    `;

    // 月份网格
    html += '<div class="ldesign-calendar__grid ldesign-calendar__grid--month">';
    for (let month = 0; month < 12; month++) {
      const isSelected = this.isMonthSelected(currentYear, month);
      const cellClass = `ldesign-calendar__cell ${isSelected ? 'selected' : ''}`;
      html += `
        <div class="${cellClass}" data-year="${currentYear}" data-month="${month}" data-type="month">
          ${months[month]}
        </div>
      `;
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * 生成季度日历 HTML
   * @returns 季度日历 HTML 字符串
   */
  private generateQuarterCalendarHTML(): string {
    const currentYear = this.state.currentYear;
    const quarters = ['第一季度', '第二季度', '第三季度', '第四季度'];

    let html = '<div class="ldesign-calendar ldesign-calendar--quarter">';

    // 头部
    html += `
      <div class="ldesign-calendar__header">
        <button class="ldesign-calendar__nav ldesign-calendar__nav--prev">&lt;</button>
        <div class="ldesign-calendar__title">${currentYear}年</div>
        <button class="ldesign-calendar__nav ldesign-calendar__nav--next">&gt;</button>
      </div>
    `;

    // 季度网格
    html += '<div class="ldesign-calendar__grid ldesign-calendar__grid--quarter">';
    for (let quarter = 0; quarter < 4; quarter++) {
      const isSelected = this.isQuarterSelected(currentYear, quarter);
      const cellClass = `ldesign-calendar__cell ${isSelected ? 'selected' : ''}`;
      html += `
        <div class="${cellClass}" data-year="${currentYear}" data-quarter="${quarter}" data-type="quarter">
          ${quarters[quarter]}
        </div>
      `;
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * 生成日期时间日历 HTML
   * @returns 日期时间日历 HTML 字符串
   */
  private generateDateTimeCalendarHTML(): string {
    const dateHTML = this.generateDateCalendarHTML();
    const timeHTML = this.generateTimePickerHTML();

    return `
      <div class="ldesign-calendar ldesign-calendar--datetime">
        ${dateHTML}
        <div class="ldesign-calendar__time-picker">
          ${timeHTML}
        </div>
      </div>
    `;
  }

  /**
   * 生成时间选择器 HTML
   * @returns 时间选择器 HTML 字符串
   */
  private generateTimePickerHTML(): string {
    const currentTime = this.getCurrentTime();

    return `
      <div class="ldesign-time-picker">
        <div class="ldesign-time-picker__header">选择时间</div>
        <div class="ldesign-time-picker__controls">
          <div class="ldesign-time-picker__control">
            <label>时</label>
            <select class="ldesign-time-picker__select" data-type="hour">
              ${this.generateTimeOptions(0, 23, currentTime.hour)}
            </select>
          </div>
          <div class="ldesign-time-picker__control">
            <label>分</label>
            <select class="ldesign-time-picker__select" data-type="minute">
              ${this.generateTimeOptions(0, 59, currentTime.minute)}
            </select>
          </div>
          <div class="ldesign-time-picker__control">
            <label>秒</label>
            <select class="ldesign-time-picker__select" data-type="second">
              ${this.generateTimeOptions(0, 59, currentTime.second)}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 绑定 DOM 事件
   */
  private bindDOMEvents(): void {
    if (!this.rootElement) return;

    // 输入框点击事件
    this.bindInputEvents();

    // 日历单元格点击事件
    this.bindCalendarEvents();

    // 导航按钮事件
    this.bindNavigationEvents();

    // 时间选择器事件
    this.bindTimePickerEvents();
  }

  /**
   * 绑定输入框事件
   */
  private bindInputEvents(): void {
    if (this.options.selectionType === 'range') {
      // 范围选择：绑定两个输入框
      const startInput = this.rootElement?.querySelector('.ldesign-datepicker__range-start');
      const endInput = this.rootElement?.querySelector('.ldesign-datepicker__range-end');

      if (startInput) {
        startInput.addEventListener('click', () => {
          if (!this.options.disabled && !this.options.readonly) {
            this.toggle();
          }
        });
      }

      if (endInput) {
        endInput.addEventListener('click', () => {
          if (!this.options.disabled && !this.options.readonly) {
            this.toggle();
          }
        });
      }
    } else {
      // 单选或多选：单个输入框
      const input = this.rootElement?.querySelector('input');
      if (input) {
        input.addEventListener('click', () => {
          if (!this.options.disabled && !this.options.readonly) {
            this.toggle();
          }
        });
      }
    }
  }

  /**
   * 绑定日历事件
   */
  private bindCalendarEvents(): void {
    const cells = this.rootElement?.querySelectorAll('.ldesign-calendar__cell');
    cells?.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const type = target.getAttribute('data-type');

        switch (type) {
          case 'date':
            this.handleDateCellClick(target);
            break;
          case 'year':
            this.handleYearCellClick(target);
            break;
          case 'month':
            this.handleMonthCellClick(target);
            break;
          case 'quarter':
            this.handleQuarterCellClick(target);
            break;
        }
      });
    });
  }

  /**
   * 绑定导航事件
   */
  private bindNavigationEvents(): void {
    const prevBtn = this.rootElement?.querySelector('.ldesign-calendar__nav--prev');
    const nextBtn = this.rootElement?.querySelector('.ldesign-calendar__nav--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigatePrev());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateNext());
    }
  }

  /**
   * 绑定时间选择器事件
   */
  private bindTimePickerEvents(): void {
    const timeSelects = this.rootElement?.querySelectorAll('.ldesign-time-picker__select');
    timeSelects?.forEach(select => {
      select.addEventListener('change', (e) => {
        this.handleTimeChange(e.target as HTMLSelectElement);
      });
    });
  }

  /**
   * 处理日期单元格点击
   * @param target 点击的元素
   */
  private handleDateCellClick(target: HTMLElement): void {
    const dateStr = target.getAttribute('data-date');
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (this.calendar.isDisabled(date)) return;

    this.handleDateSelect(date);
  }

  /**
   * 处理年份单元格点击
   * @param target 点击的元素
   */
  private handleYearCellClick(target: HTMLElement): void {
    const yearStr = target.getAttribute('data-year');
    if (!yearStr) return;

    const year = parseInt(yearStr, 10);
    const date = new Date(year, 0, 1); // 年份的第一天

    this.handleDateSelect(date);
  }

  /**
   * 处理月份单元格点击
   * @param target 点击的元素
   */
  private handleMonthCellClick(target: HTMLElement): void {
    const yearStr = target.getAttribute('data-year');
    const monthStr = target.getAttribute('data-month');
    if (!yearStr || !monthStr) return;

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const date = new Date(year, month, 1); // 月份的第一天

    this.handleDateSelect(date);
  }

  /**
   * 处理季度单元格点击
   * @param target 点击的元素
   */
  private handleQuarterCellClick(target: HTMLElement): void {
    const yearStr = target.getAttribute('data-year');
    const quarterStr = target.getAttribute('data-quarter');
    if (!yearStr || !quarterStr) return;

    const year = parseInt(yearStr, 10);
    const quarter = parseInt(quarterStr, 10);
    const month = quarter * 3; // 季度的第一个月
    const date = new Date(year, month, 1);

    this.handleDateSelect(date);
  }

  /**
   * 处理时间变化
   * @param select 时间选择器
   */
  private handleTimeChange(select: HTMLSelectElement): void {
    const type = select.getAttribute('data-type');
    const value = parseInt(select.value, 10);

    if (!this.state.value) {
      this.state.value = new Date();
    }

    const currentDate = DateUtils.toDate(this.state.value) || new Date();

    switch (type) {
      case 'hour':
        currentDate.setHours(value);
        break;
      case 'minute':
        currentDate.setMinutes(value);
        break;
      case 'second':
        currentDate.setSeconds(value);
        break;
    }

    this.setValue(currentDate);
  }

  /**
   * 处理日期选择
   * @param date 选中的日期
   */
  private handleDateSelect(date: Date): void {
    if (this.calendar.isDisabled(date)) return;

    this.setValue(date);
    this.emit('select', date);

    if (this.options.autoClose) {
      this.hide();
    }
  }

  /**
   * 导航到上一个周期
   */
  private navigatePrev(): void {
    switch (this.options.mode) {
      case 'year':
        this.state.currentYear -= 10;
        break;
      case 'month':
      case 'quarter':
        this.state.currentYear--;
        break;
      case 'date':
      case 'datetime':
      default:
        this.navigateToPrevMonth();
        return;
    }

    this.render();
    this.emit('year-change', this.state.currentYear);
  }

  /**
   * 导航到下一个周期
   */
  private navigateNext(): void {
    switch (this.options.mode) {
      case 'year':
        this.state.currentYear += 10;
        break;
      case 'month':
      case 'quarter':
        this.state.currentYear++;
        break;
      case 'date':
      case 'datetime':
      default:
        this.navigateToNextMonth();
        return;
    }

    this.render();
    this.emit('year-change', this.state.currentYear);
  }

  /**
   * 导航到上个月
   */
  private navigateToPrevMonth(): void {
    if (this.state.currentMonth === 0) {
      this.state.currentYear--;
      this.state.currentMonth = 11;
    } else {
      this.state.currentMonth--;
    }

    this.render();
    this.emit('month-change', this.state.currentYear, this.state.currentMonth);
  }

  /**
   * 导航到下个月
   */
  private navigateToNextMonth(): void {
    if (this.state.currentMonth === 11) {
      this.state.currentYear++;
      this.state.currentMonth = 0;
    } else {
      this.state.currentMonth++;
    }

    this.render();
    this.emit('month-change', this.state.currentYear, this.state.currentMonth);
  }

  /**
   * 获取显示值
   * @returns 显示值字符串
   */
  private getDisplayValue(): string {
    if (!this.state.value) return '';

    if (Array.isArray(this.state.value)) {
      return this.state.value.map(v => DateUtils.format(v, this.options.format)).join(', ');
    }

    if (typeof this.state.value === 'object' && 'start' in this.state.value) {
      const range = this.state.value as DateRange;
      return `${DateUtils.format(range.start, this.options.format)} - ${DateUtils.format(range.end, this.options.format)}`;
    }

    return DateUtils.format(this.state.value, this.options.format);
  }

  /**
   * 获取范围选择的开始值
   * @returns 开始值字符串
   */
  private getRangeStartValue(): string {
    if (!this.state.value) return '';

    if (typeof this.state.value === 'object' && 'start' in this.state.value) {
      const range = this.state.value as DateRange;
      return DateUtils.format(range.start, this.options.format);
    }

    return '';
  }

  /**
   * 获取范围选择的结束值
   * @returns 结束值字符串
   */
  private getRangeEndValue(): string {
    if (!this.state.value) return '';

    if (typeof this.state.value === 'object' && 'end' in this.state.value) {
      const range = this.state.value as DateRange;
      return DateUtils.format(range.end, this.options.format);
    }

    return '';
  }

  /**
   * 检查年份是否被选中
   * @param year 年份
   * @returns 是否被选中
   */
  private isYearSelected(year: number): boolean {
    if (!this.state.value) return false;

    const date = DateUtils.toDate(this.state.value);
    return date ? date.getFullYear() === year : false;
  }

  /**
   * 检查月份是否被选中
   * @param year 年份
   * @param month 月份
   * @returns 是否被选中
   */
  private isMonthSelected(year: number, month: number): boolean {
    if (!this.state.value) return false;

    const date = DateUtils.toDate(this.state.value);
    return date ? (date.getFullYear() === year && date.getMonth() === month) : false;
  }

  /**
   * 检查季度是否被选中
   * @param year 年份
   * @param quarter 季度 (0-3)
   * @returns 是否被选中
   */
  private isQuarterSelected(year: number, quarter: number): boolean {
    if (!this.state.value) return false;

    const date = DateUtils.toDate(this.state.value);
    if (!date) return false;

    const dateQuarter = Math.floor(date.getMonth() / 3);
    return date.getFullYear() === year && dateQuarter === quarter;
  }

  /**
   * 获取当前时间
   * @returns 当前时间对象
   */
  private getCurrentTime(): { hour: number; minute: number; second: number } {
    const now = this.state.value ? DateUtils.toDate(this.state.value) || new Date() : new Date();

    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    };
  }

  /**
   * 生成时间选项 HTML
   * @param start 开始值
   * @param end 结束值
   * @param selected 选中值
   * @returns 选项 HTML 字符串
   */
  private generateTimeOptions(start: number, end: number, selected: number): string {
    let options = '';
    for (let i = start; i <= end; i++) {
      const value = i.toString().padStart(2, '0');
      const isSelected = i === selected ? 'selected' : '';
      options += `<option value="${i}" ${isSelected}>${value}</option>`;
    }
    return options;
  }

  // 实现 IDatePicker 接口的其他方法...

  unmount(): void {
    if (!this.state.mounted) return;

    if (this.rootElement && this.container) {
      this.container.removeChild(this.rootElement);
    }

    this.rootElement = null;
    this.container = null;
    this.state.mounted = false;

    this.emit('unmount-complete');
  }

  destroy(): void {
    this.unmount();
    this.eventManager.destroy();
    this.themeManager.destroy();
    this.calendar.destroy();

    // 移除窗口事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
  }

  getValue(): DateValue | DateValue[] | DateRange {
    return this.state.value;
  }

  setValue(value: DateValue | DateValue[] | DateRange): void {
    this.state.value = value;
    this.render();
    this.emit('change', value);
  }

  clear(): void {
    this.setValue(null);
    this.emit('clear');
  }

  show(): void {
    if (this.state.visible) return;

    this.state.visible = true;
    this.render();
    this.emit('show');
  }

  hide(): void {
    if (!this.state.visible) return;

    this.state.visible = false;
    this.render();
    this.emit('hide');
  }

  toggle(): void {
    if (this.state.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible(): boolean {
    return this.state.visible;
  }

  updateOptions(options: Partial<DatePickerOptions>): void {
    Object.assign(this.options, options);

    if (options.theme) {
      this.themeManager.setTheme(options.theme);
    }

    this.render();
  }

  getOptions(): DatePickerOptions {
    return { ...this.options };
  }

  on<K extends keyof DatePickerEvents>(event: K, callback: DatePickerEvents[K]): void {
    this.eventManager.on(event, callback as any);
  }

  off<K extends keyof DatePickerEvents>(event: K, callback?: DatePickerEvents[K]): void {
    this.eventManager.off(event, callback as any);
  }

  emit<K extends keyof DatePickerEvents>(event: K, ...args: Parameters<DatePickerEvents[K]>): void {
    this.eventManager.emit(event, ...args);
  }

  validate(): ValidationResult {
    // 基础验证逻辑
    if (this.options.minDate && this.state.value) {
      // 只验证单个日期值
      if (!Array.isArray(this.state.value) && typeof this.state.value !== 'object') {
        const date = DateUtils.toDate(this.state.value);
        if (date && DateUtils.compare(date, this.options.minDate) < 0) {
          return {
            valid: false,
            message: '日期不能早于最小日期',
            code: 'MIN_DATE_ERROR'
          };
        }
      }
    }

    return { valid: true };
  }

  setLocale(locale: LocaleType): void {
    this.options.locale = locale;
    this.calendar.setLocale(locale);
    this.render();
  }

  getLocale(): LocaleType {
    return this.options.locale;
  }

  setTheme(theme: ThemeType): void {
    this.options.theme = theme;
    this.themeManager.setTheme(theme);
  }

  getTheme(): ThemeType {
    return this.options.theme;
  }

  getDeviceType(): DeviceType {
    return this.deviceType;
  }

  isDisabled(): boolean {
    return this.options.disabled;
  }

  isReadonly(): boolean {
    return this.options.readonly;
  }

  isEmpty(): boolean {
    return !this.state.value;
  }
}
