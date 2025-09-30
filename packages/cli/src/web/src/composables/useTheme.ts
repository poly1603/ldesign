/**
 * 主题切换组合式函数
 * 提供主题色切换功能
 */

import { ref, watch, onMounted } from 'vue'

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark'

/**
 * 主题色配置
 */
export interface ThemeColor {
  name: string
  value: string
  label: string
}

/**
 * 预设主题色列表
 */
export const THEME_COLORS: ThemeColor[] = [
  { name: 'purple', value: '#722ED1', label: '紫色' },
  { name: 'blue', value: '#1890FF', label: '蓝色' },
  { name: 'green', value: '#52C41A', label: '绿色' },
  { name: 'red', value: '#F5222D', label: '红色' },
  { name: 'orange', value: '#FA8C16', label: '橙色' },
  { name: 'cyan', value: '#13C2C2', label: '青色' },
  { name: 'pink', value: '#EB2F96', label: '粉色' },
  { name: 'gold', value: '#FAAD14', label: '金色' }
]

/**
 * 本地存储键名
 */
const THEME_TYPE_KEY = 'ldesign-theme-type'
const THEME_COLOR_KEY = 'ldesign-theme-color'

/**
 * 生成主题色阶
 * 根据主色生成10个色阶
 */
function generateColorPalette(baseColor: string): string[] {
  // 这里简化处理，实际应该使用色彩算法生成
  // 可以使用 tinycolor2 或其他颜色库
  const colors: string[] = []
  
  // 将 hex 转换为 RGB
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // 生成10个色阶
  for (let i = 1; i <= 10; i++) {
    let factor: number
    if (i <= 5) {
      // 浅色阶：向白色过渡
      factor = (6 - i) * 0.15
      const nr = Math.round(r + (255 - r) * factor)
      const ng = Math.round(g + (255 - g) * factor)
      const nb = Math.round(b + (255 - b) * factor)
      colors.push(`rgb(${nr}, ${ng}, ${nb})`)
    } else if (i === 6) {
      // 基础色
      colors.push(baseColor)
    } else {
      // 深色阶：向黑色过渡
      factor = (i - 6) * 0.15
      const nr = Math.round(r * (1 - factor))
      const ng = Math.round(g * (1 - factor))
      const nb = Math.round(b * (1 - factor))
      colors.push(`rgb(${nr}, ${ng}, ${nb})`)
    }
  }
  
  return colors
}

/**
 * 应用主题色
 */
function applyThemeColor(color: string) {
  const palette = generateColorPalette(color)
  const root = document.documentElement
  
  // 设置品牌色色阶
  palette.forEach((c, index) => {
    root.style.setProperty(`--ldesign-brand-color-${index + 1}`, c)
  })
  
  // 设置主品牌色
  root.style.setProperty('--ldesign-brand-color', palette[6])
  root.style.setProperty('--ldesign-brand-color-hover', palette[5])
  root.style.setProperty('--ldesign-brand-color-focus', palette[1])
  root.style.setProperty('--ldesign-brand-color-active', palette[7])
  root.style.setProperty('--ldesign-brand-color-disabled', palette[2])
}

/**
 * 应用主题类型（亮色/暗色）
 */
function applyThemeType(type: ThemeType) {
  const root = document.documentElement
  
  if (type === 'dark') {
    // 暗色主题
    root.style.setProperty('--ldesign-bg-color-page', '#0a0a0a')
    root.style.setProperty('--ldesign-bg-color-container', '#141414')
    root.style.setProperty('--ldesign-bg-color-component', '#1f1f1f')
    root.style.setProperty('--ldesign-bg-color-component-hover', '#2a2a2a')
    root.style.setProperty('--ldesign-bg-color-component-active', '#333333')
    
    root.style.setProperty('--ldesign-text-color-primary', 'rgba(255, 255, 255, 0.9)')
    root.style.setProperty('--ldesign-text-color-secondary', 'rgba(255, 255, 255, 0.7)')
    root.style.setProperty('--ldesign-text-color-placeholder', 'rgba(255, 255, 255, 0.5)')
    root.style.setProperty('--ldesign-text-color-disabled', 'rgba(255, 255, 255, 0.3)')
    
    root.style.setProperty('--ldesign-border-color', '#2a2a2a')
    root.style.setProperty('--ldesign-border-color-hover', '#3a3a3a')
    
    root.setAttribute('data-theme', 'dark')
  } else {
    // 亮色主题
    root.style.setProperty('--ldesign-bg-color-page', '#ffffff')
    root.style.setProperty('--ldesign-bg-color-container', '#ffffff')
    root.style.setProperty('--ldesign-bg-color-component', '#fafafa')
    root.style.setProperty('--ldesign-bg-color-component-hover', '#f5f5f5')
    root.style.setProperty('--ldesign-bg-color-component-active', '#f0f0f0')
    
    root.style.setProperty('--ldesign-text-color-primary', 'rgba(0, 0, 0, 0.9)')
    root.style.setProperty('--ldesign-text-color-secondary', 'rgba(0, 0, 0, 0.7)')
    root.style.setProperty('--ldesign-text-color-placeholder', 'rgba(0, 0, 0, 0.5)')
    root.style.setProperty('--ldesign-text-color-disabled', 'rgba(0, 0, 0, 0.3)')
    
    root.style.setProperty('--ldesign-border-color', '#e5e5e5')
    root.style.setProperty('--ldesign-border-color-hover', '#d9d9d9')
    
    root.setAttribute('data-theme', 'light')
  }
}

/**
 * 主题切换 Hook
 */
export function useTheme() {
  // 当前主题类型
  const themeType = ref<ThemeType>('light')
  
  // 当前主题色
  const themeColor = ref<string>(THEME_COLORS[0].value)
  
  // 当前主题色名称
  const themeColorName = ref<string>(THEME_COLORS[0].name)
  
  /**
   * 切换主题类型
   */
  const toggleThemeType = () => {
    themeType.value = themeType.value === 'light' ? 'dark' : 'light'
  }
  
  /**
   * 设置主题类型
   */
  const setThemeType = (type: ThemeType) => {
    themeType.value = type
  }
  
  /**
   * 设置主题色
   */
  const setThemeColor = (color: string, name?: string) => {
    themeColor.value = color
    if (name) {
      themeColorName.value = name
    }
  }
  
  /**
   * 从本地存储恢复主题设置
   */
  const restoreTheme = () => {
    try {
      const savedType = localStorage.getItem(THEME_TYPE_KEY) as ThemeType
      const savedColor = localStorage.getItem(THEME_COLOR_KEY)
      
      if (savedType && (savedType === 'light' || savedType === 'dark')) {
        themeType.value = savedType
      }
      
      if (savedColor) {
        const colorConfig = THEME_COLORS.find(c => c.value === savedColor)
        if (colorConfig) {
          themeColor.value = colorConfig.value
          themeColorName.value = colorConfig.name
        }
      }
    } catch (error) {
      console.error('恢复主题设置失败:', error)
    }
  }
  
  // 监听主题类型变化
  watch(themeType, (newType) => {
    applyThemeType(newType)
    localStorage.setItem(THEME_TYPE_KEY, newType)
  })
  
  // 监听主题色变化
  watch(themeColor, (newColor) => {
    applyThemeColor(newColor)
    localStorage.setItem(THEME_COLOR_KEY, newColor)
  })
  
  // 组件挂载时恢复主题
  onMounted(() => {
    restoreTheme()
    applyThemeType(themeType.value)
    applyThemeColor(themeColor.value)
  })
  
  return {
    themeType,
    themeColor,
    themeColorName,
    themeColors: THEME_COLORS,
    toggleThemeType,
    setThemeType,
    setThemeColor
  }
}

