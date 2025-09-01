/**
 * useAnimationUtils 动画工具函数测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ANIMATION_PRESETS,
  EASING_FUNCTIONS,
  useAnimationPerformance,
  useAnimationQueue,
  useAnimationState,
  useResponsiveAnimation,
} from '../../src/composables/useAnimationUtils'
import { AnimationDirection, AnimationType } from '../../src/composables/useTemplateAnimation'

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
})

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
})

describe('useAnimationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('eASING_FUNCTIONS', () => {
    it('应该包含所有标准缓动函数', () => {
      expect(EASING_FUNCTIONS.linear).toBe('linear')
      expect(EASING_FUNCTIONS.ease).toBe('ease')
      expect(EASING_FUNCTIONS.easeIn).toBe('ease-in')
      expect(EASING_FUNCTIONS.easeOut).toBe('ease-out')
      expect(EASING_FUNCTIONS.easeInOut).toBe('ease-in-out')
    })

    it('应该包含贝塞尔曲线缓动函数', () => {
      expect(EASING_FUNCTIONS.easeInSine).toBe('cubic-bezier(0.12, 0, 0.39, 0)')
      expect(EASING_FUNCTIONS.easeOutSine).toBe('cubic-bezier(0.61, 1, 0.88, 1)')
      expect(EASING_FUNCTIONS.easeInOutSine).toBe('cubic-bezier(0.37, 0, 0.63, 1)')
    })
  })

  describe('aNIMATION_PRESETS', () => {
    it('应该包含快速动画预设', () => {
      expect(ANIMATION_PRESETS.quickFade).toEqual({
        type: AnimationType.FADE,
        duration: 150,
        easing: EASING_FUNCTIONS.easeOut,
      })
    })

    it('应该包含标准动画预设', () => {
      expect(ANIMATION_PRESETS.standardSlide).toEqual({
        type: AnimationType.SLIDE,
        duration: 250,
        direction: AnimationDirection.DOWN,
        easing: EASING_FUNCTIONS.easeInOut,
      })
    })

    it('应该包含弹性动画预设', () => {
      expect(ANIMATION_PRESETS.bounceIn).toEqual({
        type: AnimationType.SCALE_FADE,
        duration: 300,
        easing: EASING_FUNCTIONS.easeOutBack,
      })
    })
  })

  describe('useAnimationPerformance', () => {
    it('应该正确初始化性能指标', () => {
      const performance = useAnimationPerformance()

      expect(performance.metrics.value).toEqual({
        animationCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        lastAnimationTime: 0,
      })
    })

    it('应该能够记录动画性能', () => {
      const performance = useAnimationPerformance()
      const mockNow = vi.mocked(window.performance.now)

      // 模拟动画开始
      mockNow.mockReturnValue(1000)
      performance.startAnimation()

      // 模拟动画结束
      mockNow.mockReturnValue(1250)
      performance.endAnimation()

      expect(performance.metrics.value.animationCount).toBe(1)
      expect(performance.metrics.value.totalDuration).toBe(250)
      expect(performance.metrics.value.averageDuration).toBe(250)
    })

    it('应该能够计算平均持续时间', () => {
      const performance = useAnimationPerformance()
      const mockNow = vi.mocked(window.performance.now)

      // 第一个动画
      mockNow.mockReturnValue(1000)
      performance.startAnimation()
      mockNow.mockReturnValue(1200)
      performance.endAnimation()

      // 第二个动画
      mockNow.mockReturnValue(2000)
      performance.startAnimation()
      mockNow.mockReturnValue(2300)
      performance.endAnimation()

      expect(performance.metrics.value.animationCount).toBe(2)
      expect(performance.metrics.value.totalDuration).toBe(500)
      expect(performance.metrics.value.averageDuration).toBe(250)
    })

    it('应该能够重置统计', () => {
      const performance = useAnimationPerformance()

      // 记录一些数据
      performance.startAnimation()
      performance.endAnimation()

      // 重置
      performance.reset()

      expect(performance.metrics.value).toEqual({
        animationCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        lastAnimationTime: 0,
      })
    })
  })

  describe('useAnimationQueue', () => {
    it('应该正确初始化队列', () => {
      const queue = useAnimationQueue()

      expect(queue.queue.value).toEqual([])
      expect(queue.isProcessing.value).toBe(false)
      expect(queue.currentIndex.value).toBe(0)
    })

    it('应该能够添加动画到队列', () => {
      const queue = useAnimationQueue()
      const mockAnimation = vi.fn().mockResolvedValue(undefined)

      queue.add(mockAnimation)

      expect(queue.queue.value).toHaveLength(1)
      expect(queue.queue.value[0]).toBe(mockAnimation)
    })

    it('应该能够处理队列中的动画', async () => {
      const queue = useAnimationQueue()
      const mockAnimation1 = vi.fn().mockResolvedValue(undefined)
      const mockAnimation2 = vi.fn().mockResolvedValue(undefined)

      queue.add(mockAnimation1)
      queue.add(mockAnimation2)

      const processPromise = queue.process()

      expect(queue.isProcessing.value).toBe(true)

      await processPromise

      expect(mockAnimation1).toHaveBeenCalled()
      expect(mockAnimation2).toHaveBeenCalled()
      expect(queue.isProcessing.value).toBe(false)
    })

    it('应该能够清空队列', () => {
      const queue = useAnimationQueue()
      const mockAnimation = vi.fn().mockResolvedValue(undefined)

      queue.add(mockAnimation)
      queue.clear()

      expect(queue.queue.value).toEqual([])
      expect(queue.currentIndex.value).toBe(0)
    })

    it('应该防止并发处理', async () => {
      const queue = useAnimationQueue()
      const mockAnimation = vi.fn().mockResolvedValue(undefined)

      queue.add(mockAnimation)

      // 同时调用两次处理
      const process1 = queue.process()
      const process2 = queue.process()

      await Promise.all([process1, process2])

      // 动画应该只被调用一次
      expect(mockAnimation).toHaveBeenCalledTimes(1)
    })
  })

  describe('useResponsiveAnimation', () => {
    it('应该正确初始化响应式动画', () => {
      const baseConfig = {
        type: AnimationType.FADE,
        duration: 250,
        easing: 'ease',
      }

      const responsive = useResponsiveAnimation(baseConfig)

      expect(responsive.screenWidth.value).toBe(1024)
      expect(responsive.currentConfig.value).toEqual(baseConfig)
    })

    it('应该根据断点应用不同配置', () => {
      const baseConfig = {
        type: AnimationType.FADE,
        duration: 250,
        easing: 'ease',
      }

      const breakpoints = {
        768: { duration: 150 },
        480: { duration: 100 },
      }

      const responsive = useResponsiveAnimation(baseConfig, breakpoints)

      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', { value: 600 })
      responsive.screenWidth.value = 600

      expect(responsive.currentConfig.value.duration).toBe(150)
    })

    it('应该注册窗口大小变化监听器', () => {
      const baseConfig = {
        type: AnimationType.FADE,
        duration: 250,
        easing: 'ease',
      }

      useResponsiveAnimation(baseConfig)

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('应该能够清理事件监听器', () => {
      const baseConfig = {
        type: AnimationType.FADE,
        duration: 250,
        easing: 'ease',
      }

      const responsive = useResponsiveAnimation(baseConfig)
      responsive.cleanup()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('useAnimationState', () => {
    it('应该正确初始化状态管理', () => {
      const stateManager = useAnimationState()

      expect(stateManager.states.value.size).toBe(0)
    })

    it('应该能够设置和获取状态', () => {
      const stateManager = useAnimationState()

      stateManager.setState('modal', true)

      expect(stateManager.getState('modal')).toBe(true)
      expect(stateManager.getState('nonexistent')).toBe(false)
    })

    it('应该能够切换状态', () => {
      const stateManager = useAnimationState()

      // 初始状态为false
      expect(stateManager.getState('toggle')).toBe(false)

      // 切换为true
      const newState = stateManager.toggleState('toggle')
      expect(newState).toBe(true)
      expect(stateManager.getState('toggle')).toBe(true)

      // 再次切换为false
      const newState2 = stateManager.toggleState('toggle')
      expect(newState2).toBe(false)
      expect(stateManager.getState('toggle')).toBe(false)
    })

    it('应该能够批量设置状态', () => {
      const stateManager = useAnimationState()

      stateManager.setStates({
        modal: true,
        sidebar: false,
        tooltip: true,
      })

      expect(stateManager.getState('modal')).toBe(true)
      expect(stateManager.getState('sidebar')).toBe(false)
      expect(stateManager.getState('tooltip')).toBe(true)
    })

    it('应该能够清除所有状态', () => {
      const stateManager = useAnimationState()

      stateManager.setState('test1', true)
      stateManager.setState('test2', false)

      stateManager.clearStates()

      expect(stateManager.states.value.size).toBe(0)
      expect(stateManager.getState('test1')).toBe(false)
      expect(stateManager.getState('test2')).toBe(false)
    })
  })
})
