import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type TimeRange = [string, string];
export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'HH:mm:ss:SSS' | 'hh:mm A' | 'hh:mm:ss A';
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerStatus = 'default' | 'success' | 'warning' | 'error';

type PresetsMap = Record<string, TimeRange>;

@Component({ tag: 'ldesign-time-range-picker', styleUrl: 'time-range-picker.less', shadow: false })
export class LdesignTimeRangePicker {
  @Element() el!: HTMLElement;

  // Value
  @Prop({ mutable: true }) value?: TimeRange;
  @Prop() defaultValue?: TimeRange;

  // UI
  @Prop() placeholderStart: string = '开始时间';
  @Prop() placeholderEnd: string = '结束时间';
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() clearable: boolean = true;
  @Prop() allowInput: boolean = true;
  @Prop() borderless: boolean = false;
  @Prop() size: TimePickerSize = 'medium';
  @Prop() status: TimePickerStatus = 'default';
  @Prop() showClearIconOnEmpty: boolean = false;

  // Format & steps
  @Prop() format: TimeFormat = 'HH:mm:ss';
  @Prop() steps: number[] = [1, 1, 1, 1];

  // Panel behavior
  @Prop() panelHeight: number = 180;
  @Prop() confirm: boolean = true;
  @Prop() hideDisabledTime: boolean = true;

  // Popup
  @Prop() trigger: 'click' | 'focus' | 'manual' = 'click';
  @Prop() placement: Placement = 'bottom-start';
  @Prop({ mutable: true }) visible: boolean = false;
  @Prop() theme: 'light' | 'dark' = 'light';
  @Prop() arrow: boolean = false;

  // Presets
  @Prop() presets?: string | Record<string, TimeRange>;

  // Events
  @Event() ldesignChange!: EventEmitter<TimeRange | undefined>;
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  @Event() ldesignOpen!: EventEmitter<void>;
  @Event() ldesignClose!: EventEmitter<void>;
  @Event() ldesignPick!: EventEmitter<{ value: TimeRange; context: { trigger: 'click' | 'scroll' | 'keyboard' | 'now' } }>;
  @Event() ldesignFocus!: EventEmitter<FocusEvent>;
  @Event() ldesignBlur!: EventEmitter<FocusEvent>;

  // State
  @State() startText: string = '';
  @State() endText: string = '';
  @State() hasValue: boolean = false;

  private inputStart?: HTMLInputElement;
  private inputEnd?: HTMLInputElement;

  @Watch('value') watchValue(v?: TimeRange) {
    const cur = v || this.defaultValue;
    this.startText = cur?.[0] || '';
    this.endText = cur?.[1] || '';
    this.hasValue = !!(this.startText && this.endText);
  }

  componentWillLoad() {
    const cur = (this.value != null ? this.value : this.defaultValue) as TimeRange | undefined;
    this.startText = cur?.[0] || '';
    this.endText = cur?.[1] || '';
    this.hasValue = !!(this.startText && this.endText);
  }

  private getInnerPopup(): HTMLLdesignPopupElement | null { return this.el?.querySelector('ldesign-popup') as any; }
  private hideInnerPopup() { const p = this.getInnerPopup(); if (p) (p as any).visible = false; }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) { this.ldesignOpen.emit(); } else { this.ldesignClose.emit(); }
  };

  private clearAll = (e: MouseEvent) => { e.stopPropagation(); if (this.disabled) return; this.updateValue(undefined); };

  private updateValue(next?: TimeRange) {
    if (this.value !== undefined) {
      this.ldesignChange.emit(next);
    } else {
      this.value = next as any;
      this.hasValue = !!(next && next[0] && next[1]);
      this.ldesignChange.emit(next);
    }
  }

  private parsePresets(): PresetsMap {
    const p = this.presets;
    if (!p) return {};
    if (typeof p === 'string') {
      try { const o = JSON.parse(p); return o && typeof o === 'object' ? (o as PresetsMap) : {}; } catch { return {}; }
    }
    return p as PresetsMap;
  }

  private onInputFocus = (e: FocusEvent) => { this.ldesignFocus.emit(e); if (this.disabled) return; const p = this.getInnerPopup(); if (p && this.trigger !== 'manual') (p as any).visible = true; };

  private onInputBlur = (_e: FocusEvent) => {
    if (!this.allowInput || this.readonly) return;
    // 简化：不在 blur 时强制解析；留给用户回车或点击确认
  };

  private onInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 校验并提交
      this.confirmPick('keyboard');
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
      this.hideInnerPopup();
    }
  };

  private confirmPick = (trigger: 'click' | 'scroll' | 'keyboard' | 'now' = 'click') => {
    const s = (this.startText || '').trim();
    const e = (this.endText || '').trim();
    if (!s || !e) { this.updateValue(undefined); return; }
    // 简化：不做秒/毫秒精度强校验，仅排序
    const toSec = (str: string) => {
      const m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (!m) return NaN;
      const h = parseInt(m[1]||'0',10);
      const mi = parseInt(m[2]||'0',10);
      const s = parseInt(m[3]||'0',10);
      return h*3600+mi*60+s;
    };
    let s1 = s, s2 = e;
    if (toSec(s1) > toSec(s2)) { const t = s1; s1 = s2; s2 = t; }
    this.updateValue([s1, s2]);
    this.ldesignPick.emit({ value: [s1, s2], context: { trigger } });
    if (this.confirm) this.hideInnerPopup();
  };

  private clickPreset = (range: TimeRange) => {
    this.startText = range[0] || '';
    this.endText = range[1] || '';
    this.confirmPick('click');
  };

  private renderPresets() {
    const p = this.parsePresets();
    const ks = Object.keys(p);
    if (!ks.length) return null;
    return (
      <div class="ldesign-time-picker__presets">
        {ks.map(k => (
          <button class="ldesign-time-picker__preset-btn" type="button" onClick={() => this.clickPreset(p[k])}>{k}</button>
        ))}
      </div>
    );
  }

  private renderPanel(role: 'start' | 'end') {
    const val = role === 'start' ? this.startText : this.endText;
    return (
      <ldesign-time-picker-panel
        value={val}
        format={this.format as any}
        steps={this.steps as any}
        panelHeight={this.panelHeight}
        onLdesignChange={(e: CustomEvent<string>) => {
          if (role === 'start') this.startText = e.detail; else this.endText = e.detail;
        }}
        onLdesignPick={(e: CustomEvent<{ value: string; context: { trigger: any } }>) => {
          if (role === 'start') this.startText = e.detail.value; else this.endText = e.detail.value;
          this.ldesignPick.emit({ value: [this.startText, this.endText], context: e.detail.context });
        }}
      />
    );
  }

  private renderTrigger() {
    const has = this.hasValue;
    const showClear = this.clearable && !this.disabled && (has || this.showClearIconOnEmpty);
    const classes = {
      'ldesign-time-picker__trigger': true,
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

    return (
      <div class={classes} tabindex={this.disabled ? -1 : 0}>
        {this.allowInput ? (
          <div class="ldesign-time-range-picker__inputs">
            <input ref={(el) => (this.inputStart = el as HTMLInputElement)} class="ldesign-time-picker__input" value={this.startText} placeholder={this.placeholderStart} disabled={this.disabled} readOnly={this.readonly} onFocus={this.onInputFocus as any} onBlur={this.onInputBlur as any} onKeyDown={this.onInputKeyDown as any} onInput={(e: any) => (this.startText = (e.target as HTMLInputElement).value)} />
            <span class="ldesign-time-range-picker__separator">-</span>
            <input ref={(el) => (this.inputEnd = el as HTMLInputElement)} class="ldesign-time-picker__input" value={this.endText} placeholder={this.placeholderEnd} disabled={this.disabled} readOnly={this.readonly} onFocus={this.onInputFocus as any} onBlur={this.onInputBlur as any} onKeyDown={this.onInputKeyDown as any} onInput={(e: any) => (this.endText = (e.target as HTMLInputElement).value)} />
          </div>
        ) : (
          <div class="ldesign-time-range-picker__texts">
            <span class="ldesign-time-picker__text">{this.startText || this.placeholderStart}</span>
            <span class="ldesign-time-range-picker__separator">-</span>
            <span class="ldesign-time-picker__text">{this.endText || this.placeholderEnd}</span>
          </div>
        )}
        {clearBtn}
        {icon}
      </div>
    );
  }

  render() {
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};
    return (
      <Host class={{ 'ldesign-time-range-picker': true, 'ldesign-time-picker--disabled': this.disabled }}>
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
          <div class="ldesign-time-picker__content" style={{ ['--ld-tp-item-height' as any]: `${36}px` }}>
            {this.renderPresets()}
            <div class="ldesign-time-picker__columns">
              {this.renderPanel('start')}
              {this.renderPanel('end')}
            </div>
            <div class="ldesign-time-picker__footer">
              {this.confirm && <ldesign-button onClick={() => this.confirmPick('click') as any} type="primary" size="small">确定</ldesign-button>}
            </div>
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}
