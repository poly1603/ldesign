/**
 * LDesign 应用配置文件
 *
 * 此文件包含应用的完整配置信息，包括 API、主题、功能特性、
 * 国际化、路由、构建、安全和日志等各个方面的配置。
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import type { AppConfig } from '../src/types/app-config'

/**
 * 获取环境变量，提供默认值
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue
}

/**
 * 判断是否为开发环境
 */
const isDev = process.env.NODE_ENV === 'development'

/**
 * 判断是否为生产环境
 */
const isProd = process.env.NODE_ENV === 'production'

/**
 * 应用配置
 */
const config: AppConfig = {
  // 基础信息
  appName: 'LDesign App - ⚡ 实时配置更新! [测试热更新]',
  version: '2.0.0',
  description: 'LDesign 设计系统演示应用 - 展示完整的组件库和工具集',
  author: 'LDesign Team',
  license: 'MIT',
  homepage: 'https://ldesign.github.io',
  repository: 'https://github.com/ldesign/ldesign',
  keywords: [
    'vue3',
    'typescript',
    'design-system',
    'component-library',
    'vite',
    'ldesign'
  ],

  // API 配置
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', isDev ? 'http://localhost:8080' : 'https://api.ldesign.com'),
    timeout: 10000,
    retry: true,
    retryCount: 3,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    cache: true,
    cacheTime: 5 * 60 * 1000 // 5分钟
  },

  // 主题配置
  theme: {
    primaryColor: '#722ED1',
    secondaryColor: '#52C41A',
    successColor: '#52C41A',
    warningColor: '#FAAD14',
    errorColor: '#F5222D',
    infoColor: '#1890FF',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    darkMode: false,
    cssVariables: {
      '--ldesign-primary-color': '#722ED1',
      '--ldesign-border-radius': '6px'
    }
  },

  // 功能特性配置
  features: {
    devTools: isDev,
    mock: isDev,
    hotReload: isDev,
    errorBoundary: true,
    performance: isProd,
    analytics: isProd,
    pwa: isProd,
    offline: false
  },

  // 国际化配置
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en-US', 'ja-JP'],
    autoDetect: true,
    fallbackLocale: 'zh-CN',
    loadStrategy: 'lazy'
  },

  // 路由配置
  router: {
    mode: 'history',
    base: '/',
    strict: false,
    sensitive: false,
    scrollBehavior: 'smooth'
  },

  // 构建配置
  build: {
    outDir: 'dist',
    minify: isProd,
    sourcemap: isDev,
    codeSplitting: true,
    treeShaking: true,
    bundleAnalyzer: false
  },

  // 安全配置
  security: {
    csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    https: isProd,
    cors: true,
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3011',
      'https://ldesign.github.io'
    ],
    xssProtection: true
  },

  // 日志配置
  log: {
    level: isDev ? 'debug' : 'warn',
    console: true,
    file: isProd,
    filePath: './logs/app.log',
    remote: isProd,
    remoteUrl: getEnv('VITE_LOG_REMOTE_URL', '')
  }
}

export default config
