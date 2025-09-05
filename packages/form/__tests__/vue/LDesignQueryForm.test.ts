/**
 * LDesignQueryForm 组件测试
 *
 * 验证：
 * 1. 标题位置（top/left）
 * 2. 按钮对齐方式（left/center/right/justify）
 * 3. 动态配置更新后是否即时生效（actionAlign、fields 等）
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LDesignQueryForm from '@/vue/components/LDesignQueryForm.vue'
import LDesignFormItem from '@/vue/components/LDesignFormItem.vue'

const makeFields = (n: number) =>
  Array.from({ length: n }).map((_, i) => ({ name: `f${i + 1}`, label: `字段${i + 1}` }))

describe('LDesignQueryForm', () => {
  it('renders title at top', async () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        title: '查询条件',
        titlePosition: 'top',
        fields: makeFields(2),
        responsive: false,
        colCount: 4
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    expect(wrapper.find('.ldesign-query-form__title--top').exists()).toBe(true)
    expect(wrapper.find('.ldesign-query-form__title--left').exists()).toBe(false)
  })

  it('renders title at left', async () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        title: '查询条件',
        titlePosition: 'left',
        fields: makeFields(2),
        responsive: false,
        colCount: 4
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    expect(wrapper.find('.ldesign-query-form__title--left').exists()).toBe(true)
  })

  it('supports action alignment including justify', async () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(2),
        actionAlign: 'justify',
        responsive: false,
        colCount: 4
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    const actions = wrapper.find('.ldesign-query-form__actions')
    expect(actions.classes()).toContain('ldesign-query-form__actions--justify')

    await wrapper.setProps({ actionAlign: 'right' })
    expect(actions.classes()).toContain('ldesign-query-form__actions--right')
  })

  it('updates inline/block action placement when fields change', async () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(3), // 小于一行列数 -> 最后一行有空余，内联
        responsive: false,
        colCount: 4,
        defaultRowCount: 1
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    let actions = wrapper.find('.ldesign-query-form__actions')
    expect(actions.classes()).toContain('ldesign-query-form__actions--inline')

    // 修改为正好一整行，应该变为独占行（block）
    await wrapper.setProps({ fields: makeFields(4) })
    actions = wrapper.find('.ldesign-query-form__actions')
    expect(actions.classes()).toContain('ldesign-query-form__actions--block')
  })

  // 新增测试：验证默认行数修复
  it('defaults to 1 row count', () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(8),
        responsive: false,
        colCount: 4
        // 不传 defaultRowCount，应该默认为 1
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    // 收起状态下，默认应该只显示 1 行（4 个字段）
    const visibleFields = wrapper.findAll('.ldesign-query-form__field:not(.hidden)')
    expect(visibleFields.length).toBeLessThanOrEqual(4) // 考虑到内联按钮组可能占用位置
  })

  // 新增测试：验证内联按钮组布局逻辑
  it('handles inline action layout correctly', async () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(8),
        responsive: false,
        colCount: 4,
        defaultRowCount: 1,
        actionPosition: 'inline'
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    // 收起状态：内联模式下，按钮组应该占用最后一行的剩余位置
    let actions = wrapper.find('.ldesign-query-form__actions')
    expect(actions.classes()).toContain('ldesign-query-form__actions--inline')

    // 展开状态：检查按钮组位置计算
    await wrapper.find('.ldesign-query-form__toggle').trigger('click')
    actions = wrapper.find('.ldesign-query-form__actions')

    // 8 个字段，4 列，最后一行有 0 个字段（8 % 4 = 0），按钮组应该独占一行
    expect(actions.classes()).toContain('ldesign-query-form__actions--block')
  })

  // 新增测试：验证内联模式下按钮组默认右对齐
  it('defaults to right alignment for inline actions', () => {
    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(3), // 3 个字段，4 列，最后一行有剩余位置
        responsive: false,
        colCount: 4,
        defaultRowCount: 1,
        actionPosition: 'inline'
        // 不传 actionAlign，内联模式下应该默认右对齐
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    const actions = wrapper.find('.ldesign-query-form__actions')
    expect(actions.classes()).toContain('ldesign-query-form__actions--inline')

    // 检查内联模式下的默认对齐方式
    const actionsContent = wrapper.find('.ldesign-query-form__actions-content')
    const computedStyle = window.getComputedStyle(actionsContent.element)
    // 内联模式下应该默认右对齐（flex-end）
    expect(computedStyle.justifyContent).toBe('flex-end')
  })

  // 新增测试：验证响应式监听机制
  it('uses ResizeObserver for responsive behavior', async () => {
    // 模拟 ResizeObserver
    const mockResizeObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }))

    // @ts-ignore
    global.ResizeObserver = mockResizeObserver

    const wrapper = mount(LDesignQueryForm as any, {
      props: {
        fields: makeFields(8),
        responsive: true, // 启用响应式
        colCount: 4
      },
      global: {
        components: {
          LDesignFormItem
        }
      }
    })

    // 应该创建 ResizeObserver 实例
    expect(mockResizeObserver).toHaveBeenCalled()
  })
})

