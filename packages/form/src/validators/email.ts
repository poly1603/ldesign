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
 * 支持常见的邮箱格式，包括下划线和 IPv6 地址
 */
const DEFAULT_EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?(?:\.[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?)+|\[(?:IPv6:)?[a-fA-F0-9:]+\]|[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?)$/;

/**
 * 邮箱验证器函数
 * @param value 待验证值
 * @param context 验证上下文
 * @returns 验证结果
 */
export const emailValidator: ValidatorFunction = (
  value: any,
  context?: ValidationContext
): ValidationResult => {
  // 如果值为空，则跳过验证（由 required 验证器处理）
  if (value === null || value === undefined || value === '') {
    return { valid: true, message: '' };
  }

  const params = context?.params as EmailValidatorParams | undefined;
  const pattern = params?.pattern || DEFAULT_EMAIL_PATTERN;

  // 检查值类型是否有效（只接受字符串）
  if (typeof value !== 'string') {
    return {
      valid: false,
      message: params?.message || 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    };
  }

  // 基本格式验证
  let isValid = pattern.test(value);

  // 额外的严格验证
  if (isValid) {
    const [localPart, domainPart] = value.split('@');

    // 检查本地部分长度（不超过64字符）
    if (localPart && localPart.length > 64) {
      isValid = false;
    }

    // 检查域名部分（跳过 IPv6 地址）
    if (domainPart && !domainPart.startsWith('[')) {
      // 域名不能以点开头或结尾
      if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
        isValid = false;
      }

      // 域名不能包含连续的点
      if (domainPart.includes('..')) {
        isValid = false;
      }

      // 检查顶级域名长度（至少2个字符，最多10个字符）
      const parts = domainPart.split('.');
      if (parts.length > 1) {
        const tld = parts[parts.length - 1];
        if (tld && (tld.length < 2 || tld.length > 10)) {
          isValid = false;
        }
      } else {
        // 单个域名（没有点）应该被认为是无效的
        isValid = false;
      }
    }

    // 本地部分不能以点开头或结尾
    if (localPart && (localPart.startsWith('.') || localPart.endsWith('.'))) {
      isValid = false;
    }

    // 本地部分不能包含连续的点
    if (localPart && localPart.includes('..')) {
      isValid = false;
    }
  }

  return {
    valid: isValid,
    message: isValid ? '' : (params?.message || 'Please enter a valid email address'),
    code: isValid ? undefined : 'INVALID_EMAIL'
  };
};

/**
 * 创建邮箱验证器
 * @param params 验证器参数或自定义消息
 * @returns 验证器函数
 */
export function email(params: EmailValidatorParams | string = {}): ValidatorFunction {
  // 如果传入的是字符串，则作为自定义消息
  const validatorParams = typeof params === 'string'
    ? { message: params }
    : params;

  return (value: any, context?: ValidationContext): ValidationResult => {
    return emailValidator(value, context ? { ...context, params: validatorParams } : { params: validatorParams } as any);
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
