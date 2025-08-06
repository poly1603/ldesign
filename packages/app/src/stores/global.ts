import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WatermarkOptions } from '@ldesign/watermark'

export interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
  roles?: string[]
}

export interface WatermarkConfig {
  enabled: boolean
  text: string
  showUserInfo: boolean
  showTimestamp: boolean
  fontSize: number
  fontColor: string
  fontFamily: string
  angle: number
  width: number
  height: number
  zIndex: number
  opacity: number
}

export interface GlobalState {
  // 应用状态
  initialized: boolean
  loading: boolean
  
  // 用户信息
  user: User
  
  // 主题配置
  theme: {
    mode: 'light' | 'dark' | 'auto'
    primaryColor: string
    borderRadius: number
  }
  
  // 语言配置
  locale: {
    current: string
    available: string[]
  }
  
  // 水印配置
  watermark: WatermarkConfig
  
  // 设备信息
  device: {
    type: 'desktop' | 'tablet' | 'mobile'
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
}

export const useGlobalState = defineStore('global', () => {
  // ============ 状态定义 ============
  const initialized = ref(false)
  const loading = ref(false)
  
  // 用户信息
  const user = ref<User>({})
  
  // 主题配置
  const theme = ref({
    mode: 'light' as const,
    primaryColor: '#007bff',
    borderRadius: 6
  })
  
  // 语言配置
  const locale = ref({
    current: 'zh-CN',
    available: ['zh-CN', 'en-US']
  })
  
  // 水印配置
  const watermark = ref<WatermarkConfig>({
    enabled: true,
    text: 'LDesign',
    showUserInfo: true,
    showTimestamp: true,
    fontSize: 16,
    fontColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    angle: -20,
    width: 200,
    height: 150,
    zIndex: 1000,
    opacity: 0.1
  })
  
  // 设备信息
  const device = ref({
    type: 'desktop' as const,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })
  
  // ============ 计算属性 ============
  const isLoggedIn = computed(() => !!user.value.id)
  const isDarkMode = computed(() => theme.value.mode === 'dark')
  const currentLanguage = computed(() => locale.value.current)
  
  // ============ 方法定义 ============
  
  // 初始化应用
  const initialize = async () => {
    if (initialized.value) return
    
    loading.value = true
    
    try {
      // 从本地存储恢复状态
      await restoreFromStorage()
      
      // 检测设备类型
      await detectDevice()
      
      // 初始化主题
      await initializeTheme()
      
      initialized.value = true
    } catch (error) {
      console.error('Failed to initialize global state:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 从本地存储恢复状态
  const restoreFromStorage = async () => {
    try {
      const savedState = localStorage.getItem('ldesign-global-state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        
        // 恢复用户信息
        if (parsed.user) {
          user.value = { ...user.value, ...parsed.user }
        }
        
        // 恢复主题配置
        if (parsed.theme) {
          theme.value = { ...theme.value, ...parsed.theme }
        }
        
        // 恢复语言配置
        if (parsed.locale) {
          locale.value = { ...locale.value, ...parsed.locale }
        }
        
        // 恢复水印配置
        if (parsed.watermark) {
          watermark.value = { ...watermark.value, ...parsed.watermark }
        }
      }
    } catch (error) {
      console.warn('Failed to restore state from storage:', error)
    }
  }
  
  // 保存状态到本地存储
  const saveToStorage = () => {
    try {
      const stateToSave = {
        user: user.value,
        theme: theme.value,
        locale: locale.value,
        watermark: watermark.value
      }
      localStorage.setItem('ldesign-global-state', JSON.stringify(stateToSave))
    } catch (error) {
      console.warn('Failed to save state to storage:', error)
    }
  }
  
  // 检测设备类型
  const detectDevice = async () => {
    const width = window.innerWidth
    
    if (width < 768) {
      device.value = {
        type: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      }
    } else if (width < 1024) {
      device.value = {
        type: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false
      }
    } else {
      device.value = {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true
      }
    }
  }
  
  // 初始化主题
  const initializeTheme = async () => {
    // 如果是自动模式，检测系统主题
    if (theme.value.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value.mode = prefersDark ? 'dark' : 'light'
    }
    
    // 应用主题到文档
    document.documentElement.setAttribute('data-theme', theme.value.mode)
  }
  
  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = { ...user.value, ...userData }
    saveToStorage()
  }
  
  // 清除用户信息
  const clearUser = () => {
    user.value = {}
    saveToStorage()
  }
  
  // 设置主题模式
  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    theme.value.mode = mode
    initializeTheme()
    saveToStorage()
  }
  
  // 设置语言
  const setLocale = (lang: string) => {
    locale.value.current = lang
    saveToStorage()
  }
  
  // 设置水印启用状态
  const setWatermarkEnabled = (enabled: boolean) => {
    watermark.value.enabled = enabled
    saveToStorage()
  }
  
  // 设置水印文本
  const setWatermarkText = (text: string) => {
    watermark.value.text = text
    saveToStorage()
  }
  
  // 更新水印配置
  const updateWatermarkOptions = (options: Partial<WatermarkOptions>) => {
    watermark.value = { ...watermark.value, ...options }
    saveToStorage()
  }
  
  // 设置加载状态
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  
  return {
    // 状态
    initialized,
    loading,
    user,
    theme,
    locale,
    watermark,
    device,
    
    // 计算属性
    isLoggedIn,
    isDarkMode,
    currentLanguage,
    
    // 方法
    initialize,
    setUser,
    clearUser,
    setThemeMode,
    setLocale,
    setWatermarkEnabled,
    setWatermarkText,
    updateWatermarkOptions,
    setLoading,
    saveToStorage
  }
})
