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
  @Prop() mode: 'date' | 'week' | 'month' | 'quarter' | 'year' = 'date';
  @Prop() firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
  @Prop() showWeekNumbers: boolean = false;
  @Prop() minDate?: string;
  @Prop() maxDate?: string;
  // 以属性方式传入的函数，仅能通过 JS 设置（非 attribute）
  @Prop() disabledDate?: (d: Date) => boolean;

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

  private get parsedMin() { const d = parseDate(this.minDate as any); return d || undefined; }
  private get parsedMax() { const d = parseDate(this.maxDate as any); return d || undefined; }

  @Watch('value') onValue(v?: string) {
    const d = parseDate(v as any) || parseDate(this.defaultValue as any);
    if (d) {
      this.selected = d;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
    }
  }

  componentWillLoad() {
    const init = this.value ?? this.defaultValue;
    const d = parseDate(init as any);
    if (d) {
      this.selected = d;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
    }
    // 初始视图
    this.currentView = this.mode === 'year' ? 'year' : this.mode === 'month' ? 'month' : 'date';
  }

  private open = () => { if (!this.disabled) this.visible = true; };
  private close = () => { this.visible = false; };

  private commitValue(d: Date) {
    if (this.mode === 'date') {
      const out = formatDate(d, this.format);
      if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); }
    } else if (this.mode === 'month') {
      const out = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); }
    } else if (this.mode === 'year') {
      const out = String(d.getFullYear());
      if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); }
    } else if (this.mode === 'quarter') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      const out = `${d.getFullYear()}-Q${q}`;
      if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); }
    } else if (this.mode === 'week') {
      const wn = getWeekNumber(d);
      const out = `${d.getFullYear()}-${String(wn).padStart(2, '0')}周`;
      if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); }
    }
  }

  private handleDateClick = (d: Date, disabled: boolean) => {
    if (disabled) return;
    if (this.mode === 'date' || this.mode === 'week') {
      this.selected = d;
      this.commitValue(d);
      this.close();
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
      this.viewYear = y; this.currentView = this.mode === 'quarter' ? 'month' : 'month';
    }
  };

  private navigatePrev = () => {
    if (this.currentView === 'year') this.viewYear -= 10;
    else if (this.currentView === 'month' || this.currentView === 'date') {
      if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear -= 1; } else this.viewMonth -= 1;
    }
  };
  private navigateNext = () => {
    if (this.currentView === 'year') this.viewYear += 10;
    else if (this.currentView === 'month' || this.currentView === 'date') {
      if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear += 1; } else this.viewMonth += 1;
    }
  };

  private switchToYear = () => { this.currentView = 'year'; };
  private switchToMonth = () => { this.currentView = 'month'; };

  private toggleYearSelector = () => {
    this.yearSelectorOpen = !this.yearSelectorOpen;
  };

  private selectQuickYear = (year: number) => {
    this.viewYear = year;
    this.yearSelectorOpen = false;
  };
  
  private selectToday = () => {
    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
    this.selected = today;
    this.commitValue(today);
    this.close();
  };

  private renderYearPanel() {
    const years = generateYearList(this.viewYear, this.selected?.getFullYear() || null, this.parsedMin, this.parsedMax);
    const start = years[0]?.year; const end = years[years.length - 1]?.year;
    return (
      <div class="ldp-year">
        <div class="ldp-header">
          <button class="ldp-nav" onClick={this.navigatePrev} type="button"><ldesign-icon name="chevron-left" size="small" /></button>
          <span class="ldp-head-text">{start}年 - {end}年</span>
          <button class="ldp-nav" onClick={this.navigateNext} type="button"><ldesign-icon name="chevron-right" size="small" /></button>
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
          <button class="ldp-nav" onClick={this.navigatePrev} type="button"><ldesign-icon name="chevron-left" size="small" /></button>
          <button
            class={{ 'ldp-year-selector': true, 'ldp-year-selector--open': this.yearSelectorOpen }}
            onClick={this.toggleYearSelector}
            type="button"
          >
            {this.viewYear}年
            <span class="ldp-year-selector-icon">▼</span>
          </button>
          <button class="ldp-nav" onClick={this.navigateNext} type="button"><ldesign-icon name="chevron-right" size="small" /></button>
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
      { quarter: 0, label: 'Q1', months: '1月-3月' },
      { quarter: 1, label: 'Q2', months: '4月-6月' },
      { quarter: 2, label: 'Q3', months: '7月-9月' },
      { quarter: 3, label: 'Q4', months: '10月-12月' }
    ];
    const selectedQ = this.selected ? Math.floor(this.selected.getMonth() / 3) : -1;
    const currentQ = Math.floor(new Date().getMonth() / 3);
    const currentYear = new Date().getFullYear();

    return (
      <div class="ldp-quarter">
        <div class="ldp-header">
          <button class="ldp-nav" onClick={this.navigatePrev} type="button"><ldesign-icon name="chevron-left" size="small" /></button>
          <button class="ldp-head-text" onClick={this.switchToYear} type="button">{this.viewYear}年</button>
          <button class="ldp-nav" onClick={this.navigateNext} type="button"><ldesign-icon name="chevron-right" size="small" /></button>
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
                <div class="ldp-quarter-months">{q.months}</div>
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
      <div class={{ 'ldp-date': true, 'ldp-date--with-weeks': hasWeekNumbers }}>
        <div class={{ 'ldp-header': true, 'ldp-header--with-year': true }}>
          <button class="ldp-nav" onClick={this.navigatePrev} type="button"><ldesign-icon name="chevron-left" size="small" /></button>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
          <button class="ldp-nav" onClick={this.navigateNext} type="button"><ldesign-icon name="chevron-right" size="small" /></button>
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
              return (
                <div class={{ 'ldp-week-row': true, 'selected-week': isSelectedWeek }}>
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
        <div class="ldp-footer">
          <button class="ldp-today" onClick={this.selectToday} type="button">今天</button>
        </div>
      </div>
    );
  }

  private renderPanel() {
    if (this.mode === 'year' || this.currentView === 'year') return this.renderYearPanel();
    if (this.mode === 'quarter') return this.renderQuarterPanel();
    if (this.mode === 'month' || this.currentView === 'month') return this.renderMonthPanel();
    return this.renderDatePanel();
  }

  private renderTrigger() {
    const text = this.value || this.defaultValue || '';
    const placeholder = this.placeholder;
    return (
      <div class={{ 'ldp-trigger': true, 'ldp-trigger--disabled': this.disabled }} tabindex={this.disabled ? -1 : 0} onClick={this.open}>
        <span class={{ 'ldp-text': true, 'ldp-text--placeholder': !text }}>{text || placeholder}</span>
        <span class="ldp-suffix"><ldesign-icon name="calendar" size="small" /></span>
      </div>
    );
  }

  render() {
    return (
      <Host class={{ 'ldesign-date-picker': true, 'ldesign-date-picker--disabled': this.disabled }}>
        <ldesign-popup placement={'bottom-start' as any} trigger={this.disabled ? ('manual' as any) : ('click' as any)} interactive={true} arrow={false} theme={'light'} closeOnOutside={true} onLdesignVisibleChange={(e: CustomEvent<boolean>) => { this.visible = e.detail; this.ldesignVisibleChange.emit(e.detail); }}>
          <span slot="trigger"><slot name="trigger">{this.renderTrigger()}</slot></span>
          <div class="ldp-panel">{this.renderPanel()}</div>
        </ldesign-popup>
      </Host>
    );
  }
}
