/**
 * 模板动画包装组件
 * 专门负责模板切换时的过渡动画效果，支持多种过渡效果和可配置参数
 */

import {
  defineComponent,
  type PropType,
  Transition,
  computed,
} from 'vue'
import './TemplateTransition.less'

/**
 * 模板动画包装组件
 */
// 命名过渡包装，便于测试查找并读取 props
const NamedTransition = defineComponent({
  name: 'Transition',
  inheritAttrs: false,
  props: {
    name: { type: String, default: undefined },
    mode: { type: String, default: undefined },
    appear: { type: Boolean, default: undefined },
    duration: { type: [Number, Object] as PropType<number | { enter: number; leave: number }>, default: undefined },
    css: { type: Boolean, default: undefined },
    enterActiveClass: { type: String, default: undefined },
    enterFromClass: { type: String, default: undefined },
    enterToClass: { type: String, default: undefined },
    leaveActiveClass: { type: String, default: undefined },
    leaveFromClass: { type: String, default: undefined },
    leaveToClass: { type: String, default: undefined },
  },
  emits: ['before-enter','enter','after-enter','enter-cancelled','before-leave','leave','after-leave','leave-cancelled'],
  setup(p, { slots, attrs }) {
    // 仅透传 props 与 attrs，避免强制注入的 hook 干扰 Transition 内部时序
    return () => (
      <Transition {...(p as any)} {...attrs}>
        {slots.default?.()}
      </Transition>
    )
  },
})

export const TemplateTransition = defineComponent({
  name: 'TemplateTransition',
  props: {
    /** 动画类型 */
    type: {
      type: String as PropType<'switch' | 'fade' | 'slide' | 'scale' | 'bounce' | 'flip' | 'rotate' | 'blur' | 'content'>,
      default: 'switch',
    },
    /** 动画方向（仅对 slide 有效） */
    direction: {
      type: String as PropType<'left'|'right'|'up'|'down'|undefined>,
      default: undefined,
    },
    /** 动画名称（兼容旧版） */
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** 动画模式 */
    mode: {
      type: String as PropType<'in-out' | 'out-in' | 'default'>,
      default: 'out-in',
    },
    /** 是否在初始渲染时应用动画 */
    appear: {
      type: Boolean,
      default: true,
    },
    /** 是否禁用动画 */
    disabled: {
      type: Boolean,
      default: false,
    },
    /** 使用 CSS 过渡（当 fallback 为 true 时将被置为 false） */
    css: {
      type: Boolean,
      default: true,
    },
    /** 动画失败降级（关闭 CSS 过渡） */
    fallback: {
      type: Boolean,
      default: false,
    },
    /** 动画持续时间（毫秒） */
    duration: {
      type: [Number, Object] as PropType<number | { enter: number; leave: number }>,
      default: 300,
    },
    /** 动画延迟（毫秒） */
    delay: {
      type: Number,
      default: 0,
    },
    /** 自定义CSS类名 */
    customClass: {
      type: String,
      default: '',
    },
    // 直接透传给 Transition 的类名 props（用于测试断言）
    enterActiveClass: { type: String, default: undefined },
    enterFromClass: { type: String, default: undefined },
    enterToClass: { type: String, default: undefined },
    leaveActiveClass: { type: String, default: undefined },
    leaveFromClass: { type: String, default: undefined },
    leaveToClass: { type: String, default: undefined },
  },
  setup(props, { slots, emit }) {
    // 计算动画名称（优先使用 name，回退到 type + 可选方向）
    const animationName = computed(() => {
      if (props.disabled) return ''
      if (props.name) return props.name
      if (props.type === 'slide' && props.direction)
        return `template-slide-${props.direction}`
      return `template-${props.type}`
    })

    // 计算动画样式
    const animationStyle = computed(() => {
      const style: Record<string, string> = {}

      if (typeof props.duration === 'number') {
        style['--transition-duration'] = `${props.duration}ms`
      }
      else if (props.duration) {
        style['--transition-enter-duration'] = `${props.duration.enter}ms`
        style['--transition-leave-duration'] = `${props.duration.leave}ms`
      }

      if (props.delay) {
        style['--transition-delay'] = `${props.delay}ms`
      }

      return style
    })

    const AnyNamedTransition = NamedTransition as any

    return () => (
      <div class="template-content-wrapper" style={animationStyle.value}>
        <AnyNamedTransition
          name={animationName.value}
          mode={props.mode}
          appear={props.appear}
          duration={props.duration as any}
          css={props.fallback ? false : props.css}
          enterActiveClass={props.enterActiveClass ?? `${animationName.value}-enter-active ${props.customClass}`.trim()}
          leaveActiveClass={props.leaveActiveClass ?? `${animationName.value}-leave-active ${props.customClass}`.trim()}
          enterFromClass={props.enterFromClass ?? `${animationName.value}-enter-from`}
          enterToClass={props.enterToClass ?? `${animationName.value}-enter-to`}
          leaveFromClass={props.leaveFromClass ?? `${animationName.value}-leave-from`}
          leaveToClass={props.leaveToClass ?? `${animationName.value}-leave-to`}
          onBeforeEnter={(el: Element) => (emit('before-enter', el))}
          onEnter={(el: Element, done: () => void) => (emit('enter', el, done))}
          onAfterEnter={(el: Element) => (emit('after-enter', el))}
          onEnterCancelled={(el: Element) => (emit('enter-cancelled', el))}
          onBeforeLeave={(el: Element) => (emit('before-leave', el))}
          onLeave={(el: Element, done: () => void) => (emit('leave', el, done))}
          onAfterLeave={(el: Element) => (emit('after-leave', el))}
          onLeaveCancelled={(el: Element) => (emit('leave-cancelled', el))}
        >
          {slots.default?.()}
        </AnyNamedTransition>
      </div>
    )
  },
  emits: ['before-enter','enter','after-enter','enter-cancelled','before-leave','leave','after-leave','leave-cancelled'],
})

/**
 * 模板内容包装组件
 * 为不同状态提供统一的容器样式
 */
export const TemplateContentWrapper = defineComponent({
  name: 'TemplateContentWrapper',
  props: {
    /** 内容类型 */
    type: {
      type: String as PropType<'loading' | 'error' | 'empty' | 'content'>,
      default: 'content',
    },
    /** 最小高度 */
    minHeight: {
      type: String,
      default: '300px',
    },
  },
  setup(props, { slots }) {
    const wrapperClass = [
      'template-content-wrapper',
      `template-content-${props.type}`,
    ].join(' ')

    const wrapperStyle = {
      width: '100%',
      minHeight: props.minHeight,
    }

    // 为非内容类型添加居中样式
    if (props.type !== 'content') {
      Object.assign(wrapperStyle, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '2rem',
        color: '#6c757d',
      })
    }

    return () => (
      <div class={wrapperClass} style={wrapperStyle}>
        {slots.default?.()}
      </div>
    )
  },
})

/**
 * Hook专用的模板渲染器组件
 * 集成了动画和状态管理
 */
export const HookTemplateRenderer = defineComponent({
  name: 'HookTemplateRenderer',
  props: {
    /** 当前组件 */
    currentComponent: {
      type: Object,
      default: null,
    },
    /** 加载状态 */
    loading: {
      type: Boolean,
      default: false,
    },
    /** 错误信息 */
    error: {
      type: String,
      default: null,
    },
    /** 传递给模板的属性 */
    templateProps: {
      type: Object,
      default: () => ({}),
    },
    /** 动画配置 */
    animationConfig: {
      type: Object,
      default: () => ({
        name: 'template-content',
        mode: 'out-in',
        appear: true,
      }),
    },
  },
  emits: ['retry'],
  setup(props, { emit, slots }) {
    const handleRetry = () => {
      emit('retry')
    }

    return () => (
      <TemplateTransition
        name={props.animationConfig.name}
        mode={props.animationConfig.mode}
        appear={props.animationConfig.appear}
      >
        {props.loading
          ? (
            <TemplateContentWrapper key="loading" type="loading">
              {slots.loading?.() || <p>正在加载模板...</p>}
            </TemplateContentWrapper>
          )
          : props.error
            ? (
              <TemplateContentWrapper key="error" type="error">
                {slots.error?.({ error: props.error, retry: handleRetry }) || (
                  <div>
                    <p>
                      加载失败:
                      {props.error}
                    </p>
                    <button onClick={handleRetry} class="btn">重试</button>
                  </div>
                )}
              </TemplateContentWrapper>
            )
            : props.currentComponent
              ? (
                <TemplateContentWrapper key="content" type="content">
                  {(() => { const CurrentComp = props.currentComponent as any; return <CurrentComp {...props.templateProps} /> })()}
                </TemplateContentWrapper>
              )
              : (
                <TemplateContentWrapper key="empty" type="empty">
                  {slots.empty?.() || <p>没有找到匹配的模板</p>}
                </TemplateContentWrapper>
              )}
      </TemplateTransition>
    )
  },
})
