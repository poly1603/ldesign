/**
 * Input 组件实现
 * 
 * 基于 Stencil 的现代化输入框组件，支持多种输入类型、验证、前后缀等功能
 * 具备完整的可访问性支持和主题定制功能
 */

import { Component, Prop, Event, EventEmitter, Element, State, Watch, h, Host } from '@stencil/core';
import {
  InputProps,
  InputType,
  InputVariant,
  InputInputEventDetail,
  InputChangeEventDetail,
  InputFocusEventDetail,
  InputClearEventDetail
} from '../../types/input';
import { Size, Status } from '../../types';
import { classNames, generateId, debounce } from '../../utils';

@Component({
  tag: 'ld-input',
  styleUrl: 'input.less',
  shadow: true,
})
export class Input implements InputProps {
  @Element() el!: HTMLElement;

  // 内部引用
  private inputRef?: HTMLInputElement | HTMLTextAreaElement;
  private debouncedInput?: (value: string) => void;

  // ==================== 属性定义 ====================

  /**
   * 输入框类型
   */
  @Prop() type: InputType = 'text';

  /**
   * 输入框变体
   */
  @Prop() variant: InputVariant = 'outlined';

  /**
   * 输入框尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 输入框状态
   */
  @Prop() status?: Status;

  /**
   * 输入框值
   */
  @Prop({ mutable: true }) value?: string;

  /**
   * 默认值
   */
  @Prop() defaultValue?: string;

  /**
   * 占位符文本
   */
  @Prop() placeholder?: string;

  /**
   * 最大长度
   */
  @Prop() maxlength?: number;

  /**
   * 最小长度
   */
  @Prop() minlength?: number;

  /**
   * 最大值
   */
  @Prop() max?: number | string;

  /**
   * 最小值
   */
  @Prop() min?: number | string;

  /**
   * 步长
   */
  @Prop() step?: number | string;

  /**
   * 输入模式
   */
  @Prop() inputmode?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'none' | 'decimal' | 'numeric';

  /**
   * 自动完成
   */
  @Prop() autocomplete?: string;

  /**
   * 拼写检查
   */
  @Prop() spellcheck: boolean = true;

  /**
   * 是否允许清空
   */
  @Prop() clearable: boolean = false;

  /**
   * 是否显示密码切换按钮
   */
  @Prop() showPassword: boolean = false;

  /**
   * 是否显示字符计数
   */
  @Prop() showCount: boolean = false;

  /**
   * 前缀图标
   */
  @Prop() prefixIcon?: string;

  /**
   * 后缀图标
   */
  @Prop() suffixIcon?: string;

  /**
   * 前缀文本
   */
  @Prop() prefixContent?: string;

  /**
   * 后缀文本
   */
  @Prop() suffix?: string;

  /**
   * 输入框前置标签
   */
  @Prop() addonBefore?: string;

  /**
   * 输入框后置标签
   */
  @Prop() addonAfter?: string;

  /**
   * 文本域行数
   */
  @Prop() rows: number = 3;

  /**
   * 文本域最小行数
   */
  @Prop() minRows?: number;

  /**
   * 文本域最大行数
   */
  @Prop() maxRows?: number;

  /**
   * 是否自动调整高度
   */
  @Prop() autosize: boolean = false;

  /**
   * 是否可调整大小
   */
  @Prop() resize: boolean = true;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否只读
   */
  @Prop() readonly: boolean = false;

  /**
   * 是否必填
   */
  @Prop() required: boolean = false;

  /**
   * 表单控件名称
   */
  @Prop() name?: string;

  /**
   * Tab 索引
   */
  @Prop() tabindex?: number;

  /**
   * 自动聚焦
   */
  @Prop() autofocus: boolean = false;

  /**
   * 错误消息
   */
  @Prop() errorMessage?: string;

  /**
   * 帮助文本
   */
  @Prop() helpText?: string;

  /**
   * 自定义 CSS 类名
   */
  @Prop() customClass?: string;

  /**
   * 自定义内联样式
   */
  @Prop() customStyle?: { [key: string]: string };

  // ==================== 状态定义 ====================

  /**
   * 组件唯一 ID
   */
  @State() componentId: string = generateId('ld-input');

  /**
   * 是否聚焦状态
   */
  @State() focused: boolean = false;

  /**
   * 密码是否可见
   */
  @State() passwordVisible: boolean = false;

  /**
   * 当前字符数
   */
  @State() currentLength: number = 0;

  /**
   * 内部值（用于受控/非受控模式）
   */
  @State() internalValue: string = '';

  // ==================== 事件定义 ====================

  /**
   * 输入事件
   */
  @Event() ldInput!: EventEmitter<InputInputEventDetail>;

  /**
   * 变化事件
   */
  @Event() ldChange!: EventEmitter<InputChangeEventDetail>;

  /**
   * 聚焦事件
   */
  @Event() ldFocus!: EventEmitter<InputFocusEventDetail>;

  /**
   * 失焦事件
   */
  @Event() ldBlur!: EventEmitter<InputFocusEventDetail>;

  /**
   * 回车事件
   */
  @Event() ldEnter!: EventEmitter<KeyboardEvent>;

  /**
   * 清空事件
   */
  @Event() ldClear!: EventEmitter<InputClearEventDetail>;

  /**
   * 密码可见性切换事件
   */
  @Event() ldPasswordVisibilityToggle!: EventEmitter<boolean>;

  // ==================== 生命周期方法 ====================

  componentWillLoad() {
    // 初始化内部值
    this.internalValue = this.value || this.defaultValue || '';
    this.currentLength = this.internalValue.length;

    // 创建防抖输入处理器
    this.debouncedInput = debounce((value: string) => {
      this.handleDebouncedInput(value);
    }, 300);
  }

  componentDidLoad() {
    // 自动聚焦
    if (this.autofocus && !this.disabled) {
      this.focusInput();
    }

    // 自动调整文本域高度
    if (this.type === 'textarea' && this.autosize) {
      this.adjustTextareaHeight();
    }
  }

  // ==================== 监听器 ====================

  @Watch('value')
  onValueChange(newValue: string) {
    if (newValue !== this.internalValue) {
      this.internalValue = newValue || '';
      this.currentLength = this.internalValue.length;

      if (this.type === 'textarea' && this.autosize) {
        this.adjustTextareaHeight();
      }
    }
  }

  @Watch('type')
  onTypeChange() {
    // 当类型改变时重置密码可见性
    if (this.type !== 'password') {
      this.passwordVisible = false;
    }
  }

  // ==================== 事件处理方法 ====================

  /**
   * 处理输入事件
   */
  private handleInput = (event: InputEvent) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;

    this.internalValue = value;
    this.currentLength = value.length;

    // 发射输入事件
    this.ldInput.emit({
      value,
      originalEvent: event,
      target,
    });

    // 防抖处理
    if (this.debouncedInput) {
      this.debouncedInput(value);
    }

    // 自动调整文本域高度
    if (this.type === 'textarea' && this.autosize) {
      this.adjustTextareaHeight();
    }

    // 如果是受控组件，更新 value
    if (this.value !== undefined) {
      this.value = value;
    }
  };

  /**
   * 处理防抖输入
   */
  private handleDebouncedInput(_value: string) {
    // 可以在这里处理需要防抖的逻辑，如验证等
  }

  /**
   * 处理变化事件
   */
  private handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    const oldValue = this.internalValue;

    this.ldChange.emit({
      value,
      oldValue,
      originalEvent: event,
      target,
    });
  };

  /**
   * 处理聚焦事件
   */
  private handleFocus = (event: FocusEvent) => {
    this.focused = true;
    this.ldFocus.emit({
      originalEvent: event,
      target: event.target as HTMLInputElement | HTMLTextAreaElement,
      direction: 'in',
    });
  };

  /**
   * 处理失焦事件
   */
  private handleBlur = (event: FocusEvent) => {
    this.focused = false;
    this.ldBlur.emit({
      originalEvent: event,
      target: event.target as HTMLInputElement | HTMLTextAreaElement,
      direction: 'out',
    });
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    // 回车键处理
    if (event.key === 'Enter') {
      this.ldEnter.emit(event);
    }

    // ESC 键清空（如果允许清空）
    if (event.key === 'Escape' && this.clearable && this.internalValue) {
      this.handleClear(event as any);
    }
  };

  /**
   * 处理清空事件
   */
  private handleClear = (event: MouseEvent) => {
    const oldValue = this.internalValue;
    this.internalValue = '';
    this.currentLength = 0;

    if (this.inputRef) {
      this.inputRef.value = '';
      this.inputRef.focus();
    }

    // 发射清空事件
    this.ldClear.emit({
      originalEvent: event,
      target: this.inputRef!,
    });

    // 发射变化事件
    this.ldChange.emit({
      value: '',
      oldValue,
      originalEvent: event as any,
      target: this.inputRef!,
    });

    // 如果是受控组件，更新 value
    if (this.value !== undefined) {
      this.value = '';
    }
  };

  /**
   * 处理密码可见性切换
   */
  private handlePasswordToggle = (event: MouseEvent) => {
    event.preventDefault();
    this.passwordVisible = !this.passwordVisible;
    this.ldPasswordVisibilityToggle.emit(this.passwordVisible);

    // 保持焦点
    if (this.inputRef) {
      this.inputRef.focus();
    }
  };

  // ==================== 工具方法 ====================

  /**
   * 聚焦输入框
   */
  private focusInput() {
    if (this.inputRef && !this.disabled) {
      this.inputRef.focus();
    }
  }

  /**
   * 自动调整文本域高度
   */
  private adjustTextareaHeight() {
    if (this.type !== 'textarea' || !this.inputRef) return;

    const textarea = this.inputRef as HTMLTextAreaElement;

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto';

    let height = textarea.scrollHeight;

    // 应用最小和最大行数限制
    if (this.minRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = this.minRows * lineHeight;
      height = Math.max(height, minHeight);
    }

    if (this.maxRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const maxHeight = this.maxRows * lineHeight;
      height = Math.min(height, maxHeight);
    }

    textarea.style.height = `${height}px`;
  }

  /**
   * 获取当前输入值
   */
  private getCurrentValue(): string {
    return this.value !== undefined ? this.value : this.internalValue;
  }

  /**
   * 获取实际输入类型
   */
  private getInputType(): string {
    if (this.type === 'password' && this.passwordVisible) {
      return 'text';
    }
    return this.type === 'textarea' ? 'text' : this.type;
  }

  /**
   * 生成输入框类名
   */
  private getInputClasses(): string {
    return classNames(
      'ld-input',
      `ld-input--${this.variant}`,
      `ld-input--${this.size}`,
      this.status && `ld-input--${this.status}`,
      this.disabled && 'ld-input--disabled',
      this.readonly && 'ld-input--readonly',
      this.focused && 'ld-input--focused',
      this.errorMessage && 'ld-input--error',
      (this.prefixIcon || this.prefixContent) && 'ld-input--has-prefix',
      (this.suffixIcon || this.suffix || this.clearable || this.showPassword) && 'ld-input--has-suffix',
      this.addonBefore && 'ld-input--has-addon-before',
      this.addonAfter && 'ld-input--has-addon-after',
      this.customClass
    );
  }

  /**
   * 生成输入框样式
   */
  private getInputStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {
      ...this.customStyle,
    };

    if (this.type === 'textarea' && !this.resize) {
      styles.resize = 'none';
    }

    return styles;
  }

  // ==================== 渲染方法 ====================

  /**
   * 渲染前置插件
   */
  private renderAddonBefore() {
    if (!this.addonBefore) return null;

    return (
      <div class="ld-input__addon ld-input__addon--before">
        {this.addonBefore}
      </div>
    );
  }

  /**
   * 渲染后置插件
   */
  private renderAddonAfter() {
    if (!this.addonAfter) return null;

    return (
      <div class="ld-input__addon ld-input__addon--after">
        {this.addonAfter}
      </div>
    );
  }

  /**
   * 渲染前缀
   */
  private renderPrefix() {
    if (!this.prefixIcon && !this.prefixContent) return null;

    return (
      <div class="ld-input__prefix">
        {this.prefixIcon && (
          <span class="ld-input__prefix-icon">
            <ld-icon name={this.prefixIcon} />
          </span>
        )}
        {this.prefixContent && (
          <span class="ld-input__prefix-text">{this.prefixContent}</span>
        )}
      </div>
    );
  }

  /**
   * 渲染后缀
   */
  private renderSuffix() {
    const hasAnySuffix = this.suffixIcon || this.suffix || this.clearable || this.showPassword || this.showCount;
    if (!hasAnySuffix) return null;

    return (
      <div class="ld-input__suffix">
        {this.suffix && (
          <span class="ld-input__suffix-text">{this.suffix}</span>
        )}
        {this.suffixIcon && (
          <span class="ld-input__suffix-icon">
            <ld-icon name={this.suffixIcon} />
          </span>
        )}
        {this.clearable && this.internalValue && !this.disabled && !this.readonly && (
          <button
            type="button"
            class="ld-input__clear"
            onClick={this.handleClear}
            aria-label="清空输入"
          >
            <ld-icon name="close-circle" />
          </button>
        )}
        {this.showPassword && this.type === 'password' && (
          <button
            type="button"
            class="ld-input__password-toggle"
            onClick={this.handlePasswordToggle}
            aria-label={this.passwordVisible ? '隐藏密码' : '显示密码'}
          >
            <ld-icon name={this.passwordVisible ? 'eye-invisible' : 'eye'} />
          </button>
        )}
        {this.showCount && this.maxlength && (
          <span class="ld-input__count">
            {this.currentLength}/{this.maxlength}
          </span>
        )}
      </div>
    );
  }

  /**
   * 渲染输入控件
   */
  private renderInput() {
    const commonProps = {
      ref: (el: HTMLInputElement | HTMLTextAreaElement) => this.inputRef = el,
      id: this.componentId,
      class: 'ld-input__control',
      value: this.getCurrentValue(),
      placeholder: this.placeholder,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      name: this.name,
      tabindex: this.tabindex,
      maxlength: this.maxlength,
      minlength: this.minlength,
      autocomplete: this.autocomplete,
      spellcheck: this.spellcheck,
      inputmode: this.inputmode,
      onInput: this.handleInput,
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onKeyDown: this.handleKeyDown,
      'aria-invalid': this.errorMessage ? 'true' : 'false',
      'aria-describedby': this.errorMessage ? `${this.componentId}-error` : undefined,
    };

    if (this.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={this.rows}
          style={{ resize: this.resize ? 'vertical' : 'none' }}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={this.getInputType()}
        min={this.min}
        max={this.max}
        step={this.step}
      />
    );
  }

  /**
   * 渲染错误消息
   */
  private renderErrorMessage() {
    if (!this.errorMessage) return null;

    return (
      <div id={`${this.componentId}-error`} class="ld-input__error" role="alert">
        {this.errorMessage}
      </div>
    );
  }

  /**
   * 渲染帮助文本
   */
  private renderHelpText() {
    if (!this.helpText || this.errorMessage) return null;

    return (
      <div class="ld-input__help">
        {this.helpText}
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div
          class={this.getInputClasses()}
          style={this.getInputStyles()}
        >
          {this.renderAddonBefore()}
          <div class="ld-input__wrapper">
            {this.renderPrefix()}
            {this.renderInput()}
            {this.renderSuffix()}
          </div>
          {this.renderAddonAfter()}
        </div>
        {this.renderErrorMessage()}
        {this.renderHelpText()}
      </Host>
    );
  }
}
