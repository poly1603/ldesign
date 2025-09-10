/**
 * 尺寸指示器组件
 */

import { defineComponent, type PropType, computed, h } from 'vue'
import { useSizeSwitcher } from './composables'
import type { SizeMode } from '../types'
import { Info, Gauge } from 'lucide-vue-next'

// 尺寸模式比例
const SIZE_MODE_SCALES: Partial<Record<SizeMode, number>> = {
  small: 0.75,
  medium: 1,
  large: 1.25,
  'extra-large': 1.5,
}

/**
 * 尺寸指示器组件属性
 */
export interface SizeIndicatorProps {
  /** 是否显示模式名称 */
  showMode?: boolean
  /** 是否显示比例信息 */
  showScale?: boolean
  /** 是否显示图标 */
  showIcon?: boolean
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 自定义类名 */
  className?: string
}

/**
 * 尺寸指示器组件
 */
export const SizeIndicator = defineComponent({
  name: 'SizeIndicator',
  props: {
    showMode: {
      type: Boolean,
      default: true,
    },
    showScale: {
      type: Boolean,
      default: false,
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    theme: {
      type: String as PropType<'light' | 'dark' | 'auto'>,
      default: 'auto',
    },
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { currentMode, getModeDisplayName } = useSizeSwitcher()

    const computedTheme = computed(() => {
      if (props.theme === 'auto') {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
      }
      return props.theme
    })

    const computedClasses = computed(() => [
      'size-indicator',
      `size-indicator--${props.size}`,
      `size-indicator--theme-${computedTheme.value}`,
      props.className,
    ])

    const currentScale = computed(() => SIZE_MODE_SCALES[currentMode.value] || 1)

    return () => {
      const children: any[] = []

      if (props.showIcon) {
        children.push(
          h(Info, {
            class: 'size-indicator__icon',
            size: props.size === 'small' ? 14 : props.size === 'large' ? 20 : 16,
          })
        )
      }

      if (props.showMode) {
        children.push(
          h('div', { class: 'size-indicator__mode' }, [
            h('span', { class: 'size-indicator__label' }, '当前尺寸：'),
            h('span', { class: 'size-indicator__value' }, getModeDisplayName(currentMode.value)),
          ])
        )
      }

      if (props.showScale) {
        children.push(
          h('div', { class: 'size-indicator__scale' }, [
            h(Gauge, { class: 'size-indicator__scale-icon', size: 14 }),
            h('span', { class: 'size-indicator__scale-value' }, `${(currentScale.value * 100).toFixed(0)}%`),
          ])
        )
      }

      return h('div', { class: computedClasses.value }, children)
    }
  },
})

export default SizeIndicator
