/**
 * useLocalStorage Hook 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import {
  useLocalStorage,
  useSessionStorage,
  stringSerializer,
  numberSerializer,
  booleanSerializer,
} from '../useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该返回默认值', () => {
      const TestComponent = defineComponent({
        setup() {
          const [value] = useLocalStorage('test-key', 'default-value')
          return { value }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)
      expect(wrapper.vm.value).toBe('default-value')
    })

    it('应该从 localStorage 读取现有值', () => {
      localStorageMock.setItem('existing-key', JSON.stringify('existing-value'))

      const TestComponent = defineComponent({
        setup() {
          const [value] = useLocalStorage('existing-key', 'default-value')
          return { value }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)
      expect(wrapper.vm.value).toBe('existing-value')
    })

    it('应该设置新值', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [value, setValue] = useLocalStorage('test-key', 'initial')
          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setValue('new-value')
      await nextTick()

      expect(wrapper.vm.value).toBe('new-value')
      expect(localStorageMock.getItem('test-key')).toBe('"new-value"')
    })

    it('应该支持函数式更新', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [count, setCount] = useLocalStorage('counter', 0)
          return { count, setCount }
        },
        template: '<div>{{ count }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setCount((prev: number) => prev + 1)
      await nextTick()

      expect(wrapper.vm.count).toBe(1)
    })

    it('应该移除值', async () => {
      localStorageMock.setItem('test-key', JSON.stringify('test-value'))

      const TestComponent = defineComponent({
        setup() {
          const [value, setValue, remove] = useLocalStorage('test-key', 'default')
          return { value, setValue, remove }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)
      expect(wrapper.vm.value).toBe('test-value')

      wrapper.vm.remove()
      await nextTick()

      expect(wrapper.vm.value).toBe('default')
      expect(localStorageMock.getItem('test-key')).toBeNull()
    })
  })

  describe('序列化器', () => {
    it('应该使用字符串序列化器', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [value, setValue] = useLocalStorage('string-key', 'default', {
            serializer: stringSerializer,
          })
          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setValue('test-string')
      await nextTick()

      expect(localStorageMock.getItem('string-key')).toBe('test-string')
    })

    it('应该使用数字序列化器', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [value, setValue] = useLocalStorage('number-key', 0, {
            serializer: numberSerializer,
          })
          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setValue(42)
      await nextTick()

      expect(localStorageMock.getItem('number-key')).toBe('42')
      expect(wrapper.vm.value).toBe(42)
    })

    it('应该使用布尔值序列化器', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [value, setValue] = useLocalStorage('boolean-key', false, {
            serializer: booleanSerializer,
          })
          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setValue(true)
      await nextTick()

      expect(localStorageMock.getItem('boolean-key')).toBe('true')
      expect(wrapper.vm.value).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理读取错误', () => {
      const onError = vi.fn()

      // 模拟 localStorage 读取错误
      vi.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const TestComponent = defineComponent({
        setup() {
          const [value] = useLocalStorage('error-key', 'default', { onError })
          return { value }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      expect(wrapper.vm.value).toBe('default')
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('应该处理写入错误', () => {
      const onError = vi.fn()

      // 模拟 localStorage 写入错误
      vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const TestComponent = defineComponent({
        setup() {
          const [value, setValue] = useLocalStorage('error-key', 'default', { onError })
          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      wrapper.vm.setValue('new-value')

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('跨标签页同步', () => {
    it('应该监听 storage 事件', async () => {
      const TestComponent = defineComponent({
        setup() {
          const [value] = useLocalStorage('sync-key', 'initial', {
            syncAcrossTabs: true,
          })
          return { value }
        },
        template: '<div>{{ value }}</div>',
      })

      const wrapper = mount(TestComponent)

      // 模拟其他标签页的存储变化
      const storageEvent = new Event('storage')
      Object.defineProperty(storageEvent, 'key', { value: 'sync-key' })
      Object.defineProperty(storageEvent, 'newValue', { value: '"updated-value"' })
      Object.defineProperty(storageEvent, 'storageArea', { value: localStorage })

      window.dispatchEvent(storageEvent)
      await nextTick()

      expect(wrapper.vm.value).toBe('updated-value')
    })
  })
})

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
  })

  it('应该使用 sessionStorage', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [value, setValue] = useSessionStorage('session-key', 'default')
        return { value, setValue }
      },
      template: '<div>{{ value }}</div>',
    })

    const wrapper = mount(TestComponent)

    wrapper.vm.setValue('session-value')
    await nextTick()

    expect(wrapper.vm.value).toBe('session-value')
    expect(sessionStorageMock.getItem('session-key')).toBe('"session-value"')
  })

  it('应该从 sessionStorage 读取现有值', () => {
    sessionStorageMock.setItem('existing-session-key', JSON.stringify('existing-session-value'))

    const TestComponent = defineComponent({
      setup() {
        const [value] = useSessionStorage('existing-session-key', 'default')
        return { value }
      },
      template: '<div>{{ value }}</div>',
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.value).toBe('existing-session-value')
  })
})
