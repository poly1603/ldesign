import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type TimePickerPlacement = Placement;
export type TimePickerTrigger = 'click' | 'focus' | 'manual';

/**
 * TimePicker 时间选择器
 * - 使用 <ldesign-popup> 作为弹层
 * - 默认格式 HH:mm:ss，可通过 showSeconds 控制秒列
 */
@Component({
  tag: 'ldesign-time-picker',
  styleUrl: 'time-picker.less',
  shadow: false,
})
export class LdesignTimePicker {
  @Element() el!: HTMLElement;

  /** 当前值（受控），格式如 23:59:59 或 23:59（当 showSeconds=false 时） */
  @Prop({ mutable: true }) value?: string;
  /** 默认值（非受控） */
  @Prop() defaultValue?: string;

  /** 占位文案 */
  @Prop() placeholder: string = '选择时间';
  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 是否可清空 */
  @Prop() clearable: boolean = false;

  /** 是否显示秒 */
  @Prop() showSeconds: boolean = true;
  /** 步进 */
  @Prop() hourStep: number = 1;
  @Prop() minuteStep: number = 1;
  @Prop() secondStep: number = 1;

  /** 最小时间（含），如 08:30 或 08:30:00 */
  @Prop() minTime?: string;
  /** 最大时间（含），如 18:00 或 18:00:00 */
  @Prop() maxTime?: string;
  /** 禁用小时集合（可传 JSON 字符串或数组），如 [0,1,2] */
  @Prop() disabledHours?: string | number[];
  /** 禁用分钟集合（同上） */
  @Prop() disabledMinutes?: string | number[];
  /** 禁用秒集合（同上） */
  @Prop() disabledSeconds?: string | number[];

  /** 是否显示 12 小时制 AM/PM 列（显示方式），内部仍以 24h 保存 */
  @Prop() use12Hours: boolean = false;
  /** 输出格式：'24' -> 24 小时制；'12' -> 12 小时制（hh:mm[:ss] AM/PM） */
  @Prop() outputFormat: '24' | '12' = '24';

  /** 弹出层触发方式 */
  @Prop() trigger: TimePickerTrigger = 'click';
  /** 弹出层位置 */
  @Prop() placement: TimePickerPlacement = 'bottom-start';
  /** 主题（透传给 Popup） */
  @Prop() theme: 'light' | 'dark' = 'light';
  /** 是否显示箭头（透传给 Popup） */
  @Prop() arrow: boolean = false;
  /** 外部受控可见性（仅 trigger = 'manual' 生效） */
  @Prop({ mutable: true }) visible: boolean = false;
  /** 列表最大高度 */
  @Prop() panelHeight: number = 180;
  /** 是否需要点击“确定”确认（默认需要）。关闭后再触发 change */
  @Prop() confirm: boolean = true;

  /** 值改变 */
  @Event() ldesignChange!: EventEmitter<string | undefined>;
  /** 弹层可见性改变 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  // 内部面板临时值
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() hasValue: boolean = false;
  @State() ampm: 'AM' | 'PM' = 'AM';

  private listHour?: HTMLElement;
  private listMinute?: HTMLElement;
  private listSecond?: HTMLElement;
  private listAmPm?: HTMLElement;

  @Watch('value')
  watchValue(newVal?: string) {
    const t = this.parseTime(newVal) || this.parseTime(this.defaultValue) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s; this.hasValue = !!newVal; this.ampm = this.h < 12 ? 'AM' : 'PM';
  }

  componentWillLoad() {
    const init = this.value !== undefined ? this.value : this.defaultValue;
    const t = this.parseTime(init) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s; this.hasValue = init != null && init !== ''; this.ampm = this.h < 12 ? 'AM' : 'PM';
  }

  private clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
  private pad(n: number) { return String(n).padStart(2, '0'); }

  private parseTime(v?: string | null): { h: number; m: number; s: number } | null {
    if (!v || typeof v !== 'string') return null;
    const str = v.trim();
    // 支持 24h: HH:mm[:ss]
    let m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (m) {
      const h = this.clamp(parseInt(m[1], 10) || 0, 0, 23);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3] ?? '0', 10) || 0, 0, 59);
      return { h, m: mi, s };
    }
    // 支持 12h: hh:mm[:ss] AM/PM
    m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*([AP]M)$/i);
    if (m) {
      let hh = this.clamp(parseInt(m[1], 10) || 0, 1, 12);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3] ?? '0', 10) || 0, 0, 59);
      const isPM = (m[4].toUpperCase() === 'PM');
      if (hh === 12) hh = 0; // 12:xx AM -> 0; 12:xx PM -> +12 在下行处理
      const h24 = (isPM ? hh + 12 : hh);
      return { h: h24, m: mi, s };
    }
    return null;
  }

  private toSeconds(t: { h: number; m: number; s: number }) { return t.h * 3600 + t.m * 60 + t.s; }
  private compare(a: { h: number; m: number; s: number }, b: { h: number; m: number; s: number }) { return this.toSeconds(a) - this.toSeconds(b); }
  private parseArray(val?: string | number[]): number[] { if (!val) return []; if (Array.isArray(val)) return val; try { const arr = JSON.parse(val); return Array.isArray(arr) ? arr : []; } catch { return []; } }

  private formatTime(h: number, m: number, s: number): string {
    if (this.outputFormat === '12') {
      const isPM = h >= 12;
      const hh12 = ((h % 12) || 12);
      const base = `${this.pad(hh12)}:${this.pad(m)}`;
      const body = this.showSeconds ? `${base}:${this.pad(s)}` : base;
      return `${body} ${isPM ? 'PM' : 'AM'}`;
    }
    const base = `${this.pad(h)}:${this.pad(m)}`;
    return this.showSeconds ? `${base}:${this.pad(s)}` : base;
  }

  private getInnerPopup(): HTMLLdesignPopupElement | null { return this.el?.querySelector('ldesign-popup') as any; }
  private hideInnerPopup() { const p = this.getInnerPopup(); if (p) (p as any).visible = false; }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      // 打开时根据当前值滚动到可视处
      requestAnimationFrame(() => this.scrollActiveIntoView());
    }
  };

  private scrollActiveIntoView() {
    const sel = '.ldesign-time-picker__item--active';
    [this.listAmPm, this.listHour, this.listMinute, this.listSecond].forEach((c) => {
      const target = c?.querySelector(sel) as HTMLElement | null;
      if (target) target.scrollIntoView({ block: 'center' });
    });
  }

  private setHour = (h: number) => { this.h = this.clamp(h, 0, 23); this.ampm = this.h < 12 ? 'AM' : 'PM'; if (!this.confirm) this.commitValue(); };
  private setMinute = (m: number) => { this.m = this.clamp(m, 0, 59); if (!this.confirm) this.commitValue(); };
  private setSecond = (s: number) => { this.s = this.clamp(s, 0, 59); if (!this.confirm) this.commitValue(); };

  private setAmPm = (ap: 'AM' | 'PM') => {
    if (this.ampm === ap) return;
    this.ampm = ap;
    if (ap === 'AM' && this.h >= 12) this.h -= 12;
    if (ap === 'PM' && this.h < 12) this.h += 12;
    if (!this.confirm) this.commitValue();
  };

  private onWheelHour = (e: WheelEvent) => { e.preventDefault(); const d = e.deltaY > 0 ? this.hourStep : -this.hourStep; this.setHour((this.h + d + 24) % 24); };
  private onWheelMinute = (e: WheelEvent) => { e.preventDefault(); const d = e.deltaY > 0 ? this.minuteStep : -this.minuteStep; this.setMinute((this.m + d + 60) % 60); };
  private onWheelSecond = (e: WheelEvent) => { e.preventDefault(); const d = e.deltaY > 0 ? this.secondStep : -this.secondStep; this.setSecond((this.s + d + 60) % 60); };
  private onWheelAmPm = (e: WheelEvent) => { e.preventDefault(); const next = this.ampm === 'AM' ? 'PM' : 'AM'; this.setAmPm(next); };

  private clearAll = (e: MouseEvent) => { e.stopPropagation(); if (this.disabled) return; this.updateValue(undefined); };

  private useNow = () => {
    const now = new Date();
    const t = { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
    const clamped = this.clampTimeToRange(t);
    this.h = clamped.h; this.m = clamped.m; this.s = clamped.s; this.ampm = this.h < 12 ? 'AM' : 'PM';
    if (!this.confirm) this.commitValue();
  };

  private confirmPick = () => { this.commitValue(); this.hideInnerPopup(); };

  private commitValue() {
    const out = this.formatTime(this.h, this.m, this.s);
    this.updateValue(out);
  }

  private clampTimeToRange(t: { h: number; m: number; s: number }) {
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    let cur = { ...t };
    if (min && this.compare(cur, min) < 0) cur = { ...min };
    if (max && this.compare(cur, max) > 0) cur = { ...max };
    return cur;
  }

  private isHourDisabled(hh: number) {
    const dis = new Set(this.parseArray(this.disabledHours));
    if (dis.has(hh)) return true;
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    if (min && this.compare({ h: hh, m: 59, s: 59 }, min) < 0) return true;
    if (max && this.compare({ h: hh, m: 0, s: 0 }, max) > 0) return true;
    return false;
  }

  private isMinuteDisabled(mm: number) {
    const dis = new Set(this.parseArray(this.disabledMinutes));
    if (dis.has(mm)) return true;
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    if (min && this.compare({ h: this.h, m: mm, s: 59 }, min) < 0) return true;
    if (max && this.compare({ h: this.h, m: mm, s: 0 }, max) > 0) return true;
    return false;
  }

  private isSecondDisabled(ss: number) {
    const dis = new Set(this.parseArray(this.disabledSeconds));
    if (dis.has(ss)) return true;
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    const t = { h: this.h, m: this.m, s: ss };
    if (min && this.compare(t, min) < 0) return true;
    if (max && this.compare(t, max) > 0) return true;
    return false;
  }

  private updateValue(next?: string) {
    if (this.value !== undefined) {
      // 受控：仅派发事件
      this.ldesignChange.emit(next);
    } else {
      this.value = next as any;
      this.hasValue = !!next;
      this.ldesignChange.emit(next);
    }
  }

  private onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const popup = this.getInnerPopup();
      if (popup) (popup as any).visible = true;
    } else if (e.key === 'Escape') {
      this.hideInnerPopup();
    }
  };

  private renderTrigger() {
    const has = this.hasValue && this.value && this.value !== '';
    const text = has ? this.value : this.placeholder;
    const classes = {
      'ldesign-time-picker__trigger': true,
      'ldesign-time-picker__trigger--placeholder': !has,
      'ldesign-time-picker__trigger--disabled': this.disabled,
    } as any;

    const clearBtn = this.clearable && has && !this.disabled ? (
      <span class="ldesign-time-picker__clear" onClick={this.clearAll} title="清空">
        <ldesign-icon name="x" size="small" />
      </span>
    ) : null;

    const icon = (
      <span class="ldesign-time-picker__suffix">
        <ldesign-icon name="clock" size="small" />
      </span>
    );

    return (
      <div class={classes} tabindex={this.disabled ? -1 : 0} onKeyDown={this.onTriggerKeyDown as any}>
        <span class="ldesign-time-picker__text">{text}</span>
        {clearBtn}
        {icon}
      </div>
    );
  }

  private renderColumn(type: 'hour' | 'minute' | 'second') {
    const range = (n: number) => Array.from({ length: n }, (_, i) => i);
    let list: number[] = [];
    let cur = 0;
    let onClick: (v: number) => void = () => {};
    let onWheel: (e: WheelEvent) => void = () => {};
    let isDisabled: (v: number) => boolean = () => false;
    const step = type === 'hour' ? this.hourStep : (type === 'minute' ? this.minuteStep : this.secondStep);

    if (type === 'hour') {
      if (this.use12Hours) {
        // 1..12
        list = range(12).map(i => i + 1).filter(v => (v % step === 0) || step === 1);
        const disp = ((this.h % 12) || 12);
        cur = disp;
        onClick = (v) => {
          let base = v % 12; if (base === 12 % 12) base = 0; // 12 -> 0
          const h24 = this.ampm === 'PM' ? (base + 12) : base;
          if (this.isHourDisabled(h24)) return; // 不允许选择禁用项
          this.setHour(h24);
        };
        onWheel = this.onWheelHour;
        isDisabled = (v) => {
          let base = v % 12; if (base === 12 % 12) base = 0;
          const h24 = this.ampm === 'PM' ? (base + 12) : base;
          return this.isHourDisabled(h24);
        };
      } else {
        list = range(24).filter(v => v % step === 0);
        cur = this.h;
        onClick = (v) => { if (!this.isHourDisabled(v)) this.setHour(v); };
        onWheel = this.onWheelHour;
        isDisabled = (v) => this.isHourDisabled(v);
      }
    } else if (type === 'minute') {
      list = range(60).filter(v => v % step === 0);
      cur = this.m;
      onClick = (v) => { if (!this.isMinuteDisabled(v)) this.setMinute(v); };
      onWheel = this.onWheelMinute;
      isDisabled = (v) => this.isMinuteDisabled(v);
    } else {
      list = range(60).filter(v => v % step === 0);
      cur = this.s;
      onClick = (v) => { if (!this.isSecondDisabled(v)) this.setSecond(v); };
      onWheel = this.onWheelSecond;
      isDisabled = (v) => this.isSecondDisabled(v);
    }

    const refSetter = (el: HTMLElement) => {
      if (type === 'hour') this.listHour = el; else if (type === 'minute') this.listMinute = el; else this.listSecond = el;
    };

    return (
      <ul class="ldesign-time-picker__column" tabindex={0} onWheel={onWheel as any} ref={refSetter} style={{ maxHeight: `${this.panelHeight}px`, overflowY: 'auto' }}>
        {list.map(v => {
          const active = v === cur;
          const disabled = isDisabled(v);
          return (
            <li class={{ 'ldesign-time-picker__item': true, 'ldesign-time-picker__item--active': active, 'ldesign-time-picker__item--disabled': disabled }} onClick={() => !disabled && onClick(v)}>
              {this.pad(v)}
            </li>
          );
        })}
      </ul>
    );
  }

  private renderAmPmColumn() {
    const options: ('AM' | 'PM')[] = ['AM', 'PM'];
    return (
      <ul class="ldesign-time-picker__column" tabindex={0} onWheel={this.onWheelAmPm as any} ref={(el) => (this.listAmPm = el)} style={{ maxHeight: `${this.panelHeight}px`, overflowY: 'auto' }}>
        {options.map(op => (
          <li class={{ 'ldesign-time-picker__item': true, 'ldesign-time-picker__item--active': op === this.ampm }} onClick={() => this.setAmPm(op)}>
            {op}
          </li>
        ))}
      </ul>
    );
  }

  private renderPanel() {
    return (
      <div class="ldesign-time-picker__content">
        <div class="ldesign-time-picker__columns">
          {this.use12Hours && this.renderAmPmColumn()}
          {this.renderColumn('hour')}
          {this.renderColumn('minute')}
          {this.showSeconds && this.renderColumn('second')}
        </div>
        <div class="ldesign-time-picker__footer">
          <button class="ldesign-time-picker__now" type="button" onClick={this.useNow}>此刻</button>
          {this.confirm && <ldesign-button onClick={this.confirmPick as any} type="primary" size="small">确定</ldesign-button>}
        </div>
      </div>
    );
  }

  render() {
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};
    return (
      <Host class={{ 'ldesign-time-picker': true, 'ldesign-time-picker--disabled': this.disabled }}>
        <ldesign-popup
          placement={this.placement}
          trigger={this.trigger as any}
          interactive={true}
          arrow={this.arrow}
          theme={this.theme}
          closeOnOutside={true}
          onLdesignVisibleChange={this.handlePopupVisibleChange}
          {...visibleProp}
        >
          <span slot="trigger">
            <slot name="trigger">{this.renderTrigger()}</slot>
          </span>
          {this.renderPanel()}
        </ldesign-popup>
      </Host>
    );
  }
}