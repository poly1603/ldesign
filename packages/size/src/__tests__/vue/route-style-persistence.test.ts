/**
 * 路由样式持久化测试
 * 测试修复路由跳转时样式丢失的问题
 */

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { globalSizeManager } from '../../core/size-manager'
import { useSize, useSizeSwitcher } from '../../vue/composables'

// 模拟DOM环境
const mockDocument = {
  createElement: vi.fn(() => ({
    id: '',
    textContent: '',
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    remove: vi.fn(),
    parentNode: null,
  })),
  getElementById: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
  body: {
    appendChild: vi.fn(),
    insertBefore: vi.fn(),
  },
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    },
  },
}

// 模拟window对象
const mockWindow = {
  document: mockDocument,
}

// 设置全局模拟
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

// 测试组件：模拟SizeSwitcher的使用场景
const TestSizeSwitcherComponent = defineComponent({
  name: 'TestSizeSwitcherComponent',
  setup() {
    const { currentMode, setMode, sizeManager } = useSizeSwitcher()

    return {
      currentMode,
      setMode,
      sizeManager,
    }
  },
  template: `
    <div>
      <span data-testid="current-mode">{{ currentMode }}</span>
      <button @click="setMode('large')" data-testid="set-large">Set Large</button>
    </div>
  `,
})

// 测试组件：模拟普通useSize的使用场景
const TestUseSizeComponent = defineComponent({
  name: 'TestUseSizeComponent',
  setup() {
    const { currentMode, setMode, sizeManager } = useSize()

    return {
      currentMode,
      setMode,
      sizeManager,
    }
  },
  template: `
    <div>
      <span data-testid="current-mode">{{ currentMode }}</span>
      <button @click="setMode('small')" data-testid="set-small">Set Small</button>
    </div>
  `,
})

describe.skip('路由样式持久化修复', () => {
  let mockStyleElement: any

  beforeEach(() => {
    // 重置模拟
    vi.clearAllMocks()

    // 模拟样式元素
    mockStyleElement = {
      id: '',
      textContent: '',
      remove: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      parentNode: { removeChild: vi.fn() },
    }

    mockDocument.createElement.mockReturnValue(mockStyleElement)
    mockDocument.getElementById.mockReturnValue(null)

    // 重置全局管理器状态
    globalSizeManager.removeCSS()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('useSizeSwitcher应该使用全局管理器', async () => {
    const wrapper = mount(TestSizeSwitcherComponent)

    // 获取组件实例中的sizeManager
    const componentInstance = wrapper.vm as any
    const sizeManager = componentInstance.sizeManager

    // 验证使用的是全局管理器
    expect(sizeManager).toBe(globalSizeManager)

    wrapper.unmount()
  })

  it('useSize在没有注入管理器时应该回退到全局管理器', async () => {
    const wrapper = mount(TestUseSizeComponent)

    // 获取组件实例中的sizeManager
    const componentInstance = wrapper.vm as any
    const sizeManager = componentInstance.sizeManager

    // 验证使用的是全局管理器（因为我们修改了useSize的逻辑）
    expect(sizeManager).toBe(globalSizeManager)

    wrapper.unmount()
  })

  it('组件卸载时不应该销毁全局管理器的样式', async () => {
    // 先注入一些样式
    globalSizeManager.injectCSS()
    expect(mockDocument.createElement).toHaveBeenCalled()

    // 挂载组件
    const wrapper1 = mount(TestSizeSwitcherComponent)
    const wrapper2 = mount(TestUseSizeComponent)

    // 清除之前的调用记录
    mockStyleElement.remove.mockClear()

    // 卸载组件
    wrapper1.unmount()
    wrapper2.unmount()

    await nextTick()

    // 验证样式元素没有被移除
    expect(mockStyleElement.remove).not.toHaveBeenCalled()
  })

  it('多个组件使用同一个全局管理器', async () => {
    const wrapper1 = mount(TestSizeSwitcherComponent)
    const wrapper2 = mount(TestUseSizeComponent)

    const sizeManager1 = (wrapper1.vm as any).sizeManager
    const sizeManager2 = (wrapper2.vm as any).sizeManager

    // 验证两个组件使用的是同一个管理器
    expect(sizeManager1).toBe(sizeManager2)
    expect(sizeManager1).toBe(globalSizeManager)

    wrapper1.unmount()
    wrapper2.unmount()
  })

  it('样式变化应该在所有组件中同步', async () => {
    const wrapper1 = mount(TestSizeSwitcherComponent)
    const wrapper2 = mount(TestUseSizeComponent)

    // 在第一个组件中改变尺寸
    await wrapper1.find('[data-testid="set-large"]').trigger('click')
    await nextTick()

    // 验证两个组件的显示都更新了
    expect(wrapper1.find('[data-testid="current-mode"]').text()).toBe('large')
    expect(wrapper2.find('[data-testid="current-mode"]').text()).toBe('large')

    wrapper1.unmount()
    wrapper2.unmount()
  })
})
