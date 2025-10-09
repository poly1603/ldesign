/**
 * CSS变量管理工具
 * 用于将生成的颜色注入到CSS自定义属性中
 */

import type { ColorConfig, ColorMode, ColorScale, NeutralColors } from '../core/types'
import { CSSInjectorImpl } from './css-injector'

/**
 * CSS变量配置接口
 */
export interface CSSVariableConfig {
  /** CSS 变量前缀，默认为 'ldesign' */
  prefix?: string
  /** 是否包含变量描述注释 */
  includeComments?: boolean
  /** 是否包含主题信息注释 */
  includeThemeInfo?: boolean
  /** 背景色生成策略 */
  backgroundStrategy?: 'neutral' | 'primary-based' | 'custom'
  /** 是否根据主色调生成背景色 */
  generateBackgroundFromPrimary?: boolean
  /** 自定义背景色配置 */
  customBackgroundColors?: {
    light?: string[]
    dark?: string[]
  }
}

/**
 * 颜色变量描述信息
 */
export interface ColorVariableInfo {
  /** 变量名 */
  name: string
  /** 变量值 */
  value: string
  /** 变量描述 */
  description?: string
  /** 变量分类 */
  category?: string
  /** 使用场景 */
  usage?: string
}

/**
 * CSS变量注入器
 */
export class CSSVariableInjector {
  private styleElement: HTMLStyleElement | null = null
  private currentVariables: Record<string, string> = {}
  private config: CSSVariableConfig = {
    prefix: 'ldesign',
    includeComments: true,
    includeThemeInfo: true,
    backgroundStrategy: 'neutral',
    generateBackgroundFromPrimary: false,
  }

  constructor(config?: Partial<CSSVariableConfig>) {
    this.config = { ...this.config, ...config }
    this.createStyleElement()
  }

  /**
   * 创建样式元素
   */
  private createStyleElement(): void {
    if (typeof document === 'undefined')
      return

    const elementId = `${this.config.prefix}-color-variables`

    // 先检查是否已存在
    const existingElement = document.getElementById(elementId) as HTMLStyleElement
    if (existingElement) {
      this.styleElement = existingElement
      return
    }

    this.styleElement = document.createElement('style')
    this.styleElement.id = elementId
    this.styleElement.type = 'text/css'
    document.head.appendChild(this.styleElement)
  }

  /**
   * 确保样式元素存在于文档中
   * 当外部代码清空了 head/body 时（如测试环境的 beforeEach），需要重新创建
   */
  private ensureStyleElement(): void {
    if (typeof document === 'undefined')
      return

    const elementId = `${this.config.prefix}-color-variables`
    let el = document.getElementById(elementId) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = elementId
      el.type = 'text/css'
      document.head.appendChild(el)
    }
    this.styleElement = el
  }

  /**
   * 注入CSS变量
   */
  injectVariables(variables: Record<string, string>): void {
    console.log('🔧 [CSSVariableInjector] injectVariables 被调用', {
      variableCount: Object.keys(variables).length,
      prefix: this.config.prefix,
    })
    // 确保样式元素存在（处理被外部清空 DOM 的场景）
    this.ensureStyleElement()
    if (!this.styleElement) {
      console.log('🔧 [CSSVariableInjector] styleElement 不存在')
      return
    }

    console.log('🔧 [CSSVariableInjector] styleElement 存在', {
      id: this.styleElement.id,
      inDocument: document.contains(this.styleElement),
    })

    this.currentVariables = { ...variables }

    const cssText = this.generateCSSText(variables)
    console.log('🔧 [CSSVariableInjector] 生成的CSS长度', cssText.length)
    this.styleElement.textContent = cssText
    console.log('🔧 [CSSVariableInjector] textContent 已设置', {
      id: this.styleElement.id,
      length: this.styleElement.textContent?.length,
    })
  }

  /**
   * 更新单个CSS变量
   */
  updateVariable(name: string, value: string): void {
    this.currentVariables[name] = value
    this.injectVariables(this.currentVariables)
  }

  /**
   * 批量更新CSS变量
   */
  updateVariables(variables: Record<string, string>): void {
    Object.assign(this.currentVariables, variables)
    this.injectVariables(this.currentVariables)
  }

  /**
   * 移除CSS变量
   */
  removeVariable(name: string): void {
    delete this.currentVariables[name]
    this.injectVariables(this.currentVariables)
  }

  /**
   * 清除所有CSS变量
   */
  clearVariables(): void {
    this.currentVariables = {}
    if (this.styleElement) {
      this.styleElement.textContent = ''
    }
  }

  /**
   * 获取当前CSS变量
   */
  getCurrentVariables(): Record<string, string> {
    return { ...this.currentVariables }
  }

  /**
   * 生成CSS文本
   */
  private generateCSSText(
    variables: Record<string, string>,
    variableInfos?: ColorVariableInfo[],
  ): string {
    let cssContent = ''

    if (this.config.includeComments) {
      cssContent += `/*\n * ${this.config.prefix?.toUpperCase()} Design System - CSS Variables\n * Generated automatically - Do not edit manually\n */\n\n`
    }

    const cssRules: string[] = []

    if (variableInfos && this.config.includeComments) {
      // 按分类组织变量
      const categorizedVars = new Map<string, ColorVariableInfo[]>()

      for (const info of variableInfos) {
        const category = info.category || 'General'
        if (!categorizedVars.has(category)) {
          categorizedVars.set(category, [])
        }
        categorizedVars.get(category)!.push(info)
      }

      // 生成分类注释和变量
      for (const [category, infos] of categorizedVars) {
        cssRules.push(`  /* ${category} Colors */`)
        for (const info of infos) {
          if (info.description) {
            cssRules.push(`  /* ${info.description} */`)
          }
          if (info.usage) {
            cssRules.push(`  /* Usage: ${info.usage} */`)
          }
          cssRules.push(`  ${info.name}: ${info.value};`)
          cssRules.push('')
        }
      }
    }
    else {
      // 简单模式，直接生成变量
      cssRules.push(...Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`))
    }

    cssContent += `:root {\n${cssRules.join('\n')}\n}`
    return cssContent
  }

  /**
   * 注入主题CSS变量（支持亮色和暗色模式）
   */
  injectThemeVariables(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: {
      name: string
      displayName?: string
      description?: string
      primaryColor: string
      version?: string
    },
    lightVariableInfos?: ColorVariableInfo[],
    darkVariableInfos?: ColorVariableInfo[],
  ): void {
    // 确保样式元素存在（处理被外部清空 DOM 的场景）
    this.ensureStyleElement()
    if (!this.styleElement)
      return

    let cssContent = ''

    // 生成主题信息注释
    if (this.config.includeThemeInfo && themeInfo) {
      cssContent += `/*\n`
      cssContent += ` * ${this.config.prefix?.toUpperCase()} Design System\n`
      cssContent += ` * Theme: ${themeInfo.displayName || themeInfo.name}\n`
      if (themeInfo.description) {
        cssContent += ` * Description: ${themeInfo.description}\n`
      }
      cssContent += ` * Primary Color: ${themeInfo.primaryColor}\n`
      if (themeInfo.version) {
        cssContent += ` * Version: ${themeInfo.version}\n`
      }
      cssContent += ` * Generated: ${new Date().toISOString()}\n`
      cssContent += ` */\n\n`
    }

    // 生成亮色模式CSS变量
    cssContent += this.generateModeVariables('light', lightVariables, lightVariableInfos)
    cssContent += '\n\n'

    // 生成暗色模式CSS变量
    cssContent += this.generateModeVariables('dark', darkVariables, darkVariableInfos)

    this.styleElement.textContent = cssContent

    // 更新当前变量记录（合并亮色和暗色）
    this.currentVariables = { ...lightVariables, ...darkVariables }
  }

  /**
   * 生成特定模式的CSS变量
   */
  private generateModeVariables(
    mode: 'light' | 'dark',
    variables: Record<string, string>,
    variableInfos?: ColorVariableInfo[],
  ): string {
    const selector = mode === 'light' ? ':root' : '[data-theme-mode="dark"]'
    let content = ''

    if (this.config.includeComments) {
      content += `/* ${mode === 'light' ? 'Light' : 'Dark'} Mode Variables */\n`
    }

    const cssRules: string[] = []

    if (variableInfos && this.config.includeComments) {
      // 按分类组织变量
      const categorizedVars = new Map<string, ColorVariableInfo[]>()

      for (const info of variableInfos) {
        const category = info.category || 'General'
        if (!categorizedVars.has(category)) {
          categorizedVars.set(category, [])
        }
        categorizedVars.get(category)!.push(info)
      }

      // 生成分类注释和变量
      for (const [category, infos] of categorizedVars) {
        cssRules.push(`  /* ${category} */`)
        for (const info of infos) {
          if (info.description) {
            cssRules.push(`  /* ${info.description} */`)
          }
          cssRules.push(`  ${info.name}: ${info.value};`)
        }
        cssRules.push('')
      }
    }
    else {
      // 简单模式，直接生成变量
      cssRules.push(...Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`))
    }

    content += `${selector} {\n${cssRules.join('\n')}\n}`
    return content
  }

  /**
   * 生成背景色变量
   */
  generateBackgroundColors(
    primaryColor: string,
    mode: 'light' | 'dark' = 'light',
  ): Record<string, string> {
    const backgrounds: Record<string, string> = {}
    const prefix = `--${this.config.prefix}`

    switch (this.config.backgroundStrategy) {
      case 'primary-based':
        if (this.config.generateBackgroundFromPrimary) {
          // 基于主色调生成背景色
          backgrounds[`${prefix}-bg-primary`] = this.adjustColorOpacity(
            primaryColor,
            mode === 'light' ? 0.05 : 0.1,
          )
          backgrounds[`${prefix}-bg-secondary`] = this.adjustColorOpacity(
            primaryColor,
            mode === 'light' ? 0.03 : 0.08,
          )
          backgrounds[`${prefix}-bg-tertiary`] = this.adjustColorOpacity(
            primaryColor,
            mode === 'light' ? 0.02 : 0.05,
          )
        }
        break
      case 'custom':
        if (this.config.customBackgroundColors) {
          const colors
            = mode === 'light'
              ? this.config.customBackgroundColors.light
              : this.config.customBackgroundColors.dark
          if (colors) {
            colors.forEach((color, index) => {
              backgrounds[`${prefix}-bg-${index + 1}`] = color
            })
          }
        }
        break
      case 'neutral':
      default:
        // 默认灰色调背景
        if (mode === 'light') {
          backgrounds[`${prefix}-bg-primary`] = '#ffffff'
          backgrounds[`${prefix}-bg-secondary`] = '#fafafa'
          backgrounds[`${prefix}-bg-tertiary`] = '#f5f5f5'
          backgrounds[`${prefix}-bg-quaternary`] = '#f0f0f0'
          backgrounds[`${prefix}-bg-disabled`] = '#f5f5f5'
        }
        else {
          backgrounds[`${prefix}-bg-primary`] = '#141414'
          backgrounds[`${prefix}-bg-secondary`] = '#1f1f1f'
          backgrounds[`${prefix}-bg-tertiary`] = '#262626'
          backgrounds[`${prefix}-bg-quaternary`] = '#2f2f2f'
          backgrounds[`${prefix}-bg-disabled`] = '#262626'
        }
        break
    }

    return backgrounds
  }

  /**
   * 调整颜色透明度
   */
  private adjustColorOpacity(color: string, opacity: number): string {
    // 简单的颜色透明度调整，实际项目中可能需要更复杂的颜色处理
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = Number.parseInt(hex.slice(0, 2), 16)
      const g = Number.parseInt(hex.slice(2, 4), 16)
      const b = Number.parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CSSVariableConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): CSSVariableConfig {
    return { ...this.config }
  }

  /**
   * 销毁注入器
   */
  destroy(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
      this.styleElement = null
    }
    this.currentVariables = {}
  }
}

/**
 * 全局CSS变量注入器实例
 * 使用新的 CSSInjectorImpl 以确保与 EnhancedThemeApplier 使用相同的实现
 */
export const globalCSSInjector = new CSSInjectorImpl({
  prefix: '--ldesign',
  styleId: 'ldesign-color-variables',
  selector: ':root',
})

/**
 * 创建配置化的CSS变量注入器
 */
export function createCSSVariableInjector(
  config?: Partial<CSSVariableConfig>,
): CSSVariableInjector {
  return new CSSVariableInjector(config)
}

/**
 * 便捷函数：注入颜色主题CSS变量（增强版）
 */
export function injectThemeVariables(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  mode: ColorMode = 'light',
  prefix = '--ldesign',
  config?: Partial<CSSVariableConfig>,
): void {
  // 使用 CSSVariableInjector 而不是 CSSInjectorImpl，因为需要 getConfig 和 generateBackgroundColors 方法
  const injector = config ? createCSSVariableInjector(config) : new CSSVariableInjector({ prefix })
  const variables: Record<string, string> = {}
  const variableInfos: ColorVariableInfo[] = []

  // 基础颜色
  variables[`${prefix}-primary`] = colors.primary
  variableInfos.push({
    name: `${prefix}-primary`,
    value: colors.primary,
    description: '主要颜色，用于品牌色、按钮、链接等',
    category: 'Primary Colors',
    usage: 'background-color, border-color, color',
  })

  if (colors.success) {
    variables[`${prefix}-success`] = colors.success
    variableInfos.push({
      name: `${prefix}-success`,
      value: colors.success,
      description: '成功状态颜色，用于成功提示、确认按钮等',
      category: 'Status Colors',
      usage: 'background-color, border-color, color',
    })
  }

  if (colors.warning) {
    variables[`${prefix}-warning`] = colors.warning
    variableInfos.push({
      name: `${prefix}-warning`,
      value: colors.warning,
      description: '警告状态颜色，用于警告提示、注意事项等',
      category: 'Status Colors',
      usage: 'background-color, border-color, color',
    })
  }

  if (colors.danger) {
    variables[`${prefix}-danger`] = colors.danger
    variableInfos.push({
      name: `${prefix}-danger`,
      value: colors.danger,
      description: '危险状态颜色，用于错误提示、删除按钮等',
      category: 'Status Colors',
      usage: 'background-color, border-color, color',
    })
  }

  if (colors.gray) {
    variables[`${prefix}-gray`] = colors.gray
    variableInfos.push({
      name: `${prefix}-gray`,
      value: colors.gray,
      description: '中性灰色，用于文本、边框、背景等',
      category: 'Neutral Colors',
      usage: 'color, border-color, background-color',
    })
  }

  // 色阶
  for (const [category, scale] of Object.entries(scales)) {
    if (scale && scale.indices) {
      for (const [index, color] of Object.entries(scale.indices)) {
        const varName = `${prefix}-${category}-${index}`
        variables[varName] = color
        variableInfos.push({
          name: varName,
          value: color,
          description: `${category} 色阶 ${index}`,
          category: 'Color Scales',
          usage: 'background-color, border-color, color',
        })
      }
    }
  }

  // 中性色
  if (neutralColors) {
    for (const [category, scale] of Object.entries(neutralColors)) {
      if (scale && scale.indices) {
        for (const [index, color] of Object.entries(scale.indices)) {
          const varName = `${prefix}-${category}-${index}`
          variables[varName] = color as string
          variableInfos.push({
            name: varName,
            value: color as string,
            description: `${category} 中性色 ${index}`,
            category: 'Neutral Colors',
            usage: 'color, border-color, background-color',
          })
        }
      }
    }
  }

  // 生成背景色
  if (
    injector.getConfig().backgroundStrategy !== 'neutral'
    || injector.getConfig().generateBackgroundFromPrimary
  ) {
    const backgroundColors = injector.generateBackgroundColors(colors.primary, mode)
    Object.assign(variables, backgroundColors)

    Object.entries(backgroundColors).forEach(([name, value]) => {
      variableInfos.push({
        name,
        value,
        description: '背景色变量',
        category: 'Background Colors',
        usage: 'background-color',
      })
    })
  }

  // 语义化变量
  addSemanticVariables(variables, mode, prefix)

  // 添加语义化变量的描述信息
  const semanticVariableNames = [
    `${prefix}-bg-primary`,
    `${prefix}-bg-secondary`,
    `${prefix}-bg-tertiary`,
    `${prefix}-text-primary`,
    `${prefix}-text-secondary`,
    `${prefix}-text-tertiary`,
    `${prefix}-border-primary`,
    `${prefix}-border-secondary`,
    `${prefix}-shadow-sm`,
    `${prefix}-shadow-md`,
    `${prefix}-shadow-lg`,
  ]

  semanticVariableNames.forEach((name) => {
    if (variables[name]) {
      variableInfos.push({
        name,
        value: variables[name],
        description: '语义化变量',
        category: 'Semantic Variables',
        usage: 'background-color, color, border-color, box-shadow',
      })
    }
  })

  injector.injectVariables(variables)
}

/**
 * 颜色转换缓存
 * 使用LRU策略，避免重复计算
 */
class ColorConversionCache {
  private cache = new Map<string, { h: number, s: number, l: number } | string>()
  private maxSize = 100

  get(key: string): { h: number, s: number, l: number } | string | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: { h: number, s: number, l: number } | string): void {
    // LRU策略：如果超过最大容量，删除最早的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

/**
 * 增强的主题应用器
 * 根据当前模式生成完整的色阶CSS变量并注入到专门的style标签中
 * 支持主题状态缓存和恢复
 * 性能优化：添加颜色转换缓存，减少重复计算
 */
export class EnhancedThemeApplier {
  private cssInjector: CSSInjectorImpl
  private cacheManager: ThemeCacheManager
  private currentTheme: string = 'blue'
  private currentMode: 'light' | 'dark' = 'light'
  private debugMode: boolean = false
  private colorCache = new ColorConversionCache()

  constructor(options?: { debug?: boolean }) {
    // 使用统一的 styleId，确保所有CSS变量都注入到同一个标签中
    this.cssInjector = new CSSInjectorImpl({
      prefix: '--ldesign',
      styleId: 'ldesign-color-variables', // 统一使用这个ID
      selector: ':root',
    })
    this.cacheManager = new ThemeCacheManager({ debug: this.debugMode })
    this.debugMode = options?.debug ?? false
  }

  /**
   * 应用主题色（生成亮色和暗色两套完整色阶）
   * @param primaryColor 主色调
   * @param currentMode 当前模式 (light/dark)
   * @param themeConfig 主题配置
   * @param saveToCache 是否保存到缓存
   */
  applyTheme(
    primaryColor: string,
    currentMode: 'light' | 'dark',
    themeConfig?: any,
    saveToCache: boolean = true,
  ): void {
    try {
      console.log('🎨 [EnhancedThemeApplier] applyTheme 被调用', { primaryColor, currentMode, themeConfig })

      // 更新当前状态
      this.currentMode = currentMode

      // 生成亮色模式的CSS变量
      const lightVariables: Record<string, string> = {}
      const darkVariables: Record<string, string> = {}

      // 生成完整的色彩系统
      this.generateCompleteColorSystem(primaryColor, lightVariables, darkVariables)

      console.log('🎨 [EnhancedThemeApplier] 生成的变量数量', {
        light: Object.keys(lightVariables).length,
        dark: Object.keys(darkVariables).length,
      })

      // 注入两套CSS变量到不同的选择器，并添加主题信息注释
      const themeInfo = {
        name: themeConfig?.name || 'Custom',
        primaryColor,
      }
      console.log('🎨 [EnhancedThemeApplier] 准备注入CSS变量', { themeInfo, styleId: 'ldesign-color-variables' })
      this.cssInjector.injectThemeVariables(lightVariables, darkVariables, themeInfo)
      console.log('🎨 [EnhancedThemeApplier] CSS变量已注入')

      // 设置模式属性
      this.setModeAttributes(currentMode)

      // 保存到缓存（如果需要）
      if (saveToCache && themeConfig?.name) {
        this.currentTheme = themeConfig.name
        this.cacheManager.saveThemeState(themeConfig.name, currentMode)
      }

      if (this.debugMode) {
        console.log(
          `🎨 主题已应用: ${themeInfo.name} (${primaryColor}) - 当前模式: ${currentMode}${saveToCache ? ' [已缓存]' : ''}`,
        )
        console.log(
          `📊 已生成完整色彩系统 - 亮色变量: ${Object.keys(lightVariables).length}个, 暗色变量: ${Object.keys(darkVariables).length}个`,
        )
      }
    }
    catch (error) {
      console.error('🚨 主题应用失败:', error)
    }
  }

  /**
   * 生成完整的色彩系统
   * @param primaryColor 主色调
   * @param lightVariables 亮色模式变量对象
   * @param darkVariables 暗色模式变量对象
   */
  private generateCompleteColorSystem(
    primaryColor: string,
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 1. 生成主色系（brand/primary）1-10级色阶
    this.generateBrandColorScale(primaryColor, lightVariables, darkVariables)

    // 2. 生成功能色系（warning、success、error、gray）各1-14级色阶
    this.generateFunctionalColorScales(lightVariables, darkVariables)

    // 3. 生成文字颜色系统
    this.generateTextColorSystem(lightVariables, darkVariables)

    // 4. 生成背景色系统
    this.generateBackgroundColorSystem(lightVariables, darkVariables)

    // 5. 生成边框和阴影系统
    this.generateBorderAndShadowSystem(lightVariables, darkVariables)

    // 6. 生成语义化映射
    this.generateSemanticMappings(lightVariables, darkVariables)
  }

  /**
   * 生成主色系（brand/primary）1-10级色阶
   */
  private generateBrandColorScale(
    primaryColor: string,
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    const baseColor = this.hexToHsl(primaryColor)

    for (let i = 1; i <= 10; i++) {
      // 亮色模式：1号最浅，10号最深
      const lightLightness = Math.max(5, Math.min(95, 95 - (i - 1) * 9))
      const lightColor = this.hslToHex({
        h: baseColor.h,
        s: Math.max(20, Math.min(100, baseColor.s * (0.8 + i * 0.02))),
        l: lightLightness,
      })
      lightVariables[`--ldesign-brand-color-${i}`] = lightColor

      // 暗色模式：1号最深，10号最浅
      const darkLightness = Math.max(5, Math.min(95, 10 + (i - 1) * 8))
      const darkColor = this.hslToHex({
        h: baseColor.h,
        s: Math.max(20, Math.min(100, baseColor.s * (0.7 + i * 0.03))),
        l: darkLightness,
      })
      darkVariables[`--ldesign-brand-color-${i}`] = darkColor
    }
  }

  /**
   * 生成功能色系（warning、success、error）1-10级色阶和gray 1-14级色阶
   * 参考TDesign的色阶系统
   */
  private generateFunctionalColorScales(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 功能色基础色值
    const functionalColors = {
      warning: { h: 45, s: 100, l: 50 }, // 橙色
      success: { h: 120, s: 60, l: 45 }, // 绿色
      error: { h: 0, s: 85, l: 55 }, // 红色
    }

    // 生成warning、success、error的1-10级色阶
    Object.entries(functionalColors).forEach(([colorName, baseHsl]) => {
      for (let i = 1; i <= 10; i++) {
        // 亮色模式
        const lightLightness = Math.max(5, Math.min(95, 95 - (i - 1) * 9))
        const lightColor = this.hslToHex({
          h: baseHsl.h,
          s: Math.max(20, baseHsl.s - i * 2),
          l: lightLightness,
        })
        lightVariables[`--ldesign-${colorName}-color-${i}`] = lightColor

        // 暗色模式
        const darkLightness = Math.max(5, Math.min(95, 10 + (i - 1) * 9))
        const darkColor = this.hslToHex({
          h: baseHsl.h,
          s: Math.max(15, baseHsl.s - i * 1.5),
          l: darkLightness,
        })
        darkVariables[`--ldesign-${colorName}-color-${i}`] = darkColor
      }
    })

    // 生成gray的1-14级色阶（参考TDesign）
    // 纯中性灰色，饱和度为0
    const grayLightnesses = {
      light: [95, 93, 91, 87, 78, 65, 54, 47, 37, 29, 22, 17, 14, 9], // 1-14级
      dark: [95, 93, 91, 87, 78, 65, 54, 47, 37, 29, 22, 17, 14, 9], // 1-14级
    }

    for (let i = 1; i <= 14; i++) {
      // 亮色模式 - 纯中性灰
      const lightColor = this.hslToHex({
        h: 0,
        s: 0,
        l: grayLightnesses.light[i - 1],
      })
      lightVariables[`--ldesign-gray-color-${i}`] = lightColor

      // 暗色模式 - 纯中性灰
      const darkColor = this.hslToHex({
        h: 0,
        s: 0,
        l: grayLightnesses.dark[i - 1],
      })
      darkVariables[`--ldesign-gray-color-${i}`] = darkColor
    }
  }

  /**
   * 生成文字颜色系统
   */
  private generateTextColorSystem(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 亮色模式文字颜色
    lightVariables['--ldesign-font-gray-1'] = 'rgba(0, 0, 0, 90%)' // 主要文字
    lightVariables['--ldesign-font-gray-2'] = 'rgba(0, 0, 0, 70%)' // 次要文字
    lightVariables['--ldesign-font-gray-3'] = 'rgba(0, 0, 0, 50%)' // 辅助文字
    lightVariables['--ldesign-font-gray-4'] = 'rgba(0, 0, 0, 30%)' // 禁用文字

    lightVariables['--ldesign-font-white-1'] = 'rgba(255, 255, 255, 100%)'
    lightVariables['--ldesign-font-white-2'] = 'rgba(255, 255, 255, 85%)'
    lightVariables['--ldesign-font-white-3'] = 'rgba(255, 255, 255, 70%)'
    lightVariables['--ldesign-font-white-4'] = 'rgba(255, 255, 255, 55%)'

    // 暗色模式文字颜色
    darkVariables['--ldesign-font-gray-1'] = 'rgba(255, 255, 255, 90%)'
    darkVariables['--ldesign-font-gray-2'] = 'rgba(255, 255, 255, 70%)'
    darkVariables['--ldesign-font-gray-3'] = 'rgba(255, 255, 255, 50%)'
    darkVariables['--ldesign-font-gray-4'] = 'rgba(255, 255, 255, 30%)'

    darkVariables['--ldesign-font-white-1'] = 'rgba(0, 0, 0, 90%)'
    darkVariables['--ldesign-font-white-2'] = 'rgba(0, 0, 0, 70%)'
    darkVariables['--ldesign-font-white-3'] = 'rgba(0, 0, 0, 50%)'
    darkVariables['--ldesign-font-white-4'] = 'rgba(0, 0, 0, 30%)'
  }

  /**
   * 设置模式相关的DOM属性
   */
  private setModeAttributes(mode: 'light' | 'dark'): void {
    const root = document.documentElement

    // 设置 data 属性
    root.setAttribute('data-theme-mode', mode)

    // 设置 CSS 类
    if (mode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  /**
   * 生成背景色系统
   */
  private generateBackgroundColorSystem(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 亮色模式背景色
    lightVariables['--ldesign-bg-color-page'] = '#f5f5f5' // 页面背景
    lightVariables['--ldesign-bg-color-container'] = '#ffffff' // 容器背景
    lightVariables['--ldesign-bg-color-container-hover'] = '#fafafa' // 容器悬浮
    lightVariables['--ldesign-bg-color-container-active'] = '#f0f0f0' // 容器激活
    lightVariables['--ldesign-bg-color-container-disabled'] = '#f5f5f5' // 容器禁用
    lightVariables['--ldesign-bg-color-component'] = '#ffffff' // 组件背景
    lightVariables['--ldesign-bg-color-component-hover'] = '#f8f8f8' // 组件悬浮
    lightVariables['--ldesign-bg-color-component-active'] = '#f0f0f0' // 组件激活
    lightVariables['--ldesign-bg-color-component-disabled'] = '#fafafa' // 组件禁用

    // 暗色模式背景色
    darkVariables['--ldesign-bg-color-page'] = '#0f0f0f'
    darkVariables['--ldesign-bg-color-container'] = '#1a1a1a'
    darkVariables['--ldesign-bg-color-container-hover'] = '#252525'
    darkVariables['--ldesign-bg-color-container-active'] = '#303030'
    darkVariables['--ldesign-bg-color-container-disabled'] = '#1f1f1f'
    darkVariables['--ldesign-bg-color-component'] = '#1a1a1a'
    darkVariables['--ldesign-bg-color-component-hover'] = '#252525'
    darkVariables['--ldesign-bg-color-component-active'] = '#303030'
    darkVariables['--ldesign-bg-color-component-disabled'] = '#1f1f1f'
  }

  /**
   * 生成边框、阴影、遮罩和滚动条系统
   * 参考TDesign的完整设计系统
   */
  private generateBorderAndShadowSystem(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 亮色模式边框色
    lightVariables['--ldesign-border-level-1-color'] = '#e5e5e5' // 一级边框
    lightVariables['--ldesign-border-level-2-color'] = '#d9d9d9' // 二级边框
    lightVariables['--ldesign-border-level-3-color'] = '#cccccc' // 三级边框

    // 亮色模式阴影（参考TDesign）
    lightVariables['--ldesign-shadow-1'] = '0 1px 10px rgba(0, 0, 0, 5%), 0 4px 5px rgba(0, 0, 0, 8%), 0 2px 4px -1px rgba(0, 0, 0, 12%)'
    lightVariables['--ldesign-shadow-2'] = '0 3px 14px 2px rgba(0, 0, 0, 5%), 0 8px 10px 1px rgba(0, 0, 0, 6%), 0 5px 5px -3px rgba(0, 0, 0, 10%)'
    lightVariables['--ldesign-shadow-3'] = '0 6px 30px 5px rgba(0, 0, 0, 5%), 0 16px 24px 2px rgba(0, 0, 0, 4%), 0 8px 10px -5px rgba(0, 0, 0, 8%)'
    lightVariables['--ldesign-shadow-inset'] = 'inset 0 1px 2px rgba(0, 0, 0, 8%)'
    lightVariables['--ldesign-shadow-table'] = '0 2px 8px rgba(0, 0, 0, 6%)'

    // 亮色模式遮罩（参考TDesign）
    lightVariables['--ldesign-mask-active'] = 'rgba(0, 0, 0, 60%)' // 遮罩-弹出
    lightVariables['--ldesign-mask-disabled'] = 'rgba(255, 255, 255, 60%)' // 遮罩-禁用

    // 亮色模式滚动条（参考TDesign）
    lightVariables['--ldesign-scrollbar-color'] = 'rgba(0, 0, 0, 10%)'
    lightVariables['--ldesign-scrollbar-hover-color'] = 'rgba(0, 0, 0, 30%)'
    lightVariables['--ldesign-scroll-track-color'] = '#ffffff'

    // 暗色模式边框色
    darkVariables['--ldesign-border-level-1-color'] = '#404040'
    darkVariables['--ldesign-border-level-2-color'] = '#4a4a4a'
    darkVariables['--ldesign-border-level-3-color'] = '#555555'

    // 暗色模式阴影（参考TDesign）
    darkVariables['--ldesign-shadow-1'] = '0 4px 6px rgba(0, 0, 0, 6%), 0 1px 10px rgba(0, 0, 0, 8%), 0 2px 4px rgba(0, 0, 0, 12%)'
    darkVariables['--ldesign-shadow-2'] = '0 8px 10px rgba(0, 0, 0, 12%), 0 3px 14px rgba(0, 0, 0, 10%), 0 5px 5px rgba(0, 0, 0, 16%)'
    darkVariables['--ldesign-shadow-3'] = '0 16px 24px rgba(0, 0, 0, 14%), 0 6px 30px rgba(0, 0, 0, 12%), 0 8px 10px rgba(0, 0, 0, 20%)'
    darkVariables['--ldesign-shadow-inset'] = 'inset 0 1px 2px rgba(0, 0, 0, 25%)'
    darkVariables['--ldesign-shadow-table'] = '0 2px 8px rgba(0, 0, 0, 20%)'

    // 暗色模式遮罩（参考TDesign）
    darkVariables['--ldesign-mask-active'] = 'rgba(0, 0, 0, 40%)' // 遮罩-弹出
    darkVariables['--ldesign-mask-disabled'] = 'rgba(0, 0, 0, 60%)' // 遮罩-禁用

    // 暗色模式滚动条（参考TDesign）
    darkVariables['--ldesign-scrollbar-color'] = 'rgba(255, 255, 255, 10%)'
    darkVariables['--ldesign-scrollbar-hover-color'] = 'rgba(255, 255, 255, 30%)'
    darkVariables['--ldesign-scroll-track-color'] = '#333333'
  }

  /**
   * 生成语义化映射
   */
  private generateSemanticMappings(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
  ): void {
    // 语义化基础色映射
    const semanticMappings = {
      // 主色映射
      '--ldesign-brand-color': 'var(--ldesign-brand-color-7)',
      '--ldesign-warning-color': 'var(--ldesign-warning-color-5)',
      '--ldesign-success-color': 'var(--ldesign-success-color-5)',
      '--ldesign-error-color': 'var(--ldesign-error-color-5)',

      // 交互状态扩展
      '--ldesign-brand-color-hover': 'var(--ldesign-brand-color-6)',
      '--ldesign-brand-color-focus': 'var(--ldesign-brand-color-2)',
      '--ldesign-brand-color-active': 'var(--ldesign-brand-color-8)',
      '--ldesign-brand-color-disabled': 'var(--ldesign-brand-color-3)',

      '--ldesign-warning-color-hover': 'var(--ldesign-warning-color-4)',
      '--ldesign-warning-color-focus': 'var(--ldesign-warning-color-2)',
      '--ldesign-warning-color-active': 'var(--ldesign-warning-color-6)',
      '--ldesign-warning-color-disabled': 'var(--ldesign-warning-color-3)',

      '--ldesign-success-color-hover': 'var(--ldesign-success-color-4)',
      '--ldesign-success-color-focus': 'var(--ldesign-success-color-2)',
      '--ldesign-success-color-active': 'var(--ldesign-success-color-6)',
      '--ldesign-success-color-disabled': 'var(--ldesign-success-color-3)',

      '--ldesign-error-color-hover': 'var(--ldesign-error-color-4)',
      '--ldesign-error-color-focus': 'var(--ldesign-error-color-2)',
      '--ldesign-error-color-active': 'var(--ldesign-error-color-6)',
      '--ldesign-error-color-disabled': 'var(--ldesign-error-color-3)',

      // 文本色系统映射
      '--ldesign-text-color-primary': 'var(--ldesign-font-gray-1)',
      '--ldesign-text-color-secondary': 'var(--ldesign-font-gray-2)',
      '--ldesign-text-color-placeholder': 'var(--ldesign-font-gray-3)',
      '--ldesign-text-color-disabled': 'var(--ldesign-font-gray-4)',

      // 背景色系统映射（移除自引用，直接使用具体的背景色变量）
      // 注意：这些变量已经在 generateBackgroundColorSystem 中定义了具体值
      // 不需要在这里重复映射

      // 边框色映射
      '--ldesign-border-color': 'var(--ldesign-border-level-1-color)',
      '--ldesign-border-color-hover': 'var(--ldesign-border-level-2-color)',
      '--ldesign-border-color-focus': 'var(--ldesign-brand-color)',
    }

    // 将语义化映射添加到两套变量中
    Object.entries(semanticMappings).forEach(([key, value]) => {
      lightVariables[key] = value
      darkVariables[key] = value
    })
  }

  /**
   * 从缓存中恢复主题状态
   */
  restoreFromCache(): { theme: string, mode: 'light' | 'dark' } {
    const state = this.cacheManager.loadThemeState()
    this.currentTheme = state.theme
    this.currentMode = state.mode
    return state
  }

  /**
   * 获取当前主题状态
   */
  getCurrentState(): { theme: string, mode: 'light' | 'dark' } {
    return {
      theme: this.currentTheme,
      mode: this.currentMode,
    }
  }

  /**
   * 切换模式（保持当前主题，只切换data-theme-mode属性）
   */
  toggleMode(): 'light' | 'dark' {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light'
    this.switchMode(newMode)
    return newMode
  }

  /**
   * 切换到指定模式（只切换data-theme-mode属性，不重新生成色阶）
   * @param mode 目标模式
   */
  switchMode(mode: 'light' | 'dark'): void {
    try {
      this.currentMode = mode

      // 只设置模式属性，CSS会自动应用对应的色阶
      this.setModeAttributes(mode)

      // 保存新模式到缓存
      this.cacheManager.saveThemeState(this.currentTheme, mode)

      console.log(`🌓 模式已切换: ${mode} (CSS自动应用对应色阶)`)
    }
    catch (error) {
      console.error('🚨 模式切换失败:', error)
    }
  }

  /**
   * 清除所有主题变量和缓存
   */
  clearTheme(): void {
    this.cssInjector.removeVariables() // 移除默认的样式标签
    this.cacheManager.clearThemeState()
    this.colorCache.clear() // 清除颜色转换缓存
  }

  /**
   * 销毁主题应用器，释放所有资源
   */
  destroy(): void {
    this.clearTheme()
    this.cssInjector.clearAll() // 清除所有注入的样式
    this.colorCache.clear()
  }

  /**
   * 将十六进制颜色转换为HSL（带缓存优化）
   */
  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    // 检查缓存
    const cacheKey = `hex2hsl:${hex}`
    const cached = this.colorCache.get(cacheKey)
    if (cached && typeof cached === 'object' && 'h' in cached) {
      return cached
    }

    // 移除 # 符号
    hex = hex.replace('#', '')

    // 转换为RGB - 使用 substring 替代已废弃的 substr
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    const result = {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }

    // 缓存结果
    this.colorCache.set(cacheKey, result)
    return result
  }

  /**
   * 将HSL颜色转换为十六进制（带缓存优化）
   */
  private hslToHex({ h, s, l }: { h: number, s: number, l: number }): string {
    // 检查缓存
    const cacheKey = `hsl2hex:${h},${s},${l}`
    const cached = this.colorCache.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return cached
    }

    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0)
        t += 1
      if (t > 1)
        t -= 1
      if (t < 1 / 6)
        return p + (q - p) * 6 * t
      if (t < 1 / 2)
        return q
      if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? `0${hex}` : hex
    }

    const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`

    // 缓存结果
    this.colorCache.set(cacheKey, result)
    return result
  }
}

/**
 * 主题缓存管理器
 * 负责主题状态的持久化存储和恢复
 * 与ThemeManager使用相同的存储格式，避免冲突
 */
export class ThemeCacheManager {
  private readonly STORAGE_KEY = 'ldesign-color-theme'
  private debugMode: boolean = false

  constructor(options?: { debug?: boolean }) {
    this.debugMode = options?.debug ?? false
  }

  /**
   * 保存主题状态到缓存
   */
  saveThemeState(theme: string, mode: 'light' | 'dark'): void {
    try {
      const data = { theme, mode }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      if (this.debugMode) {
        console.log(`💾 主题状态已缓存: ${theme} (${mode})`)
      }
    }
    catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ 主题状态缓存失败:', error)
      }
    }
  }

  /**
   * 从缓存中恢复主题状态
   */
  loadThemeState(): { theme: string, mode: 'light' | 'dark' } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const { theme, mode } = JSON.parse(stored)
        if (this.debugMode) {
          console.log(`📂 主题状态已恢复: ${theme} (${mode})`)
        }
        return { theme: theme || 'default', mode: mode || 'light' }
      }
    }
    catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ 主题状态恢复失败，使用默认值:', error)
      }
      // 清理可能损坏的数据
      this.clearThemeState()
    }

    // 返回默认值
    const defaultState = { theme: 'default', mode: 'light' as const }
    if (this.debugMode) {
      console.log(`📂 使用默认主题状态: ${defaultState.theme} (${defaultState.mode})`)
    }
    return defaultState
  }

  /**
   * 清除缓存的主题状态
   */
  clearThemeState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      // 同时清理旧的存储格式
      localStorage.removeItem('ldesign-theme')
      localStorage.removeItem('ldesign-mode')
      if (this.debugMode) {
        console.log('🗑️ 主题状态缓存已清除')
      }
    }
    catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ 清除主题状态缓存失败:', error)
      }
    }
  }
}

// 创建全局实例（默认不开启调试模式）
export const globalThemeApplier = new EnhancedThemeApplier()
export const globalThemeCacheManager = new ThemeCacheManager()

/**
 * 添加语义化CSS变量
 */
function addSemanticVariables(
  variables: Record<string, string>,
  mode: ColorMode,
  prefix: string,
): void {
  if (mode === 'light') {
    // 亮色模式
    variables[`${prefix}-bg-primary`] = '#ffffff'
    variables[`${prefix}-bg-secondary`] = '#f8f9fa'
    variables[`${prefix}-bg-tertiary`] = '#f1f3f4'
    variables[`${prefix}-text-primary`] = '#212529'
    variables[`${prefix}-text-secondary`] = '#6c757d'
    variables[`${prefix}-text-tertiary`] = '#adb5bd'
    variables[`${prefix}-border-primary`] = '#dee2e6'
    variables[`${prefix}-border-secondary`] = '#e9ecef'
    variables[`${prefix}-shadow-sm`] = 'rgba(0, 0, 0, 0.05)'
    variables[`${prefix}-shadow-md`] = 'rgba(0, 0, 0, 0.1)'
    variables[`${prefix}-shadow-lg`] = 'rgba(0, 0, 0, 0.15)'
  }
  else {
    // 暗色模式
    variables[`${prefix}-bg-primary`] = '#1a1a1a'
    variables[`${prefix}-bg-secondary`] = '#2d2d2d'
    variables[`${prefix}-bg-tertiary`] = '#404040'
    variables[`${prefix}-text-primary`] = '#ffffff'
    variables[`${prefix}-text-secondary`] = '#b3b3b3'
    variables[`${prefix}-text-tertiary`] = '#808080'
    variables[`${prefix}-border-primary`] = '#404040'
    variables[`${prefix}-border-secondary`] = '#333333'
    variables[`${prefix}-shadow-sm`] = 'rgba(0, 0, 0, 0.2)'
    variables[`${prefix}-shadow-md`] = 'rgba(0, 0, 0, 0.3)'
    variables[`${prefix}-shadow-lg`] = 'rgba(0, 0, 0, 0.4)'
  }
}

/**
 * 便捷函数：切换主题模式
 */
export function toggleThemeMode(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  currentMode: ColorMode = 'light',
  prefix = '--color',
): ColorMode {
  const newMode = currentMode === 'light' ? 'dark' : 'light'
  injectThemeVariables(colors, scales, neutralColors, newMode, prefix)
  return newMode
}

/**
 * 便捷函数：获取CSS变量值
 */
export function getCSSVariableValue(name: string): string {
  if (typeof document === 'undefined')
    return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * 便捷函数：设置CSS变量值
 */
export function setCSSVariableValue(name: string, value: string): void {
  if (typeof document === 'undefined')
    return
  document.documentElement.style.setProperty(name, value)
}
