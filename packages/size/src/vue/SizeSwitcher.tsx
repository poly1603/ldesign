/**
 * 尺寸切换器组件
 */

import type { SizeMode } from '../types'
import { defineComponent, type PropType } from 'vue'
import { useSizeSwitcher } from './composables'

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
    showSwitcher: {
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

    // 监听外部模式变化
    if (props.mode && props.mode !== currentMode.value) {
      setMode(props.mode)
    }

    const handleModeChange = (mode: SizeMode) => {
      setMode(mode)
      emit('change', mode)
      emit('update:mode', mode)
    }

    const renderButtonSwitcher = () => (
      <div class={`size-switcher size-switcher--button ${props.className}`}>
        <div class="size-switcher__buttons">
          {availableModes.map(mode => (
            <button
              key={mode}
              class={[
                'size-switcher__button',
                {
                  'size-switcher__button--active': currentMode.value === mode,
                },
              ]}
              onClick={() => handleModeChange(mode)}
            >
              {getModeDisplayName(mode)}
            </button>
          ))}
        </div>
      </div>
    )

    const renderSelectSwitcher = () => (
      <div class={`size-switcher size-switcher--select ${props.className}`}>
        <select
          class="size-switcher__select"
          value={currentMode.value}
          onChange={(e: Event) => {
            const target = e.target as HTMLSelectElement
            handleModeChange(target.value as SizeMode)
          }}
        >
          {availableModes.map(mode => (
            <option key={mode} value={mode}>
              {getModeDisplayName(mode)}
            </option>
          ))}
        </select>
      </div>
    )

    const renderRadioSwitcher = () => (
      <div class={`size-switcher size-switcher--radio ${props.className}`}>
        <div class="size-switcher__radios">
          {availableModes.map(mode => (
            <label key={mode} class="size-switcher__radio-label">
              <input
                type="radio"
                class="size-switcher__radio"
                name="size-mode"
                value={mode}
                checked={currentMode.value === mode}
                onChange={() => handleModeChange(mode)}
              />
              <span class="size-switcher__radio-text">
                {getModeDisplayName(mode)}
              </span>
            </label>
          ))}
        </div>
      </div>
    )

    const renderSwitcher = () => {
      switch (props.switcherStyle) {
        case 'select':
          return renderSelectSwitcher()
        case 'radio':
          return renderRadioSwitcher()
        case 'button':
        default:
          return renderButtonSwitcher()
      }
    }

    return () => {
      if (!props.showSwitcher) {
        return null
      }

      return <div class="size-switcher-wrapper">{renderSwitcher()}</div>
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
