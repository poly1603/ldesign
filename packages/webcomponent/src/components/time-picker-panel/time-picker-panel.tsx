import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';

export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'HH:mm:ss:SSS' | 'hh:mm A' | 'hh:mm:ss A';

/**
 * ldesign-time-picker-panel
 * 仅渲染选择面板，不包含触发器/弹层
 */
@Component({ tag: 'ldesign-time-picker-panel', styleUrl: 'time-picker-panel.less', shadow: false })
export class LdesignTimePickerPanel {
  /** 当前值（受控） */
  @Prop({ mutable: true }) value?: string;
  /** 默认值 */
  @Prop() defaultValue?: string;

  /** 是否显示秒 */
  @Prop() showSeconds: boolean = true;
  /** 是否启用 12 小时制显示（输出仍用 format 决定） */
  @Prop() use12Hours: boolean = false;
  /** 时间格式 */
  @Prop() format: TimeFormat = 'HH:mm:ss';
  /** 面板列最大高度 */
  @Prop() panelHeight: number = 180;
  /** 步进数组 [h, m, s, ms] */
  @Prop() steps: number[] = [1, 1, 1, 1];

  /** 变更事件 */
  @Event() ldesignChange!: EventEmitter<string>;
  /** 选择事件 */
  @Event() ldesignPick!: EventEmitter<{ value: string; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' } }>;

  // 内部状态
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() ms: number = 0;
  @State() effectiveShowSeconds: boolean = true;
  @State() effectiveShowMilliseconds: boolean = false;
  @State() ampm: 'AM' | 'PM' = 'AM';

  private listHour?: HTMLElement;
  private listMinute?: HTMLElement;
  private listSecond?: HTMLElement;
  private listMillisecond?: HTMLElement;
  private itemHeight = 36;

  @Watch('value') watchValue(newVal?: string) {
    const t = this.parseTime(newVal) || this.parseTime(this.defaultValue) || ({ h: 0, m: 0, s: 0, ms: 0 } as any);
    this.h = t.h; this.m = t.m; this.s = t.s; this.ms = (t as any).ms ?? 0; this.ampm = this.h < 12 ? 'AM' : 'PM';
  }

  componentWillLoad() {
    this.recomputeFlags();
    const init = this.value != null ? this.value : this.defaultValue;
    const t = this.parseTime(init) || ({ h: 0, m: 0, s: 0, ms: 0 } as any);
    this.h = t.h; this.m = t.m; this.s = t.s; this.ms = (t as any).ms ?? 0; this.ampm = this.h < 12 ? 'AM' : 'PM';
  }

  private recomputeFlags() {
    const f = (this.format || '').toLowerCase();
    const hasSSS = f.includes('sss');
    const hasSS = f.includes('ss');
    this.effectiveShowMilliseconds = hasSSS;
    this.effectiveShowSeconds = hasSS || hasSSS ? true : !!this.showSeconds;
  }

  private clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
  private pad(n: number) { return String(n).padStart(2, '0'); }
  private pad3(n: number) { return String(n).padStart(3, '0'); }

  private parseTime(v?: string | null): { h: number; m: number; s: number; ms?: number } | null {
    if (!v || typeof v !== 'string') return null;
    const str = v.trim();
    let m = str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,3})$/);
    if (m) {
      const h = this.clamp(parseInt(m[1], 10) || 0, 0, 23);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3], 10) || 0, 0, 59);
      const ms = this.clamp(parseInt(m[4], 10) || 0, 0, 999);
      return { h, m: mi, s, ms };
    }
    m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (m) {
      const h = this.clamp(parseInt(m[1], 10) || 0, 0, 23);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3] ?? '0', 10) || 0, 0, 59);
      return { h, m: mi, s };
    }
    m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*([AP]M)$/i);
    if (m) {
      let hh = this.clamp(parseInt(m[1], 10) || 0, 1, 12);
      const mi = this.clamp(parseInt(m[2], 10) || 0, 0, 59);
      const s = this.clamp(parseInt(m[3] ?? '0', 10) || 0, 0, 59);
      const isPM = (m[4].toUpperCase() === 'PM');
      if (hh === 12) hh = 0;
      const h24 = (isPM ? hh + 12 : hh);
      return { h: h24, m: mi, s };
    }
    return null;
  }

  private formatTime(): string {
    const base = `${this.pad(this.h)}:${this.pad(this.m)}`;
    let body = this.effectiveShowSeconds ? `${base}:${this.pad(this.s)}` : base;
    if (this.effectiveShowMilliseconds) body = `${body}:${this.pad3(this.ms)}`;
    return body;
  }

  private toSeconds(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }

  private commit(trigger: 'click' | 'scroll' | 'keyboard' | 'now') {
    const val = this.formatTime();
    if (this.value !== undefined) {
      this.ldesignChange.emit(val);
    } else {
      this.value = val;
      this.ldesignChange.emit(val);
    }
    this.ldesignPick.emit({ value: val, context: { trigger } });
  }

  private setHour = (h: number) => { this.h = this.clamp(h, 0, 23); };
  private setMinute = (m: number) => { this.m = this.clamp(m, 0, 59); };
  private setSecond = (s: number) => { this.s = this.clamp(s, 0, 59); };
  private setMillisecond = (ms: number) => { this.ms = this.clamp(ms, 0, 999); };

  private scrollItemIntoCenter(container: HTMLElement, item: HTMLElement, smooth = true) {
    try {
      const targetTop = item.offsetTop + item.offsetHeight / 2 - container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetTop), behavior: smooth ? 'smooth' as ScrollBehavior : 'auto' as ScrollBehavior });
    } catch {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const delta = (itemRect.top + itemRect.height / 2) - (containerRect.top + containerRect.height / 2);
      container.scrollBy({ top: delta, behavior: smooth ? 'smooth' as ScrollBehavior : 'auto' as ScrollBehavior });
    }
  }

  private onColumnScroll(kind: 'hour' | 'minute' | 'second' | 'millisecond', container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    const items = Array.from(container.querySelectorAll('li')) as HTMLElement[];
    let nearest: HTMLElement | null = null;
    let minD = Infinity;
    for (const it of items) {
      const r = it.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - cy);
      if (d < minD) { minD = d; nearest = it; }
    }
    if (nearest) {
      const vAttr = nearest.getAttribute('data-value');
      const v = vAttr ? parseInt(vAttr, 10) : NaN;
      if (!Number.isNaN(v)) {
        if (kind === 'hour') this.setHour(v);
        else if (kind === 'minute') this.setMinute(v);
        else if (kind === 'second') this.setSecond(v);
        else this.setMillisecond(v);
      }
    }
    this.commit('scroll');
    setTimeout(() => {
      const items2 = Array.from(container.querySelectorAll('li')) as HTMLElement[];
      let nearest2: HTMLElement | null = null, minD2 = Infinity;
      for (const it of items2) {
        const r = it.getBoundingClientRect();
        const d = Math.abs((r.top + r.height / 2) - cy);
        if (d < minD2) { minD2 = d; nearest2 = it; }
      }
      if (nearest2) this.scrollItemIntoCenter(container, nearest2, true);
    }, 120);
  }

  private renderColumn(type: 'hour' | 'minute' | 'second' | 'millisecond') {
    const range = (n: number) => Array.from({ length: n }, (_, i) => i);
    const step = type === 'hour' ? (this.steps[0] || 1) : (type === 'minute' ? (this.steps[1] || 1) : (type === 'second' ? (this.steps[2] || 1) : (this.steps[3] || 1)));
    let list: number[] = [];
    let cur = 0;
    if (type === 'hour') {
      list = range(24).filter(v => v % step === 0); cur = this.h;
    } else if (type === 'minute') {
      list = range(60).filter(v => v % step === 0); cur = this.m;
    } else if (type === 'second') {
      list = range(60).filter(v => v % step === 0); cur = this.s;
    } else { list = range(1000).filter(v => v % step === 0); cur = this.ms; }

    const bufferCount = list.length;
    const head = list.slice(-bufferCount);
    const tail = list.slice(0, bufferCount);
    const displayList = [...head, ...list, ...tail];

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      const dir = e.deltaY > 0 ? 1 : -1;
      el.scrollBy({ top: this.itemHeight * dir, behavior: 'smooth' });
      this.onColumnScroll(type, el);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (e.key === 'ArrowDown') { e.preventDefault(); el.scrollBy({ top: this.itemHeight, behavior: 'smooth' }); this.onColumnScroll(type, el); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); el.scrollBy({ top: -this.itemHeight, behavior: 'smooth' }); this.onColumnScroll(type, el); }
      else if (e.key === 'Enter') { e.preventDefault(); this.commit('keyboard'); }
    };

    return (
      <div class="ldesign-time-picker__picker" style={{ height: `${this.panelHeight}px` }}>
        <ul class="ldesign-time-picker__column" tabindex={0} onWheel={onWheel as any} onKeyDown={onKeyDown as any} ref={(el) => {
          if (type === 'hour') this.listHour = el as HTMLElement;
          else if (type === 'minute') this.listMinute = el as HTMLElement;
          else if (type === 'second') this.listSecond = el as HTMLElement;
          else this.listMillisecond = el as HTMLElement;
        }} style={{ height: '100%', overflowY: 'auto' }}>
          {displayList.map(v => {
            const active = (type === 'hour' ? v === this.h : (type === 'minute' ? v === this.m : (type === 'second' ? v === this.s : v === this.ms)));
            return (
              <li data-value={String(v)} class={{ 'ldesign-time-picker__item': true, 'ldesign-time-picker__item--active': active }} onClick={(e) => {
                if (type === 'hour') this.setHour(v); else if (type === 'minute') this.setMinute(v); else if (type === 'second') this.setSecond(v); else this.setMillisecond(v);
                const li = (e.currentTarget as HTMLElement); const ul = li.parentElement as HTMLElement; this.scrollItemIntoCenter(ul, li);
                this.commit('click');
              }}>
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

  private useNow = () => {
    const now = new Date();
    this.h = now.getHours(); this.m = now.getMinutes(); this.s = now.getSeconds(); this.ms = now.getMilliseconds();
    this.commit('now');
  };

  render() {
    return (
      <Host class={{ 'ldesign-time-picker': true }}>
        <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: `${this.itemHeight}px` }}>
          <div class="ldesign-time-picker__columns">
            {this.renderColumn('hour')}
            {this.renderColumn('minute')}
            {this.effectiveShowSeconds && this.renderColumn('second')}
            {this.effectiveShowMilliseconds && this.renderColumn('millisecond')}
          </div>
          <div class="ldesign-time-picker__footer">
            <button class="ldesign-time-picker__now" type="button" onClick={this.useNow}>此刻</button>
          </div>
        </div>
      </Host>
    );
  }
}
