/**
 * 主题颜色定义
 */
export interface ThemeColors {
  // 主色调
  primary: string
  primaryHover: string
  primaryActive: string
  primaryDisabled: string
  
  // 辅助色
  secondary: string
  secondaryHover: string
  secondaryActive: string
  
  // 语义色彩
  success: string
  warning: string
  error: string
  info: string
  
  // 中性色
  text: {
    primary: string
    secondary: string
    disabled: string
    inverse: string
  }
  
  // 背景色
  background: {
    primary: string
    secondary: string
    elevated: string
    overlay: string
  }
  
  // 边框色
  border: {
    primary: string
    secondary: string
    focus: string
    error: string
  }
  
  // 阴影
  shadow: {
    light: string
    medium: string
    heavy: string
  }
}

/**
 * 节点主题样式
 */
export interface NodeThemeStyle {
  fill: string
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  
  // 文本样式
  textColor: string
  fontSize: number
  fontFamily: string
  fontWeight: string | number
  
  // 图标样式
  iconColor: string
  iconSize: number
  
  // 交互状态
  hover: {
    fill: string
    stroke: string
    strokeWidth: number
    scale: number
  }
  
  selected: {
    fill: string
    stroke: string
    strokeWidth: number
    glowColor: string
    glowSize: number
  }
  
  // 阴影
  shadow: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  
  // 渐变
  gradient?: {
    type: 'linear' | 'radial'
    colors: Array<{ offset: number; color: string }>
    direction?: number // 线性渐变方向角度
  }
}

/**
 * 连线主题样式
 */
export interface EdgeThemeStyle {
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  opacity: number
  
  // 箭头样式
  arrowColor: string
  arrowSize: number
  arrowStyle: 'simple' | 'filled' | 'outline' | 'diamond' | 'circle'
  
  // 标签样式
  labelBackground: string
  labelBorder: string
  labelTextColor: string
  labelFontSize: number
  labelPadding: number
  
  // 交互状态
  hover: {
    stroke: string
    strokeWidth: number
    opacity: number
    glowColor: string
  }
  
  selected: {
    stroke: string
    strokeWidth: number
    opacity: number
    glowColor: string
  }
  
  // 动画
  animation?: {
    enabled: boolean
    type: 'dash' | 'arrow' | 'pulse' | 'flow'
    speed: number
    direction: 'forward' | 'reverse'
  }
}

/**
 * 画布主题样式
 */
export interface CanvasThemeStyle {
  backgroundColor: string
  
  // 网格
  grid: {
    enabled: boolean
    color: string
    size: number
    opacity: number
    style: 'dot' | 'line' | 'cross'
  }
  
  // 选择框
  selection: {
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
  }
  
  // 缩放控件
  zoomControls: {
    backgroundColor: string
    borderColor: string
    textColor: string
    hoverColor: string
  }
  
  // 小地图
  minimap: {
    backgroundColor: string
    borderColor: string
    viewportColor: string
    nodeColor: string
    edgeColor: string
  }
}

/**
 * UI组件主题样式
 */
export interface UIThemeStyle {
  // 工具栏
  toolbar: {
    backgroundColor: string
    borderColor: string
    textColor: string
    iconColor: string
    separatorColor: string
  }
  
  // 属性面板
  propertyPanel: {
    backgroundColor: string
    borderColor: string
    headerBackground: string
    headerTextColor: string
    sectionBorder: string
  }
  
  // 按钮
  button: {
    primary: NodeThemeStyle
    secondary: NodeThemeStyle
    ghost: NodeThemeStyle
    danger: NodeThemeStyle
  }
  
  // 输入框
  input: {
    backgroundColor: string
    borderColor: string
    focusBorderColor: string
    textColor: string
    placeholderColor: string
  }
  
  // 下拉菜单
  dropdown: {
    backgroundColor: string
    borderColor: string
    itemHoverColor: string
    separatorColor: string
  }
  
  // 弹窗
  modal: {
    backgroundColor: string
    borderColor: string
    overlayColor: string
    shadowColor: string
  }
}

/**
 * 完整主题定义
 */
export interface Theme {
  id: string
  name: string
  description: string
  category: 'light' | 'dark' | 'high-contrast' | 'colorful' | 'enterprise' | 'seasonal'
  
  // 基础颜色
  colors: ThemeColors
  
  // 组件样式
  node: {
    default: NodeThemeStyle
    start: NodeThemeStyle
    end: NodeThemeStyle
    process: NodeThemeStyle
    decision: NodeThemeStyle
    approval: NodeThemeStyle
    data: NodeThemeStyle
    connector: NodeThemeStyle
  }
  
  edge: {
    default: EdgeThemeStyle
    condition: EdgeThemeStyle
    data: EdgeThemeStyle
    control: EdgeThemeStyle
  }
  
  canvas: CanvasThemeStyle
  ui: UIThemeStyle
  
  // 自定义属性
  custom?: Record<string, any>
}

/**
 * 主题配置选项
 */
export interface ThemeConfig {
  // 当前主题
  currentTheme: string
  
  // 主题切换动画
  transition: {
    enabled: boolean
    duration: number
    easing: string
  }
  
  // 自适应选项
  adaptive: {
    followSystem: boolean // 跟随系统主题
    autoSwitch: boolean // 根据时间自动切换
    switchTimes: {
      lightTheme: string // 浅色主题时间 "06:00"
      darkTheme: string // 深色主题时间 "18:00"
    }
  }
  
  // 可访问性
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    largeText: boolean
    colorBlindFriendly: boolean
  }
  
  // 自定义覆盖
  overrides?: Partial<Theme>
}

/**
 * 主题应用结果
 */
export interface ThemeApplicationResult {
  success: boolean
  theme: Theme
  appliedStyles: {
    cssVariables: Record<string, string>
    cssClasses: string[]
    inlineStyles: Record<string, string>
  }
  warnings: string[]
  errors: string[]
}

/**
 * 增强主题服务
 */
export class EnhancedThemeService {
  private themes = new Map<string, Theme>()
  private config: ThemeConfig
  private currentTheme: Theme | null = null
  private styleElement: HTMLStyleElement | null = null
  private mediaQueryHandlers: Array<{ query: MediaQueryList; handler: () => void }> = []
  
  constructor(config?: Partial<ThemeConfig>) {
    this.config = {
      currentTheme: 'default-light',
      transition: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      },
      adaptive: {
        followSystem: true,
        autoSwitch: false,
        switchTimes: {
          lightTheme: '06:00',
          darkTheme: '18:00'
        }
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindFriendly: false
      },
      ...config
    }
    
    this.initializeBuiltinThemes()
    this.setupMediaQueryHandlers()
    this.applyInitialTheme()
  }

  /**
   * 注册主题
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme)
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  /**
   * 获取主题分类
   */
  getThemesByCategory(category: Theme['category']): Theme[] {
    return Array.from(this.themes.values()).filter(theme => theme.category === category)
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme
  }

  /**
   * 应用主题
   */
  async applyTheme(themeId: string): Promise<ThemeApplicationResult> {
    const theme = this.themes.get(themeId)
    
    if (!theme) {
      return {
        success: false,
        theme: this.currentTheme!,
        appliedStyles: { cssVariables: {}, cssClasses: [], inlineStyles: {} },
        warnings: [],
        errors: [`主题 "${themeId}" 不存在`]
      }
    }
    
    try {
      // 应用配置覆盖
      const finalTheme = this.applyOverrides(theme)
      
      // 生成CSS变量和样式
      const appliedStyles = this.generateStyles(finalTheme)
      
      // 应用到DOM
      this.applyStylesDOM(appliedStyles)
      
      // 更新当前主题
      this.currentTheme = finalTheme
      this.config.currentTheme = themeId
      
      // 保存到本地存储
      this.saveThemePreference(themeId)
      
      // 触发主题变更事件
      this.emitThemeChange(finalTheme)
      
      return {
        success: true,
        theme: finalTheme,
        appliedStyles,
        warnings: [],
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        theme: this.currentTheme!,
        appliedStyles: { cssVariables: {}, cssClasses: [], inlineStyles: {} },
        warnings: [],
        errors: [`应用主题失败: ${error.message}`]
      }
    }
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(
    baseThemeId: string,
    customizations: Partial<Theme>,
    id: string,
    name: string
  ): Theme {
    const baseTheme = this.themes.get(baseThemeId)
    
    if (!baseTheme) {
      throw new Error(`基础主题 "${baseThemeId}" 不存在`)
    }
    
    const customTheme: Theme = {
      ...this.deepMerge(baseTheme, customizations),
      id,
      name,
      description: `基于 ${baseTheme.name} 的自定义主题`
    }
    
    this.registerTheme(customTheme)
    return customTheme
  }

  /**
   * 导出主题
   */
  exportTheme(themeId: string): string {
    const theme = this.themes.get(themeId)
    if (!theme) {
      throw new Error(`主题 "${themeId}" 不存在`)
    }
    
    return JSON.stringify(theme, null, 2)
  }

  /**
   * 导入主题
   */
  importTheme(themeJson: string): Theme {
    try {
      const theme: Theme = JSON.parse(themeJson)
      
      // 验证主题结构
      this.validateTheme(theme)
      
      this.registerTheme(theme)
      return theme
    } catch (error) {
      throw new Error(`导入主题失败: ${error.message}`)
    }
  }

  /**
   * 获取节点样式
   */
  getNodeStyle(nodeType: string, state?: 'hover' | 'selected'): NodeThemeStyle {
    if (!this.currentTheme) {
      throw new Error('没有应用任何主题')
    }
    
    const baseStyle = this.currentTheme.node[nodeType] || this.currentTheme.node.default
    
    if (state) {
      return { ...baseStyle, ...baseStyle[state] }
    }
    
    return baseStyle
  }

  /**
   * 获取连线样式
   */
  getEdgeStyle(edgeType: string, state?: 'hover' | 'selected'): EdgeThemeStyle {
    if (!this.currentTheme) {
      throw new Error('没有应用任何主题')
    }
    
    const baseStyle = this.currentTheme.edge[edgeType] || this.currentTheme.edge.default
    
    if (state) {
      return { ...baseStyle, ...baseStyle[state] }
    }
    
    return baseStyle
  }

  /**
   * 获取颜色值
   */
  getColor(colorPath: string): string {
    if (!this.currentTheme) {
      throw new Error('没有应用任何主题')
    }
    
    const keys = colorPath.split('.')
    let value = this.currentTheme.colors as any
    
    for (const key of keys) {
      value = value?.[key]
    }
    
    if (typeof value !== 'string') {
      throw new Error(`颜色路径 "${colorPath}" 无效`)
    }
    
    return value
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 重新应用当前主题以反映配置变更
    if (this.currentTheme) {
      this.applyTheme(this.currentTheme.id)
    }
  }

  /**
   * 切换到系统主题
   */
  followSystemTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const themeId = prefersDark ? 'default-dark' : 'default-light'
    this.applyTheme(themeId)
  }

  /**
   * 生成主题预览
   */
  generateThemePreview(themeId: string): {
    colors: string[]
    nodePreview: string
    edgePreview: string
  } {
    const theme = this.themes.get(themeId)
    if (!theme) {
      throw new Error(`主题 "${themeId}" 不存在`)
    }
    
    // 提取主要颜色
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.error,
      theme.colors.background.primary
    ]
    
    // 生成节点预览SVG
    const nodePreview = `
      <svg width="60" height="40" viewBox="0 0 60 40">
        <rect x="2" y="2" width="56" height="36" 
              fill="${theme.node.default.fill}" 
              stroke="${theme.node.default.stroke}" 
              stroke-width="${theme.node.default.strokeWidth}" 
              rx="4"/>
        <text x="30" y="24" 
              fill="${theme.node.default.textColor}" 
              font-size="12" 
              text-anchor="middle" 
              font-family="${theme.node.default.fontFamily}">节点</text>
      </svg>
    `
    
    // 生成连线预览SVG
    const edgePreview = `
      <svg width="60" height="20" viewBox="0 0 60 20">
        <line x1="5" y1="10" x2="50" y2="10" 
              stroke="${theme.edge.default.stroke}" 
              stroke-width="${theme.edge.default.strokeWidth}"/>
        <polygon points="50,10 45,7 45,13" 
                 fill="${theme.edge.default.arrowColor}"/>
      </svg>
    `
    
    return { colors, nodePreview, edgePreview }
  }

  /**
   * 初始化内置主题
   */
  private initializeBuiltinThemes(): void {
    // 默认浅色主题
    this.registerTheme(this.createDefaultLightTheme())
    
    // 默认深色主题
    this.registerTheme(this.createDefaultDarkTheme())
    
    // 高对比度主题
    this.registerTheme(this.createHighContrastTheme())
    
    // 企业主题
    this.registerTheme(this.createEnterpriseTheme())
    
    // 彩色主题
    this.registerTheme(this.createColorfulTheme())
    
    // 节日主题示例
    this.registerTheme(this.createChristmasTheme())
  }

  /**
   * 创建默认浅色主题
   */
  private createDefaultLightTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#1890ff',
      primaryHover: '#40a9ff',
      primaryActive: '#096dd9',
      primaryDisabled: '#bfbfbf',
      secondary: '#722ed1',
      secondaryHover: '#9254de',
      secondaryActive: '#531dab',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#1890ff',
      text: {
        primary: '#262626',
        secondary: '#595959',
        disabled: '#bfbfbf',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        elevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.45)'
      },
      border: {
        primary: '#d9d9d9',
        secondary: '#f0f0f0',
        focus: '#40a9ff',
        error: '#ff4d4f'
      },
      shadow: {
        light: 'rgba(0, 0, 0, 0.04)',
        medium: 'rgba(0, 0, 0, 0.08)',
        heavy: 'rgba(0, 0, 0, 0.16)'
      }
    }

    return {
      id: 'default-light',
      name: '默认浅色',
      description: '清新简洁的浅色主题',
      category: 'light',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#ffffff', '#d9d9d9'),
        start: this.createNodeStyle(colors, '#f6ffed', '#52c41a'),
        end: this.createNodeStyle(colors, '#fff2f0', '#f5222d'),
        process: this.createNodeStyle(colors, '#e6f7ff', '#1890ff'),
        decision: this.createNodeStyle(colors, '#f9f0ff', '#722ed1'),
        approval: this.createNodeStyle(colors, '#fff7e6', '#faad14'),
        data: this.createNodeStyle(colors, '#f0f5ff', '#2f54eb'),
        connector: this.createNodeStyle(colors, '#fafafa', '#8c8c8c')
      },
      edge: {
        default: this.createEdgeStyle(colors, '#8c8c8c'),
        condition: this.createEdgeStyle(colors, '#722ed1'),
        data: this.createEdgeStyle(colors, '#2f54eb'),
        control: this.createEdgeStyle(colors, '#1890ff')
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  /**
   * 创建默认深色主题
   */
  private createDefaultDarkTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#177ddc',
      primaryHover: '#3ba0e9',
      primaryActive: '#095aa3',
      primaryDisabled: '#434343',
      secondary: '#642ab5',
      secondaryHover: '#854eca',
      secondaryActive: '#391085',
      success: '#389e0d',
      warning: '#d89614',
      error: '#cf1322',
      info: '#177ddc',
      text: {
        primary: '#ffffff',
        secondary: '#a6a6a6',
        disabled: '#434343',
        inverse: '#000000'
      },
      background: {
        primary: '#141414',
        secondary: '#1f1f1f',
        elevated: '#262626',
        overlay: 'rgba(255, 255, 255, 0.15)'
      },
      border: {
        primary: '#434343',
        secondary: '#303030',
        focus: '#3ba0e9',
        error: '#ff4d4f'
      },
      shadow: {
        light: 'rgba(0, 0, 0, 0.24)',
        medium: 'rgba(0, 0, 0, 0.32)',
        heavy: 'rgba(0, 0, 0, 0.48)'
      }
    }

    return {
      id: 'default-dark',
      name: '默认深色',
      description: '护眼的深色主题',
      category: 'dark',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#1f1f1f', '#434343'),
        start: this.createNodeStyle(colors, '#162312', '#389e0d'),
        end: this.createNodeStyle(colors, '#2a1215', '#cf1322'),
        process: this.createNodeStyle(colors, '#111b26', '#177ddc'),
        decision: this.createNodeStyle(colors, '#1d1a26', '#642ab5'),
        approval: this.createNodeStyle(colors, '#2b1d11', '#d89614'),
        data: this.createNodeStyle(colors, '#10141f', '#1d39c4'),
        connector: this.createNodeStyle(colors, '#262626', '#595959')
      },
      edge: {
        default: this.createEdgeStyle(colors, '#595959'),
        condition: this.createEdgeStyle(colors, '#642ab5'),
        data: this.createEdgeStyle(colors, '#1d39c4'),
        control: this.createEdgeStyle(colors, '#177ddc')
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  /**
   * 创建高对比度主题
   */
  private createHighContrastTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#0000ff',
      primaryHover: '#0033ff',
      primaryActive: '#0000cc',
      primaryDisabled: '#808080',
      secondary: '#800080',
      secondaryHover: '#a000a0',
      secondaryActive: '#600060',
      success: '#008000',
      warning: '#ff8000',
      error: '#ff0000',
      info: '#0000ff',
      text: {
        primary: '#000000',
        secondary: '#404040',
        disabled: '#808080',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f0f0f0',
        elevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.75)'
      },
      border: {
        primary: '#000000',
        secondary: '#808080',
        focus: '#0000ff',
        error: '#ff0000'
      },
      shadow: {
        light: 'rgba(0, 0, 0, 0.25)',
        medium: 'rgba(0, 0, 0, 0.5)',
        heavy: 'rgba(0, 0, 0, 0.75)'
      }
    }

    return {
      id: 'high-contrast',
      name: '高对比度',
      description: '提升可访问性的高对比度主题',
      category: 'high-contrast',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#ffffff', '#000000', 3),
        start: this.createNodeStyle(colors, '#e6ffe6', '#008000', 3),
        end: this.createNodeStyle(colors, '#ffe6e6', '#ff0000', 3),
        process: this.createNodeStyle(colors, '#e6e6ff', '#0000ff', 3),
        decision: this.createNodeStyle(colors, '#f0e6ff', '#800080', 3),
        approval: this.createNodeStyle(colors, '#fff0e6', '#ff8000', 3),
        data: this.createNodeStyle(colors, '#e6f0ff', '#000080', 3),
        connector: this.createNodeStyle(colors, '#f0f0f0', '#404040', 3)
      },
      edge: {
        default: this.createEdgeStyle(colors, '#000000', 3),
        condition: this.createEdgeStyle(colors, '#800080', 3),
        data: this.createEdgeStyle(colors, '#000080', 3),
        control: this.createEdgeStyle(colors, '#0000ff', 3)
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  /**
   * 创建企业主题
   */
  private createEnterpriseTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#002766',
      primaryHover: '#1f4788',
      primaryActive: '#001529',
      primaryDisabled: '#bfbfbf',
      secondary: '#722ed1',
      secondaryHover: '#9254de',
      secondaryActive: '#531dab',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#002766',
      text: {
        primary: '#262626',
        secondary: '#595959',
        disabled: '#bfbfbf',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        elevated: '#ffffff',
        overlay: 'rgba(0, 39, 102, 0.45)'
      },
      border: {
        primary: '#d9d9d9',
        secondary: '#f0f0f0',
        focus: '#1f4788',
        error: '#ff4d4f'
      },
      shadow: {
        light: 'rgba(0, 39, 102, 0.04)',
        medium: 'rgba(0, 39, 102, 0.08)',
        heavy: 'rgba(0, 39, 102, 0.16)'
      }
    }

    return {
      id: 'enterprise',
      name: '企业主题',
      description: '专业稳重的企业级主题',
      category: 'enterprise',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#ffffff', '#d9d9d9'),
        start: this.createNodeStyle(colors, '#f0f8ff', '#002766'),
        end: this.createNodeStyle(colors, '#fff2f0', '#f5222d'),
        process: this.createNodeStyle(colors, '#f6f8fa', '#002766'),
        decision: this.createNodeStyle(colors, '#f9f0ff', '#722ed1'),
        approval: this.createNodeStyle(colors, '#fff7e6', '#faad14'),
        data: this.createNodeStyle(colors, '#f0f5ff', '#1d4ed8'),
        connector: this.createNodeStyle(colors, '#fafafa', '#8c8c8c')
      },
      edge: {
        default: this.createEdgeStyle(colors, '#8c8c8c'),
        condition: this.createEdgeStyle(colors, '#722ed1'),
        data: this.createEdgeStyle(colors, '#1d4ed8'),
        control: this.createEdgeStyle(colors, '#002766')
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  /**
   * 创建彩色主题
   */
  private createColorfulTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#ff4757',
      primaryHover: '#ff6b81',
      primaryActive: '#c44569',
      primaryDisabled: '#bfbfbf',
      secondary: '#5f27cd',
      secondaryHover: '#7c4dff',
      secondaryActive: '#341f97',
      success: '#00d2d3',
      warning: '#ff9f43',
      error: '#ff3838',
      info: '#74b9ff',
      text: {
        primary: '#2f1b69',
        secondary: '#636e72',
        disabled: '#b2bec3',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#ffeaa7',
        elevated: '#ffffff',
        overlay: 'rgba(95, 39, 205, 0.45)'
      },
      border: {
        primary: '#fd79a8',
        secondary: '#fdcb6e',
        focus: '#ff4757',
        error: '#ff3838'
      },
      shadow: {
        light: 'rgba(95, 39, 205, 0.04)',
        medium: 'rgba(95, 39, 205, 0.08)',
        heavy: 'rgba(95, 39, 205, 0.16)'
      }
    }

    return {
      id: 'colorful',
      name: '缤纷彩色',
      description: '充满活力的彩色主题',
      category: 'colorful',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#ffffff', '#fd79a8'),
        start: this.createNodeStyle(colors, '#e8f8ff', '#00d2d3'),
        end: this.createNodeStyle(colors, '#ffe8e8', '#ff3838'),
        process: this.createNodeStyle(colors, '#ffe8f0', '#ff4757'),
        decision: this.createNodeStyle(colors, '#f0e8ff', '#5f27cd'),
        approval: this.createNodeStyle(colors, '#fff8e8', '#ff9f43'),
        data: this.createNodeStyle(colors, '#e8f0ff', '#74b9ff'),
        connector: this.createNodeStyle(colors, '#ffeaa7', '#636e72')
      },
      edge: {
        default: this.createEdgeStyle(colors, '#636e72'),
        condition: this.createEdgeStyle(colors, '#5f27cd'),
        data: this.createEdgeStyle(colors, '#74b9ff'),
        control: this.createEdgeStyle(colors, '#ff4757')
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  /**
   * 创建圣诞主题
   */
  private createChristmasTheme(): Theme {
    const colors: ThemeColors = {
      primary: '#c41e3a',
      primaryHover: '#e74c3c',
      primaryActive: '#a0252f',
      primaryDisabled: '#bfbfbf',
      secondary: '#228b22',
      secondaryHover: '#32cd32',
      secondaryActive: '#1e7a1e',
      success: '#228b22',
      warning: '#ffd700',
      error: '#c41e3a',
      info: '#4169e1',
      text: {
        primary: '#2c3e50',
        secondary: '#7f8c8d',
        disabled: '#bdc3c7',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        elevated: '#ffffff',
        overlay: 'rgba(196, 30, 58, 0.45)'
      },
      border: {
        primary: '#c41e3a',
        secondary: '#228b22',
        focus: '#c41e3a',
        error: '#c41e3a'
      },
      shadow: {
        light: 'rgba(196, 30, 58, 0.04)',
        medium: 'rgba(196, 30, 58, 0.08)',
        heavy: 'rgba(196, 30, 58, 0.16)'
      }
    }

    return {
      id: 'christmas',
      name: '圣诞主题',
      description: '温馨的圣诞节主题',
      category: 'seasonal',
      colors,
      node: {
        default: this.createNodeStyle(colors, '#ffffff', '#c41e3a'),
        start: this.createNodeStyle(colors, '#f0fff0', '#228b22'),
        end: this.createNodeStyle(colors, '#fff0f0', '#c41e3a'),
        process: this.createNodeStyle(colors, '#fff8dc', '#c41e3a'),
        decision: this.createNodeStyle(colors, '#f0f8ff', '#4169e1'),
        approval: this.createNodeStyle(colors, '#fffff0', '#ffd700'),
        data: this.createNodeStyle(colors, '#f0f0ff', '#4169e1'),
        connector: this.createNodeStyle(colors, '#f8f9fa', '#7f8c8d')
      },
      edge: {
        default: this.createEdgeStyle(colors, '#7f8c8d'),
        condition: this.createEdgeStyle(colors, '#4169e1'),
        data: this.createEdgeStyle(colors, '#4169e1'),
        control: this.createEdgeStyle(colors, '#c41e3a')
      },
      canvas: this.createCanvasStyle(colors),
      ui: this.createUIStyle(colors)
    }
  }

  // 辅助方法 - 创建样式
  private createNodeStyle(
    colors: ThemeColors,
    fill: string,
    stroke: string,
    strokeWidth: number = 2
  ): NodeThemeStyle {
    return {
      fill,
      stroke,
      strokeWidth,
      textColor: colors.text.primary,
      fontSize: 14,
      fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontWeight: 400,
      iconColor: colors.text.secondary,
      iconSize: 16,
      hover: {
        fill: colors.background.elevated,
        stroke: colors.primary,
        strokeWidth: strokeWidth + 1,
        scale: 1.02
      },
      selected: {
        fill,
        stroke: colors.primary,
        strokeWidth: strokeWidth + 1,
        glowColor: colors.primary + '40',
        glowSize: 4
      },
      shadow: {
        color: colors.shadow.light,
        blur: 4,
        offsetX: 0,
        offsetY: 2
      }
    }
  }

  private createEdgeStyle(
    colors: ThemeColors,
    stroke: string,
    strokeWidth: number = 2
  ): EdgeThemeStyle {
    return {
      stroke,
      strokeWidth,
      opacity: 0.8,
      arrowColor: stroke,
      arrowSize: 8,
      arrowStyle: 'filled',
      labelBackground: colors.background.primary,
      labelBorder: colors.border.primary,
      labelTextColor: colors.text.primary,
      labelFontSize: 12,
      labelPadding: 4,
      hover: {
        stroke: colors.primary,
        strokeWidth: strokeWidth + 1,
        opacity: 1,
        glowColor: colors.primary + '40'
      },
      selected: {
        stroke: colors.primary,
        strokeWidth: strokeWidth + 1,
        opacity: 1,
        glowColor: colors.primary + '60'
      }
    }
  }

  private createCanvasStyle(colors: ThemeColors): CanvasThemeStyle {
    return {
      backgroundColor: colors.background.primary,
      grid: {
        enabled: true,
        color: colors.border.secondary,
        size: 20,
        opacity: 0.3,
        style: 'dot'
      },
      selection: {
        fill: colors.primary + '20',
        stroke: colors.primary,
        strokeWidth: 1,
        opacity: 0.3
      },
      zoomControls: {
        backgroundColor: colors.background.elevated,
        borderColor: colors.border.primary,
        textColor: colors.text.primary,
        hoverColor: colors.primary
      },
      minimap: {
        backgroundColor: colors.background.secondary,
        borderColor: colors.border.primary,
        viewportColor: colors.primary,
        nodeColor: colors.text.secondary,
        edgeColor: colors.border.primary
      }
    }
  }

  private createUIStyle(colors: ThemeColors): UIThemeStyle {
    return {
      toolbar: {
        backgroundColor: colors.background.elevated,
        borderColor: colors.border.primary,
        textColor: colors.text.primary,
        iconColor: colors.text.secondary,
        separatorColor: colors.border.secondary
      },
      propertyPanel: {
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary,
        headerBackground: colors.background.secondary,
        headerTextColor: colors.text.primary,
        sectionBorder: colors.border.secondary
      },
      button: {
        primary: this.createNodeStyle(colors, colors.primary, colors.primary),
        secondary: this.createNodeStyle(colors, colors.background.primary, colors.border.primary),
        ghost: this.createNodeStyle(colors, 'transparent', colors.primary),
        danger: this.createNodeStyle(colors, colors.error, colors.error)
      },
      input: {
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary,
        focusBorderColor: colors.border.focus,
        textColor: colors.text.primary,
        placeholderColor: colors.text.disabled
      },
      dropdown: {
        backgroundColor: colors.background.elevated,
        borderColor: colors.border.primary,
        itemHoverColor: colors.background.secondary,
        separatorColor: colors.border.secondary
      },
      modal: {
        backgroundColor: colors.background.elevated,
        borderColor: colors.border.primary,
        overlayColor: colors.background.overlay,
        shadowColor: colors.shadow.heavy
      }
    }
  }

  // 其他辅助方法
  private applyOverrides(theme: Theme): Theme {
    if (!this.config.overrides) return theme
    return this.deepMerge(theme, this.config.overrides)
  }

  private generateStyles(theme: Theme): ThemeApplicationResult['appliedStyles'] {
    const cssVariables: Record<string, string> = {}
    const cssClasses: string[] = [`theme-${theme.id}`]
    const inlineStyles: Record<string, string> = {}

    // 生成CSS变量
    this.generateCSSVariables(theme, cssVariables)

    return { cssVariables, cssClasses, inlineStyles }
  }

  private generateCSSVariables(theme: Theme, variables: Record<string, string>): void {
    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        variables[`--color-${key}`] = value
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          variables[`--color-${key}-${subKey}`] = subValue
        })
      }
    })

    // 节点样式变量
    Object.entries(theme.node).forEach(([nodeType, style]) => {
      variables[`--node-${nodeType}-fill`] = style.fill
      variables[`--node-${nodeType}-stroke`] = style.stroke
      variables[`--node-${nodeType}-stroke-width`] = `${style.strokeWidth}px`
      variables[`--node-${nodeType}-text-color`] = style.textColor
      variables[`--node-${nodeType}-font-size`] = `${style.fontSize}px`
    })

    // 连线样式变量
    Object.entries(theme.edge).forEach(([edgeType, style]) => {
      variables[`--edge-${edgeType}-stroke`] = style.stroke
      variables[`--edge-${edgeType}-stroke-width`] = `${style.strokeWidth}px`
      variables[`--edge-${edgeType}-opacity`] = `${style.opacity}`
    })
  }

  private applyStylesDOM(styles: ThemeApplicationResult['appliedStyles']): void {
    // 创建或更新样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.id = 'flowchart-theme-styles'
      document.head.appendChild(this.styleElement)
    }

    // 生成CSS内容
    const cssContent = Object.entries(styles.cssVariables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    this.styleElement.textContent = `
:root {
${cssContent}
}

.flowchart-container {
  transition: all ${this.config.transition.duration}ms ${this.config.transition.easing};
}

${this.config.accessibility.reducedMotion ? '.flowchart-container * { animation: none !important; transition: none !important; }' : ''}
${this.config.accessibility.largeText ? '.flowchart-container { font-size: 120% !important; }' : ''}
    `

    // 应用CSS类到容器
    const containers = document.querySelectorAll('.flowchart-container')
    containers.forEach(container => {
      container.className = container.className
        .split(' ')
        .filter(cls => !cls.startsWith('theme-'))
        .concat(styles.cssClasses)
        .join(' ')
    })
  }

  private setupMediaQueryHandlers(): void {
    // 系统主题变化
    if (this.config.adaptive.followSystem) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => this.followSystemTheme()
      darkModeQuery.addListener(handler)
      this.mediaQueryHandlers.push({ query: darkModeQuery, handler })
    }

    // 高对比度检测
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const highContrastHandler = () => {
      if (highContrastQuery.matches && !this.config.accessibility.highContrast) {
        this.updateConfig({ accessibility: { ...this.config.accessibility, highContrast: true } })
      }
    }
    highContrastQuery.addListener(highContrastHandler)
    this.mediaQueryHandlers.push({ query: highContrastQuery, handler: highContrastHandler })

    // 减少动画检测
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotionHandler = () => {
      this.updateConfig({ accessibility: { ...this.config.accessibility, reducedMotion: reducedMotionQuery.matches } })
    }
    reducedMotionQuery.addListener(reducedMotionHandler)
    this.mediaQueryHandlers.push({ query: reducedMotionQuery, handler: reducedMotionHandler })
  }

  private applyInitialTheme(): void {
    // 从本地存储读取主题偏好
    const savedTheme = this.loadThemePreference()
    const themeId = savedTheme || this.config.currentTheme

    this.applyTheme(themeId)
  }

  private saveThemePreference(themeId: string): void {
    try {
      localStorage.setItem('flowchart-theme', themeId)
    } catch (error) {
      console.warn('无法保存主题偏好:', error)
    }
  }

  private loadThemePreference(): string | null {
    try {
      return localStorage.getItem('flowchart-theme')
    } catch (error) {
      console.warn('无法读取主题偏好:', error)
      return null
    }
  }

  private validateTheme(theme: Theme): void {
    if (!theme.id || !theme.name || !theme.category) {
      throw new Error('主题缺少必需的属性')
    }

    if (!theme.colors || !theme.node || !theme.edge || !theme.canvas || !theme.ui) {
      throw new Error('主题结构不完整')
    }
  }

  private emitThemeChange(theme: Theme): void {
    const event = new CustomEvent('flowchart-theme-change', { detail: { theme } })
    document.dispatchEvent(event)
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    })

    return result
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    // 清理媒体查询监听器
    this.mediaQueryHandlers.forEach(({ query, handler }) => {
      query.removeListener(handler)
    })
    this.mediaQueryHandlers = []

    // 移除样式元素
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
      this.styleElement = null
    }

    // 清理主题数据
    this.themes.clear()
    this.currentTheme = null
  }
}

// 导出服务实例
export const enhancedThemeService = new EnhancedThemeService()

// 导出类型
export type {
  ThemeColors,
  NodeThemeStyle,
  EdgeThemeStyle,
  CanvasThemeStyle,
  UIThemeStyle,
  Theme,
  ThemeConfig,
  ThemeApplicationResult
}
