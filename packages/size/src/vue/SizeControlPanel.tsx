/**
 * 尺寸控制面板组件
 */

import { defineComponent, type PropType, computed, h } from 'vue'
import { SizeSwitcher } from './SizeSwitcher'
import { SizeIndicator } from './SizeIndicator'
import type { SizeMode } from '../types'
import { Settings } from 'lucide-vue-next'

/**
 * 尺寸控制面板组件属性
 */
export interface SizeControlPanelProps {
  /** 当前模式 */
  mode?: SizeMode
  /** 可选的尺寸模式列表 */
  modes?: SizeMode[]
  /** 是否显示指示器 */
  showIndicator?: boolean
  /** 是否显示切换器 */
  showSwitcher?: boolean
  /** 切换器样式 */
  switcherStyle?: 'button' | 'select' | 'radio' | 'slider' | 'segmented'
  /** 是否显示标题 */
  showTitle?: boolean
  /** 面板位置 */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inline'
  /** 是否可折叠 */
  collapsible?: boolean
  /** 默认是否展开 */
  defaultExpanded?: boolean
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 自定义类名 */
  className?: string
}

/**
 * 尺寸控制面板组件
 */
export const SizeControlPanel = defineComponent({
  name: 'SizeControlPanel',
  props: {
    mode: {
      type: String as PropType<SizeMode>,
      default: undefined,
    },
    modes: {
      type: Array as PropType<SizeMode[]>,
      default: () => ['small', 'medium', 'large'],
    },
    showIndicator: {
      type: Boolean,
      default: true,
    },
    showSwitcher: {
      type: Boolean,
      default: true,
    },
    switcherStyle: {
      type: String as PropType<'button' | 'select' | 'radio' | 'slider' | 'segmented'>,
      default: 'button',
    },
    showTitle: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right' | 'inline'>,
      default: 'inline',
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
    defaultExpanded: {
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
  emits: ['change', 'update:mode', 'expand', 'collapse'],
  setup(props, { emit }) {
    const isExpanded = computed(() => !props.collapsible || props.defaultExpanded)

    const computedTheme = computed(() => {
      if (props.theme === 'auto') {
        if (typeof window !== 'undefined' && window.matchMedia) {
          try {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          } catch (error) {
            console.warn('[SizeControlPanel] Failed to detect system theme:', error)
            return 'light'
          }
        }
        return 'light'
      }
      return props.theme
    })

    const computedClasses = computed(() => [
      'size-control-panel',
      `size-control-panel--${props.position}`,
      `size-control-panel--${props.size}`,
      `size-control-panel--theme-${computedTheme.value}`,
      {
        'size-control-panel--collapsible': props.collapsible,
        'size-control-panel--expanded': isExpanded.value,
      },
      props.className,
    ])

    const handleModeChange = (mode: SizeMode) => {
      emit('change', mode)
      emit('update:mode', mode)
    }

    const toggleExpanded = () => {
      if (props.collapsible) {
        const newState = !isExpanded.value
        emit(newState ? 'expand' : 'collapse')
      }
    }

    return () => {
      const children: any[] = []

      // 标题栏
      if (props.showTitle || props.collapsible) {
        children.push(
          h('div', { 
            class: 'size-control-panel__header',
            onClick: toggleExpanded
          }, [
            h(Settings, { class: 'size-control-panel__icon', size: 16 }),
            props.showTitle && h('span', { class: 'size-control-panel__title' }, '尺寸控制'),
          ])
        )
      }

      // 内容区
      if (!props.collapsible || isExpanded.value) {
        const contentChildren: any[] = []

        if (props.showIndicator) {
          contentChildren.push(
            h('div', { class: 'size-control-panel__indicator' }, [
              h(SizeIndicator, {
                showMode: true,
                showScale: true,
                size: props.size,
                theme: props.theme,
              })
            ])
          )
        }

        if (props.showSwitcher) {
          contentChildren.push(
            h('div', { class: 'size-control-panel__switcher' }, [
              h(SizeSwitcher, {
                mode: props.mode,
                modes: props.modes,
                switcherStyle: props.switcherStyle,
                size: props.size,
                theme: props.theme,
                onChange: handleModeChange,
                'onUpdate:mode': handleModeChange,
              })
            ])
          )
        }

        children.push(
          h('div', { class: 'size-control-panel__content' }, contentChildren)
        )
      }

      return h('div', { class: computedClasses.value }, children)
    }
  },
})

export default SizeControlPanel
