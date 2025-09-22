import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Input 输入框组件
 * 通过鼠标或键盘输入内容，是最基础的表单域的包装
 */
@Component({
  tag: 'ldesign-input',
  styleUrl: 'input.less',
  shadow: false,
})
export class LdesignInput {
  private inputElement?: HTMLInputElement | HTMLTextAreaElement;

  /**
   * 输入框类型
   */
  @Prop() type: 'text' | 'password' | 'textarea' | 'number' | 'email' | 'url' | 'tel' = 'text';

  /**
   * 输入框的值
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * 输入框占位文本
   */
  @Prop() placeholder?: string;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否只读
   */
  @Prop() readonly: boolean = false;

  /**
   * 是否可清空
   */
  @Prop() clearable: boolean = false;

  /**
   * 是否显示切换密码图标
   */
  @Prop() showPassword: boolean = false;

  /**
   * 输入框尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 输入框头部图标
   */
  @Prop() prefixIcon?: string;

  /**
   * 输入框尾部图标
   */
  @Prop() suffixIcon?: string;

  /**
   * 最大输入长度
   */
  @Prop() maxlength?: number;

  /**
   * 最小输入长度
   */
  @Prop() minlength?: number;

  /**
   * 自适应内容高度（仅对 textarea 有效）
   */
  @Prop() autosize: boolean = false;

  /**
   * 输入框行数（仅对 textarea 有效）
   */
  @Prop() rows: number = 2;

  /**
   * 内部状态：是否显示密码
   */
  @State() showPasswordText: boolean = false;

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 输入时触发
   */
  @Event() ldesignInput!: EventEmitter<string>;

  /**
   * 值改变时触发
   */
  @Event() ldesignChange!: EventEmitter<string>;

  /**
   * 获得焦点时触发
   */
  @Event() ldesignFocus!: EventEmitter<FocusEvent>;

  /**
   * 失去焦点时触发
   */
  @Event() ldesignBlur!: EventEmitter<FocusEvent>;

  /**
   * 点击清空按钮时触发
   */
  @Event() ldesignClear!: EventEmitter<void>;

  /**
   * 监听value属性变化
   */
  @Watch('value')
  watchValue(newValue: string) {
    if (this.inputElement && this.inputElement.value !== newValue) {
      this.inputElement.value = newValue;
    }
    if (this.autosize && this.type === 'textarea') {
      this.adjustTextareaHeight();
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.autosize && this.type === 'textarea') {
      this.adjustTextareaHeight();
    }
  }

  /**
   * 处理输入事件
   */
  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.ldesignInput.emit(this.value);

    if (this.autosize && this.type === 'textarea') {
      this.adjustTextareaHeight();
    }
  };

  /**
   * 处理值改变事件
   */
  private handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.ldesignChange.emit(target.value);
  };

  /**
   * 处理聚焦事件
   */
  private handleFocus = (event: FocusEvent) => {
    this.isFocused = true;
    this.ldesignFocus.emit(event);
  };

  /**
   * 处理失焦事件
   */
  private handleBlur = (event: FocusEvent) => {
    this.isFocused = false;
    this.ldesignBlur.emit(event);
  };

  /**
   * 处理清空按钮点击
   */
  private handleClear = () => {
    this.value = '';
    this.ldesignInput.emit(this.value);
    this.ldesignChange.emit(this.value);
    this.ldesignClear.emit();
    this.inputElement?.focus();
  };

  /**
   * 切换密码显示状态
   */
  private togglePasswordVisibility = () => {
    this.showPasswordText = !this.showPasswordText;
  };

  /**
   * 调整textarea高度
   */
  private adjustTextareaHeight() {
    if (this.inputElement && this.type === 'textarea') {
      const textarea = this.inputElement as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  /**
   * 获取输入框类名
   */
  private getInputClass(): string {
    const classes = ['ldesign-input'];

    classes.push(`ldesign-input--${this.size}`);

    if (this.disabled) {
      classes.push('ldesign-input--disabled');
    }

    if (this.isFocused) {
      classes.push('ldesign-input--focused');
    }

    if (this.prefixIcon || this.suffixIcon || this.clearable || this.showPassword) {
      classes.push('ldesign-input--with-icon');
    }

    return classes.join(' ');
  }

  /**
   * 获取包装器类名
   */
  private getWrapperClass(): string {
    const classes = ['ldesign-input-wrapper'];

    classes.push(`ldesign-input-wrapper--${this.size}`);

    if (this.disabled) {
      classes.push('ldesign-input-wrapper--disabled');
    }

    if (this.isFocused) {
      classes.push('ldesign-input-wrapper--focused');
    }

    return classes.join(' ');
  }

  /**
   * 渲染前缀图标
   */
  private renderPrefixIcon() {
    if (!this.prefixIcon) return null;

    return (
      <span class="ldesign-input__prefix">
        <ldesign-icon name={this.prefixIcon} size="small" />
      </span>
    );
  }

  /**
   * 渲染后缀图标
   */
  private renderSuffixIcon() {
    const icons = [];

    // 清空按钮
    if (this.clearable && this.value && !this.disabled && !this.readonly) {
      icons.push(
        <span class="ldesign-input__clear" onClick={this.handleClear}>
          <ldesign-icon name="x" size="small" />
        </span>
      );
    }

    // 密码切换按钮
    if (this.showPassword && this.type === 'password') {
      icons.push(
        <span class="ldesign-input__password" onClick={this.togglePasswordVisibility}>
          <ldesign-icon name={this.showPasswordText ? 'eye-off' : 'eye'} size="small" />
        </span>
      );
    }

    // 后缀图标
    if (this.suffixIcon) {
      icons.push(
        <span class="ldesign-input__suffix">
          <ldesign-icon name={this.suffixIcon} size="small" />
        </span>
      );
    }

    if (icons.length === 0) return null;

    return <span class="ldesign-input__suffix-wrapper">{icons}</span>;
  }

  /**
   * 渲染输入框
   */
  private renderInput() {
    const commonProps = {
      ref: (el: HTMLInputElement | HTMLTextAreaElement) => (this.inputElement = el),
      class: this.getInputClass(),
      value: this.value,
      placeholder: this.placeholder,
      disabled: this.disabled,
      readonly: this.readonly,
      maxlength: this.maxlength,
      minlength: this.minlength,
      onInput: this.handleInput,
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    };

    if (this.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={this.rows}
        />
      );
    }

    const inputType = this.type === 'password' && this.showPasswordText ? 'text' : this.type;

    return (
      <input
        {...commonProps}
        type={inputType}
      />
    );
  }

  render() {
    return (
      <Host style={{
        display: 'inline-block',
        width: '100%'
      }}>
        <div class={this.getWrapperClass()}>
          {this.renderPrefixIcon()}
          {this.renderInput()}
          {this.renderSuffixIcon()}
        </div>
        <slot name="prepend" />
        <slot name="append" />
      </Host>
    );
  }
}
