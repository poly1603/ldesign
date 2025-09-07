/**
 * 验证器相关类型定义
 * 
 * @description
 * 定义验证器、验证规则、验证结果等相关类型
 */

import type {
  ValidationResult,
  ValidationContext,
  ValidatorFunction,
  ValidationRule as BaseValidationRule
} from './core';

/**
 * 内置验证器名称
 */
export enum BuiltinValidators {
  /** 必填验证 */
  REQUIRED = 'required',
  /** 邮箱验证 */
  EMAIL = 'email',
  /** URL验证 */
  URL = 'url',
  /** 正则表达式验证 */
  PATTERN = 'pattern',
  /** 最小长度验证 */
  MIN_LENGTH = 'minLength',
  /** 最大长度验证 */
  MAX_LENGTH = 'maxLength',
  /** 最小值验证 */
  MIN = 'min',
  /** 最大值验证 */
  MAX = 'max',
  /** 范围验证 */
  RANGE = 'range',
  /** 数字验证 */
  NUMBER = 'number',
  /** 整数验证 */
  INTEGER = 'integer',
  /** 自定义验证 */
  CUSTOM = 'custom'
}

/**
 * 验证器配置接口
 */
export interface ValidatorConfig {
  /** 验证器名称 */
  name: string;
  /** 验证器函数 */
  validator: ValidatorFunction;
  /** 默认错误消息 */
  defaultMessage?: string;
  /** 验证器描述 */
  description?: string;
  /** 验证器参数模式 */
  paramsSchema?: Record<string, any>;
}

/**
 * 必填验证器参数
 */
export interface RequiredValidatorParams {
  /** 是否必填 */
  required?: boolean;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * 邮箱验证器参数
 */
export interface EmailValidatorParams {
  /** 自定义邮箱正则表达式 */
  pattern?: RegExp;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * URL验证器参数
 */
export interface UrlValidatorParams {
  /** 允许的协议 */
  protocols?: string[];
  /** 是否要求协议 */
  requireProtocol?: boolean;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * 正则验证器参数
 */
export interface PatternValidatorParams {
  /** 正则表达式 */
  pattern: RegExp | string;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * 长度验证器参数
 */
export interface LengthValidatorParams {
  /** 最小长度 */
  min?: number;
  /** 最大长度 */
  max?: number;
  /** 精确长度 */
  exact?: number;
  /** 自定义错误消息 */
  message?: string;
  /** 最小长度自定义错误消息 */
  minMessage?: string;
  /** 最大长度自定义错误消息 */
  maxMessage?: string;
  /** 范围验证自定义错误消息 */
  rangeMessage?: string;
  /** 精确长度自定义错误消息 */
  exactMessage?: string;
}

/**
 * 范围验证器参数
 */
export interface RangeValidatorParams {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 是否包含边界值 */
  inclusive?: boolean;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * 数字验证器参数
 */
export interface NumberValidatorParams {
  /** 是否允许小数 */
  allowDecimal?: boolean;
  /** 小数位数 */
  decimalPlaces?: number;
  /** 是否允许负数 */
  allowNegative?: boolean;
  /** 自定义错误消息 */
  message?: string;
}

/**
 * 自定义验证器参数
 */
export interface CustomValidatorParams {
  /** 验证器函数 */
  validator: ValidatorFunction;
  /** 自定义错误消息 */
  message?: string;
  /** 额外参数 */
  [key: string]: any;
}

/**
 * 验证规则扩展接口
 */
export interface ValidationRule extends BaseValidationRule {
  /** 验证器参数的联合类型 */
  params?:
  | RequiredValidatorParams
  | EmailValidatorParams
  | UrlValidatorParams
  | PatternValidatorParams
  | LengthValidatorParams
  | RangeValidatorParams
  | NumberValidatorParams
  | CustomValidatorParams
  | Record<string, any>;
}

/**
 * 验证结果扩展接口
 */
export interface ValidationResultExtended extends ValidationResult {
  /** 验证器名称 */
  validator?: string;
  /** 验证参数 */
  params?: Record<string, any>;
  /** 验证耗时（毫秒） */
  duration?: number;
  /** 验证时间戳 */
  timestamp?: number;
}

/**
 * 验证上下文扩展接口
 */
export interface ValidationContextExtended extends ValidationContext {
  /** 验证器名称 */
  validatorName?: string;
  /** 验证参数 */
  params?: Record<string, any>;
  /** 验证历史 */
  history?: ValidationResultExtended[];
  /** 额外上下文数据 */
  extra?: Record<string, any>;
}

/**
 * 验证器注册表接口
 */
export interface ValidatorRegistry {
  /**
   * 注册验证器
   * @param config 验证器配置
   */
  register(config: ValidatorConfig): void;

  /**
   * 注册多个验证器
   * @param configs 验证器配置数组
   */
  registerMany(configs: ValidatorConfig[]): void;

  /**
   * 获取验证器
   * @param name 验证器名称
   * @returns 验证器配置
   */
  get(name: string): ValidatorConfig | undefined;

  /**
   * 检查验证器是否存在
   * @param name 验证器名称
   * @returns 是否存在
   */
  has(name: string): boolean;

  /**
   * 注销验证器
   * @param name 验证器名称
   */
  unregister(name: string): void;

  /**
   * 获取所有验证器名称
   * @returns 验证器名称数组
   */
  getNames(): string[];

  /**
   * 清空所有验证器
   */
  clear(): void;
}

/**
 * 验证器执行器接口
 */
export interface ValidatorExecutor {
  /**
   * 执行单个验证规则
   * @param rule 验证规则
   * @param value 待验证值
   * @param context 验证上下文
   * @returns 验证结果
   */
  executeRule(
    rule: ValidationRule,
    value: any,
    context: ValidationContextExtended
  ): Promise<ValidationResultExtended>;

  /**
   * 执行多个验证规则
   * @param rules 验证规则数组
   * @param value 待验证值
   * @param context 验证上下文
   * @param stopOnFirstError 是否在第一个错误后停止
   * @returns 验证结果数组
   */
  executeRules(
    rules: ValidationRule[],
    value: any,
    context: ValidationContextExtended,
    stopOnFirstError?: boolean
  ): Promise<ValidationResultExtended[]>;

  /**
   * 批量执行验证
   * @param validations 验证配置数组
   * @returns 验证结果映射
   */
  executeBatch(validations: Array<{
    fieldName: string;
    rules: ValidationRule[];
    value: any;
    context: ValidationContextExtended;
  }>): Promise<Record<string, ValidationResultExtended[]>>;
}

/**
 * 验证器工厂接口
 */
export interface ValidatorFactory {
  /**
   * 创建验证器注册表
   * @returns 验证器注册表
   */
  createRegistry(): ValidatorRegistry;

  /**
   * 创建验证器执行器
   * @param registry 验证器注册表
   * @returns 验证器执行器
   */
  createExecutor(registry: ValidatorRegistry): ValidatorExecutor;

  /**
   * 创建内置验证器
   * @returns 内置验证器配置数组
   */
  createBuiltinValidators(): ValidatorConfig[];
}

/**
 * 异步验证器接口
 */
export interface AsyncValidator {
  /**
   * 异步验证函数
   * @param value 待验证值
   * @param context 验证上下文
   * @returns 验证结果Promise
   */
  validate(value: any, context: ValidationContextExtended): Promise<ValidationResultExtended>;

  /**
   * 取消验证
   */
  cancel?(): void;

  /**
   * 验证超时时间（毫秒）
   */
  timeout?: number;
}
