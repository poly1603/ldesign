/**
 * 必填验证器
 * 
 * @description
 * 验证字段是否为必填项
 */

import type { ValidatorFunction, ValidationResult, ValidationContext } from '../types/core';
import type { RequiredValidatorParams } from '../types/validator';

/**
 * 检查值是否为空
 * @param value 待检查的值
 * @returns 是否为空
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Date) {
    return false; // Date 对象总是被认为是有值的
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * 必填验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const requiredValidator: ValidatorFunction = (
  value: any,
  context?: ValidationContext
): ValidationResult => {
  const params = context?.params as RequiredValidatorParams | undefined;
  const required = params?.required ?? true;

  if (!required) {
    return { valid: true };
  }

  const isValueEmpty = isEmpty(value);

  // 获取字段标识符用于错误消息
  const fieldIdentifier = context?.fieldConfig?.label || context?.fieldName || 'Field';

  return {
    valid: !isValueEmpty,
    message: isValueEmpty ? (params?.message || 'This field is required') : '',
    code: isValueEmpty ? 'REQUIRED' : undefined
  };
};

/**
 * 创建必填验证器
 * @param params 验证器参数或自定义消息
 * @returns 验证器函数
 */
export function required(params: RequiredValidatorParams | string = {}): ValidatorFunction {
  // 如果传入的是字符串，则作为自定义消息
  const validatorParams = typeof params === 'string'
    ? { message: params }
    : params;

  return (value: any, context?: ValidationContext): ValidationResult => {
    return requiredValidator(value, context ? { ...context, params: validatorParams } : { params: validatorParams } as any);
  };
}

/**
 * 必填验证器配置
 */
export const requiredValidatorConfig = {
  name: 'required',
  validator: requiredValidator,
  defaultMessage: 'This field is required',
  description: 'Validates that a field has a value',
  paramsSchema: {
    required: { type: 'boolean', default: true },
    message: { type: 'string' }
  }
};

export default required;
