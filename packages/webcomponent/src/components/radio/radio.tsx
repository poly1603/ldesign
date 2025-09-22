import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Radio 单选框组件
 * 在一组备选项中进行单选
 */
@Component({
  tag: 'ldesign-radio',
  styleUrl: 'radio.less',
  shadow: false,
})
export class LdesignRadio {
  private radioElement?: HTMLInputElement;

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
   * 单选框的名称，用于分组
   */
  @Prop() name?: string;

  /**
   * 是否显示边框
   */
  @Prop() border: boolean = false;

  /**
   * 是否为按钮样式
   */
  @Prop() button: boolean = false;

  /**
   * 单选框的尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<string | number>;

  /**
   * 监听checked属性变化
   */
  @Watch('checked')
  watchChecked(newValue: boolean) {
    if (this.radioElement) {
      this.radioElement.checked = newValue;
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.radioElement) {
      this.radioElement.checked = this.checked;
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

    // 如果已经选中，不做任何操作（单选框不能取消选中）
    if (this.checked) {
      return;
    }

    // 先取消同组其他单选框的选中状态
    this.uncheckOtherRadios();

    // 设置当前单选框为选中状态
    this.checked = true;

    this.ldesignChange.emit(this.value);
  };

  /**
   * 取消同组其他单选框的选中状态
   */
  private uncheckOtherRadios() {
    // 查找同组的单选框（通过name属性或者父级RadioGroup）
    const groupName = this.name || this.getRadioGroupName();

    if (groupName) {
      const radios = document.querySelectorAll(`ldesign-radio[name="${groupName}"]`);
      radios.forEach((radio: any) => {
        if (radio !== this.radioElement?.closest('ldesign-radio') && radio.checked) {
          radio.checked = false;
        }
      });
    } else {
      // 如果没有name，查找父级RadioGroup中的所有Radio
      const radioGroup = this.radioElement?.closest('ldesign-radio-group');
      if (radioGroup) {
        const radios = radioGroup.querySelectorAll('ldesign-radio');
        radios.forEach((radio: any) => {
          if (radio !== this.radioElement?.closest('ldesign-radio') && radio.checked) {
            radio.checked = false;
          }
        });
      }
    }
  }

  /**
   * 获取RadioGroup的name属性
   */
  private getRadioGroupName(): string | null {
    const radioGroup = this.radioElement?.closest('ldesign-radio-group');
    return radioGroup?.getAttribute('name') || null;
  }

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
   * 获取单选框类名
   */
  private getRadioClass(): string {
    const classes = ['ldesign-radio'];

    classes.push(`ldesign-radio--${this.size}`);

    if (this.checked) {
      classes.push('ldesign-radio--checked');
    }

    if (this.disabled) {
      classes.push('ldesign-radio--disabled');
    }

    if (this.isFocused) {
      classes.push('ldesign-radio--focused');
    }

    if (this.border) {
      classes.push('ldesign-radio--border');
    }

    if (this.button) {
      classes.push('ldesign-radio--button');
    }

    return classes.join(' ');
  }

  render() {
    return (
      <Host style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle'
      }}>
        <label class={this.getRadioClass()}>
          <input
            ref={(el) => (this.radioElement = el)}
            type="radio"
            class="ldesign-radio__input"
            checked={this.checked}
            disabled={this.disabled}
            name={this.name}
            value={this.value}
            onClick={this.handleClick}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            tabindex={this.disabled ? -1 : 0}
            aria-checked={this.checked.toString()}
            aria-disabled={this.disabled.toString()}
          />
          <span class="ldesign-radio__inner">
            {this.checked && <span class="ldesign-radio__dot" />}
          </span>
          {this.button ? (
            <span class="ldesign-radio__label">
              <slot />
            </span>
          ) : (
            <span class="ldesign-radio__label">
              <slot />
            </span>
          )}
        </label>
      </Host>
    );
  }
}
