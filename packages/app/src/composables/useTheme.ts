import { computed } from 'vue'
import { useGlobalState } from '../stores/global'
import { useEngine } from './useEngine'

/**
 * 主题管理组合式函数
 */
export function useTheme() {
  const globalStore = useGlobalState()
  const engine = useEngine()
  
  // 当前主题模式
  const themeMode = computed(() => globalStore.theme.mode)
  
  // 是否为深色模式
  const isDarkMode = computed(() => globalStore.isDarkMode)
  
  // 主色调
  const primaryColor = computed(() => globalStore.theme.primaryColor)
  
  // 圆角大小
  const borderRadius = computed(() => globalStore.theme.borderRadius)
  
  // 设置主题模式
  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    globalStore.setThemeMode(mode)
    
    // 发送主题变化事件
    engine.events.emit('theme:change', {
      mode,
      primaryColor: primaryColor.value,
      borderRadius: borderRadius.value
    })
  }
  
  // 设置主色调
  const setPrimaryColor = (color: string) => {
    globalStore.theme.primaryColor = color
    globalStore.saveToStorage()
    
    // 发送主题变化事件
    engine.events.emit('theme:change', {
      mode: themeMode.value,
      primaryColor: color,
      borderRadius: borderRadius.value
    })
  }
  
  // 设置圆角大小
  const setBorderRadius = (radius: number) => {
    globalStore.theme.borderRadius = radius
    globalStore.saveToStorage()
    
    // 发送主题变化事件
    engine.events.emit('theme:change', {
      mode: themeMode.value,
      primaryColor: primaryColor.value,
      borderRadius: radius
    })
  }
  
  // 切换主题模式
  const toggleTheme = () => {
    const newMode = isDarkMode.value ? 'light' : 'dark'
    setThemeMode(newMode)
  }
  
  // 应用主题到DOM
  const applyTheme = () => {
    const root = document.documentElement
    
    // 设置主题模式
    root.setAttribute('data-theme', themeMode.value)
    
    // 设置CSS变量
    root.style.setProperty('--primary-color', primaryColor.value)
    root.style.setProperty('--border-radius', `${borderRadius.value}px`)
  }
  
  // 获取预设主题
  const getPresetThemes = () => [
    {
      name: 'default',
      label: '默认蓝色',
      primaryColor: '#007bff',
      borderRadius: 6
    },
    {
      name: 'green',
      label: '清新绿色',
      primaryColor: '#28a745',
      borderRadius: 6
    },
    {
      name: 'purple',
      label: '优雅紫色',
      primaryColor: '#6f42c1',
      borderRadius: 6
    },
    {
      name: 'orange',
      label: '活力橙色',
      primaryColor: '#fd7e14',
      borderRadius: 6
    },
    {
      name: 'pink',
      label: '温馨粉色',
      primaryColor: '#e83e8c',
      borderRadius: 6
    }
  ]
  
  // 应用预设主题
  const applyPresetTheme = (themeName: string) => {
    const themes = getPresetThemes()
    const theme = themes.find(t => t.name === themeName)
    
    if (theme) {
      setPrimaryColor(theme.primaryColor)
      setBorderRadius(theme.borderRadius)
    }
  }
  
  return {
    // 状态
    themeMode,
    isDarkMode,
    primaryColor,
    borderRadius,
    
    // 方法
    setThemeMode,
    setPrimaryColor,
    setBorderRadius,
    toggleTheme,
    applyTheme,
    getPresetThemes,
    applyPresetTheme
  }
}
