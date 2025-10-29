import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_STORAGE_KEY = 'ldesign-theme'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取主题设置，默认跟随系统
  const getInitialTheme = () => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      return stored === 'dark'
    }
    // 默认跟随系统
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialTheme())

  // 监听主题变化并持久化
  watch(isDark, (value) => {
    localStorage.setItem(THEME_STORAGE_KEY, value ? 'dark' : 'light')
    // 更新 document 的 class 以便全局 CSS 使用
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean) {
    isDark.value = value
  }

  function setLight() {
    isDark.value = false
  }

  return {
    isDark,
    toggle,
    setDark,
    setLight,
  }
})


