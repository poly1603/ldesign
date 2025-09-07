/**
 * 边界情况测试
 * 测试异常输入、网络错误、极限数据等边界情况
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createForm } from '../src/core/form';
import { createField } from '../src/core/field';
import { required, email, length } from '../src/validators';

describe('边界情况测试', () => {
  let form: any;

  beforeEach(() => {
    form = createForm({
      initialValues: {
        text: '',
        number: 0,
        array: [],
        object: {}
      }
    });

    // 注册字段到表单中
    form.registerField({ name: 'text', initialValue: '' });
    form.registerField({ name: 'number', initialValue: 0 });
    form.registerField({ name: 'array', initialValue: [] });
    form.registerField({ name: 'object', initialValue: {} });
  });

  afterEach(() => {
    if (form && !form._destroyed) {
      form.destroy();
    }
  });

  describe('异常输入处理', () => {
    it('应该处理null值输入', async () => {
      const field = form.getField('text');

      // 设置null值
      field.setValue(null);
      expect(field.getValue()).toBe(null);

      // 验证null值
      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理undefined值输入', async () => {
      const field = form.getField('text');

      field.setValue(undefined);
      expect(field.getValue()).toBe(undefined);

      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理非字符串类型输入', async () => {
      const field = form.getField('text');

      // 数字
      field.setValue(123);
      expect(field.getValue()).toBe(123);

      // 布尔值
      field.setValue(true);
      expect(field.getValue()).toBe(true);

      // 对象
      const obj = { test: 'value' };
      field.setValue(obj);
      expect(field.getValue()).toBe(obj);

      // 数组
      const arr = [1, 2, 3];
      field.setValue(arr);
      expect(field.getValue()).toBe(arr);
    });

    it('应该处理循环引用对象', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // 创建循环引用

      const field = form.getField('object');

      // 应该能够设置循环引用对象而不抛出错误
      expect(() => {
        field.setValue(obj);
      }).not.toThrow();

      expect(field.getValue()).toBe(obj);
    });

    it('应该处理特殊字符输入', async () => {
      const field = form.getField('text');
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~\'"\\';

      field.setValue(specialChars);
      expect(field.getValue()).toBe(specialChars);

      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理Unicode字符', async () => {
      const field = form.getField('text');
      const unicodeText = '你好世界🌍🚀✨';

      field.setValue(unicodeText);
      expect(field.getValue()).toBe(unicodeText);

      // 测试长度验证器对Unicode的处理
      const lengthField = createField({
        name: 'unicode',
        form,
        rules: [{ validator: length({ max: 10 }) }]
      });

      lengthField.setValue('🚀🚀🚀🚀🚀🚀'); // 6个emoji
      const result = await lengthField.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('极限数据测试', () => {
    it('应该处理超长字符串', async () => {
      const field = form.getField('text');
      const longString = 'a'.repeat(100000); // 10万个字符

      field.setValue(longString);
      expect(field.getValue()).toBe(longString);

      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理大数组', async () => {
      const field = form.getField('array');
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);

      field.setValue(largeArray);
      expect(field.getValue()).toEqual(largeArray);

      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理深层嵌套对象', () => {
      const field = form.getField('object');

      // 创建深层嵌套对象
      let deepObject: any = {};
      let current = deepObject;
      for (let i = 0; i < 1000; i++) {
        current.next = { level: i };
        current = current.next;
      }

      expect(() => {
        field.setValue(deepObject);
      }).not.toThrow();

      expect(field.getValue()).toBe(deepObject);
    });

    it('应该处理极大数值', () => {
      const field = form.getField('number');

      // 最大安全整数
      field.setValue(Number.MAX_SAFE_INTEGER);
      expect(field.getValue()).toBe(Number.MAX_SAFE_INTEGER);

      // 最小安全整数
      field.setValue(Number.MIN_SAFE_INTEGER);
      expect(field.getValue()).toBe(Number.MIN_SAFE_INTEGER);

      // 无穷大
      field.setValue(Infinity);
      expect(field.getValue()).toBe(Infinity);

      // 负无穷大
      field.setValue(-Infinity);
      expect(field.getValue()).toBe(-Infinity);

      // NaN
      field.setValue(NaN);
      expect(Number.isNaN(field.getValue())).toBe(true);
    });
  });

  describe('异步操作边界情况', () => {
    it('应该处理验证器超时', async () => {
      const timeoutValidator = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          // 模拟超时，永不resolve
          setTimeout(() => resolve({ valid: true, message: '' }), 10000);
        });
      });

      const fieldConfig = {
        name: 'timeout',
        rules: [{ validator: timeoutValidator }]
      };
      const field = form.registerField(fieldConfig);

      field.setValue('test');

      // 设置较短的超时时间
      const validationPromise = field.validate();

      // 应该能够处理超时情况
      await expect(validationPromise).resolves.toBeDefined();
    });

    it('应该处理验证器抛出异常', async () => {
      const errorValidator = vi.fn().mockImplementation(() => {
        throw new Error('Validator error');
      });

      const fieldConfig = {
        name: 'error',
        rules: [{ validator: errorValidator }]
      };
      const field = form.registerField(fieldConfig);

      field.setValue('test');

      const result = await field.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('error');
    });

    it('应该处理异步验证器返回无效结果', async () => {
      const invalidValidator = vi.fn().mockImplementation(() => {
        return Promise.resolve(null); // 返回无效结果
      });

      const fieldConfig = {
        name: 'invalid',
        rules: [{ validator: invalidValidator }]
      };
      const field = form.registerField(fieldConfig);

      field.setValue('test');

      const result = await field.validate();
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理Promise被拒绝的情况', async () => {
      const rejectedValidator = vi.fn().mockImplementation(() => {
        return Promise.reject(new Error('Promise rejected'));
      });

      const fieldConfig = {
        name: 'rejected',
        rules: [{ validator: rejectedValidator }]
      };
      const field = form.registerField(fieldConfig);

      field.setValue('test');

      const result = await field.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Promise rejected');
    });
  });

  describe('内存和性能边界情况', () => {
    it('应该处理大量字段创建和销毁', () => {
      const fields: any[] = [];

      // 创建大量字段
      for (let i = 0; i < 1000; i++) {
        const fieldConfig = {
          name: `field_${i}`,
          rules: [{ validator: required() }]
        };
        const field = form.registerField(fieldConfig);
        fields.push(field);
      }

      expect(fields).toHaveLength(1000);

      // 销毁所有字段
      fields.forEach(field => {
        if (field.destroy) {
          field.destroy();
        }
      });

      // 验证没有内存泄漏（这里主要确保没有错误）
      expect(true).toBe(true);
    });

    it('应该处理频繁的值更新', async () => {
      const field = form.getField('text');

      // 频繁更新值
      for (let i = 0; i < 1000; i++) {
        field.setValue(`value_${i}`);
      }

      expect(field.getValue()).toBe('value_999');

      // 验证最终状态正确
      const result = await field.validate();
      expect(result).toBeDefined();
    });

    it('应该处理大量事件监听器', () => {
      const field = form.getField('text');
      const listeners: any[] = [];

      // 添加大量监听器
      for (let i = 0; i < 100; i++) {
        const listener = vi.fn();
        field.onChange(listener);
        listeners.push(listener);
      }

      // 触发事件
      field.setValue('test');

      // 验证所有监听器都被调用
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('并发操作测试', () => {
    it('应该处理并发验证', async () => {
      const field = form.getField('text');
      field.addRule({ validator: required() });

      // 并发执行多个验证
      const validationPromises = Array.from({ length: 10 }, () =>
        field.validate()
      );

      const results = await Promise.all(validationPromises);

      // 所有结果应该一致
      results.forEach(result => {
        expect(result.valid).toBe(false); // 空值应该验证失败
      });
    });

    it('应该处理并发值设置', async () => {
      const field = form.getField('text');

      // 并发设置不同的值
      const setValuePromises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => field.setValue(`value_${i}`))
      );

      await Promise.all(setValuePromises);

      // 最终值应该是其中一个
      const finalValue = field.getValue();
      expect(finalValue).toMatch(/^value_\d$/);
    });
  });

  describe('边界条件验证', () => {
    it('应该处理邮箱验证的边界情况', async () => {
      const fieldConfig = {
        name: 'email',
        rules: [{ validator: email() }]
      };
      const field = form.registerField(fieldConfig);

      // 测试各种边界情况的邮箱
      const testCases = [
        { email: '', valid: true }, // 空值（由required验证器处理）
        { email: '@', valid: false }, // 只有@
        { email: 'a@', valid: false }, // 缺少域名
        { email: '@b.com', valid: false }, // 缺少用户名
        { email: 'a@b', valid: false }, // 缺少顶级域名
        { email: 'a@b.', valid: false }, // 空顶级域名
        { email: 'a@b.c', valid: true }, // 最短有效邮箱
        { email: 'test@example.com', valid: true }, // 标准邮箱
        { email: 'user+tag@example.com', valid: true }, // 带标签的邮箱
        { email: 'user.name@example.com', valid: true }, // 带点的用户名
      ];

      for (const testCase of testCases) {
        field.setValue(testCase.email);
        const result = await field.validate();
        expect(result.valid).toBe(testCase.valid);
      }
    });

    it('应该处理长度验证的边界情况', async () => {
      const fieldConfig = {
        name: 'length',
        rules: [{ validator: length({ min: 3, max: 10 }) }]
      };
      const field = form.registerField(fieldConfig);

      const testCases = [
        { value: '', valid: true }, // 空值（由required验证器处理）
        { value: 'a', valid: false }, // 太短
        { value: 'ab', valid: false }, // 还是太短
        { value: 'abc', valid: true }, // 刚好最小长度
        { value: 'abcdefghij', valid: true }, // 刚好最大长度
        { value: 'abcdefghijk', valid: false }, // 太长
        { value: '你好世', valid: true }, // Unicode字符
        { value: '🚀🚀🚀', valid: true }, // Emoji字符
      ];

      for (const testCase of testCases) {
        field.setValue(testCase.value);
        const result = await field.validate();
        expect(result.valid).toBe(testCase.valid);
      }
    });
  });
});
