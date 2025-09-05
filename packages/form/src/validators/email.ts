/**
 * 邮箱验证器
 * 
 * @description
 * 验证邮箱地址格式是否正确
 */

import type { ValidatorFunction, ValidationResult, ValidationContext } from '../types/core';
import type { EmailValidatorParams } from '../types/validator';

/**
 * 默认邮箱正则表达式
 * 基于 RFC 5322 标准，但简化版本
 */
const DEFAULT_EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * 邮箱验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const emailValidator: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  // 如果值为空，则跳过验证（由 required 验证器处理）
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  const params = context.params as EmailValidatorParams | undefined;
  const pattern = params?.pattern || DEFAULT_EMAIL_PATTERN;

  // 确保值是字符串
  const stringValue = String(value);

  const isValid = pattern.test(stringValue);

  return {
    valid: isValid,
    message: params?.message || `${context.fieldConfig.label || context.fieldName} must be a valid email address`,
    code: 'INVALID_EMAIL'
  };
};

/**
 * 创建邮箱验证器
 * @param params 验证器参数
 * @returns 验证器函数
 */
export function email(params: EmailValidatorParams = {}): ValidatorFunction {
  return (value: any, context: ValidationContext): ValidationResult => {
    return emailValidator(value, { ...context, params });
  };
}

/**
 * 邮箱验证器配置
 */
export const emailValidatorConfig = {
  name: 'email',
  validator: emailValidator,
  defaultMessage: 'Please enter a valid email address',
  description: 'Validates email address format',
  paramsSchema: {
    pattern: { type: 'regexp' },
    message: { type: 'string' }
  }
};

export default email;
