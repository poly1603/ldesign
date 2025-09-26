import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * ColorPicker 颜色选择器
 * - 支持 SV 色板 + Hue 滑条 + 可选 Alpha
 * - 支持 HEX/RGB/HSL/HSV 输入与预设/历史颜色
 */
@Component({ tag: 'ldesign-color-picker', styleUrl: 'color-picker.less', shadow: false })
export class LdesignColorPicker {
  @Element() host!: HTMLElement;

  private popupEl?: HTMLElement & { show?: () => void; hide?: () => void };

  // Exposed props (proxy to panel)
  @Prop({ mutable: true, reflect: true }) value: string = '#1677ff';
  @Prop() format: 'hex' | 'rgb' | 'hsl' | 'hsv' = 'hex';
  @Prop() showAlpha: boolean = true;
  @Prop() showPreset: boolean = true;
  @Prop() showHistory: boolean = true;
  @Prop() presets: string[] = [];
  @Prop() recentMax: number = 12;
  @Prop() size: Size = 'medium';
  @Prop() disabled: boolean = false;
  /** 选择后是否自动关闭弹层 */
  @Prop() hideOnSelect: boolean = true;
  /** 弹出位置 */
  @Prop() placement: 'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'right'|'right-start'|'right-end' = 'bottom-start';
  /** 设置弹层宽度（数字或 CSS 长度），panel 将铺满此宽度 */
  @Prop() popupWidth?: number | string;
  /** 使用具名插槽自定义触发器（slot="trigger"）；为 true 时不渲染默认触发器 */
  @Prop() customTrigger: boolean = false;
  /** 面板模式：'solid' | 'gradient' | 'both' */
  @Prop() modes: 'solid' | 'gradient' | 'both' = 'both';
  /** 渐变类型：'linear' | 'radial' | 'both'（传递给面板） */
  @Prop() gradientTypes: 'linear' | 'radial' | 'both' = 'both';
  /** 渐变色标之间的最小间距（百分比，避免重叠），默认 1（透传给面板） */
  @Prop() minStopGap: number = 1;
  /** 是否显示“确定/取消”操作区（默认 false） */
  @Prop() showActions: boolean = false;
  /** 自定义按钮文案 */
  @Prop() confirmText: string = '确定';
  @Prop() cancelText: string = '取消';
  /** 透传面板 UI 模式 */
  @Prop() ui: 'simple' | 'pro' = 'pro';

  @Event() ldesignInput!: EventEmitter<string>;
  @Event() ldesignChange!: EventEmitter<string>;

  private cachedBeforeOpen?: string;

  private onPanelInput = (e: CustomEvent<string>) => {
    this.value = e.detail; this.ldesignInput.emit(e.detail);
  };
  private onPanelChange = (e: CustomEvent<string>) => {
    this.value = e.detail;
    if (!this.showActions) {
      this.ldesignChange.emit(e.detail);
      if (this.hideOnSelect) this.popupEl?.hide?.();
    }
  };

  private getRootClass() {
    const cls = ['ldesign-color-picker', `ldesign-color-picker--${this.size}`];
    if (this.disabled) cls.push('ldesign-color-picker--disabled');
    return cls.join(' ');
  }

  render() {
    const styleWidth = typeof this.popupWidth === 'number' ? `${this.popupWidth}px` : this.popupWidth;
    return (
      <Host>
        <ldesign-popup ref={(el)=> (this.popupEl = el as any)} trigger="click" placement={this.placement} width={styleWidth as any} interactive onLdesignVisibleChange={(e:any)=>{ const vis=!!e.detail; if (vis) this.cachedBeforeOpen = this.value; }}>
          {this.customTrigger ? (
            <slot name="trigger" slot="trigger"></slot>
          ) : (
            <div slot="trigger" class={this.getRootClass()}>
              <span class="ld-cp__swatch" style={{ background: this.value || 'transparent' }}></span>
              <span class="ld-cp__text">{this.value}</span>
            </div>
          )}
          <div style={{ padding: '8px', width: '100%' }}>
            <ldesign-color-picker-panel
              value={this.value}
              format={this.format}
              modes={this.modes as any}
              gradient-types={this.gradientTypes as any}
              show-alpha={this.showAlpha as any}
              show-preset={this.showPreset as any}
              show-history={this.showHistory as any}
              presets={this.presets as any}
              recent-max={this.recentMax as any}
              size={this.size as any}
              disabled={this.disabled as any}
              ui={this.ui as any}
              min-stop-gap={this.minStopGap as any}
              onLdesignInput={this.onPanelInput as any}
              onLdesignChange={this.onPanelChange as any}
            />
            {this.showActions ? (
              <div class="ld-cp-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button class="ld-btn-cancel" onClick={() => { if (this.cachedBeforeOpen!=null) this.value = this.cachedBeforeOpen; this.popupEl?.hide?.(); }}>{this.cancelText}</button>
                <button class="ld-btn-ok" onClick={() => { this.ldesignChange.emit(this.value); this.popupEl?.hide?.(); }}>{this.confirmText}</button>
              </div>
            ) : null}
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}
