import { computed, onUnmounted, ref, type Ref, type Component } from 'vue'
import { useEngine } from './useEngine'

/**
 * 通知管理组合式函数
 *
 * @returns 通知管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNotifications } from '@ldesign/engine'
 *
 * const { show, success, error, warning, info, notifications } = useNotifications()
 *
 * function handleSuccess() {
 *   success('操作成功！')
 * }
 *
 * function handleError() {
 *   error('操作失败！', { duration: 5000 })
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="handleSuccess">成功通知</button>
 *     <button @click="handleError">错误通知</button>
 *     <div>活跃通知数: {{ notifications.length }}</div>
 *   </div>
 * </template>
 * ```
 */
export function useNotifications() {
  const engine = useEngine()
  const notificationManager = engine.notifications

  const notifications = ref(notificationManager.getAll())

  // 监听通知变化
  const updateNotifications = () => {
    notifications.value = notificationManager.getAll()
  }

  // 监听通知事件（如果支持）
  let unsubscribeAdd: (() => void) | undefined
  let unsubscribeRemove: (() => void) | undefined

  if (engine.events && typeof engine.events.on === 'function') {
    const addResult = engine.events.on('notification:added', updateNotifications)
    const removeResult = engine.events.on('notification:removed', updateNotifications)
    unsubscribeAdd = typeof addResult === 'function' ? addResult : undefined
    unsubscribeRemove = typeof removeResult === 'function' ? removeResult : undefined
  }

  onUnmounted(() => {
    unsubscribeAdd?.()
    unsubscribeRemove?.()
  })

  const show = (message: string, _options?: {
    type?: 'info' | 'success' | 'warning' | 'error'
    duration?: number
    closable?: boolean
    actions?: Array<{ text: string; action: () => void }>
  }) => {
    try {
      return notificationManager.show(message as any)
    } catch {
      console.log(message)
      return 'fallback-id'
    }
  }

  const success = (message: string, options?: { duration?: number; closable?: boolean }) => {
    return show(message, { ...options, type: 'success' })
  }

  const error = (message: string, options?: { duration?: number; closable?: boolean }) => {
    return show(message, { ...options, type: 'error' })
  }

  const warning = (message: string, options?: { duration?: number; closable?: boolean }) => {
    return show(message, { ...options, type: 'warning' })
  }

  const info = (message: string, options?: { duration?: number; closable?: boolean }) => {
    return show(message, { ...options, type: 'info' })
  }

  const remove = (id: string) => {
    if (typeof (notificationManager as any).remove === 'function') {
      ;(notificationManager as any).remove(id)
    }
  }

  const clear = () => {
    notificationManager.clear()
  }

  return {
    notifications: computed(() => notifications.value),
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}

/**
 * 对话框管理组合式函数
 *
 * @returns 对话框管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDialog } from '@ldesign/engine'
 *
 * const { show, confirm, alert, dialogs } = useDialog()
 *
 * async function handleDelete() {
 *   const confirmed = await confirm('确定要删除吗？', {
 *     title: '确认删除',
 *     confirmText: '删除',
 *     cancelText: '取消'
 *   })
 *
 *   if (confirmed) {
 *     // 执行删除操作
 *   }
 * }
 * </script>
 * ```
 */
export function useDialog() {
  const engine = useEngine()
  // Use a fallback for dialogs if not available
  const dialogManager = (engine as any).dialogs || {
    getAll: () => [],
    show: () => Promise.resolve(),
    confirm: () => Promise.resolve(false),
    alert: () => Promise.resolve(),
    close: () => {},
    closeAll: () => {}
  }

  const dialogs = ref(dialogManager.getAll())

  // 监听对话框变化
  const updateDialogs = () => {
    dialogs.value = dialogManager.getAll()
  }

  let unsubscribeAdd: (() => void) | undefined
  let unsubscribeRemove: (() => void) | undefined

  if (engine.events && typeof engine.events.on === 'function') {
    const addResult = engine.events.on('dialog:opened', updateDialogs)
    const removeResult = engine.events.on('dialog:closed', updateDialogs)
    unsubscribeAdd = typeof addResult === 'function' ? addResult : undefined
    unsubscribeRemove = typeof removeResult === 'function' ? removeResult : undefined
  }

  onUnmounted(() => {
    unsubscribeAdd?.()
    unsubscribeRemove?.()
  })

  const show = (component: Component, props?: Record<string, unknown>, options?: {
    title?: string
    width?: string | number
    height?: string | number
    closable?: boolean
    maskClosable?: boolean
  }) => {
    return dialogManager.show(component, props, options)
  }

  const confirm = (message: string, options?: {
    title?: string
    confirmText?: string
    cancelText?: string
    type?: 'info' | 'success' | 'warning' | 'error'
  }): Promise<boolean> => {
    return dialogManager.confirm(message, options)
  }

  const alert = (message: string, options?: {
    title?: string
    confirmText?: string
    type?: 'info' | 'success' | 'warning' | 'error'
  }): Promise<void> => {
    return dialogManager.alert(message, options)
  }

  const close = (id: string) => {
    dialogManager.close(id)
  }

  const closeAll = () => {
    dialogManager.closeAll()
  }

  return {
    dialogs: computed(() => dialogs.value),
    show,
    confirm,
    alert,
    close,
    closeAll
  }
}

/**
 * 主题管理组合式函数
 *
 * @returns 主题管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@ldesign/engine'
 *
 * const { currentTheme, themes, setTheme, toggleDarkMode, isDark } = useTheme()
 * </script>
 *
 * <template>
 *   <div>
 *     <p>当前主题: {{ currentTheme }}</p>
 *     <button @click="toggleDarkMode">
 *       {{ isDark ? '切换到亮色' : '切换到暗色' }}
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useTheme() {
  const engine = useEngine()
  const themeManager = engine.theme || {
    getCurrentTheme: () => 'default',
    getAvailableThemes: () => ['light', 'dark'],
    setTheme: () => {}
  }

  const getCurrentThemeValue = () => {
    try {
      return (themeManager as any).getCurrentTheme?.() || 'default'
    } catch {
      return 'default'
    }
  }

  const getAvailableThemesValue = () => {
    try {
      return (themeManager as any).getAvailableThemes?.() || ['light', 'dark']
    } catch {
      return ['light', 'dark']
    }
  }

  const currentTheme = ref(getCurrentThemeValue())
  const themes = ref(getAvailableThemesValue())

  // 监听主题变化
  const updateTheme = () => {
    currentTheme.value = getCurrentThemeValue()
    themes.value = getAvailableThemesValue()
  }

  let unsubscribe: (() => void) | undefined
  if (engine.events && typeof engine.events.on === 'function') {
    const result = engine.events.on('theme:changed', updateTheme)
    unsubscribe = typeof result === 'function' ? result : undefined
  }

  onUnmounted(() => {
    unsubscribe?.()
  })

  const setTheme = (themeName: string) => {
    themeManager?.setTheme(themeName)
    updateTheme()
  }

  const toggleDarkMode = () => {
    const isDarkMode = currentTheme.value.includes('dark')
    const newTheme = isDarkMode ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const isDark = computed(() => currentTheme.value.includes('dark'))

  return {
    currentTheme: computed(() => currentTheme.value),
    themes: computed(() => themes.value),
    setTheme,
    toggleDarkMode,
    isDark
  }
}

/**
 * 剪贴板操作组合式函数
 *
 * @returns 剪贴板操作工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useClipboard } from '@ldesign/engine'
 *
 * const { copy, paste, isSupported, copied } = useClipboard()
 *
 * function handleCopy() {
 *   copy('Hello, World!')
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="handleCopy" :disabled="!isSupported">
 *       {{ copied ? '已复制' : '复制文本' }}
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useClipboard() {
  const copied = ref(false)
  const isSupported = computed(() => {
    return typeof navigator !== 'undefined' && 'clipboard' in navigator
  })

  let copyTimeout: number

  const copy = async (text: string): Promise<boolean> => {
    if (!isSupported.value) {
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      // 清除之前的超时
      if (copyTimeout) {
        clearTimeout(copyTimeout)
      }

      // 2秒后重置状态
      copyTimeout = setTimeout(() => {
        copied.value = false
      }, 2000) as any

      return true
    } catch (error) {
      console.error('Failed to copy text:', error)
      return false
    }
  }

  const paste = async (): Promise<string | null> => {
    if (!isSupported.value) {
      return null
    }

    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('Failed to paste text:', error)
      return null
    }
  }

  onUnmounted(() => {
    if (copyTimeout) {
      clearTimeout(copyTimeout)
    }
  })

  return {
    copy,
    paste,
    copied: computed(() => copied.value),
    isSupported
  }
}

/**
 * 本地存储组合式函数
 *
 * @param key 存储键名
 * @param defaultValue 默认值
 * @param storage 存储类型
 * @returns 响应式存储值
 *
 * @example
 * ```vue
 * <script setup>
 * import { useLocalStorage } from '@ldesign/engine'
 *
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 * const [settings, setSettings] = useLocalStorage('settings', { lang: 'zh' })
 * </script>
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): [Ref<T>, (value: T) => void, () => void] {
  const storedValue = ref<T>(defaultValue)

  // 读取存储值
  const read = (): T => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const item = window[storage].getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading ${storage} key "${key}":`, error)
      return defaultValue
    }
  }

  // 写入存储值
  const write = (value: T) => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window[storage].setItem(key, JSON.stringify(value))
      storedValue.value = value
    } catch (error) {
      console.error(`Error setting ${storage} key "${key}":`, error)
    }
  }

  // 删除存储值
  const remove = () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window[storage].removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      console.error(`Error removing ${storage} key "${key}":`, error)
    }
  }

  // 初始化
  storedValue.value = read()

  // 监听存储变化
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key && e.storageArea === window[storage]) {
      try {
        storedValue.value = e.newValue ? JSON.parse(e.newValue) : defaultValue
      } catch (error) {
        console.error(`Error parsing ${storage} value for key "${key}":`, error)
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange)
  }

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange)
    }
  })

  return [storedValue as Ref<T>, write, remove]
}
