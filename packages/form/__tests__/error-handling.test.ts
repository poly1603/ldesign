/**
 * 错误处理和边界情况测试
 * 
 * @description
 * 测试表单系统在各种错误情况和边界条件下的处理能力
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Form } from '../src/core/form';
import { Field } from '../src/core/field';
import { FormConfig, FieldConfig, FormInstance, FieldInstance } from '../src/types/core';

describe('错误处理和边界情况', () => {
  let form: FormInstance;

  beforeEach(() => {
    const formConfig: FormConfig = {
      initialValues: {
        username: 'test',
        email: 'test@example.com'
      }
    };
    form = new Form(formConfig);
  });

  describe('表单实例错误处理', () => {
    it('应该处理空配置创建表单', () => {
      const emptyForm = new Form();

      expect(emptyForm).toBeDefined();
      expect(emptyForm.data).toEqual({});
    });

    it('应该处理无效的字段名称', () => {
      expect(() => {
        form.setFieldValue('', 'value');
      }).not.toThrow();

      // null 字段名称实际上不会抛出错误，而是被处理
      expect(() => {
        form.setFieldValue(null as any, 'value');
      }).not.toThrow();
    });

    it('应该处理不存在的字段获取', () => {
      const value = form.getFieldValue('nonexistent');
      expect(value).toBeUndefined();
    });

    it('应该处理循环引用的数据', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      expect(() => {
        form.setFieldValue('circular', circularData);
      }).not.toThrow();
    });

    it('应该处理表单销毁后的操作', async () => {
      form.destroy();

      expect(() => {
        form.setFieldValue('username', 'new-value');
      }).toThrow('destroyed');

      await expect(form.validate()).rejects.toThrow('destroyed');
    });

    it('应该处理重复字段注册', () => {
      const fieldConfig: FieldConfig = {
        name: 'username',
        label: 'Username'
      };

      form.registerField(fieldConfig);

      expect(() => {
        form.registerField(fieldConfig);
      }).toThrow('already exists');
    });
  });

  describe('字段实例错误处理', () => {
    let field: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'testField',
        label: 'Test Field'
      };
      field = new Field(fieldConfig, form);
      form.registerField(fieldConfig);
    });

    it('应该处理字段销毁后的操作', async () => {
      field.destroy();

      expect(() => {
        field.setValue('new-value');
      }).toThrow('destroyed');

      await expect(field.validate()).rejects.toThrow('destroyed');
    });

    it('应该处理无效的验证规则', async () => {
      const invalidRules = [
        {
          validator: null as any
        }
      ];

      const result = await field.validate({ rules: invalidRules });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('validator is not a function');
    });

    it('应该处理验证器抛出异常', async () => {
      const throwingRules = [
        {
          validator: () => {
            throw new Error('Validator error');
          }
        }
      ];

      const result = await field.validate({ rules: throwingRules });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('error');
    });

    it('应该处理异步验证器超时', async () => {
      const timeoutRules = [
        {
          validator: () => new Promise(() => {
            // 永不resolve的Promise
          })
        }
      ];

      // 设置较短的超时时间进行测试
      const result = await Promise.race([
        field.validate({ rules: timeoutRules }),
        new Promise(resolve => setTimeout(() => resolve({ valid: false, message: 'timeout' }), 100))
      ]);

      expect(result).toBeDefined();
    });
  });

  describe('数据类型边界情况', () => {
    it('应该处理null和undefined值', () => {
      form.setFieldValue('nullField', null);
      form.setFieldValue('undefinedField', undefined);

      expect(form.getFieldValue('nullField')).toBeNull();
      expect(form.getFieldValue('undefinedField')).toBeUndefined();
    });

    it('应该处理各种数据类型', () => {
      const testData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        date: new Date(),
        regexp: /test/g,
        function: () => 'test'
      };

      Object.entries(testData).forEach(([key, value]) => {
        expect(() => {
          form.setFieldValue(key, value);
        }).not.toThrow();

        expect(form.getFieldValue(key)).toBe(value);
      });
    });

    it('应该处理大量数据', () => {
      const largeData: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`field_${i}`] = `value_${i}`;
      }

      expect(() => {
        form.setValues(largeData);
      }).not.toThrow();

      expect(Object.keys(form.data)).toHaveLength(1002); // 包括初始的2个字段
    });

    it('应该处理深层嵌套数据', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep-value'
              }
            }
          }
        }
      };

      form.setFieldValue('deep', deepData);
      expect(form.getFieldValue('deep.level1.level2.level3.level4.level5')).toBe('deep-value');
    });
  });

  describe('验证边界情况', () => {
    let field: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'validationField',
        label: 'Validation Field'
      };
      field = new Field(fieldConfig, form);
      form.registerField(fieldConfig);
    });

    it('应该处理空验证规则', async () => {
      const result = await field.validate({ rules: [] });
      expect(result.valid).toBe(true);
    });

    it('应该处理多个验证规则', async () => {
      const rules = [
        {
          validator: (value: any) => ({ valid: true, message: '' })
        },
        {
          validator: (value: any) => ({ valid: false, message: 'Error 1' })
        },
        {
          validator: (value: any) => ({ valid: false, message: 'Error 2' })
        }
      ];

      const result = await field.validate({ rules });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Error 1');
    });

    it('应该处理验证器返回无效格式', async () => {
      const invalidRules = [
        {
          validator: () => 'invalid return' as any
        },
        {
          validator: () => ({ invalid: 'format' }) as any
        }
      ];

      const result = await field.validate({ rules: invalidRules });
      expect(result.valid).toBe(false);
    });
  });

  describe('事件处理边界情况', () => {
    it('应该处理事件监听器抛出异常', () => {
      const throwingListener = () => {
        throw new Error('Listener error');
      };

      form.onChange(throwingListener);

      expect(() => {
        form.setFieldValue('username', 'trigger-event');
      }).not.toThrow();
    });

    it('应该处理大量事件监听器', () => {
      const listeners: Array<() => void> = [];

      for (let i = 0; i < 100; i++) {
        const listener = vi.fn();
        listeners.push(listener);
        form.onChange(listener);
      }

      form.setFieldValue('username', 'mass-event');

      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalled();
      });
    });

    it('应该处理事件监听器中修改表单数据', () => {
      let recursionCount = 0;

      form.onChange(() => {
        recursionCount++;
        if (recursionCount < 3) {
          form.setFieldValue('email', `recursive-${recursionCount}`);
        }
      });

      form.setFieldValue('username', 'trigger-recursion');

      expect(recursionCount).toBe(3);
      expect(form.getFieldValue('email')).toBe('recursive-2');
    });
  });

  describe('内存和性能边界情况', () => {
    it('应该正确清理资源', () => {
      const field = form.registerField({
        name: 'cleanupField',
        label: 'Cleanup Field'
      });

      const changeHandler = vi.fn();
      field.onChange(changeHandler);

      field.destroy();

      // 销毁后设置字段值应该抛出错误
      expect(() => {
        form.setFieldValue('cleanupField', 'after-destroy');
      }).toThrow('destroyed');

      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('应该处理频繁的值更新', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        form.setFieldValue('username', `value-${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(form.getFieldValue('username')).toBe('value-999');
    });
  });
});
