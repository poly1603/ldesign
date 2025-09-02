import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';

/**
 * FormItem 表单项组件
 * 
 * 表单中的单个字段容器，提供标签、验证状态显示等功能
 * 
 * @example
 * ```tsx
 * <ld-form-item label="用户名" prop="username" required>
 *   <ld-input></ld-input>
 * </ld-form-item>
 * ```
 */
@Component({
  tag: 'ld-form-item',
  styleUrl: 'form-item.less',
  shadow: true,
})
export class FormItem {
  @Element() el!: HTMLElement;

  /**
   * 字段标签
   */
  @Prop() label?: string;

  /**
   * 字段属性名
   */
  @Prop() prop?: string;

  /**
   * 是否必填
   */
  @Prop() required: boolean = false;

  /**
   * 验证规则
   */
  @Prop() rules?: FormItemRule | FormItemRule[];

  /**
   * 标签宽度
   */
  @Prop() labelWidth?: string | number;

  /**
   * 标签对齐方式
   */
  @Prop() labelAlign?: 'left' | 'right' | 'top';

  /**
   * 帮助文本
   */
  @Prop() help?: string;

  /**
   * 验证状态
   */
  @Prop() validateStatus?: 'validating' | 'success' | 'error';

  /**
   * 验证消息
   */
  @Prop() validateMessage?: string;

  /**
   * 是否显示验证图标
   */
  @Prop() showValidateIcon: boolean = true;

  /**
   * 自定义样式类名
   */
  @Prop() customClass?: string;

  /**
   * 内部状态：表单实例
   */
  @State() formInstance?: HTMLElement;

  /**
   * 内部状态：验证状态
   */
  @State() internalValidateStatus?: 'validating' | 'success' | 'error';

  /**
   * 内部状态：验证消息
   */
  @State() internalValidateMessage?: string;

  /**
   * 验证状态变化事件
   */
  @Event() ldValidateStatusChange!: EventEmitter<FormItemValidateEvent>;

  /**
   * 监听验证状态变化
   */
  @Watch('validateStatus')
  onValidateStatusChange(newStatus?: string) {
    this.internalValidateStatus = newStatus as any;
  }

  /**
   * 监听验证消息变化
   */
  @Watch('validateMessage')
  onValidateMessageChange(newMessage?: string) {
    this.internalValidateMessage = newMessage;
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.findFormInstance();
    this.registerToForm();
    this.setupFieldListeners();
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    this.unregisterFromForm();
  }

  /**
   * 验证字段
   */
  @Method()
  async validate(): Promise<FormItemValidateResult> {
    if (!this.formInstance || !this.prop) {
      return { valid: true, prop: this.prop || '', value: undefined };
    }

    return await (this.formInstance as any).validateField(this.prop);
  }

  /**
   * 清除验证状态
   */
  @Method()
  async clearValidate(): Promise<void> {
    this.internalValidateStatus = undefined;
    this.internalValidateMessage = undefined;
  }

  /**
   * 设置验证状态
   */
  @Method()
  async setValidateStatus(status: 'validating' | 'success' | 'error', message?: string): Promise<void> {
    this.internalValidateStatus = status;
    this.internalValidateMessage = message;

    this.ldValidateStatusChange.emit({
      prop: this.prop || '',
      status,
      message,
    });
  }

  /**
   * 查找表单实例
   */
  private findFormInstance() {
    let parent = this.el.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'ld-form') {
        this.formInstance = parent as HTMLElement;
        break;
      }
      parent = parent.parentElement;
    }
  }

  /**
   * 注册到表单
   */
  private async registerToForm() {
    if (this.formInstance && this.prop) {
      await (this.formInstance as any).registerFormItem(this.prop, {
        element: this.el,
        prop: this.prop,
      });
    }
  }

  /**
   * 从表单注销
   */
  private async unregisterFromForm() {
    if (this.formInstance && this.prop) {
      await (this.formInstance as any).unregisterFormItem(this.prop);
    }
  }

  /**
   * 设置字段监听器
   */
  private setupFieldListeners() {
    // 监听表单控件的值变化
    const controls = this.el.querySelectorAll('ld-input, ld-textarea, ld-select, ld-checkbox, ld-radio, ld-switch');

    controls.forEach(control => {
      control.addEventListener('ldChange', this.handleFieldChange);
      control.addEventListener('ldBlur', this.handleFieldBlur);
    });
  }

  /**
   * 处理字段值变化
   */
  private handleFieldChange = async (event: CustomEvent) => {
    if (!this.formInstance || !this.prop) return;

    const value = event.detail;
    await (this.formInstance as any).setFieldValue(this.prop, value);
  };

  /**
   * 处理字段失焦
   */
  private handleFieldBlur = async () => {
    if (!this.formInstance || !this.prop) return;

    // 如果表单设置为失焦时验证，则触发验证
    const validateTrigger = (this.formInstance as any).validateTrigger;
    if (validateTrigger === 'blur') {
      await this.validate();
    }
  };

  /**
   * 获取标签样式
   */
  private getLabelStyle() {
    const style: any = {};

    if (this.labelWidth) {
      if (typeof this.labelWidth === 'number') {
        style.width = `${this.labelWidth}px`;
      } else {
        style.width = this.labelWidth;
      }
    }

    if (this.labelAlign) {
      style.textAlign = this.labelAlign;
    }

    return style;
  }

  /**
   * 获取当前验证状态
   */
  private getCurrentValidateStatus() {
    return this.validateStatus || this.internalValidateStatus;
  }

  /**
   * 获取当前验证消息
   */
  private getCurrentValidateMessage() {
    return this.validateMessage || this.internalValidateMessage;
  }

  /**
   * 渲染标签
   */
  private renderLabel() {
    if (!this.label) {
      return null;
    }

    const labelClass = {
      'ld-form-item__label': true,
      'ld-form-item__label--required': this.required,
    };

    return (
      <label class={labelClass} style={this.getLabelStyle()}>
        {this.label}
      </label>
    );
  }

  /**
   * 渲染验证图标
   */
  private renderValidateIcon() {
    if (!this.showValidateIcon) {
      return null;
    }

    const status = this.getCurrentValidateStatus();
    if (!status) {
      return null;
    }

    const iconClass = {
      'ld-form-item__validate-icon': true,
      [`ld-form-item__validate-icon--${status}`]: true,
    };

    let icon = '';
    switch (status) {
      case 'success':
        icon = '✓';
        break;
      case 'error':
        icon = '✗';
        break;
      case 'validating':
        icon = '⟳';
        break;
    }

    return <span class={iconClass}>{icon}</span>;
  }

  /**
   * 渲染验证消息
   */
  private renderValidateMessage() {
    const message = this.getCurrentValidateMessage();
    const status = this.getCurrentValidateStatus();

    if (!message) {
      return null;
    }

    const messageClass = {
      'ld-form-item__message': true,
      [`ld-form-item__message--${status}`]: !!status,
    };

    return <div class={messageClass}>{message}</div>;
  }

  /**
   * 渲染帮助文本
   */
  private renderHelp() {
    if (!this.help) {
      return null;
    }

    return <div class="ld-form-item__help">{this.help}</div>;
  }

  render() {
    const status = this.getCurrentValidateStatus();

    const itemClass = {
      'ld-form-item': true,
      [`ld-form-item--${status}`]: !!status,
      [this.customClass]: !!this.customClass,
    };

    return (
      <Host>
        <div class={itemClass}>
          {this.renderLabel()}
          <div class="ld-form-item__content">
            <div class="ld-form-item__control">
              <slot />
              {this.renderValidateIcon()}
            </div>
            {this.renderValidateMessage()}
            {this.renderHelp()}
          </div>
        </div>
      </Host>
    );
  }
}

// 类型定义
export interface FormItemRule {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (value: any, model: any) => boolean | string | Promise<boolean | string>;
  trigger?: 'change' | 'blur';
}

export interface FormItemValidateResult {
  valid: boolean;
  prop: string;
  value: any;
  message?: string;
}

export interface FormItemValidateEvent {
  prop: string;
  status: 'validating' | 'success' | 'error';
  message?: string;
}
