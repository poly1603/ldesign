/**
 * Color 插件配置
 * 
 * 为应用配置颜色管理和主题系统
 */

import { createColorEnginePlugin } from '@ldesign/color'

export const colorPlugin = createColorEnginePlugin({
  // 主题配置
  themes: [
    {
      name: 'blue',
      displayName: '蓝色主题',
      light: {
        primary: '#1890ff',
        secondary: '#722ed1',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#177ddc',
        secondary: '#531dab',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    },
    {
      name: 'green',
      displayName: '绿色主题',
      light: {
        primary: '#52c41a',
        secondary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#389e0d',
        secondary: '#177ddc',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    },
    {
      name: 'purple',
      displayName: '紫色主题',
      light: {
        primary: '#722ed1',
        secondary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#531dab',
        secondary: '#177ddc',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    },
    {
      name: 'orange',
      displayName: '橙色主题',
      light: {
        primary: '#fa8c16',
        secondary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#d46b08',
        secondary: '#177ddc',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    },
    {
      name: 'red',
      displayName: '红色主题',
      light: {
        primary: '#ff4d4f',
        secondary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#cf1322',
        secondary: '#177ddc',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    },
    {
      name: 'cyan',
      displayName: '青色主题',
      light: {
        primary: '#13c2c2',
        secondary: '#722ed1',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        border: '#d9d9d9'
      },
      dark: {
        primary: '#08979c',
        secondary: '#531dab',
        success: '#389e0d',
        warning: '#d48806',
        danger: '#cf1322',
        background: '#141414',
        surface: '#1f1f1f',
        text: '#ffffff',
        border: '#434343'
      }
    }
  ],
  
  // 默认配置
  defaultTheme: 'blue',
  defaultMode: 'light',
  
  // 组件配置
  components: {
    registerGlobally: true,
    prefix: 'LColor'
  },
  
  // 功能配置
  features: {
    enableThemeManager: true,
    enableColorPicker: true,
    enablePaletteGenerator: true,
    enableAccessibilityChecker: true,
    enableThemeComponents: true,
    enableAutoDetectSystemTheme: true
  },
  
  // 性能配置
  performance: {
    enableCache: true,
    cacheSize: 100,
    enableIdleProcessing: true
  },
  
  // CSS 变量配置
  cssVariables: {
    prefix: '--color',
    scope: ':root',
    enableTransition: true,
    transitionDuration: '0.3s'
  },
  
  // 开发配置
  development: {
    enableDebugMode: true,
    enablePerformanceMonitoring: true
  }
})
