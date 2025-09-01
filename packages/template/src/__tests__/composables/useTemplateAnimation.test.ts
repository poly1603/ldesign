import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useTemplateAnimation } from '../../composables/useTemplateAnimation'
import { mockAnimationManager, waitForAnimation, mockCSSAnimation } from '../../test-utils'

// Mock 动画相关 API
vi.mock('../../utils/animation', () => ({
  AnimationManager: {
    getInstance: vi.fn(() => mockAnimationManager),
  },
}))

describe('useTemplateAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本功能', () => {
    it('应该返回正确的初始状态', () => {
      const {
        isAnimating,
        animationConfig,
        currentAnimation
      } = useTemplateAnimation()

      expect(isAnimating.value).toBe(false)
      expect(animationConfig.value).toEqual({
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        enable: true,
      })
      expect(currentAnimation.value).toBeNull()
    })

    it('应该正确处理自定义配置', () => {
      const customConfig = {
        duration: 500,
        easing: 'ease-in-out',
        enable: false,
      }

      const { animationConfig } = useTemplateAnimation(customConfig)

      expect(animationConfig.value).toEqual(customConfig)
    })
  })

  describe('动画播放控制', () => {
    it('应该能够播放动画', async () => {
      const { playAnimation, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      expect(isAnimating.value).toBe(false)

      const animationPromise = playAnimation(element, 'fadeIn')

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'fadeIn')

      // 模拟动画完成
      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })

    it('应该能够暂停动画', () => {
      const { playAnimation, pauseAnimation, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      playAnimation(element, 'fadeIn')
      expect(isAnimating.value).toBe(true)

      pauseAnimation()
      expect(mockAnimationManager.pause).toHaveBeenCalled()
    })

    it('应该能够停止动画', () => {
      const { playAnimation, stopAnimation, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      playAnimation(element, 'fadeIn')
      expect(isAnimating.value).toBe(true)

      stopAnimation()
      expect(mockAnimationManager.stop).toHaveBeenCalled()
      expect(isAnimating.value).toBe(false)
    })

    it('应该能够重置动画', () => {
      const { playAnimation, resetAnimation } = useTemplateAnimation()
      const element = document.createElement('div')

      playAnimation(element, 'fadeIn')
      resetAnimation()

      expect(mockAnimationManager.reset).toHaveBeenCalled()
    })
  })

  describe('动画配置', () => {
    it('应该能够设置动画时长', () => {
      const { setDuration, animationConfig } = useTemplateAnimation()

      setDuration(500)

      expect(animationConfig.value.duration).toBe(500)
      expect(mockAnimationManager.setDuration).toHaveBeenCalledWith(500)
    })

    it('应该能够设置缓动函数', () => {
      const { setEasing, animationConfig } = useTemplateAnimation()

      setEasing('ease-in-out')

      expect(animationConfig.value.easing).toBe('ease-in-out')
      expect(mockAnimationManager.setEasing).toHaveBeenCalledWith('ease-in-out')
    })

    it('应该能够启用/禁用动画', () => {
      const { setEnabled, animationConfig } = useTemplateAnimation()

      setEnabled(false)
      expect(animationConfig.value.enable).toBe(false)

      setEnabled(true)
      expect(animationConfig.value.enable).toBe(true)
    })
  })

  describe('预定义动画', () => {
    it('应该支持淡入动画', async () => {
      const { fadeIn, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      const animationPromise = fadeIn(element)

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'fadeIn')

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })

    it('应该支持淡出动画', async () => {
      const { fadeOut, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      const animationPromise = fadeOut(element)

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'fadeOut')

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })

    it('应该支持滑入动画', async () => {
      const { slideIn, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      const animationPromise = slideIn(element, 'left')

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'slideInLeft')

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })

    it('应该支持滑出动画', async () => {
      const { slideOut, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      const animationPromise = slideOut(element, 'right')

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'slideOutRight')

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })

    it('应该支持缩放动画', async () => {
      const { scale, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      const animationPromise = scale(element, 1.2)

      expect(isAnimating.value).toBe(true)
      expect(mockAnimationManager.play).toHaveBeenCalledWith(element, 'scale', { scale: 1.2 })

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(isAnimating.value).toBe(false)
    })
  })

  describe('动画队列', () => {
    it('应该能够排队执行多个动画', async () => {
      const { playAnimation, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      // 启动第一个动画
      const animation1 = playAnimation(element, 'fadeIn')
      expect(isAnimating.value).toBe(true)

      // 启动第二个动画（应该排队）
      const animation2 = playAnimation(element, 'slideIn')

      // 完成第一个动画
      vi.advanceTimersByTime(300)
      await animation1

      // 第二个动画应该开始
      expect(isAnimating.value).toBe(true)

      // 完成第二个动画
      vi.advanceTimersByTime(300)
      await animation2

      expect(isAnimating.value).toBe(false)
    })

    it('应该能够清空动画队列', () => {
      const { playAnimation, clearQueue, isAnimating } = useTemplateAnimation()
      const element = document.createElement('div')

      playAnimation(element, 'fadeIn')
      playAnimation(element, 'slideIn')

      expect(isAnimating.value).toBe(true)

      clearQueue()

      expect(isAnimating.value).toBe(false)
    })
  })

  describe('动画事件', () => {
    it('应该能够监听动画开始事件', () => {
      const { onAnimationStart } = useTemplateAnimation()
      const callback = vi.fn()

      onAnimationStart(callback)

      const element = document.createElement('div')
      const { playAnimation } = useTemplateAnimation()

      playAnimation(element, 'fadeIn')

      expect(callback).toHaveBeenCalled()
    })

    it('应该能够监听动画结束事件', async () => {
      const { onAnimationEnd } = useTemplateAnimation()
      const callback = vi.fn()

      onAnimationEnd(callback)

      const element = document.createElement('div')
      const { playAnimation } = useTemplateAnimation()

      const animationPromise = playAnimation(element, 'fadeIn')

      vi.advanceTimersByTime(300)
      await animationPromise

      expect(callback).toHaveBeenCalled()
    })

    it('应该能够移除事件监听器', () => {
      const { onAnimationStart, offAnimationStart } = useTemplateAnimation()
      const callback = vi.fn()

      onAnimationStart(callback)
      offAnimationStart(callback)

      const element = document.createElement('div')
      const { playAnimation } = useTemplateAnimation()

      playAnimation(element, 'fadeIn')

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('性能优化', () => {
    it('应该在动画禁用时跳过动画', async () => {
      const { playAnimation, isAnimating } = useTemplateAnimation({
        enable: false,
      })
      const element = document.createElement('div')

      await playAnimation(element, 'fadeIn')

      expect(isAnimating.value).toBe(false)
      expect(mockAnimationManager.play).not.toHaveBeenCalled()
    })

    it('应该能够检测是否支持动画', () => {
      const { isAnimationSupported } = useTemplateAnimation()

      // 在测试环境中，应该返回 false 或根据 mock 返回
      expect(typeof isAnimationSupported.value).toBe('boolean')
    })

    it('应该能够获取动画性能指标', () => {
      const { getPerformanceMetrics } = useTemplateAnimation()

      const metrics = getPerformanceMetrics()

      expect(metrics).toBeDefined()
      expect(typeof metrics).toBe('object')
    })
  })

  describe('错误处理', () => {
    it('应该正确处理动画执行错误', async () => {
      // Mock 动画管理器抛出错误
      mockAnimationManager.play.mockRejectedValue(new Error('动画执行失败'))

      const { playAnimation, error } = useTemplateAnimation()
      const element = document.createElement('div')

      await playAnimation(element, 'fadeIn')

      expect(error.value).toBeTruthy()
      expect(error.value?.message).toBe('动画执行失败')
    })

    it('应该能够清除错误状态', () => {
      const { error, clearError } = useTemplateAnimation()

      // 模拟设置错误
      error.value = new Error('测试错误')
      expect(error.value).toBeTruthy()

      clearError()
      expect(error.value).toBeNull()
    })
  })
})
