import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Switch 开关组件
 * 表示两种相互对立的状态间的切换，多用于触发「开/关」
 */
@Component({
  tag: 'ldesign-switch',
  styleUrl: 'switch.less',
  shadow: false,
})
export class LdesignSwitch {
  private switchElement?: HTMLInputElement;

  /**
   * 是否选中
   */
  @Prop({ mutable: true }) checked: boolean = false;

  /**
   * 选中时的值
   */
  @Prop() checkedValue?: string | number | boolean = true;

  /**
   * 未选中时的值
   */
  @Prop() uncheckedValue?: string | number | boolean = false;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否加载中
   */
  @Prop() loading: boolean = false;

  /**
   * 开关尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 颜色风格
   * 可选：brand | success | warning | error | neutral
   */
  @Prop() color: 'brand' | 'success' | 'warning' | 'error' | 'neutral' = 'brand';

  /**
   * 外观样式
   * 可选：solid | soft | outline | ghost
   */
  @Prop() variant: 'solid' | 'soft' | 'outline' | 'ghost' = 'solid';

  /**
   * 形状
   * 可选：pill（胶囊）| rounded（圆角）| square（直角）
   */
  @Prop() shape: 'pill' | 'rounded' | 'square' = 'pill';

  /**
   * 选中时的文本
   */
  @Prop() checkedText?: string;

  /**
   * 未选中时的文本
   */
  @Prop() uncheckedText?: string;

  /**
   * 选中时的图标
   */
  @Prop() checkedIcon?: string;

  /**
   * 未选中时的图标
   */
  @Prop() uncheckedIcon?: string;

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<string | number | boolean>;

  /**
   * 监听checked属性变化
   */
  @Watch('checked')
  watchChecked(newValue: boolean) {
    if (this.switchElement) {
      this.switchElement.checked = newValue;
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.switchElement) {
      this.switchElement.checked = this.checked;
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick = (event: Event) => {
    event.preventDefault();
    
    if (this.disabled || this.loading) {
      return;
    }

    this.checked = !this.checked;
    const value = this.checked ? this.checkedValue : this.uncheckedValue;
    this.ldesignChange.emit(value);
  };

  /**
   * 处理聚焦事件
   */
  private handleFocus = () => {
    this.isFocused = true;
  };

  /**
   * 处理失焦事件
   */
  private handleBlur = () => {
    this.isFocused = false;
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.handleClick(event);
    }
  };

  /**
   * 获取开关类名
   */
  private getSwitchClass(): string {
    const classes = ['ldesign-switch'];

    classes.push(`ldesign-switch--${this.size}`);
    classes.push(`ldesign-switch--variant-${this.variant}`);
    classes.push(`ldesign-switch--color-${this.color}`);
    classes.push(`ldesign-switch--shape-${this.shape}`);

    if (this.checked) {
      classes.push('ldesign-switch--checked');
    }

    if (this.disabled) {
      classes.push('ldesign-switch--disabled');
    }

    if (this.loading) {
      classes.push('ldesign-switch--loading');
    }

    if (this.isFocused) {
      classes.push('ldesign-switch--focused');
    }

    return classes.join(' ');
  }

  /**
   * 渲染开关内容（图标放在滑块内）
   */
  private renderSwitchContent() {
    if (this.loading) {
      return <ldesign-icon name="loader-2" size="small" spin />;
    }

    if (this.checked) {
      if (this.checkedIcon) {
        return <ldesign-icon name={this.checkedIcon} size="small" />;
      }
    } else {
      if (this.uncheckedIcon) {
        return <ldesign-icon name={this.uncheckedIcon} size="small" />;
      }
    }

    return null;
  }

  /**
   * 渲染轨道上的文本（可读性优先，不再放在thumb里）
   */
  private renderSwitchLabel() {
    if (this.loading) return null;

    const text = this.checked ? this.checkedText : this.uncheckedText;
    if (text) {
      return (
        <span class="ldesign-switch__label">
          <span class="ldesign-switch__text">{text}</span>
        </span>
      );
    }
    return null;
  }

  render() {
    return (
      <Host style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle'
      }}>
        <label class={this.getSwitchClass()}>
          <input
            ref={(el) => (this.switchElement = el)}
            type="checkbox"
            class="ldesign-switch__input"
            checked={this.checked}
            disabled={this.disabled}
            onClick={this.handleClick}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            tabindex={this.disabled ? -1 : 0}
            aria-checked={this.checked.toString()}
            aria-disabled={this.disabled.toString()}
            role="switch"
          />
          <span class="ldesign-switch__track">
            {this.renderSwitchLabel()}
            <span class="ldesign-switch__thumb">
              {this.renderSwitchContent()}
            </span>
          </span>
        </label>
      </Host>
    );
  }
}
