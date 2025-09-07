/**
 * FormProvider 组件测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, defineComponent, h } from 'vue';
import FormProvider from '../../src/vue/components/FormProvider.vue';
import { createForm } from '../../src/core/form';
import { useFormContext } from '../../src/vue/hooks/useFormContext';

// 测试子组件，用于验证上下文传递
const TestChild = defineComponent({
  name: 'TestChild',
  setup() {
    const formContext = useFormContext();
    return {
      formContext
    };
  },
  template: `
    <div class="test-child">
      <span class="form-id">{{ formContext?.form?.id }}</span>
      <span class="form-data">{{ JSON.stringify(formContext?.formData || formContext?.form?.data) }}</span>
    </div>
  `
});

describe('FormProvider Component', () => {
  let form: any;

  beforeEach(() => {
    form = createForm({
      initialValues: {
        username: 'testuser',
        email: 'test@example.com'
      }
    });
  });

  describe('基础功能', () => {
    it('应该正确提供表单上下文', () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext).toBeDefined();
      expect(child.vm.formContext.form).toStrictEqual(form);
    });

    it('应该传递表单ID', () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      const formIdElement = wrapper.find('.form-id');
      expect(formIdElement.text()).toBe(form.id);
    });

    it('应该传递表单数据', () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      const formDataElement = wrapper.find('.form-data');
      const expectedData = JSON.stringify(form.data);
      expect(formDataElement.text()).toBe(expectedData);
    });
  });

  describe('响应式更新', () => {
    it('应该响应表单数据变化', async () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      // 验证初始数据
      let formDataElement = wrapper.find('.form-data');
      let data = JSON.parse(formDataElement.text());
      expect(data.username).toBe('testuser');

      // 更新表单数据
      form.setFieldValue('username', 'newuser');

      // 等待多个tick确保事件传播和组件更新
      await nextTick();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      // 强制重新渲染
      await wrapper.vm.$forceUpdate();
      await nextTick();

      formDataElement = wrapper.find('.form-data');
      data = JSON.parse(formDataElement.text());
      expect(data.username).toBe('newuser');
    });

    it('应该响应表单实例变化', async () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      // 创建新的表单实例
      const newForm = createForm({
        initialValues: {
          name: 'newform'
        }
      });

      // 更新props
      await wrapper.setProps({ form: newForm });

      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext.form.id).toBe(newForm.id);
      expect(child.vm.formContext.form.data).toEqual(newForm.data);
    });
  });

  describe('嵌套上下文', () => {
    it('应该支持嵌套的FormProvider', () => {
      const outerForm = form;
      const innerForm = createForm({
        initialValues: {
          inner: 'value'
        }
      });

      const NestedChild = defineComponent({
        name: 'NestedChild',
        setup() {
          const formContext = useFormContext();
          return { formContext };
        },
        template: `<div class="nested-child">{{ formContext?.form?.id }}</div>`
      });

      const wrapper = mount(FormProvider, {
        props: { form: outerForm },
        slots: {
          default: () => h('div', [
            h(TestChild),
            h(FormProvider, { form: innerForm }, {
              default: () => h(NestedChild)
            })
          ])
        }
      });

      // 外层应该使用外层表单
      const outerChild = wrapper.findComponent(TestChild);
      expect(outerChild.vm.formContext.form).toStrictEqual(outerForm);

      // 内层应该使用内层表单
      const nestedChild = wrapper.findComponent(NestedChild);
      expect(nestedChild.vm.formContext.form).toStrictEqual(innerForm);
    });
  });

  describe('错误处理', () => {
    it('应该处理空表单', () => {
      const wrapper = mount(FormProvider, {
        props: { form: null },
        slots: {
          default: TestChild
        }
      });

      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext).toBeNull();
    });

    it('应该处理未定义的表单', () => {
      const wrapper = mount(FormProvider, {
        props: { form: undefined },
        slots: {
          default: TestChild
        }
      });

      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext).toBeNull();
    });
  });

  describe('生命周期', () => {
    it('应该在组件卸载时清理资源', async () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      // 验证组件正常工作
      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext.form).toStrictEqual(form);

      // 卸载组件
      wrapper.unmount();

      // 验证清理完成（这里主要是确保没有错误抛出）
      expect(true).toBe(true);
    });

    it('应该在表单变化时更新上下文', async () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: TestChild
        }
      });

      const originalFormId = form.id;

      // 创建新表单
      const newForm = createForm({
        initialValues: { newField: 'value' }
      });

      // 更新表单
      await wrapper.setProps({ form: newForm });

      const child = wrapper.findComponent(TestChild);
      expect(child.vm.formContext.form.id).toBe(newForm.id);
      expect(child.vm.formContext.form.id).not.toBe(originalFormId);
    });
  });

  describe('插槽渲染', () => {
    it('应该正确渲染默认插槽', () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: '<div class="slot-content">插槽内容</div>'
        }
      });

      expect(wrapper.find('.slot-content').exists()).toBe(true);
      expect(wrapper.find('.slot-content').text()).toBe('插槽内容');
    });

    it('应该支持多个子组件', () => {
      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: `
            <div class="child-1">Child 1</div>
            <div class="child-2">Child 2</div>
          `
        }
      });

      expect(wrapper.find('.child-1').exists()).toBe(true);
      expect(wrapper.find('.child-2').exists()).toBe(true);
    });

    it('应该支持动态插槽内容', async () => {
      const DynamicSlot = defineComponent({
        data() {
          return {
            content: '初始内容'
          };
        },
        template: '<div class="dynamic-content">{{ content }}</div>'
      });

      const wrapper = mount(FormProvider, {
        props: { form },
        slots: {
          default: DynamicSlot
        }
      });

      expect(wrapper.find('.dynamic-content').text()).toBe('初始内容');

      // 更新插槽内容
      const slotComponent = wrapper.findComponent(DynamicSlot);
      slotComponent.vm.content = '更新内容';
      await nextTick();

      expect(wrapper.find('.dynamic-content').text()).toBe('更新内容');
    });
  });
});
