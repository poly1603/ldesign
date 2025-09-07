/**
 * 验证器系统实现
 * 
 * @description
 * 提供验证器注册、执行和管理功能
 */

import type {
  ValidationResult,
  ValidationContext,
  ValidatorFunction,
  ValidationRule,
  EventBus
} from '@/types/core';
import type {
  ValidatorConfig,
  ValidatorRegistry,
  ValidatorExecutor,
  ValidationResultExtended,
  ValidationContextExtended
} from '@/types/validator';
import { EVENT_NAMES } from './events';

/**
 * 验证器注册表实现
 */
export class ValidatorRegistryImpl implements ValidatorRegistry {
  private validators: Map<string, ValidatorConfig> = new Map();

  /**
   * 注册验证器
   * @param config 验证器配置
   */
  register(config: ValidatorConfig): void {
    this.validators.set(config.name, config);
  }

  /**
   * 注册多个验证器
   * @param configs 验证器配置数组
   */
  registerMany(configs: ValidatorConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  /**
   * 获取验证器
   * @param name 验证器名称
   * @returns 验证器配置
   */
  get(name: string): ValidatorConfig | undefined {
    return this.validators.get(name);
  }

  /**
   * 检查验证器是否存在
   * @param name 验证器名称
   * @returns 是否存在
   */
  has(name: string): boolean {
    return this.validators.has(name);
  }

  /**
   * 注销验证器
   * @param name 验证器名称
   */
  unregister(name: string): void {
    this.validators.delete(name);
  }

  /**
   * 获取所有验证器名称
   * @returns 验证器名称数组
   */
  getNames(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * 清空所有验证器
   */
  clear(): void {
    this.validators.clear();
  }
}

/**
 * 验证器执行器实现
 */
export class ValidatorExecutorImpl implements ValidatorExecutor {
  private registry: ValidatorRegistry;
  private eventBus?: EventBus;

  constructor(registry: ValidatorRegistry, eventBus?: EventBus) {
    this.registry = registry;
    this.eventBus = eventBus;
  }

  /**
   * 执行单个验证规则
   * @param rule 验证规则
   * @param value 待验证值
   * @param context 验证上下文
   * @returns 验证结果
   */
  async executeRule(
    rule: ValidationRule,
    value: any,
    context: ValidationContextExtended
  ): Promise<ValidationResultExtended> {
    const startTime = Date.now();

    try {
      // 触发验证开始事件
      this.emitValidationStart(context);

      let validator: ValidatorFunction;
      let validatorName: string;

      if (typeof rule.validator === 'string') {
        // 内置验证器
        validatorName = rule.validator;
        const validatorConfig = this.registry.get(validatorName);
        if (!validatorConfig) {
          throw new Error(`Validator "${validatorName}" not found`);
        }
        validator = validatorConfig.validator;
      } else {
        // 自定义验证器函数
        validatorName = 'custom';
        validator = rule.validator;
      }

      // 执行验证
      const result = await validator(value, {
        ...context,
        validatorName,
        params: rule.params
      });

      const duration = Date.now() - startTime;
      const extendedResult: ValidationResultExtended = {
        ...result,
        validator: validatorName,
        params: rule.params,
        duration,
        timestamp: Date.now()
      };

      // 触发验证结束事件
      this.emitValidationEnd(context, extendedResult);

      return extendedResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult: ValidationResultExtended = {
        valid: false,
        message: rule.message || (error as Error).message || 'Validation error',
        code: 'VALIDATION_ERROR',
        validator: typeof rule.validator === 'string' ? rule.validator : 'custom',
        params: rule.params,
        duration,
        timestamp: Date.now()
      };

      // 触发验证错误事件
      this.emitValidationError(context, error as Error);

      return errorResult;
    }
  }

  /**
   * 执行多个验证规则
   * @param rules 验证规则数组
   * @param value 待验证值
   * @param context 验证上下文
   * @param stopOnFirstError 是否在第一个错误后停止
   * @returns 验证结果数组
   */
  async executeRules(
    rules: ValidationRule[],
    value: any,
    context: ValidationContextExtended,
    stopOnFirstError = false
  ): Promise<ValidationResultExtended[]> {
    const results: ValidationResultExtended[] = [];

    for (const rule of rules) {
      const result = await this.executeRule(rule, value, context);
      results.push(result);

      if (stopOnFirstError && !result.valid) {
        break;
      }
    }

    return results;
  }

  /**
   * 批量执行验证
   * @param validations 验证配置数组
   * @returns 验证结果映射
   */
  async executeBatch(validations: Array<{
    fieldName: string;
    rules: ValidationRule[];
    value: any;
    context: ValidationContextExtended;
  }>): Promise<Record<string, ValidationResultExtended[]>> {
    const results: Record<string, ValidationResultExtended[]> = {};

    // 并行执行所有验证
    const promises = validations.map(async ({ fieldName, rules, value, context }) => {
      const fieldResults = await this.executeRules(rules, value, context);
      return { fieldName, results: fieldResults };
    });

    const batchResults = await Promise.all(promises);

    batchResults.forEach(({ fieldName, results: fieldResults }) => {
      results[fieldName] = fieldResults;
    });

    return results;
  }

  /**
   * 触发验证开始事件
   * @param context 验证上下文
   */
  private emitValidationStart(context: ValidationContextExtended): void {
    if (this.eventBus) {
      this.eventBus.emit(EVENT_NAMES.VALIDATION_START, {
        target: 'field',
        id: context.fieldName
      });
    }
  }

  /**
   * 触发验证结束事件
   * @param context 验证上下文
   * @param result 验证结果
   */
  private emitValidationEnd(context: ValidationContextExtended, result: ValidationResultExtended): void {
    if (this.eventBus) {
      this.eventBus.emit(EVENT_NAMES.VALIDATION_END, {
        target: 'field',
        id: context.fieldName,
        result
      });
    }
  }

  /**
   * 触发验证错误事件
   * @param context 验证上下文
   * @param error 错误对象
   */
  private emitValidationError(context: ValidationContextExtended, error: Error): void {
    if (this.eventBus) {
      this.eventBus.emit(EVENT_NAMES.VALIDATION_ERROR, {
        target: 'field',
        id: context.fieldName,
        error
      });
    }
  }
}

/**
 * 验证器工厂实现
 */
export class ValidatorFactoryImpl {
  /**
   * 创建验证器注册表
   * @returns 验证器注册表
   */
  createRegistry(): ValidatorRegistry {
    return new ValidatorRegistryImpl();
  }

  /**
   * 创建验证器执行器
   * @param registry 验证器注册表
   * @param eventBus 事件总线
   * @returns 验证器执行器
   */
  createExecutor(registry: ValidatorRegistry, eventBus?: EventBus): ValidatorExecutor {
    return new ValidatorExecutorImpl(registry, eventBus);
  }

  /**
   * 创建内置验证器
   * @returns 内置验证器配置数组
   */
  createBuiltinValidators(): ValidatorConfig[] {
    // 这里将在后续实现具体的内置验证器
    return [];
  }
}

/**
 * 创建验证器注册表
 * @returns 验证器注册表
 */
export function createValidatorRegistry(): ValidatorRegistry {
  const registry = new ValidatorRegistryImpl();

  // 注册内置验证器
  try {
    const validatorsModule = require('../validators/index');
    const builtinValidators = validatorsModule.builtinValidators || [];
    builtinValidators.forEach((config: any) => {
      registry.register(config.name, config);
    });
  } catch (error) {
    // 如果无法加载内置验证器，继续使用空注册表
    console.warn('Failed to load builtin validators:', error);
  }

  return registry;
}

/**
 * 创建验证器执行器
 * @param registry 验证器注册表
 * @param eventBus 事件总线
 * @returns 验证器执行器
 */
export function createValidatorExecutor(registry: ValidatorRegistry, eventBus?: EventBus): ValidatorExecutor {
  return new ValidatorExecutorImpl(registry, eventBus);
}

/**
 * 创建验证器工厂
 * @returns 验证器工厂
 */
export function createValidatorFactory(): ValidatorFactoryImpl {
  return new ValidatorFactoryImpl();
}

/**
 * 默认验证器工厂实例
 */
export const validatorFactory = createValidatorFactory();
