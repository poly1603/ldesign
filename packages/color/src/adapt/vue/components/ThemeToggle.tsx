/**
 * 主题切换器组件
 */

import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { useThemeToggle } from '../composables/useThemeToggle'

export default defineComponent({
  name: 'LThemeToggle',
  props: {
    showText: {
      type: Boolean,
      default: false,
    },
    lightIcon: {
      type: String,
      default: '☀️',
    },
    darkIcon: {
      type: String,
      default: '🌙',
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    variant: {
      type: String as PropType<'button' | 'switch' | 'icon'>,
      default: 'button',
    },
  } as const,
  emits: ['change'],
  setup(props, { emit }) {
    const { currentMode, toggle, isLight, isDark } = useThemeToggle()

    const handleToggle = async () => {
      await toggle()
      emit('change', currentMode.value)
    }

    const buttonClass = computed(() => [
      'l-theme-toggle',
      `l-theme-toggle--${props.variant}`,
      `l-theme-toggle--${props.size}`,
      {
        'l-theme-toggle--light': isLight.value,
        'l-theme-toggle--dark': isDark.value,
      },
    ])

    const currentIcon = computed(() =>
      isLight.value ? props.lightIcon : props.darkIcon
    )

    const currentText = computed(() =>
      isLight.value ? '浅色模式' : '深色模式'
    )

    return () => {
      if (props.variant === 'switch') {
        return (
          <label class={buttonClass.value}>
            <input
              type='checkbox'
              checked={isDark.value}
              onChange={handleToggle}
              class='l-theme-toggle__input'
            />
            <span class='l-theme-toggle__slider'>
              <span class='l-theme-toggle__icon'>{currentIcon.value}</span>
            </span>
            {props.showText && (
              <span class='l-theme-toggle__text'>{currentText.value}</span>
            )}
          </label>
        )
      }

      return (
        <button
          type='button'
          class={buttonClass.value}
          onClick={handleToggle}
          title={`切换到${isLight.value ? '深色' : '浅色'}模式`}
        >
          <span class='l-theme-toggle__icon'>{currentIcon.value}</span>
          {props.showText && (
            <span class='l-theme-toggle__text'>{currentText.value}</span>
          )}
        </button>
      )
    }
  },
})
