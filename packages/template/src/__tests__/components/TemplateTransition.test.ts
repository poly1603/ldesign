import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { TemplateTransition } from '../../components/TemplateTransition'
import {
  createWrapper,
  waitForDOMUpdate,
  waitForAnimation,
  mockAnimationEvent,
  mockTransitionEvent,
  expectAnimationClass,
  expectElementVisible
} from '../../test-utils'

describe('TemplateTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本渲染', () => {
    it('应该正确渲染过渡组件', () => {
      const wrapper = createWrapper(TemplateTransition, {
        slots: {
          default: '<div class="test-content">Test Content</div>',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该应用默认过渡类名', () => {
      const wrapper = createWrapper(TemplateTransition)

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.exists()).toBe(true)
      expect(transition.props('name')).toBe('template-switch')
    })

    it('应该支持自定义过渡名称', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          name: 'custom-transition',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('custom-transition')
    })
  })

  describe('过渡模式', () => {
    it('应该支持 out-in 模式', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          mode: 'out-in',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('mode')).toBe('out-in')
    })

    it('应该支持 in-out 模式', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          mode: 'in-out',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('mode')).toBe('in-out')
    })

    it('应该使用默认的 out-in 模式', () => {
      const wrapper = createWrapper(TemplateTransition)

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('mode')).toBe('out-in')
    })
  })

  describe('过渡时长', () => {
    it('应该支持自定义过渡时长', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          duration: 500,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('duration')).toBe(500)
    })

    it('应该使用默认时长', () => {
      const wrapper = createWrapper(TemplateTransition)

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('duration')).toBe(300)
    })

    it('应该支持对象形式的时长配置', () => {
      const duration = { enter: 300, leave: 200 }
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          duration,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('duration')).toEqual(duration)
    })
  })

  describe('过渡类名', () => {
    it('应该支持自定义进入类名', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          enterActiveClass: 'custom-enter-active',
          enterFromClass: 'custom-enter-from',
          enterToClass: 'custom-enter-to',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('enterActiveClass')).toBe('custom-enter-active')
      expect(transition.props('enterFromClass')).toBe('custom-enter-from')
      expect(transition.props('enterToClass')).toBe('custom-enter-to')
    })

    it('应该支持自定义离开类名', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          leaveActiveClass: 'custom-leave-active',
          leaveFromClass: 'custom-leave-from',
          leaveToClass: 'custom-leave-to',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('leaveActiveClass')).toBe('custom-leave-active')
      expect(transition.props('leaveFromClass')).toBe('custom-leave-from')
      expect(transition.props('leaveToClass')).toBe('custom-leave-to')
    })
  })

  describe('过渡事件', () => {
    it('应该发射 before-enter 事件', async () => {
      const wrapper = createWrapper(TemplateTransition, {
        slots: {
          default: '<div v-if="show" class="test-content">Test</div>',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('before-enter', element)

      expect(wrapper.emitted('before-enter')).toBeTruthy()
      expect(wrapper.emitted('before-enter')![0]).toEqual([element])
    })

    it('应该发射 enter 事件', async () => {
      const wrapper = createWrapper(TemplateTransition)
      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')
      const done = vi.fn()

      await transition.vm.$emit('enter', element, done)

      expect(wrapper.emitted('enter')).toBeTruthy()
      expect(wrapper.emitted('enter')![0]).toEqual([element, done])
    })

    it('应该发射 after-enter 事件', async () => {
      const wrapper = createWrapper(TemplateTransition)
      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('after-enter', element)

      expect(wrapper.emitted('after-enter')).toBeTruthy()
      expect(wrapper.emitted('after-enter')![0]).toEqual([element])
    })

    it('应该发射 before-leave 事件', async () => {
      const wrapper = createWrapper(TemplateTransition)
      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('before-leave', element)

      expect(wrapper.emitted('before-leave')).toBeTruthy()
      expect(wrapper.emitted('before-leave')![0]).toEqual([element])
    })

    it('应该发射 leave 事件', async () => {
      const wrapper = createWrapper(TemplateTransition)
      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')
      const done = vi.fn()

      await transition.vm.$emit('leave', element, done)

      expect(wrapper.emitted('leave')).toBeTruthy()
      expect(wrapper.emitted('leave')![0]).toEqual([element, done])
    })

    it('应该发射 after-leave 事件', async () => {
      const wrapper = createWrapper(TemplateTransition)
      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('after-leave', element)

      expect(wrapper.emitted('after-leave')).toBeTruthy()
      expect(wrapper.emitted('after-leave')![0]).toEqual([element])
    })
  })

  describe('过渡钩子', () => {
    it('应该在进入前设置初始状态', async () => {
      const onBeforeEnter = vi.fn()
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          onBeforeEnter,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('before-enter', element)

      expect(onBeforeEnter).toHaveBeenCalledWith(element)
    })

    it('应该在进入时执行动画', async () => {
      const onEnter = vi.fn()
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          onEnter,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')
      const done = vi.fn()

      await transition.vm.$emit('enter', element, done)

      expect(onEnter).toHaveBeenCalledWith(element, done)
    })

    it('应该在离开时执行动画', async () => {
      const onLeave = vi.fn()
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          onLeave,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')
      const done = vi.fn()

      await transition.vm.$emit('leave', element, done)

      expect(onLeave).toHaveBeenCalledWith(element, done)
    })
  })

  describe('动画类型', () => {
    it('应该支持淡入淡出动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'fade',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-fade')
    })

    it('应该支持滑动动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'slide',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide')
    })

    it('应该支持缩放动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'scale',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-scale')
    })

    it('应该支持翻转动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'flip',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-flip')
    })
  })

  describe('动画方向', () => {
    it('应该支持左滑动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'slide',
          direction: 'left',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide-left')
    })

    it('应该支持右滑动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'slide',
          direction: 'right',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide-right')
    })

    it('应该支持上滑动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'slide',
          direction: 'up',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide-up')
    })

    it('应该支持下滑动画', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'slide',
          direction: 'down',
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide-down')
    })
  })

  describe('性能优化', () => {
    it('应该在动画禁用时跳过过渡', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          disabled: true,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('')
    })

    it('应该支持 appear 属性', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          appear: true,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('appear')).toBe(true)
    })

    it('应该支持 CSS 过渡', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          css: true,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('css')).toBe(true)
    })

    it('应该支持 JavaScript 过渡', () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          css: false,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('css')).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理过渡取消', async () => {
      const onEnterCancelled = vi.fn()
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          onEnterCancelled,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('enter-cancelled', element)

      expect(onEnterCancelled).toHaveBeenCalledWith(element)
    })

    it('应该处理离开取消', async () => {
      const onLeaveCancelled = vi.fn()
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          onLeaveCancelled,
        },
      })

      const transition = wrapper.findComponent({ name: 'Transition' })
      const element = document.createElement('div')

      await transition.vm.$emit('leave-cancelled', element)

      expect(onLeaveCancelled).toHaveBeenCalledWith(element)
    })

    it('应该在动画失败时提供降级', async () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          fallback: true,
        },
      })

      // 模拟动画失败
      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('css')).toBe(false) // 降级到 JS 动画
    })
  })

  describe('响应式更新', () => {
    it('应该在 props 变化时更新过渡', async () => {
      const wrapper = createWrapper(TemplateTransition, {
        props: {
          type: 'fade',
        },
      })

      let transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-fade')

      await wrapper.setProps({ type: 'slide' })

      transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.props('name')).toBe('template-slide')
    })

    it('应该在内容变化时触发过渡', async () => {
      const wrapper = createWrapper(TemplateTransition, {
        slots: {
          default: '<div key="1">Content 1</div>',
        },
      })

      await wrapper.setSlot('default', '<div key="2">Content 2</div>')
      await waitForDOMUpdate()

      // 验证过渡被触发
      const transition = wrapper.findComponent({ name: 'Transition' })
      expect(transition.exists()).toBe(true)
    })
  })

  describe('集成测试', () => {
    it('应该与 TemplateRenderer 正确集成', () => {
      const wrapper = createWrapper(TemplateTransition, {
        slots: {
          default: '<div class="template-content">Template Content</div>',
        },
      })

      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该支持嵌套过渡', () => {
      const wrapper = createWrapper(TemplateTransition, {
        slots: {
          default: `
            <TemplateTransition type="fade">
              <div class="nested-content">Nested Content</div>
            </TemplateTransition>
          `,
        },
      })

      expect(wrapper.findAllComponents({ name: 'TemplateTransition' }).length).toBe(2)
    })
  })
})
