/**
 * Vue 组件类型定义
 * 
 * @description
 * 定义所有 Vue 组件的 Props 和 Emits 类型
 */

import type { FormConfig, FieldConfig, ValidationResult, FormSubmitEvent } from '../../types/core';
import type { ReactiveFormInstance, ReactiveFieldInstance } from '../../types/vue';

// === LDesignForm 组件类型 ===
export interface LDesignFormProps {
  /** 表单实例 */
  form?: any;
  /** 表单配置 */
  config?: FormConfig;
  /** 初始值 */
  initialValues?: Record<string, any>;
  /** 默认值 */
  defaultValues?: Record<string, any>;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'center';
  /** 表单尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示验证图标 */
  showValidationIcon?: boolean;
  /** 是否在输入时验证 */
  validateOnInput?: boolean;
  /** 是否在失焦时验证 */
  validateOnBlur?: boolean;
  /** 是否在提交时验证 */
  validateOnSubmit?: boolean;
}

export interface LDesignFormEmits {
  /** 表单值变化事件 */
  'update:modelValue': [value: Record<string, any>];
  /** 表单变化事件 */
  'change': [data: Record<string, any>, field: string, value: any];
  /** 表单提交事件 */
  'submit': [result: FormSubmitEvent];
  /** 表单重置事件 */
  'reset': [data: Record<string, any>];
  /** 表单验证事件 */
  'validate': [results: Record<string, ValidationResult>];
}

export interface LDesignFormExpose {
  /** 表单实例 */
  form: ReactiveFormInstance;
  /** 提交表单 */
  submit: () => Promise<void>;
  /** 重置表单 */
  reset: () => void;
  /** 验证表单 */
  validate: () => Promise<Record<string, ValidationResult>>;
  /** 清除验证 */
  clearValidation: () => void;
}

// === LDesignFormItem 组件类型 ===
export interface LDesignFormItemProps {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label?: string;
  /** 字段配置 */
  config?: Partial<FieldConfig>;
  /** 表单实例 */
  form?: any;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  rules?: any[];
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  help?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 标签位置 */
  labelPosition?: LabelPosition;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: LabelAlign;
  /** 字段尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 布局模式 */
  layout?: 'horizontal' | 'inline' | 'vertical';
  /** 是否显示验证图标 */
  showValidationIcon?: boolean;
  /** 验证状态 */
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
}

export interface LDesignFormItemEmits {
  /** 字段值变化事件 */
  'update:modelValue': [value: any];
  /** 字段变化事件 */
  'change': [value: any, name: string];
  /** 字段验证事件 */
  'validate': [result: ValidationResult];
}

export interface LDesignFormItemExpose {
  /** 字段实例 */
  field: ReactiveFieldInstance;
  /** 字段值 */
  fieldValue: any;
  /** 验证字段 */
  validate: () => Promise<ValidationResult>;
  /** 清除验证 */
  clearValidation: () => void;
  /** 重置字段 */
  reset: () => void;
}

// === FieldArray 组件类型 ===
export interface FieldArrayProps {
  /** 字段名 */
  name: string;
  /** 默认项值 */
  defaultItem?: any;
  /** 最小项数 */
  min?: number;
  /** 最大项数 */
  max?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否显示添加按钮 */
  showAddButton?: boolean;
  /** 是否显示删除按钮 */
  showRemoveButton?: boolean;
  /** 是否显示移动按钮 */
  showMoveButton?: boolean;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 删除按钮文本 */
  removeButtonText?: string;
}

export interface FieldArrayEmits {
  /** 数组值变化事件 */
  'update:modelValue': [value: any[]];
  /** 数组变化事件 */
  'change': [value: any[], name: string];
  /** 添加项事件 */
  'add': [index: number, item: any];
  /** 删除项事件 */
  'remove': [index: number, item: any];
  /** 移动项事件 */
  'move': [fromIndex: number, toIndex: number];
}

export interface FieldArrayExpose {
  /** 字段数组实例 */
  fieldArray: any; // TODO: 定义具体类型
  /** 添加项 */
  push: (item?: any) => void;
  /** 删除最后一项 */
  pop: () => void;
  /** 插入项 */
  insert: (index: number, item?: any) => void;
  /** 删除项 */
  remove: (index: number) => void;
  /** 移动项 */
  move: (fromIndex: number, toIndex: number) => void;
}

// === FormProvider 组件类型 ===
export interface FormProviderProps {
  /** 表单实例 */
  form: ReactiveFormInstance;
}

export interface FormProviderEmits {
  // FormProvider 通常不需要 emit 事件
}

export interface FormProviderExpose {
  /** 表单实例 */
  form: ReactiveFormInstance;
  /** 表单上下文 */
  formContext: any;
}

// === 通用类型 ===
export type ComponentSize = 'small' | 'medium' | 'large';
export type LabelAlign = 'left' | 'right' | 'center';
export type LabelPosition = 'top' | 'left';
export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating';

// === 查询表单字段配置 ===
export interface QueryFormField {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label?: string;
  /** 字段组件 */
  component?: any;
  /** 组件属性 */
  props?: Record<string, any>;
  /** 栅格跨度 */
  span?: number;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  rules?: any[];
  /** 帮助文本 */
  help?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 字段尺寸 */
  size?: ComponentSize;
  /** 插槽名称 */
  slot?: string;
  /** 唯一键 */
  key?: string | number;
}

// === 响应式断点配置 ===
export interface QueryFormBreakpoints {
  /** 超小屏幕 < 576px */
  xs: number;
  /** 小屏幕 >= 576px */
  sm: number;
  /** 中等屏幕 >= 768px */
  md: number;
  /** 大屏幕 >= 992px */
  lg: number;
  /** 超大屏幕 >= 1200px */
  xl: number;
  /** 超超大屏幕 >= 1400px */
  xxl: number;
}

// === LDesignQueryForm 组件类型 ===
export interface LDesignQueryFormProps {
  /** 表单字段配置 */
  fields?: QueryFormField[];
  /** 表单数据模型 */
  modelValue?: Record<string, any>;
  /** 初始值 */
  initialValues?: Record<string, any>;
  /** 默认值 */
  defaultValues?: Record<string, any>;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 表单布局 */
  layout?: FormLayout;
  /** 标签位置 */
  labelPosition?: LabelPosition;
  /** 标签对齐方式 */
  labelAlign?: LabelAlign;
  /** 标签宽度（仅在 labelPosition='left' 时有效） */
  labelWidth?: string | number;
  /** 表单尺寸 */
  size?: ComponentSize;
  /** 是否默认收起 */
  collapsed?: boolean;
  /** 默认显示行数 */
  defaultRowCount?: number;
  /** 每行列数（当 responsive 为 false 时使用） */
  colCount?: number;
  /** 栅格间距 */
  gutter?: number;
  /** 提交按钮文本 */
  submitText?: string;
  /** 重置按钮文本 */
  resetText?: string;
  /** 展开按钮文本 */
  expandText?: string;
  /** 收起按钮文本 */
  collapseText?: string;
  /** 是否显示展开/收起按钮 */
  showCollapseButton?: boolean;
  /** 按钮组位置模式 */
  actionPosition?: 'auto' | 'inline' | 'block';
  /** 按钮组对齐方式 */
  actionAlign?: 'left' | 'center' | 'right' | 'justify';
  /** 是否启用响应式列数 */
  responsive?: boolean;
  /** 自定义断点配置 */
  breakpoints?: Partial<QueryFormBreakpoints>;
  /** 表单标题文本（可选） */
  title?: string;
  /** 表单标题位置：顶部或左侧 */
  titlePosition?: 'top' | 'left';
}

// === LDesignQueryForm 组件事件 ===
export interface LDesignQueryFormEmits {
  /** 表单数据更新 */
  'update:modelValue': [value: Record<string, any>];
  /** 表单提交 */
  'submit': [data: Record<string, any>, valid: boolean];
  /** 表单重置 */
  'reset': [data: Record<string, any>];
  /** 展开/收起状态变化 */
  'collapse': [collapsed: boolean];
  /** 表单数据变化 */
  'change': [data: Record<string, any>, field: string, value: any];
  /** 表单验证 */
  'validate': [validation: any];
}

// === LDesignQueryForm 组件暴露的方法和属性 ===
export interface LDesignQueryFormExpose {
  /** 表单实例 */
  form: any;
  /** 当前收起状态 */
  collapsed: any;
  /** 切换展开/收起 */
  toggle: () => void;
  /** 展开表单 */
  expand: () => void;
  /** 收起表单 */
  collapse: () => void;
  /** 提交表单 */
  submit: () => Promise<void>;
  /** 重置表单 */
  reset: () => void;
  /** 验证表单 */
  validate: () => Promise<any>;
  /** 清除验证 */
  clearValidation: () => void;
}
