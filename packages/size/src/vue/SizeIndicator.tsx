/**
 * 尺寸指示器组件
 */

/* eslint-disable */
import type { SizeMode } from '../types'
import { computed, defineComponent } from 'vue'
import { useSize, useSizeResponsive } from './composables'
import { getSizeModeDisplayName, calculateSizeScale } from '../utils'

export interface SizeIndicatorProps {
  showMode?: boolean
  showScale?: boolean
  showIcon?: boolean
  format?: 'text' | 'badge' | 'chip' | 'minimal'
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center-left' | 'center-right' | 'static'
  theme?: 'light' | 'dark' | 'auto'
  size?: 'small' | 'medium' | 'large'
}

// 尺寸模式图标
const SIZE_MODE_ICONS: Partial<Record<SizeMode, string>> = {
  small: '🔍',
  medium: '📏',
  large: '🔎',
  'extra-large': '🔍',
}

export default defineComponent({
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
    format: {
      type: String as () => 'text' | 'badge' | 'chip' | 'minimal',
      default: 'text',
    },
    position: {
      type: String as () => 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center-left' | 'center-right' | 'static',
      default: 'static',
    },
    theme: {
      type: String as () => 'light' | 'dark' | 'auto',
      default: 'auto',
    },
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'small',
    },
  },
  setup(props, { slots }) {
    const { currentMode, currentConfig } = useSize()
    const { isSmall, isMedium, isLarge } = useSizeResponsive()

    const scale = computed(() => {
      return calculateSizeScale('medium', currentMode.value)
    })

    const modeDisplayName = computed(() => {
      return getSizeModeDisplayName(currentMode.value)
    })

    const modeIcon = computed(() => {
      return SIZE_MODE_ICONS[currentMode.value] || '📏'
    })

    const indicatorClasses = computed(() => [
      'size-indicator',
      `size-indicator--${props.format}`,
      `size-indicator--${props.position}`,
      `size-indicator--${props.theme}`,
      `size-indicator--${props.size}`,
      {
        'size-indicator--with-icon': props.showIcon,
        'size-indicator--with-scale': props.showScale,
      },
    ])

    const renderContent = () => {
      if (slots.default) {
        return slots.default({
          mode: currentMode.value,
          scale: scale.value,
          config: currentConfig.value,
        })
      }

      const iconSlot = slots.icon?.({ mode: currentMode.value })
      const textSlot = slots.text?.({ mode: currentMode.value, scale: scale.value })

      return (
        <div class="size-indicator__content">
          {props.showIcon && (
            <span class="size-indicator__icon">
              {iconSlot || modeIcon.value}
            </span>
          )}

          {props.showMode && (
            <span class="size-indicator__mode">
              {textSlot || modeDisplayName.value}
            </span>
          )}

          {props.showScale && (
            <span class="size-indicator__scale">
              {scale.value}x
            </span>
          )}
        </div>
      )
    }

    const renderBadge = () => (
      <div class={indicatorClasses.value}>
        {renderContent()}
      </div>
    )

    const renderChip = () => (
      <div class={indicatorClasses.value}>
        <div class="size-indicator__chip-content">
          {renderContent()}
        </div>
      </div>
    )

    const renderMinimal = () => (
      <div class={indicatorClasses.value}>
        {props.showIcon ? (
          <span class="size-indicator__minimal-icon">
            {modeIcon.value}
          </span>
        ) : (
          <span class="size-indicator__minimal-dot" />
        )}
      </div>
    )

    const renderText = () => (
      <div class={indicatorClasses.value}>
        {renderContent()}
      </div>
    )

    return () => {
      switch (props.format) {
        case 'badge':
          return renderBadge()
        case 'chip':
          return renderChip()
        case 'minimal':
          return renderMinimal()
        case 'text':
        default:
          return renderText()
      }
    }
  },
})
