/**
 * LDesignForm 组件测试
 * 
 * @description
 * 测试 LDesignForm 组件的基本功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import LDesignForm from '@/vue/components/LDesignForm.vue';
import LDesignFormItem from '@/vue/components/LDesignFormItem.vue';
import { cleanup } from '../setup';

// 测试组件
const TestFormComponent = {
  components: {
    LDesignForm,
    LDesignFormItem
  },
  template: `
    <LDesignForm
      ref="formRef"
      :initial-values="{ name: '', email: '' }"
      @submit="onSubmit"
      @change="onChange"
    >
      <LDesignFormItem name="name" label="姓名">
        <template #default="{ value, setValue }">
          <input
            type="text"
            :value="value"
            @input="setValue($event.target.value)"
            placeholder="请输入姓名"
          />
        </template>
      </LDesignFormItem>
      
      <LDesignFormItem name="email" label="邮箱">
        <template #default="{ value, setValue }">
          <input
            type="email"
            :value="value"
            @input="setValue($event.target.value)"
            placeholder="请输入邮箱"
          />
        </template>
      </LDesignFormItem>
      
      <button type="submit">提交</button>
      <button type="reset">重置</button>
    </LDesignForm>
  `,
  setup() {
    const formRef = ref(null);
    const submitData = ref(null);
    const changeData = ref(null);

    const onSubmit = (data: any, valid: boolean) => {
      console.log('Form submitted:', data, valid);
      submitData.value = { data, valid };
    };

    const onChange = (data: any, field: string, value: any) => {
      console.log('Form changed:', data, field, value);
      changeData.value = { data, field, value };
    };

    return {
      formRef,
      submitData,
      changeData,
      onSubmit,
      onChange
    };
  }
};

describe('LDesignForm Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Form Rendering', () => {
    it('should render form with correct structure', async () => {
      const wrapper = mount(TestFormComponent);

      expect(wrapper.find('.ldesign-form').exists()).toBe(true);
      expect(wrapper.find('.ldesign-form-item').exists()).toBe(true);
      expect(wrapper.findAll('.ldesign-form-item')).toHaveLength(2);
    });

    it('should apply correct CSS classes', async () => {
      const wrapper = mount(LDesignForm, {
        props: {
          layout: 'horizontal',
          size: 'large',
          disabled: true
        }
      });

      const form = wrapper.find('.ldesign-form');
      expect(form.classes()).toContain('ldesign-form--horizontal');
      expect(form.classes()).toContain('ldesign-form--large');
      expect(form.classes()).toContain('ldesign-form--disabled');
    });
  });

  describe('Form Data Management', () => {
    it('should initialize with provided initial values', async () => {
      const wrapper = mount(TestFormComponent);
      const vm = wrapper.vm as any;

      await nextTick();

      expect(vm.formRef.form.data.value).toEqual({ name: '', email: '' });
    });

    it('should update form data when field values change', async () => {
      const wrapper = mount(TestFormComponent);
      const vm = wrapper.vm as any;

      const nameInput = wrapper.find('input[type="text"]');
      await nameInput.setValue('John Doe');
      await nextTick();

      expect(vm.formRef.form.data.value.name).toBe('John Doe');
      expect(vm.changeData).toBeTruthy();
      expect(vm.changeData.field).toBe('name');
      expect(vm.changeData.value).toBe('John Doe');
    });
  });

  describe('Form Submission', () => {
    it('should emit submit event when form is submitted', async () => {
      // 创建一个简化的测试组件
      const SimpleTestComponent = {
        components: { LDesignForm },
        setup() {
          const submitData = ref(null);
          const onSubmit = (data: any, valid: boolean) => {
            submitData.value = { data, valid };
          };
          return { submitData, onSubmit };
        },
        template: `
          <LDesignForm
            :initial-values="{ name: 'John Doe', email: 'john@example.com' }"
            @submit="onSubmit"
          >
            <button type="submit">Submit</button>
          </LDesignForm>
        `
      };

      const wrapper = mount(SimpleTestComponent);
      const vm = wrapper.vm as any;

      // 提交表单
      const form = wrapper.find('form');
      await form.trigger('submit');
      await nextTick();

      expect(vm.submitData).toBeTruthy();
      expect(vm.submitData.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(vm.submitData.valid).toBe(true);
    });

    it.skip('should reset form when reset button is clicked', async () => {
      // 创建一个简化的测试组件
      const ResetTestComponent = {
        components: { LDesignForm },
        setup() {
          const formRef = ref(null);
          return { formRef };
        },
        template: `
          <LDesignForm
            ref="formRef"
            :initial-values="{ name: '', email: '' }"
          >
            <button type="reset">Reset</button>
          </LDesignForm>
        `
      };

      const wrapper = mount(ResetTestComponent);
      const vm = wrapper.vm as any;

      // 设置表单数据
      vm.formRef.form.setFieldValue('name', 'John Doe');
      await nextTick();

      expect(vm.formRef.form.data.value.name).toBe('John Doe');
      expect(vm.formRef.form.isDirty.value).toBe(true);

      // 重置表单
      const resetButton = wrapper.find('button[type="reset"]');
      await resetButton.trigger('click');
      await nextTick();

      // 应该重置到初始值
      expect(vm.formRef.form.data.value.name).toBe('');
      expect(vm.formRef.form.isDirty.value).toBe(false);
    });
  });

  describe('Form States', () => {
    it('should track dirty state correctly', async () => {
      const wrapper = mount(TestFormComponent);
      const vm = wrapper.vm as any;

      expect(vm.formRef.form.isDirty.value).toBe(false);

      const nameInput = wrapper.find('input[type="text"]');
      await nameInput.setValue('John');
      await nextTick();

      expect(vm.formRef.form.isDirty.value).toBe(true);
    });

    it('should apply state classes to form element', async () => {
      const wrapper = mount(TestFormComponent);
      const vm = wrapper.vm as any;

      const form = wrapper.find('.ldesign-form');
      expect(form.classes()).toContain('ldesign-form--valid');

      const nameInput = wrapper.find('input[type="text"]');
      await nameInput.setValue('John');
      await nextTick();

      expect(form.classes()).toContain('ldesign-form--dirty');
    });
  });

  describe('Form Layout', () => {
    it('should apply vertical layout by default', async () => {
      const wrapper = mount(LDesignForm);

      const form = wrapper.find('.ldesign-form');
      expect(form.classes()).toContain('ldesign-form--vertical');
    });

    it('should apply horizontal layout when specified', async () => {
      const wrapper = mount(LDesignForm, {
        props: { layout: 'horizontal' }
      });

      const form = wrapper.find('.ldesign-form');
      expect(form.classes()).toContain('ldesign-form--horizontal');
    });

    it('should apply inline layout when specified', async () => {
      const wrapper = mount(LDesignForm, {
        props: { layout: 'inline' }
      });

      const form = wrapper.find('.ldesign-form');
      expect(form.classes()).toContain('ldesign-form--inline');
    });
  });

  describe('Form API', () => {
    it('should expose form methods through ref', async () => {
      const wrapper = mount(TestFormComponent);
      const vm = wrapper.vm as any;

      await nextTick();

      expect(typeof vm.formRef.submit).toBe('function');
      expect(typeof vm.formRef.reset).toBe('function');
      expect(typeof vm.formRef.validate).toBe('function');
      expect(typeof vm.formRef.clearValidation).toBe('function');
      expect(vm.formRef.form).toBeDefined();
    });
  });
});
