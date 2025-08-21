/**
 * 主题提供者组件
 */

import type { PropType } from 'vue'
import type {
  ColorMode,
  ThemeConfig,
  ThemeManagerInstance,
} from '../../../core/types'
import { defineComponent, onMounted, provide, watch } from 'vue'
import { ThemeManager } from '../../../core/theme-manager'
import { useSystemThemeSync } from '../composables/useSystemThemeSync'
import { THEME_MANAGER_KEY } from '../types'

export default defineComponent({
  name: 'LThemeProvider',
  props: {
    themeManager: {
      type: Object as PropType<ThemeManagerInstance>,
      default: undefined,
    },
    defaultTheme: {
      type: String,
      default: 'default',
    },
    defaultMode: {
      type: String as PropType<ColorMode>,
      default: 'light',
    },
    themes: {
      type: Array as PropType<ThemeConfig[]>,
      default: () => [],
    },
    enableSystemSync: {
      type: Boolean,
      default: false,
    },
  } as const,
  setup(props, { slots }) {
    // 创建或使用传入的主题管理器
    let manager: ThemeManagerInstance

    if (props.themeManager) {
      manager = props.themeManager
    }
    else {
      manager = new ThemeManager({
        themes: props.themes,
        defaultTheme: props.defaultTheme,
      })
    }

    // 提供主题管理器
    provide(THEME_MANAGER_KEY, manager)

    // 系统主题同步
    const { syncWithSystem, isSupported } = useSystemThemeSync(manager)

    onMounted(async () => {
      // 初始化主题管理器
      await manager.init()

      // 如果启用系统主题同步且支持
      if (props.enableSystemSync && isSupported.value) {
        await syncWithSystem()
      }
    })

    // 监听属性变化
    watch(
      () => props.themes,
      (newThemes) => {
        if (newThemes && newThemes.length > 0) {
          newThemes.forEach((theme) => {
            manager.registerTheme(theme)
          })
        }
      },
      { deep: true },
    )

    return () => {
      return <div class="l-theme-provider">{slots.default?.()}</div>
    }
  },
})
