/**
 * LDesign 样式库 TypeScript 入口文件
 */

// 导出样式库的版本信息
export const version = '1.0.0'

// 样式库配置接口
export interface StyleLibraryConfig {
  theme?: 'light' | 'dark'
  primaryColor?: string
  fontSize?: 'small' | 'medium' | 'large'
}

// 初始化样式库
export function initStyleLibrary(config: StyleLibraryConfig = {}) {
  const { theme = 'light', primaryColor, fontSize = 'medium' } = config

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)

    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-color', primaryColor)
    }

    document.documentElement.setAttribute('data-font-size', fontSize)
  }

  return { theme, primaryColor, fontSize }
}

// 切换主题
export function toggleTheme() {
  if (typeof document === 'undefined') return 'light'

  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', newTheme)
  return newTheme
}

// 设置主色调
export function setPrimaryColor(color: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary-color', color)
  }
}

// 获取当前主题
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
}

// 样式库工具类
export class StyleLibrary {
  private config: StyleLibraryConfig

  constructor(config: StyleLibraryConfig = {}) {
    this.config = config
    this.init()
  }

  private init() {
    initStyleLibrary(this.config)
  }

  public updateConfig(newConfig: Partial<StyleLibraryConfig>) {
    this.config = { ...this.config, ...newConfig }
    initStyleLibrary(this.config)
  }

  public getConfig(): StyleLibraryConfig {
    return { ...this.config }
  }

  public toggleTheme() {
    return toggleTheme()
  }

  public setPrimaryColor(color: string) {
    setPrimaryColor(color)
    this.config.primaryColor = color
  }

  public getCurrentTheme() {
    return getCurrentTheme()
  }
}

// 默认导出
export default StyleLibrary
