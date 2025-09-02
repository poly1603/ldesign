/**
 * Form 表单组件类型定义
 */

/**
 * 表单数据模型接口
 */
export interface FormModel {
  /**
   * 表单字段数据
   */
  [key: string]: any;
}

/**
 * 表单验证规则接口
 */
export interface FormRules {
  /**
   * 字段验证规则
   */
  [key: string]: FormRule | FormRule[];
}

/**
 * 单个验证规则接口
 */
export interface FormRule {
  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 数据类型
   */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date';

  /**
   * 最小长度/值
   */
  min?: number;

  /**
   * 最大长度/值
   */
  max?: number;

  /**
   * 正则表达式验证
   */
  pattern?: RegExp;

  /**
   * 验证失败消息
   */
  message?: string;

  /**
   * 自定义验证器
   */
  validator?: (value: any, model: FormModel) => boolean | string | Promise<boolean | string>;

  /**
   * 验证触发时机
   */
  trigger?: 'change' | 'blur';

  /**
   * 验证时机
   */
  when?: 'always' | 'dirty' | 'touched';

  /**
   * 依赖字段
   */
  dependencies?: string[];

  /**
   * 转换函数
   */
  transform?: (value: any) => any;
}

/**
 * 表单验证状态接口
 */
export interface FormValidateStatus {
  /**
   * 字段验证状态
   */
  [key: string]: {
    /**
     * 验证状态
     */
    status: 'none' | 'validating' | 'success' | 'error';

    /**
     * 验证消息
     */
    message?: string;
  };
}

/**
 * 表单项实例接口
 */
export interface FormItemInstance {
  /**
   * 表单项元素
   */
  element: HTMLElement;

  /**
   * 字段属性名
   */
  prop: string;

  /**
   * 验证方法
   */
  validate?: () => Promise<FormFieldValidateResult>;

  /**
   * 清除验证方法
   */
  clearValidate?: () => Promise<void>;
}

/**
 * 字段验证结果接口
 */
export interface FormFieldValidateResult {
  /**
   * 字段属性名
   */
  prop: string;

  /**
   * 是否验证通过
   */
  valid: boolean;

  /**
   * 字段值
   */
  value: any;

  /**
   * 验证消息
   */
  message?: string;
}

/**
 * 表单验证结果接口
 */
export interface FormValidateResult {
  /**
   * 是否验证通过
   */
  valid: boolean;

  /**
   * 验证错误列表
   */
  errors: FormFieldValidateResult[];

  /**
   * 表单数据
   */
  values: FormModel;
}

/**
 * 表单属性接口
 */
export interface FormProps {
  /**
   * 表单数据模型
   */
  model?: FormModel;

  /**
   * 表单验证规则
   */
  rules?: FormRules;

  /**
   * 表单布局方式
   */
  layout?: 'horizontal' | 'vertical' | 'inline';

  /**
   * 标签对齐方式
   */
  labelAlign?: 'left' | 'right' | 'top';

  /**
   * 标签宽度
   */
  labelWidth?: string | number;

  /**
   * 表单尺寸
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 是否禁用整个表单
   */
  disabled?: boolean;

  /**
   * 是否只读
   */
  readonly?: boolean;

  /**
   * 是否显示必填标记
   */
  showRequiredMark?: boolean;

  /**
   * 是否显示验证图标
   */
  showValidateIcon?: boolean;

  /**
   * 验证触发方式
   */
  validateTrigger?: 'change' | 'blur' | 'submit';

  /**
   * 是否在验证失败时滚动到第一个错误字段
   */
  scrollToError?: boolean;

  /**
   * 自定义样式类名
   */
  customClass?: string;
}

/**
 * 表单事件接口
 */
export interface FormEvents {
  /**
   * 表单提交事件
   */
  ldSubmit: (event: FormSubmitEvent) => void;

  /**
   * 表单重置事件
   */
  ldReset: (event: FormResetEvent) => void;

  /**
   * 表单验证事件
   */
  ldValidate: (event: FormValidateEvent) => void;

  /**
   * 字段值变化事件
   */
  ldFieldChange: (event: FormFieldChangeEvent) => void;

  /**
   * 字段验证事件
   */
  ldFieldValidate: (event: FormFieldValidateEvent) => void;

  /**
   * 表单状态变化事件
   */
  ldFormStateChange: (event: FormStateChangeEvent) => void;
}

/**
 * 表单方法接口
 */
export interface FormMethods {
  /**
   * 验证整个表单
   */
  validate(): Promise<FormValidateResult>;

  /**
   * 验证指定字段
   */
  validateField(prop: string): Promise<FormFieldValidateResult>;

  /**
   * 清除验证状态
   */
  clearValidate(props?: string[]): Promise<void>;

  /**
   * 重置表单
   */
  resetForm(): Promise<void>;

  /**
   * 提交表单
   */
  submitForm(): Promise<void>;

  /**
   * 注册表单项
   */
  registerFormItem(prop: string, item: FormItemInstance): Promise<void>;

  /**
   * 注销表单项
   */
  unregisterFormItem(prop: string): Promise<void>;

  /**
   * 设置字段值
   */
  setFieldValue(prop: string, value: any): Promise<void>;

  /**
   * 获取字段值
   */
  getFieldValue(prop: string): Promise<any>;

  /**
   * 设置表单数据
   */
  setFormData(data: FormModel): Promise<void>;

  /**
   * 获取表单数据
   */
  getFormData(): Promise<FormModel>;

  /**
   * 获取表单状态
   */
  getFormState(): Promise<FormState>;

  /**
   * 重置字段
   */
  resetField(prop: string): Promise<void>;

  /**
   * 获取验证状态
   */
  getValidateStatus(): Promise<FormValidateStatus>;
}

/**
 * 表单提交事件接口
 */
export interface FormSubmitEvent {
  /**
   * 是否验证通过
   */
  valid: boolean;

  /**
   * 表单数据
   */
  values: FormModel;

  /**
   * 验证错误列表
   */
  errors: FormFieldValidateResult[];
}

/**
 * 表单重置事件接口
 */
export interface FormResetEvent {
  /**
   * 表单数据
   */
  model: FormModel;
}

/**
 * 表单验证事件接口
 */
export interface FormValidateEvent {
  /**
   * 验证结果
   */
  result: FormValidateResult;

  /**
   * 表单数据
   */
  model: FormModel;
}

/**
 * 字段值变化事件接口
 */
export interface FormFieldChangeEvent {
  /**
   * 字段属性名
   */
  prop: string;

  /**
   * 字段值
   */
  value: any;

  /**
   * 表单数据
   */
  model: FormModel;
}

/**
 * 字段验证事件接口
 */
export interface FormFieldValidateEvent {
  /**
   * 字段属性名
   */
  prop: string;

  /**
   * 验证结果
   */
  result: FormFieldValidateResult;
}

/**
 * 表单状态变化事件接口
 */
export interface FormStateChangeEvent {
  /**
   * 表单状态
   */
  state: FormState;

  /**
   * 变化的字段
   */
  changedFields: string[];
}

/**
 * 表单项属性接口
 */
export interface FormItemProps {
  /**
   * 字段标签
   */
  label?: string;

  /**
   * 字段属性名
   */
  prop?: string;

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 验证规则
   */
  rules?: FormRule | FormRule[];

  /**
   * 标签宽度
   */
  labelWidth?: string | number;

  /**
   * 标签对齐方式
   */
  labelAlign?: 'left' | 'right' | 'top';

  /**
   * 帮助文本
   */
  help?: string;

  /**
   * 验证状态
   */
  validateStatus?: 'validating' | 'success' | 'error';

  /**
   * 验证消息
   */
  validateMessage?: string;

  /**
   * 是否显示验证图标
   */
  showValidateIcon?: boolean;

  /**
   * 自定义样式类名
   */
  customClass?: string;
}

/**
 * 表单项事件接口
 */
export interface FormItemEvents {
  /**
   * 验证状态变化事件
   */
  ldValidateStatusChange: (event: FormItemValidateEvent) => void;
}

/**
 * 表单项方法接口
 */
export interface FormItemMethods {
  /**
   * 验证字段
   */
  validate(): Promise<FormFieldValidateResult>;

  /**
   * 清除验证状态
   */
  clearValidate(): Promise<void>;

  /**
   * 设置验证状态
   */
  setValidateStatus(status: 'validating' | 'success' | 'error', message?: string): Promise<void>;
}

/**
 * 表单项验证事件接口
 */
export interface FormItemValidateEvent {
  /**
   * 字段属性名
   */
  prop: string;

  /**
   * 验证状态
   */
  status: 'validating' | 'success' | 'error';

  /**
   * 验证消息
   */
  message?: string;
}

/**
 * 表单状态接口
 */
export interface FormState {
  /**
   * 是否有效
   */
  valid: boolean;

  /**
   * 是否脏数据
   */
  dirty: boolean;

  /**
   * 是否已触摸
   */
  touched: boolean;

  /**
   * 是否正在验证
   */
  validating: boolean;

  /**
   * 错误数量
   */
  errorCount: number;

  /**
   * 已修改的字段
   */
  modifiedFields: string[];

  /**
   * 已验证的字段
   */
  validatedFields: string[];
}

/**
 * 表单插槽接口
 */
export interface FormSlots {
  /**
   * 默认插槽 - 表单内容
   */
  default: any;

  /**
   * 表单底部插槽
   */
  footer: any;
}

/**
 * 表单项插槽接口
 */
export interface FormItemSlots {
  /**
   * 默认插槽 - 表单控件
   */
  default: any;

  /**
   * 标签插槽
   */
  label: any;

  /**
   * 帮助文本插槽
   */
  help: any;

  /**
   * 验证消息插槽
   */
  message: any;
}
