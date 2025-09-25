import { Component, Prop, State, Event, EventEmitter, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * ColorInput 颜色输入（内置 Popup + ColorPicker）
 * - 点击触发显示颜色选择面板
 * - 支持透明度/预设/最近使用
 */
@Component({
  tag: 'ldesign-color-input',
  styleUrl: 'color-input.less',
  shadow: false,
})
export class LdesignColorInput {
  @Element() host!: HTMLElement;

  private popupEl?: HTMLElement & { show?: () => void; hide?: () => void };
  private pickerEl?: HTMLElement;

  /** 当前颜色字符串（与 ColorPicker 格式一致） */
  @Prop({ mutable: true, reflect: true }) value: string = '#1677ff';
  /** 显示/输出格式 */
  @Prop() format: 'hex' | 'rgb' | 'hsl' | 'hsv' = 'hex';
  /** 是否显示透明度 */
  @Prop() showAlpha: boolean = true;
  /** 是否显示系统预设 */
  @Prop() showPreset: boolean = true;
  /** 是否显示最近使用 */
  @Prop() showHistory: boolean = true;
  /** 预设颜色 */
  @Prop() presets: string[] = [];
  /** 最近颜色最大条数 */
  @Prop() recentMax: number = 12;
  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 尺寸 */
  @Prop() size: Size = 'medium';
  /** 选择后是否自动关闭弹层 */
  @Prop() hideOnSelect: boolean = true;
  /** 弹出位置 */
  @Prop() placement: 'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'right'|'right-start'|'right-end' = 'bottom-start';
  /** 输入占位符 */
  @Prop() placeholder: string = '';
  /** 是否可清空 */
  @Prop() clearable: boolean = true;

  /** 实时更新 */
  @Event() ldesignInput!: EventEmitter<string>;
  /** 确认变更 */
  @Event() ldesignChange!: EventEmitter<string>;

  @State() private hoveringClear: boolean = false;

  private onPickerInput = (e: CustomEvent<string>) => {
    const color = e.detail;
    this.value = color;
    this.ldesignInput.emit(color);
  };

  private onPickerChange = (e: CustomEvent<string>) => {
    const color = e.detail;
    this.value = color;
    this.ldesignChange.emit(color);
    if (this.hideOnSelect) this.popupEl?.hide?.();
  };

  private clear = (ev: MouseEvent) => {
    ev.stopPropagation();
    if (this.disabled || !this.clearable) return;
    this.value = '';
    this.ldesignInput.emit('');
    this.ldesignChange.emit('');
  };

  private getRootClass() {
    const cls = ['ldesign-color-input', `ldesign-color-input--${this.size}`];
    if (this.disabled) cls.push('ldesign-color-input--disabled');
    return cls.join(' ');
  }

  render() {
    const previewStyle = { background: this.value || 'transparent' } as any;

    return (
      <Host>
        <ldesign-popup
          ref={(el) => (this.popupEl = el as any)}
          trigger="click"
          placement={this.placement}
          interactive
        >
          <div slot="trigger" class={this.getRootClass()} part="trigger">
            <span class="ld-color-input__swatch" style={previewStyle}></span>
            <input
              class="ld-color-input__field"
              value={this.value}
              placeholder={this.placeholder}
              readonly
              disabled={this.disabled}
            />
            {this.clearable && !!this.value ? (
              <button class="ld-color-input__clear" title="清空" onClick={this.clear}>
                ×
              </button>
            ) : (
              <span class="ld-color-input__caret" aria-hidden="true">▾</span>
            )}
          </div>

          <div style={{ padding: '8px', width: '100%' }}>
            <ldesign-color-picker-panel
              ref={(el) => (this.pickerEl = el as any)}
              value={this.value}
              format={this.format}
              show-alpha={this.showAlpha as any}
              show-preset={this.showPreset as any}
              show-history={this.showHistory as any}
              recent-max={this.recentMax as any}
              presets={this.presets as any}
              onLdesignInput={this.onPickerInput as any}
              onLdesignChange={this.onPickerChange as any}
            />
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}
