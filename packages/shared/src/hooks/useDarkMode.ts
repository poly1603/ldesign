/**
 * 暗黑模式管理 Hook
 * 
 * @description
 * 提供暗黑模式的切换、检测、持久化功能，支持系统主题跟随、
 * 自定义主题切换动画等功能。
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 暗黑模式状态
 */
export interface DarkModeState {
  /** 当前是否为暗黑模式 */
  isDark: boolean
  /** 当前主题模式设置 */
  mode: ThemeMode
  /** 系统是否偏好暗黑模式 */
  systemPrefersDark: boolean
  /** 是否支持系统主题检测 */
  isSupported: boolean
  /** 是否正在切换主题 */
  isToggling: boolean
}

/**
 * 暗黑模式配置
 */
export interface DarkModeConfig {
  /** 存储键名 */
  storageKey?: string
  /** 默认主题模式 */
  defaultMode?: ThemeMode
  /** 暗黑模式类名 */
  darkClass?: string
  /** 亮色模式类名 */
  lightClass?: string
  /** 目标元素选择器 */
  target?: string | HTMLElement
  /** 是否启用过渡动画 */
  enableTransition?: boolean
  /** 过渡动画持续时间（毫秒） */
  transitionDuration?: number
  /** 主题切换时的回调 */
  onChange?: (isDark: boolean, mode: ThemeMode) => void
  /** 系统主题变化时的回调 */
  onSystemChange?: (prefersDark: boolean) => void
}

/**
 * 暗黑模式 Hook
 * 
 * @param config - 配置选项
 * @returns 暗黑模式状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { 
 *       state, 
 *       toggle, 
 *       setMode, 
 *       setDark, 
 *       setLight, 
 *       setAuto 
 *     } = useDarkMode({
 *       defaultMode: 'auto',
 *       enableTransition: true,
 *       onChange: (isDark, mode) => {
 *         `)
 *       }
 *     })
 *     
 *     const handleToggle = () => {
 *       toggle()
 *     }
 *     
 *     return {
 *       state,
 *       handleToggle,
 *       setMode,
 *       setDark,
 *       setLight,
 *       setAuto
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="toggle()" :disabled="state.isToggling">
 *       {{ state.isDark ? '🌙' : '☀️' }}
 *       {{ state.isDark ? '暗黑模式' : '亮色模式' }}
 *     </button>
 *     
 *     <select @change="setMode($event.target.value)">
 *       <option value="light">亮色模式</option>
 *       <option value="dark">暗黑模式</option>
 *       <option value="auto">跟随系统</option>
 *     </select>
 *     
 *     <p v-if="state.mode === 'auto'">
 *       系统偏好: {{ state.systemPrefersDark ? '暗黑' : '亮色' }}
 *     </p>
 *   </div>
 * </template>
 * ```
 */
export function useDarkMode(config: DarkModeConfig = {}) {
  const {
    storageKey = 'theme-mode',
    defaultMode = 'auto',
    darkClass = 'dark',
    lightClass = 'light',
    target = 'html',
    enableTransition = true,
    transitionDuration = 300,
    onChange,
    onSystemChange,
  } = config

  // 检查是否支持系统主题检测
  const isSupported = typeof window !== 'undefined' && 'matchMedia' in window

  // 系统主题偏好
  const systemPrefersDark = ref(false)
  const isToggling = ref(false)

  // 持久化主题模式设置
  const [storedMode, setStoredMode] = useLocalStorage<ThemeMode>(storageKey, defaultMode)

  // 当前主题模式
  const mode = computed<ThemeMode>({
    get: () => storedMode.value,
    set: (value) => setStoredMode(value),
  })

  // 计算是否应该使用暗黑模式
  const isDark = computed(() => {
    switch (mode.value) {
      case 'dark':
        return true
      case 'light':
        return false
      case 'auto':
        return systemPrefersDark.value
      default:
        return false
    }
  })

  /**
   * 获取目标元素
   */
  const getTargetElement = (): HTMLElement => {
    if (typeof target === 'string') {
      return document.querySelector(target) || document.documentElement
    }
    return target || document.documentElement
  }

  /**
   * 应用主题类名
   */
  const applyTheme = (dark: boolean) => {
    const element = getTargetElement()
    
    if (enableTransition) {
      // 添加过渡效果
      const transitionStyle = `* { transition: background-color ${transitionDuration}ms ease, color ${transitionDuration}ms ease, border-color ${transitionDuration}ms ease !important; }`
      const styleElement = document.createElement('style')
      styleElement.textContent = transitionStyle
      document.head.appendChild(styleElement)
      
      // 移除过渡样式
      setTimeout(() => {
        document.head.removeChild(styleElement)
      }, transitionDuration)
    }

    if (dark) {
      element.classList.remove(lightClass)
      element.classList.add(darkClass)
    } else {
      element.classList.remove(darkClass)
      element.classList.add(lightClass)
    }
  }

  /**
   * 更新系统主题偏好
   */
  const updateSystemPreference = () => {
    if (!isSupported) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches
  }

  /**
   * 设置主题模式
   */
  const setMode = async (newMode: ThemeMode) => {
    if (isToggling.value) return

    isToggling.value = true
    mode.value = newMode

    // 等待动画完成
    if (enableTransition) {
      await new Promise(resolve => setTimeout(resolve, transitionDuration))
    }

    isToggling.value = false
  }

  /**
   * 切换暗黑模式
   */
  const toggle = async () => {
    const newMode = isDark.value ? 'light' : 'dark'
    await setMode(newMode)
  }

  /**
   * 设置为暗黑模式
   */
  const setDark = async () => {
    await setMode('dark')
  }

  /**
   * 设置为亮色模式
   */
  const setLight = async () => {
    await setMode('light')
  }

  /**
   * 设置为自动模式（跟随系统）
   */
  const setAuto = async () => {
    await setMode('auto')
  }

  /**
   * 获取当前主题信息
   */
  const getThemeInfo = () => {
    return {
      mode: mode.value,
      isDark: isDark.value,
      systemPrefersDark: systemPrefersDark.value,
      isSupported,
    }
  }

  // 监听系统主题变化
  let mediaQuery: MediaQueryList | null = null

  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    systemPrefersDark.value = e.matches
    onSystemChange?.(e.matches)
  }

  // 监听主题变化
  watch(isDark, (newIsDark) => {
    applyTheme(newIsDark)
    onChange?.(newIsDark, mode.value)
  }, { immediate: true })

  onMounted(() => {
    // 初始化系统主题偏好
    updateSystemPreference()

    // 监听系统主题变化
    if (isSupported) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // 现代浏览器使用 addEventListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else {
        // 旧版浏览器使用 addListener
        mediaQuery.addListener(handleSystemThemeChange)
      }
    }

    // 应用初始主题
    applyTheme(isDark.value)
  })

  onUnmounted(() => {
    // 清理系统主题监听器
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      } else {
        mediaQuery.removeListener(handleSystemThemeChange)
      }
    }
  })

  // 计算状态
  const state = computed<DarkModeState>(() => ({
    isDark: isDark.value,
    mode: mode.value,
    systemPrefersDark: systemPrefersDark.value,
    isSupported,
    isToggling: isToggling.value,
  }))

  return {
    state,
    toggle,
    setMode,
    setDark,
    setLight,
    setAuto,
    getThemeInfo,
  }
}

/**
 * 简化的暗黑模式切换函数
 * 
 * @returns 切换函数和当前状态
 * 
 * @example
 * ```typescript
 * const { isDark, toggle } = useSimpleDarkMode()
 * 
 * // 切换主题
 * toggle()
 * 
 * // 检查当前状态
 *  * ```
 */
export function useSimpleDarkMode() {
  const { state, toggle } = useDarkMode()
  
  return {
    isDark: computed(() => state.value.isDark),
    toggle,
  }
}

/**
 * 获取系统主题偏好
 * 
 * @returns 系统是否偏好暗黑模式
 * 
 * @example
 * ```typescript
 * const prefersDark = getSystemThemePreference()
 *  * ```
 */
export function getSystemThemePreference(): boolean {
  if (typeof window === 'undefined' || !('matchMedia' in window)) {
    return false
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 监听系统主题变化
 * 
 * @param callback - 主题变化回调函数
 * @returns 取消监听的函数
 * 
 * @example
 * ```typescript
 * const unwatch = watchSystemTheme((prefersDark) => {
 *    * })
 * 
 * // 取消监听
 * unwatch()
 * ```
 */
export function watchSystemTheme(callback: (prefersDark: boolean) => void): () => void {
  if (typeof window === 'undefined' || !('matchMedia' in window)) {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches)
  }

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  } else {
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }
}
