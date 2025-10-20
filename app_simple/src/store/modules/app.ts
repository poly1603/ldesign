/**
 * 应用 Store
 * 应用全局状态管理
 */

import { defineStore } from '@ldesign/store'
import { ref, computed } from 'vue'

type Theme = 'light' | 'dark' | 'auto'
type Language = 'zh-CN' | 'en-US'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<Theme>('light')
  const language = ref<Language>('zh-CN')
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const isZhCN = computed(() => language.value === 'zh-CN')
  
  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    
    // 应用主题到 DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  function setLanguage(newLang: Language) {
    language.value = newLang
  }
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function setLoading(status: boolean) {
    loading.value = status
  }
  
  function setError(msg: string | null) {
    error.value = msg
  }
  
  function clearError() {
    error.value = null
  }
  
  // 初始化主题
  function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }
  
  return {
    // State
    theme,
    language,
    sidebarCollapsed,
    loading,
    error,
    
    // Getters
    isDark,
    isZhCN,
    
    // Actions
    setTheme,
    setLanguage,
    toggleSidebar,
    setLoading,
    setError,
    clearError,
    initTheme
  }
}, {
  // 持久化配置
  persist: {
    enabled: true,
    paths: ['theme', 'language', 'sidebarCollapsed']
  }
})