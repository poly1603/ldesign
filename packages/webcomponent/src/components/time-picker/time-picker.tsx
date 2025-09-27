import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import type { Placement } from '@floating-ui/dom';

export type TimePickerTrigger = 'click' | 'focus' | 'manual';
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerOverlay = 'auto' | 'popup' | 'drawer';
export type Breakpoints = { xs: number; sm: number; md: number; lg: number };

export interface TimePreset {
  label: string;
  value: string;
  icon?: string;
}

export interface TimePickerLocale {
  placeholder?: string;
  now?: string;
  confirm?: string;
  clear?: string;
  am?: string;
  pm?: string;
}

export interface TimePreset {
  label: string;
  value: string;
  icon?: string;
}

export interface TimePickerLocale {
  placeholder?: string;
  now?: string;
  confirm?: string;
  clear?: string;
  am?: string;
  pm?: string;
}

@Component({ tag: 'ldesign-time-picker', styleUrl: 'time-picker.less', shadow: false })
export class LdesignTimePicker {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;           // e.g. 08:30 or 08:30:15
  @Prop() defaultValue?: string;

  // basic UI
  @Prop() placeholder: string = '选择时间';
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;                // 只读模式
  @Prop() clearable: boolean = false;                // 可清除
  @Prop() loading: boolean = false;                  // 加载状态
  @Prop() size: TimePickerSize = 'medium';
  @Prop() outputFormat: '12h' | '24h' = '24h';      // 输出格式

// columns
  @Prop() showSeconds: boolean = true;
  @Prop() steps: number[] = [1, 1, 1]; // [h, m, s]
  @Prop() panelHeight?: number; // 若未提供，将依据 visibleItems 与尺寸计算
  @Prop() visibleItems: number = 5;
  @Prop() confirm: boolean = true; // need Confirm button
  /** 是否展示"此刻"快捷按钮 */
  @Prop() showNow: boolean = true;
  // inline mode: render panel only, no overlay/trigger
  @Prop() inline: boolean = false;
  
  // 时间范围限制
  @Prop() minTime?: string;                          // 最小时间 e.g. "09:00:00"
  @Prop() maxTime?: string;                          // 最大时间 e.g. "18:00:00"
  @Prop() disabledHours?: number[];                  // 禁用的小时 [0, 1, 2]
  @Prop() disabledMinutes?: number[];                // 禁用的分钟
  @Prop() disabledSeconds?: number[];                // 禁用的秒数
  
  // 预设时间
  @Prop() presets?: TimePreset[];                    // 预设时间列表
  
  // 国际化
  @Prop() locale?: TimePickerLocale;

  // overlay
  @Prop() trigger: TimePickerTrigger = 'click';
  @Prop() placement: Placement = 'bottom-start' as Placement;
  @Prop({ mutable: true }) visible: boolean = false; // only for trigger=manual
  @Prop() overlay: TimePickerOverlay = 'auto';
  @Prop() breakpoints?: Breakpoints;
  @Prop() drawerPlacement: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
  @Prop() drawerSize?: number | string;
  @Prop() drawerTitle?: string;

  // events
  @Event() ldesignChange!: EventEmitter<string | undefined>;
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  @Event() ldesignOpen!: EventEmitter<void>;
  @Event() ldesignClose!: EventEmitter<void>;
  @Event() ldesignPick!: EventEmitter<{ value: string; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' | 'clear' | 'preset' | 'touch' | 'wheel' } }>;

  // state
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() meridiem: 'AM' | 'PM' = 'AM'; // AM/PM 状态
  @State() drawerVisible: boolean = false; // internal visible for drawer when trigger!=='manual'
  @State() panelOpen: boolean = false; // 当前面板是否打开（popup/drawer 任一）

  // cached picker options（保持引用稳定，避免因 options 变化而触发子 picker 的无动画对齐覆盖动画）
  private hourOpts: Array<{ value: string; label: string }> = [];
  private minuteOpts: Array<{ value: string; label: string }> = [];
  private secondOpts: Array<{ value: string; label: string }> = [];
  private meridiemOpts: Array<{ value: string; label: string }> = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
  ];

  // direct refs to child pickers（避免 querySelectorAll 可能的选择范围问题）
  private hourPicker?: any;
  private minutePicker?: any;
  private secondPicker?: any;
  private meridiemPicker?: any;

  // lifecycle
  @Watch('value') onValue(v?: string) {
    const t = this.parseTime(v) || this.parseTime(this.defaultValue) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s;
    // 设置AM/PM
    this.meridiem = this.h >= 12 ? 'PM' : 'AM';
    // 若面板已打开，则让列以动画方式滚动到新的值
    if (this.panelOpen) {
      requestAnimationFrame(() => this.animatePickersToCurrent());
    }
  }

  componentWillLoad() {
    const init = this.value !== undefined ? this.value : this.defaultValue;
    const t = this.parseTime(init) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s;
    // 设置AM/PM
    this.meridiem = this.h >= 12 ? 'PM' : 'AM';
    this.recomputeOptions();
    
    // 如果是12小时制且有初始值，确保输出格式正确
    if (this.outputFormat === '12h' && init) {
      this.value = this.formatTime(this.h, this.m, this.s);
    }
  }

componentDidLoad() { 
    window.addEventListener('resize', this.updateOverlayKind as any, { passive: true } as any);
    // 当以内联面板使用时，打开时机即为挂载完成
    if (this.inline) {
      this.panelOpen = true;
      requestAnimationFrame(() => {
        this.animatePickersToCurrent();
        requestAnimationFrame(() => this.recenterPickers());
      });
    }
  }
  disconnectedCallback() { window.removeEventListener('resize', this.updateOverlayKind as any); }

  // utils
  private pad2(n: number) { return String(n).padStart(2, '0'); }
  
  // 获取国际化文本
  private getLocaleText(key: keyof TimePickerLocale): string {
    const defaultLocale: TimePickerLocale = {
      placeholder: '选择时间',
      now: '此刻',
      confirm: '确定',
      clear: '清除',
      am: 'AM',
      pm: 'PM'
    };
    return this.locale?.[key] || defaultLocale[key] || '';
  }
  
  private parseTime(v?: string | null): { h: number; m: number; s: number; meridiem?: 'AM' | 'PM' } | null {
    if (!v || typeof v !== 'string') return null;
    
    // 尝试12小时制格式: "3:30 PM" 或 "03:30:15 AM"
    const m12 = v.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
    if (m12) {
      let h = parseInt(m12[1], 10) || 0;
      const mi = Math.max(0, Math.min(59, parseInt(m12[2], 10) || 0));
      const s = Math.max(0, Math.min(59, parseInt(m12[3] ?? '0', 10) || 0));
      const meridiem = m12[4] ? m12[4].toUpperCase() as 'AM' | 'PM' : undefined;
      
      // 如果有AM/PM标识，转换为24小时制
      if (meridiem) {
        if (meridiem === 'PM' && h !== 12) {
          h += 12;
        } else if (meridiem === 'AM' && h === 12) {
          h = 0;
        }
      }
      
      h = Math.max(0, Math.min(23, h));
      return { h, m: mi, s, meridiem };
    }
    
    // 24小时制格式
    const m = v.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (!m) return null;
    const h = Math.max(0, Math.min(23, parseInt(m[1], 10) || 0));
    const mi = Math.max(0, Math.min(59, parseInt(m[2], 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(m[3] ?? '0', 10) || 0));
    return { h, m: mi, s };
  }
  
  private formatTime(h: number, m: number, s: number) {
    if (this.outputFormat === '12h') {
      const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      const meridiem = h >= 12 ? 'PM' : 'AM';
      const base = `${this.pad2(displayHour)}:${this.pad2(m)}`;
      const timeStr = this.showSeconds ? `${base}:${this.pad2(s)}` : base;
      return `${timeStr} ${meridiem}`;
    }
    const base = `${this.pad2(h)}:${this.pad2(m)}`;
    return this.showSeconds ? `${base}:${this.pad2(s)}` : base;
  }
  
  // 获取12小时制显示小时
  private get12HourDisplay(): number {
    if (this.h === 0) return 12;
    return this.h > 12 ? this.h - 12 : this.h;
  }
  
  // 从12小时制转换为24小时制
  private convertTo24Hour(hour12: number, meridiem: 'AM' | 'PM'): number {
    if (meridiem === 'AM') {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  }
  
  // 检查时间是否在范围内
  private isTimeInRange(h: number, m: number, s: number): boolean {
    if (!this.minTime && !this.maxTime) return true;
    
    const currentMinutes = h * 60 + m + s / 60;
    
    if (this.minTime) {
      const min = this.parseTime(this.minTime);
      if (min) {
        const minMinutes = min.h * 60 + min.m + min.s / 60;
        if (currentMinutes < minMinutes) return false;
      }
    }
    
    if (this.maxTime) {
      const max = this.parseTime(this.maxTime);
      if (max) {
        const maxMinutes = max.h * 60 + max.m + max.s / 60;
        if (currentMinutes > maxMinutes) return false;
      }
    }
    
    return true;
  }
  
  // 检查某个值是否被禁用
  private isDisabled(value: number, type: 'hour' | 'minute' | 'second'): boolean {
    if (type === 'hour' && this.disabledHours) {
      return this.disabledHours.includes(value);
    }
    if (type === 'minute' && this.disabledMinutes) {
      return this.disabledMinutes.includes(value);
    }
    if (type === 'second' && this.disabledSeconds) {
      return this.disabledSeconds.includes(value);
    }
    return false;
  }

  private getBreakpoints(): Breakpoints { return this.breakpoints || { xs: 480, sm: 768, md: 1024, lg: 1280 }; }
  private computeOverlayKind(): 'popup' | 'drawer' {
    if (this.overlay === 'popup') return 'popup';
    if (this.overlay === 'drawer') return 'drawer';
    const w = window.innerWidth || document.documentElement.clientWidth || 1024;
    const md = this.getBreakpoints().md || 1024;
    return w >= md ? 'popup' : 'drawer';
  }
  private updateOverlayKind = () => { /* computed on demand */ };

  @Watch('steps')
  onStepsChanged() { this.recomputeOptions(); }

  @Watch('showSeconds')
  onShowSecondsChanged() { this.recomputeOptions(); }

  @Watch('outputFormat')
  onOutputFormatChanged() {
    this.recomputeOptions();
    // 根据当前24h值重新设置AM/PM
    this.meridiem = this.h >= 12 ? 'PM' : 'AM';
    if (this.panelOpen) {
      requestAnimationFrame(() => this.animatePickersToCurrent());
    }
  }

  // 将原始值按步进量化到合法选项（确保结果是 step 的倍数且在 [0, max] 内）
  private quantizeToStep(v: number, step: number, max: number): number {
    const s = (!step || step <= 1) ? 1 : Math.floor(step);
    if (s <= 1) return Math.max(0, Math.min(max, Math.round(v)));
    // 以最近的倍数为目标
    const n = Math.round(v / s);
    let m = n * s;
    if (m > max) m = Math.floor(max / s) * s; // 保证仍是合法倍数
    if (m < 0) m = 0;
    return m;
  }

  private getOverlayVisible(): boolean { return this.trigger === 'manual' ? this.visible : this.drawerVisible; }
  private openOverlay() {
    if (this.computeOverlayKind() === 'popup') {
      const p = this.el?.querySelector('ldesign-popup') as any; if (p) p.visible = true; return;
    }
    if (this.trigger === 'manual') this.visible = true; else this.drawerVisible = true;
    this.ldesignVisibleChange.emit(true); this.ldesignOpen.emit();
  }
  private hideOverlay() {
    if (this.computeOverlayKind() === 'popup') { const p = this.el?.querySelector('ldesign-popup') as any; if (p) p.visible = false; return; }
    if (this.trigger === 'manual') this.visible = false; else this.drawerVisible = false;
    this.ldesignVisibleChange.emit(false); this.ldesignClose.emit();
  }
  private async getPickersReady(): Promise<any[]> {
    const nodeList = Array.from(this.el.querySelectorAll('ldesign-picker')) as any[];
    const pickers = await Promise.all(nodeList.map(async (pk: any) => { try { if (pk?.componentOnReady) await pk.componentOnReady(); } catch {}; return pk; }));
    return pickers;
  }

  private async animatePickersToValues(values: string[], opts?: { stagger?: number }) {
    try {
      const pickers = await this.getPickersReady();
      const stagger = Math.max(0, opts?.stagger ?? 60); // 每列错峰 60ms，肉眼更容易察觉
      await Promise.all(pickers.map(async (pk: any, i: number) => {
        const v = values[i];
        if (!pk) return;
        await new Promise(r => setTimeout(r, i * stagger));
        if (typeof pk.scrollToValue === 'function') {
          try { await pk.scrollToValue(v, { trigger: 'program', animate: true, silent: true }); } catch {}
        } else {
          try { const old = pk.value; pk.value = undefined; pk.value = v ?? old; } catch {}
        }
      }));
    } catch {}
  }

  private async animatePickersToCurrent() {
    let vals;
    if (this.outputFormat === '12h') {
      const hour12 = this.get12HourDisplay();
      // 确保包含AM/PM值
      if (this.showSeconds) {
        vals = [String(hour12), String(this.m), String(this.s), this.meridiem];
      } else {
        vals = [String(hour12), String(this.m), this.meridiem];
      }
    } else {
      if (this.showSeconds) {
        vals = [String(this.h), String(this.m), String(this.s)];
      } else {
        vals = [String(this.h), String(this.m)];
      }
    }
    await this.animatePickersToValues(vals);
  }

  private skipRecenterOnce = false;

  private async recenterPickers() {
    // 如果在“此刻”等操作后立即触发了首帧对齐，则跳过这一轮，避免把动画覆盖掉
    if (this.skipRecenterOnce) { this.skipRecenterOnce = false; return; }
    // 在弹层打开后，强制让列吸附到当前值的正中（无动画）
    try {
      const nodeList = Array.from(this.el.querySelectorAll('ldesign-picker')) as any[];
      const pickers = await Promise.all(nodeList.map(async (pk: any) => { try { if (pk?.componentOnReady) await pk.componentOnReady(); } catch {}; return pk; }));
      for (const pk of pickers) {
        if (pk && typeof pk.centerToCurrent === 'function') {
          try { await pk.centerToCurrent(false); } catch {}
        } else if ('value' in pk) {
          try { const v = pk.value; pk.value = undefined; pk.value = v; } catch {}
        }
      }
    } catch {}
  }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      this.panelOpen = true;
      this.ldesignOpen.emit();
      // 等待内容装载后先平滑滚动到当前值（动画），再对齐一次
      requestAnimationFrame(() => {
        this.animatePickersToCurrent();
        requestAnimationFrame(() => this.recenterPickers());
      });
    } else {
      this.panelOpen = false;
      this.ldesignClose.emit();
    }
  };
  private handleDrawerVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      this.panelOpen = true;
      this.ldesignOpen.emit();
      requestAnimationFrame(() => {
        this.animatePickersToCurrent();
        requestAnimationFrame(() => this.recenterPickers());
      });
    } else {
      this.panelOpen = false;
      this.ldesignClose.emit();
    }
  };

  private range(n: number) { return Array.from({ length: n }, (_, i) => i); }
  private toPickerOptions(list: number[], step: number) { return list.filter(v => v % step === 0).map(v => ({ value: String(v), label: this.pad2(v) })); }
  private to12HourPickerOptions(step: number) {
    // 12小时制：1-12
    const hours = [];
    // 始终包含12（代表午夜12点或中午12点）
    if (step === 1 || 12 % step === 0) {
      hours.push({ value: String(12), label: this.pad2(12) });
    }
    // 然后是1-11
    for (let i = 1; i <= 11; i++) {
      if (i % step === 0) {
        hours.push({ value: String(i), label: this.pad2(i) });
      }
    }
    return hours;
  }

  private recomputeOptions() {
    const sh = this.steps?.[0] || 1;
    const sm = this.steps?.[1] || 1;
    const ss = this.steps?.[2] || 1;
    
    if (this.outputFormat === '12h') {
      this.hourOpts = this.to12HourPickerOptions(sh);
      // 确保AM/PM选项已经初始化（虽然已在类定义时初始化，但这里再次确保）
      this.meridiemOpts = [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' }
      ];
    } else {
      this.hourOpts = this.toPickerOptions(this.range(24), sh);
    }
    
    this.minuteOpts = this.toPickerOptions(this.range(60), sm);
    this.secondOpts = this.toPickerOptions(this.range(60), ss);
  }

  private commitValue() { const out = this.formatTime(this.h, this.m, this.s); if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); } }
  private emitPick(trigger: 'click' | 'scroll' | 'keyboard' | 'now' | 'clear' | 'preset') { const out = this.formatTime(this.h, this.m, this.s); this.ldesignPick.emit({ value: out, context: { trigger } }); }
  
  // 清除功能
  private clearValue = () => {
    this.value = undefined;
    this.h = 0; this.m = 0; this.s = 0;
    this.meridiem = 'AM';
    this.ldesignChange.emit(undefined);
    this.emitPick('clear');
    this.hideOverlay();
  };
  
  // 选择预设时间
  private selectPreset = (preset: TimePreset) => {
    const t = this.parseTime(preset.value);
    if (t) {
      this.h = t.h; this.m = t.m; this.s = t.s;
      this.meridiem = this.h >= 12 ? 'PM' : 'AM';
      if (this.panelOpen) {
        requestAnimationFrame(() => this.animatePickersToCurrent());
      }
      if (!this.confirm) this.commitValue();
      this.emitPick('preset');
    }
  };
  
  // 清除功能
  private clearValue = () => {
    this.value = undefined;
    this.h = 0; this.m = 0; this.s = 0;
    this.meridiem = 'AM';
    this.ldesignChange.emit(undefined);
    this.emitPick('clear');
    this.hideOverlay();
  };

  private useNow = () => {
    const d = new Date();
    // 按步进量化，确保能命中列的选项从而产生动画
    const sh = this.steps?.[0] ?? 1;
    const sm = this.steps?.[1] ?? 1;
    const ss = this.steps?.[2] ?? 1;

    const qh = this.quantizeToStep(d.getHours(),   sh, 23);
    const qm = this.quantizeToStep(d.getMinutes(), sm, 59);
    const qs = this.showSeconds ? this.quantizeToStep(d.getSeconds(), ss, 59) : this.s;

    this.h = qh; this.m = qm; this.s = qs;
    this.meridiem = this.h >= 12 ? 'PM' : 'AM';

    // 直接调子列的方法，确保动画生效；若秒列隐藏，仅滚动小时/分钟
    this.skipRecenterOnce = true; // 避免下一帧的对齐覆盖动画
    const scrollHour   = () => {
      try {
        const targetHour = this.outputFormat === '12h' ? (this.h === 0 ? 12 : (this.h > 12 ? this.h - 12 : this.h)) : this.h;
        this.hourPicker?.scrollToValue(String(targetHour), { animate: true, silent: true, trigger: 'program' });
      } catch {}
    };
    const scrollMinute = () => { try { this.minutePicker?.scrollToValue(String(qm), { animate: true, silent: true, trigger: 'program' }); } catch {} };
    const scrollSecond = () => { if (this.showSeconds) { try { this.secondPicker?.scrollToValue(String(qs), { animate: true, silent: true, trigger: 'program' }); } catch {} } };
    const scrollMeridiem = () => { if (this.outputFormat === '12h') { try { this.meridiemPicker?.scrollToValue(this.meridiem, { animate: true, silent: true, trigger: 'program' }); } catch {} } };
    // 轻微错峰
    scrollHour();
    window.setTimeout(scrollMinute, 60);
    window.setTimeout(scrollSecond, 120);
    window.setTimeout(scrollMeridiem, 180);

    if (!this.confirm) this.commitValue();
    this.emitPick('now');
  };

  private onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      // 仅在 drawer 模式下由组件主动打开；popup 模式交给 ldesign-popup 自己处理点击
      if (this.computeOverlayKind() === 'drawer') this.openOverlay();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.hideOverlay();
    }
  };

  private renderTrigger() {
    const text = this.value || this.defaultValue || '';
    const shouldShowClear = this.clearable && this.value && !this.disabled && !this.readonly;
    
    return (
      <div class={{ 
        'ldesign-time-picker__trigger': true, 
        [`ldesign-time-picker__trigger--${this.size}`]: true, 
        'ldesign-time-picker__trigger--disabled': this.disabled,
        'ldesign-time-picker__trigger--readonly': this.readonly,
        'ldesign-time-picker__trigger--loading': this.loading
      }}
           tabindex={this.disabled || this.readonly ? -1 : 0}
           onKeyDown={this.readonly ? undefined : this.onTriggerKeyDown as any}
           onClick={() => { 
             if (!this.readonly && !this.disabled && this.trigger === 'click' && this.computeOverlayKind() === 'drawer') 
               this.openOverlay(); 
           }}>
        <span class={{ 
          'ldesign-time-picker__text': true,
          'ldesign-time-picker__text--placeholder': !text 
        }}>{text || this.getLocaleText('placeholder')}</span>
        
        {shouldShowClear ? (
          <span class="ldesign-time-picker__clear" 
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  this.clearValue();
                }}>
            <ldesign-icon name="close" size="small" />
          </span>
        ) : null}
        
        <span class="ldesign-time-picker__suffix">
          {this.loading ? (
            <ldesign-icon name="loading" size="small" />
          ) : (
            <ldesign-icon name="clock" size="small" />
          )}
        </span>
      </div>
    );
  }

  private renderPanel() {
    const hourOpts = this.hourOpts;
    const minuteOpts = this.minuteOpts;
    const secondOpts = this.secondOpts;
    const meridiemOpts = this.meridiemOpts;

    const onPick = (kind: 'hour'|'minute'|'second'|'meridiem') => (e: CustomEvent<{ value: string | undefined; option?: any; context: { trigger: 'click'|'scroll'|'touch'|'wheel'|'keyboard' } }>) => {
      if (kind === 'meridiem') {
        const newMeridiem = e.detail?.value as 'AM' | 'PM';
        if (newMeridiem !== this.meridiem) {
          // 切换AM/PM时，转换小时
          this.meridiem = newMeridiem;
          if (this.outputFormat === '12h') {
            const hour12 = this.get12HourDisplay();
            this.h = this.convertTo24Hour(hour12, newMeridiem);
          }
        }
      } else {
        const v = Math.max(0, parseInt(String(e.detail?.value ?? '0'), 10) || 0);
        if (kind === 'hour') {
          if (this.outputFormat === '12h') {
            // 12小时制：将选择的小时（1-12）转换为24小时制
            this.h = this.convertTo24Hour(v, this.meridiem);
          } else {
            this.h = Math.min(23, v);
          }
        } else if (kind === 'minute') {
          this.m = Math.min(59, v);
        } else {
          this.s = Math.min(59, v);
        }
      }
      if (!this.confirm) this.commitValue();
      const trig = e.detail?.context?.trigger === 'touch' ? 'click' : (e.detail?.context?.trigger as any) || 'click';
      this.emitPick(trig);
    };

    const hourValue = this.outputFormat === '12h' ? String(this.get12HourDisplay()) : String(this.h);

    return (
      <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: this.size === 'small' ? '32px' : this.size === 'large' ? '40px' : '36px' }}>
        <div class="ldesign-time-picker__columns">
          <ldesign-picker ref={(el) => { this.hourPicker = el as any; }} options={hourOpts as any} value={hourValue} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('hour') as any} />
          <ldesign-picker ref={(el) => { this.minutePicker = el as any; }} options={minuteOpts as any} value={String(this.m)} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('minute') as any} />
          {this.showSeconds && (
            <ldesign-picker ref={(el) => { this.secondPicker = el as any; }} options={secondOpts as any} value={String(this.s)} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('second') as any} />
          )}
          {this.outputFormat === '12h' && (
            <ldesign-picker ref={(el) => { this.meridiemPicker = el as any; }} options={meridiemOpts as any} value={this.meridiem} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('meridiem') as any} />
          )}
        </div>
        {/* 预设时间 */}
        {this.presets && this.presets.length > 0 && (
          <div class="ldesign-time-picker__presets">
            {this.presets.map(preset => (
              <button 
                class="ldesign-time-picker__preset-btn" 
                type="button" 
                onClick={() => this.selectPreset(preset)}
              >
                {preset.icon && <ldesign-icon name={preset.icon} size="small" />}
                {preset.label}
              </button>
            ))}
          </div>
        )}
        
        <div class="ldesign-time-picker__footer">
          <div class="ldesign-time-picker__footer-left">
            {this.showNow && (
              <button class="ldesign-time-picker__now" type="button" onClick={this.useNow}>
                {this.getLocaleText('now')}
              </button>
            )}
            {this.clearable && this.value && (
              <button class="ldesign-time-picker__clear-btn" type="button" onClick={this.clearValue}>
                {this.getLocaleText('clear')}
              </button>
            )}
          </div>
          {this.confirm ? (
            <ldesign-button type="primary" size="small" onClick={() => { this.commitValue(); this.hideOverlay(); }}>
              {this.getLocaleText('confirm')}
            </ldesign-button>
          ) : null}
        </div>
      </div>
    );
  }

render() {
    // 内联模式：仅渲染面板内容
    if (this.inline) {
      return (
        <Host class={{ 'ldesign-time-picker': true, 'ldesign-time-picker--disabled': this.disabled }}>
          {this.renderPanel()}
        </Host>
      );
    }

    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};
    const kind = this.computeOverlayKind();

    if (kind === 'popup') {
      return (
        <Host class={{ 'ldesign-time-picker': true, 'ldesign-time-picker--disabled': this.disabled }}>
          <ldesign-popup placement={this.placement as Placement} trigger={this.trigger as any} interactive={true} arrow={false} theme={'light'} closeOnOutside={true} onLdesignVisibleChange={this.handlePopupVisibleChange} {...visibleProp}>
            <span slot="trigger"><slot name="trigger">{this.renderTrigger()}</slot></span>
            {this.renderPanel()}
          </ldesign-popup>
        </Host>
      );
    }

    const drawerVisible = this.getOverlayVisible();
    const sizeProp = this.drawerSize != null ? this.drawerSize : (this.size === 'large' ? 420 : this.size === 'small' ? 280 : 340);
    return (
      <Host class={{ 'ldesign-time-picker': true, 'ldesign-time-picker--disabled': this.disabled }}>
        <slot name="trigger">{this.renderTrigger()}</slot>
        <ldesign-drawer visible={drawerVisible} placement={this.drawerPlacement} size={sizeProp as any} drawerTitle={this.drawerTitle} onLdesignVisibleChange={this.handleDrawerVisibleChange}>
          {this.renderPanel()}
        </ldesign-drawer>
      </Host>
    );
  }
}
