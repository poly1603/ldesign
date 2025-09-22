import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Checkbox 复选框组件
 * 在一组备选项中进行多选
 */
@Component({
  tag: 'ldesign-checkbox',
  styleUrl: 'checkbox.less',
  shadow: false,
})
export class LdesignCheckbox {
  private checkboxElement?: HTMLInputElement;

  /**
   * 是否选中
   */
  @Prop({ mutable: true }) checked: boolean = false;

  /**
   * 选中状态的值
   */
  @Prop() value?: string | number;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 设置半选状态，只负责样式控制
   */
  @Prop() indeterminate: boolean = false;

  /**
   * 是否显示边框
   */
  @Prop() border: boolean = false;

  /**
   * 是否为按钮样式
   */
  @Prop() button: boolean = false;

  /**
   * 多选框的尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<boolean>;

  /**
   * 监听checked属性变化
   */
  @Watch('checked')
  watchChecked(newValue: boolean) {
    if (this.checkboxElement) {
      this.checkboxElement.checked = newValue;
    }
  }

  /**
   * 监听indeterminate属性变化
   */
  @Watch('indeterminate')
  watchIndeterminate(newValue: boolean) {
    if (this.checkboxElement) {
      this.checkboxElement.indeterminate = newValue;
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.checkboxElement) {
      this.checkboxElement.checked = this.checked;
      this.checkboxElement.indeterminate = this.indeterminate;
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick = (event: Event) => {
    event.preventDefault();
    
    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;
    this.ldesignChange.emit(this.checked);
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
   * 获取复选框类名
   */
  private getCheckboxClass(): string {
    const classes = ['ldesign-checkbox'];

    classes.push(`ldesign-checkbox--${this.size}`);

    if (this.checked) {
      classes.push('ldesign-checkbox--checked');
    }

    if (this.indeterminate) {
      classes.push('ldesign-checkbox--indeterminate');
    }

    if (this.disabled) {
      classes.push('ldesign-checkbox--disabled');
    }

    if (this.isFocused) {
      classes.push('ldesign-checkbox--focused');
    }

    if (this.border) {
      classes.push('ldesign-checkbox--border');
    }

    if (this.button) {
      classes.push('ldesign-checkbox--button');
    }

    return classes.join(' ');
  }

  /**
   * 渲染复选框图标
   */
  private renderCheckboxIcon() {
    if (this.indeterminate) {
      return <ldesign-icon name="minus" size="small" />;
    }

    if (this.checked) {
      return <ldesign-icon name="check" size="small" />;
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
        <label class={this.getCheckboxClass()}>
          <input
            ref={(el) => (this.checkboxElement = el)}
            type="checkbox"
            class="ldesign-checkbox__input"
            checked={this.checked}
            disabled={this.disabled}
            value={this.value}
            onClick={this.handleClick}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            tabindex={this.disabled ? -1 : 0}
            aria-checked={this.indeterminate ? 'mixed' : this.checked.toString()}
            aria-disabled={this.disabled.toString()}
          />
          <span class="ldesign-checkbox__inner">
            {this.renderCheckboxIcon()}
          </span>
          {this.button ? (
            <span class="ldesign-checkbox__label">
              <slot />
            </span>
          ) : (
            <span class="ldesign-checkbox__label">
              <slot />
            </span>
          )}
        </label>
      </Host>
    );
  }
}
