/**
 * LDesignFormItem 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import LDesignFormItem from '../../src/vue/components/LDesignFormItem.vue';
import FormProvider from '../../src/vue/components/FormProvider.vue';
import { createForm } from '../../src/core/form';
import { required, email, length } from '../../src/validators';

describe('LDesignFormItem Component', () => {
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

  describe('基础渲染', () => {
    it('应该正确渲染标签', () => {
      const wrapper = mount({
        components: { FormProvider, LDesignFormItem },
        template: `
          <FormProvider :form="form">
            <LDesignFormItem name="username" label="用户名" />
          </FormProvider>
        `,
        data() {
          return { form };
        }
      });

      expect(wrapper.find('.ldesign-form-item__label').text()).toBe('用户名');
    });

    it('应该渲染必填标记', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          required: true,
          form
        }
      });

      const label = wrapper.find('.ldesign-form-item__label');
      expect(label.classes()).toContain('ldesign-form-item__label--required');
    });

    it('应该渲染帮助文本', () => {
      const helpText = '请输入3-20个字符的用户名';
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          help: helpText,
          form
        }
      });

      expect(wrapper.find('.ldesign-form-item__help').text()).toBe(helpText);
    });
  });

  describe('验证状态', () => {
    it('应该显示验证错误', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: required() }],
          form
        }
      });

      // 触发验证
      const field = form.getField('username');
      await field.validate();
      await nextTick();

      const errorElement = wrapper.find('.ldesign-form-item__error');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('required');
    });

    it('应该在验证通过时清除错误', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: required() }],
          form
        }
      });

      const field = form.getField('username');

      // 先触发错误
      await field.validate();
      await nextTick();
      expect(wrapper.find('.ldesign-form-item__error').exists()).toBe(true);

      // 设置值并重新验证
      field.setValue('testuser');
      await field.validate();
      await nextTick();

      const errorElement = wrapper.find('.ldesign-form-item__error');
      expect(errorElement.text()).toBe('');
    });

    it('应该显示验证中状态', async () => {
      const asyncValidator = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ valid: true, message: '' }), 100);
        });
      });

      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: asyncValidator }],
          form
        }
      });

      const field = form.getField('username');
      field.setValue('test');

      // 开始异步验证
      const validationPromise = field.validate();
      await nextTick();

      // 检查验证中状态
      expect(wrapper.classes()).toContain('ldesign-form-item--validating');

      // 等待验证完成
      await validationPromise;
      await nextTick();

      // 验证完成后应该移除验证中状态
      expect(wrapper.classes()).not.toContain('ldesign-form-item--validating');
    });
  });

  describe('布局模式', () => {
    it('应该支持水平布局', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          layout: 'horizontal',
          form
        }
      });

      expect(wrapper.classes()).toContain('ldesign-form-item--horizontal');
    });

    it('应该支持内联布局', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          layout: 'inline',
          form
        }
      });

      expect(wrapper.classes()).toContain('ldesign-form-item--inline');
    });

    it('应该支持自定义标签宽度', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          layout: 'horizontal',
          labelWidth: '150px',
          form
        }
      });

      const label = wrapper.find('.ldesign-form-item__label');
      expect(label.element.style.width).toBe('150px');
    });
  });

  describe('事件处理', () => {
    it('应该响应字段值变化', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          form
        }
      });

      const field = form.getField('username');
      field.setValue('newvalue');
      await nextTick();

      // 检查组件是否响应了值的变化
      expect(wrapper.vm.fieldValue).toBe('newvalue');
    });

    it('应该响应验证状态变化', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: required() }],
          form
        }
      });

      const field = form.getField('username');

      // 触发验证错误
      await field.validate();
      await nextTick();
      expect(wrapper.classes()).toContain('ldesign-form-item--error');

      // 修复错误
      field.setValue('test');
      await field.validate();
      await nextTick();
      expect(wrapper.classes()).not.toContain('ldesign-form-item--error');
    });
  });

  describe('插槽内容', () => {
    it('应该正确渲染默认插槽', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          form
        },
        slots: {
          default: '<input type="text" class="test-input" />'
        }
      });

      expect(wrapper.find('.test-input').exists()).toBe(true);
    });

    it('应该正确渲染标签插槽', () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          form
        },
        slots: {
          label: '<span class="custom-label">自定义标签</span>'
        }
      });

      expect(wrapper.find('.custom-label').exists()).toBe(true);
      expect(wrapper.find('.custom-label').text()).toBe('自定义标签');
    });

    it('应该正确渲染错误插槽', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: required() }],
          form
        },
        slots: {
          error: '<div class="custom-error">自定义错误</div>'
        }
      });

      const field = form.getField('username');
      await field.validate();
      await nextTick();

      expect(wrapper.find('.custom-error').exists()).toBe(true);
    });
  });

  describe('响应式更新', () => {
    it('应该响应表单数据变化', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          form
        }
      });

      // 通过表单设置值
      form.setFieldValue('username', 'fromform');
      await nextTick();

      expect(wrapper.vm.fieldValue).toBe('fromform');
    });

    it('应该响应规则变化', async () => {
      const wrapper = mount(LDesignFormItem, {
        props: {
          name: 'username',
          label: '用户名',
          rules: [{ validator: required() }],
          form
        }
      });

      // 更改规则
      await wrapper.setProps({
        rules: [{ validator: required() }, { validator: length({ min: 3 }) }]
      });

      const field = form.getField('username');
      field.setValue('ab'); // 长度不足
      await field.validate();
      await nextTick();

      const errorText = wrapper.find('.ldesign-form-item__error').text();
      expect(errorText).toContain('Length');
    });
  });
});
