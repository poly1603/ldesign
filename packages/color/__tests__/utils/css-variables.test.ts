/**
 * CSS 变量注入器测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  CSSVariableInjector, 
  createCSSVariableInjector,
  injectThemeVariables,
  globalCSSInjector 
} from '../../src/utils/css-variables'
import type { CSSVariableConfig, ColorVariableInfo } from '../../src/utils/css-variables'

describe('CSSVariableInjector', () => {
  let injector: CSSVariableInjector

  beforeEach(() => {
    // 模拟 DOM 环境
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    injector = new CSSVariableInjector()
  })

  afterEach(() => {
    injector.destroy()
  })

  it('应该正确创建注入器', () => {
    expect(injector).toBeDefined()
  })

  it('应该正确创建样式元素', () => {
    const styleElement = document.getElementById('ldesign-color-variables')
    expect(styleElement).toBeTruthy()
    expect(styleElement?.tagName).toBe('STYLE')
  })

  it('应该正确注入CSS变量', () => {
    const variables = {
      '--test-color': '#ff0000',
      '--test-size': '16px'
    }

    injector.injectVariables(variables)

    const styleElement = document.getElementById('ldesign-color-variables') as HTMLStyleElement
    expect(styleElement.textContent).toContain('--test-color: #ff0000')
    expect(styleElement.textContent).toContain('--test-size: 16px')
  })

  it('应该正确注入主题变量', () => {
    const lightVariables = {
      '--primary': '#1890ff',
      '--success': '#52c41a'
    }

    const darkVariables = {
      '--primary': '#177ddc',
      '--success': '#389e0d'
    }

    const themeInfo = {
      name: 'blue',
      displayName: '蓝色主题',
      description: '经典蓝色主题',
      primaryColor: '#1890ff',
      version: '1.0.0'
    }

    injector.injectThemeVariables(lightVariables, darkVariables, themeInfo)

    const styleElement = document.getElementById('ldesign-color-variables') as HTMLStyleElement
    const content = styleElement.textContent || ''
    
    expect(content).toContain('蓝色主题')
    expect(content).toContain('#1890ff')
    expect(content).toContain(':root')
    expect(content).toContain('[data-theme-mode="dark"]')
  })

  it('应该正确清除变量', () => {
    const variables = {
      '--test-color': '#ff0000'
    }

    injector.injectVariables(variables)
    injector.clearVariables()

    const styleElement = document.getElementById('ldesign-color-variables') as HTMLStyleElement
    expect(styleElement.textContent).toBe('')
  })

  it('应该正确销毁注入器', () => {
    injector.destroy()

    const styleElement = document.getElementById('ldesign-color-variables')
    expect(styleElement).toBeFalsy()
  })
})

describe('createCSSVariableInjector', () => {
  it('应该使用自定义配置创建注入器', () => {
    const config: Partial<CSSVariableConfig> = {
      prefix: 'custom',
      includeComments: false,
      backgroundStrategy: 'primary-based'
    }

    const injector = createCSSVariableInjector(config)
    expect(injector).toBeDefined()
    expect(injector.getConfig().prefix).toBe('custom')
    expect(injector.getConfig().includeComments).toBe(false)
    expect(injector.getConfig().backgroundStrategy).toBe('primary-based')

    injector.destroy()
  })

  it('应该正确生成背景色', () => {
    const config: Partial<CSSVariableConfig> = {
      prefix: 'test',
      backgroundStrategy: 'neutral'
    }

    const injector = createCSSVariableInjector(config)
    const backgrounds = injector.generateBackgroundColors('#1890ff', 'light')

    expect(backgrounds).toBeDefined()
    expect(backgrounds['--test-bg-primary']).toBe('#ffffff')
    expect(backgrounds['--test-bg-secondary']).toBe('#fafafa')

    injector.destroy()
  })

  it('应该正确生成基于主色的背景色', () => {
    const config: Partial<CSSVariableConfig> = {
      prefix: 'test',
      backgroundStrategy: 'primary-based',
      generateBackgroundFromPrimary: true
    }

    const injector = createCSSVariableInjector(config)
    const backgrounds = injector.generateBackgroundColors('#1890ff', 'light')

    expect(backgrounds).toBeDefined()
    expect(backgrounds['--test-bg-primary']).toContain('rgba')

    injector.destroy()
  })

  it('应该正确生成自定义背景色', () => {
    const config: Partial<CSSVariableConfig> = {
      prefix: 'test',
      backgroundStrategy: 'custom',
      customBackgroundColors: {
        light: ['#ffffff', '#f8f9fa'],
        dark: ['#1a1a1a', '#2d2d2d']
      }
    }

    const injector = createCSSVariableInjector(config)
    const lightBackgrounds = injector.generateBackgroundColors('#1890ff', 'light')
    const darkBackgrounds = injector.generateBackgroundColors('#1890ff', 'dark')

    expect(lightBackgrounds['--test-bg-1']).toBe('#ffffff')
    expect(lightBackgrounds['--test-bg-2']).toBe('#f8f9fa')
    expect(darkBackgrounds['--test-bg-1']).toBe('#1a1a1a')
    expect(darkBackgrounds['--test-bg-2']).toBe('#2d2d2d')

    injector.destroy()
  })
})

describe('injectThemeVariables', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    globalCSSInjector.destroy()
  })

  it('应该正确注入主题变量', () => {
    const colors = {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      danger: '#ff4d4f',
      gray: '#8c8c8c'
    }

    const scales = {
      primary: {
        indices: {
          '1': '#e6f7ff',
          '2': '#bae7ff',
          '3': '#91d5ff'
        }
      }
    }

    injectThemeVariables(colors, scales, undefined, 'light', '--test')

    const styleElement = document.getElementById('ldesign-color-variables') as HTMLStyleElement
    const content = styleElement.textContent || ''
    
    expect(content).toContain('--test-primary: #1890ff')
    expect(content).toContain('--test-success: #52c41a')
    expect(content).toContain('--test-primary-1: #e6f7ff')
  })

  it('应该正确处理自定义配置', () => {
    const colors = {
      primary: '#1890ff'
    }

    const config: Partial<CSSVariableConfig> = {
      prefix: 'custom',
      includeComments: true,
      backgroundStrategy: 'primary-based',
      generateBackgroundFromPrimary: true
    }

    injectThemeVariables(colors, {}, undefined, 'light', '--custom', config)

    const customInjector = createCSSVariableInjector(config)
    expect(customInjector.getConfig().prefix).toBe('custom')
    
    customInjector.destroy()
  })
})
