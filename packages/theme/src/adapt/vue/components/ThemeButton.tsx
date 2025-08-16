/**
 * @ldesign/theme - 主题按钮组件
 *
 * 支持主题装饰和动画的按钮组件
 */

import type {
  AnimationConfig,
  DecorationConfig,
  ThemeButtonProps,
} from '../types'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
} from 'vue'
import {
  useTheme,
  useThemeAnimations,
  useThemeDecorations,
} from '../composables'

/**
 * 主题按钮组件
 */
export const ThemeButton = defineComponent({
  name: 'ThemeButton',
  props: {
    type: {
      type: String as PropType<
        'primary' | 'secondary' | 'success' | 'warning' | 'danger'
      >,
      default: 'primary',
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: undefined,
    },
    iconPosition: {
      type: String as PropType<'left' | 'right'>,
      default: 'left',
    },
    block: {
      type: Boolean,
      default: false,
    },
    round: {
      type: Boolean,
      default: false,
    },
    circle: {
      type: Boolean,
      default: false,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: undefined,
    },
    decoration: {
      type: [String, Object] as PropType<string | DecorationConfig>,
      default: undefined,
    },
    animation: {
      type: [String, Object] as PropType<string | AnimationConfig>,
      default: undefined,
    },
  } as ThemeButtonProps,

  emits: ['click', 'mouseenter', 'mouseleave', 'focus', 'blur'],

  setup(props, { slots, emit }) {
    const buttonRef = ref<HTMLElement>()
    const { currentTheme } = useTheme()
    const { addDecoration, removeDecoration } = useThemeDecorations()
    const { startAnimation, stopAnimation } = useThemeAnimations()

    // 计算按钮类名
    const buttonClasses = computed(() => {
      const classes = [
        'theme-button',
        `theme-button--${props.type}`,
        `theme-button--${props.size}`,
      ]

      if (props.loading)
        classes.push('theme-button--loading')
      if (props.disabled)
        classes.push('theme-button--disabled')
      if (props.block)
        classes.push('theme-button--block')
      if (props.round)
        classes.push('theme-button--round')
      if (props.circle)
        classes.push('theme-button--circle')
      if (props.ghost)
        classes.push('theme-button--ghost')
      if (currentTheme.value)
        classes.push(`theme-button--theme-${currentTheme.value}`)

      return classes
    })

    // 计算按钮样式
    const buttonStyles = computed(() => {
      const styles: Record<string, any> = {}

      // 这里可以根据当前主题添加样式
      if (currentTheme.value) {
        // 从主题配置中获取颜色等样式
      }

      return styles
    })

    // 装饰元素ID
    const decorationId = computed(() => {
      return `theme-button-decoration-${Math.random()
        .toString(36)
        .substr(2, 9)}`
    })

    // 处理装饰元素
    const handleDecoration = () => {
      if (!props.decoration || !buttonRef.value)
        return

      let decorationConfig: DecorationConfig

      if (typeof props.decoration === 'string') {
        decorationConfig = {
          id: decorationId.value,
          name: `按钮装饰-${props.decoration}`,
          type: 'icon',
          src: props.decoration,
          position: {
            type: 'absolute',
            position: { x: '100%', y: '0%' },
            anchor: 'top-right',
            offset: { x: '5px', y: '-5px' },
          },
          style: {
            size: { width: '16px', height: '16px' },
            opacity: 0.8,
            zIndex: 1,
          },
          interactive: false,
          responsive: true,
        }
      }
      else {
        decorationConfig = {
          ...props.decoration,
          id: decorationId.value,
        }
      }

      addDecoration(decorationConfig)
    }

    // 处理动画
    const handleAnimation = () => {
      if (!props.animation)
        return

      let animationName: string

      if (typeof props.animation === 'string') {
        animationName = props.animation
      }
      else {
        animationName = props.animation.name
      }

      startAnimation(animationName)
    }

    // 清理装饰和动画
    const cleanup = () => {
      if (props.decoration) {
        removeDecoration(decorationId.value)
      }

      if (props.animation) {
        const animationName
          = typeof props.animation === 'string'
            ? props.animation
            : props.animation.name
        stopAnimation(animationName)
      }
    }

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading)
        return

      emit('click', event)

      // 触发点击动画
      if (props.animation) {
        handleAnimation()
      }
    }

    const handleMouseEnter = (event: MouseEvent) => {
      emit('mouseenter', event)

      // 添加悬停装饰
      if (props.decoration) {
        handleDecoration()
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      emit('mouseleave', event)

      // 移除悬停装饰
      if (props.decoration) {
        removeDecoration(decorationId.value)
      }
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    // 生命周期
    onMounted(() => {
      // 初始化装饰和动画
      if (props.decoration) {
        handleDecoration()
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    return () => {
      const iconElement = props.icon && (
        <i
          class={`theme-button__icon theme-button__icon--${props.iconPosition}`}
        >
          {props.icon}
        </i>
      )

      const loadingElement = props.loading && (
        <i class="theme-button__loading">
          <svg viewBox="0 0 24 24" class="theme-button__loading-icon">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M12 2 A10 10 0 0 1 22 12"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
          </svg>
        </i>
      )

      const contentElement = (
        <span class="theme-button__content">
          {props.iconPosition === 'left' && iconElement}
          {slots.default?.()}
          {props.iconPosition === 'right' && iconElement}
        </span>
      )

      return (
        <button
          ref={buttonRef}
          class={buttonClasses.value}
          style={buttonStyles.value}
          disabled={props.disabled || props.loading}
          onClick={handleClick}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {props.loading ? loadingElement : contentElement}
        </button>
      )
    }
  },
})

export default ThemeButton
