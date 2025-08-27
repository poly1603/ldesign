/**
 * Vue 组件 for @ldesign/color
 */

import { defineComponent, ref, computed, inject, getCurrentInstance, h } from 'vue'
import type { ThemeManagerInstance, ColorMode } from '../../core/types'

/**
 * 主题色选择器组件
 */
export const ThemeColorPicker = defineComponent({
  name: 'ThemeColorPicker',
  props: {
    /** 显示模式切换 */
    showModeToggle: {
      type: Boolean,
      default: true,
    },
    /** 显示主题名称 */
    showThemeName: {
      type: Boolean,
      default: true,
    },
    /** 组件大小 */
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium',
    },
  },
  setup(props) {
    // 尝试从注入中获取主题管理器
    const injectedThemeManager = inject<ThemeManagerInstance>('$themeManager')
    
    // 尝试从全局属性获取主题管理器
    const instance = getCurrentInstance()
    const globalThemeManager = instance?.appContext.config.globalProperties.$themeManager

    const themeManager = injectedThemeManager || globalThemeManager

    if (!themeManager) {
      console.warn('[ThemeColorPicker] ThemeManager not found. Make sure the color plugin is installed.')
      return () => h('div', { class: 'theme-color-picker-error' }, 'ThemeManager not found')
    }

    // 响应式状态
    const currentTheme = ref(themeManager.getCurrentTheme())
    const currentMode = ref(themeManager.getCurrentMode())
    const availableThemes = ref(themeManager.getThemeNames())

    // 监听主题变化
    themeManager.on('theme-changed', () => {
      currentTheme.value = themeManager.getCurrentTheme()
    })

    themeManager.on('mode-changed', () => {
      currentMode.value = themeManager.getCurrentMode()
    })

    // 计算属性
    const isDark = computed(() => currentMode.value === 'dark')

    // 方法
    const handleThemeChange = async (event: Event) => {
      const target = event.target as HTMLSelectElement
      const theme = target.value
      if (theme && theme !== currentTheme.value) {
        try {
          await themeManager.setTheme(theme)
          currentTheme.value = themeManager.getCurrentTheme()
          console.log('ThemeColorPicker: Theme changed to:', theme)
        } catch (error) {
          console.error('ThemeColorPicker: Failed to change theme:', error)
        }
      }
    }

    const handleModeToggle = async () => {
      try {
        await themeManager.toggleMode()
        currentMode.value = themeManager.getCurrentMode()
        console.log('ThemeColorPicker: Mode toggled to:', currentMode.value)
      } catch (error) {
        console.error('ThemeColorPicker: Failed to toggle mode:', error)
      }
    }

    // 渲染函数
    return () => {
      const sizeClass = `theme-color-picker--${props.size}`
      
      return h('div', {
        class: ['theme-color-picker', sizeClass, isDark.value ? 'theme-color-picker--dark' : 'theme-color-picker--light'],
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: isDark.value ? '#2d2d2d' : '#f5f5f5',
          border: `1px solid ${isDark.value ? '#404040' : '#e0e0e0'}`,
        }
      }, [
        // 主题选择器
        h('div', {
          class: 'theme-selector',
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        }, [
          props.showThemeName && h('label', {
            style: {
              fontSize: '14px',
              fontWeight: '500',
              color: isDark.value ? '#ffffff' : '#333333',
            }
          }, 'Theme:'),
          h('select', {
            value: currentTheme.value,
            onChange: handleThemeChange,
            style: {
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${isDark.value ? '#555555' : '#cccccc'}`,
              backgroundColor: isDark.value ? '#3d3d3d' : '#ffffff',
              color: isDark.value ? '#ffffff' : '#333333',
              fontSize: '14px',
              cursor: 'pointer',
            }
          }, availableThemes.value.map(theme => 
            h('option', {
              key: theme,
              value: theme,
              selected: theme === currentTheme.value
            }, theme)
          ))
        ]),

        // 模式切换按钮
        props.showModeToggle && h('button', {
          onClick: handleModeToggle,
          style: {
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isDark.value ? '#4a4a4a' : '#e0e0e0',
            color: isDark.value ? '#ffffff' : '#333333',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          },
          onMouseover: (e: MouseEvent) => {
            const target = e.target as HTMLElement
            target.style.backgroundColor = isDark.value ? '#5a5a5a' : '#d0d0d0'
          },
          onMouseout: (e: MouseEvent) => {
            const target = e.target as HTMLElement
            target.style.backgroundColor = isDark.value ? '#4a4a4a' : '#e0e0e0'
          }
        }, `${isDark.value ? '🌙' : '☀️'} ${currentMode.value}`)
      ])
    }
  }
})

/**
 * 简单的主题切换器组件
 */
export const ThemeSwitcher = defineComponent({
  name: 'ThemeSwitcher',
  setup() {
    // 尝试从注入中获取主题管理器
    const injectedThemeManager = inject<ThemeManagerInstance>('$themeManager')
    
    // 尝试从全局属性获取主题管理器
    const instance = getCurrentInstance()
    const globalThemeManager = instance?.appContext.config.globalProperties.$themeManager

    const themeManager = injectedThemeManager || globalThemeManager

    if (!themeManager) {
      console.warn('[ThemeSwitcher] ThemeManager not found. Make sure the color plugin is installed.')
      return () => h('div', { class: 'theme-switcher-error' }, 'ThemeManager not found')
    }

    // 响应式状态
    const currentTheme = ref(themeManager.getCurrentTheme())
    const availableThemes = ref(themeManager.getThemeNames())

    // 监听主题变化
    themeManager.on('theme-changed', () => {
      currentTheme.value = themeManager.getCurrentTheme()
    })

    // 方法
    const handleThemeChange = async (event: Event) => {
      const target = event.target as HTMLSelectElement
      const theme = target.value
      if (theme && theme !== currentTheme.value) {
        try {
          await themeManager.setTheme(theme)
          currentTheme.value = themeManager.getCurrentTheme()
          console.log('ThemeSwitcher: Theme changed to:', theme)
        } catch (error) {
          console.error('ThemeSwitcher: Failed to change theme:', error)
        }
      }
    }

    // 渲染函数
    return () => {
      return h('select', {
        value: currentTheme.value,
        onChange: handleThemeChange,
        style: {
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #cccccc',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          cursor: 'pointer',
        }
      }, availableThemes.value.map(theme => 
        h('option', {
          key: theme,
          value: theme,
          selected: theme === currentTheme.value
        }, theme)
      ))
    }
  }
})

/**
 * 模式切换器组件
 */
export const ModeToggler = defineComponent({
  name: 'ModeToggler',
  setup() {
    // 尝试从注入中获取主题管理器
    const injectedThemeManager = inject<ThemeManagerInstance>('$themeManager')
    
    // 尝试从全局属性获取主题管理器
    const instance = getCurrentInstance()
    const globalThemeManager = instance?.appContext.config.globalProperties.$themeManager

    const themeManager = injectedThemeManager || globalThemeManager

    if (!themeManager) {
      console.warn('[ModeToggler] ThemeManager not found. Make sure the color plugin is installed.')
      return () => h('div', { class: 'mode-toggler-error' }, 'ThemeManager not found')
    }

    // 响应式状态
    const currentMode = ref(themeManager.getCurrentMode())

    // 监听模式变化
    themeManager.on('mode-changed', () => {
      currentMode.value = themeManager.getCurrentMode()
    })

    // 计算属性
    const isDark = computed(() => currentMode.value === 'dark')

    // 方法
    const handleModeToggle = async () => {
      try {
        await themeManager.toggleMode()
        currentMode.value = themeManager.getCurrentMode()
        console.log('ModeToggler: Mode toggled to:', currentMode.value)
      } catch (error) {
        console.error('ModeToggler: Failed to toggle mode:', error)
      }
    }

    // 渲染函数
    return () => {
      return h('button', {
        onClick: handleModeToggle,
        style: {
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: isDark.value ? '#4a4a4a' : '#e0e0e0',
          color: isDark.value ? '#ffffff' : '#333333',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }
      }, `${isDark.value ? '🌙' : '☀️'} ${currentMode.value}`)
    }
  }
})
