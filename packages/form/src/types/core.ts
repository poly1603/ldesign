/**
 * 核心类型定义
 * 
 * @description
 * 定义框架无关的核心类型，包括表单状态、字段状态、验证器等基础类型
 */

/**
 * 表单状态枚举
 */
export enum FormState {
  /** 未修改状态 */
  PRISTINE = 'pristine',
  /** 已修改状态 */
  DIRTY = 'dirty',
  /** 有效状态 */
  VALID = 'valid',
  /** 无效状态 */
  INVALID = 'invalid',
  /** 验证中状态 */
  PENDING = 'pending',
  /** 已提交状态 */
  SUBMITTED = 'submitted'
}

/**
 * 字段状态枚举
 */
export enum FieldState {
  /** 未修改状态 */
  PRISTINE = 'pristine',
  /** 已修改状态 */
  DIRTY = 'dirty',
  /** 已触摸状态 */
  TOUCHED = 'touched',
  /** 有效状态 */
  VALID = 'valid',
  /** 无效状态 */
  INVALID = 'invalid',
  /** 验证中状态 */
  PENDING = 'pending'
}

/**
 * 验证触发时机
 */
export enum ValidationTrigger {
  /** 值变化时验证 */
  CHANGE = 'change',
  /** 失去焦点时验证 */
  BLUR = 'blur',
  /** 提交时验证 */
  SUBMIT = 'submit',
  /** 手动触发验证 */
  MANUAL = 'manual'
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误消息 */
  message?: string;
  /** 错误代码 */
  code?: string;
  /** 额外数据 */
  data?: any;
}

/**
 * 验证器函数类型
 */
export type ValidatorFunction<T = any> = (
  value: T,
  context: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

/**
 * 验证上下文
 */
export interface ValidationContext {
  /** 字段名称 */
  fieldName: string;
  /** 表单数据 */
  formData: Record<string, any>;
  /** 字段配置 */
  fieldConfig: FieldConfig;
  /** 表单实例 */
  form: FormInstance;
}

/**
 * 验证规则配置
 */
export interface ValidationRule {
  /** 验证器函数或内置验证器名称 */
  validator: string | ValidatorFunction;
  /** 错误消息 */
  message?: string;
  /** 验证触发时机 */
  trigger?: ValidationTrigger | ValidationTrigger[];
  /** 是否在第一个错误后停止验证 */
  stopOnFirstError?: boolean;
  /** 验证器参数 */
  params?: Record<string, any>;
}

/**
 * 字段配置接口
 */
export interface FieldConfig {
  /** 字段名称 */
  name: string;
  /** 字段标签 */
  label?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 初始值 */
  initialValue?: any;
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 字段类型 */
  type?: string;
  /** 额外配置 */
  meta?: Record<string, any>;
}

/**
 * 表单配置接口
 */
export interface FormConfig {
  /** 表单名称 */
  name?: string;
  /** 初始数据 */
  initialValues?: Record<string, any>;
  /** 默认数据 */
  defaultValues?: Record<string, any>;
  /** 验证规则 */
  rules?: Record<string, ValidationRule[]>;
  /** 验证触发时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[];
  /** 是否在值变化时验证 */
  validateOnChange?: boolean;
  /** 是否在失去焦点时验证 */
  validateOnBlur?: boolean;
  /** 是否在提交时验证 */
  validateOnSubmit?: boolean;
  /** 额外配置 */
  meta?: Record<string, any>;
}

/**
 * 表单数据变更事件
 */
export interface FormChangeEvent {
  /** 变更的字段名 */
  fieldName: string;
  /** 新值 */
  value: any;
  /** 旧值 */
  oldValue: any;
  /** 完整表单数据 */
  formData: Record<string, any>;
  /** 变更类型 */
  type: 'change' | 'reset' | 'set';
}

/**
 * 字段数据变更事件
 */
export interface FieldChangeEvent {
  /** 字段名称 */
  fieldName: string;
  /** 新值 */
  value: any;
  /** 旧值 */
  oldValue: any;
  /** 变更类型 */
  type: 'change' | 'reset' | 'set';
}

/**
 * 表单提交事件
 */
export interface FormSubmitEvent {
  /** 表单数据 */
  data: Record<string, any>;
  /** 验证结果 */
  validation: Record<string, ValidationResult>;
  /** 是否有效 */
  valid: boolean;
}

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>;

/**
 * 表单实例接口（前向声明）
 */
export interface FormInstance {
  /** 表单配置 */
  config: FormConfig;
  /** 表单数据 */
  data: Record<string, any>;
  /** 表单状态 */
  state: Set<FormState>;
  /** 字段映射 */
  fields: Map<string, FieldInstance>;
  /** 验证结果 */
  validation: Record<string, ValidationResult>;
  
  // 方法将在具体实现中定义
  [key: string]: any;
}

/**
 * 字段实例接口（前向声明）
 */
export interface FieldInstance {
  /** 字段配置 */
  config: FieldConfig;
  /** 字段值 */
  value: any;
  /** 字段状态 */
  state: Set<FieldState>;
  /** 验证结果 */
  validation: ValidationResult | null;
  /** 所属表单 */
  form: FormInstance;
  
  // 方法将在具体实现中定义
  [key: string]: any;
}

/**
 * 数据处理器接口
 */
export interface DataProcessor {
  /** 序列化数据 */
  serialize(data: Record<string, any>): any;
  /** 反序列化数据 */
  deserialize(data: any): Record<string, any>;
  /** 格式化值 */
  format(value: any, fieldConfig: FieldConfig): any;
  /** 解析值 */
  parse(value: any, fieldConfig: FieldConfig): any;
}

/**
 * 事件总线接口
 */
export interface EventBus {
  /** 监听事件 */
  on<T>(event: string, listener: EventListener<T>): void;
  /** 取消监听 */
  off<T>(event: string, listener: EventListener<T>): void;
  /** 触发事件 */
  emit<T>(event: string, data: T): void;
  /** 一次性监听 */
  once<T>(event: string, listener: EventListener<T>): void;
}
