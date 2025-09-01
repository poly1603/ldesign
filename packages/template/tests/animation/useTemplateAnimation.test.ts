/**
 * useTemplateAnimation 组合式函数测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  AnimationDirection,
  AnimationType,
  DEFAULT_ANIMATION_CONFIG,
  SELECTOR_ANIMATION_CONFIG,
  TEMPLATE_SWITCH_ANIMATION_CONFIG,
  useTemplateAnimation,
  useTemplateSelectorAnimation,
  useTemplateSwitchAnimation,
} from '../../src/composables/useTemplateAnimation'

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
})

describe('useTemplateAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该使用默认配置初始化', () => {
      const animation = useTemplateAnimation()

      expect(animation.config.value).toEqual(DEFAULT_ANIMATION_CONFIG)
      expect(animation.animationState.value).toEqual({
        entering: false,
        leaving: false,
        visible: false,
        completed: false,
      })
    })

    it('应该能够更新配置', () => {
      const animation = useTemplateAnimation()
      const newConfig = {
        type: AnimationType.FADE,
        duration: 500,
      }

      animation.updateConfig(newConfig)

      expect(animation.config.value.type).toBe(AnimationType.FADE)
      expect(animation.config.value.duration).toBe(500)
    })

    it('应该能够重置动画状态', () => {
      const animation = useTemplateAnimation()

      // 修改状态
      animation.animationState.value.entering = true
      animation.animationState.value.visible = true

      // 重置
      animation.reset()

      expect(animation.animationState.value).toEqual({
        entering: false,
        leaving: false,
        visible: false,
        completed: false,
      })
    })
  })

  describe('动画执行', () => {
    it('应该能够执行进入动画', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 200,
        enabled: true,
      })

      const enterPromise = animation.enter()

      // 检查初始状态
      expect(animation.animationState.value.entering).toBe(true)
      expect(animation.animationState.value.visible).toBe(false)

      await nextTick()

      // 检查动画开始后的状态
      expect(animation.animationState.value.visible).toBe(true)

      // 快进时间
      vi.advanceTimersByTime(200)
      await enterPromise

      // 检查动画完成后的状态
      expect(animation.animationState.value.entering).toBe(false)
      expect(animation.animationState.value.completed).toBe(true)
      expect(animation.animationState.value.visible).toBe(true)
    })

    it('应该能够执行离开动画', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 200,
        enabled: true,
      })

      // 先设置为可见状态
      animation.animationState.value.visible = true

      const leavePromise = animation.leave()

      // 检查初始状态
      expect(animation.animationState.value.leaving).toBe(true)

      // 快进时间
      vi.advanceTimersByTime(200)
      await leavePromise

      // 检查动画完成后的状态
      expect(animation.animationState.value.leaving).toBe(false)
      expect(animation.animationState.value.visible).toBe(false)
      expect(animation.animationState.value.completed).toBe(true)
    })

    it('当动画被禁用时应该立即完成', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 200,
        enabled: false,
      })

      await animation.enter()

      expect(animation.animationState.value.visible).toBe(true)
      expect(animation.animationState.value.completed).toBe(true)
      expect(animation.animationState.value.entering).toBe(false)
    })
  })

  describe('cSS类名和样式生成', () => {
    it('应该生成正确的过渡类名', () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        direction: AnimationDirection.DOWN,
      })

      const classes = animation.getTransitionClasses()

      expect(classes['enter-active-class']).toBe('template-animation-fade-enter-active')
      expect(classes['leave-active-class']).toBe('template-animation-fade-leave-active')
      expect(classes['enter-from-class']).toBe('template-animation-fade-enter-from')
      expect(classes['enter-to-class']).toBe('template-animation-fade-enter-to')
      expect(classes['leave-from-class']).toBe('template-animation-fade-leave-from')
      expect(classes['leave-to-class']).toBe('template-animation-fade-leave-to')
    })

    it('应该生成正确的过渡样式', () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 300,
        easing: 'ease-in-out',
        delay: 100,
      })

      const styles = animation.getTransitionStyles()

      expect(styles['--animation-duration']).toBe('300ms')
      expect(styles['--animation-easing']).toBe('ease-in-out')
      expect(styles['--animation-delay']).toBe('100ms')
    })

    it('应该为带方向的动画生成正确的类名', () => {
      const animation = useTemplateAnimation({
        type: AnimationType.SLIDE,
        direction: AnimationDirection.UP,
      })

      const classes = animation.getTransitionClasses()

      expect(classes['enter-active-class']).toBe('template-animation-slide-up-enter-active')
      expect(classes['leave-active-class']).toBe('template-animation-slide-up-leave-active')
    })
  })

  describe('预设动画配置', () => {
    it('模板选择器动画应该使用正确的配置', () => {
      const animation = useTemplateSelectorAnimation()

      expect(animation.config.value).toEqual(SELECTOR_ANIMATION_CONFIG)
    })

    it('模板切换动画应该使用正确的配置', () => {
      const animation = useTemplateSwitchAnimation()

      expect(animation.config.value).toEqual(TEMPLATE_SWITCH_ANIMATION_CONFIG)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的配置', () => {
      const animation = useTemplateAnimation()

      // 尝试更新为无效配置
      animation.updateConfig({
        duration: -100, // 无效的持续时间
      })

      // 配置应该被更新，但动画系统应该能够处理
      expect(animation.config.value.duration).toBe(-100)
    })

    it('应该处理并发的动画调用', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 200,
        enabled: true,
      })

      // 同时调用多个动画
      const enter1 = animation.enter()
      const enter2 = animation.enter()

      vi.advanceTimersByTime(200)

      await Promise.all([enter1, enter2])

      // 应该只有一个动画生效
      expect(animation.animationState.value.visible).toBe(true)
      expect(animation.animationState.value.completed).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成动画', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 100,
        enabled: true,
      })

      const startTime = performance.now()

      const enterPromise = animation.enter()
      vi.advanceTimersByTime(100)
      await enterPromise

      const endTime = performance.now()

      // 动画应该在预期时间内完成（考虑到测试环境的误差）
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('应该能够处理快速连续的动画调用', async () => {
      const animation = useTemplateAnimation({
        type: AnimationType.FADE,
        duration: 50,
        enabled: true,
      })

      // 快速连续调用
      for (let i = 0; i < 10; i++) {
        animation.enter()
        vi.advanceTimersByTime(10)
      }

      vi.advanceTimersByTime(100)

      // 应该没有内存泄漏或错误
      expect(animation.animationState.value.visible).toBe(true)
    })
  })
})
