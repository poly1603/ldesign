import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { formatDate, parseDate, generateCalendarDates, generateYearList, generateMonthList, WEEKDAY_NAMES, getWeekNumber } from './datepicker.utils';

@Component({ tag: 'ldesign-date-picker', styleUrl: 'datepicker.less', shadow: false })
export class LdesignDatePicker {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;
  @Prop() defaultValue?: string;

// basic
  @Prop() placeholder: string = '请选择日期';
  @Prop() disabled: boolean = false;
  @Prop() clearable: boolean = true;
  @Prop() format: string = 'YYYY-MM-DD';
  @Prop() mode: 'date' | 'week' | 'month' | 'quarter' | 'year' | 'datetime' = 'date';
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
  @State() yearSelectorOpen: boolean = false;
  @State() timeValue: string = '00:00:00';
  // 是否已经有过一次提交（用于在受控场景下也能实时用 selected 渲染文本）
  @State() hasCommitted: boolean = false;

  private get parsedMin() { const d = parseDate(this.minDate as any); return d || undefined; }
  private get parsedMax() { const d = parseDate(this.maxDate as any); return d || undefined; }
  private get isControlled() { return this.el?.hasAttribute('value'); }

@Watch('value') onValue(v?: string) {
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
    // 初始视图
    this.currentView = this.mode === 'year' ? 'year' : this.mode === 'month' ? 'month' : 'date';
  }

  private open = () => { if (!this.disabled) this.visible = true; };
  private close = () => { this.visible = false; };

  private commitValue(d: Date) {
    // 标记已有提交，后续触发器文本会优先使用 selected 渲染，避免受控外层未回写导致不刷新
    this.hasCommitted = true;
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
    if (this.mode === 'date' || this.mode === 'week') {
      this.selected = d;
      this.commitValue(d);
      this.close();
    } else if (this.mode === 'datetime') {
      // 更新日期，同时立即提交一次（不关闭），保证输入框能即时显示新的日期
      const { h, m, s } = this.parseTime(this.timeValue);
      const nd = new Date(d);
      nd.setHours(h, m, s, 0);
      this.selected = nd;
      this.commitValue(nd);
      // 不关闭，让用户继续调整时间
    }
  };

  private handleQuarterClick = (q: number) => {
    const d = new Date(this.viewYear, q * 3, 1);
    this.selected = d;
    this.commitValue(d);
    this.close();
  };

  private handleMonthClick = (m: number) => {
    if (this.mode === 'month') {
      const d = new Date(this.viewYear, m, 1);
      this.selected = d;
      this.commitValue(d);
      this.close();
    } else {
      this.viewMonth = m; this.currentView = 'date';
    }
  };

  private handleYearClick = (y: number) => {
    if (this.mode === 'year') {
      const d = new Date(y, 0, 1);
      this.selected = d; this.commitValue(d); this.close();
    } else {
      this.viewYear = y;
      // 切换回当前模式对应的视图
      if (this.mode === 'month') this.currentView = 'month';
      else if (this.mode === 'date' || this.mode === 'week') this.currentView = 'date';
      else if (this.mode === 'quarter') this.currentView = 'year'; // 对于季度，保持由renderPanel控制
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
    if (trig === 'click' || trig === 'keyboard' || trig === 'now') {
      this.close();
    }
  };

  private selectQuickYear = (year: number) => {
    this.viewYear = year;
    this.yearSelectorOpen = false;
  };

  private renderYearPanel() {
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
            <button class={{ 'ldp-year-item': true, 'selected': y.isSelected, 'current': y.isCurrent, 'disabled': y.isDisabled }} disabled={y.isDisabled} onClick={() => this.handleYearClick(y.year)} type="button">{y.year}</button>
          ))}
        </div>
      </div>
    );
  }

  private renderMonthPanel() {
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
            <button class={{ 'ldp-month-item': true, 'selected': m.isSelected, 'current': m.isCurrent, 'disabled': m.isDisabled }} disabled={m.isDisabled} onClick={() => this.handleMonthClick(m.month)} type="button">{m.label}</button>
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
                  'selected': isSelected,
                  'current': isCurrent
                }}
                onClick={() => this.handleQuarterClick(q.quarter)}
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
              const isSelectedWeek = selectedYear === this.viewYear && selectedWeek === weekNum;
              const pickDate = () => {
                // 以一周中的第一天为提交日期（与 firstDayOfWeek 对齐）
                const d = weekDates[0].date;
                this.selected = d;
                this.commitValue(d);
                this.close();
              };
              return (
                <div class={{ 'ldp-week-row': true, 'selected-week': isSelectedWeek }} onClick={pickDate}>
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
    return (
      <div class="ldp-datetime">
        <div class="ldp-datetime__date">{this.renderDatePanel()}</div>
        <div class="ldp-datetime__time">
          <ldesign-time-picker inline={true as any} confirm={false as any} showNow={false as any} showSeconds={this.timeShowSeconds as any} steps={this.timeSteps as any} visibleItems={this.timeVisibleItems as any} value={this.timeValue} onLdesignPick={this.onTimePick as any} onLdesignChange={this.onTimeChange as any} />
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
    let text = this.value || this.defaultValue || '';
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
