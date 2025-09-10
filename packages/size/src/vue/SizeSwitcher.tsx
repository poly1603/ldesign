/**
 * 尺寸切换器组件
 */

/* eslint-disable */
import type { SizeMode } from '../types'
import { defineComponent, type PropType, computed, ref, onMounted, onUnmounted, h } from 'vue'
import { useSizeSwitcher } from './composables'
import { createResponsiveSizeWatcher } from '../utils'
import { Minus, Type, Plus, Maximize2 } from 'lucide-vue-next'
import './SizeSwitcher.less'


// 尺寸模式图标组件
const SIZE_MODE_ICONS: Partial<Record<SizeMode, any>> = {
  small: Minus,
  medium: Type,
  large: Plus,
  'extra-large': Maximize2,
}

// 尺寸模式描述
const SIZE_MODE_DESCRIPTIONS: Partial<Record<SizeMode, string>> = {
  small: '适合移动设备和小屏幕',
  medium: '适合桌面和平板设备',
  large: '适合大屏幕和高分辨率显示器',
  'extra-large': '适合超大屏幕和演示模式',
}

/**
 * 尺寸切换器组件属性
 */
export interface SizeSwitcherProps {
  /** 当前模式 */
  mode?: SizeMode
  /** 可选的尺寸模式列表 */
  modes?: SizeMode[]
  /** 是否显示切换器 */
  showSwitcher?: boolean
  /** 切换器样式 */
  switcherStyle?: 'button' | 'select' | 'radio' | 'slider' | 'segmented'
  /** 是否显示标签 */
  showLabels?: boolean
  /** 是否显示图标 */
  showIcons?: boolean
  /** 是否显示描述 */
  showDescriptions?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否启用响应式 */
  responsive?: boolean
  /** 是否启用动画 */
  animated?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 尺寸切换器组件
 */
export const SizeSwitcher = defineComponent({
  name: 'SizeSwitcher',
  props: {
    mode: {
      type: String as PropType<SizeMode>,
      default: undefined,
    },
    modes: {
      type: Array as PropType<SizeMode[]>,
      default: () => ['small', 'medium', 'large'],
    },
    showSwitcher: {
      type: Boolean,
      default: true,
    },
    switcherStyle: {
      type: String as PropType<'button' | 'select' | 'radio' | 'slider' | 'segmented'>,
      default: 'button',
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
    showIcons: {
      type: Boolean,
      default: false,
    },
    showDescriptions: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    theme: {
      type: String as PropType<'light' | 'dark' | 'auto'>,
      default: 'auto',
    },
    responsive: {
      type: Boolean,
      default: false,
    },
    animated: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  emits: ['change', 'update:mode'],
  setup(props, { emit }) {
    const {
      currentMode,
      availableModes,
      setMode,
      getModeDisplayName,
    } = useSizeSwitcher({
      initialMode: props.mode,
    })

    // 响应式监听器
    const responsiveUnsubscriber = ref<(() => void) | null>(null)

    // 计算属性
    const computedModes = computed(() => props.modes || availableModes)
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
      'size-switcher',
      `size-switcher--${props.switcherStyle}`,
      `size-switcher--${props.size}`,
      `size-switcher--theme-${computedTheme.value}`,
      {
        'size-switcher--disabled': props.disabled,
        'size-switcher--animated': props.animated,
        'size-switcher--responsive': props.responsive,
      },
      props.className,
    ])

    // 监听外部模式变化
    if (props.mode && props.mode !== currentMode.value) {
      setMode(props.mode)
    }

    // 响应式功能
    onMounted(() => {
      if (props.responsive) {
        responsiveUnsubscriber.value = createResponsiveSizeWatcher((recommendedMode) => {
          if (computedModes.value.includes(recommendedMode)) {
            handleModeChange(recommendedMode)
          }
        })
      }
    })

    onUnmounted(() => {
      if (responsiveUnsubscriber.value) {
        responsiveUnsubscriber.value()
      }
    })

    const handleModeChange = (mode: SizeMode) => {
      if (props.disabled) return

      setMode(mode)
      emit('change', mode)
      emit('update:mode', mode)
    }

    const renderModeContent = (mode: SizeMode) => {
      const IconComponent = SIZE_MODE_ICONS[mode]
      const children: any[] = []
      if (props.showIcons && IconComponent) {
        children.push(h(IconComponent, { class: 'size-switcher__button-icon', size: 16 }))
      }
      if (props.showLabels) {
        children.push(h('span', { class: 'size-switcher__button-text' }, getModeDisplayName(mode)))
      }
      if (props.showDescriptions) {
        children.push(h('div', { class: 'size-switcher__description' }, SIZE_MODE_DESCRIPTIONS[mode]))
      }
      return h('span', { class: 'size-switcher__mode-content' }, children)
    }

    const renderButtonSwitcher = () =>
      h(
        'div',
        { class: 'size-switcher__buttons' },
        computedModes.value.map(mode =>
          h(
            'button',
            {
              key: mode,
              class: [
                'size-switcher__button',
                { 'size-switcher__button--active': currentMode.value === mode }
              ],
              disabled: props.disabled,
              onClick: () => handleModeChange(mode),
              title: SIZE_MODE_DESCRIPTIONS[mode]
            },
            [renderModeContent(mode)]
          )
        )
      )

    const renderSegmentedSwitcher = () =>
      h(
        'div',
        { class: 'size-switcher__segmented' },
        computedModes.value.map(mode =>
          h(
            'div',
            {
              key: mode,
              class: [
                'size-switcher__segmented-item',
                { 'size-switcher__segmented-item--active': currentMode.value === mode }
              ],
              onClick: () => handleModeChange(mode),
              title: SIZE_MODE_DESCRIPTIONS[mode]
            },
            [renderModeContent(mode)]
          )
        )
      )

    const renderSelectSwitcher = () =>
      h(
        'select',
        {
          class: 'size-switcher__select',
          value: currentMode.value,
          disabled: props.disabled,
          onChange: (e: Event) => {
            const target = e.target as HTMLSelectElement
            handleModeChange(target.value as SizeMode)
          }
        },
        computedModes.value.map(mode =>
          h('option', { key: mode, value: mode }, getModeDisplayName(mode))
        )
      )

    const renderRadioSwitcher = () =>
      h(
        'div',
        { class: 'size-switcher__radios' },
        computedModes.value.map(mode => {
          const children: any[] = []
          children.push(
            h('input', {
              type: 'radio',
              class: 'size-switcher__radio',
              name: `size-mode-${Math.random().toString(36).substr(2, 9)}`,
              value: mode as any,
              checked: currentMode.value === mode,
              disabled: props.disabled,
              onChange: () => handleModeChange(mode)
            })
          )
          const labelChildren: any[] = []
          if (props.showIcons && SIZE_MODE_ICONS[mode]) {
            const IconComponent = SIZE_MODE_ICONS[mode]
            labelChildren.push(h(IconComponent, { class: 'size-switcher__radio-icon', size: 16 }))
          }
          if (props.showLabels) {
            labelChildren.push(getModeDisplayName(mode))
          }
          children.push(h('span', { class: 'size-switcher__radio-text' }, labelChildren))
          if (props.showDescriptions) {
            children.push(h('div', { class: 'size-switcher__description' }, SIZE_MODE_DESCRIPTIONS[mode]))
          }
          return h('label', { key: mode, class: 'size-switcher__radio-label' }, children)
        })
      )

    const renderSliderSwitcher = () => {
      const modeIndex = computedModes.value.indexOf(currentMode.value)
      const percentage = (modeIndex / (computedModes.value.length - 1)) * 100

      const leftLabel =
        computedModes.value[0] && getModeDisplayName(computedModes.value[0])
      const rightLabel =
        computedModes.value[computedModes.value.length - 1] &&
        getModeDisplayName(computedModes.value[computedModes.value.length - 1])

      return h('div', { class: 'size-switcher__slider' }, [
        h('span', { class: 'size-switcher__slider-label' }, leftLabel as any),
        h(
          'div',
          {
            class: 'size-switcher__slider-track',
            onClick: (e: MouseEvent) => {
              if (props.disabled) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const x = e.clientX - rect.left
              const percent = x / rect.width
              const index = Math.round(percent * (computedModes.value.length - 1))
              const mode = computedModes.value[index]
              if (mode) handleModeChange(mode)
            }
          },
          [h('div', { class: 'size-switcher__slider-thumb', style: { left: `${percentage}%` } })]
        ),
        h('span', { class: 'size-switcher__slider-label' }, rightLabel as any)
      ])
    }

    const renderSwitcher = () => {
      switch (props.switcherStyle) {
        case 'select':
          return renderSelectSwitcher()
        case 'radio':
          return renderRadioSwitcher()
        case 'slider':
          return renderSliderSwitcher()
        case 'segmented':
          return renderSegmentedSwitcher()
        case 'button':
        default:
          return renderButtonSwitcher()
      }
    }

    return () => {
      if (!props.showSwitcher) return null
      return h('div', { class: computedClasses.value as any }, [renderSwitcher()])
    }
  },
})

export default SizeSwitcher
