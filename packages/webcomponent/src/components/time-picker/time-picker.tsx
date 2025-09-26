import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type TimePickerPlacement = Placement;
export type TimePickerTrigger = 'click' | 'focus' | 'manual';
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerStatus = 'default' | 'success' | 'warning' | 'error';
export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'HH:mm:ss:SSS' | 'hh:mm A' | 'hh:mm:ss A';

export interface TimePickerPresets {
  [key: string]: string | [string, string];
}

export interface DisableTimeOptions {
  hour?: number[];
  minute?: number[];
  second?: number[];
}

export type DisableTimeFn = (hour?: number, minute?: number, second?: number) => DisableTimeOptions;

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
  /** 是否只读 */
  @Prop() readonly: boolean = false;
  /** 是否可清空 */
  @Prop() clearable: boolean = false;
  /** 是否允许键盘输入 */
  @Prop() allowInput: boolean = true;
  /** 组件尺寸 */
  @Prop() size: TimePickerSize = 'medium';
  /** 状态 */
  @Prop() status: TimePickerStatus = 'default';
  /** 无边框模式 */
  @Prop() borderless: boolean = false;
  /** 是否在值为空时显示清除图标 */
  @Prop() showClearIconOnEmpty: boolean = false;
  /** 时间格式 */
  @Prop() format: TimeFormat = 'HH:mm:ss';
  /** 是否隐藏禁用的时间 */
  @Prop() hideDisabledTime: boolean = true;
  /** 预设快捷选项（JSON字符串或对象） */
  @Prop() presets?: string | TimePickerPresets;
  /** 禁用时间函数（不支持属性传递，需要通过DOM属性设置） */
  disableTimeFn?: DisableTimeFn;

  /** 是否显示秒 */
  @Prop() showSeconds: boolean = true;
  /** 步进 [小时, 分钟, 秒] */
  @Prop() steps: number[] = [1, 1, 1];
  /** 步进 */
  @Prop() hourStep: number = 1;
  @Prop() minuteStep: number = 1;
  @Prop() secondStep: number = 1;
  /** 毫秒步进 */
  @Prop() millisecondStep: number = 1;

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
  /** 可视条目数（当未显式指定 panelHeight 时生效） */
  @Prop() visibleItems: number = 5;
  /** 是否需要点击“确定”确认（默认需要）。关闭后再触发 change */
  @Prop() confirm: boolean = true;

  /** 值改变 */
  @Event() ldesignChange!: EventEmitter<string | undefined>;
  /** 弹层可见性改变 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  /** 面板打开 */
  @Event() ldesignOpen!: EventEmitter<void>;
  /** 面板关闭 */
  @Event() ldesignClose!: EventEmitter<void>;
  /** 选择时间（点击、滚动、键盘操作时） */
  @Event() ldesignPick!: EventEmitter<{ value: string; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' } }>;
  /** 输入框获得焦点 */
  @Event() ldesignFocus!: EventEmitter<FocusEvent>;
  /** 输入框失去焦点 */
  @Event() ldesignBlur!: EventEmitter<FocusEvent>;

  // 内部面板临时值
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() ms: number = 0;
  @State() hasValue: boolean = false;
  @State() ampm: 'AM' | 'PM' = 'AM';
  @State() inputValue: string = '';
  @State() focused: boolean = false;

  // 派生格式配置
  @State() effectiveShowSeconds: boolean = true;
  @State() effectiveShowMilliseconds: boolean = false;
  @State() effectiveUse12Hours: boolean = false;
  @State() effectiveOutputFormat: '24' | '12' = '24';
  
  private inputElement?: HTMLInputElement;

  private listHour?: HTMLElement;
  private listMinute?: HTMLElement;
  private listSecond?: HTMLElement;
  private listMillisecond?: HTMLElement;
  private listAmPm?: HTMLElement;

  private itemHeight = 36; // px，用于滚动吸附
  private snapTimers: { [k: string]: number | undefined } = {};
  private inertiaActive: { [k in 'hour' | 'minute' | 'second' | 'millisecond' | 'ampm']?: boolean } = {};
  private inertiaState: { [k in 'hour' | 'minute' | 'second' | 'millisecond' | 'ampm']?: { raf?: number; v: number; last: number } } = {};

  @Watch('value')
  watchValue(newVal?: string) {
    const t = this.parseTime(newVal) || this.parseTime(this.defaultValue) || { h: 0, m: 0, s: 0, ms: 0 } as any;
    this.h = t.h; this.m = t.m; this.s = t.s; this.ms = (t as any).ms ?? 0; this.hasValue = !!newVal; this.ampm = this.h < 12 ? 'AM' : 'PM';
    this.inputValue = newVal ?? '';
  }

  private recomputeFormatFlags() {
    const f = (this.format || '').toLowerCase();
    const includesA = f.includes('a');
    const includesSSS = f.includes('sss');
    const includesSS = f.includes('ss');

    // 12/24 小时
    this.effectiveUse12Hours = includesA ? true : !!this.use12Hours;
    this.effectiveOutputFormat = this.effectiveUse12Hours ? '12' : (this.outputFormat || '24');
    // 秒/毫秒
    this.effectiveShowMilliseconds = includesSSS;
    this.effectiveShowSeconds = includesSS || includesSSS ? true : !!this.showSeconds;
  }

  private syncStepsFromArray() {
    if (Array.isArray(this.steps) && this.steps.length >= 3) {
      this.hourStep = Number(this.steps[0]) || 1;
      this.minuteStep = Number(this.steps[1]) || 1;
      this.secondStep = Number(this.steps[2]) || 1;
      if (this.steps.length >= 4) this.millisecondStep = Number(this.steps[3]) || 1;
    }
  }

  @Watch('format') onFormatChange() { this.recomputeFormatFlags(); }
  @Watch('use12Hours') onUse12Change() { this.recomputeFormatFlags(); }
  @Watch('outputFormat') onOutputFmtChange() { this.recomputeFormatFlags(); }
  @Watch('showSeconds') onShowSecondsChange() { this.recomputeFormatFlags(); }

  componentWillLoad() {
    this.recomputeFormatFlags();
    this.syncStepsFromArray();
    const init = this.value !== undefined ? this.value : this.defaultValue;
    const t = this.parseTime(init) || { h: 0, m: 0, s: 0, ms: 0 } as any;
    this.h = t.h; this.m = t.m; this.s = t.s; this.ms = (t as any).ms ?? 0; this.hasValue = init != null && init !== ''; this.ampm = this.h < 12 ? 'AM' : 'PM';
    this.inputValue = init ?? '';
  }

  private clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
  private pad(n: number) { return String(n).padStart(2, '0'); }
  private pad3(n: number) { return String(n).padStart(3, '0'); }

  private parseTime(v?: string | null): { h: number; m: number; s: number; ms?: number } | null {
    if (!v || typeof v !== 'string') return null;
    const str = v.trim();
    // 支持 24h: HH:mm:ss:SSS
    let m = str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,3})$/);
    if (m) {
      const h = this.clamp(parseInt(m[1], 10) || 0, 0, 23);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3], 10) || 0, 0, 59);
      const ms = this.clamp(parseInt(m[4], 10) || 0, 0, 999);
      return { h, m: mi, s, ms };
    }
    // 支持 24h: HH:mm[:ss]
    m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
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

  private formatTime(h: number, m: number, s: number, ms?: number): string {
    if (this.effectiveOutputFormat === '12') {
      const isPM = h >= 12;
      const hh12 = ((h % 12) || 12);
      const base = `${this.pad(hh12)}:${this.pad(m)}`;
      let body = this.effectiveShowSeconds ? `${base}:${this.pad(s)}` : base;
      if (this.effectiveShowMilliseconds) body = `${body}:${this.pad3(ms ?? this.ms)}`;
      return `${body} ${isPM ? 'PM' : 'AM'}`;
    }
    const base = `${this.pad(h)}:${this.pad(m)}`;
    let body = this.effectiveShowSeconds ? `${base}:${this.pad(s)}` : base;
    if (this.effectiveShowMilliseconds) body = `${body}:${this.pad3(ms ?? this.ms)}`;
    return body;
  }

  private getInnerPopup(): HTMLLdesignPopupElement | null { return this.el?.querySelector('ldesign-popup') as any; }
  private hideInnerPopup() { const p = this.getInnerPopup(); if (p) (p as any).visible = false; }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      this.ldesignOpen.emit();
      // 打开时根据当前值滚动到可视处
      requestAnimationFrame(() => this.scrollActiveIntoView());
    } else {
      this.ldesignClose.emit();
    }
  };

  private scrollActiveIntoView() {
    const setPad = (el?: HTMLElement) => { if (!el) return; const h = el.clientHeight || (this.panelHeight || (this.itemHeight * this.visibleItems)); const pad = Math.max(0, Math.round(h / 2 - this.itemHeight / 2)); el.style.paddingTop = `${pad}px`; el.style.paddingBottom = `${pad}px`; };
    [this.listAmPm, this.listHour, this.listMinute, this.listSecond].forEach((el) => setPad(el));

    const centerByQuery = (el?: HTMLElement, selector?: string) => {
      if (!el || !selector) return;
      const candidates = Array.from(el.querySelectorAll(selector)) as HTMLElement[];
      if (candidates.length === 0) return;
      // 存在重复项（因为前后都做了缓冲克隆），优先选择中间的那一个，避免靠近边界
      const target = candidates[Math.floor(candidates.length / 2)] as HTMLElement;
      this.scrollItemIntoCenter(el, target, false);
    };

    centerByQuery(this.listHour, `li[data-value="${this.h}"]`);
    centerByQuery(this.listMinute, `li[data-value=\"${this.m}\"]`);
    if (this.effectiveShowSeconds) centerByQuery(this.listSecond, `li[data-value=\"${this.s}\"]`);
    if (this.effectiveShowMilliseconds) centerByQuery(this.listMillisecond, `li[data-value=\"${this.ms}\"]`);
    if (this.effectiveUse12Hours) centerByQuery(this.listAmPm, `.ldesign-time-picker__item--active`);
  }

  private getNearestItem(container: HTMLElement): HTMLElement | null {
    const rect = container.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const items = Array.from(container.querySelectorAll('li')) as HTMLElement[];
    let nearest: HTMLElement | null = null;
    let minDist = Infinity;
    for (const it of items) {
      const r = it.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      const d = Math.abs(cy - centerY);
      if (d < minDist) { minDist = d; nearest = it; }
    }
    return nearest || null;
  }

  private scrollItemIntoCenter(container: HTMLElement, item: HTMLElement, smooth = true) {
    try {
      const targetTop = item.offsetTop + item.offsetHeight / 2 - container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetTop), behavior: smooth ? 'smooth' as ScrollBehavior : 'auto' as ScrollBehavior });
    } catch {
      // 兼容性降级
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const delta = (itemRect.top + itemRect.height / 2) - (containerRect.top + containerRect.height / 2);
      container.scrollBy({ top: delta, behavior: smooth ? 'smooth' as ScrollBehavior : 'auto' as ScrollBehavior });
    }
  }

  private onColumnScroll(kind: 'hour' | 'minute' | 'second' | 'millisecond' | 'ampm', container: HTMLElement) {
    const nearest = this.getNearestItem(container);
    if (nearest && !nearest.classList.contains('ldesign-time-picker__item--disabled')) {
      const vAttr = nearest.getAttribute('data-value');
      if (vAttr != null) {
        const v = parseInt(vAttr, 10);
        if (kind === 'hour') { this.h = v; this.ampm = this.h < 12 ? 'AM' : 'PM'; }
        else if (kind === 'minute') this.m = v;
        else if (kind === 'second') this.s = v;
        else if (kind === 'millisecond') this.ms = v;
        else if (kind === 'ampm') this.setAmPm(nearest.textContent?.trim() === 'PM' ? 'PM' : 'AM');
      }
    }
    // 吸附到最近项（滚动停止后）
    if (this.inertiaActive[kind]) return; // 惯性滚动中，先不吸附，等待动画结束统一吸附
    if (this.snapTimers[kind]) clearTimeout(this.snapTimers[kind]);
    this.snapTimers[kind] = window.setTimeout(() => {
      const near = this.getNearestItem(container);
      if (near) this.scrollItemIntoCenter(container, near, true);
    }, 120);
  }

  private setHour = (h: number) => { this.h = this.clamp(h, 0, 23); this.ampm = this.h < 12 ? 'AM' : 'PM'; if (!this.confirm) this.commitValue(); };
  private setMinute = (m: number) => { this.m = this.clamp(m, 0, 59); if (!this.confirm) this.commitValue(); };
  private setSecond = (s: number) => { this.s = this.clamp(s, 0, 59); if (!this.confirm) this.commitValue(); };
  private setMillisecond = (ms: number) => { this.ms = this.clamp(ms, 0, 999); if (!this.confirm) this.commitValue(); };

  private setAmPm = (ap: 'AM' | 'PM') => {
    if (this.ampm === ap) return;
    this.ampm = ap;
    if (ap === 'AM' && this.h >= 12) this.h -= 12;
    if (ap === 'PM' && this.h < 12) this.h += 12;
    if (!this.confirm) this.commitValue();
  };

  private onWheelHour = (e: WheelEvent) => { e.preventDefault(); this.startInertia('hour', this.listHour!, e.deltaY); };
  private onWheelMinute = (e: WheelEvent) => { e.preventDefault(); this.startInertia('minute', this.listMinute!, e.deltaY); };
  private onWheelSecond = (e: WheelEvent) => { e.preventDefault(); this.startInertia('second', this.listSecond!, e.deltaY); };
  private onWheelAmPm = (e: WheelEvent) => { e.preventDefault(); this.startInertia('ampm', this.listAmPm!, e.deltaY); };

  private clearAll = (e: MouseEvent) => { e.stopPropagation(); if (this.disabled) return; this.updateValue(undefined); };

  private useNow = () => {
    const now = new Date();
    const t = { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
    const clamped = this.clampTimeToRange(t);
    this.h = clamped.h; this.m = clamped.m; this.s = clamped.s; this.ampm = this.h < 12 ? 'AM' : 'PM';
    if (!this.confirm) this.commitValue();
    this.emitPick('now');
  };

  private confirmPick = () => { this.commitValue(); this.hideInnerPopup(); };

  private commitValue() {
    const out = this.formatTime(this.h, this.m, this.s, this.ms);
    this.updateValue(out);
  }

  private emitPick(trigger: 'click' | 'scroll' | 'keyboard' | 'now') {
    const out = this.formatTime(this.h, this.m, this.s, this.ms);
    this.ldesignPick.emit({ value: out, context: { trigger } });
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
    const fromFn = this.disableTimeFn?.(this.h, this.m, this.s)?.hour || [];
    const dis = new Set([...(this.parseArray(this.disabledHours)), ...fromFn]);
    if (dis.has(hh)) return true;
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    if (min && this.compare({ h: hh, m: 59, s: 59 }, min) < 0) return true;
    if (max && this.compare({ h: hh, m: 0, s: 0 }, max) > 0) return true;
    return false;
  }

  private isMinuteDisabled(mm: number) {
    const fromFn = this.disableTimeFn?.(this.h, this.m, this.s)?.minute || [];
    const dis = new Set([...(this.parseArray(this.disabledMinutes)), ...fromFn]);
    if (dis.has(mm)) return true;
    const min = this.parseTime(this.minTime || undefined);
    const max = this.parseTime(this.maxTime || undefined);
    if (min && this.compare({ h: this.h, m: mm, s: 59 }, min) < 0) return true;
    if (max && this.compare({ h: this.h, m: mm, s: 0 }, max) > 0) return true;
    return false;
  }

  private isSecondDisabled(ss: number) {
    const fromFn = this.disableTimeFn?.(this.h, this.m, this.s)?.second || [];
    const dis = new Set([...(this.parseArray(this.disabledSeconds)), ...fromFn]);
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

  private onInputFocus = (e: FocusEvent) => {
    this.focused = true;
    this.ldesignFocus.emit(e);
    if (!this.disabled) {
      const popup = this.getInnerPopup();
      // 避免与 trigger="click" 的切换冲突：仅在 trigger=focus 时由输入聚焦打开
      if (popup && this.trigger === 'focus') (popup as any).visible = true;
    }
  };

  private onInputBlur = (e: FocusEvent) => {
    this.focused = false;
    this.ldesignBlur.emit(e);
    // 尝试解析输入内容
    const txt = this.inputElement?.value?.trim();
    if (this.allowInput && !this.readonly && typeof txt === 'string') {
      const t = this.parseTime(txt);
      if (t) {
        this.h = t.h; this.m = t.m; this.s = t.s; this.ampm = this.h < 12 ? 'AM' : 'PM';
        if (!this.confirm) this.commitValue();
        else this.inputValue = this.formatTime(this.h, this.m, this.s);
        this.emitPick('keyboard');
      } else {
        // 恢复显示
        this.inputValue = this.value ?? '';
      }
    }
  };

  private onInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.inputValue = this.value ?? '';
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  private renderTrigger() {
    const has = !!(this.value && this.value !== '');
    const showClear = this.clearable && !this.disabled && (has || this.showClearIconOnEmpty);
    const classes = {
      'ldesign-time-picker__trigger': true,
      'ldesign-time-picker__trigger--placeholder': !has && !this.inputValue,
      'ldesign-time-picker__trigger--disabled': this.disabled,
      'ldesign-time-picker__trigger--borderless': this.borderless,
      [`ldesign-time-picker__trigger--${this.size}`]: true,
      [`ldesign-time-picker__trigger--status-${this.status}`]: this.status && this.status !== 'default',
      'ldesign-time-picker__trigger--readonly': this.readonly || !this.allowInput,
    } as any;

    const clearBtn = showClear ? (
      <span class="ldesign-time-picker__clear" onClick={this.clearAll} title="清空">
        <ldesign-icon name="x" size="small" />
      </span>
    ) : null;

    const icon = (
      <span class="ldesign-time-picker__suffix">
        <ldesign-icon name="clock" size="small" />
      </span>
    );

    const textValue = has ? (this.value as string) : '';

    return (
      <div class={classes} tabindex={this.disabled ? -1 : 0} onKeyDown={this.onTriggerKeyDown as any}>
        {this.allowInput ? (
          <input
            ref={(el) => (this.inputElement = el as HTMLInputElement)}
            class="ldesign-time-picker__input"
            value={this.inputValue || textValue}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readOnly={this.readonly}
            onFocus={this.onInputFocus as any}
            onBlur={this.onInputBlur as any}
            onKeyDown={this.onInputKeyDown as any}
            onInput={(e: any) => (this.inputValue = (e.target as HTMLInputElement).value)}
          />
        ) : (
          <span class="ldesign-time-picker__text">{textValue || this.placeholder}</span>
        )}
        {clearBtn}
        {icon}
      </div>
    );
  }

  private renderColumn(type: 'hour' | 'minute' | 'second' | 'millisecond') {
    const range = (n: number) => Array.from({ length: n }, (_, i) => i);
    let list: number[] = [];
    let cur = 0;
    let onClick: (v: number, e?: MouseEvent) => void = () => {};
    let isDisabled: (v: number) => boolean = () => false;
    const step = type === 'hour' ? this.hourStep : (type === 'minute' ? this.minuteStep : (type === 'second' ? this.secondStep : this.millisecondStep));

    if (type === 'hour') {
      if (this.effectiveUse12Hours) {
        list = range(12).map(i => i + 1).filter(v => (v % step === 0) || step === 1);
        const disp = ((this.h % 12) || 12);
        cur = disp;
        onClick = (v, e) => {
          let base = v % 12; if (base === 12 % 12) base = 0;
          const h24 = this.ampm === 'PM' ? (base + 12) : base;
          if (this.isHourDisabled(h24)) return;
          this.setHour(h24);
          const li = (e?.currentTarget as HTMLElement) || null; const ul = li?.parentElement as HTMLElement | null; if (li && ul) this.scrollItemIntoCenter(ul, li);
          this.emitPick('click');
        };
        isDisabled = (v) => { let base = v % 12; if (base === 12 % 12) base = 0; const h24 = this.ampm === 'PM' ? (base + 12) : base; return this.isHourDisabled(h24); };
      } else {
        list = range(24).filter(v => v % step === 0);
        cur = this.h;
        onClick = (v, e) => { if (this.isHourDisabled(v)) return; this.setHour(v); const li = (e?.currentTarget as HTMLElement) || null; const ul = li?.parentElement as HTMLElement | null; if (li && ul) this.scrollItemIntoCenter(ul, li); this.emitPick('click'); };
        isDisabled = (v) => this.isHourDisabled(v);
      }
    } else if (type === 'minute') {
      list = range(60).filter(v => v % step === 0);
      cur = this.m;
      onClick = (v, e) => { if (this.isMinuteDisabled(v)) return; this.setMinute(v); const li = (e?.currentTarget as HTMLElement) || null; const ul = li?.parentElement as HTMLElement | null; if (li && ul) this.scrollItemIntoCenter(ul, li); this.emitPick('click'); };
      isDisabled = (v) => this.isMinuteDisabled(v);
    } else if (type === 'second') {
      list = range(60).filter(v => v % step === 0);
      cur = this.s;
      onClick = (v, e) => { if (this.isSecondDisabled(v)) return; this.setSecond(v); const li = (e?.currentTarget as HTMLElement) || null; const ul = li?.parentElement as HTMLElement | null; if (li && ul) this.scrollItemIntoCenter(ul, li); this.emitPick('click'); };
      isDisabled = (v) => this.isSecondDisabled(v);
    } else {
      list = range(1000).filter(v => v % step === 0);
      cur = this.ms;
      onClick = (v, e) => { this.setMillisecond(v); const li = (e?.currentTarget as HTMLElement) || null; const ul = li?.parentElement as HTMLElement | null; if (li && ul) this.scrollItemIntoCenter(ul, li); this.emitPick('click'); };
      isDisabled = (_v) => false;
    }

    // 非无限滚动：不再克隆首尾，列表到达边界即停止
    const baseList = list;
    const filtered = this.hideDisabledTime ? baseList.filter(v => !isDisabled(v)) : baseList.slice();
    const displayList = filtered.length > 0 ? filtered : baseList;

    const refSetter = (el: HTMLElement) => {
      if (type === 'hour') this.listHour = el; else if (type === 'minute') this.listMinute = el; else if (type === 'second') this.listSecond = el; else this.listMillisecond = el;
    };

    const onScroll = (e: UIEvent) => {
      const el = e.currentTarget as HTMLElement;
      this.onColumnScroll(type, el);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      this.startInertia(type, el, e.deltaY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (e.key === 'ArrowDown') { e.preventDefault(); el.scrollBy({ top: this.itemHeight, behavior: 'smooth' }); this.onColumnScroll(type, el); this.emitPick('keyboard'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); el.scrollBy({ top: -this.itemHeight, behavior: 'smooth' }); this.onColumnScroll(type, el); this.emitPick('keyboard'); }
      else if (e.key === 'Enter' && this.confirm) { e.preventDefault(); this.confirmPick(); }
      else if (e.key === 'Escape') { this.hideInnerPopup(); }
    };

    return (
      <div class="ldesign-time-picker__picker" style={{ height: `${this.panelHeight || (this.itemHeight * this.visibleItems)}px` }}>
        <ul class="ldesign-time-picker__column" tabindex={0} onScroll={onScroll as any} onWheel={onWheel as any} onKeyDown={onKeyDown as any} ref={refSetter} style={{ height: '100%', overflowY: 'auto' }}>
          {displayList.map(v => {
            const active = type === 'hour' ? (this.effectiveUse12Hours ? (((this.h % 12) || 12) === v) : (v === this.h)) : (type === 'minute' ? v === this.m : v === this.s);
            const disabled = isDisabled(v);
            // 数据值使用 24h 的真实值，便于滚动选择
            const dataValue = (type === 'hour')
              ? (this.effectiveUse12Hours ? (this.ampm === 'PM' ? ((v % 12) + 12) : (v % 12)) : v)
              : v;
      return (
              <li data-value={String(dataValue)} class={{ 'ldesign-time-picker__item': true, 'ldesign-time-picker__item--active': active, 'ldesign-time-picker__item--disabled': disabled }} onClick={(ev) => !disabled && onClick(v, ev)}>
                {type === 'millisecond' ? this.pad3(v) : this.pad(v)}
              </li>
            );
          })}
        </ul>
        <div class="ldesign-time-picker__indicator" style={{ height: `${this.itemHeight}px` }}></div>
        <div class="ldesign-time-picker__mask ldesign-time-picker__mask--top"></div>
        <div class="ldesign-time-picker__mask ldesign-time-picker__mask--bottom"></div>
      </div>
    );
  }

  private renderAmPmColumn() {
    const options: ('AM' | 'PM')[] = ['AM', 'PM'];
    const onScroll = (e: UIEvent) => { const el = e.currentTarget as HTMLElement; this.onColumnScroll('ampm', el); };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const el = e.currentTarget as HTMLElement; this.startInertia('ampm', el, e.deltaY); };
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const next = this.ampm === 'AM' ? 'PM' : 'AM'; this.setAmPm(next); this.emitPick('keyboard'); }
      else if (e.key === 'Enter' && this.confirm) { e.preventDefault(); this.confirmPick(); }
      else if (e.key === 'Escape') { this.hideInnerPopup(); }
    };
    return (
      <div class="ldesign-time-picker__picker" style={{ height: `${this.panelHeight || (this.itemHeight * this.visibleItems)}px` }}>
        <ul class="ldesign-time-picker__column" tabindex={0} onScroll={onScroll as any} onWheel={onWheel as any} onKeyDown={onKeyDown as any} ref={(el) => (this.listAmPm = el)} style={{ height: '100%', overflowY: 'auto' }}>
          {options.map(op => (
            <li class={{ 'ldesign-time-picker__item': true, 'ldesign-time-picker__item--active': op === this.ampm }} data-value={op === 'PM' ? '13' : '0'} onClick={(e) => { this.setAmPm(op); const li = (e.currentTarget as HTMLElement); const ul = li.parentElement as HTMLElement; this.scrollItemIntoCenter(ul, li); }}>
              {op}
            </li>
          ))}
        </ul>
        <div class="ldesign-time-picker__indicator" style={{ height: `${this.itemHeight}px` }}></div>
        <div class="ldesign-time-picker__mask ldesign-time-picker__mask--top"></div>
        <div class="ldesign-time-picker__mask ldesign-time-picker__mask--bottom"></div>
      </div>
    );
  }

  private parsePresets(): TimePickerPresets {
    const p = this.presets;
    if (!p) return {};
    if (typeof p === 'string') {
      try { const o = JSON.parse(p); return o && typeof o === 'object' ? o : {}; } catch { return {}; }
    }
    return p as TimePickerPresets;
  }

  private clickPreset = (val: string) => {
    const t = this.parseTime(val);
    if (!t) return;
    this.h = t.h; this.m = t.m; this.s = t.s; this.ampm = this.h < 12 ? 'AM' : 'PM';
    this.commitValue();
    this.emitPick('click');
    this.hideInnerPopup();
  };

  private get itemHeightBySize() {
    switch (this.size) {
      case 'small': return 32;
      case 'large': return 40;
      default: return 36;
    }
  }

  private startInertia(kind: 'hour' | 'minute' | 'second' | 'millisecond' | 'ampm', container: HTMLElement, deltaY: number) {
    if (!container) return;
    // 取消上一次动画
    const prev = this.inertiaState[kind];
    if (prev?.raf) cancelAnimationFrame(prev.raf);
    this.inertiaActive[kind] = true;

    // 初速度（px/帧），根据滚轮幅度换算并限制范围
    let v = Math.max(-60, Math.min(60, deltaY * 0.25));
    const state = { v, last: performance.now(), raf: 0 };
    this.inertiaState[kind] = state as any;

    const step = (now: number) => {
      const dt = Math.max(1, now - state.last); // ms
      state.last = now;
      // 基于速度更新滚动
      const px = state.v * (dt / 16.67);
      const maxTop = container.scrollHeight - container.clientHeight;
      const nextTop = Math.max(0, Math.min(container.scrollTop + px, maxTop));
      container.scrollTop = nextTop;
      // 实时更新当前值
      this.onColumnScroll(kind, container);
      // 摩擦减速
      state.v *= Math.pow(0.92, dt / 16.67);
      if (Math.abs(state.v) < 0.2) {
        // 停止，吸附到最近项
        this.inertiaActive[kind] = false;
        const near = this.getNearestItem(container);
        if (near) this.scrollItemIntoCenter(container, near, true);
        this.emitPick('scroll');
        return;
      }
      state.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  }

  private renderPanel() {
    // 同步 item 高度
    this.itemHeight = this.itemHeightBySize;
    const presets = this.parsePresets();
    const hasPresets = presets && Object.keys(presets).length > 0;

    return (
      <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: `${this.itemHeight}px` }}>
        {hasPresets && (
          <div class="ldesign-time-picker__presets">
            {Object.entries(presets).map(([label, val]) => (
              <button class="ldesign-time-picker__preset-btn" type="button" onClick={() => this.clickPreset(Array.isArray(val) ? (val[0] as string) : (val as string))}>{label}</button>
            ))}
          </div>
        )}
        <div class="ldesign-time-picker__columns">
          {this.effectiveUse12Hours && this.renderAmPmColumn()}
          {this.renderColumn('hour')}
          {this.renderColumn('minute')}
          {this.effectiveShowSeconds && this.renderColumn('second')}
          {this.effectiveShowMilliseconds && this.renderColumn('millisecond')}
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