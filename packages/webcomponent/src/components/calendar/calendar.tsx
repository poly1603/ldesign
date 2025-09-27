import { Component, Prop, State, Event, EventEmitter, h, Element, Watch } from '@stencil/core';
import { formatDate, parseDate, generateCalendarDates, WEEKDAY_NAMES } from '../datepicker/datepicker.utils';

@Component({ tag: 'ldesign-calendar', styleUrl: 'calendar.less', shadow: false })
export class LdesignCalendar {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;
  @Prop() defaultValue?: string;

  // options
  @Prop() format: string = 'YYYY-MM-DD';
  @Prop() firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
  @Prop() showWeekNumbers: boolean = false;
  @Prop() minDate?: string;
  @Prop() maxDate?: string;
  @Prop() disabledDate?: (d: Date) => boolean;

  // events
  @Event() ldesignChange!: EventEmitter<string>;

  // state
  @State() viewYear: number = new Date().getFullYear();
  @State() viewMonth: number = new Date().getMonth();
  @State() selected?: Date;

  private get parsedMin() { const d = parseDate(this.minDate as any); return d || undefined; }
  private get parsedMax() { const d = parseDate(this.maxDate as any); return d || undefined; }
  private get isControlled() { return this.el?.hasAttribute('value'); }

  @Watch('value') onValueChanged(v?: string) {
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
  }

  private prevMonth = () => {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear -= 1; } else { this.viewMonth -= 1; }
  };
  private nextMonth = () => {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear += 1; } else { this.viewMonth += 1; }
  };
  private prevYear = () => { this.viewYear -= 1; };
  private nextYear = () => { this.viewYear += 1; };

  private handleDateClick = (d: Date, disabled: boolean) => {
    if (disabled) return;
    this.selected = d;
    const out = formatDate(d, this.format);
    if (!this.isControlled) this.value = out as any;
    this.ldesignChange.emit(out);
  };

  private renderHeader() {
    const ym = `${this.viewYear}年 ${this.viewMonth + 1}月`;
    return (
      <div class="ldc-header">
        <div class="ldc-header-group">
          <button class={{ 'ldc-nav': true, 'ldc-nav--double': true }} onClick={this.prevYear} type="button" aria-label="上一年">
            <ldesign-icon name="chevrons-left" size="small" />
          </button>
          <button class={{ 'ldc-nav': true }} onClick={this.prevMonth} type="button" aria-label="上一月">
            <ldesign-icon name="chevron-left" size="small" />
          </button>
        </div>
        <div class="ldc-header-center">
          <button class="ldc-head-text" type="button" aria-label="当前月份">{ym}</button>
        </div>
        <div class="ldc-header-group">
          <button class={{ 'ldc-nav': true }} onClick={this.nextMonth} type="button" aria-label="下一月">
            <ldesign-icon name="chevron-right" size="small" />
          </button>
          <button class={{ 'ldc-nav': true, 'ldc-nav--double': true }} onClick={this.nextYear} type="button" aria-label="下一年">
            <ldesign-icon name="chevrons-right" size="small" />
          </button>
        </div>
      </div>
    );
  }

  private renderWeekdays() {
    const names = [...WEEKDAY_NAMES];
    const heads = Array.from({ length: 7 }, (_, i) => names[(i + this.firstDayOfWeek) % 7]);
    return (
      <div class={{ 'ldc-weekdays': true, 'ldc-weekdays--with-weeks': this.showWeekNumbers }}>
        {this.showWeekNumbers ? <div class="ldc-weeknum-header">周</div> : null}
        {heads.map((n, i) => (
          <div class={{ 'ldc-weekday': true }} key={`w-${i}`}>{n}</div>
        ))}
      </div>
    );
  }

  private renderDays() {
    const dates = generateCalendarDates(
      this.viewYear,
      this.viewMonth,
      this.selected || null,
      this.parsedMin,
      this.parsedMax,
      this.disabledDate,
      this.showWeekNumbers,
      this.firstDayOfWeek
    );

    const rows: Array<any[]> = [];
    for (let i = 0; i < dates.length; i += 7) {
      rows.push(dates.slice(i, i + 7));
    }

    return (
      <div class={{ 'ldc-days': true, 'ldc-days--with-weeks': this.showWeekNumbers }}>
        {rows.map((week, rIdx) => (
          <div class="ldc-week-row" key={`r-${rIdx}`}>
            {this.showWeekNumbers ? (
              <div class="ldc-weeknum">{week[0].weekNumber}</div>
            ) : null}
            {week.map((d, cIdx) => (
              <button
                key={`d-${rIdx}-${cIdx}`}
                class={{
                  'ldc-day': true,
                  'other': !d.isCurrentMonth,
                  'today': d.isToday,
                  'selected': d.isSelected,
                  'disabled': d.isDisabled,
                }}
                disabled={d.isDisabled}
                onClick={() => this.handleDateClick(d.date, d.isDisabled)}
                type="button"
                aria-label={`${d.year}-${d.month + 1}-${d.day}`}
              >
                {d.day}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div class="ldesign-calendar">
        {this.renderHeader()}
        <div class={{ 'ldc-date': true, 'ldc-date--with-weeks': this.showWeekNumbers }}>
          {this.renderWeekdays()}
          {this.renderDays()}
        </div>
      </div>
    );
  }
}
