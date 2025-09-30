import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import type { Placement } from '@floating-ui/dom';

export type TimePickerTrigger = 'click' | 'focus' | 'manual';
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerOverlay = 'auto' | 'popup' | 'drawer';
export type Breakpoints = { xs: number; sm: number; md: number; lg: number };

export interface TimePreset {
  label: string;
  value: string | { start: string; end: string }; // 支持单个时间或时间范围
  icon?: string;
}

export interface TimePickerLocale {
  placeholder?: string;
  now?: string;
  confirm?: string;
  clear?: string;
  am?: string;
  pm?: string;
  to?: string; // 用于范围选择的连接词
}

@Component({ tag: 'ldesign-time-picker', styleUrl: 'time-picker.less', shadow: false })
export class LdesignTimePicker {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;           // e.g. 08:30 or 08:30:15 or range: "08:30-17:30"
  @Prop() defaultValue?: string;
  @Prop() range: boolean = false;                    // 是否为范围选择模式
  @Prop({ mutable: true }) startValue?: string;      // 范围选择的开始时间
  @Prop({ mutable: true }) endValue?: string;        // 范围选择的结束时间

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
  @Prop() steps: number[] = [1, 1, 1]; // [h, m, s] - deprecated, use individual step props
  @Prop() hourStep: number = 1;      // 小时步进
  @Prop() minuteStep: number = 1;    // 分钟步进 
  @Prop() secondStep: number = 1;    // 秒步进
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
  @Event() ldesignChange!: EventEmitter<string | undefined | { start: string; end: string }>;
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  @Event() ldesignOpen!: EventEmitter<void>;
  @Event() ldesignClose!: EventEmitter<void>;
  @Event() ldesignPick!: EventEmitter<{ value: string; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' | 'clear' | 'preset' | 'touch' | 'wheel' } }>;

  // state
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() meridiem: 'AM' | 'PM' = 'AM'; // AM/PM 状态
  @State() endH: number = 0; // 范围选择的结束时间
  @State() endM: number = 0;
  @State() endS: number = 0;
  @State() endMeridiem: 'AM' | 'PM' = 'AM';
  @State() activePanel: 'start' | 'end' = 'start'; // 当前激活的面板（范围选择时）
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
    // 获取当前时间作为备选
    const now = new Date();
    const currentTime = { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
    
    if (this.range) {
      // 范围选择模式
      // 优先使用 startValue/endValue，其次使用 defaultValue（可能是范围格式）
      let startT, endT;
      
      if (this.startValue || this.endValue) {
        startT = this.parseTime(this.startValue) || currentTime;
        endT = this.parseTime(this.endValue) || { h: currentTime.h + 1, m: currentTime.m, s: currentTime.s };
      } else if (this.defaultValue) {
        // 尝试解析范围格式的 defaultValue: "09:00-18:00"
        const parts = this.defaultValue.split(/[-~至]/); 
        if (parts.length === 2) {
          startT = this.parseTime(parts[0].trim()) || currentTime;
          endT = this.parseTime(parts[1].trim()) || { h: currentTime.h + 1, m: currentTime.m, s: currentTime.s };
        } else {
          startT = currentTime;
          endT = { h: currentTime.h + 1, m: currentTime.m, s: currentTime.s };
        }
      } else {
        startT = currentTime;
        endT = { h: currentTime.h + 1, m: currentTime.m, s: currentTime.s };
      }
      
      this.h = startT.h; this.m = startT.m; this.s = startT.s;
      this.endH = endT.h; this.endM = endT.m; this.endS = endT.s;
      this.meridiem = this.h >= 12 ? 'PM' : 'AM';
      this.endMeridiem = this.endH >= 12 ? 'PM' : 'AM';
      // 设置初始值
      this.startValue = this.formatTime(this.h, this.m, this.s);
      this.endValue = this.formatTime(this.endH, this.endM, this.endS);
    } else {
      const init = this.value !== undefined ? this.value : this.defaultValue;
      const t = this.parseTime(init) || currentTime;
      this.h = t.h; this.m = t.m; this.s = t.s;
      this.meridiem = this.h >= 12 ? 'PM' : 'AM';
      // 设置初始值
      if (this.defaultValue && !this.value) {
        this.value = this.formatTime(this.h, this.m, this.s);
      }
    }
    this.recomputeOptions();
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
      pm: 'PM',
      to: '至'
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

    const currentSeconds = h * 3600 + m * 60 + s;

    if (this.minTime) {
      const min = this.parseTime(this.minTime);
      if (min) {
        const minSeconds = min.h * 3600 + min.m * 60 + min.s;
        if (currentSeconds < minSeconds) return false;
      }
    }

    if (this.maxTime) {
      const max = this.parseTime(this.maxTime);
      if (max) {
        const maxSeconds = max.h * 3600 + max.m * 60 + max.s;
        if (currentSeconds > maxSeconds) return false;
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
    // 移动端自动使用drawer
    const isMobile = w < 768;
    if (isMobile) return 'drawer';
    const md = this.getBreakpoints().md || 1024;
    return w >= md ? 'popup' : 'drawer';
  }
  private updateOverlayKind = () => { /* computed on demand */ };

  @Watch('steps')
  onStepsChanged() { this.recomputeOptions(); }

  @Watch('hourStep')
  onHourStepChanged() { this.recomputeOptions(); }

  @Watch('minuteStep') 
  onMinuteStepChanged() { this.recomputeOptions(); }

  @Watch('secondStep')
  onSecondStepChanged() { this.recomputeOptions(); }

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
    const pickers = await Promise.all(nodeList.map(async (pk: any) => { try { if (pk?.componentOnReady) await pk.componentOnReady(); } catch { }; return pk; }));
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
          try { await pk.scrollToValue(v, { trigger: 'program', animate: true, silent: true }); } catch { }
        } else {
          try { const old = pk.value; pk.value = undefined; pk.value = v ?? old; } catch { }
        }
      }));
    } catch { }
  }

  private async animatePickersToCurrent() {
    let vals;
    let h, m, s, meridiem;
    
    // 确定要显示的值
    if (this.range && this.activePanel === 'end') {
      h = this.endH;
      m = this.endM;
      s = this.endS;
      meridiem = this.endMeridiem;
    } else {
      h = this.h;
      m = this.m;
      s = this.s;
      meridiem = this.meridiem;
    }
    
    if (this.outputFormat === '12h') {
      const hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      // AM/PM 放在最前面
      if (this.showSeconds) {
        vals = [meridiem, String(hour12), String(m), String(s)];
      } else {
        vals = [meridiem, String(hour12), String(m)];
      }
    } else {
      if (this.showSeconds) {
        vals = [String(h), String(m), String(s)];
      } else {
        vals = [String(h), String(m)];
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
      const pickers = await Promise.all(nodeList.map(async (pk: any) => { try { if (pk?.componentOnReady) await pk.componentOnReady(); } catch { }; return pk; }));
      for (const pk of pickers) {
        if (pk && typeof pk.centerToCurrent === 'function') {
          try { await pk.centerToCurrent(false); } catch { }
        } else if ('value' in pk) {
          try { const v = pk.value; pk.value = undefined; pk.value = v; } catch { }
        }
      }
    } catch { }
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

  private rangeArray(n: number) { return Array.from({ length: n }, (_, i) => i); }
  
  private toPickerOptions(list: number[], step: number, type?: 'hour' | 'minute' | 'second') {
    return list.filter(v => {
      // 检查是否能被步进整除
      if (v % step !== 0) return false;
      
      // 检查是否被禁用
      if (type && this.isDisabled(v, type)) return false;
      
      // 对于24小时制的小时，检查范围限制
      if (type === 'hour' && this.outputFormat !== '12h') {
        // 简单检查小时是否在范围内
        if (this.minTime) {
          const min = this.parseTime(this.minTime);
          if (min && v < min.h) return false;
        }
        if (this.maxTime) {
          const max = this.parseTime(this.maxTime);
          if (max && v > max.h) return false;
        }
      }
      
      return true;
    }).map(v => ({ 
      value: String(v), 
      label: this.pad2(v),
      disabled: false 
    }));
  }
  
  private to12HourPickerOptions(step: number) {
    // 12小时制：1-12
    const hours = [];
    // 始终包含12（代表午夜12点或中午12点）
    if (step === 1 || 12 % step === 0) {
      const hour24 = this.convertTo24Hour(12, this.meridiem);
      const disabled = this.isDisabled(hour24, 'hour') || !this.isHourInRange(hour24);
      hours.push({ value: String(12), label: this.pad2(12), disabled });
    }
    // 然后是1-11
    for (let i = 1; i <= 11; i++) {
      if (i % step === 0) {
        const hour24 = this.convertTo24Hour(i, this.meridiem);
        const disabled = this.isDisabled(hour24, 'hour') || !this.isHourInRange(hour24);
        hours.push({ value: String(i), label: this.pad2(i), disabled });
      }
    }
    return hours;
  }
  
  // 新增：检查小时是否在范围内
  private isHourInRange(h: number): boolean {
    if (!this.minTime && !this.maxTime) return true;
    
    if (this.minTime) {
      const min = this.parseTime(this.minTime);
      if (min && h < min.h) return false;
    }
    
    if (this.maxTime) {
      const max = this.parseTime(this.maxTime);
      if (max && h > max.h) return false;
    }
    
    return true;
  }

  private recomputeOptions() {
    // 优先使用独立的step属性，如果没有则从steps数组获取
    const sh = this.hourStep || this.steps?.[0] || 1;
    const sm = this.minuteStep || this.steps?.[1] || 1;
    const ss = this.secondStep || this.steps?.[2] || 1;

    if (this.outputFormat === '12h') {
      this.hourOpts = this.to12HourPickerOptions(sh);
      // 确保AM/PM选项已经初始化
      this.meridiemOpts = [
        { value: 'AM', label: this.getLocaleText('am') || 'AM' },
        { value: 'PM', label: this.getLocaleText('pm') || 'PM' }
      ];
    } else {
      this.hourOpts = this.toPickerOptions(this.rangeArray(24), sh, 'hour');
    }

    this.minuteOpts = this.toPickerOptions(this.rangeArray(60), sm, 'minute');
    this.secondOpts = this.toPickerOptions(this.rangeArray(60), ss, 'second');
  }

  private commitValue() { 
    if (this.range) {
      // 范围选择模式 - 确保两个时间都已设置
      const startTime = this.formatTime(this.h, this.m, this.s);
      const endTime = this.formatTime(this.endH, this.endM, this.endS);
      this.startValue = startTime;
      this.endValue = endTime;
      this.ldesignChange.emit({ start: startTime, end: endTime });
    } else {
      // 检查时间是否在允许的范围内
      if (!this.isTimeInRange(this.h, this.m, this.s)) {
        // 如果超出范围，调整到最近的有效时间
        this.adjustToValidTime();
      }
      
      const out = this.formatTime(this.h, this.m, this.s); 
      this.value = out;
      this.ldesignChange.emit(out);
    }
  }
  
  // 新增：调整时间到有效范围内
  private adjustToValidTime() {
    if (this.minTime) {
      const min = this.parseTime(this.minTime);
      if (min) {
        const currentSeconds = this.h * 3600 + this.m * 60 + this.s;
        const minSeconds = min.h * 3600 + min.m * 60 + min.s;
        if (currentSeconds < minSeconds) {
          this.h = min.h;
          this.m = min.m;
          this.s = min.s;
        }
      }
    }
    
    if (this.maxTime) {
      const max = this.parseTime(this.maxTime);
      if (max) {
        const currentSeconds = this.h * 3600 + this.m * 60 + this.s;
        const maxSeconds = max.h * 3600 + max.m * 60 + max.s;
        if (currentSeconds > maxSeconds) {
          this.h = max.h;
          this.m = max.m;
          this.s = max.s;
        }
      }
    }
  }
  private emitPick(trigger: 'click' | 'scroll' | 'keyboard' | 'now' | 'clear' | 'preset') { const out = this.formatTime(this.h, this.m, this.s); this.ldesignPick.emit({ value: out, context: { trigger } }); }

  // 清除功能
  private clearValue = () => {
    if (this.range) {
      this.startValue = undefined;
      this.endValue = undefined;
      this.h = 0; this.m = 0; this.s = 0;
      this.endH = 0; this.endM = 0; this.endS = 0;
      this.meridiem = 'AM';
      this.endMeridiem = 'AM';
      this.ldesignChange.emit(undefined);
    } else {
      this.value = undefined;
      this.h = 0; this.m = 0; this.s = 0;
      this.meridiem = 'AM';
      this.ldesignChange.emit(undefined);
    }
    this.emitPick('clear');
    this.hideOverlay();
  };

  // 选择预设时间
  private selectPreset = (preset: TimePreset) => {
    if (this.range && typeof preset.value === 'object') {
      // 范围预设
      const startT = this.parseTime(preset.value.start);
      const endT = this.parseTime(preset.value.end);
      if (startT && endT) {
        this.h = startT.h; this.m = startT.m; this.s = startT.s;
        this.endH = endT.h; this.endM = endT.m; this.endS = endT.s;
        this.meridiem = this.h >= 12 ? 'PM' : 'AM';
        this.endMeridiem = this.endH >= 12 ? 'PM' : 'AM';
        this.startValue = this.formatTime(this.h, this.m, this.s);
        this.endValue = this.formatTime(this.endH, this.endM, this.endS);
        if (this.panelOpen) {
          requestAnimationFrame(() => this.animatePickersToCurrent());
        }
        if (!this.confirm) {
          this.commitValue();
        }
        this.emitPick('preset');
      }
    } else if (!this.range && typeof preset.value === 'string') {
      // 单个时间预设
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
    }
  };


  private useNow = () => {
    const d = new Date();
    // 按步进量化，确保能命中列的选项从而产生动画
    const sh = this.hourStep || this.steps?.[0] || 1;
    const sm = this.minuteStep || this.steps?.[1] || 1;
    const ss = this.secondStep || this.steps?.[2] || 1;

    const qh = this.quantizeToStep(d.getHours(), sh, 23);
    const qm = this.quantizeToStep(d.getMinutes(), sm, 59);
    const qs = this.showSeconds ? this.quantizeToStep(d.getSeconds(), ss, 59) : this.s;

    this.h = qh; this.m = qm; this.s = qs;
    this.meridiem = this.h >= 12 ? 'PM' : 'AM';

    // 直接调子列的方法，确保动画生效；若秒列隐藏，仅滚动小时/分钟
    this.skipRecenterOnce = true; // 避免下一帧的对齐覆盖动画
    const scrollHour = () => {
      try {
        const targetHour = this.outputFormat === '12h' ? (this.h === 0 ? 12 : (this.h > 12 ? this.h - 12 : this.h)) : this.h;
        this.hourPicker?.scrollToValue(String(targetHour), { animate: true, silent: true, trigger: 'program' });
      } catch { }
    };
    const scrollMinute = () => { try { this.minutePicker?.scrollToValue(String(qm), { animate: true, silent: true, trigger: 'program' }); } catch { } };
    const scrollSecond = () => { if (this.showSeconds) { try { this.secondPicker?.scrollToValue(String(qs), { animate: true, silent: true, trigger: 'program' }); } catch { } } };
    const scrollMeridiem = () => { if (this.outputFormat === '12h') { try { this.meridiemPicker?.scrollToValue(this.meridiem, { animate: true, silent: true, trigger: 'program' }); } catch { } } };
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
    let text = '';
    if (this.range) {
      // 范围模式：显示开始和结束时间
      if (this.startValue || this.endValue) {
        const startText = this.startValue || '--:--';
        const endText = this.endValue || '--:--';
        text = `${startText} ${this.getLocaleText('to')} ${endText}`;
      }
    } else {
      text = this.value || this.defaultValue || '';
    }
    const shouldShowClear = this.clearable && (this.value || (this.range && (this.startValue || this.endValue))) && !this.disabled && !this.readonly;

    return (
      <div class={{
        'ldesign-time-picker__trigger': true,
        [`ldesign-time-picker__trigger--${this.size}`]: true,
        'ldesign-time-picker__trigger--disabled': this.disabled,
        'ldesign-time-picker__trigger--readonly': this.readonly,
        'ldesign-time-picker__trigger--loading': this.loading,
        'ldesign-time-picker__trigger--range': this.range
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

    // 监听当前选择的是开始还是结束时间
    const onPick = (kind: 'hour' | 'minute' | 'second' | 'meridiem') => (e: CustomEvent<{ value: string | undefined; option?: any; context: { trigger: 'click' | 'scroll' | 'touch' | 'wheel' | 'keyboard' } }>) => {
      const isEditingEnd = this.range && this.activePanel === 'end';
      
      if (kind === 'meridiem') {
        const newMeridiem = e.detail?.value as 'AM' | 'PM';
        if (!newMeridiem) return;
        
        if (isEditingEnd) {
          // 编辑结束时间的 AM/PM
          const hour12 = this.endH === 0 ? 12 : (this.endH > 12 ? this.endH - 12 : this.endH);
          this.endMeridiem = newMeridiem;
          this.endH = this.convertTo24Hour(hour12, newMeridiem);
        } else {
          // 编辑开始时间的 AM/PM
          const hour12 = this.h === 0 ? 12 : (this.h > 12 ? this.h - 12 : this.h);
          this.meridiem = newMeridiem;
          this.h = this.convertTo24Hour(hour12, newMeridiem);
        }
      } else {
        const v = Math.max(0, parseInt(String(e.detail?.value ?? '0'), 10) || 0);
        
        if (kind === 'hour') {
          if (this.outputFormat === '12h') {
            // 12小时制：将选择的小时（1-12）转换为24小时制
            if (isEditingEnd) {
              this.endH = this.convertTo24Hour(v, this.endMeridiem);
            } else {
              this.h = this.convertTo24Hour(v, this.meridiem);
            }
          } else {
            // 24小时制
            if (isEditingEnd) {
              this.endH = Math.min(23, v);
            } else {
              this.h = Math.min(23, v);
            }
          }
        } else if (kind === 'minute') {
          if (isEditingEnd) {
            this.endM = Math.min(59, v);
          } else {
            this.m = Math.min(59, v);
          }
        } else if (kind === 'second') {
          if (isEditingEnd) {
            this.endS = Math.min(59, v);
          } else {
            this.s = Math.min(59, v);
          }
        }
      }
      
      // 立即提交值（如果不需要确认）
      if (!this.confirm) {
        // 使用setTimeout确保值更新后再提交，解决即时生效问题
        setTimeout(() => {
          this.commitValue();
        }, 0);
      } else if (this.range) {
        // 范围模式下，即时保存当前面板的值
        if (this.activePanel === 'start') {
          this.startValue = this.formatTime(this.h, this.m, this.s);
        } else {
          this.endValue = this.formatTime(this.endH, this.endM, this.endS);
        }
      }
      
      const trig = e.detail?.context?.trigger === 'touch' ? 'click' : (e.detail?.context?.trigger as any) || 'click';
      this.emitPick(trig);
    };

    // 根据当前面板决定显示哪个时间
    let displayH, displayM, displayS, displayMeridiem;
    if (this.range && this.activePanel === 'end') {
      displayH = this.endH;
      displayM = this.endM;
      displayS = this.endS;
      displayMeridiem = this.endMeridiem;
    } else {
      displayH = this.h;
      displayM = this.m;
      displayS = this.s;
      displayMeridiem = this.meridiem;
    }
    
    const hourValue = this.outputFormat === '12h' ? 
      String(displayH === 0 ? 12 : (displayH > 12 ? displayH - 12 : displayH)) : 
      String(displayH);

    return (
      <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: this.size === 'small' ? '32px' : this.size === 'large' ? '40px' : '36px' }}>
        {/* 范围选择模式的标签页 */}
        {this.range && (
          <div class="ldesign-time-picker__tabs">
            <button 
              class={{
                'ldesign-time-picker__tab': true,
                'ldesign-time-picker__tab--active': this.activePanel === 'start'
              }}
              type="button"
              onClick={() => { 
                this.activePanel = 'start'; 
                requestAnimationFrame(() => {
                  this.animatePickersToCurrent();
                  requestAnimationFrame(() => this.recenterPickers());
                });
              }}
            >
              开始时间
              {this.startValue && (
                <span class="ldesign-time-picker__tab-value">{this.startValue}</span>
              )}
            </button>
            <button 
              class={{
                'ldesign-time-picker__tab': true,
                'ldesign-time-picker__tab--active': this.activePanel === 'end'
              }}
              type="button"
              onClick={() => { 
                this.activePanel = 'end'; 
                requestAnimationFrame(() => {
                  this.animatePickersToCurrent();
                  requestAnimationFrame(() => this.recenterPickers());
                });
              }}
            >
              结束时间
              {this.endValue && (
                <span class="ldesign-time-picker__tab-value">{this.endValue}</span>
              )}
            </button>
          </div>
        )}
        
        <div class="ldesign-time-picker__columns">
          {/* 12小时制时，AM/PM 放在最前面 */}
          {this.outputFormat === '12h' && (
            <ldesign-picker 
              ref={(el) => { this.meridiemPicker = el as any; }} 
              options={meridiemOpts as any} 
              value={displayMeridiem} 
              size={this.size as any} 
              panelHeight={this.panelHeight} 
              visibleItems={this.visibleItems} 
              onLdesignPick={onPick('meridiem') as any} 
            />
          )}
          <ldesign-picker 
            ref={(el) => { this.hourPicker = el as any; }} 
            options={hourOpts as any} 
            value={hourValue} 
            size={this.size as any} 
            panelHeight={this.panelHeight} 
            visibleItems={this.visibleItems} 
            onLdesignPick={onPick('hour') as any} 
          />
          <ldesign-picker 
            ref={(el) => { this.minutePicker = el as any; }} 
            options={minuteOpts as any} 
            value={String(displayM)} 
            size={this.size as any} 
            panelHeight={this.panelHeight} 
            visibleItems={this.visibleItems} 
            onLdesignPick={onPick('minute') as any} 
          />
          {this.showSeconds && (
            <ldesign-picker 
              ref={(el) => { this.secondPicker = el as any; }} 
              options={secondOpts as any} 
              value={String(displayS)} 
              size={this.size as any} 
              panelHeight={this.panelHeight} 
              visibleItems={this.visibleItems} 
              onLdesignPick={onPick('second') as any} 
            />
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
            <ldesign-button 
              type="primary" 
              size="small" 
              onClick={() => { 
                this.commitValue(); 
                this.hideOverlay();
              }}>
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
        <ldesign-drawer visible={drawerVisible} placement={this.drawerPlacement} size={sizeProp as any} drawerTitle={this.drawerTitle} onDrawerClose={() => this.hideOverlay()}>
          {this.renderPanel()}
        </ldesign-drawer>
      </Host>
    );
  }
}
