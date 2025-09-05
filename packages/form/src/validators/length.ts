/**
 * 长度验证器
 * 
 * @description
 * 验证字符串或数组的长度
 */

import type { ValidatorFunction, ValidationResult, ValidationContext } from '../types/core';
import type { LengthValidatorParams } from '../types/validator';

/**
 * 获取值的长度
 * @param value 待检查的值
 * @returns 长度
 */
function getLength(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length;
  }

  return String(value).length;
}

/**
 * 最小长度验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const minLengthValidator: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  // 如果值为空，则跳过验证（由 required 验证器处理）
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  const params = context.params as LengthValidatorParams | undefined;
  const minLength = params?.min;

  if (minLength === undefined) {
    throw new Error('minLength parameter is required');
  }

  const length = getLength(value);
  const isValid = length >= minLength;

  return {
    valid: isValid,
    message: params?.message || `${context.fieldConfig.label || context.fieldName} must be at least ${minLength} characters`,
    code: 'MIN_LENGTH'
  };
};

/**
 * 最大长度验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const maxLengthValidator: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  // 如果值为空，则跳过验证（由 required 验证器处理）
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  const params = context.params as LengthValidatorParams | undefined;
  const maxLength = params?.max;

  if (maxLength === undefined) {
    throw new Error('maxLength parameter is required');
  }

  const length = getLength(value);
  const isValid = length <= maxLength;

  return {
    valid: isValid,
    message: params?.message || `${context.fieldConfig.label || context.fieldName} must be no more than ${maxLength} characters`,
    code: 'MAX_LENGTH'
  };
};

/**
 * 长度范围验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const lengthValidator: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  // 如果值为空，则跳过验证（由 required 验证器处理）
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  const params = context.params as LengthValidatorParams | undefined;
  const minLength = params?.min;
  const maxLength = params?.max;

  if (minLength === undefined && maxLength === undefined) {
    throw new Error('At least one of min or max length parameter is required');
  }

  const length = getLength(value);
  let isValid = true;
  let message = '';
  let code = '';

  if (minLength !== undefined && length < minLength) {
    isValid = false;
    message = `${context.fieldConfig.label || context.fieldName} must be at least ${minLength} characters`;
    code = 'MIN_LENGTH';
  } else if (maxLength !== undefined && length > maxLength) {
    isValid = false;
    message = `${context.fieldConfig.label || context.fieldName} must be no more than ${maxLength} characters`;
    code = 'MAX_LENGTH';
  }

  if (!isValid && params?.message) {
    message = params.message;
  }

  return {
    valid: isValid,
    message: isValid ? undefined : message,
    code: isValid ? undefined : code
  };
};

/**
 * 创建最小长度验证器
 * @param min 最小长度
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function minLength(min: number, message?: string): ValidatorFunction {
  return (value: any, context: ValidationContext): ValidationResult => {
    return minLengthValidator(value, { ...context, params: { min, message } });
  };
}

/**
 * 创建最大长度验证器
 * @param max 最大长度
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function maxLength(max: number, message?: string): ValidatorFunction {
  return (value: any, context: ValidationContext): ValidationResult => {
    return maxLengthValidator(value, { ...context, params: { max, message } });
  };
}

/**
 * 创建长度范围验证器
 * @param params 验证器参数
 * @returns 验证器函数
 */
export function length(params: LengthValidatorParams): ValidatorFunction {
  return (value: any, context: ValidationContext): ValidationResult => {
    return lengthValidator(value, { ...context, params });
  };
}

/**
 * 最小长度验证器配置
 */
export const minLengthValidatorConfig = {
  name: 'minLength',
  validator: minLengthValidator,
  defaultMessage: 'Value is too short',
  description: 'Validates minimum length',
  paramsSchema: {
    min: { type: 'number', required: true },
    message: { type: 'string' }
  }
};

/**
 * 最大长度验证器配置
 */
export const maxLengthValidatorConfig = {
  name: 'maxLength',
  validator: maxLengthValidator,
  defaultMessage: 'Value is too long',
  description: 'Validates maximum length',
  paramsSchema: {
    max: { type: 'number', required: true },
    message: { type: 'string' }
  }
};

/**
 * 长度验证器配置
 */
export const lengthValidatorConfig = {
  name: 'length',
  validator: lengthValidator,
  defaultMessage: 'Value length is invalid',
  description: 'Validates length range',
  paramsSchema: {
    min: { type: 'number' },
    max: { type: 'number' },
    message: { type: 'string' }
  }
};
