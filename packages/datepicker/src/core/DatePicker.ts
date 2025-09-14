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
    // 这里应该根据不同的模式生成不同的 HTML
    // 为了简化，这里只返回一个基础的结构
    return `
      <div class="ldesign-datepicker__input">
        <input 
          type="text" 
          placeholder="${this.options.placeholder}"
          value="${this.getDisplayValue()}"
          ${this.options.readonly ? 'readonly' : ''}
          ${this.options.disabled ? 'disabled' : ''}
        />
      </div>
      <div class="ldesign-datepicker__dropdown" style="display: ${this.state.visible ? 'block' : 'none'}">
        <div class="ldesign-datepicker__calendar">
          ${this.generateCalendarHTML()}
        </div>
      </div>
    `;
  }

  /**
   * 生成日历 HTML
   * @returns 日历 HTML 字符串
   */
  private generateCalendarHTML(): string {
    const calendarData = this.calendar.getCalendarData(this.state.currentYear, this.state.currentMonth);

    let html = '<div class="ldesign-calendar">';

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
        <div class="${cellClass}" data-date="${DateUtils.format(cell.date, 'YYYY-MM-DD')}">
          ${cell.text}
        </div>
      `;
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * 绑定 DOM 事件
   */
  private bindDOMEvents(): void {
    if (!this.rootElement) return;

    // 输入框点击事件
    const input = this.rootElement.querySelector('input');
    if (input) {
      input.addEventListener('click', () => {
        if (!this.options.disabled && !this.options.readonly) {
          this.toggle();
        }
      });
    }

    // 日历单元格点击事件
    const cells = this.rootElement.querySelectorAll('.ldesign-calendar__cell');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const dateStr = target.getAttribute('data-date');
        if (dateStr) {
          this.handleDateSelect(new Date(dateStr));
        }
      });
    });

    // 导航按钮事件
    const prevBtn = this.rootElement.querySelector('.ldesign-calendar__nav--prev');
    const nextBtn = this.rootElement.querySelector('.ldesign-calendar__nav--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateToPrevMonth());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateToNextMonth());
    }
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
