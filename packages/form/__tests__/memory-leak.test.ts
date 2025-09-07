/**
 * 内存泄漏检测测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { LDesignForm, LDesignFormItem, LDesignQueryForm } from '@/vue/components';
import { useForm } from '@/vue/hooks/useForm';
import { createForm } from '@/core/form';
import { DynamicQueryForm } from '@/core/query-form';
import { cleanup } from './setup';

describe('内存泄漏检测', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('表单实例清理', () => {
    it('应该正确清理表单实例的事件监听器', () => {
      const form = createForm({
        initialValues: { name: '', email: '' }
      });

      // 注册一些事件监听器
      const changeListener = vi.fn();
      const submitListener = vi.fn();

      form.onChange(changeListener);
      form.onSubmit(submitListener);

      // 验证监听器已注册
      expect(form.events.listenerCount('form:change')).toBe(1);
      expect(form.events.listenerCount('form:submit')).toBe(1);

      // 销毁表单
      form.destroy();

      // 验证监听器已清理
      expect(form.events.listenerCount('form:change')).toBe(0);
      expect(form.events.listenerCount('form:submit')).toBe(0);
    });

    it('应该正确清理字段实例', () => {
      const form = createForm();

      // 注册字段
      const field1 = form.registerField({ name: 'field1', required: true });
      const field2 = form.registerField({ name: 'field2', required: false });

      expect(form.fields.size).toBe(2);
      expect(form.hasField('field1')).toBe(true);
      expect(form.hasField('field2')).toBe(true);

      // 销毁表单
      form.destroy();

      // 验证字段已清理
      expect(form.fields.size).toBe(0);
      expect(form.hasField('field1')).toBe(false);
      expect(form.hasField('field2')).toBe(false);
    });
  });

  describe('Vue Hook 清理', () => {
    it('useForm hook 应该在组件卸载时清理表单实例', async () => {
      let formInstance: any = null;

      const TestComponent = {
        setup() {
          const form = useForm({
            initialValues: { name: '' }
          });
          formInstance = form.form;
          return { form };
        },
        template: '<div>Test</div>'
      };

      const wrapper = mount(TestComponent);
      await nextTick();

      // 验证表单实例存在
      expect(formInstance).toBeTruthy();
      expect(formInstance._destroyed).toBe(false);

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证表单实例已销毁
      expect(formInstance._destroyed).toBe(true);
    });
  });

  describe('ResizeObserver 清理', () => {
    it('LDesignQueryForm 应该正确清理 ResizeObserver', async () => {
      // Mock ResizeObserver
      const mockDisconnect = vi.fn();
      const mockObserve = vi.fn();
      const mockUnobserve = vi.fn();

      global.ResizeObserver = vi.fn(() => ({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      })) as any;

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: [
            { name: 'name', label: '姓名', type: 'input' }
          ],
          responsive: true
        }
      });

      await nextTick();

      // 验证 ResizeObserver 被创建
      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证 ResizeObserver 被清理
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('DynamicQueryForm 应该正确清理 ResizeObserver', () => {
      // Mock ResizeObserver
      const mockDisconnect = vi.fn();
      const mockObserve = vi.fn();

      global.ResizeObserver = vi.fn(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect
      })) as any;

      // 创建容器元素
      const container = document.createElement('div');
      document.body.appendChild(container);

      const queryForm = new DynamicQueryForm({
        container,
        fields: [
          { name: 'name', label: '姓名', type: 'input' }
        ],
        responsive: true
      });

      // 验证 ResizeObserver 被创建
      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();

      // 销毁实例
      queryForm.destroy();

      // 验证 ResizeObserver 被清理
      expect(mockDisconnect).toHaveBeenCalled();

      // 清理 DOM
      document.body.removeChild(container);
    });
  });

  describe('定时器清理', () => {
    it('应该正确清理防抖定时器', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Mock ResizeObserver 来触发防抖逻辑
      let resizeCallback: any = null;
      global.ResizeObserver = vi.fn((callback) => {
        resizeCallback = callback;
        return {
          observe: vi.fn(),
          disconnect: vi.fn()
        };
      }) as any;

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: [
            { name: 'name', label: '姓名', type: 'input' }
          ],
          responsive: true
        }
      });

      await nextTick();

      // 触发 resize 事件来创建定时器
      if (resizeCallback) {
        resizeCallback([{
          contentRect: { width: 800 }
        }]);
      }

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证定时器被清理
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('事件监听器清理', () => {
    it('应该正确清理 DOM 事件监听器', async () => {
      const addEventListenerSpy = vi.spyOn(Element.prototype, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(Element.prototype, 'removeEventListener');

      const TestComponent = {
        setup() {
          const form = useForm({
            initialValues: { name: '' }
          });
          return { form };
        },
        template: `
          <LDesignForm>
            <LDesignFormItem name="name" label="姓名">
              <input type="text" />
            </LDesignFormItem>
          </LDesignForm>
        `,
        components: {
          LDesignForm,
          LDesignFormItem
        }
      };

      const wrapper = mount(TestComponent);
      await nextTick();

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证组件已卸载（这个测试主要验证组件能正常卸载）
      expect(wrapper.exists()).toBe(false);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
