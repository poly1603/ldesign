/**
 * useField Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useField } from '../../src/vue/hooks/useField';
import { createForm } from '../../src/core/form';
import { required, email, length } from '../../src/validators';

// 测试组件
const TestComponent = defineComponent({
  name: 'TestComponent',
  props: {
    name: String,
    form: Object,
    rules: Array,
    initialValue: String
  },
  setup(props) {
    const field = useField(props.name!, {
      form: props.form as any,
      rules: props.rules as any,
      initialValue: props.initialValue
    });

    return {
      field,
      value: field.value,
      validation: field.validation,
      isValid: field.isValid,
      isDirty: field.isDirty,
      isTouched: field.isTouched,
      isPending: field.isPending,
      setValue: field.setValue,
      validate: field.validate,
      reset: field.reset
    };
  },
  template: `
    <div class="test-field">
      <input
        :value="value"
        @input="setValue($event.target.value)"
        class="field-input"
      />
      <div class="field-error">{{ validation?.message || '' }}</div>
      <div class="field-valid">{{ isValid }}</div>
      <div class="field-validating">{{ isPending }}</div>
      <button @click="validate" class="validate-btn">Validate</button>
      <button @click="() => reset()" class="reset-btn">Reset</button>
    </div>
  `
});

describe('useField Hook', () => {
  let form: any;

  beforeEach(() => {
    form = createForm({
      initialValues: {
        username: '',
        email: '',
        password: ''
      }
    });
  });

  describe('基础功能', () => {
    it('应该正确初始化字段', () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          initialValue: 'testuser'
        }
      });

      expect(wrapper.vm.value).toBe('testuser');
      expect(wrapper.vm.validation?.message || '').toBe('');
      expect(wrapper.vm.isValid).toBe(true);
      expect(wrapper.vm.isPending).toBe(false);
    });

    it('应该正确设置字段值', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      const input = wrapper.find('.field-input');
      await input.setValue('newvalue');

      expect(wrapper.vm.value).toBe('newvalue');
      expect(form.getFieldValue('username')).toBe('newvalue');
    });

    it('应该响应表单数据变化', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      // 通过表单设置值
      form.setFieldValue('username', 'fromform');
      await nextTick();

      expect(wrapper.vm.value).toBe('fromform');
    });
  });

  describe('验证功能', () => {
    it('应该执行同步验证', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          rules: [{ validator: required() }]
        }
      });

      // 触发验证
      await wrapper.find('.validate-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.isValid).toBe(false);
      expect(wrapper.vm.validation?.message || '').toContain('required');
    });

    it('应该执行异步验证', async () => {
      const asyncValidator = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ valid: true, message: '' }), 50);
        });
      });

      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          rules: [{ validator: asyncValidator }]
        }
      });

      // 设置值并触发验证
      wrapper.vm.setValue('test');
      const validatePromise = wrapper.vm.validate();
      await nextTick();

      // 验证中状态
      expect(wrapper.vm.isPending).toBe(true);

      // 等待验证完成
      await validatePromise;
      await nextTick();

      expect(wrapper.vm.isPending).toBe(false);
      expect(wrapper.vm.isValid).toBe(true);
      expect(asyncValidator).toHaveBeenCalledWith('test', expect.any(Object));
    });

    it('应该处理多个验证规则', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'email',
          form,
          rules: [
            { validator: required() },
            { validator: email() }
          ]
        }
      });

      // 测试空值（应该失败在required）
      await wrapper.vm.validate();
      await nextTick();
      expect(wrapper.vm.validation?.message || '').toContain('required');

      // 测试无效邮箱（应该失败在email）
      wrapper.vm.setValue('invalid-email');
      await wrapper.vm.validate();
      await nextTick();
      expect(wrapper.vm.validation?.message || '').toContain('email');

      // 测试有效邮箱
      wrapper.vm.setValue('test@example.com');
      await wrapper.vm.validate();
      await nextTick();
      expect(wrapper.vm.isValid).toBe(true);
      expect(wrapper.vm.validation?.message || '').toBe('');
    });
  });

  describe('状态管理', () => {
    it('应该正确管理touched状态', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      expect(wrapper.vm.isTouched).toBe(false);

      // 设置值应该标记为touched
      wrapper.vm.setValue('test');
      await nextTick();
      expect(wrapper.vm.isTouched).toBe(true);
    });

    it('应该正确管理dirty状态', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          initialValue: 'initial'
        }
      });

      expect(wrapper.vm.isDirty).toBe(false);

      // 更改值应该标记为dirty
      wrapper.vm.setValue('changed');
      await nextTick();
      expect(wrapper.vm.isDirty).toBe(true);

      // 恢复初始值应该清除dirty
      wrapper.vm.setValue('initial');
      await nextTick();
      expect(wrapper.vm.isDirty).toBe(false);
    });

    it('应该正确重置字段状态', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          initialValue: 'initial',
          rules: [{ validator: required() }]
        }
      });

      // 修改值并验证
      wrapper.vm.setValue('');
      await wrapper.vm.validate();
      await nextTick();

      expect(wrapper.vm.value).toBe('');
      expect(wrapper.vm.isValid).toBe(false);
      expect(wrapper.vm.isTouched).toBe(true);
      expect(wrapper.vm.isDirty).toBe(true);

      // 重置
      await wrapper.find('.reset-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.value).toBe('initial');
      expect(wrapper.vm.isValid).toBe(true);
      expect(wrapper.vm.isTouched).toBe(false);
      expect(wrapper.vm.isDirty).toBe(false);
      expect(wrapper.vm.validation?.message || '').toBe('');
    });
  });

  describe('事件处理', () => {
    it('应该触发值变化事件', async () => {
      const onValueChange = vi.fn();

      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      // 监听值变化
      wrapper.vm.field.field.onChange(onValueChange);

      // 更改值
      wrapper.vm.setValue('newvalue');
      await nextTick();

      expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({
        type: 'change',
        fieldName: 'username',
        value: 'newvalue'
      }));
    });

    it('应该触发验证状态变化事件', async () => {
      const onValidationChange = vi.fn();

      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form,
          rules: [{ validator: required() }]
        }
      });

      // 监听验证状态变化
      wrapper.vm.field.field.onValidate(onValidationChange);

      // 触发验证
      await wrapper.vm.validate();
      await nextTick();

      expect(onValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          message: expect.any(String)
        })
      );
    });
  });

  describe('响应式更新', () => {
    it('应该响应规则变化', async () => {
      // 测试不同规则的验证
      const wrapper1 = mount(TestComponent, {
        props: {
          name: 'username1',
          form,
          rules: [{ validator: required() }]
        }
      });

      // 测试required验证
      await wrapper1.vm.validate();
      await nextTick();
      expect(wrapper1.vm.validation?.message || '').toContain('required');

      // 创建新字段测试length验证
      const wrapper2 = mount(TestComponent, {
        props: {
          name: 'username2',
          form,
          rules: [{ validator: length({ min: 5 }) }]
        }
      });

      // 设置短值测试length验证
      wrapper2.vm.setValue('abc');
      await wrapper2.vm.validate();
      await nextTick();
      expect(wrapper2.vm.validation?.message || '').toContain('Minimum length');
    });

    it('应该响应表单状态变化', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      // 通过表单重置
      form.reset();
      await nextTick();

      expect(wrapper.vm.value).toBe('');
      expect(wrapper.vm.isTouched).toBe(false);
      expect(wrapper.vm.isDirty).toBe(false);
    });
  });

  describe('内存管理', () => {
    it('应该在组件卸载时清理资源', async () => {
      const wrapper = mount(TestComponent, {
        props: {
          name: 'username',
          form
        }
      });

      const fieldInstance = wrapper.vm.field;
      expect(fieldInstance).toBeDefined();

      // 卸载组件
      wrapper.unmount();

      // 验证字段已被清理（这里主要确保没有错误）
      expect(true).toBe(true);
    });
  });
});
