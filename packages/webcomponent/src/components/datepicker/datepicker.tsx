import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { formatDate, parseDate, generateCalendarDates, generateYearList, generateMonthList, WEEKDAY_NAMES, getWeekNumber } from './datepicker.utils';

@Component({ tag: 'ldesign-date-picker', styleUrl: 'datepicker.less', shadow: false })
export class LdesignDatePicker {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string | string[];
  @Prop() defaultValue?: string | string[];

// basic
  @Prop() placeholder: string = '请选择日期';
  @Prop() disabled: boolean = false;
  @Prop() clearable: boolean = true;
  @Prop() format: string = 'YYYY-MM-DD';
  @Prop() mode: 'date' | 'week' | 'month' | 'quarter' | 'year' | 'datetime' = 'date';
  @Prop() range: boolean = false; // 是否启用范围选择
  @Prop() firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
  @Prop() showWeekNumbers: boolean = false;
  @Prop() minDate?: string;
  @Prop() maxDate?: string;
  // time options (for datetime mode)
  @Prop() timeShowSeconds: boolean = true;
  @Prop() timeSteps: number[] = [1, 1, 1];
  // 右侧时间面板可视条目数（奇数更合适：3/5/7...）
  @Prop() timeVisibleItems: number = 7;
  // 以属性方式传入的函数，仅能通过 JS 设置（非 attribute）
  @Prop() disabledDate?: (d: Date) => boolean;

private get placeholderText() {
    // 如果外部显式设置了占位符（attribute 或 property），优先使用
    const hasAttr = this.el?.hasAttribute('placeholder');
    if (hasAttr && typeof this.placeholder === 'string') return this.placeholder;
    const map = {
      date: '请选择日期',
      week: '请选择周',
      month: '请选择月份',
      quarter: '请选择季度',
      year: '请选择年份',
      datetime: '请选择日期时间',
    } as const;
    return map[this.mode];
  }

  private get formatString() {
    // 若外部未显式设置 format，则在 datetime 模式下提供默认格式
    const hasAttr = this.el?.hasAttribute('format');
    if (!hasAttr && this.mode === 'datetime') return 'YYYY-MM-DD HH:mm:ss';
    return this.format;
  }

  // events
  @Event() ldesignChange!: EventEmitter<any>;
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

// state
  @State() visible: boolean = false;
  @State() viewYear: number = new Date().getFullYear();
  @State() viewMonth: number = new Date().getMonth();
  @State() currentView: 'year' | 'month' | 'date' = 'date';
  @State() selected?: Date;
  // 范围模式下的开始/结束与活动端
  @State() start?: Date;
  @State() end?: Date;
  @State() activePart: 'start' | 'end' = 'start';
  @State() yearSelectorOpen: boolean = false;
  @State() timeValue: string = '00:00:00';
  // 范围模式下分别维护两个时间字符串
  @State() timeStart: string = '00:00:00';
  @State() timeEnd: string = '00:00:00';
  // 是否已经有过一次提交（用于在受控场景下也能实时用 selected 渲染文本）
  @State() hasCommitted: boolean = false;
  // 悬停预览状态
  @State() hoverDate?: Date;
  @State() isSelectingRange: boolean = false;

  private get parsedMin() { const d = parseDate(this.minDate as any); return d || undefined; }
  private get parsedMax() { const d = parseDate(this.maxDate as any); return d || undefined; }
  private get isControlled() { return this.el?.hasAttribute('value'); }

@Watch('value') onValue(v?: string | string[]) {
    if (this.range) {
      const splitRange = (input?: string | string[]): [string | undefined, string | undefined] => {
        if (!input) return [undefined, undefined];
        if (Array.isArray(input)) return [input[0], input[1]];
        if (typeof input === 'string') {
          const s = input.trim();
          // 优先匹配不会与日期内部连字符冲突的分隔符
          const seps = ['->', '至', '—', '–', '~', ','];
          for (const sep of seps) {
            const i = s.indexOf(sep);
            if (i !== -1) return [s.slice(0, i).trim(), s.slice(i + sep.length).trim()];
          }
          // 仅当两侧存在空格时，才把单个连字符视作分隔符，避免拆开 YYYY-MM-DD
          if (/\s-\s/.test(s)) {
            const parts = s.split(/\s-\s/);
            return [parts[0]?.trim(), parts.slice(1).join(' - ').trim()];
          }
          return [s, undefined];
        }
        return [undefined, undefined];
      };
      const [aRaw, bRaw] = splitRange(v) || splitRange(this.defaultValue);
      const s = parseDate(aRaw as any);
      const e = parseDate(bRaw as any);
      if (s) {
        this.start = s;
        this.timeStart = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}:${String(s.getSeconds()).padStart(2,'0')}`;
      }
      if (e) {
        this.end = e;
        this.timeEnd = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}:${String(e.getSeconds()).padStart(2,'0')}`;
      }
      // 当面板未展开时，根据已解析的范围决定锚定视图：若存在结束值，则左侧显示结束月的上一个月，右侧显示结束月；
      // 否则仅起始值存在时显示起始月。
      if (!this.visible) {
        if (e) {
          const prev = this.addMonths(e.getFullYear(), e.getMonth(), -1);
          this.viewYear = prev.year;
          this.viewMonth = prev.month;
        } else if (s) {
          this.viewYear = s.getFullYear();
          this.viewMonth = s.getMonth();
        }
      }
      this.activePart = this.end ? 'end' : 'start';
      return;
    }
    const d = parseDate(v as any) || parseDate(this.defaultValue as any);
    if (d) {
      this.selected = d;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
      this.timeValue = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    }
  }

componentWillLoad() {
    const init = this.value ?? this.defaultValue;
    if (this.range) {
      const splitRange = (input?: any): [string | undefined, string | undefined] => {
        if (!input) return [undefined, undefined];
        if (Array.isArray(input)) return [input[0], input[1]];
        if (typeof input === 'string') {
          const s = input.trim();
          const seps = ['->', '至', '—', '–', '~', ','];
          for (const sep of seps) {
            const i = s.indexOf(sep);
            if (i !== -1) return [s.slice(0, i).trim(), s.slice(i + sep.length).trim()];
          }
          if (/\s-\s/.test(s)) { const parts = s.split(/\s-\s/); return [parts[0]?.trim(), parts.slice(1).join(' - ').trim()]; }
          return [s, undefined];
        }
        return [undefined, undefined];
      };
      const [aRaw, bRaw] = splitRange(init);
      const s = parseDate(aRaw as any);
      const e = parseDate(bRaw as any);
      if (s) {
        this.start = s;
        this.timeStart = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}:${String(s.getSeconds()).padStart(2,'0')}`;
      }
      if (e) {
        this.end = e;
        this.timeEnd = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}:${String(e.getSeconds()).padStart(2,'0')}`;
      }
      // 初始锚定策略同上：有结束值则锚定到结束月（左前右当），否则锚定到起始月
      if (e) {
        const prev = this.addMonths(e.getFullYear(), e.getMonth(), -1);
        this.viewYear = prev.year;
        this.viewMonth = prev.month;
      } else if (s) {
        this.viewYear = s.getFullYear();
        this.viewMonth = s.getMonth();
      }
      if (this.mode === 'datetime' && !this.start) {
        const now = new Date();
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.start = d0; // 默认以今天为开始
        this.viewYear = d0.getFullYear();
        this.viewMonth = d0.getMonth();
      }
    } else {
      const d = parseDate(init as any);
      if (d) {
        this.selected = d;
        this.viewYear = d.getFullYear();
        this.viewMonth = d.getMonth();
        this.timeValue = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
      } else if (this.mode === 'datetime') {
        // datetime 模式默认选中“今天”，并将时间置为 00:00:00
        const now = new Date();
        this.selected = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.viewYear = this.selected.getFullYear();
        this.viewMonth = this.selected.getMonth();
        this.timeValue = '00:00:00';
      }
    }
    // 初始视图
    this.currentView = this.mode === 'year' ? 'year' : this.mode === 'month' ? 'month' : 'date';
  }

  private open = () => { if (!this.disabled) this.visible = true; };
  private close = () => { this.visible = false; };

  private commitValue(d: Date) {
    // 标记已有提交，后续触发器文本会优先使用 selected 渲染，避免受控外层未回写导致不刷新
    this.hasCommitted = true;
    if (this.range) return; // 范围模式下不走单值通道
    if (this.mode === 'date') {
      const out = formatDate(d, this.formatString);
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    } else if (this.mode === 'month') {
      const out = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    } else if (this.mode === 'year') {
      const out = String(d.getFullYear());
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    } else if (this.mode === 'quarter') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      const out = `${d.getFullYear()}-Q${q}`;
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    } else if (this.mode === 'week') {
      const wn = getWeekNumber(d);
      const out = `${d.getFullYear()}-${String(wn).padStart(2, '0')}周`;
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    } else if (this.mode === 'datetime') {
      const out = formatDate(d, this.formatString);
      if (!this.isControlled) this.value = out as any;
      this.ldesignChange.emit(out);
    }
  }

private handleDateClick = (d: Date, disabled: boolean) => {
    if (disabled) return;
    if (this.range) {
      // 范围选择
      if (!this.start || (this.start && this.end)) {
        // 开始新的范围选择
        this.start = d; 
        this.end = undefined; 
        this.activePart = 'end'; 
        this.selected = d;
        this.isSelectingRange = true;
        this.hoverDate = undefined;
        if (this.mode === 'datetime') {
          this.timeValue = this.timeStart;
        }
      } else {
        // 选择结束端
        if (d < this.start) { 
          this.end = this.start; 
          this.start = d; 
        } else { 
          this.end = d; 
        }
        this.selected = d;
        this.isSelectingRange = false;
        this.hoverDate = undefined;
        // 将视图锚定到“第二次点击”的月份：左侧显示前一个月，右侧显示当前月
        const prev = this.addMonths(d.getFullYear(), d.getMonth(), -1);
        this.viewYear = prev.year;
        this.viewMonth = prev.month;
        this.commitRangeIfReady(true);
      }
      return;
    }
    if (this.mode === 'date' || this.mode === 'week') {
      this.selected = d;
      this.commitValue(d);
      this.close();
    } else if (this.mode === 'datetime') {
      const { h, m, s } = this.parseTime(this.timeValue);
      const nd = new Date(d);
      nd.setHours(h, m, s, 0);
      this.selected = nd;
      this.commitValue(nd);
    }
  };

  private handleQuarterClick = (year: number, q: number) => {
    const d = new Date(year, q * 3, 1);
    if (this.range && this.mode === 'quarter') {
      if (!this.start || (this.start && this.end)) { 
        this.start = d; 
        this.end = undefined; 
        this.activePart = 'end'; 
        this.selected = d; 
        this.isSelectingRange = true;
      } else { 
        if (d < this.start) { 
          this.end = this.start; 
          this.start = d; 
        } else { 
          this.end = d; 
        } 
        this.selected = d; 
        this.isSelectingRange = false;
        this.commitRangeIfReady(true); 
      }
      return;
    }
    this.selected = d;
    this.commitValue(d);
    this.close();
  };

  private handleMonthClick = (year: number, m: number) => {
    if (this.mode === 'month') {
      const d = new Date(year, m, 1);
      if (this.range) {
        if (!this.start || (this.start && this.end)) { 
          this.start = d; 
          this.end = undefined; 
          this.activePart = 'end'; 
          this.selected = d; 
          this.isSelectingRange = true;
        } else { 
          if (d < this.start) { 
            this.end = this.start; 
            this.start = d; 
          } else { 
            this.end = d; 
          } 
          this.selected = d; 
          this.isSelectingRange = false;
          this.commitRangeIfReady(true); 
        }
        return;
      }
      this.selected = d;
      this.commitValue(d);
      this.close();
    } else {
      this.viewYear = year; this.viewMonth = m; this.currentView = 'date';
    }
  };

  private handleYearClick = (y: number) => {
    if (this.mode === 'year') {
      const d = new Date(y, 0, 1);
      if (this.range) {
        if (!this.start || (this.start && this.end)) { 
          this.start = d; 
          this.end = undefined; 
          this.activePart = 'end'; 
          this.selected = d; 
          this.isSelectingRange = true;
        } else { 
          if (d < this.start) { 
            this.end = this.start; 
            this.start = d; 
          } else { 
            this.end = d; 
          } 
          this.selected = d; 
          this.isSelectingRange = false;
          this.commitRangeIfReady(true); 
        }
        return;
      }
      this.selected = d; this.commitValue(d); this.close();
    } else {
      this.viewYear = y;
      if (this.mode === 'month') this.currentView = 'month';
      else if (this.mode === 'date' || this.mode === 'week') this.currentView = 'date';
      else if (this.mode === 'quarter') this.currentView = 'year';
    }
  };

  // 原有的 navigatePrev/navigateNext 专供年份视图使用（十年级联）
  private navigatePrev = () => { this.viewYear -= 10; };
  private navigateNext = () => { this.viewYear += 10; };

  // 新的月份/年份移动，用于匹配截图的双/单箭头交互
  private prevMonth = () => {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear -= 1; } else { this.viewMonth -= 1; }
  };
  private nextMonth = () => {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear += 1; } else { this.viewMonth += 1; }
  };
  private prevYear = () => { this.viewYear -= 1; };
  private nextYear = () => { this.viewYear += 1; };

  private switchToYear = () => { this.currentView = 'year'; };
  private switchToMonth = () => { this.currentView = 'month'; };

private toggleYearSelector = () => {
    this.yearSelectorOpen = !this.yearSelectorOpen;
  };

  private parseTime(str?: string | null): { h: number; m: number; s: number } {
    if (!str || typeof str !== 'string') return { h: 0, m: 0, s: 0 };
    const m = str.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (!m) return { h: 0, m: 0, s: 0 };
    const h = Math.max(0, Math.min(23, parseInt(m[1], 10) || 0));
    const mi = Math.max(0, Math.min(59, parseInt(m[2], 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(m[3] ?? '0', 10) || 0));
    return { h, m: mi, s };
  }

  private onTimeConfirm = (e: CustomEvent<string | undefined>) => {
    // 备用：如果启用 confirm 模式会走这里
    const t = e.detail || '00:00:00';
    if (this.range && this.mode === 'datetime') {
      if (this.activePart === 'start') this.timeStart = t; else this.timeEnd = t;
      this.timeValue = t;
      this.commitRangeIfReady(true);
      return;
    }
    this.timeValue = t;
    const { h, m, s } = this.parseTime(t);
    const base = this.selected || new Date(this.viewYear, this.viewMonth, new Date().getDate());
    const d = new Date(base);
    d.setHours(h, m, s, 0);
    this.selected = d;
    this.commitValue(d);
    this.close();
  };

  // 时间值真正提交的入口：监听 time-picker 的 change 事件（比子列的 pick 更可靠）
  private onTimeChange = (e: CustomEvent<string | undefined | any>) => {
    // 只处理来自 ldesign-time-picker 自身的 change（detail 为完整时间字符串）
    if (typeof e.detail !== 'string') {
      // 忽略子列 ldesign-picker 冒泡上来的对象形态事件
      return;
    }
    const t = e.detail || '00:00:00';
    if (this.range && this.mode === 'datetime') {
      this.timeValue = t;
      if (this.activePart === 'start') this.timeStart = t; else this.timeEnd = t;
      // 将时间赋给对应端的临时日期
      if (this.activePart === 'start' && this.start) {
        const { h, m, s } = this.parseTime(t); const d = new Date(this.start); d.setHours(h, m, s, 0); this.start = d; this.selected = d;
      } else if (this.activePart === 'end' && this.end) {
        const { h, m, s } = this.parseTime(t); const d = new Date(this.end); d.setHours(h, m, s, 0); this.end = d; this.selected = d;
      }
      this.commitRangeIfReady(false);
      return;
    }
    this.timeValue = t;
    const { h, m, s } = this.parseTime(t);
    const base = this.selected || new Date(this.viewYear, this.viewMonth, new Date().getDate());
    const d = new Date(base);
    d.setHours(h, m, s, 0);
    this.selected = d;
    this.commitValue(d);
  };

  // 无确认模式：仅在点击/键盘落点时提交；滚动过程中不关闭弹层
  private onTimePick = (e: CustomEvent<{ value?: string; context?: { trigger?: string } }>) => {
    // 仅处理来自 ldesign-time-picker 自身的 pick；忽略子列 ldesign-picker 冒泡上来的 pick
    const tgt = (e.target as HTMLElement | null);
    const tag = tgt?.tagName?.toUpperCase?.() || '';
    if (tag !== 'LDESIGN-TIME-PICKER') return;
    const trig = (e.detail && (e.detail as any).context?.trigger) as string | undefined;
    // 关闭策略与用户期望一致：点击/键盘/此刻关闭；滚轮/滚动/触摸不关闭
    if (!this.range && (trig === 'click' || trig === 'keyboard' || trig === 'now')) {
      this.close();
    }
    if (this.range && (trig === 'click' || trig === 'keyboard' || trig === 'now')) {
      // 范围模式下：只有当起止都已选中时才关闭
      if (this.start && this.end) this.close();
    }
  };

  private selectQuickYear = (year: number) => {
    this.viewYear = year;
    this.yearSelectorOpen = false;
  };

  private addMonths(baseYear: number, baseMonth: number, delta: number) {
    const d = new Date(baseYear, baseMonth + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  private formatByMode(d: Date): string {
    if (this.mode === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
    if (this.mode === 'year') return String(d.getFullYear());
    if (this.mode === 'quarter') {
      const q = Math.floor(d.getMonth()/3)+1; return `${d.getFullYear()}-Q${q}`;
    }
    if (this.mode === 'week') { const wn = getWeekNumber(d); return `${d.getFullYear()}-${String(wn).padStart(2,'0')}周`; }
    return formatDate(d, this.formatString);
  }

  private commitRangeIfReady(shouldClose: boolean) {
    if (!this.start || !this.end) return;
    this.hasCommitted = true;
    const sOut = this.formatByMode(this.start);
    const eOut = this.formatByMode(this.end);
    if (!this.isControlled) this.value = `${sOut} -> ${eOut}` as any;
    this.ldesignChange.emit([sOut, eOut]);
    if (shouldClose && this.mode !== 'datetime') this.close();
  }

  private renderYearPanel() {
    if (this.range && this.mode === 'year') {
      const yearsL = generateYearList(this.viewYear, this.selected?.getFullYear() || null, this.parsedMin, this.parsedMax);
      const centerR = this.viewYear + 10;
      const yearsR = generateYearList(centerR, this.selected?.getFullYear() || null, this.parsedMin, this.parsedMax);
      const renderYearGrid = (years: ReturnType<typeof generateYearList>, side: 'left'|'right') => {
        const start = years[0]?.year; const end = years[years.length - 1]?.year;
        return (
          <div class="ldp-year">
            <div class="ldp-header">
              {side === 'left' ? (
                <div class="ldp-header-group ldp-header-group--left">
                  <button class={{ 'ldp-nav': true }} onClick={this.navigatePrev} type="button" aria-label="上一个十年"><ldesign-icon name="chevrons-left" size="small" /></button>
                </div>
              ) : <div class="ldp-header-group ldp-header-group--left" />}
              <span class="ldp-head-text">{start}年 - {end}年</span>
              {side === 'right' ? (
                <div class="ldp-header-group ldp-header-group--right">
                  <button class={{ 'ldp-nav': true }} onClick={this.navigateNext} type="button" aria-label="下一个十年"><ldesign-icon name="chevrons-right" size="small" /></button>
                </div>
              ) : <div class="ldp-header-group ldp-header-group--right" />}
            </div>
            <div class="ldp-year-grid">
              {years.map(y => (
                <button
                  class={{
                    'ldp-year-item': true,
                    'selected': !this.range && y.isSelected,
                    'current': y.isCurrent,
                    'disabled': y.isDisabled,
                    'in-range': !!(this.range && this.start && this.end && y.year > this.start.getFullYear() && y.year < this.end.getFullYear()) ||
                               !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                                  y.year > Math.min(this.start.getFullYear(), this.hoverDate.getFullYear()) && 
                                  y.year < Math.max(this.start.getFullYear(), this.hoverDate.getFullYear())),
                    'range-start': !!(this.range && this.start && y.year === this.start.getFullYear()),
                    'range-end': !!(this.range && this.end && y.year === this.end.getFullYear()),
                  }}
                  disabled={y.isDisabled}
                  onClick={() => this.handleYearClick(y.year)}
                  onMouseEnter={() => { if (this.range && this.isSelectingRange && !y.isDisabled) this.hoverDate = new Date(y.year, 0, 1); }}
                  type="button"
                >
                  {y.year}
                </button>
              ))}
            </div>
          </div>
        );
      };
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderYearGrid(yearsL, 'left')}
          {renderYearGrid(yearsR, 'right')}
        </div>
      );
    }

    const years = generateYearList(this.viewYear, this.selected?.getFullYear() || null, this.parsedMin, this.parsedMax);
    const start = years[0]?.year; const end = years[years.length - 1]?.year;
    return (
      <div class="ldp-year">
        <div class="ldp-header">
          <div class="ldp-header-group ldp-header-group--left">
            <button class={{ 'ldp-nav': true }} onClick={this.navigatePrev} type="button" aria-label="上一个十年">
              <ldesign-icon name="chevrons-left" size="small" />
            </button>
          </div>
          <span class="ldp-head-text">{start}年 - {end}年</span>
          <div class="ldp-header-group ldp-header-group--right">
            <button class={{ 'ldp-nav': true }} onClick={this.navigateNext} type="button" aria-label="下一个十年">
              <ldesign-icon name="chevrons-right" size="small" />
            </button>
          </div>
        </div>
        <div class="ldp-year-grid">
          {years.map(y => (
            <button
              class={{
                'ldp-year-item': true,
                'selected': !this.range && y.isSelected,
                'current': y.isCurrent,
                'disabled': y.isDisabled,
                'in-range': !!(this.range && this.start && this.end && y.year > this.start.getFullYear() && y.year < this.end.getFullYear()) ||
                           !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                              y.year > Math.min(this.start.getFullYear(), this.hoverDate.getFullYear()) && 
                              y.year < Math.max(this.start.getFullYear(), this.hoverDate.getFullYear())),
                'range-start': !!(this.range && this.start && y.year === this.start.getFullYear()),
                'range-end': !!(this.range && this.end && y.year === this.end.getFullYear()),
              }}
              disabled={y.isDisabled}
              onClick={() => this.handleYearClick(y.year)}
              onMouseEnter={() => { if (this.range && this.isSelectingRange && !y.isDisabled) this.hoverDate = new Date(y.year, 0, 1); }}
              type="button"
            >
              {y.year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  private renderMonthPanel() {
    if (this.range && this.mode === 'month') {
      const yL = this.viewYear;
      const yR = this.viewYear + 1;
      const monthsL = generateMonthList(yL, this.selected || null, this.parsedMin, this.parsedMax);
      const monthsR = generateMonthList(yR, this.selected || null, this.parsedMin, this.parsedMax);
      const renderMonthGrid = (year: number, months: ReturnType<typeof generateMonthList>, side: 'left'|'right') => (
        <div class="ldp-month">
          <div class={{ 'ldp-header': true, 'ldp-header--with-year': true }}>
            {side === 'left' ? (
              <div class="ldp-header-group ldp-header-group--left">
                <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年"><ldesign-icon name="chevrons-left" size="small" /></button>
              </div>
            ) : <div class="ldp-header-group ldp-header-group--left" />}
            <button
              class={{ 'ldp-year-selector': true, 'ldp-year-selector--open': this.yearSelectorOpen }}
              onClick={this.toggleYearSelector}
              type="button"
            >
              {year}年
              <span class="ldp-year-selector-icon">▼</span>
            </button>
            {side === 'right' ? (
              <div class="ldp-header-group ldp-header-group--right">
                <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年"><ldesign-icon name="chevrons-right" size="small" /></button>
              </div>
            ) : <div class="ldp-header-group ldp-header-group--right" />}
            {side === 'left' ? this.renderYearQuickSelector() : null}
          </div>
          <div class="ldp-month-grid">
            {months.map(m => {
              const cur = year * 12 + m.month;
              const startM = this.start ? (this.start.getFullYear() * 12 + this.start.getMonth()) : -Infinity;
              const endM = this.end ? (this.end.getFullYear() * 12 + this.end.getMonth()) : Infinity;
              return (
                <button
                  class={{
                    'ldp-month-item': true,
                    'selected': !this.range && m.isSelected,
                    'current': m.isCurrent,
                    'disabled': m.isDisabled,
                    'in-range': !!(this.range && this.start && this.end && cur > startM && cur < endM) || 
                               !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                                  cur > Math.min(this.start.getFullYear() * 12 + this.start.getMonth(), this.hoverDate.getFullYear() * 12 + this.hoverDate.getMonth()) && 
                                  cur < Math.max(this.start.getFullYear() * 12 + this.start.getMonth(), this.hoverDate.getFullYear() * 12 + this.hoverDate.getMonth())),
                    'range-start': !!(this.range && this.start && year === this.start.getFullYear() && m.month === this.start.getMonth()),
                    'range-end': !!(this.range && this.end && year === this.end.getFullYear() && m.month === this.end.getMonth()),
                  }}
                  disabled={m.isDisabled}
                  onClick={() => this.handleMonthClick(year, m.month)}
                  onMouseEnter={() => { if (this.range && this.isSelectingRange && !m.isDisabled) this.hoverDate = new Date(year, m.month, 1); }}
                  type="button"
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      );
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderMonthGrid(yL, monthsL, 'left')}
          {renderMonthGrid(yR, monthsR, 'right')}
        </div>
      );
    }

    const months = generateMonthList(this.viewYear, this.selected || null, this.parsedMin, this.parsedMax);
    return (
      <div class="ldp-month">
        <div class={{ 'ldp-header': true, 'ldp-header--with-year': true }}>
          <div class="ldp-header-group ldp-header-group--left">
            <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年">
              <ldesign-icon name="chevrons-left" size="small" />
            </button>
          </div>
          <button
            class={{ 'ldp-year-selector': true, 'ldp-year-selector--open': this.yearSelectorOpen }}
            onClick={this.toggleYearSelector}
            type="button"
          >
            {this.viewYear}年
            <span class="ldp-year-selector-icon">▼</span>
          </button>
          <div class="ldp-header-group ldp-header-group--right">
            <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年">
              <ldesign-icon name="chevrons-right" size="small" />
            </button>
          </div>
          {this.renderYearQuickSelector()}
        </div>
        <div class="ldp-month-grid">
          {months.map(m => (
              <button
                class={{
                  'ldp-month-item': true,
                  'selected': !this.range && m.isSelected,
                  'current': m.isCurrent,
                  'disabled': m.isDisabled,
                  'in-range': !!(this.range && this.start && this.end && ((this.viewYear * 12 + m.month) > (this.start.getFullYear() * 12 + this.start.getMonth()) && (this.viewYear * 12 + m.month) < (this.end.getFullYear() * 12 + this.end.getMonth()))) ||
                             !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                                ((this.viewYear * 12 + m.month) > Math.min(this.start.getFullYear() * 12 + this.start.getMonth(), this.hoverDate.getFullYear() * 12 + this.hoverDate.getMonth()) && 
                                 (this.viewYear * 12 + m.month) < Math.max(this.start.getFullYear() * 12 + this.start.getMonth(), this.hoverDate.getFullYear() * 12 + this.hoverDate.getMonth()))),
                  'range-start': !!(this.range && this.start && this.viewYear === this.start.getFullYear() && m.month === this.start.getMonth()),
                  'range-end': !!(this.range && this.end && this.viewYear === this.end.getFullYear() && m.month === this.end.getMonth()),
                }}
                disabled={m.isDisabled}
                onClick={() => this.handleMonthClick(this.viewYear, m.month)}
                onMouseEnter={() => { if (this.range && this.isSelectingRange && !m.isDisabled) this.hoverDate = new Date(this.viewYear, m.month, 1); }}
                type="button"
              >
                {m.label}
              </button>
          ))}
        </div>
      </div>
    );
  }

  private renderQuarterPanel() {
    const quarters = [
      { quarter: 0, label: 'Q1' },
      { quarter: 1, label: 'Q2' },
      { quarter: 2, label: 'Q3' },
      { quarter: 3, label: 'Q4' }
    ];
    const selectedQ = this.selected ? Math.floor(this.selected.getMonth() / 3) : -1;
    const currentQ = Math.floor(new Date().getMonth() / 3);
    const currentYear = new Date().getFullYear();

    if (this.range && this.mode === 'quarter') {
      const yL = this.viewYear;
      const yR = this.viewYear + 1;
      const renderQuarterGrid = (y: number, side: 'left'|'right') => (
        <div class="ldp-quarter">
          <div class="ldp-header">
            {side === 'left' ? (
              <div class="ldp-header-group ldp-header-group--left">
                <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年"><ldesign-icon name="chevrons-left" size="small" /></button>
              </div>
            ) : <div class="ldp-header-group ldp-header-group--left" />}
            <button class="ldp-head-text" onClick={this.switchToYear} type="button">{y}年</button>
            {side === 'right' ? (
              <div class="ldp-header-group ldp-header-group--right">
                <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年"><ldesign-icon name="chevrons-right" size="small" /></button>
              </div>
            ) : <div class="ldp-header-group ldp-header-group--right" />}
          </div>
          <div class="ldp-quarter-grid">
            {quarters.map(q => {
              const isSelected = this.selected && this.selected.getFullYear() === y && selectedQ === q.quarter;
              const isCurrent = y === currentYear && currentQ === q.quarter;
              const startQ = this.start ? (this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3)) : -Infinity;
              const endQ = this.end ? (this.end.getFullYear() * 4 + Math.floor(this.end.getMonth() / 3)) : Infinity;
              const curQ = y * 4 + q.quarter;
              return (
                <button
                  class={{
                    'ldp-quarter-item': true,
                    'selected': !this.range && isSelected,
                    'current': isCurrent,
                    'in-range': !!(this.range && this.start && this.end && curQ > startQ && curQ < endQ) ||
                               !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                                  curQ > Math.min(this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3), this.hoverDate.getFullYear() * 4 + Math.floor(this.hoverDate.getMonth() / 3)) && 
                                  curQ < Math.max(this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3), this.hoverDate.getFullYear() * 4 + Math.floor(this.hoverDate.getMonth() / 3))),
                    'range-start': !!(this.range && this.start && y === this.start.getFullYear() && q.quarter === Math.floor(this.start.getMonth() / 3)),
                    'range-end': !!(this.range && this.end && y === this.end.getFullYear() && q.quarter === Math.floor(this.end.getMonth() / 3)),
                  }}
                  onClick={() => this.handleQuarterClick(y, q.quarter)}
                  onMouseEnter={() => { if (this.range && this.isSelectingRange) this.hoverDate = new Date(y, q.quarter * 3, 1); }}
                  type="button"
                >
                  <div class="ldp-quarter-label">{q.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      );
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderQuarterGrid(yL, 'left')}
          {renderQuarterGrid(yR, 'right')}
        </div>
      );
    }

    return (
      <div class="ldp-quarter">
        <div class="ldp-header">
          <div class="ldp-header-group ldp-header-group--left">
            <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年">
              <ldesign-icon name="chevrons-left" size="small" />
            </button>
          </div>
          <button class="ldp-head-text" onClick={this.switchToYear} type="button">{this.viewYear}年</button>
          <div class="ldp-header-group ldp-header-group--right">
            <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年">
              <ldesign-icon name="chevrons-right" size="small" />
            </button>
          </div>
        </div>
        <div class="ldp-quarter-grid">
          {quarters.map(q => {
            const isSelected = this.selected && this.selected.getFullYear() === this.viewYear && selectedQ === q.quarter;
            const isCurrent = this.viewYear === currentYear && currentQ === q.quarter;
            return (
            <button
              class={{
                'ldp-quarter-item': true,
                'selected': !this.range && isSelected,
                'current': isCurrent,
                'in-range': !!(this.range && this.start && this.end && ((this.viewYear * 4 + q.quarter) > (this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3)) && (this.viewYear * 4 + q.quarter) < (this.end.getFullYear() * 4 + Math.floor(this.end.getMonth() / 3)))) ||
                           !!(this.range && this.isSelectingRange && this.start && this.hoverDate && 
                              ((this.viewYear * 4 + q.quarter) > Math.min(this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3), this.hoverDate.getFullYear() * 4 + Math.floor(this.hoverDate.getMonth() / 3)) && 
                               (this.viewYear * 4 + q.quarter) < Math.max(this.start.getFullYear() * 4 + Math.floor(this.start.getMonth() / 3), this.hoverDate.getFullYear() * 4 + Math.floor(this.hoverDate.getMonth() / 3)))),
                'range-start': !!(this.range && this.start && this.viewYear === this.start.getFullYear() && q.quarter === Math.floor(this.start.getMonth() / 3)),
                'range-end': !!(this.range && this.end && this.viewYear === this.end.getFullYear() && q.quarter === Math.floor(this.end.getMonth() / 3)),
              }}
              onClick={() => this.handleQuarterClick(this.viewYear, q.quarter)}
              onMouseEnter={() => { if (this.range && this.isSelectingRange) this.hoverDate = new Date(this.viewYear, q.quarter * 3, 1); }}
              type="button"
            >
              <div class="ldp-quarter-label">{q.label}</div>
            </button>
            );
          })}
        </div>
      </div>
    );
  }

  private renderYearQuickSelector() {
    if (!this.yearSelectorOpen) return null;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;
    const years: number[] = [];

    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }

    return (
      <div class="ldp-year-quick">
        {years.map(year => (
          <button
            class={{
              'ldp-year-quick-item': true,
              'selected': year === this.viewYear
            }}
            onClick={() => this.selectQuickYear(year)}
            type="button"
          >
            {year}
          </button>
        ))}
      </div>
    );
  }

  private renderDatePanel() {
    const dates = generateCalendarDates(this.viewYear, this.viewMonth, this.selected || null, this.parsedMin, this.parsedMax, this.disabledDate, this.showWeekNumbers || this.mode === 'week', this.firstDayOfWeek);
    const names = [...WEEKDAY_NAMES];
    const heads = Array.from({ length: 7 }, (_, i) => names[(i + this.firstDayOfWeek) % 7]);

    // Group dates by week for week mode
    const weeks: any[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }

    const selectedWeek = this.selected ? getWeekNumber(this.selected) : -1;
    const selectedYear = this.selected ? this.selected.getFullYear() : -1;
    const hasWeekNumbers = this.showWeekNumbers || this.mode === 'week';

    if (this.range && (this.mode === 'date' || this.mode === 'datetime' || this.mode === 'week')) {
      // 双月面板（左=当前月，右=下一月）
      const right = this.addMonths(this.viewYear, this.viewMonth, 1);
      const datesL = generateCalendarDates(this.viewYear, this.viewMonth, null, this.parsedMin, this.parsedMax, this.disabledDate, hasWeekNumbers, this.firstDayOfWeek);
      const datesR = generateCalendarDates(right.year, right.month, null, this.parsedMin, this.parsedMax, this.disabledDate, hasWeekNumbers, this.firstDayOfWeek);
      const heads2 = heads;
      const isWeek = this.mode === 'week';
      const renderGrid = (dates: any[], y: number, m: number, side: 'left'|'right') => {
        // 分组每周
        const weeksLocal: any[][] = [];
        for (let i = 0; i < dates.length; i += 7) weeksLocal.push(dates.slice(i, i + 7));
        return (
          <div class={{ 'ldp-date': true, 'ldp-date--with-weeks': hasWeekNumbers, 'ldp-date--week': isWeek }}>
            <div class={{ 'ldp-header': true, 'ldp-header--with-year': true }}>
              {side === 'left' ? (
                <div class="ldp-header-group ldp-header-group--left">
                  <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年"><ldesign-icon name="chevrons-left" size="small" /></button>
                  <button class="ldp-nav" onClick={this.prevMonth} type="button" aria-label="上一月"><ldesign-icon name="chevron-left" size="small" /></button>
                </div>
              ) : <div class="ldp-header-group ldp-header-group--left" />}
              <div class="ldp-header-center">
                <button class={{ 'ldp-year-selector': true, 'ldp-year-selector--open': this.yearSelectorOpen }} onClick={this.toggleYearSelector} type="button">{y}年<span class="ldp-year-selector-icon">▼</span></button>
                <button class="ldp-head-text" onClick={this.switchToMonth} type="button">{m + 1}月</button>
              </div>
              {side === 'right' ? (
                <div class="ldp-header-group ldp-header-group--right">
                  <button class="ldp-nav" onClick={this.nextMonth} type="button" aria-label="下一月"><ldesign-icon name="chevron-right" size="small" /></button>
                  <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年"><ldesign-icon name="chevrons-right" size="small" /></button>
                </div>
              ) : <div class="ldp-header-group ldp-header-group--right" />}
              {side === 'left' ? this.renderYearQuickSelector() : null}
            </div>
            <div class="ldp-weekdays">
              {hasWeekNumbers ? <div class="ldp-weeknum-header">周</div> : null}
              {heads2.map((d) => (<div class="ldp-weekday">{d}</div>))}
            </div>
            <div class="ldp-days">
              {isWeek ? (
                weeksLocal.map((weekDates) => {
                  const weekNum = weekDates[0].weekNumber;
                  const rowStart = weekDates[0].date;
                  const rowEnd = weekDates[6].date;
                  const isSelectedWeek = selectedYear === y && selectedWeek === weekNum;
                  const allDaysDisabled = weekDates.every(d => d.isDisabled);

                  // 将一周归属到“星期中间日”（第4个单元，约等于周四）所在的月份，避免左右面板同时当作端点周
                  const anchor = weekDates[3]?.date || rowStart;
                  const belongsToThisPanel = anchor.getFullYear() === y && anchor.getMonth() === m;

                  // 行可用性：仅归属于本面板的周行可点击（与日期模式中“非本月不可点”一致）
                  const rowDisabled = !belongsToThisPanel || allDaysDisabled;

                  // 是否为范围端点所在周（仅在范围模式下判定，且只在“本面板归属”时显示为端点）
                  const isStartWeek = !!(this.range && this.start && belongsToThisPanel && rowStart <= this.start && this.start <= rowEnd);
                  const isEndWeek = !!(this.range && this.end && belongsToThisPanel && rowStart <= this.end && this.end <= rowEnd);

                  let inRangeRow = this.range && this.start && this.end ? (rowEnd >= this.start && rowStart <= this.end) : false;
                  // 悬停预览效果
                  const inHoverRangeRow = this.range && this.isSelectingRange && this.start && this.hoverDate ? 
                    (rowEnd >= Math.min(this.start.getTime(), this.hoverDate.getTime()) && 
                     rowStart <= Math.max(this.start.getTime(), this.hoverDate.getTime())) : false;
                  if (inHoverRangeRow) inRangeRow = true;
                  // 仅在“本面板归属”的周行上展示浅蓝 in-range，高亮不跨面板重复
                  const inRangeThisPanel = inRangeRow && belongsToThisPanel;

                  const pickWeek = () => {
                    if (rowDisabled) return;
                    const d = rowStart; // 用周起始日作为选择锚点
                    if (this.range && this.mode === 'week') {
                      if (!this.start || (this.start && this.end)) { 
                        this.start = d; 
                        this.end = undefined; 
                        this.activePart = 'end'; 
                        this.selected = d; 
                        this.isSelectingRange = true;
                      } else { 
                        if (d < this.start) { 
                          this.end = this.start; 
                          this.start = d; 
                        } else { 
                          this.end = d; 
                        } 
                        this.selected = d; 
                        this.isSelectingRange = false;
                        // 将视图锚定到“第二次点击”的月份：左侧显示前一个月，右侧显示当前月
                        const prev = this.addMonths(d.getFullYear(), d.getMonth(), -1);
                        this.viewYear = prev.year;
                        this.viewMonth = prev.month;
                        this.commitRangeIfReady(true); 
                      }
                    } else {
                      this.selected = d; this.commitValue(d); this.close();
                    }
                  };
                  return (
                    <div 
                      class={{ 
                        'ldp-week-row': true, 
                        // 在范围模式下，起止周也使用 selected-week 的深蓝样式，避免被 in-range 干扰
                        'selected-week': (!this.range && isSelectedWeek) || (!!this.range && (isStartWeek || isEndWeek)), 
'in-range': !!inRangeThisPanel, 
                        'range-start-week': !!(this.range && isStartWeek),
                        'range-end-week': !!(this.range && isEndWeek),
                        'disabled': rowDisabled,
                      }} 
                      onClick={pickWeek}
                      onMouseEnter={() => { if (this.range && this.isSelectingRange && !rowDisabled) this.hoverDate = rowStart; }}
                    >
                      <div class="ldp-weeknum">{weekNum}</div>
                      {weekDates.map(d => (
                        <button
                          class={{
                            'ldp-day': true,
                            'other': !d.isCurrentMonth,
                            'today': d.isToday,
                            'selected': !this.range && isSelectedWeek,
                            'disabled': rowDisabled || d.isDisabled
                          }}
                          disabled={rowDisabled || d.isDisabled}
                          onClick={(ev) => { ev.stopPropagation(); pickWeek(); }}
                          type="button"
                        >
                          {d.day}
                        </button>
                      ))}
                    </div>
                  );
                })
              ) : (
                dates.map((d, idx) => {
                  let isStart = this.start ? (d.date.getFullYear()===this.start.getFullYear() && d.date.getMonth()===this.start.getMonth() && d.date.getDate()===this.start.getDate()) : false;
                  let isEnd = this.end ? (d.date.getFullYear()===this.end.getFullYear() && d.date.getMonth()===this.end.getMonth() && d.date.getDate()===this.end.getDate()) : false;
                  let inRange = this.start && this.end ? (d.date >= this.start && d.date <= this.end) : false;
                  // 悬停预览效果
                  const inHoverRange = this.isSelectingRange && this.start && this.hoverDate ? 
                    (d.date >= Math.min(this.start.getTime(), this.hoverDate.getTime()) && 
                     d.date <= Math.max(this.start.getTime(), this.hoverDate.getTime())) : false;
                  if (inHoverRange) inRange = true;
                  // 仅在本月单元格上展示范围高亮与端点，避免跨面板的“其他月”单元格被渲染为范围态
                  const showOnThisPanel = d.isCurrentMonth;
                  // 在当前面板之外，端点不显示
                  if (!showOnThisPanel) { isStart = false; isEnd = false; }
                  // 范围模式下：灰色（非本月）日期不可选择
                  const isCellDisabled = d.isDisabled || !d.isCurrentMonth;
                  return ([
                    hasWeekNumbers && idx % 7 === 0 ? <div class="ldp-weeknum">{d.weekNumber}</div> : null,
                    <button
                      class={{
                        'ldp-day': true,
                        'other': !d.isCurrentMonth,
                        'today': d.isToday,
                        'in-range': showOnThisPanel && inRange && !(isStart || isEnd),
                        'range-start': showOnThisPanel && isStart,
                        'range-end': showOnThisPanel && isEnd,
                        'disabled': isCellDisabled
                      }}
                      disabled={isCellDisabled}
                      onClick={() => this.handleDateClick(d.date, isCellDisabled)}
                      onMouseEnter={() => { if (this.isSelectingRange && !isCellDisabled) this.hoverDate = d.date; }}
                      type="button"
                    >
                      {d.day}
                    </button>
                  ]);
                })
              )}
            </div>
          </div>
        );
      };
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderGrid(datesL, this.viewYear, this.viewMonth, 'left')}
          {renderGrid(datesR, right.year, right.month, 'right')}
        </div>
      );
    }

    return (
      <div class={{ 'ldp-date': true, 'ldp-date--with-weeks': hasWeekNumbers, 'ldp-date--week': this.mode === 'week' }}>
        <div class={{ 'ldp-header': true, 'ldp-header--with-year': true }}>
          <div class="ldp-header-group ldp-header-group--left">
            <button class={{ 'ldp-nav': true }} onClick={this.prevYear} type="button" aria-label="上一年">
              <ldesign-icon name="chevrons-left" size="small" />
            </button>
            <button class="ldp-nav" onClick={this.prevMonth} type="button" aria-label="上一月"><ldesign-icon name="chevron-left" size="small" /></button>
          </div>
          <div class="ldp-header-center">
            <button
              class={{ 'ldp-year-selector': true, 'ldp-year-selector--open': this.yearSelectorOpen }}
              onClick={this.toggleYearSelector}
              type="button"
            >
              {this.viewYear}年
              <span class="ldp-year-selector-icon">▼</span>
            </button>
            <button class="ldp-head-text" onClick={this.switchToMonth} type="button">{this.viewMonth + 1}月</button>
          </div>
          <div class="ldp-header-group ldp-header-group--right">
            <button class="ldp-nav" onClick={this.nextMonth} type="button" aria-label="下一月"><ldesign-icon name="chevron-right" size="small" /></button>
            <button class={{ 'ldp-nav': true }} onClick={this.nextYear} type="button" aria-label="下一年">
              <ldesign-icon name="chevrons-right" size="small" />
            </button>
          </div>
          {this.renderYearQuickSelector()}
        </div>
        <div class="ldp-weekdays">
          {hasWeekNumbers ? <div class="ldp-weeknum-header">周</div> : null}
          {heads.map((d) => (<div class="ldp-weekday">{d}</div>))}
        </div>
        <div class="ldp-days">
          {this.mode === 'week' ? (
            // Week mode: render week rows
            weeks.map((weekDates) => {
              const weekNum = weekDates[0].weekNumber;
              const rowStart = weekDates[0].date;
              const rowEnd = weekDates[6].date;
              const isSelectedWeek = selectedYear === this.viewYear && selectedWeek === weekNum;
              const inRange = this.range && this.start && this.end ? (rowEnd >= this.start && rowStart <= this.end) : false;
              const pickDate = () => {
                const d = weekDates[0].date;
                if (this.range && this.mode === 'week') {
                  if (!this.start || (this.start && this.end)) { 
                    this.start = d; 
                    this.end = undefined; 
                    this.activePart = 'end'; 
                    this.selected = d; 
                    this.isSelectingRange = true;
                  } else { 
                    if (d < this.start) { 
                      this.end = this.start; 
                      this.start = d; 
                    } else { 
                      this.end = d; 
                    } 
                    this.selected = d; 
                    this.isSelectingRange = false;
                    this.commitRangeIfReady(true); 
                  }
                } else {
                  this.selected = d; this.commitValue(d); this.close();
                }
              };
              return (
                <div class={{ 'ldp-week-row': true, 'selected-week': isSelectedWeek, 'in-range': !!inRange }} onClick={pickDate}>
                  <div class="ldp-weeknum">{weekNum}</div>
                  {weekDates.map(d => (
                    <button
                      class={{
                        'ldp-day': true,
                        'other': !d.isCurrentMonth,
                        'today': d.isToday,
                        'selected': isSelectedWeek,
                        'disabled': d.isDisabled
                      }}
                      disabled={d.isDisabled}
                      onClick={() => this.handleDateClick(d.date, d.isDisabled)}
                      type="button"
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              );
            })
          ) : (
            // Date mode: render individual days with grid layout
            dates.map((d, idx) => ([
              hasWeekNumbers && idx % 7 === 0 ? <div class="ldp-weeknum">{d.weekNumber}</div> : null,
              <button
                class={{
                  'ldp-day': true,
                  'other': !d.isCurrentMonth,
                  'today': d.isToday,
                  'selected': d.isSelected,
                  'disabled': d.isDisabled
                }}
                disabled={d.isDisabled}
                onClick={() => this.handleDateClick(d.date, d.isDisabled)}
                type="button"
              >
                {d.day}
              </button>
            ]))
          )}
        </div>
        {this.mode === 'date' ? (
          <div class="ldp-footer">
            <button class="ldp-today" type="button" onClick={() => { const now = new Date(); this.viewYear = now.getFullYear(); this.viewMonth = now.getMonth(); this.selected = now; this.commitValue(now); this.close(); }}>今天</button>
          </div>
        ) : null}
      </div>
    );
  }

  private renderDatetimePanel() {
    const tVal = this.range ? (this.activePart === 'start' ? this.timeStart : this.timeEnd) : this.timeValue;
    return (
      <div class="ldp-datetime">
        <div class="ldp-datetime__date">{this.renderDatePanel()}</div>
        <div class="ldp-datetime__time">
          <ldesign-time-picker inline={true as any} confirm={false as any} showNow={false as any} showSeconds={this.timeShowSeconds as any} steps={this.timeSteps as any} visibleItems={this.timeVisibleItems as any} value={tVal} onLdesignPick={this.onTimePick as any} onLdesignChange={this.onTimeChange as any} />
          {this.range ? (
            <div style={{ marginTop: '8px', color: '#909399', fontSize: '12px' }}>当前调整：{this.activePart === 'start' ? '开始时间' : '结束时间'}</div>
          ) : null}
        </div>
      </div>
    );
  }

private renderPanel() {
    if (this.mode === 'year' || this.currentView === 'year') return this.renderYearPanel();
    if (this.mode === 'quarter') return this.renderQuarterPanel();
    if (this.mode === 'month' || this.currentView === 'month') return this.renderMonthPanel();
    if (this.mode === 'datetime') return this.renderDatetimePanel();
    return this.renderDatePanel();
  }

  private renderTrigger() {
    // 在 datetime 模式下，如果用户已经“提交过至少一次”，则优先使用 selected 渲染文本，确保实时更新
    if (this.range) {
      let sText = ''; let eText = '';
      if (this.start) sText = this.formatByMode(this.start);
      if (this.end) eText = this.formatByMode(this.end);
      const text = sText && eText ? `${sText} -> ${eText}` : (this.value as any) || '';
      const placeholder = this.placeholderText;
      const isPlaceholder = !text;
      return (
        <div class={{ 'ldp-trigger': true, 'ldp-trigger--disabled': this.disabled }} tabindex={this.disabled ? -1 : 0} onClick={this.open}>
          <span class={{ 'ldp-text': true, 'ldp-text--placeholder': isPlaceholder }}>{text || placeholder}</span>
          <span class="ldp-suffix"><ldesign-icon name="calendar" size="small" /></span>
        </div>
      );
    }
    let text = this.value as any || this.defaultValue as any || '';
    if (this.mode === 'datetime' && this.hasCommitted && this.selected) {
      text = formatDate(this.selected, this.formatString);
    }
    const placeholder = this.placeholderText;
    const isPlaceholder = !text;
    return (
      <div class={{ 'ldp-trigger': true, 'ldp-trigger--disabled': this.disabled }} tabindex={this.disabled ? -1 : 0} onClick={this.open}>
        <span class={{ 'ldp-text': true, 'ldp-text--placeholder': isPlaceholder }}>{text || placeholder}</span>
        <span class="ldp-suffix"><ldesign-icon name="calendar" size="small" /></span>
      </div>
    );
  }

  render() {
    return (
      <Host class={{ 'ldesign-date-picker': true, 'ldesign-date-picker--disabled': this.disabled }}>
        <ldesign-popup innerStyle={{ padding: '0' }} maxWidth={'none' as any} placement={'bottom-start' as any} trigger={this.disabled ? ('manual' as any) : ('click' as any)} interactive={true} arrow={false} theme={'light'} closeOnOutside={true} onLdesignVisibleChange={(e: CustomEvent<boolean>) => { this.visible = e.detail; this.ldesignVisibleChange.emit(e.detail); if (e.detail && this.mode === 'datetime') { requestAnimationFrame(async () => { try { const nodes = Array.from(this.el.querySelectorAll('ldesign-time-picker ldesign-picker')) as any[]; for (const pk of nodes) { try { if (pk?.componentOnReady) await pk.componentOnReady(); } catch {} try { if (typeof pk.centerToCurrent === 'function') await pk.centerToCurrent(false); } catch {} } } catch {} }); } }}>
          <span slot="trigger"><slot name="trigger">{this.renderTrigger()}</slot></span>
          <div class="ldp-panel">{this.renderPanel()}</div>
        </ldesign-popup>
      </Host>
    );
  }
}
