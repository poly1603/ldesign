/**
 * Size Vue 组件
 */

import type { SizeMode } from '../../types'
import { defineComponent, ref, onMounted, onUnmounted, inject, h } from 'vue'
import { SizeSymbol } from './plugin'

/**
 * 尺寸切换器组件
 */
export const SizeSwitcher = defineComponent({
  name: 'SizeSwitcher',
  props: {
    /** 显示样式 */
    style: {
      type: String as () => 'button' | 'select' | 'radio' | 'segmented',
      default: 'select',
    },
    /** 是否显示标签 */
    showLabels: {
      type: Boolean,
      default: true,
    },
    /** 可选的尺寸模式 */
    modes: {
      type: Array as () => SizeMode[],
      default: () => ['small', 'medium', 'large', 'extra-large'],
    },
  },
  setup(props) {
    const sizeManager = inject(SizeSymbol) as any

    if (!sizeManager) {
      console.warn('[SizeSwitcher] Size manager not found')
      return () => null
    }

    // 响应式状态
    const currentMode = ref(sizeManager.getCurrentMode())

    // 尺寸模式标签
    const modeLabels: Record<SizeMode, string> = {
      small: '小',
      medium: '中',
      large: '大',
      'extra-large': '超大',
    }

    // 监听尺寸变化
    const handleSizeChange = () => {
      currentMode.value = sizeManager.getCurrentMode()
    }

    onMounted(() => {
      sizeManager.on('size-changed', handleSizeChange)
    })

    onUnmounted(() => {
      sizeManager.off('size-changed', handleSizeChange)
    })

    // 方法
    const handleModeChange = async (event: Event) => {
      const target = event.target as HTMLSelectElement | HTMLInputElement
      const mode = target.value as SizeMode
      if (mode && mode !== currentMode.value) {
        try {
          await sizeManager.setMode(mode)
          currentMode.value = sizeManager.getCurrentMode()
          console.log('SizeSwitcher: Size changed to:', mode)
        } catch (error) {
          console.error('SizeSwitcher: Failed to change size:', error)
        }
      }
    }

    const handleButtonClick = async (mode: SizeMode) => {
      if (mode !== currentMode.value) {
        try {
          await sizeManager.setMode(mode)
          currentMode.value = sizeManager.getCurrentMode()
          console.log('SizeSwitcher: Size changed to:', mode)
        } catch (error) {
          console.error('SizeSwitcher: Failed to change size:', error)
        }
      }
    }

    return () => {
      if (props.style === 'select') {
        return h('div', { class: 'size-switcher size-switcher--select' }, [
          h('label', { class: 'size-switcher__label' }, [
            props.showLabels && h('span', '尺寸：'),
            h('select', {
              class: 'size-switcher__select',
              value: currentMode.value,
              onChange: handleModeChange
            }, props.modes.map(mode =>
              h('option', { key: mode, value: mode }, modeLabels[mode])
            ))
          ])
        ])
      }

      if (props.style === 'button') {
        return h('div', { class: 'size-switcher size-switcher--button' }, [
          props.showLabels && h('span', { class: 'size-switcher__label' }, '尺寸：'),
          h('div', { class: 'size-switcher__buttons' },
            props.modes.map(mode =>
              h('button', {
                key: mode,
                class: [
                  'size-switcher__button',
                  { 'size-switcher__button--active': currentMode.value === mode }
                ],
                onClick: () => handleButtonClick(mode)
              }, modeLabels[mode])
            )
          )
        ])
      }

      if (props.style === 'radio') {
        return h('div', { class: 'size-switcher size-switcher--radio' }, [
          props.showLabels && h('span', { class: 'size-switcher__label' }, '尺寸：'),
          h('div', { class: 'size-switcher__radios' },
            props.modes.map(mode =>
              h('label', { key: mode, class: 'size-switcher__radio' }, [
                h('input', {
                  type: 'radio',
                  name: 'size-mode',
                  value: mode,
                  checked: currentMode.value === mode,
                  onChange: handleModeChange
                }),
                h('span', modeLabels[mode])
              ])
            )
          )
        ])
      }

      if (props.style === 'segmented') {
        return h('div', { class: 'size-switcher size-switcher--segmented' }, [
          props.showLabels && h('span', { class: 'size-switcher__label' }, '尺寸：'),
          h('div', { class: 'size-switcher__segmented' },
            props.modes.map(mode =>
              h('button', {
                key: mode,
                class: [
                  'size-switcher__segment',
                  { 'size-switcher__segment--active': currentMode.value === mode }
                ],
                onClick: () => handleButtonClick(mode)
              }, modeLabels[mode])
            )
          )
        ])
      }

      return null
    }
  },
})
