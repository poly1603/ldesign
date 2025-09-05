/**
 * 表单相关类型定义
 * 
 * @description
 * 定义表单实例、表单操作、表单状态管理等相关类型
 */

import type {
  FormConfig,
  FormState,
  FieldInstance,
  ValidationResult,
  FormChangeEvent,
  FormSubmitEvent,
  EventListener,
  DataProcessor,
  EventBus
} from './core';

/**
 * 表单操作选项
 */
export interface FormOperationOptions {
  /** 是否触发验证 */
  validate?: boolean;
  /** 是否触发事件 */
  silent?: boolean;
  /** 是否深度合并 */
  merge?: boolean;
  /** 额外参数 */
  meta?: Record<string, any>;
}

/**
 * 表单重置选项
 */
export interface FormResetOptions extends FormOperationOptions {
  /** 重置到的值，默认为初始值 */
  values?: Record<string, any>;
  /** 是否重置验证状态 */
  resetValidation?: boolean;
  /** 是否重置字段状态 */
  resetFieldState?: boolean;
}

/**
 * 表单验证选项
 */
export interface FormValidationOptions {
  /** 要验证的字段，不指定则验证所有字段 */
  fields?: string[];
  /** 是否在第一个错误后停止 */
  stopOnFirstError?: boolean;
  /** 是否只验证脏字段 */
  dirtyOnly?: boolean;
  /** 额外验证上下文 */
  context?: Record<string, any>;
}

/**
 * 表单提交选项
 */
export interface FormSubmitOptions {
  /** 提交前是否验证 */
  validate?: boolean;
  /** 验证选项 */
  validationOptions?: FormValidationOptions;
  /** 数据处理器 */
  processor?: DataProcessor;
  /** 额外提交数据 */
  meta?: Record<string, any>;
}

/**
 * 表单状态快照
 */
export interface FormSnapshot {
  /** 表单数据 */
  data: Record<string, any>;
  /** 表单状态 */
  state: FormState[];
  /** 字段状态快照 */
  fields: Record<string, FieldSnapshot>;
  /** 验证结果 */
  validation: Record<string, ValidationResult>;
  /** 快照时间戳 */
  timestamp: number;
}

/**
 * 字段状态快照
 */
export interface FieldSnapshot {
  /** 字段值 */
  value: any;
  /** 字段状态 */
  state: string[];
  /** 验证结果 */
  validation: ValidationResult | null;
}

/**
 * 表单实例完整接口
 */
export interface FormInstance {
  /** 表单唯一标识 */
  readonly id: string;
  /** 表单配置 */
  readonly config: FormConfig;
  /** 表单数据 */
  readonly data: Record<string, any>;
  /** 表单状态 */
  readonly state: Set<FormState>;
  /** 字段映射 */
  readonly fields: Map<string, FieldInstance>;
  /** 验证结果 */
  readonly validation: Record<string, ValidationResult>;
  /** 事件总线 */
  readonly events: EventBus;
  /** 是否已销毁 */
  readonly destroyed: boolean;

  // === 数据操作方法 ===
  
  /**
   * 设置字段值
   * @param fieldName 字段名
   * @param value 字段值
   * @param options 操作选项
   */
  setFieldValue(fieldName: string, value: any, options?: FormOperationOptions): void;

  /**
   * 获取字段值
   * @param fieldName 字段名
   * @returns 字段值
   */
  getFieldValue(fieldName: string): any;

  /**
   * 设置多个字段值
   * @param values 字段值对象
   * @param options 操作选项
   */
  setValues(values: Record<string, any>, options?: FormOperationOptions): void;

  /**
   * 获取所有字段值
   * @returns 表单数据
   */
  getValues(): Record<string, any>;

  /**
   * 重置表单
   * @param options 重置选项
   */
  reset(options?: FormResetOptions): void;

  // === 字段管理方法 ===

  /**
   * 注册字段
   * @param fieldConfig 字段配置
   * @returns 字段实例
   */
  registerField(fieldConfig: import('./field').FieldConfig): FieldInstance;

  /**
   * 注销字段
   * @param fieldName 字段名
   */
  unregisterField(fieldName: string): void;

  /**
   * 获取字段实例
   * @param fieldName 字段名
   * @returns 字段实例
   */
  getField(fieldName: string): FieldInstance | undefined;

  /**
   * 检查字段是否存在
   * @param fieldName 字段名
   * @returns 是否存在
   */
  hasField(fieldName: string): boolean;

  // === 验证方法 ===

  /**
   * 验证表单
   * @param options 验证选项
   * @returns 验证结果
   */
  validate(options?: FormValidationOptions): Promise<Record<string, ValidationResult>>;

  /**
   * 验证字段
   * @param fieldName 字段名
   * @returns 验证结果
   */
  validateField(fieldName: string): Promise<ValidationResult>;

  /**
   * 清除验证结果
   * @param fieldNames 字段名数组，不指定则清除所有
   */
  clearValidation(fieldNames?: string[]): void;

  // === 状态管理方法 ===

  /**
   * 检查表单状态
   * @param state 状态
   * @returns 是否包含该状态
   */
  hasState(state: FormState): boolean;

  /**
   * 添加表单状态
   * @param state 状态
   */
  addState(state: FormState): void;

  /**
   * 移除表单状态
   * @param state 状态
   */
  removeState(state: FormState): void;

  /**
   * 获取表单状态快照
   * @returns 状态快照
   */
  getSnapshot(): FormSnapshot;

  /**
   * 恢复表单状态快照
   * @param snapshot 状态快照
   */
  restoreSnapshot(snapshot: FormSnapshot): void;

  // === 提交方法 ===

  /**
   * 提交表单
   * @param options 提交选项
   * @returns 提交结果
   */
  submit(options?: FormSubmitOptions): Promise<FormSubmitEvent>;

  // === 事件方法 ===

  /**
   * 监听表单变化事件
   * @param listener 事件监听器
   */
  onChange(listener: EventListener<FormChangeEvent>): void;

  /**
   * 监听表单提交事件
   * @param listener 事件监听器
   */
  onSubmit(listener: EventListener<FormSubmitEvent>): void;

  /**
   * 监听表单重置事件
   * @param listener 事件监听器
   */
  onReset(listener: EventListener<FormChangeEvent>): void;

  /**
   * 取消事件监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  off(event: string, listener: EventListener): void;

  // === 生命周期方法 ===

  /**
   * 销毁表单实例
   */
  destroy(): void;
}

/**
 * 表单工厂选项
 */
export interface FormFactoryOptions extends FormConfig {
  /** 自定义表单ID */
  id?: string;
  /** 数据处理器 */
  processor?: DataProcessor;
  /** 自定义事件总线 */
  eventBus?: EventBus;
}

/**
 * 表单工厂接口
 */
export interface FormFactory {
  /**
   * 创建表单实例
   * @param options 表单选项
   * @returns 表单实例
   */
  createForm(options?: FormFactoryOptions): FormInstance;

  /**
   * 销毁表单实例
   * @param form 表单实例或表单ID
   */
  destroyForm(form: FormInstance | string): void;

  /**
   * 获取表单实例
   * @param id 表单ID
   * @returns 表单实例
   */
  getForm(id: string): FormInstance | undefined;

  /**
   * 获取所有表单实例
   * @returns 表单实例数组
   */
  getAllForms(): FormInstance[];
}
