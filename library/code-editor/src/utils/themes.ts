/**
 * Monaco Editor Theme Manager
 * 提供多种预定义主题和自定义主题功能
 */

import * as monaco from 'monaco-editor'

/**
 * 预定义主题列表
 */
export const PREDEFINED_THEMES = {
  // 内置主题
  'vs': 'Visual Studio',
  'vs-dark': 'Visual Studio Dark',
  'hc-black': 'High Contrast Black',
  'hc-light': 'High Contrast Light',
  
  // 自定义主题
  'github-light': 'GitHub Light',
  'github-dark': 'GitHub Dark',
  'monokai': 'Monokai',
  'dracula': 'Dracula',
  'one-dark': 'One Dark',
  'one-light': 'One Light',
  'nord': 'Nord',
  'solarized-light': 'Solarized Light',
  'solarized-dark': 'Solarized Dark',
  'material': 'Material',
  'material-darker': 'Material Darker',
  'material-palenight': 'Material Palenight',
  'synthwave': 'Synthwave 84',
  'tokyo-night': 'Tokyo Night',
  'ayu-light': 'Ayu Light',
  'ayu-dark': 'Ayu Dark'
}

/**
 * GitHub Light 主题
 */
export const GitHubLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A737D' },
    { token: 'string', foreground: '032F62' },
    { token: 'keyword', foreground: 'D73A49' },
    { token: 'number', foreground: '005CC5' },
    { token: 'type', foreground: 'D73A49' },
    { token: 'class', foreground: '6F42C1' },
    { token: 'function', foreground: '6F42C1' },
    { token: 'variable', foreground: 'E36209' },
    { token: 'variable.predefined', foreground: '005CC5' },
    { token: 'constant', foreground: '005CC5' },
    { token: 'tag', foreground: '22863A' },
    { token: 'attribute.name', foreground: '6F42C1' },
    { token: 'attribute.value', foreground: '032F62' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#24292E',
    'editor.lineHighlightBackground': '#F6F8FA',
    'editor.selectionBackground': '#0366D625',
    'editorCursor.foreground': '#24292E',
    'editorWhitespace.foreground': '#D1D5DA',
    'editorIndentGuide.background': '#D1D5DA',
    'editorIndentGuide.activeBackground': '#959DA5',
  }
}

/**
 * GitHub Dark 主题
 */
export const GitHubDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '8B949E' },
    { token: 'string', foreground: 'A5D6FF' },
    { token: 'keyword', foreground: 'FF7B72' },
    { token: 'number', foreground: '79C0FF' },
    { token: 'type', foreground: 'FF7B72' },
    { token: 'class', foreground: 'FFA657' },
    { token: 'function', foreground: 'D2A8FF' },
    { token: 'variable', foreground: 'FFA657' },
    { token: 'variable.predefined', foreground: '79C0FF' },
    { token: 'constant', foreground: '79C0FF' },
    { token: 'tag', foreground: '7EE787' },
    { token: 'attribute.name', foreground: '79C0FF' },
    { token: 'attribute.value', foreground: 'A5D6FF' },
  ],
  colors: {
    'editor.background': '#0D1117',
    'editor.foreground': '#C9D1D9',
    'editor.lineHighlightBackground': '#161B22',
    'editor.selectionBackground': '#3392FF44',
    'editorCursor.foreground': '#58A6FF',
    'editorWhitespace.foreground': '#484F58',
    'editorIndentGuide.background': '#21262D',
    'editorIndentGuide.activeBackground': '#484F58',
  }
}

/**
 * Monokai 主题
 */
export const MonokaiTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '88846F' },
    { token: 'string', foreground: 'E6DB74' },
    { token: 'keyword', foreground: 'F92672' },
    { token: 'number', foreground: 'AE81FF' },
    { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
    { token: 'class', foreground: 'A6E22E' },
    { token: 'function', foreground: 'A6E22E' },
    { token: 'variable', foreground: 'F8F8F2' },
    { token: 'variable.predefined', foreground: 'AE81FF' },
    { token: 'constant', foreground: 'AE81FF' },
    { token: 'tag', foreground: 'F92672' },
    { token: 'attribute.name', foreground: 'A6E22E' },
    { token: 'attribute.value', foreground: 'E6DB74' },
  ],
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#F8F8F2',
    'editor.lineHighlightBackground': '#3E3D32',
    'editor.selectionBackground': '#49483E',
    'editorCursor.foreground': '#F8F8F0',
    'editorWhitespace.foreground': '#464741',
    'editorIndentGuide.background': '#464741',
    'editorIndentGuide.activeBackground': '#767771',
  }
}

/**
 * Dracula 主题
 */
export const DraculaTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272A4' },
    { token: 'string', foreground: 'F1FA8C' },
    { token: 'keyword', foreground: 'FF79C6' },
    { token: 'number', foreground: 'BD93F9' },
    { token: 'type', foreground: '8BE9FD', fontStyle: 'italic' },
    { token: 'class', foreground: '50FA7B' },
    { token: 'function', foreground: '50FA7B' },
    { token: 'variable', foreground: 'F8F8F2' },
    { token: 'variable.predefined', foreground: '8BE9FD' },
    { token: 'constant', foreground: 'BD93F9' },
    { token: 'tag', foreground: 'FF79C6' },
    { token: 'attribute.name', foreground: '50FA7B' },
    { token: 'attribute.value', foreground: 'F1FA8C' },
  ],
  colors: {
    'editor.background': '#282A36',
    'editor.foreground': '#F8F8F2',
    'editor.lineHighlightBackground': '#44475A',
    'editor.selectionBackground': '#44475A',
    'editorCursor.foreground': '#F8F8F0',
    'editorWhitespace.foreground': '#44475A',
    'editorIndentGuide.background': '#44475A',
    'editorIndentGuide.activeBackground': '#6272A4',
  }
}

/**
 * One Dark 主题
 */
export const OneDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '5C6370' },
    { token: 'string', foreground: '98C379' },
    { token: 'keyword', foreground: 'C678DD' },
    { token: 'number', foreground: 'D19A66' },
    { token: 'type', foreground: 'E06C75' },
    { token: 'class', foreground: 'E5C07B' },
    { token: 'function', foreground: '61AFEF' },
    { token: 'variable', foreground: 'E06C75' },
    { token: 'variable.predefined', foreground: 'D19A66' },
    { token: 'constant', foreground: 'D19A66' },
    { token: 'tag', foreground: 'E06C75' },
    { token: 'attribute.name', foreground: 'D19A66' },
    { token: 'attribute.value', foreground: '98C379' },
  ],
  colors: {
    'editor.background': '#282C34',
    'editor.foreground': '#ABB2BF',
    'editor.lineHighlightBackground': '#2C313C',
    'editor.selectionBackground': '#3E4451',
    'editorCursor.foreground': '#528BFF',
    'editorWhitespace.foreground': '#3B4048',
    'editorIndentGuide.background': '#3B4048',
    'editorIndentGuide.activeBackground': '#545862',
  }
}

/**
 * Nord 主题
 */
export const NordTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '616E88' },
    { token: 'string', foreground: 'A3BE8C' },
    { token: 'keyword', foreground: '81A1C1' },
    { token: 'number', foreground: 'B48EAD' },
    { token: 'type', foreground: '8FBCBB' },
    { token: 'class', foreground: 'EBCB8B' },
    { token: 'function', foreground: '88C0D0' },
    { token: 'variable', foreground: 'D8DEE9' },
    { token: 'variable.predefined', foreground: 'D8DEE9' },
    { token: 'constant', foreground: 'D8DEE9' },
    { token: 'tag', foreground: '81A1C1' },
    { token: 'attribute.name', foreground: '8FBCBB' },
    { token: 'attribute.value', foreground: 'A3BE8C' },
  ],
  colors: {
    'editor.background': '#2E3440',
    'editor.foreground': '#D8DEE9',
    'editor.lineHighlightBackground': '#3B4252',
    'editor.selectionBackground': '#434C5E',
    'editorCursor.foreground': '#D8DEE9',
    'editorWhitespace.foreground': '#4C566A',
    'editorIndentGuide.background': '#434C5E',
    'editorIndentGuide.activeBackground': '#4C566A',
  }
}

/**
 * Material 主题
 */
export const MaterialTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '546E7A' },
    { token: 'string', foreground: 'C3E88D' },
    { token: 'keyword', foreground: 'C792EA' },
    { token: 'number', foreground: 'F78C6C' },
    { token: 'type', foreground: 'FFCB6B' },
    { token: 'class', foreground: 'FFCB6B' },
    { token: 'function', foreground: '82AAFF' },
    { token: 'variable', foreground: 'EEFFFF' },
    { token: 'variable.predefined', foreground: 'F07178' },
    { token: 'constant', foreground: 'F78C6C' },
    { token: 'tag', foreground: 'FF5370' },
    { token: 'attribute.name', foreground: 'C792EA' },
    { token: 'attribute.value', foreground: 'C3E88D' },
  ],
  colors: {
    'editor.background': '#263238',
    'editor.foreground': '#EEFFFF',
    'editor.lineHighlightBackground': '#00000050',
    'editor.selectionBackground': '#80CBC420',
    'editorCursor.foreground': '#FFCC00',
    'editorWhitespace.foreground': '#37474F',
    'editorIndentGuide.background': '#37474F',
    'editorIndentGuide.activeBackground': '#546E7A',
  }
}

/**
 * Tokyo Night 主题
 */
export const TokyoNightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '565F89' },
    { token: 'string', foreground: '9ECE6A' },
    { token: 'keyword', foreground: 'BB9AF7' },
    { token: 'number', foreground: 'FF9E64' },
    { token: 'type', foreground: '2AC3DE' },
    { token: 'class', foreground: 'FF9E64' },
    { token: 'function', foreground: '7AA2F7' },
    { token: 'variable', foreground: 'C0CAF5' },
    { token: 'variable.predefined', foreground: 'F7768E' },
    { token: 'constant', foreground: 'FF9E64' },
    { token: 'tag', foreground: 'F7768E' },
    { token: 'attribute.name', foreground: '7AA2F7' },
    { token: 'attribute.value', foreground: '9ECE6A' },
  ],
  colors: {
    'editor.background': '#1A1B26',
    'editor.foreground': '#A9B1D6',
    'editor.lineHighlightBackground': '#24283B',
    'editor.selectionBackground': '#283457',
    'editorCursor.foreground': '#C0CAF5',
    'editorWhitespace.foreground': '#3B4261',
    'editorIndentGuide.background': '#292E42',
    'editorIndentGuide.activeBackground': '#3B4261',
  }
}

/**
 * Synthwave '84 主题
 */
export const SynthwaveTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '848BBD' },
    { token: 'string', foreground: 'FF8B39' },
    { token: 'keyword', foreground: 'FF00FF' },
    { token: 'number', foreground: 'F97E72' },
    { token: 'type', foreground: 'FE4450' },
    { token: 'class', foreground: 'FFE700' },
    { token: 'function', foreground: '52E5E7' },
    { token: 'variable', foreground: 'FF7EDB' },
    { token: 'variable.predefined', foreground: '72F1B8' },
    { token: 'constant', foreground: 'FF00FF' },
    { token: 'tag', foreground: '72F1B8' },
    { token: 'attribute.name', foreground: 'FF9F1C' },
    { token: 'attribute.value', foreground: 'FF8B39' },
  ],
  colors: {
    'editor.background': '#262335',
    'editor.foreground': '#FFFFFF',
    'editor.lineHighlightBackground': '#34294F',
    'editor.selectionBackground': '#463465',
    'editorCursor.foreground': '#FF00FF',
    'editorWhitespace.foreground': '#34294F',
    'editorIndentGuide.background': '#34294F',
    'editorIndentGuide.activeBackground': '#463465',
  }
}

/**
 * 主题管理器类
 */
export class ThemeManager {
  private static instance: ThemeManager
  private registeredThemes: Set<string> = new Set()
  private customThemes: Map<string, monaco.editor.IStandaloneThemeData> = new Map()

  private constructor() {
    this.registerPredefinedThemes()
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  /**
   * 注册预定义主题
   */
  private registerPredefinedThemes(): void {
    // 注册自定义主题
    this.registerTheme('github-light', GitHubLightTheme)
    this.registerTheme('github-dark', GitHubDarkTheme)
    this.registerTheme('monokai', MonokaiTheme)
    this.registerTheme('dracula', DraculaTheme)
    this.registerTheme('one-dark', OneDarkTheme)
    this.registerTheme('nord', NordTheme)
    this.registerTheme('material', MaterialTheme)
    this.registerTheme('tokyo-night', TokyoNightTheme)
    this.registerTheme('synthwave', SynthwaveTheme)
    
    // 可以添加更多主题变体
    this.registerTheme('material-darker', this.createMaterialVariant('darker'))
    this.registerTheme('material-palenight', this.createMaterialVariant('palenight'))
    this.registerTheme('one-light', this.createOneLightTheme())
    this.registerTheme('solarized-light', this.createSolarizedLightTheme())
    this.registerTheme('solarized-dark', this.createSolarizedDarkTheme())
    this.registerTheme('ayu-light', this.createAyuLightTheme())
    this.registerTheme('ayu-dark', this.createAyuDarkTheme())
  }

  /**
   * 注册主题
   */
  registerTheme(name: string, theme: monaco.editor.IStandaloneThemeData): void {
    if (!this.registeredThemes.has(name)) {
      monaco.editor.defineTheme(name, theme)
      this.registeredThemes.add(name)
      this.customThemes.set(name, theme)
    }
  }

  /**
   * 获取主题列表
   */
  getAvailableThemes(): string[] {
    return [
      'vs',
      'vs-dark',
      'hc-black',
      'hc-light',
      ...Array.from(this.registeredThemes)
    ]
  }

  /**
   * 获取主题显示名称
   */
  getThemeDisplayName(theme: string): string {
    return PREDEFINED_THEMES[theme as keyof typeof PREDEFINED_THEMES] || theme
  }

  /**
   * 应用主题
   */
  applyTheme(themeName: string): void {
    monaco.editor.setTheme(themeName)
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(
    name: string,
    config: Partial<monaco.editor.IStandaloneThemeData>
  ): void {
    const baseTheme = config.base || 'vs-dark'
    const theme: monaco.editor.IStandaloneThemeData = {
      base: baseTheme,
      inherit: config.inherit ?? true,
      rules: config.rules || [],
      colors: config.colors || {}
    }
    this.registerTheme(name, theme)
  }

  /**
   * 从 JSON 导入主题
   */
  importThemeFromJSON(name: string, json: string): void {
    try {
      const themeData = JSON.parse(json)
      this.createCustomTheme(name, themeData)
    } catch (error) {
      console.error('Failed to import theme:', error)
      throw new Error('Invalid theme JSON format')
    }
  }

  /**
   * 导出主题为 JSON
   */
  exportThemeToJSON(name: string): string | null {
    const theme = this.customThemes.get(name)
    if (theme) {
      return JSON.stringify(theme, null, 2)
    }
    return null
  }

  // 以下是主题变体创建方法

  private createMaterialVariant(variant: 'darker' | 'palenight'): monaco.editor.IStandaloneThemeData {
    const base = MaterialTheme
    const colors = { ...base.colors }
    
    if (variant === 'darker') {
      colors['editor.background'] = '#212121'
      colors['editor.lineHighlightBackground'] = '#00000060'
    } else if (variant === 'palenight') {
      colors['editor.background'] = '#292D3E'
      colors['editor.foreground'] = '#A6ACCD'
    }
    
    return {
      ...base,
      colors
    }
  }

  private createOneLightTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'A0A1A7' },
        { token: 'string', foreground: '50A14F' },
        { token: 'keyword', foreground: 'A626A4' },
        { token: 'number', foreground: '986801' },
        { token: 'type', foreground: 'E45649' },
        { token: 'class', foreground: 'C18401' },
        { token: 'function', foreground: '4078F2' },
        { token: 'variable', foreground: 'E45649' },
      ],
      colors: {
        'editor.background': '#FAFAFA',
        'editor.foreground': '#383A42',
        'editor.lineHighlightBackground': '#F2F2F2',
        'editor.selectionBackground': '#E5E5E6',
      }
    }
  }

  private createSolarizedLightTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '93A1A1' },
        { token: 'string', foreground: '2AA198' },
        { token: 'keyword', foreground: '859900' },
        { token: 'number', foreground: 'D33682' },
        { token: 'type', foreground: 'B58900' },
        { token: 'class', foreground: 'B58900' },
        { token: 'function', foreground: '268BD2' },
        { token: 'variable', foreground: '657B83' },
      ],
      colors: {
        'editor.background': '#FDF6E3',
        'editor.foreground': '#657B83',
        'editor.lineHighlightBackground': '#EEE8D5',
        'editor.selectionBackground': '#EEE8D5',
      }
    }
  }

  private createSolarizedDarkTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '586E75' },
        { token: 'string', foreground: '2AA198' },
        { token: 'keyword', foreground: '859900' },
        { token: 'number', foreground: 'D33682' },
        { token: 'type', foreground: 'B58900' },
        { token: 'class', foreground: 'B58900' },
        { token: 'function', foreground: '268BD2' },
        { token: 'variable', foreground: '93A1A1' },
      ],
      colors: {
        'editor.background': '#002B36',
        'editor.foreground': '#839496',
        'editor.lineHighlightBackground': '#073642',
        'editor.selectionBackground': '#073642',
      }
    }
  }

  private createAyuLightTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '787B80' },
        { token: 'string', foreground: '86B300' },
        { token: 'keyword', foreground: 'FA8D3E' },
        { token: 'number', foreground: 'FF9940' },
        { token: 'type', foreground: '399EE6' },
        { token: 'class', foreground: 'E6B450' },
        { token: 'function', foreground: 'F2AE49' },
        { token: 'variable', foreground: '575F66' },
      ],
      colors: {
        'editor.background': '#FCFCFC',
        'editor.foreground': '#5C6166',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editor.selectionBackground': '#E0E0E0',
      }
    }
  }

  private createAyuDarkTheme(): monaco.editor.IStandaloneThemeData {
    return {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5C6773' },
        { token: 'string', foreground: 'AAD94C' },
        { token: 'keyword', foreground: 'FF8F40' },
        { token: 'number', foreground: 'E6B450' },
        { token: 'type', foreground: '59C2FF' },
        { token: 'class', foreground: 'FFB454' },
        { token: 'function', foreground: 'FFD580' },
        { token: 'variable', foreground: 'CBCCC6' },
      ],
      colors: {
        'editor.background': '#0B0E14',
        'editor.foreground': '#BFBDB6',
        'editor.lineHighlightBackground': '#131721',
        'editor.selectionBackground': '#273747',
      }
    }
  }

  /**
   * 获取主题配色方案
   */
  getThemeColorScheme(themeName: string): 'light' | 'dark' {
    const lightThemes = ['vs', 'vs-light', 'github-light', 'one-light', 'solarized-light', 'ayu-light']
    return lightThemes.includes(themeName) ? 'light' : 'dark'
  }

  /**
   * 根据系统主题自动切换
   */
  applySystemTheme(): string {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = prefersDark ? 'one-dark' : 'github-light'
    this.applyTheme(theme)
    return theme
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (theme: string) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const theme = e.matches ? 'one-dark' : 'github-light'
      this.applyTheme(theme)
      callback(theme)
    }
    
    mediaQuery.addEventListener('change', handler)
    
    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()