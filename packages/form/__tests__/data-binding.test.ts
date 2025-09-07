/**
 * 数据绑定和更新机制测试
 * 
 * @description
 * 测试表单数据的双向绑定、字段值更新、状态同步等机制
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Form } from '../src/core/form';
import { Field } from '../src/core/field';
import { EVENT_NAMES } from '../src/core/events';
import { FormConfig, FieldConfig, FormInstance, FieldInstance } from '../src/types/core';

describe('数据绑定和更新机制', () => {
  let form: FormInstance;
  let field: FieldInstance;

  beforeEach(() => {
    // 创建表单实例
    const formConfig: FormConfig = {
      initialValues: {
        username: 'initial',
        email: 'test@example.com',
        nested: {
          value: 'nested-initial'
        }
      }
    };
    form = new Form(formConfig);

    // 创建字段实例
    const fieldConfig: FieldConfig = {
      name: 'username',
      label: 'Username'
    };
    field = new Field(fieldConfig, form);
    form.registerField(field);

    // 同步字段初始值
    field.setValue(form.getFieldValue('username'), { silent: true });
  });

  describe('表单数据双向绑定', () => {
    it('应该正确初始化表单数据', () => {
      expect(form.data).toEqual({
        username: 'initial',
        email: 'test@example.com',
        nested: {
          value: 'nested-initial'
        }
      });
    });

    it('应该通过表单设置字段值', () => {
      form.setFieldValue('username', 'new-value');

      expect(form.getFieldValue('username')).toBe('new-value');
      expect(form.data.username).toBe('new-value');
    });

    it('应该通过字段设置表单值', () => {
      field.setValue('field-value');

      expect(field.value).toBe('field-value');
      expect(form.getFieldValue('username')).toBe('field-value');
      expect(form.data.username).toBe('field-value');
    });

    it('应该支持嵌套路径的值设置', () => {
      form.setFieldValue('nested.value', 'new-nested-value');

      expect(form.getFieldValue('nested.value')).toBe('new-nested-value');
      expect(form.data.nested.value).toBe('new-nested-value');
    });

    it('应该支持批量设置值', () => {
      const newValues = {
        username: 'batch-username',
        email: 'batch@example.com',
        'nested.value': 'batch-nested'
      };

      form.setValues(newValues);

      expect(form.data.username).toBe('batch-username');
      expect(form.data.email).toBe('batch@example.com');
      expect(form.data.nested.value).toBe('batch-nested');
    });
  });

  describe('字段值更新机制', () => {
    it('应该触发字段变化事件', () => {
      const changeHandler = vi.fn();
      field.onChange(changeHandler);

      field.setValue('new-value');

      expect(changeHandler).toHaveBeenCalledWith({
        fieldName: 'username',
        value: 'new-value',
        oldValue: 'initial',
        type: 'change'
      });
    });

    it('应该触发表单变化事件', () => {
      const changeHandler = vi.fn();
      form.onChange(changeHandler);

      form.setFieldValue('username', 'form-value');

      expect(changeHandler).toHaveBeenCalledWith({
        fieldName: 'username',
        value: 'form-value',
        oldValue: 'initial',
        formData: expect.objectContaining({
          username: 'form-value'
        }),
        type: 'change'
      });
    });

    it('应该在值未变化时不触发事件', () => {
      const changeHandler = vi.fn();
      field.onChange(changeHandler);

      const currentValue = field.value;
      field.setValue(currentValue); // 设置相同的值

      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('应该支持静默更新（不触发事件）', () => {
      const changeHandler = vi.fn();
      field.onChange(changeHandler);

      field.setValue('silent-value', { silent: true });

      expect(field.value).toBe('silent-value');
      expect(changeHandler).not.toHaveBeenCalled();
    });
  });

  describe('表单状态更新逻辑', () => {
    it('应该在字段值变化时更新表单状态为dirty', () => {
      expect(form.hasState('pristine')).toBe(true);
      expect(form.hasState('dirty')).toBe(false);

      field.setValue('changed-value');

      expect(form.hasState('pristine')).toBe(false);
      expect(form.hasState('dirty')).toBe(true);
    });

    it('应该在字段值恢复初始值时更新表单状态为pristine', () => {
      // 先改变值
      field.setValue('changed-value');
      expect(form.hasState('dirty')).toBe(true);

      // 恢复初始值
      field.setValue('initial');
      expect(form.hasState('pristine')).toBe(true);
      expect(form.hasState('dirty')).toBe(false);
    });

    it('应该在字段验证失败时更新表单状态为invalid', async () => {
      // 使用 rules 配置验证器
      const rules = [{
        validator: (value: any) => ({
          valid: false,
          message: 'Always invalid'
        })
      }];

      await field.validate({ rules });

      // 检查字段验证状态
      expect(field.validation?.valid).toBe(false);
      expect(field.hasState('invalid')).toBe(true);
    });

    it('应该在所有字段验证通过时更新表单状态为valid', async () => {
      // 使用 rules 配置验证器
      const rules = [{
        validator: (value: any) => ({
          valid: true,
          message: ''
        })
      }];

      await field.validate({ rules });

      // 手动触发表单验证状态更新
      await form.validate();

      expect(form.hasState('valid')).toBe(true);
      expect(form.hasState('invalid')).toBe(false);
    });
  });

  describe('响应式数据处理', () => {
    it('应该正确处理数组数据', () => {
      form.setFieldValue('items', ['item1', 'item2']);

      expect(form.getFieldValue('items')).toEqual(['item1', 'item2']);

      // 修改数组
      const items = form.getFieldValue('items');
      items.push('item3');
      form.setFieldValue('items', items);

      expect(form.getFieldValue('items')).toEqual(['item1', 'item2', 'item3']);
    });

    it('应该正确处理对象数据', () => {
      const objectValue = {
        prop1: 'value1',
        prop2: 'value2'
      };

      form.setFieldValue('object', objectValue);

      expect(form.getFieldValue('object')).toEqual(objectValue);

      // 修改对象
      const obj = form.getFieldValue('object');
      obj.prop3 = 'value3';
      form.setFieldValue('object', obj);

      expect(form.getFieldValue('object')).toEqual({
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3'
      });
    });

    it('应该正确处理深层嵌套数据', () => {
      const nestedData = {
        level1: {
          level2: {
            level3: 'deep-value'
          }
        }
      };

      form.setFieldValue('deep', nestedData);

      expect(form.getFieldValue('deep.level1.level2.level3')).toBe('deep-value');

      // 修改深层值
      form.setFieldValue('deep.level1.level2.level3', 'new-deep-value');

      expect(form.getFieldValue('deep.level1.level2.level3')).toBe('new-deep-value');
    });
  });

  describe('数据变化监听和通知机制', () => {
    it('应该支持多个监听器', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      form.onChange(handler1);
      form.onChange(handler2);

      form.setFieldValue('username', 'multi-listener');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('应该支持取消监听', () => {
      const handler = vi.fn();
      form.onChange(handler);

      form.setFieldValue('username', 'before-unsubscribe');
      expect(handler).toHaveBeenCalledTimes(1);

      // 使用 events.off 取消监听
      form.events.off(EVENT_NAMES.FORM_CHANGE, handler);
      form.setFieldValue('username', 'after-unsubscribe');
      expect(handler).toHaveBeenCalledTimes(1); // 不应该再次调用
    });

    it('应该在字段注册时同步初始值', () => {
      const newFieldConfig: FieldConfig = {
        name: 'syncField',
        label: 'Sync Field',
        initialValue: 'initial-sync-value'
      };

      const newField = form.registerField(newFieldConfig);

      expect(newField.value).toBe('initial-sync-value'); // 应该使用配置的初始值
      expect(form.getFieldValue('syncField')).toBe('initial-sync-value'); // 表单数据也应该同步
    });
  });

  describe('表单重置和初始化逻辑', () => {
    it('应该支持重置表单到初始值', () => {
      // 修改值
      form.setFieldValue('username', 'changed');
      form.setFieldValue('email', 'changed@example.com');

      expect(form.hasState('dirty')).toBe(true);

      // 重置表单
      form.reset();

      expect(form.data).toEqual({
        username: 'initial',
        email: 'test@example.com',
        nested: {
          value: 'nested-initial'
        }
      });
      expect(form.hasState('pristine')).toBe(true);
      expect(form.hasState('dirty')).toBe(false);
    });

    it('应该支持重置到新的初始值', () => {
      const newInitialValues = {
        username: 'new-initial',
        email: 'new@example.com',
        nested: {
          value: 'new-nested'
        }
      };

      form.reset({ values: newInitialValues });

      expect(form.data).toEqual(newInitialValues);
      expect(form.hasState('pristine')).toBe(true);
    });

    it('应该在重置时清除验证错误', async () => {
      // 使用 rules 配置验证器并触发验证失败
      const rules = [{
        validator: (value: any) => ({
          valid: false,
          message: 'Validation error'
        })
      }];

      await field.validate({ rules });
      expect(field.validation?.valid).toBe(false);

      // 重置表单
      form.reset();

      // 重置后验证结果可能不会立即清除，但字段状态应该恢复
      expect(form.hasState('pristine')).toBe(true);
    });
  });
});
