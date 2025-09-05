/**
 * 验证器导出
 *
 * @description
 * 导出内置验证器和验证器工厂函数
 */

// === 内置验证器 ===
export {
  required,
  requiredValidator,
  requiredValidatorConfig
} from './required';

export {
  email,
  emailValidator,
  emailValidatorConfig
} from './email';

export {
  minLength,
  maxLength,
  length,
  minLengthValidator,
  maxLengthValidator,
  lengthValidator,
  minLengthValidatorConfig,
  maxLengthValidatorConfig,
  lengthValidatorConfig
} from './length';

// === 内置验证器配置集合 ===
import { requiredValidatorConfig } from './required';
import { emailValidatorConfig } from './email';
import { minLengthValidatorConfig, maxLengthValidatorConfig, lengthValidatorConfig } from './length';

export const builtinValidators = [
  requiredValidatorConfig,
  emailValidatorConfig,
  minLengthValidatorConfig,
  maxLengthValidatorConfig,
  lengthValidatorConfig
];

// === 默认导出 ===
export default {
  required,
  email,
  minLength,
  maxLength,
  length,
  builtinValidators
};
