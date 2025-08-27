/**
 * 尺寸切换器组件
 */

/* eslint-disable */
import type { SizeMode } from '../types'
import { defineComponent, type PropType, computed, ref, onMounted, onUnmounted } from 'vue'
import { useSizeSwitcher } from './composables'
import { getRecommendedSizeMode, createResponsiveSizeWatcher } from '../utils'
import './SizeSwitcher.less'

// 尺寸模式标签
const SIZE_MODE_LABELS: Partial<Record<SizeMode, string>> = {
  small: '小',
  medium: '中',
  large: '大',
  'extra-large': '超大',
}

// 尺寸模式图标
const SIZE_MODE_ICONS: Partial<Record<SizeMode, string>> = {
  small: '🔍',
  medium: '📏',
  large: '🔎',
  'extra-large': '🔍',
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
      nextMode,
      previousMode,
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

    const renderModeContent = (mode: SizeMode) => (
      <>
        {props.showIcons && (
          <span class="size-switcher__button-icon">{SIZE_MODE_ICONS[mode]}</span>
        )}
        {props.showLabels && (
          <span class="size-switcher__button-text">{getModeDisplayName(mode)}</span>
        )}
        {props.showDescriptions && (
          <div class="size-switcher__description">{SIZE_MODE_DESCRIPTIONS[mode]}</div>
        )}
      </>
    )

    const renderButtonSwitcher = () => (
      <div class="size-switcher__buttons">
        {computedModes.value.map(mode => (
          <button
            key={mode}
            class={[
              'size-switcher__button',
              {
                'size-switcher__button--active': currentMode.value === mode,
              },
            ]}
            disabled={props.disabled}
            onClick={() => handleModeChange(mode)}
            title={SIZE_MODE_DESCRIPTIONS[mode]}
          >
            {renderModeContent(mode)}
          </button>
        ))}
      </div>
    )

    const renderSegmentedSwitcher = () => (
      <div class="size-switcher__segmented">
        {computedModes.value.map(mode => (
          <div
            key={mode}
            class={[
              'size-switcher__segmented-item',
              {
                'size-switcher__segmented-item--active': currentMode.value === mode,
              },
            ]}
            onClick={() => handleModeChange(mode)}
            title={SIZE_MODE_DESCRIPTIONS[mode]}
          >
            {renderModeContent(mode)}
          </div>
        ))}
      </div>
    )

    const renderSelectSwitcher = () => (
      <select
        class="size-switcher__select"
        value={currentMode.value}
        disabled={props.disabled}
        onChange={(e: Event) => {
          const target = e.target as HTMLSelectElement
          handleModeChange(target.value as SizeMode)
        }}
      >
        {computedModes.value.map(mode => (
          <option key={mode} value={mode}>
            {props.showIcons ? `${SIZE_MODE_ICONS[mode]} ` : ''}
            {getModeDisplayName(mode)}
          </option>
        ))}
      </select>
    )

    const renderRadioSwitcher = () => (
      <div class="size-switcher__radios">
        {computedModes.value.map(mode => (
          <label key={mode} class="size-switcher__radio-label">
            <input
              type="radio"
              class="size-switcher__radio"
              name={`size-mode-${Math.random().toString(36).substr(2, 9)}`}
              value={mode}
              checked={currentMode.value === mode}
              disabled={props.disabled}
              onChange={() => handleModeChange(mode)}
            />
            <span class="size-switcher__radio-text">
              {props.showIcons && (
                <span class="size-switcher__radio-icon">{SIZE_MODE_ICONS[mode]}</span>
              )}
              {props.showLabels && getModeDisplayName(mode)}
            </span>
            {props.showDescriptions && (
              <div class="size-switcher__description">{SIZE_MODE_DESCRIPTIONS[mode]}</div>
            )}
          </label>
        ))}
      </div>
    )

    const renderSliderSwitcher = () => {
      const modeIndex = computedModes.value.indexOf(currentMode.value)
      const percentage = (modeIndex / (computedModes.value.length - 1)) * 100

      return (
        <div class="size-switcher__slider">
          <span class="size-switcher__slider-label">
            {computedModes.value[0] && getModeDisplayName(computedModes.value[0])}
          </span>
          <div
            class="size-switcher__slider-track"
            onClick={(e: MouseEvent) => {
              if (props.disabled) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const x = e.clientX - rect.left
              const percentage = x / rect.width
              const index = Math.round(percentage * (computedModes.value.length - 1))
              const mode = computedModes.value[index]
              if (mode) {
                handleModeChange(mode)
              }
            }}
          >
            <div
              class="size-switcher__slider-thumb"
              style={{ left: `${percentage}%` }}
            />
          </div>
          <span class="size-switcher__slider-label">
            {computedModes.value[computedModes.value.length - 1] &&
              getModeDisplayName(computedModes.value[computedModes.value.length - 1])}
          </span>
        </div>
      )
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
      if (!props.showSwitcher) {
        return null
      }

      return (
        <div class={computedClasses.value}>
          {renderSwitcher()}
        </div>
      )
    }
  },
})

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
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { currentMode, currentModeDisplayName } = useSizeSwitcher()

    return () => (
      <div class={`size-indicator ${props.className}`}>
        {props.showMode && (
          <span class="size-indicator__mode">
            当前尺寸:
            {' '}
            {currentModeDisplayName.value}
          </span>
        )}
        {props.showScale && (
          <span class="size-indicator__scale">
            (
            {currentMode.value}
            )
          </span>
        )}
      </div>
    )
  },
})

/**
 * 尺寸控制面板组件
 */
export const SizeControlPanel = defineComponent({
  name: 'SizeControlPanel',
  props: {
    showSwitcher: {
      type: Boolean,
      default: true,
    },
    showIndicator: {
      type: Boolean,
      default: true,
    },
    switcherStyle: {
      type: String as PropType<'button' | 'select' | 'radio'>,
      default: 'button',
    },
    className: {
      type: String,
      default: '',
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const handleChange = (mode: SizeMode) => {
      emit('change', mode)
    }

    return () => (
      <div class={`size-control-panel ${props.className}`}>
        {props.showIndicator && (
          <SizeIndicator class="size-control-panel__indicator" />
        )}
        {props.showSwitcher && (
          <SizeSwitcher
            class="size-control-panel__switcher"
            switcherStyle={props.switcherStyle}
            onChange={handleChange}
          />
        )}
      </div>
    )
  },
})

export default SizeSwitcher
