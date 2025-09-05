/**
 * 状态管理系统实现
 * 
 * @description
 * 提供表单和字段的状态管理功能，包括状态变更、状态检查等
 */

import { FormState, FieldState } from '@/types/core';
import type { EventBus } from '@/types/core';
import { EVENT_NAMES } from './events';

/**
 * 状态管理器基类
 */
abstract class BaseStateManager<T extends string> {
  protected states: Set<T> = new Set();
  protected eventBus?: EventBus;
  protected id: string;
  protected target: 'form' | 'field';

  constructor(id: string, target: 'form' | 'field', eventBus?: EventBus) {
    this.id = id;
    this.target = target;
    this.eventBus = eventBus;
  }

  /**
   * 检查是否包含指定状态
   * @param state 状态
   * @returns 是否包含
   */
  hasState(state: T): boolean {
    return this.states.has(state);
  }

  /**
   * 添加状态
   * @param state 状态
   */
  addState(state: T): void {
    if (!this.states.has(state)) {
      this.states.add(state);
      this.emitStateChange(state, 'add');
    }
  }

  /**
   * 移除状态
   * @param state 状态
   */
  removeState(state: T): void {
    if (this.states.has(state)) {
      this.states.delete(state);
      this.emitStateChange(state, 'remove');
    }
  }

  /**
   * 获取所有状态
   * @returns 状态数组
   */
  getStates(): T[] {
    return Array.from(this.states);
  }

  /**
   * 清空所有状态
   */
  clearStates(): void {
    const currentStates = Array.from(this.states);
    this.states.clear();
    currentStates.forEach(state => {
      this.emitStateChange(state, 'remove');
    });
  }

  /**
   * 设置状态集合
   * @param states 状态数组
   */
  setStates(states: T[]): void {
    const currentStates = new Set(this.states);
    const newStates = new Set(states);

    // 移除不再存在的状态
    currentStates.forEach(state => {
      if (!newStates.has(state)) {
        this.removeState(state);
      }
    });

    // 添加新状态
    newStates.forEach(state => {
      if (!currentStates.has(state)) {
        this.addState(state);
      }
    });
  }

  /**
   * 触发状态变更事件
   * @param state 状态
   * @param action 动作
   */
  private emitStateChange(state: T, action: 'add' | 'remove'): void {
    if (this.eventBus) {
      this.eventBus.emit(EVENT_NAMES.STATE_CHANGE, {
        target: this.target,
        id: this.id,
        state,
        action
      });
    }
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.clearStates();
    this.eventBus = undefined;
  }
}

/**
 * 表单状态管理器
 */
export class FormStateManager extends BaseStateManager<FormState> {
  constructor(formId: string, eventBus?: EventBus) {
    super(formId, 'form', eventBus);
    // 初始化为 pristine 状态
    this.states.add(FormState.PRISTINE);
  }

  /**
   * 检查表单是否为原始状态（未修改）
   * @returns 是否为原始状态
   */
  isPristine(): boolean {
    return this.hasState(FormState.PRISTINE);
  }

  /**
   * 检查表单是否为脏数据（已修改）
   * @returns 是否为脏数据
   */
  isDirty(): boolean {
    return this.hasState(FormState.DIRTY);
  }

  /**
   * 检查表单是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.hasState(FormState.VALID);
  }

  /**
   * 检查表单是否无效
   * @returns 是否无效
   */
  isInvalid(): boolean {
    return this.hasState(FormState.INVALID);
  }

  /**
   * 检查表单是否正在验证
   * @returns 是否正在验证
   */
  isPending(): boolean {
    return this.hasState(FormState.PENDING);
  }

  /**
   * 检查表单是否已提交
   * @returns 是否已提交
   */
  isSubmitted(): boolean {
    return this.hasState(FormState.SUBMITTED);
  }

  /**
   * 标记为脏数据
   */
  markDirty(): void {
    this.removeState(FormState.PRISTINE);
    this.addState(FormState.DIRTY);
  }

  /**
   * 标记为原始状态
   */
  markPristine(): void {
    this.removeState(FormState.DIRTY);
    this.addState(FormState.PRISTINE);
  }

  /**
   * 标记为有效
   */
  markValid(): void {
    this.removeState(FormState.INVALID);
    this.removeState(FormState.PENDING);
    this.addState(FormState.VALID);
  }

  /**
   * 标记为无效
   */
  markInvalid(): void {
    this.removeState(FormState.VALID);
    this.removeState(FormState.PENDING);
    this.addState(FormState.INVALID);
  }

  /**
   * 标记为验证中
   */
  markPending(): void {
    this.removeState(FormState.VALID);
    this.removeState(FormState.INVALID);
    this.addState(FormState.PENDING);
  }

  /**
   * 标记为已提交
   */
  markSubmitted(): void {
    this.addState(FormState.SUBMITTED);
  }
}

/**
 * 字段状态管理器
 */
export class FieldStateManager extends BaseStateManager<FieldState> {
  constructor(fieldId: string, eventBus?: EventBus) {
    super(fieldId, 'field', eventBus);
    // 初始化为 pristine 状态
    this.states.add(FieldState.PRISTINE);
  }

  /**
   * 检查字段是否为原始状态（未修改）
   * @returns 是否为原始状态
   */
  isPristine(): boolean {
    return this.hasState(FieldState.PRISTINE);
  }

  /**
   * 检查字段是否为脏数据（已修改）
   * @returns 是否为脏数据
   */
  isDirty(): boolean {
    return this.hasState(FieldState.DIRTY);
  }

  /**
   * 检查字段是否已触摸
   * @returns 是否已触摸
   */
  isTouched(): boolean {
    return this.hasState(FieldState.TOUCHED);
  }

  /**
   * 检查字段是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.hasState(FieldState.VALID);
  }

  /**
   * 检查字段是否无效
   * @returns 是否无效
   */
  isInvalid(): boolean {
    return this.hasState(FieldState.INVALID);
  }

  /**
   * 检查字段是否正在验证
   * @returns 是否正在验证
   */
  isPending(): boolean {
    return this.hasState(FieldState.PENDING);
  }

  /**
   * 标记为脏数据
   */
  markDirty(): void {
    this.removeState(FieldState.PRISTINE);
    this.addState(FieldState.DIRTY);
  }

  /**
   * 标记为原始状态
   */
  markPristine(): void {
    this.removeState(FieldState.DIRTY);
    this.addState(FieldState.PRISTINE);
  }

  /**
   * 标记为已触摸
   */
  markTouched(): void {
    this.addState(FieldState.TOUCHED);
  }

  /**
   * 标记为未触摸
   */
  markUntouched(): void {
    this.removeState(FieldState.TOUCHED);
  }

  /**
   * 标记为有效
   */
  markValid(): void {
    this.removeState(FieldState.INVALID);
    this.removeState(FieldState.PENDING);
    this.addState(FieldState.VALID);
  }

  /**
   * 标记为无效
   */
  markInvalid(): void {
    this.removeState(FieldState.VALID);
    this.removeState(FieldState.PENDING);
    this.addState(FieldState.INVALID);
  }

  /**
   * 标记为验证中
   */
  markPending(): void {
    this.removeState(FieldState.VALID);
    this.removeState(FieldState.INVALID);
    this.addState(FieldState.PENDING);
  }
}

/**
 * 创建表单状态管理器
 * @param formId 表单ID
 * @param eventBus 事件总线
 * @returns 表单状态管理器
 */
export function createFormStateManager(formId: string, eventBus?: EventBus): FormStateManager {
  return new FormStateManager(formId, eventBus);
}

/**
 * 创建字段状态管理器
 * @param fieldId 字段ID
 * @param eventBus 事件总线
 * @returns 字段状态管理器
 */
export function createFieldStateManager(fieldId: string, eventBus?: EventBus): FieldStateManager {
  return new FieldStateManager(fieldId, eventBus);
}
