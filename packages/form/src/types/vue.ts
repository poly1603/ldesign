/**
 * Vue 相关类型定义
 * 
 * @description
 * 定义 Vue 3 集成相关的类型，包括 hooks、组件、指令等
 */

import type { Ref, ComputedRef, UnwrapRef } from 'vue';
import type {
  FormInstance,
  FieldInstance,
  FieldArrayInstance,
  FormConfig,
  FieldConfig,
  ValidationResult,
  FormChangeEvent,
  FormSubmitEvent,
  FieldChangeEvent
} from './core';

/**
 * Vue 响应式表单实例
 */
export interface ReactiveFormInstance {
  /** 表单实例 */
  form: FormInstance;
  /** 响应式表单数据 */
  data: Ref<Record<string, any>>;
  /** 响应式表单状态 */
  state: ComputedRef<string[]>;
  /** 响应式验证结果 */
  validation: ComputedRef<Record<string, ValidationResult>>;
  /** 是否有效 */
  isValid: ComputedRef<boolean>;
  /** 是否为脏数据 */
  isDirty: ComputedRef<boolean>;
  /** 是否正在验证 */
  isPending: ComputedRef<boolean>;
  /** 是否已提交 */
  isSubmitted: ComputedRef<boolean>;
}

/**
 * Vue 响应式字段实例
 */
export interface ReactiveFieldInstance {
  /** 字段实例 */
  field: FieldInstance;
  /** 响应式字段值 */
  value: Ref<any>;
  /** 响应式字段状态 */
  state: ComputedRef<string[]>;
  /** 响应式验证结果 */
  validation: ComputedRef<ValidationResult | null>;
  /** 是否有效 */
  isValid: ComputedRef<boolean>;
  /** 是否为脏数据 */
  isDirty: ComputedRef<boolean>;
  /** 是否已触摸 */
  isTouched: ComputedRef<boolean>;
  /** 是否正在验证 */
  isPending: ComputedRef<boolean>;
}

/**
 * Vue 响应式字段数组实例
 */
export interface ReactiveFieldArrayInstance extends ReactiveFieldInstance {
  /** 字段数组实例 */
  fieldArray: FieldArrayInstance;
  /** 响应式数组项 */
  items: ComputedRef<ReactiveFieldInstance[]>;
  /** 数组长度 */
  length: ComputedRef<number>;
}

/**
 * useForm hook 选项
 */
export interface UseFormOptions extends FormConfig {
  /** 表单ID */
  id?: string;
  /** 是否立即验证 */
  immediate?: boolean;
  /** 是否深度监听 */
  deep?: boolean;
}

/**
 * useForm hook 返回值
 */
export interface UseFormReturn extends ReactiveFormInstance {
  /** 设置字段值 */
  setFieldValue: (fieldName: string, value: any) => void;
  /** 获取字段值 */
  getFieldValue: (fieldName: string) => any;
  /** 设置多个字段值 */
  setValues: (values: Record<string, any>) => void;
  /** 获取所有字段值 */
  getValues: () => Record<string, any>;
  /** 重置表单 */
  reset: (values?: Record<string, any>) => void;
  /** 验证表单 */
  validate: () => Promise<Record<string, ValidationResult>>;
  /** 验证字段 */
  validateField: (fieldName: string) => Promise<ValidationResult>;
  /** 清除验证结果 */
  clearValidation: (fieldNames?: string[]) => void;
  /** 提交表单 */
  submit: () => Promise<FormSubmitEvent>;
  /** 注册字段 */
  registerField: (config: FieldConfig) => ReactiveFieldInstance;
  /** 注销字段 */
  unregisterField: (fieldName: string) => void;
  /** 获取字段实例 */
  getField: (fieldName: string) => ReactiveFieldInstance | undefined;
}

/**
 * useField hook 选项
 */
export interface UseFieldOptions extends FieldConfig {
  /** 表单实例或表单上下文 */
  form?: FormInstance | ReactiveFormInstance;
  /** 是否立即验证 */
  immediate?: boolean;
  /** 是否深度监听 */
  deep?: boolean;
}

/**
 * useField hook 返回值
 */
export interface UseFieldReturn extends ReactiveFieldInstance {
  /** 设置字段值 */
  setValue: (value: any) => void;
  /** 获取字段值 */
  getValue: () => any;
  /** 重置字段 */
  reset: (value?: any) => void;
  /** 验证字段 */
  validate: () => Promise<ValidationResult>;
  /** 清除验证结果 */
  clearValidation: () => void;
  /** 标记为已触摸 */
  touch: () => void;
  /** 标记为未触摸 */
  untouch: () => void;
}

/**
 * useFieldArray hook 选项
 */
export interface UseFieldArrayOptions extends UseFieldOptions {
  /** 默认项值 */
  defaultItem?: any;
  /** 最小项数 */
  minItems?: number;
  /** 最大项数 */
  maxItems?: number;
  /** 数组级别验证器 */
  validator?: (value: any[], context: any) => Promise<{ valid: boolean; message?: string }>;
  /** 元素级别验证器 */
  itemValidator?: (value: any, context: any) => Promise<{ valid: boolean; message?: string }>;
}

/**
 * useFieldArray hook 返回值
 */
export interface UseFieldArrayReturn extends ReactiveFieldArrayInstance {
  /** 添加项 */
  push: (value?: any) => ReactiveFieldInstance;
  /** 移除最后一项 */
  pop: () => ReactiveFieldInstance | undefined;
  /** 插入项 */
  insert: (index: number, value?: any) => ReactiveFieldInstance;
  /** 移除项 */
  remove: (index: number) => ReactiveFieldInstance | undefined;
  /** 移动项 */
  move: (fromIndex: number, toIndex: number) => void;
  /** 交换项 */
  swap: (indexA: number, indexB: number) => void;
  /** 获取项 */
  getItem: (index: number) => ReactiveFieldInstance | undefined;
  /** 设置数组值 */
  setArrayValue: (values: any[]) => void;
  /** 获取数组值 */
  getArrayValue: () => any[];
  /** 验证数组项 */
  validateItem: (index: number) => Promise<{ valid: boolean; message?: string }>;
  /** 验证整个数组 */
  validateArray: () => Promise<{ valid: boolean; message?: string }>;
  /** 重置数组到初始状态 */
  reset: () => void;
}

/**
 * useFormContext hook 返回值
 */
export interface UseFormContextReturn {
  /** 表单实例 */
  form: ReactiveFormInstance | null;
  /** 表单ID */
  formId?: string;
  /** 表单数据 */
  formData?: any;
  /** 注册字段 */
  registerField: (config: FieldConfig) => ReactiveFieldInstance;
  /** 注销字段 */
  unregisterField: (fieldName: string) => void;
  /** 获取字段实例 */
  getField: (fieldName: string) => ReactiveFieldInstance | undefined;
}

/**
 * LDesignForm 组件属性
 */
export interface LDesignFormProps {
  /** 表单配置选项（兼容现有API） */
  options?: Array<{
    name: string;
    label?: string;
    component?: any;
    props?: Record<string, any>;
    span?: number | string;
    rules?: any[];
    [key: string]: any;
  }>;
  /** 表单数据模型 */
  modelValue?: Record<string, any>;
  /** 默认值 */
  defaultValue?: Record<string, any>;
  /** 验证规则 */
  rules?: Record<string, any[]>;
  /** 布局配置 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'top';
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 栅格配置 */
  span?: number;
  spanWidth?: number;
  maxSpan?: number;
  minSpan?: number;
  /** 预览行数 */
  previewRows?: number;
  /** 按钮配置 */
  buttonPosition?: 'inline' | 'block';
  buttonAlign?: 'left' | 'center' | 'right';
  /** 样式配置 */
  colon?: boolean;
  gutter?: string | number;
  space?: string | number;
  /** 其他配置 */
  disabled?: boolean;
  readonly?: boolean;
  [key: string]: any;
}

/**
 * LDesignForm 组件事件
 */
export interface LDesignFormEmits {
  /** 更新模型值 */
  'update:modelValue': [value: Record<string, any>];
  /** 表单变化 */
  'change': [event: FormChangeEvent];
  /** 表单提交 */
  'submit': [event: FormSubmitEvent];
  /** 表单重置 */
  'reset': [event: FormChangeEvent];
  /** 验证完成 */
  'validate': [validation: Record<string, ValidationResult>];
}

/**
 * LDesignFormItem 组件属性
 */
export interface LDesignFormItemProps {
  /** 字段名称 */
  name?: string;
  /** 字段标签 */
  label?: string;
  /** 验证规则 */
  rules?: any[];
  /** 是否必填 */
  required?: boolean;
  /** 布局配置 */
  span?: number | string;
  labelWidth?: string | number;
  labelAlign?: 'left' | 'right' | 'top';
  /** 其他配置 */
  disabled?: boolean;
  readonly?: boolean;
  [key: string]: any;
}

/**
 * FormProvider 组件属性
 */
export interface FormProviderProps {
  /** 表单实例 */
  form?: FormInstance | ReactiveFormInstance;
  /** 表单配置 */
  config?: FormConfig;
}

/**
 * FieldArray 组件属性
 */
export interface FieldArrayProps {
  /** 字段名称 */
  name: string;
  /** 默认项值 */
  defaultItem?: any;
  /** 最小项数 */
  minItems?: number;
  /** 最大项数 */
  maxItems?: number;
  /** 项组件 */
  itemComponent?: any;
  /** 项组件属性 */
  itemProps?: Record<string, any>;
}

/**
 * Vue 指令绑定值类型
 */
export interface VModelDirectiveBinding {
  /** 字段名称 */
  fieldName: string;
  /** 表单实例 */
  form?: FormInstance | ReactiveFormInstance;
  /** 验证选项 */
  validation?: {
    trigger?: string[];
    immediate?: boolean;
  };
}
