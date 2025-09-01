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
export const TemplateTransition = defineComponent({
  name: 'TemplateTransition',
  props: {
    /** 动画类型 */
    type: {
      type: String as PropType<'fade' | 'slide' | 'scale' | 'bounce' | 'flip' | 'rotate' | 'blur' | 'content'>,
      default: 'content',
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
    /** 动画持续时间（毫秒） */
    duration: {
      type: [Number, Object] as PropType<number | { enter: number; leave: number }>,
      default: 400,
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
  },
  setup(props, { slots }) {
    // 计算动画名称
    const animationName = computed(() => `template-${props.type}`)

    // 计算动画样式
    const animationStyle = computed(() => {
      const style: Record<string, string> = {}

      if (typeof props.duration === 'number') {
        style['--transition-duration'] = `${props.duration}ms`
      } else if (props.duration) {
        style['--transition-enter-duration'] = `${props.duration.enter}ms`
        style['--transition-leave-duration'] = `${props.duration.leave}ms`
      }

      if (props.delay) {
        style['--transition-delay'] = `${props.delay}ms`
      }

      return style
    })

    return () => (
      <div class="template-content-wrapper" style={animationStyle.value}>
        <Transition
          name={animationName.value}
          mode={props.mode}
          appear={props.appear}
          enterActiveClass={`${animationName.value}-enter-active ${props.customClass}`.trim()}
          leaveActiveClass={`${animationName.value}-leave-active ${props.customClass}`.trim()}
          enterFromClass={`${animationName.value}-enter-from`}
          enterToClass={`${animationName.value}-enter-to`}
          leaveFromClass={`${animationName.value}-leave-from`}
          leaveToClass={`${animationName.value}-leave-to`}
        >
          {slots.default?.()}
        </Transition>
      </div>
    )
  },
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
                  <props.currentComponent {...props.templateProps} />
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
