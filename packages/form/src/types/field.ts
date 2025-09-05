/**
 * 字段相关类型定义
 * 
 * @description
 * 定义字段实例、字段操作、字段状态管理等相关类型
 */

import type {
  FieldConfig,
  FieldState,
  ValidationResult,
  ValidationRule,
  FieldChangeEvent,
  EventListener,
  FormInstance
} from './core';

/**
 * 字段操作选项
 */
export interface FieldOperationOptions {
  /** 是否触发验证 */
  validate?: boolean;
  /** 是否触发事件 */
  silent?: boolean;
  /** 是否标记为已触摸 */
  touch?: boolean;
  /** 额外参数 */
  meta?: Record<string, any>;
}

/**
 * 字段验证选项
 */
export interface FieldValidationOptions {
  /** 验证规则，不指定则使用字段配置的规则 */
  rules?: ValidationRule[];
  /** 是否在第一个错误后停止 */
  stopOnFirstError?: boolean;
  /** 额外验证上下文 */
  context?: Record<string, any>;
}

/**
 * 字段重置选项
 */
export interface FieldResetOptions extends FieldOperationOptions {
  /** 重置到的值，默认为初始值 */
  value?: any;
  /** 是否重置验证状态 */
  resetValidation?: boolean;
  /** 是否重置字段状态 */
  resetState?: boolean;
}

/**
 * 字段数组操作选项
 */
export interface FieldArrayOptions extends FieldOperationOptions {
  /** 插入位置 */
  index?: number;
  /** 操作数量 */
  count?: number;
}

/**
 * 字段实例完整接口
 */
export interface FieldInstance {
  /** 字段唯一标识 */
  readonly id: string;
  /** 字段配置 */
  readonly config: FieldConfig;
  /** 字段值 */
  readonly value: any;
  /** 初始值 */
  readonly initialValue: any;
  /** 字段状态 */
  readonly state: Set<FieldState>;
  /** 验证结果 */
  readonly validation: ValidationResult | null;
  /** 所属表单 */
  readonly form: FormInstance;
  /** 是否已销毁 */
  readonly destroyed: boolean;

  // === 值操作方法 ===

  /**
   * 设置字段值
   * @param value 新值
   * @param options 操作选项
   */
  setValue(value: any, options?: FieldOperationOptions): void;

  /**
   * 获取字段值
   * @returns 字段值
   */
  getValue(): any;

  /**
   * 重置字段
   * @param options 重置选项
   */
  reset(options?: FieldResetOptions): void;

  // === 状态管理方法 ===

  /**
   * 检查字段状态
   * @param state 状态
   * @returns 是否包含该状态
   */
  hasState(state: FieldState): boolean;

  /**
   * 添加字段状态
   * @param state 状态
   */
  addState(state: FieldState): void;

  /**
   * 移除字段状态
   * @param state 状态
   */
  removeState(state: FieldState): void;

  /**
   * 标记字段为已触摸
   */
  touch(): void;

  /**
   * 标记字段为未触摸
   */
  untouch(): void;

  /**
   * 检查字段是否为脏数据
   * @returns 是否为脏数据
   */
  isDirty(): boolean;

  /**
   * 检查字段是否已触摸
   * @returns 是否已触摸
   */
  isTouched(): boolean;

  /**
   * 检查字段是否有效
   * @returns 是否有效
   */
  isValid(): boolean;

  /**
   * 检查字段是否正在验证
   * @returns 是否正在验证
   */
  isPending(): boolean;

  // === 验证方法 ===

  /**
   * 验证字段
   * @param options 验证选项
   * @returns 验证结果
   */
  validate(options?: FieldValidationOptions): Promise<ValidationResult>;

  /**
   * 清除验证结果
   */
  clearValidation(): void;

  // === 事件方法 ===

  /**
   * 监听字段变化事件
   * @param listener 事件监听器
   */
  onChange(listener: EventListener<FieldChangeEvent>): void;

  /**
   * 监听字段验证事件
   * @param listener 事件监听器
   */
  onValidate(listener: EventListener<ValidationResult>): void;

  /**
   * 取消事件监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  off(event: string, listener: EventListener): void;

  // === 生命周期方法 ===

  /**
   * 销毁字段实例
   */
  destroy(): void;
}

/**
 * 字段数组实例接口
 */
export interface FieldArrayInstance extends FieldInstance {
  /** 数组长度 */
  readonly length: number;
  /** 数组项字段实例 */
  readonly items: FieldInstance[];

  // === 数组操作方法 ===

  /**
   * 添加数组项
   * @param value 项值
   * @param options 操作选项
   * @returns 新增的字段实例
   */
  push(value: any, options?: FieldArrayOptions): FieldInstance;

  /**
   * 移除最后一个数组项
   * @param options 操作选项
   * @returns 移除的字段实例
   */
  pop(options?: FieldArrayOptions): FieldInstance | undefined;

  /**
   * 在指定位置插入数组项
   * @param index 插入位置
   * @param value 项值
   * @param options 操作选项
   * @returns 新增的字段实例
   */
  insert(index: number, value: any, options?: FieldArrayOptions): FieldInstance;

  /**
   * 移除指定位置的数组项
   * @param index 移除位置
   * @param options 操作选项
   * @returns 移除的字段实例
   */
  remove(index: number, options?: FieldArrayOptions): FieldInstance | undefined;

  /**
   * 移动数组项
   * @param fromIndex 源位置
   * @param toIndex 目标位置
   * @param options 操作选项
   */
  move(fromIndex: number, toIndex: number, options?: FieldArrayOptions): void;

  /**
   * 交换数组项
   * @param indexA 位置A
   * @param indexB 位置B
   * @param options 操作选项
   */
  swap(indexA: number, indexB: number, options?: FieldArrayOptions): void;

  /**
   * 获取指定位置的字段实例
   * @param index 位置
   * @returns 字段实例
   */
  getItem(index: number): FieldInstance | undefined;

  /**
   * 获取所有数组项的值
   * @returns 数组值
   */
  getArrayValue(): any[];

  /**
   * 设置数组值
   * @param values 数组值
   * @param options 操作选项
   */
  setArrayValue(values: any[], options?: FieldArrayOptions): void;
}

/**
 * 字段工厂选项
 */
export interface FieldFactoryOptions extends FieldConfig {
  /** 自定义字段ID */
  id?: string;
  /** 所属表单 */
  form: FormInstance;
  /** 是否为数组字段 */
  isArray?: boolean;
}

/**
 * 字段工厂接口
 */
export interface FieldFactory {
  /**
   * 创建字段实例
   * @param options 字段选项
   * @returns 字段实例
   */
  createField(options: FieldFactoryOptions): FieldInstance;

  /**
   * 创建字段数组实例
   * @param options 字段选项
   * @returns 字段数组实例
   */
  createFieldArray(options: FieldFactoryOptions): FieldArrayInstance;

  /**
   * 销毁字段实例
   * @param field 字段实例或字段ID
   */
  destroyField(field: FieldInstance | string): void;
}

/**
 * 字段配置扩展（重新导出以便扩展）
 */
export interface FieldConfig extends import('./core').FieldConfig {
  /** 字段组件类型（用于 Vue 组件） */
  component?: any;
  /** 字段组件属性 */
  props?: Record<string, any>;
  /** 字段布局配置 */
  layout?: {
    /** 栅格跨度 */
    span?: number | string;
    /** 标签宽度 */
    labelWidth?: number | string;
    /** 标签对齐方式 */
    labelAlign?: 'left' | 'right' | 'top';
    /** 内容对齐方式 */
    contentAlign?: 'left' | 'right' | 'center';
  };
  /** 字段依赖关系 */
  dependencies?: string[];
  /** 字段显示条件 */
  visible?: boolean | ((formData: Record<string, any>) => boolean);
  /** 字段禁用条件 */
  disabled?: boolean | ((formData: Record<string, any>) => boolean);
}
