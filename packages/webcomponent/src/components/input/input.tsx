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
  @Prop() autosize: boolean | { minRows?: number; maxRows?: number } = false;

  /**
   * 输入框行数（仅对 textarea 有效）
   */
  @Prop() rows: number = 2;
  
  /**
   * 输入限制，只允许输入指定字符
   */
  @Prop() allowInput?: RegExp | ((value: string) => boolean);
  
  /**
   * 是否显示输入数量统计
   */
  @Prop() showCount: boolean = false;
  
  /**
   * 是否受控组件
   */
  @Prop() controlled: boolean = false;
  
  /**
   * 输入框的状态
   */
  @Prop() status?: 'error' | 'warning' | 'success';

  /**
   * 内部状态：是否显示密码
   */
  @State() showPasswordText: boolean = false;

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 组合输入标记（中文输入法等）
   */
  private isComposing = false;

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
   * 监听autosize属性变化
   */
  @Watch('autosize')
  watchAutosize() {
    if (this.type === 'textarea') {
      this.adjustTextareaHeight();
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    // Stencil会自动处理字符串到对象的转换，但有时候HTML属性可能仍为字符串
    const attrValue = this.host?.getAttribute('autosize');
    if (attrValue && attrValue !== 'false' && attrValue !== 'true') {
      try {
        this.autosize = JSON.parse(attrValue);
      } catch (e) {
        console.warn('Failed to parse autosize attribute:', attrValue);
      }
    }
    
    // 处理allowInput属性 - 当通过属性设置RegExp时需要特殊处理
    const allowInputAttr = this.host?.getAttribute('allow-input');
    if (allowInputAttr && typeof this.allowInput === 'string') {
      try {
        // 尝试将字符串转换为正则表达式
        // 支持 /pattern/flags 格式
        const match = allowInputAttr.match(/^\/(.*)\/(.*)?$/);
        if (match) {
          this.allowInput = new RegExp(match[1], match[2]);
        }
      } catch (e) {
        console.warn('Failed to parse allowInput attribute:', allowInputAttr);
      }
    }
    
    if (this.autosize && this.type === 'textarea') {
      setTimeout(() => this.adjustTextareaHeight(), 0);
    }
  }
  
  private host?: HTMLElement;

  /**
   * 处理输入事件
   */
  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    let newValue = target.value;

    // 组合输入过程不做强拦截，结束时统一校验
    if (!this.isComposing && this.allowInput) {
      let isValid = false;

      if (this.allowInput instanceof RegExp) {
        isValid = this.allowInput.test(newValue);
      } else if (typeof this.allowInput === 'function') {
        isValid = this.allowInput(newValue);
      }

      if (!isValid) {
        // 恢复之前的值
        target.value = this.value || '';
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    // 处理受控组件
    if (!this.controlled) {
      this.value = newValue;
    }

    this.ldesignInput.emit(newValue);

    if (this.autosize && this.type === 'textarea') {
      this.adjustTextareaHeight();
    }
  };

  /**
   * 在输入发生前进行拦截，防止非法字符进入
   */
  private handleBeforeInput = (event: InputEvent) => {
    if (!this.allowInput || this.isComposing) return;
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    const inputData = event.data ?? '';

    let proposedValue = target.value;

    switch (event.inputType) {
      case 'insertText':
      case 'insertCompositionText':
      case 'insertFromPaste':
      case 'insertFromDrop':
        proposedValue = target.value.slice(0, selectionStart) + inputData + target.value.slice(selectionEnd);
        break;
      case 'deleteContentBackward':
        if (selectionStart === selectionEnd) {
          proposedValue = target.value.slice(0, Math.max(0, selectionStart - 1)) + target.value.slice(selectionEnd);
        } else {
          proposedValue = target.value.slice(0, selectionStart) + target.value.slice(selectionEnd);
        }
        break;
      case 'deleteContentForward':
        if (selectionStart === selectionEnd) {
          proposedValue = target.value.slice(0, selectionStart) + target.value.slice(Math.min(target.value.length, selectionEnd + 1));
        } else {
          proposedValue = target.value.slice(0, selectionStart) + target.value.slice(selectionEnd);
        }
        break;
      default:
        // 其他类型默认放行，由 handleInput 进行兜底校验
        return;
    }

    let isValid = false;
    if (this.allowInput instanceof RegExp) {
      isValid = this.allowInput.test(proposedValue);
    } else if (typeof this.allowInput === 'function') {
      isValid = this.allowInput(proposedValue);
    }

    if (!isValid) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * 组合输入开始/结束
   */
  private handleCompositionStart = () => {
    this.isComposing = true;
  };
  private handleCompositionEnd = (event: CompositionEvent) => {
    this.isComposing = false;
    // 组合结束后做一次兜底校验
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (this.allowInput) {
      const value = target.value;
      let isValid = false;
      if (this.allowInput instanceof RegExp) {
        isValid = this.allowInput.test(value);
      } else if (typeof this.allowInput === 'function') {
        isValid = this.allowInput(value);
      }
      if (!isValid) {
        target.value = this.value || '';
        this.ldesignInput.emit(this.value || '');
      }
    }
  };

  /**
   * 粘贴/拖拽拦截
   */
  private handlePaste = (event: ClipboardEvent) => {
    if (!this.allowInput) return;
    const clipboard = event.clipboardData?.getData('text') ?? '';
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    const proposedValue = target.value.slice(0, selectionStart) + clipboard + target.value.slice(selectionEnd);

    let isValid = false;
    if (this.allowInput instanceof RegExp) {
      isValid = this.allowInput.test(proposedValue);
    } else if (typeof this.allowInput === 'function') {
      isValid = this.allowInput(proposedValue);
    }
    if (!isValid) {
      event.preventDefault();
      event.stopPropagation();
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
    if (!this.inputElement || this.type !== 'textarea') return;

    const textarea = this.inputElement as HTMLTextAreaElement;

    // 为了拿到准确的 scrollHeight，放到下一帧计算
    requestAnimationFrame(() => {
      // 先重置高度以获取正确的scrollHeight
      textarea.style.height = 'auto';
      // 不在这里隐藏，避免闪烁，由CSS负责

      // 计算内容高度
    const style = window.getComputedStyle(textarea);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
    const borderBottomWidth = parseFloat(style.borderBottomWidth) || 0;
    
    // 计算一行的高度
    // 创建一个临时元素来准确测量行高
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      line-height: ${style.lineHeight};
      padding: 0;
      border: 0;
    `;
    tempDiv.textContent = 'M';
    document.body.appendChild(tempDiv);
    const actualLineHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    let minHeight = actualLineHeight * this.rows + paddingTop + paddingBottom;
    let maxHeight = Infinity;
    
    // 处理autosize配置
    if (typeof this.autosize === 'object' && this.autosize !== null) {
      const minRows = this.autosize.minRows || this.rows;
      const maxRows = this.autosize.maxRows;
      
      minHeight = actualLineHeight * minRows + paddingTop + paddingBottom;
      if (maxRows) {
        maxHeight = actualLineHeight * maxRows + paddingTop + paddingBottom;
      }
    }
    
    // 获取内容高度
    const scrollHeight = textarea.scrollHeight;
    const contentHeight = scrollHeight - borderTopWidth - borderBottomWidth;
    
    // 计算最终高度
    let newHeight = Math.max(contentHeight, minHeight);
    if (maxHeight !== Infinity) {
      newHeight = Math.min(newHeight, maxHeight);
    }

    // 设置高度
    textarea.style.height = `${newHeight}px`;

    // 始终保持overflowY为auto，CSS会处理滚动条的显示
    // 当内容不超出时，浏览器自动隐藏滚动条
    textarea.style.overflowY = 'auto';

    // 调试信息
    if (typeof this.autosize === 'object' && this.autosize !== null) {
      
    }
    });
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
    
    if (this.status) {
      classes.push(`ldesign-input-wrapper--${this.status}`);
    }
    
    if (this.type === 'textarea') {
      classes.push('ldesign-input-wrapper--textarea');
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

    // 清空按钮（不适用于textarea）
    if (this.clearable && this.value && !this.disabled && !this.readonly && this.type !== 'textarea') {
      icons.push(
        <span 
          key="clear"
          class="ldesign-input__clear" 
          onClick={this.handleClear}
          onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
        >
          <ldesign-icon name="x" size="small" />
        </span>
      );
    }

    // 密码切换按钮
    if (this.showPassword && this.type === 'password' && !this.disabled && !this.readonly) {
      icons.push(
        <span 
          key="password"
          class="ldesign-input__password" 
          onClick={this.togglePasswordVisibility}
          onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
        >
          <ldesign-icon name={this.showPasswordText ? 'eye-off' : 'eye'} size="small" />
        </span>
      );
    }

    // 后缀图标
    if (this.suffixIcon && !this.clearable && (!this.showPassword || this.type !== 'password')) {
      icons.push(
        <span key="suffix" class="ldesign-input__suffix">
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
      onBeforeInput: this.handleBeforeInput as any,
      onPaste: this.handlePaste,
      onInput: this.handleInput,
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onCompositionStart: this.handleCompositionStart,
      onCompositionEnd: this.handleCompositionEnd,
    };

    if (this.type === 'textarea') {
      const textareaClass = [
        this.getInputClass(),
        'ldesign-input--textarea',
        this.autosize ? 'ldesign-input--autosize' : ''
      ].filter(Boolean).join(' ');
      
      return (
        <textarea
          {...commonProps}
          class={textareaClass}
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

  /**
   * 渲染字数统计
   */
  private renderCount() {
    if (!this.showCount || !this.maxlength) return null;
    
    const currentLength = this.value?.length || 0;
    
    return (
      <span class="ldesign-input__count">
        {currentLength}/{this.maxlength}
      </span>
    );
  }
  
  /**
   * 渲染输入框主体
   */
  private renderInputWrapper() {
    return (
      <div class={this.getWrapperClass()}>
        {this.renderPrefixIcon()}
        {this.renderInput()}
        {this.renderSuffixIcon()}
      </div>
    );
  }

  render() {
    return (
      <Host
        ref={(el) => this.host = el}
        style={{
          display: 'inline-block',
          width: '100%'
        }}
      >
        {this.renderInputWrapper()}
        <slot name="prepend" />
        <slot name="append" />
        {this.renderCount()}
      </Host>
    );
  }
}
