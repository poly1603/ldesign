/**
 * 必填验证器
 * 
 * @description
 * 验证字段是否为必填项
 */

import type { ValidatorFunction, ValidationResult, ValidationContext } from '@/types/core';
import type { RequiredValidatorParams } from '@/types/validator';

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
  context: ValidationContext
): ValidationResult => {
  const params = context.params as RequiredValidatorParams | undefined;
  const required = params?.required ?? true;
  
  if (!required) {
    return { valid: true };
  }
  
  const isValueEmpty = isEmpty(value);
  
  return {
    valid: !isValueEmpty,
    message: params?.message || `${context.fieldConfig.label || context.fieldName} is required`,
    code: 'REQUIRED'
  };
};

/**
 * 创建必填验证器
 * @param params 验证器参数
 * @returns 验证器函数
 */
export function required(params: RequiredValidatorParams = {}): ValidatorFunction {
  return (value: any, context: ValidationContext): ValidationResult => {
    return requiredValidator(value, { ...context, params });
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
