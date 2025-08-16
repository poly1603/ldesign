/**
 * @ldesign/theme - Vue 主题提供者组件
 *
 * 提供主题上下文，管理主题状态和生命周期
 */

import type {
  ThemeConfig,
  ThemeManagerInstance,
  VueThemeContext,
  VueThemeProviderProps,
} from '../types'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  provide,
  ref,
  watch,
} from 'vue'
import { createThemeManager } from '../../../core/theme-manager'
import { VueThemeContextKey } from '../types'

/**
 * 主题提供者组件
 */
export const ThemeProvider = defineComponent({
  name: 'ThemeProvider',
  props: {
    theme: {
      type: String,
      default: undefined,
    },
    themes: {
      type: Array as PropType<ThemeConfig[]>,
      default: () => [],
    },
    autoActivate: {
      type: Boolean,
      default: true,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  } as VueThemeProviderProps,

  setup(props, { slots }) {
    // 主题管理器实例
    const themeManager = ref<ThemeManagerInstance>()

    // 响应式状态
    const currentTheme = ref<string | undefined>(props.theme)
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    // 计算属性
    const availableThemes = computed(() => {
      return themeManager.value?.getAvailableThemes() || []
    })

    // 创建主题上下文
    const themeContext: VueThemeContext = {
      themeManager: themeManager as any,
      currentTheme,
      availableThemes,
      isLoading,
      error,
    }

    // 提供主题上下文
    provide(VueThemeContextKey, themeContext)

    /**
     * 初始化主题管理器
     */
    const initializeThemeManager = async () => {
      try {
        isLoading.value = true
        error.value = null

        // 创建主题管理器
        themeManager.value = createThemeManager({
          themes: props.themes,
          defaultTheme: props.theme,
          autoActivate: props.autoActivate,
          debug: props.debug,
        })

        // 监听主题变化事件
        themeManager.value.on('theme-changed', data => {
          currentTheme.value = data.theme
          if (props.debug) {
            console.log('[ThemeProvider] Theme changed:', data.theme)
          }
        })

        themeManager.value.on('theme-error', data => {
          error.value = data.error || new Error('Unknown theme error')
          if (props.debug) {
            console.error('[ThemeProvider] Theme error:', data.error)
          }
        })

        // 初始化主题管理器
        await themeManager.value.init()

        if (props.debug) {
          console.log('[ThemeProvider] Theme manager initialized')
        }
      } catch (err) {
        error.value = err as Error
        if (props.debug) {
          console.error(
            '[ThemeProvider] Failed to initialize theme manager:',
            err
          )
        }
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 清理主题管理器
     */
    const cleanupThemeManager = () => {
      if (themeManager.value) {
        themeManager.value.destroy()
        themeManager.value = undefined

        if (props.debug) {
          console.log('[ThemeProvider] Theme manager destroyed')
        }
      }
    }

    // 监听主题属性变化
    watch(
      () => props.theme,
      async newTheme => {
        if (themeManager.value && newTheme && newTheme !== currentTheme.value) {
          try {
            await themeManager.value.setTheme(newTheme)
          } catch (err) {
            error.value = err as Error
            if (props.debug) {
              console.error('[ThemeProvider] Failed to set theme:', err)
            }
          }
        }
      }
    )

    // 监听主题列表变化
    watch(
      () => props.themes,
      newThemes => {
        if (themeManager.value && newThemes) {
          // 清除现有主题
          const existingThemes = themeManager.value.getAvailableThemes()
          existingThemes.forEach(themeName => {
            themeManager.value!.removeTheme(themeName)
          })

          // 添加新主题
          newThemes.forEach(theme => {
            themeManager.value!.addTheme(theme)
          })

          if (props.debug) {
            console.log(
              '[ThemeProvider] Themes updated:',
              newThemes.map(t => t.name)
            )
          }
        }
      },
      { deep: true }
    )

    // 生命周期钩子
    onMounted(() => {
      initializeThemeManager()
    })

    onUnmounted(() => {
      cleanupThemeManager()
    })

    return () => {
      return (
        <div class='theme-provider'>
          {/* 错误状态 */}
          {error.value && (
            <div class='theme-provider__error'>
              <p>
                主题加载失败:
                {error.value.message}
              </p>
              <button
                onClick={() => {
                  error.value = null
                  initializeThemeManager()
                }}
              >
                重试
              </button>
            </div>
          )}

          {/* 加载状态 */}
          {isLoading.value && (
            <div class='theme-provider__loading'>
              <p>正在加载主题...</p>
            </div>
          )}

          {/* 子组件 */}
          {!error.value && !isLoading.value && slots.default?.()}
        </div>
      )
    }
  },
})

export default ThemeProvider
