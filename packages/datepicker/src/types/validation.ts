/**
 * 验证相关类型定义
 */

import type { DateValue, DateRange, MultipleDates } from './index';

// ==================== 验证规则类型 ====================

/**
 * 验证规则类型
 */
export type ValidationRuleType = 
  | 'required'
  | 'minDate'
  | 'maxDate'
  | 'dateRange'
  | 'format'
  | 'custom'
  | 'weekday'
  | 'holiday'
  | 'businessDay';

/**
 * 验证严重级别
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  
  /** 错误信息列表 */
  errors: ValidationError[];
  
  /** 警告信息列表 */
  warnings: ValidationWarning[];
  
  /** 提示信息列表 */
  infos: ValidationInfo[];
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  /** 错误类型 */
  type: ValidationRuleType;
  
  /** 错误消息 */
  message: string;
  
  /** 错误代码 */
  code: string;
  
  /** 相关字段 */
  field?: string;
  
  /** 错误值 */
  value?: any;
  
  /** 期望值 */
  expected?: any;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  /** 警告类型 */
  type: ValidationRuleType;
  
  /** 警告消息 */
  message: string;
  
  /** 警告代码 */
  code: string;
  
  /** 相关字段 */
  field?: string;
  
  /** 警告值 */
  value?: any;
}

/**
 * 验证提示接口
 */
export interface ValidationInfo {
  /** 提示类型 */
  type: ValidationRuleType;
  
  /** 提示消息 */
  message: string;
  
  /** 提示代码 */
  code: string;
  
  /** 相关字段 */
  field?: string;
  
  /** 提示值 */
  value?: any;
}

// ==================== 验证规则接口 ====================

/**
 * 基础验证规则接口
 */
export interface BaseValidationRule {
  /** 规则类型 */
  type: ValidationRuleType;
  
  /** 错误消息 */
  message?: string;
  
  /** 是否启用 */
  enabled?: boolean;
  
  /** 严重级别 */
  severity?: ValidationSeverity;
}

/**
 * 必填验证规则
 */
export interface RequiredRule extends BaseValidationRule {
  type: 'required';
  
  /** 是否必填 */
  required: boolean;
}

/**
 * 最小日期验证规则
 */
export interface MinDateRule extends BaseValidationRule {
  type: 'minDate';
  
  /** 最小日期 */
  minDate: DateValue;
  
  /** 是否包含边界 */
  inclusive?: boolean;
}

/**
 * 最大日期验证规则
 */
export interface MaxDateRule extends BaseValidationRule {
  type: 'maxDate';
  
  /** 最大日期 */
  maxDate: DateValue;
  
  /** 是否包含边界 */
  inclusive?: boolean;
}

/**
 * 日期范围验证规则
 */
export interface DateRangeRule extends BaseValidationRule {
  type: 'dateRange';
  
  /** 日期范围 */
  range: DateRange;
  
  /** 是否包含边界 */
  inclusive?: boolean;
}

/**
 * 格式验证规则
 */
export interface FormatRule extends BaseValidationRule {
  type: 'format';
  
  /** 日期格式 */
  format: string | RegExp;
  
  /** 是否严格模式 */
  strict?: boolean;
}

/**
 * 自定义验证规则
 */
export interface CustomRule extends BaseValidationRule {
  type: 'custom';
  
  /** 验证函数 */
  validator: (value: DateValue, context?: ValidationContext) => boolean | Promise<boolean>;
  
  /** 异步验证 */
  async?: boolean;
}

/**
 * 星期验证规则
 */
export interface WeekdayRule extends BaseValidationRule {
  type: 'weekday';
  
  /** 允许的星期 (0-6, 0为周日) */
  allowedWeekdays: number[];
  
  /** 禁用的星期 */
  disabledWeekdays?: number[];
}

/**
 * 节假日验证规则
 */
export interface HolidayRule extends BaseValidationRule {
  type: 'holiday';
  
  /** 节假日列表 */
  holidays: DateValue[];
  
  /** 是否允许节假日 */
  allowHolidays?: boolean;
}

/**
 * 工作日验证规则
 */
export interface BusinessDayRule extends BaseValidationRule {
  type: 'businessDay';
  
  /** 是否只允许工作日 */
  businessDaysOnly: boolean;
  
  /** 自定义工作日 (0-6, 0为周日) */
  customBusinessDays?: number[];
}

// ==================== 验证规则联合类型 ====================

/**
 * 所有验证规则的联合类型
 */
export type ValidationRule = 
  | RequiredRule
  | MinDateRule
  | MaxDateRule
  | DateRangeRule
  | FormatRule
  | CustomRule
  | WeekdayRule
  | HolidayRule
  | BusinessDayRule;

// ==================== 验证配置接口 ====================

/**
 * 验证配置接口
 */
export interface ValidationConfig {
  /** 验证规则列表 */
  rules: ValidationRule[];
  
  /** 是否在输入时验证 */
  validateOnInput?: boolean;
  
  /** 是否在失焦时验证 */
  validateOnBlur?: boolean;
  
  /** 是否在提交时验证 */
  validateOnSubmit?: boolean;
  
  /** 是否显示错误信息 */
  showErrors?: boolean;
  
  /** 是否显示警告信息 */
  showWarnings?: boolean;
  
  /** 是否显示提示信息 */
  showInfos?: boolean;
  
  /** 错误信息显示位置 */
  errorPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'tooltip';
  
  /** 自定义错误模板 */
  errorTemplate?: string | ((error: ValidationError) => string);
  
  /** 验证延迟 (毫秒) */
  debounce?: number;
  
  /** 是否停止在第一个错误 */
  stopOnFirstError?: boolean;
}

// ==================== 验证上下文接口 ====================

/**
 * 验证上下文接口
 */
export interface ValidationContext {
  /** 当前值 */
  value: DateValue | DateRange | MultipleDates;
  
  /** 字段名称 */
  field?: string;
  
  /** 表单数据 */
  formData?: Record<string, any>;
  
  /** 验证配置 */
  config: ValidationConfig;
  
  /** 当前日期 */
  currentDate: Date;
  
  /** 语言环境 */
  locale?: string;
  
  /** 时区 */
  timezone?: string;
  
  /** 额外数据 */
  extra?: Record<string, any>;
}

// ==================== 验证器接口 ====================

/**
 * 验证器接口
 */
export interface Validator {
  /** 验证单个值 */
  validate(value: DateValue, rules: ValidationRule[], context?: ValidationContext): ValidationResult;
  
  /** 验证范围值 */
  validateRange(range: DateRange, rules: ValidationRule[], context?: ValidationContext): ValidationResult;
  
  /** 验证多个值 */
  validateMultiple(values: MultipleDates, rules: ValidationRule[], context?: ValidationContext): ValidationResult;
  
  /** 异步验证 */
  validateAsync(value: DateValue, rules: ValidationRule[], context?: ValidationContext): Promise<ValidationResult>;
  
  /** 添加自定义规则 */
  addRule(rule: ValidationRule): void;
  
  /** 移除规则 */
  removeRule(type: ValidationRuleType): void;
  
  /** 获取所有规则 */
  getRules(): ValidationRule[];
  
  /** 清空所有规则 */
  clearRules(): void;
}

// ==================== 预定义验证规则 ====================

/**
 * 预定义验证规则常量
 */
export const PreDefinedRules = {
  /** 必填规则 */
  REQUIRED: { type: 'required', required: true } as RequiredRule,
  
  /** 只允许工作日 */
  BUSINESS_DAYS_ONLY: { 
    type: 'businessDay', 
    businessDaysOnly: true 
  } as BusinessDayRule,
  
  /** 不允许周末 */
  NO_WEEKENDS: { 
    type: 'weekday', 
    allowedWeekdays: [1, 2, 3, 4, 5] 
  } as WeekdayRule,
  
  /** 只允许今天之后的日期 */
  FUTURE_ONLY: { 
    type: 'minDate', 
    minDate: new Date(), 
    inclusive: false 
  } as MinDateRule,
  
  /** 只允许今天之前的日期 */
  PAST_ONLY: { 
    type: 'maxDate', 
    maxDate: new Date(), 
    inclusive: false 
  } as MaxDateRule
} as const;
