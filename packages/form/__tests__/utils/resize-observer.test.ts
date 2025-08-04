import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createResizeObserver,
  getResizeInfo,
  observeElementResize,
  ResizeObserverWrapper,
} from '../../src/utils/resize-observer'

// Mock ResizeObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

const MockResizeObserver = vi.fn().mockImplementation(callback => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
  callback,
}))

// 设置全局 ResizeObserver mock
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

describe('resizeObserver Utils', () => {
  let element: HTMLElement
  let mockCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    element = document.createElement('div')
    document.body.appendChild(element)
    mockCallback = vi.fn()

    // 清理所有 mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  describe('resizeObserverWrapper', () => {
    it('should create ResizeObserver instance', () => {
      const wrapper = new ResizeObserverWrapper()
      expect(MockResizeObserver).toHaveBeenCalledTimes(1)
    })

    it('should observe element', () => {
      const wrapper = new ResizeObserverWrapper()
      wrapper.observe(element, mockCallback)

      expect(mockObserve).toHaveBeenCalledWith(element, { box: 'content-box' })
    })

    it('should unobserve element', () => {
      const wrapper = new ResizeObserverWrapper()
      wrapper.observe(element, mockCallback)
      wrapper.unobserve(element)

      expect(mockUnobserve).toHaveBeenCalledWith(element)
    })

    it('should disconnect all observations', () => {
      const wrapper = new ResizeObserverWrapper()
      wrapper.observe(element, mockCallback)
      wrapper.disconnect()

      expect(mockDisconnect).toHaveBeenCalledTimes(1)
    })

    it('should handle resize with callback', () => {
      const wrapper = new ResizeObserverWrapper()
      wrapper.observe(element, mockCallback)

      // 模拟 ResizeObserver 回调
      const mockEntry: ResizeObserverEntry = {
        target: element,
        contentRect: {
          width: 100,
          height: 50,
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        },
        borderBoxSize: [{
          inlineSize: 100,
          blockSize: 50,
        }],
        contentBoxSize: [{
          inlineSize: 80,
          blockSize: 30,
        }],
        devicePixelContentBoxSize: [{
          inlineSize: 160,
          blockSize: 60,
        }],
      }

      // 获取 ResizeObserver 的回调函数并调用
      const observerInstance = MockResizeObserver.mock.results[0].value
      const resizeCallback = MockResizeObserver.mock.calls[0][0]
      resizeCallback([mockEntry])

      expect(mockCallback).toHaveBeenCalledWith(mockEntry)
    })

    it('should handle debounced resize', (done) => {
      const wrapper = new ResizeObserverWrapper({ debounceDelay: 50 })
      wrapper.observe(element, mockCallback)

      const mockEntry: ResizeObserverEntry = {
        target: element,
        contentRect: {
          width: 100,
          height: 50,
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        },
        borderBoxSize: [{
          inlineSize: 100,
          blockSize: 50,
        }],
        contentBoxSize: [{
          inlineSize: 80,
          blockSize: 30,
        }],
        devicePixelContentBoxSize: [{
          inlineSize: 160,
          blockSize: 60,
        }],
      }

      // 获取回调函数并多次调用
      const resizeCallback = MockResizeObserver.mock.calls[0][0]
      resizeCallback([mockEntry])
      resizeCallback([mockEntry])
      resizeCallback([mockEntry])

      // 立即检查，回调不应该被调用
      expect(mockCallback).not.toHaveBeenCalled()

      // 等待防抖延迟后检查
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(mockCallback).toHaveBeenCalledWith(mockEntry)
        done()
      }, 60)
    })

    it('should use custom box option', () => {
      const wrapper = new ResizeObserverWrapper({ box: 'border-box' })
      wrapper.observe(element, mockCallback)

      expect(mockObserve).toHaveBeenCalledWith(element, { box: 'border-box' })
    })

    it('should check if ResizeObserver is supported', () => {
      expect(ResizeObserverWrapper.isSupported()).toBe(true)

      // 临时删除 ResizeObserver 来测试不支持的情况
      const originalResizeObserver = global.ResizeObserver
      // @ts-expect-error - 故意设置为 undefined 来测试
      delete global.ResizeObserver

      expect(ResizeObserverWrapper.isSupported()).toBe(false)

      // 恢复 ResizeObserver
      global.ResizeObserver = originalResizeObserver
    })

    it('should handle unsupported browser gracefully', () => {
      // 临时删除 ResizeObserver
      const originalResizeObserver = global.ResizeObserver
      // @ts-expect-error - 故意设置为 undefined 来测试
      delete global.ResizeObserver

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const wrapper = new ResizeObserverWrapper()
      wrapper.observe(element, mockCallback)

      expect(consoleSpy).toHaveBeenCalledWith('ResizeObserver is not supported in this browser')

      // 恢复
      global.ResizeObserver = originalResizeObserver
      consoleSpy.mockRestore()
    })
  })

  describe('createResizeObserver', () => {
    it('should create ResizeObserver wrapper', () => {
      const wrapper = createResizeObserver()
      expect(wrapper).toBeInstanceOf(ResizeObserverWrapper)
    })

    it('should create ResizeObserver wrapper with options', () => {
      const wrapper = createResizeObserver({ debounceDelay: 100 })
      expect(wrapper).toBeInstanceOf(ResizeObserverWrapper)
    })
  })

  describe('observeElementResize', () => {
    it('should observe element and return cleanup function', () => {
      const cleanup = observeElementResize(element, mockCallback)

      expect(mockObserve).toHaveBeenCalledWith(element, { box: 'content-box' })
      expect(typeof cleanup).toBe('function')

      // 调用清理函数
      cleanup()
      expect(mockUnobserve).toHaveBeenCalledWith(element)
    })

    it('should observe element with options', () => {
      const cleanup = observeElementResize(element, mockCallback, { box: 'border-box' })

      expect(mockObserve).toHaveBeenCalledWith(element, { box: 'border-box' })

      cleanup()
    })
  })

  describe('getResizeInfo', () => {
    it('should extract resize information from entry', () => {
      const mockEntry: ResizeObserverEntry = {
        target: element,
        contentRect: {
          width: 100,
          height: 50,
          left: 10,
          top: 20,
          right: 110,
          bottom: 70,
          x: 10,
          y: 20,
          toJSON: () => ({}),
        },
        borderBoxSize: [{
          inlineSize: 120,
          blockSize: 70,
        }],
        contentBoxSize: [{
          inlineSize: 100,
          blockSize: 50,
        }],
        devicePixelContentBoxSize: [{
          inlineSize: 200,
          blockSize: 100,
        }],
      }

      const info = getResizeInfo(mockEntry)

      expect(info.contentRect).toEqual({
        width: 100,
        height: 50,
        left: 10,
        top: 20,
      })

      expect(info.borderBoxSize).toEqual({
        inlineSize: 120,
        blockSize: 70,
      })

      expect(info.contentBoxSize).toEqual({
        inlineSize: 100,
        blockSize: 50,
      })

      expect(info.devicePixelContentBoxSize).toEqual({
        inlineSize: 200,
        blockSize: 100,
      })
    })

    it('should handle missing size arrays', () => {
      const mockEntry: ResizeObserverEntry = {
        target: element,
        contentRect: {
          width: 100,
          height: 50,
          left: 10,
          top: 20,
          right: 110,
          bottom: 70,
          x: 10,
          y: 20,
          toJSON: () => ({}),
        },
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      }

      const info = getResizeInfo(mockEntry)

      expect(info.contentRect).toEqual({
        width: 100,
        height: 50,
        left: 10,
        top: 20,
      })

      expect(info.borderBoxSize).toBeNull()
      expect(info.contentBoxSize).toBeNull()
      expect(info.devicePixelContentBoxSize).toBeNull()
    })
  })
})
