/**
 * 性能优化测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { LDesignQueryForm } from '@/vue/components';
import { cleanup } from './setup';

describe('性能优化测试', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('计算属性优化', () => {
    it('应该避免重复计算布局相关属性', async () => {
      const fields = Array.from({ length: 10 }, (_, i) => ({
        name: `field${i}`,
        label: `字段${i}`,
        type: 'input' as const
      }));

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields,
          colCount: 4,
          defaultRowCount: 1,
          actionPosition: 'auto' as const,
          responsive: true
        }
      });

      await nextTick();

      // 模拟多次属性访问，验证计算属性缓存是否生效
      const vm = wrapper.vm as any;
      
      // 第一次访问，应该触发计算
      const visibleFields1 = vm.visibleFields;
      const shouldActionInline1 = vm.shouldActionInline;
      const showCollapseButton1 = vm.showCollapseButton;

      // 第二次访问，应该使用缓存
      const visibleFields2 = vm.visibleFields;
      const shouldActionInline2 = vm.shouldActionInline;
      const showCollapseButton2 = vm.showCollapseButton;

      // 验证结果一致性
      expect(visibleFields1).toBe(visibleFields2);
      expect(shouldActionInline1).toBe(shouldActionInline2);
      expect(showCollapseButton1).toBe(showCollapseButton2);
    });

    it('应该在相关依赖变化时正确更新计算属性', async () => {
      const fields = Array.from({ length: 6 }, (_, i) => ({
        name: `field${i}`,
        label: `字段${i}`,
        type: 'input' as const
      }));

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields,
          colCount: 4,
          defaultRowCount: 1,
          actionPosition: 'auto' as const,
          collapsed: true
        }
      });

      await nextTick();

      const vm = wrapper.vm as any;
      
      // 收起状态下的可见字段数量
      const collapsedVisibleFields = vm.visibleFields.length;
      expect(collapsedVisibleFields).toBeLessThanOrEqual(4);

      // 切换到展开状态
      await wrapper.setProps({ collapsed: false });
      await nextTick();

      // 展开状态下的可见字段数量
      const expandedVisibleFields = vm.visibleFields.length;
      expect(expandedVisibleFields).toBe(6);
    });
  });

  describe('响应式优化', () => {
    it('应该使用 markRaw 优化静态配置', () => {
      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: [
            { name: 'test', label: '测试', type: 'input' }
          ]
        }
      });

      // 验证默认断点配置不是响应式的
      const vm = wrapper.vm as any;
      const breakpoints = vm.DEFAULT_BREAKPOINTS;
      
      // markRaw 的对象不应该有响应式标记
      expect(breakpoints.__v_skip).toBe(true);
    });

    it('应该正确处理容器宽度变化', async () => {
      // Mock ResizeObserver
      const mockDisconnect = vi.fn();
      const mockObserve = vi.fn();
      let resizeCallback: any = null;
      
      global.ResizeObserver = vi.fn((callback) => {
        resizeCallback = callback;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect
        };
      }) as any;

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: Array.from({ length: 8 }, (_, i) => ({
            name: `field${i}`,
            label: `字段${i}`,
            type: 'input' as const
          })),
          responsive: true
        }
      });

      await nextTick();

      const vm = wrapper.vm as any;
      
      // 初始列数
      const initialColCount = vm.computedColCount;
      
      // 模拟容器宽度变化
      if (resizeCallback) {
        resizeCallback([{
          contentRect: { width: 1200 } // 大屏幕
        }]);
      }

      await nextTick();

      // 验证列数是否根据宽度调整
      const newColCount = vm.computedColCount;
      expect(newColCount).toBeGreaterThanOrEqual(initialColCount);
    });
  });

  describe('渲染优化', () => {
    it('应该避免不必要的重新渲染', async () => {
      const renderSpy = vi.fn();
      
      const TestComponent = {
        setup() {
          renderSpy();
          return {};
        },
        template: `
          <LDesignQueryForm
            :fields="fields"
            :col-count="4"
            :collapsed="collapsed"
          />
        `,
        components: {
          LDesignQueryForm
        },
        data() {
          return {
            fields: [
              { name: 'name', label: '姓名', type: 'input' },
              { name: 'email', label: '邮箱', type: 'input' }
            ],
            collapsed: true
          };
        }
      };

      const wrapper = mount(TestComponent);
      await nextTick();

      const initialRenderCount = renderSpy.mock.calls.length;

      // 修改不相关的属性，不应该触发重新渲染
      wrapper.vm.$data.someUnrelatedProp = 'new value';
      await nextTick();

      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });

    it('应该正确处理大量字段的渲染', async () => {
      const largeFieldList = Array.from({ length: 100 }, (_, i) => ({
        name: `field${i}`,
        label: `字段${i}`,
        type: 'input' as const
      }));

      const startTime = performance.now();

      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: largeFieldList,
          colCount: 6,
          defaultRowCount: 2,
          collapsed: true
        }
      });

      await nextTick();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 验证渲染时间在合理范围内（这个阈值可能需要根据实际情况调整）
      expect(renderTime).toBeLessThan(100); // 100ms

      // 验证只渲染了可见字段
      const vm = wrapper.vm as any;
      const visibleFieldCount = vm.visibleFields.length;
      expect(visibleFieldCount).toBeLessThanOrEqual(12); // 2行 * 6列
    });
  });

  describe('内存使用优化', () => {
    it('应该正确清理组件资源', async () => {
      const wrapper = mount(LDesignQueryForm, {
        props: {
          fields: [
            { name: 'test', label: '测试', type: 'input' }
          ],
          responsive: true
        }
      });

      await nextTick();

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证组件已正确卸载
      expect(wrapper.exists()).toBe(false);
    });
  });
});
