import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { generateId } from '../../utils';

/**
 * Form 表单组件
 * 
 * 用于收集、验证和提交用户输入数据的表单组件
 * 
 * @example
 * ```tsx
 * <ld-form model={formData} rules={formRules}>
 *   <ld-form-item label="用户名" prop="username">
 *     <ld-input v-model={formData.username}></ld-input>
 *   </ld-form-item>
 * </ld-form>
 * ```
 */
@Component({
  tag: 'ld-form',
  styleUrl: 'form.less',
  shadow: true,
})
export class Form {
  @Element() el!: HTMLElement;

  /**
   * 表单数据模型
   */
  @Prop() model: FormModel = {};

  /**
   * 表单验证规则
   */
  @Prop() rules: FormRules = {};

  /**
   * 表单布局方式
   */
  @Prop() layout: 'horizontal' | 'vertical' | 'inline' = 'horizontal';

  /**
   * 标签对齐方式
   */
  @Prop() labelAlign: 'left' | 'right' | 'top' = 'right';

  /**
   * 标签宽度
   */
  @Prop() labelWidth?: string | number;

  /**
   * 表单尺寸
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * 是否禁用整个表单
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否只读
   */
  @Prop() readonly: boolean = false;

  /**
   * 是否显示必填标记
   */
  @Prop() showRequiredMark: boolean = true;

  /**
   * 是否显示验证图标
   */
  @Prop() showValidateIcon: boolean = true;

  /**
   * 验证触发方式
   */
  @Prop() validateTrigger: 'change' | 'blur' | 'submit' = 'change';

  /**
   * 是否在验证失败时滚动到第一个错误字段
   */
  @Prop() scrollToError: boolean = true;

  /**
   * 自定义样式类名
   */
  @Prop() customClass?: string;

  /**
   * 内部状态：表单字段
   */
  @State() formItems: Map<string, FormItemInstance> = new Map();

  /**
   * 内部状态：验证状态
   */
  @State() validateStatus: FormValidateStatus = {};

  /**
   * 内部状态：表单 ID
   */
  @State() formId: string = generateId('form');

  /**
   * 表单提交事件
   */
  @Event() ldSubmit!: EventEmitter<FormSubmitEvent>;

  /**
   * 表单重置事件
   */
  @Event() ldReset!: EventEmitter<FormResetEvent>;

  /**
   * 表单验证事件
   */
  @Event() ldValidate!: EventEmitter<FormValidateEvent>;

  /**
   * 字段值变化事件
   */
  @Event() ldFieldChange!: EventEmitter<FormFieldChangeEvent>;

  /**
   * 监听模型变化
   */
  @Watch('model')
  onModelChange(newModel: FormModel, oldModel: FormModel) {
    if (newModel !== oldModel) {
      this.validateForm();
    }
  }

  /**
   * 监听规则变化
   */
  @Watch('rules')
  onRulesChange() {
    this.validateForm();
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.setupFormItems();
  }

  /**
   * 验证整个表单
   */
  @Method()
  async validate(): Promise<FormValidateResult> {
    const results: FormFieldValidateResult[] = [];

    for (const [prop] of this.formItems) {
      const result = await this.validateField(prop);
      results.push(result);
    }

    const isValid = results.every(result => result.valid);
    const errors = results.filter(result => !result.valid);

    const validateResult: FormValidateResult = {
      valid: isValid,
      errors,
      values: { ...this.model },
    };

    this.ldValidate.emit({
      result: validateResult,
      model: this.model,
    });

    if (!isValid && this.scrollToError) {
      this.scrollToFirstError();
    }

    return validateResult;
  }

  /**
   * 验证指定字段
   */
  @Method()
  async validateField(prop: string): Promise<FormFieldValidateResult> {
    const rules = this.rules[prop];
    const value = this.model[prop];
    const item = this.formItems.get(prop);

    if (!rules || !item) {
      return { prop, valid: true, value };
    }

    const ruleArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of ruleArray) {
      const result = await this.validateRule(prop, value, rule);
      if (!result.valid) {
        this.updateValidateStatus(prop, 'error', result.message);
        return result;
      }
    }

    this.updateValidateStatus(prop, 'success');
    return { prop, valid: true, value };
  }

  /**
   * 清除验证状态
   */
  @Method()
  async clearValidate(props?: string[]): Promise<void> {
    const targetProps = props || Array.from(this.formItems.keys());

    targetProps.forEach(prop => {
      this.updateValidateStatus(prop, 'none');
    });
  }

  /**
   * 重置表单
   */
  @Method()
  async resetForm(): Promise<void> {
    // 重置表单数据
    Object.keys(this.model).forEach(key => {
      this.model[key] = undefined;
    });

    // 清除验证状态
    await this.clearValidate();

    this.ldReset.emit({
      model: this.model,
    });
  }

  /**
   * 提交表单
   */
  @Method()
  async submitForm(): Promise<void> {
    const result = await this.validate();

    this.ldSubmit.emit({
      valid: result.valid,
      values: result.values,
      errors: result.errors,
    });
  }

  /**
   * 注册表单项
   */
  @Method()
  async registerFormItem(prop: string, item: FormItemInstance): Promise<void> {
    this.formItems.set(prop, item);
    this.formItems = new Map(this.formItems);
  }

  /**
   * 注销表单项
   */
  @Method()
  async unregisterFormItem(prop: string): Promise<void> {
    this.formItems.delete(prop);
    this.formItems = new Map(this.formItems);
  }

  /**
   * 设置字段值
   */
  @Method()
  async setFieldValue(prop: string, value: any): Promise<void> {
    this.model[prop] = value;
    this.model = { ...this.model };

    this.ldFieldChange.emit({
      prop,
      value,
      model: this.model,
    });

    if (this.validateTrigger === 'change') {
      await this.validateField(prop);
    }
  }

  /**
   * 获取字段值
   */
  @Method()
  async getFieldValue(prop: string): Promise<any> {
    return this.model[prop];
  }

  /**
   * 设置表单数据
   */
  @Method()
  async setFormData(data: FormModel): Promise<void> {
    this.model = { ...data };
  }

  /**
   * 获取表单数据
   */
  @Method()
  async getFormData(): Promise<FormModel> {
    return { ...this.model };
  }

  /**
   * 验证单个规则
   */
  private async validateRule(prop: string, value: any, rule: FormRule): Promise<FormFieldValidateResult> {
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        prop,
        valid: false,
        value,
        message: rule.message || `${prop} 是必填项`,
      };
    }

    // 如果值为空且不是必填，则跳过其他验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { prop, valid: true, value };
    }

    // 类型验证
    if (rule.type && !this.validateType(value, rule.type)) {
      return {
        prop,
        valid: false,
        value,
        message: rule.message || `${prop} 类型不正确`,
      };
    }

    // 长度验证
    if (rule.min !== undefined || rule.max !== undefined) {
      const length = this.getValueLength(value);
      if (rule.min !== undefined && length < rule.min) {
        return {
          prop,
          valid: false,
          value,
          message: rule.message || `${prop} 长度不能少于 ${rule.min}`,
        };
      }
      if (rule.max !== undefined && length > rule.max) {
        return {
          prop,
          valid: false,
          value,
          message: rule.message || `${prop} 长度不能超过 ${rule.max}`,
        };
      }
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return {
        prop,
        valid: false,
        value,
        message: rule.message || `${prop} 格式不正确`,
      };
    }

    // 自定义验证
    if (rule.validator) {
      try {
        const result = await rule.validator(value, this.model);
        if (result !== true) {
          return {
            prop,
            valid: false,
            value,
            message: typeof result === 'string' ? result : rule.message || `${prop} 验证失败`,
          };
        }
      } catch (error) {
        return {
          prop,
          valid: false,
          value,
          message: rule.message || `${prop} 验证出错`,
        };
      }
    }

    return { prop, valid: true, value };
  }

  /**
   * 验证数据类型
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      case 'url':
        try {
          new URL(String(value));
          return true;
        } catch {
          return false;
        }
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(String(value)));
      default:
        return true;
    }
  }

  /**
   * 获取值的长度
   */
  private getValueLength(value: any): number {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    if (typeof value === 'number') {
      return String(value).length;
    }
    return 0;
  }

  /**
   * 更新验证状态
   */
  private updateValidateStatus(prop: string, status: 'none' | 'validating' | 'success' | 'error', message?: string) {
    this.validateStatus = {
      ...this.validateStatus,
      [prop]: { status, message },
    };
  }

  /**
   * 滚动到第一个错误字段
   */
  private scrollToFirstError() {
    const firstErrorProp = Object.keys(this.validateStatus).find(
      prop => this.validateStatus[prop].status === 'error'
    );

    if (firstErrorProp) {
      const item = this.formItems.get(firstErrorProp);
      if (item && item.element) {
        item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  /**
   * 设置表单项
   */
  private setupFormItems() {
    // 查找所有表单项
    const formItems = this.el.querySelectorAll('ld-form-item');
    formItems.forEach(item => {
      const prop = item.getAttribute('prop');
      if (prop) {
        this.formItems.set(prop, {
          element: item as HTMLElement,
          prop,
        });
      }
    });
    this.formItems = new Map(this.formItems);
  }

  /**
   * 验证整个表单
   */
  private async validateForm() {
    if (this.validateTrigger === 'change') {
      const props = Array.from(this.formItems.keys());
      for (const prop of props) {
        await this.validateField(prop);
      }
    }
  }

  /**
   * 获取表单样式
   */
  private getFormStyle() {
    const style: any = {};

    if (this.labelWidth) {
      if (typeof this.labelWidth === 'number') {
        style['--ld-form-label-width'] = `${this.labelWidth}px`;
      } else {
        style['--ld-form-label-width'] = this.labelWidth;
      }
    }

    return style;
  }

  /**
   * 处理表单提交
   */
  private handleSubmit = async (event: Event) => {
    event.preventDefault();
    await this.submitForm();
  };

  /**
   * 处理表单重置
   */
  private handleReset = async (event: Event) => {
    event.preventDefault();
    await this.resetForm();
  };

  render() {
    const formClass = {
      'ld-form': true,
      [`ld-form--${this.layout}`]: true,
      [`ld-form--${this.size}`]: true,
      [`ld-form--label-${this.labelAlign}`]: true,
      'ld-form--disabled': this.disabled,
      'ld-form--readonly': this.readonly,
      [this.customClass]: !!this.customClass,
    };

    return (
      <Host>
        <form
          class={formClass}
          style={this.getFormStyle()}
          onSubmit={this.handleSubmit}
          onReset={this.handleReset}
          id={this.formId}
        >
          <slot />
        </form>
      </Host>
    );
  }
}

// 类型定义
export interface FormModel {
  [key: string]: any;
}

export interface FormRules {
  [key: string]: FormRule | FormRule[];
}

export interface FormRule {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (value: any, model: FormModel) => boolean | string | Promise<boolean | string>;
  trigger?: 'change' | 'blur';
}

export interface FormValidateStatus {
  [key: string]: {
    status: 'none' | 'validating' | 'success' | 'error';
    message?: string;
  };
}

export interface FormItemInstance {
  element: HTMLElement;
  prop: string;
}

export interface FormFieldValidateResult {
  prop: string;
  valid: boolean;
  value: any;
  message?: string;
}

export interface FormValidateResult {
  valid: boolean;
  errors: FormFieldValidateResult[];
  values: FormModel;
}

export interface FormSubmitEvent {
  valid: boolean;
  values: FormModel;
  errors: FormFieldValidateResult[];
}

export interface FormResetEvent {
  model: FormModel;
}

export interface FormValidateEvent {
  result: FormValidateResult;
  model: FormModel;
}

export interface FormFieldChangeEvent {
  prop: string;
  value: any;
  model: FormModel;
}
