import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import type { Placement } from '@floating-ui/dom';

export type TimePickerTrigger = 'click' | 'focus' | 'manual';
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerOverlay = 'auto' | 'popup' | 'drawer';
export type Breakpoints = { xs: number; sm: number; md: number; lg: number };

@Component({ tag: 'ldesign-time-picker', styleUrl: 'time-picker.less', shadow: false })
export class LdesignTimePicker {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;           // e.g. 08:30 or 08:30:15
  @Prop() defaultValue?: string;

  // basic UI
  @Prop() placeholder: string = '选择时间';
  @Prop() disabled: boolean = false;
  @Prop() size: TimePickerSize = 'medium';

  // columns
  @Prop() showSeconds: boolean = true;
  @Prop() steps: number[] = [1, 1, 1]; // [h, m, s]
  @Prop() panelHeight: number = 180;
  @Prop() visibleItems: number = 5;
  @Prop() confirm: boolean = true; // need Confirm button

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
  @Event() ldesignPick!: EventEmitter<{ value: string; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' } }>;

  // state
  @State() h: number = 0;
  @State() m: number = 0;
  @State() s: number = 0;
  @State() drawerVisible: boolean = false; // internal visible for drawer when trigger!=='manual'
  @State() panelOpen: boolean = false; // 当前面板是否打开（popup/drawer 任一）

  // lifecycle
  @Watch('value') onValue(v?: string) {
    const t = this.parseTime(v) || this.parseTime(this.defaultValue) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s;
    // 若面板已打开，则让列以动画方式滚动到新的值
    if (this.panelOpen) {
      requestAnimationFrame(() => this.animatePickersToCurrent());
    }
  }

  componentWillLoad() {
    const init = this.value !== undefined ? this.value : this.defaultValue;
    const t = this.parseTime(init) || { h: 0, m: 0, s: 0 };
    this.h = t.h; this.m = t.m; this.s = t.s;
  }

  componentDidLoad() { window.addEventListener('resize', this.updateOverlayKind as any, { passive: true } as any); }
  disconnectedCallback() { window.removeEventListener('resize', this.updateOverlayKind as any); }

  // utils
  private pad2(n: number) { return String(n).padStart(2, '0'); }
  private parseTime(v?: string | null): { h: number; m: number; s: number } | null {
    if (!v || typeof v !== 'string') return null;
    const m = v.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (!m) return null;
    const h = Math.max(0, Math.min(23, parseInt(m[1], 10) || 0));
    const mi = Math.max(0, Math.min(59, parseInt(m[2], 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(m[3] ?? '0', 10) || 0));
    return { h, m: mi, s };
  }
  private formatTime(h: number, m: number, s: number) { const base = `${this.pad2(h)}:${this.pad2(m)}`; return this.showSeconds ? `${base}:${this.pad2(s)}` : base; }

  private getBreakpoints(): Breakpoints { return this.breakpoints || { xs: 480, sm: 768, md: 1024, lg: 1280 }; }
  private computeOverlayKind(): 'popup' | 'drawer' {
    if (this.overlay === 'popup') return 'popup';
    if (this.overlay === 'drawer') return 'drawer';
    const w = window.innerWidth || document.documentElement.clientWidth || 1024;
    const md = this.getBreakpoints().md || 1024;
    return w >= md ? 'popup' : 'drawer';
  }
  private updateOverlayKind = () => { /* computed on demand */ };

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
    const vals = [String(this.h), String(this.m), String(this.s)];
    await this.animatePickersToValues(vals);
  }

  private async recenterPickers() {
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

  private commitValue() { const out = this.formatTime(this.h, this.m, this.s); if (this.value !== undefined) this.ldesignChange.emit(out); else { this.value = out as any; this.ldesignChange.emit(out); } }
  private emitPick(trigger: 'click' | 'scroll' | 'keyboard' | 'now') { const out = this.formatTime(this.h, this.m, this.s); this.ldesignPick.emit({ value: out, context: { trigger } }); }

  private useNow = () => {
    const d = new Date();
    this.h = d.getHours(); this.m = d.getMinutes(); this.s = d.getSeconds();
    // 触发列的滚动动画到“此刻”，并做轻微错峰以确保肉眼可见
    requestAnimationFrame(() => this.animatePickersToValues([String(this.h), String(this.m), String(this.s)], { stagger: 80 }));
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
    return (
      <div class={{ 'ldesign-time-picker__trigger': true, [`ldesign-time-picker__trigger--${this.size}`]: true, 'ldesign-time-picker__trigger--disabled': this.disabled }}
           tabindex={this.disabled ? -1 : 0}
           onKeyDown={this.onTriggerKeyDown as any}
           onClick={() => { if (this.trigger === 'click' && this.computeOverlayKind() === 'drawer') this.openOverlay(); }}>
        <span class="ldesign-time-picker__text">{text || this.placeholder}</span>
        <span class="ldesign-time-picker__suffix"><ldesign-icon name="clock" size="small" /></span>
      </div>
    );
  }

  private renderPanel() {
    const hourOpts = this.toPickerOptions(this.range(24), this.steps?.[0] || 1);
    const minuteOpts = this.toPickerOptions(this.range(60), this.steps?.[1] || 1);
    const secondOpts = this.toPickerOptions(this.range(60), this.steps?.[2] || 1);

    const onPick = (kind: 'hour'|'minute'|'second') => (e: CustomEvent<{ value: string | undefined; option?: any; context: { trigger: 'click'|'scroll'|'touch'|'wheel'|'keyboard' } }>) => {
      const v = Math.max(0, parseInt(String(e.detail?.value ?? '0'), 10) || 0);
      if (kind === 'hour') this.h = Math.min(23, v);
      else if (kind === 'minute') this.m = Math.min(59, v);
      else this.s = Math.min(59, v);
      if (!this.confirm) this.commitValue();
      const trig = e.detail?.context?.trigger === 'touch' ? 'click' : (e.detail?.context?.trigger as any) || 'click';
      this.emitPick(trig);
    };

    return (
      <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: this.size === 'small' ? '32px' : this.size === 'large' ? '40px' : '36px' }}>
        <div class="ldesign-time-picker__columns">
          <ldesign-picker options={hourOpts as any} value={String(this.h)} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('hour') as any} />
          <ldesign-picker options={minuteOpts as any} value={String(this.m)} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('minute') as any} />
          {this.showSeconds && (
            <ldesign-picker options={secondOpts as any} value={String(this.s)} size={this.size as any} panelHeight={this.panelHeight} visibleItems={this.visibleItems} onLdesignPick={onPick('second') as any} />
          )}
        </div>
        <div class="ldesign-time-picker__footer">
          <button class="ldesign-time-picker__now" type="button" onClick={this.useNow}>此刻</button>
          {this.confirm && <ldesign-button type="primary" size="small" onClick={() => { this.commitValue(); this.hideOverlay(); }}>确定</ldesign-button>}
        </div>
      </div>
    );
  }

  render() {
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
