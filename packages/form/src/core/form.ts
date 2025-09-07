/**
 * 表单实例实现
 * 
 * @description
 * 提供表单级别的状态管理、字段管理、验证和数据操作功能
 */

import { cloneDeep, isEqual, set, get } from 'lodash-es';
import { FormState } from '../types/core';
import type {
  FormInstance,
  FormConfig,
  FieldInstance,
  ValidationResult,
  FormChangeEvent,
  FormSubmitEvent,
  EventListener,
  EventBus,
  FieldConfig
} from '../types/core';
import type {
  FormOperationOptions,
  FormResetOptions,
  FormValidationOptions,
  FormSubmitOptions,
  FormSnapshot
} from '../types/form';
import { FormStateManager } from './state';
import { createEventBus } from './events';
import { createField } from './field';
import { EVENT_NAMES } from './events';

/**
 * 表单实例实现
 */
export class Form implements FormInstance {
  readonly id: string;
  readonly config: FormConfig;
  readonly events: EventBus;

  private _data: Record<string, any> = {};
  private _initialData: Record<string, any> = {};
  private _fields: Map<string, FieldInstance> = new Map();
  private _validation: Record<string, ValidationResult> = {};
  private _destroyed = false;
  private stateManager: FormStateManager;

  constructor(config: FormConfig = {}) {
    this.id = `form_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.config = { ...config };
    this.events = createEventBus();

    // 初始化状态管理器
    this.stateManager = new FormStateManager(this.id, this.events);

    // 初始化数据
    this._data = cloneDeep(config.initialValues || config.defaultValues || {});

    // 保存初始值的副本
    this._initialData = cloneDeep(this._data);

    // 监听字段变化事件
    this.events.on(EVENT_NAMES.FIELD_CHANGE, this.handleFieldChange.bind(this));
  }

  // === 属性访问器 ===

  get data(): Record<string, any> {
    return { ...this._data };
  }

  get state(): Set<FormState> {
    return new Set(this.stateManager.getStates() as FormState[]);
  }

  get fields(): Map<string, FieldInstance> {
    return new Map(this._fields);
  }

  get validation(): Record<string, ValidationResult> {
    return { ...this._validation };
  }

  get destroyed(): boolean {
    return this._destroyed;
  }

  // === 数据操作方法 ===

  /**
   * 设置字段值
   * @param fieldName 字段名
   * @param value 字段值
   * @param options 操作选项
   */
  setFieldValue(fieldName: string, value: any, options: FormOperationOptions = {}): void {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    const oldValue = get(this._data, fieldName);
    const hasChanged = !isEqual(oldValue, value);

    if (hasChanged) {
      // 更新表单数据
      set(this._data, fieldName, value);

      // 更新字段值
      const field = this._fields.get(fieldName);
      if (field) {
        field.setValue(value, { ...options, silent: true });
      }

      // 更新表单状态
      this.updateFormState();

      // 触发变化事件
      if (!options.silent) {
        const changeEvent: FormChangeEvent = {
          fieldName,
          value,
          oldValue,
          formData: this.data,
          type: 'change'
        };

        this.events.emit(EVENT_NAMES.FORM_CHANGE, changeEvent);
      }

      // 自动验证
      if (options.validate !== false) {
        this.validateField(fieldName).catch(error => {
          console.error(`Validation error for field "${fieldName}":`, error);
        });
      }
    }
  }

  /**
   * 获取字段值
   * @param fieldName 字段名
   * @returns 字段值
   */
  getFieldValue(fieldName: string): any {
    return get(this._data, fieldName);
  }

  /**
   * 获取字段初始值
   * @param fieldName 字段名
   * @returns 字段初始值
   */
  getInitialValue(fieldName: string): any {
    return get(this._initialData, fieldName);
  }

  /**
   * 设置多个字段值
   * @param values 字段值对象
   * @param options 操作选项
   */
  setValues(values: Record<string, any>, options: FormOperationOptions = {}): void {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    const oldData = cloneDeep(this._data);

    if (options.merge !== false) {
      // 合并数据
      Object.keys(values).forEach(key => {
        set(this._data, key, values[key]);
      });
    } else {
      // 替换数据
      this._data = cloneDeep(values);
    }

    // 更新所有字段值
    this._fields.forEach((field, fieldName) => {
      const newValue = get(this._data, fieldName);
      field.setValue(newValue, { ...options, silent: true });
    });

    // 更新表单状态
    this.updateFormState();

    // 触发变化事件
    if (!options.silent) {
      const changeEvent: FormChangeEvent = {
        fieldName: '',
        value: this._data,
        oldValue: oldData,
        formData: this.data,
        type: 'change'
      };

      this.events.emit(EVENT_NAMES.FORM_CHANGE, changeEvent);
    }

    // 自动验证
    if (options.validate !== false) {
      this.validate().catch(error => {
        console.error('Form validation error:', error);
      });
    }
  }

  /**
   * 获取所有字段值
   * @returns 表单数据
   */
  getValues(): Record<string, any> {
    return cloneDeep(this._data);
  }

  /**
   * 重置表单
   * @param options 重置选项
   */
  reset(options: FormResetOptions = {}): void {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    const oldData = cloneDeep(this._data);
    const resetValues = options.values || this.config.initialValues || this.config.defaultValues || {};

    this._data = cloneDeep(resetValues);

    // 重置所有字段
    this._fields.forEach((field) => {
      field.reset({
        value: get(resetValues, field.config.name),
        resetValidation: options.resetValidation,
        resetState: options.resetFieldState,
        silent: true
      });
    });

    // 重置表单状态
    if (options.resetValidation !== false) {
      this.clearValidation();
    }

    this.stateManager.markPristine();

    // 触发重置事件
    if (!options.silent) {
      const changeEvent: FormChangeEvent = {
        fieldName: '',
        value: this._data,
        oldValue: oldData,
        formData: this.data,
        type: 'reset'
      };

      this.events.emit(EVENT_NAMES.FORM_RESET, changeEvent);
    }
  }

  // === 字段管理方法 ===

  /**
   * 注册字段
   * @param fieldConfig 字段配置
   * @returns 字段实例
   */
  registerField(fieldConfig: FieldConfig): FieldInstance {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    if (this._fields.has(fieldConfig.name)) {
      throw new Error(`Field "${fieldConfig.name}" already exists`);
    }

    const field = createField(fieldConfig, this);
    this._fields.set(fieldConfig.name, field);

    // 初始化字段值
    const initialValue = fieldConfig.initialValue ?? fieldConfig.defaultValue ?? get(this._data, fieldConfig.name);
    if (initialValue !== undefined) {
      this.setFieldValue(fieldConfig.name, initialValue, { silent: true, validate: false });
    }

    return field;
  }

  /**
   * 注销字段
   * @param fieldName 字段名
   */
  unregisterField(fieldName: string): void {
    const field = this._fields.get(fieldName);
    if (field) {
      field.destroy();
      this._fields.delete(fieldName);

      // 从表单数据中移除字段值
      delete this._data[fieldName];
      delete this._validation[fieldName];
    }
  }

  /**
   * 获取字段实例
   * @param fieldName 字段名
   * @returns 字段实例
   */
  getField(fieldName: string): FieldInstance | undefined {
    return this._fields.get(fieldName);
  }

  /**
   * 检查字段是否存在
   * @param fieldName 字段名
   * @returns 是否存在
   */
  hasField(fieldName: string): boolean {
    return this._fields.has(fieldName);
  }

  // === 验证方法 ===

  /**
   * 验证表单
   * @param options 验证选项
   * @returns 验证结果
   */
  async validate(options: FormValidationOptions = {}): Promise<Record<string, ValidationResult>> {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    const fieldsToValidate = options.fields || Array.from(this._fields.keys());
    const results: Record<string, ValidationResult> = {};

    // 标记为验证中
    this.stateManager.markPending();

    try {
      // 并行验证所有字段
      const validationPromises = fieldsToValidate.map(async (fieldName) => {
        const field = this._fields.get(fieldName);
        if (field && (!options.dirtyOnly || field.isDirty())) {
          const result = await field.validate();
          return { fieldName, result };
        }
        return null;
      });

      const validationResults = await Promise.all(validationPromises);

      validationResults.forEach((item) => {
        if (item) {
          results[item.fieldName] = item.result;
        }
      });

      // 更新验证结果
      this._validation = { ...this._validation, ...results };

      // 更新表单状态
      const hasErrors = Object.values(results).some(result => !result.valid);
      if (hasErrors) {
        this.stateManager.markInvalid();
      } else {
        this.stateManager.markValid();
      }

      // 触发验证事件
      this.events.emit(EVENT_NAMES.FORM_VALIDATE, results);

      return results;
    } catch (error) {
      this.stateManager.markInvalid();
      throw error;
    }
  }

  /**
   * 验证字段
   * @param fieldName 字段名
   * @returns 验证结果
   */
  async validateField(fieldName: string): Promise<ValidationResult> {
    const field = this._fields.get(fieldName);
    if (!field) {
      throw new Error(`Field "${fieldName}" not found`);
    }

    const result = await field.validate();
    this._validation[fieldName] = result;

    // 更新表单验证状态
    this.updateFormValidationState();

    return result;
  }

  /**
   * 清除验证结果
   * @param fieldNames 字段名数组，不指定则清除所有
   */
  clearValidation(fieldNames?: string[]): void {
    const fieldsToClear = fieldNames || Array.from(this._fields.keys());

    fieldsToClear.forEach((fieldName) => {
      const field = this._fields.get(fieldName);
      if (field) {
        field.clearValidation();
      }
      delete this._validation[fieldName];
    });

    // 更新表单验证状态
    this.updateFormValidationState();
  }

  // === 状态管理方法 ===

  /**
   * 检查表单状态
   * @param state 状态
   * @returns 是否包含该状态
   */
  hasState(state: FormState): boolean {
    return this.stateManager.hasState(state);
  }

  /**
   * 添加表单状态
   * @param state 状态
   */
  addState(state: FormState): void {
    this.stateManager.addState(state);
  }

  /**
   * 移除表单状态
   * @param state 状态
   */
  removeState(state: FormState): void {
    this.stateManager.removeState(state);
  }

  /**
   * 获取表单状态快照
   * @returns 状态快照
   */
  getSnapshot(): FormSnapshot {
    const fieldSnapshots: Record<string, any> = {};

    this._fields.forEach((field, fieldName) => {
      fieldSnapshots[fieldName] = {
        value: field.getValue(),
        state: field.getStates(),
        validation: field.validation
      };
    });

    return {
      data: cloneDeep(this._data),
      state: this.stateManager.getStates() as FormState[],
      fields: fieldSnapshots,
      validation: cloneDeep(this._validation),
      timestamp: Date.now()
    };
  }

  /**
   * 恢复表单状态快照
   * @param snapshot 状态快照
   */
  restoreSnapshot(snapshot: FormSnapshot): void {
    // 恢复数据
    this._data = cloneDeep(snapshot.data);

    // 恢复字段状态
    Object.keys(snapshot.fields).forEach((fieldName) => {
      const field = this._fields.get(fieldName);
      const fieldSnapshot = snapshot.fields[fieldName];

      if (field && fieldSnapshot) {
        field.setValue(fieldSnapshot.value, { silent: true, validate: false });
        field.setStates(fieldSnapshot.state);
      }
    });

    // 恢复表单状态
    this.stateManager.setStates(snapshot.state);

    // 恢复验证结果
    this._validation = cloneDeep(snapshot.validation);
  }

  // === 提交方法 ===

  /**
   * 提交表单
   * @param options 提交选项
   * @returns 提交结果
   */
  async submit(options: FormSubmitOptions = {}): Promise<FormSubmitEvent> {
    if (this._destroyed) {
      throw new Error(`Form "${this.id}" has been destroyed`);
    }

    let validationResults: Record<string, ValidationResult> = {};

    // 验证表单
    if (options.validate !== false) {
      validationResults = await this.validate(options.validationOptions);
    }

    const isValid = Object.values(validationResults).every(result => result.valid);

    // 处理数据
    let submitData = this.getValues();
    if (options.processor) {
      submitData = options.processor.serialize(submitData);
    }

    // 创建提交事件
    const submitEvent: FormSubmitEvent = {
      data: submitData,
      validation: validationResults,
      valid: isValid
    };

    // 标记为已提交
    this.stateManager.markSubmitted();

    // 触发提交事件
    this.events.emit(EVENT_NAMES.FORM_SUBMIT, submitEvent);

    return submitEvent;
  }

  // === 事件方法 ===

  /**
   * 监听表单变化事件
   * @param listener 事件监听器
   */
  onChange(listener: EventListener<FormChangeEvent>): void {
    this.events.on(EVENT_NAMES.FORM_CHANGE, listener);
  }

  /**
   * 监听表单提交事件
   * @param listener 事件监听器
   */
  onSubmit(listener: EventListener<FormSubmitEvent>): void {
    this.events.on(EVENT_NAMES.FORM_SUBMIT, listener);
  }

  /**
   * 监听表单重置事件
   * @param listener 事件监听器
   */
  onReset(listener: EventListener<FormChangeEvent>): void {
    this.events.on(EVENT_NAMES.FORM_RESET, listener);
  }

  /**
   * 取消事件监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  off(event: string, listener: EventListener): void {
    this.events.off(event, listener);
  }

  // === 生命周期方法 ===

  /**
   * 销毁表单实例
   */
  destroy(): void {
    if (this._destroyed) {
      return;
    }

    this._destroyed = true;

    // 销毁所有字段
    this._fields.forEach((field) => {
      field.destroy();
    });
    this._fields.clear();

    // 清理状态管理器
    this.stateManager.destroy();

    // 清理事件总线
    (this.events as any).removeAllListeners?.();

    // 触发销毁事件
    this.events.emit(EVENT_NAMES.FORM_DESTROY, { formId: this.id });
  }

  // === 私有方法 ===

  /**
   * 处理字段变化事件
   * @param event 字段变化事件
   */
  private handleFieldChange(event: FormChangeEvent): void {
    // 同步字段值到表单数据
    set(this._data, event.fieldName, event.value);

    // 更新表单状态
    this.updateFormState();
  }

  /**
   * 更新表单状态
   */
  private updateFormState(): void {
    // 检查是否有脏字段
    const hasDirtyFields = Array.from(this._fields.values()).some(field => field.isDirty());

    // 如果没有注册字段，则检查数据是否与初始值不同
    const initialValues = this.config.initialValues || this.config.defaultValues || {};
    const hasDataChanged = !isEqual(this._data, initialValues);

    if (hasDirtyFields || hasDataChanged) {
      this.stateManager.markDirty();
    } else {
      this.stateManager.markPristine();
    }
  }

  /**
   * 更新表单验证状态
   */
  private updateFormValidationState(): void {
    const hasInvalidFields = Object.values(this._validation).some(result => !result.valid);

    if (hasInvalidFields) {
      this.stateManager.markInvalid();
    } else {
      this.stateManager.markValid();
    }
  }
}

/**
 * 创建表单实例
 * @param config 表单配置
 * @returns 表单实例
 */
export function createForm(config?: FormConfig): FormInstance {
  return new Form(config);
}
