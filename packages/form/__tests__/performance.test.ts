/**
 * 性能测试
 * 测试大量数据渲染、频繁操作等性能场景
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createForm } from '../src/core/form';
import { createField } from '../src/core/field';
import { required, email, length } from '../src/validators';

describe('性能测试', () => {
  let form: any;

  beforeEach(() => {
    form = createForm({
      initialValues: {}
    });
  });

  afterEach(() => {
    if (form && !form._destroyed) {
      form.destroy();
    }
  });

  describe('大量字段性能测试', () => {
    it('应该能够快速创建大量字段', () => {
      const startTime = performance.now();
      const fieldCount = 1000;
      const fields: any[] = [];

      // 创建1000个字段
      for (let i = 0; i < fieldCount; i++) {
        const fieldConfig = {
          name: `field_${i}`,
          rules: [{ validator: required() }]
        };
        const field = form.registerField(fieldConfig);
        fields.push(field);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(fields).toHaveLength(fieldCount);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`创建${fieldCount}个字段耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够快速设置大量字段的值', () => {
      const fieldCount = 1000;
      const fields: any[] = [];

      // 先创建字段
      for (let i = 0; i < fieldCount; i++) {
        const fieldConfig = {
          name: `field_${i}`
        };
        const field = form.registerField(fieldConfig);
        fields.push(field);
      }

      const startTime = performance.now();

      // 设置所有字段的值
      fields.forEach((field, index) => {
        field.setValue(`value_${index}`);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 应该在500ms内完成

      console.log(`设置${fieldCount}个字段值耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够快速验证大量字段', async () => {
      const fieldCount = 100; // 减少数量因为验证是异步的
      const fields: any[] = [];

      // 创建字段
      for (let i = 0; i < fieldCount; i++) {
        const fieldConfig = {
          name: `field_${i}`,
          rules: [{ validator: required() }]
        };
        const field = form.registerField(fieldConfig);
        field.setValue(i % 2 === 0 ? `value_${i}` : ''); // 一半有值，一半为空
        fields.push(field);
      }

      const startTime = performance.now();

      // 并行验证所有字段
      const validationPromises = fields.map(field => field.validate());
      const results = await Promise.all(validationPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(fieldCount);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`验证${fieldCount}个字段耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('频繁操作性能测试', () => {
    it('应该能够处理频繁的值更新', () => {
      const fieldConfig = {
        name: 'frequent_update'
      };
      const field = form.registerField(fieldConfig);

      const updateCount = 10000;
      const startTime = performance.now();

      // 频繁更新值
      for (let i = 0; i < updateCount; i++) {
        field.setValue(`value_${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(field.getValue()).toBe(`value_${updateCount - 1}`);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`${updateCount}次值更新耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够处理频繁的事件监听器添加和移除', () => {
      const field = createField({
        name: 'frequent_listeners',
        form
      });

      const listenerCount = 1000;
      const listeners: any[] = [];

      const startTime = performance.now();

      // 添加大量监听器
      for (let i = 0; i < listenerCount; i++) {
        const listener = vi.fn();
        field.onChange(listener);
        listeners.push(listener);
      }

      // 触发事件
      field.setValue('test');

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 验证所有监听器都被调用
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith('test');
      });

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`${listenerCount}个监听器添加和触发耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够处理频繁的表单数据更新', () => {
      const updateCount = 1000;
      const startTime = performance.now();

      // 频繁更新表单数据
      for (let i = 0; i < updateCount; i++) {
        form.setFieldValue(`field_${i % 10}`, `value_${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`${updateCount}次表单数据更新耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('大数据量性能测试', () => {
    it('应该能够处理大型表单数据', () => {
      const largeData: any = {};

      // 创建大型数据对象
      for (let i = 0; i < 10000; i++) {
        largeData[`field_${i}`] = {
          value: `value_${i}`,
          metadata: {
            created: new Date(),
            updated: new Date(),
            tags: [`tag1_${i}`, `tag2_${i}`, `tag3_${i}`]
          }
        };
      }

      const startTime = performance.now();

      // 设置大型数据
      form.setValues(largeData);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(Object.keys(form.data)).toHaveLength(10000);
      expect(duration).toBeLessThan(2000); // 应该在2秒内完成

      console.log(`设置10000个字段的大型数据耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够快速序列化大型表单数据', () => {
      // 先设置大量数据
      for (let i = 0; i < 1000; i++) {
        form.setFieldValue(`field_${i}`, {
          text: `text_${i}`,
          number: i,
          array: Array.from({ length: 10 }, (_, j) => `item_${j}`),
          nested: {
            deep: {
              value: `deep_value_${i}`
            }
          }
        });
      }

      const startTime = performance.now();

      // 序列化数据
      const serialized = JSON.stringify(form.data);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(serialized).toBeDefined();
      expect(serialized.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`序列化大型表单数据耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够快速克隆大型表单数据', () => {
      // 设置复杂数据
      const complexData: any = {};
      for (let i = 0; i < 1000; i++) {
        complexData[`field_${i}`] = {
          id: i,
          name: `name_${i}`,
          items: Array.from({ length: 10 }, (_, j) => ({
            id: j,
            value: `item_${i}_${j}`
          })),
          metadata: {
            created: new Date(),
            tags: [`tag1`, `tag2`, `tag3`]
          }
        };
      }

      form.setValues(complexData);

      const startTime = performance.now();

      // 克隆数据
      const cloned = JSON.parse(JSON.stringify(form.data));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(cloned).toEqual(form.data);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`克隆复杂表单数据耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('内存使用性能测试', () => {
    it('应该能够正确清理大量字段的内存', () => {
      const fieldCount = 1000;
      const fields: any[] = [];

      // 创建大量字段
      for (let i = 0; i < fieldCount; i++) {
        const fieldConfig = {
          name: `field_${i}`,
          rules: [{ validator: required() }]
        };
        const field = form.registerField(fieldConfig);
        fields.push(field);
      }

      const startTime = performance.now();

      // 销毁所有字段
      fields.forEach(field => {
        if (field.destroy) {
          field.destroy();
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 应该在500ms内完成

      console.log(`销毁${fieldCount}个字段耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够处理大量表单实例的创建和销毁', () => {
      const formCount = 100;
      const forms: any[] = [];

      const startTime = performance.now();

      // 创建大量表单
      for (let i = 0; i < formCount; i++) {
        const testForm = createForm({
          initialValues: {
            field1: `value1_${i}`,
            field2: `value2_${i}`,
            field3: `value3_${i}`
          }
        });
        forms.push(testForm);
      }

      // 销毁所有表单
      forms.forEach(testForm => {
        testForm.destroy();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`创建和销毁${formCount}个表单实例耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('复杂验证性能测试', () => {
    it('应该能够快速执行复杂的验证链', async () => {
      const fieldConfig = {
        name: 'complex_validation',
        rules: [
          { validator: required() },
          { validator: length({ min: 5, max: 50 }) },
          { validator: email() },
          // 自定义复杂验证器
          {
            validator: (value: string) => {
              // 模拟复杂验证逻辑
              const parts = value.split('@');
              if (parts.length !== 2) return { valid: false, message: 'Invalid format' };

              const [local, domain] = parts;
              if (local.length < 3) return { valid: false, message: 'Local part too short' };
              if (domain.split('.').length < 2) return { valid: false, message: 'Invalid domain' };

              return { valid: true, message: '' };
            }
          }
        ]
      };

      const field = form.registerField(fieldConfig);

      const testValues = [
        'test@example.com',
        'user.name@domain.co.uk',
        'complex.email+tag@subdomain.example.org'
      ];

      const startTime = performance.now();

      // 执行多次复杂验证
      for (const value of testValues) {
        field.setValue(value);
        await field.validate();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 应该在100ms内完成

      console.log(`复杂验证链执行耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该能够并行处理多个异步验证', async () => {
      const fieldCount = 50;
      const fields: any[] = [];

      // 创建带异步验证的字段
      for (let i = 0; i < fieldCount; i++) {
        const fieldConfig = {
          name: `async_field_${i}`,
          rules: [{
            validator: (value: string) => {
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve({
                    valid: value.length > 3,
                    message: value.length > 3 ? '' : 'Too short'
                  });
                }, Math.random() * 10); // 随机延迟0-10ms
              });
            }
          }]
        };
        const field = form.registerField(fieldConfig);
        field.setValue(`value_${i}`);
        fields.push(field);
      }

      const startTime = performance.now();

      // 并行执行所有异步验证
      const validationPromises = fields.map(field => field.validate());
      const results = await Promise.all(validationPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(fieldCount);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成

      console.log(`${fieldCount}个异步验证并行执行耗时: ${duration.toFixed(2)}ms`);
    });
  });
});
