/**
 * useForm Hook 测试
 * 
 * @description
 * 测试 useForm hook 的基本功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useForm } from '@/vue/hooks/useForm';
import { cleanup } from '../setup';

// 测试组件
const TestComponent = {
  setup() {
    const form = useForm({
      initialValues: { name: '', email: '' }
    });
    
    return {
      form
    };
  },
  template: '<div></div>'
};

describe('useForm Hook', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Form Creation', () => {
    it('should create a reactive form instance', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      expect(vm.form).toBeDefined();
      expect(vm.form.data).toBeDefined();
      expect(vm.form.state).toBeDefined();
      expect(vm.form.validation).toBeDefined();
      expect(vm.form.isValid).toBeDefined();
      expect(vm.form.isDirty).toBeDefined();
      expect(vm.form.isPending).toBeDefined();
      expect(vm.form.isSubmitted).toBeDefined();
    });

    it('should initialize with provided values', async () => {
      const TestComponentWithValues = {
        setup() {
          const form = useForm({
            initialValues: { name: 'John', email: 'john@example.com' }
          });
          
          return { form };
        },
        template: '<div></div>'
      };

      const wrapper = mount(TestComponentWithValues);
      const vm = wrapper.vm as any;
      
      expect(vm.form.data.value).toEqual({ name: 'John', email: 'john@example.com' });
      expect(vm.form.getFieldValue('name')).toBe('John');
      expect(vm.form.getFieldValue('email')).toBe('john@example.com');
    });
  });

  describe('Field Value Operations', () => {
    it('should set and get field values reactively', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      vm.form.setFieldValue('name', 'John Doe');
      await nextTick();
      
      expect(vm.form.getFieldValue('name')).toBe('John Doe');
      expect(vm.form.data.value.name).toBe('John Doe');
    });

    it('should set multiple values at once', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      const values = { name: 'Jane Doe', email: 'jane@example.com' };
      vm.form.setValues(values);
      await nextTick();
      
      expect(vm.form.getValues()).toEqual(values);
      expect(vm.form.data.value).toEqual(values);
    });

    it('should update dirty state reactively', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      expect(vm.form.isDirty.value).toBe(false);
      
      vm.form.setFieldValue('name', 'John');
      await nextTick();
      
      expect(vm.form.isDirty.value).toBe(true);
    });

    it('should reset form values', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      vm.form.setFieldValue('name', 'John');
      vm.form.setFieldValue('email', 'john@example.com');
      await nextTick();
      
      expect(vm.form.isDirty.value).toBe(true);
      
      vm.form.reset();
      await nextTick();
      
      expect(vm.form.getValues()).toEqual({ name: '', email: '' });
      expect(vm.form.isDirty.value).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate form', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      const results = await vm.form.validate();
      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    it('should clear validation results', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      vm.form.clearValidation();
      await nextTick();
      
      expect(vm.form.validation.value).toEqual({});
    });
  });

  describe('Form Submission', () => {
    it('should submit form', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      vm.form.setFieldValue('name', 'John');
      vm.form.setFieldValue('email', 'john@example.com');
      
      const result = await vm.form.submit();
      
      expect(result).toBeDefined();
      expect(result.data).toEqual({ name: 'John', email: 'john@example.com' });
      expect(result.valid).toBe(true);
      expect(vm.form.isSubmitted.value).toBe(true);
    });
  });

  describe('Field Management', () => {
    it('should register and unregister fields', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      const fieldConfig = {
        name: 'username',
        label: 'Username',
        defaultValue: ''
      };

      const field = vm.form.registerField(fieldConfig);
      
      expect(field).toBeDefined();
      expect(vm.form.getField('username')).toBe(field);
      
      vm.form.unregisterField('username');
      
      expect(vm.form.getField('username')).toBeUndefined();
    });
  });

  describe('Computed Properties', () => {
    it('should compute isValid correctly', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      // 初始状态应该是有效的（没有验证错误）
      expect(vm.form.isValid.value).toBe(true);
    });

    it('should compute state array correctly', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      expect(Array.isArray(vm.form.state.value)).toBe(true);
      expect(vm.form.state.value).toContain('pristine');
    });
  });

  describe('Lifecycle', () => {
    it('should cleanup on unmount', async () => {
      const wrapper = mount(TestComponent);
      const vm = wrapper.vm as any;
      
      expect(vm.form.form.destroyed).toBe(false);
      
      wrapper.unmount();
      
      // 由于 onUnmounted 是异步的，我们需要等待
      await nextTick();
      
      expect(vm.form.form.destroyed).toBe(true);
    });
  });
});
