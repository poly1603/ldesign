/**
 * 字段实例实现
 * 
 * @description
 * 提供字段级别的状态管理、验证和数据操作功能
 */

import { isEqual } from 'lodash-es';
import { FieldState } from '@/types/core';
import type {
  FieldInstance,
  FieldConfig,
  ValidationResult,
  FieldChangeEvent,
  EventListener,
  FormInstance,
  EventBus
} from '@/types/core';
import type {
  FieldOperationOptions,
  FieldValidationOptions,
  FieldResetOptions
} from '@/types/field';
import { FieldStateManager } from './state';
import { ValidatorExecutorImpl, createValidatorRegistry } from './validator';
import { EVENT_NAMES } from './events';

/**
 * 字段实例实现
 */
export class Field implements FieldInstance {
  readonly id: string;
  readonly config: FieldConfig;
  readonly form: FormInstance;
  readonly initialValue: any;

  private _value: any;
  private _validation: ValidationResult | null = null;
  private _destroyed = false;
  private stateManager: FieldStateManager;
  private validatorExecutor: ValidatorExecutorImpl;
  private eventBus: EventBus;

  constructor(config: FieldConfig, form: FormInstance) {
    this.id = `field_${config.name}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.config = { ...config };
    this.form = form;
    this.initialValue = config.initialValue ?? config.defaultValue ?? null;
    this._value = this.initialValue;

    // 初始化事件总线
    this.eventBus = form.events;

    // 初始化状态管理器
    this.stateManager = new FieldStateManager(this.id, this.eventBus);

    // 初始化验证器执行器
    const registry = createValidatorRegistry();
    this.validatorExecutor = new ValidatorExecutorImpl(registry, this.eventBus);

    // 触发字段注册事件
    this.eventBus.emit(EVENT_NAMES.FIELD_REGISTER, { fieldName: this.config.name });
  }

  // === 属性访问器 ===

  get value(): any {
    return this._value;
  }

  get state(): Set<FieldState> {
    return new Set(this.stateManager.getStates() as FieldState[]);
  }

  get validation(): ValidationResult | null {
    return this._validation;
  }

  get destroyed(): boolean {
    return this._destroyed;
  }

  // === 值操作方法 ===

  /**
   * 设置字段值
   * @param value 新值
   * @param options 操作选项
   */
  setValue(value: any, options: FieldOperationOptions = {}): void {
    if (this._destroyed) {
      throw new Error(`Field "${this.config.name}" has been destroyed`);
    }

    const oldValue = this._value;
    const hasChanged = !isEqual(oldValue, value);

    if (hasChanged) {
      this._value = value;

      // 同步到表单数据
      if (this.form) {
        this.form.setFieldValue(this.config.name, value, { silent: true, validate: false });
      }

      // 更新状态
      if (!isEqual(value, this.initialValue)) {
        this.stateManager.markDirty();
      } else {
        this.stateManager.markPristine();
      }

      // 触发变化事件
      if (!options.silent) {
        const changeEvent: FieldChangeEvent = {
          fieldName: this.config.name,
          value,
          oldValue,
          type: 'change'
        };

        this.eventBus.emit(EVENT_NAMES.FIELD_CHANGE, changeEvent);

        // 也触发表单变化事件
        if (this.form) {
          const formChangeEvent: import('@/types/core').FormChangeEvent = {
            fieldName: this.config.name,
            value,
            oldValue,
            formData: this.form.data,
            type: 'change'
          };
          this.form.events.emit(EVENT_NAMES.FORM_CHANGE, formChangeEvent);
        }
      }

      // 自动验证
      if (options.validate !== false && this.config.rules?.length) {
        this.validate().catch(error => {
          console.error(`Validation error for field "${this.config.name}":`, error);
        });
      }
    }

    // 标记为已触摸
    if (options.touch !== false) {
      this.touch();
    }
  }

  /**
   * 获取字段值
   * @returns 字段值
   */
  getValue(): any {
    return this._value;
  }

  /**
   * 重置字段
   * @param options 重置选项
   */
  reset(options: FieldResetOptions = {}): void {
    if (this._destroyed) {
      throw new Error(`Field "${this.config.name}" has been destroyed`);
    }

    const resetValue = options.value ?? this.initialValue;
    const oldValue = this._value;

    this._value = resetValue;

    // 重置状态
    if (options.resetState !== false) {
      this.stateManager.markPristine();
      this.stateManager.markUntouched();
    }

    // 重置验证
    if (options.resetValidation !== false) {
      this.clearValidation();
    }

    // 触发重置事件
    if (!options.silent) {
      const changeEvent: FieldChangeEvent = {
        fieldName: this.config.name,
        value: resetValue,
        oldValue,
        type: 'reset'
      };

      this.eventBus.emit(EVENT_NAMES.FIELD_CHANGE, changeEvent);
    }
  }

  // === 状态管理方法 ===

  /**
   * 检查字段状态
   * @param state 状态
   * @returns 是否包含该状态
   */
  hasState(state: FieldState): boolean {
    return this.stateManager.hasState(state);
  }

  /**
   * 添加字段状态
   * @param state 状态
   */
  addState(state: FieldState): void {
    this.stateManager.addState(state);
  }

  /**
   * 移除字段状态
   * @param state 状态
   */
  removeState(state: FieldState): void {
    this.stateManager.removeState(state);
  }

  /**
   * 标记字段为已触摸
   */
  touch(): void {
    this.stateManager.markTouched();
    this.eventBus.emit(EVENT_NAMES.FIELD_TOUCH, { fieldName: this.config.name });
  }

  /**
   * 标记字段为未触摸
   */
  untouch(): void {
    this.stateManager.markUntouched();
  }

  /**
   * 检查字段是否为脏数据
   * @returns 是否为脏数据
   */
  isDirty(): boolean {
    return this.stateManager.isDirty();
  }

  /**
   * 检查字段是否已触摸
   * @returns 是否已触摸
   */
  isTouched(): boolean {
    return this.stateManager.isTouched();
  }

  /**
   * 检查字段是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.stateManager.isValid();
  }

  /**
   * 检查字段是否正在验证
   * @returns 是否正在验证
   */
  isPending(): boolean {
    return this.stateManager.isPending();
  }

  /**
   * 获取所有状态
   * @returns 状态数组
   */
  getStates(): string[] {
    return this.stateManager.getStates();
  }

  /**
   * 设置状态集合
   * @param states 状态数组
   */
  setStates(states: string[]): void {
    this.stateManager.setStates(states as FieldState[]);
  }

  // === 验证方法 ===

  /**
   * 验证字段
   * @param options 验证选项
   * @returns 验证结果
   */
  async validate(options: FieldValidationOptions = {}): Promise<ValidationResult> {
    if (this._destroyed) {
      throw new Error(`Field "${this.config.name}" has been destroyed`);
    }

    const rules = options.rules || this.config.rules || [];

    if (rules.length === 0) {
      const result: ValidationResult = { valid: true };
      this._validation = result;
      this.stateManager.markValid();
      return result;
    }

    // 标记为验证中
    this.stateManager.markPending();

    try {
      const context = {
        fieldName: this.config.name,
        formData: this.form.getValues(),
        fieldConfig: this.config,
        form: this.form,
        ...options.context
      };

      const results = await this.validatorExecutor.executeRules(
        rules,
        this._value,
        context,
        options.stopOnFirstError
      );

      // 合并验证结果
      const hasErrors = results.some(result => !result.valid);
      const firstError = results.find(result => !result.valid);

      const finalResult: ValidationResult = {
        valid: !hasErrors,
        message: firstError?.message,
        code: firstError?.code,
        data: results
      };

      this._validation = finalResult;

      // 更新状态
      if (finalResult.valid) {
        this.stateManager.markValid();
      } else {
        this.stateManager.markInvalid();
      }

      // 触发验证事件
      this.eventBus.emit(EVENT_NAMES.FIELD_VALIDATE, finalResult);

      return finalResult;
    } catch (error) {
      const errorResult: ValidationResult = {
        valid: false,
        message: (error as Error).message || 'Validation error',
        code: 'VALIDATION_ERROR'
      };

      this._validation = errorResult;
      this.stateManager.markInvalid();

      return errorResult;
    }
  }

  /**
   * 清除验证结果
   */
  clearValidation(): void {
    this._validation = null;
    this.stateManager.removeState(FieldState.VALID);
    this.stateManager.removeState(FieldState.INVALID);
    this.stateManager.removeState(FieldState.PENDING);
  }

  // === 事件方法 ===

  /**
   * 监听字段变化事件
   * @param listener 事件监听器
   */
  onChange(listener: EventListener<FieldChangeEvent>): void {
    this.eventBus.on(EVENT_NAMES.FIELD_CHANGE, (event: any) => {
      if (event.fieldName === this.config.name) {
        listener(event);
      }
    });
  }

  /**
   * 监听字段验证事件
   * @param listener 事件监听器
   */
  onValidate(listener: EventListener<ValidationResult>): void {
    this.eventBus.on(EVENT_NAMES.FIELD_VALIDATE, listener);
  }

  /**
   * 取消事件监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  off(event: string, listener: EventListener): void {
    this.eventBus.off(event, listener);
  }

  // === 生命周期方法 ===

  /**
   * 销毁字段实例
   */
  destroy(): void {
    if (this._destroyed) {
      return;
    }

    this._destroyed = true;

    // 清理状态管理器
    this.stateManager.destroy();

    // 触发销毁事件
    this.eventBus.emit(EVENT_NAMES.FIELD_DESTROY, { fieldName: this.config.name });
    this.eventBus.emit(EVENT_NAMES.FIELD_UNREGISTER, { fieldName: this.config.name });
  }
}

/**
 * 创建字段实例
 * @param config 字段配置
 * @param form 表单实例
 * @returns 字段实例
 */
export function createField(config: FieldConfig, form: FormInstance): FieldInstance {
  return new Field(config, form);
}
