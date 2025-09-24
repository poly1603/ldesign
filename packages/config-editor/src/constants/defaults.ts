/**
 * 默认配置常量
 * 
 * 定义项目中使用的默认配置值
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'
import type { ServerConfig } from '../types/server'

/**
 * 默认服务器配置
 */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3002,
  host: 'localhost',
  clientPort: 3001,
  cwd: '/workspace',
  cors: true,
  uploadLimit: '10mb',
  enableLogging: true
}

/**
 * 默认 Launcher 配置
 */
export const DEFAULT_LAUNCHER_CONFIG: LauncherConfig = {
  projectName: 'My Project',
  framework: 'vue',
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    https: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    emptyOutDir: true
  },
  resolve: {
    alias: {},
    extensions: ['.ts', '.js', '.vue', '.json']
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  launcher: {
    logLevel: 'info',
    mode: 'development',
    autoRestart: true,
    debug: false
  }
}

/**
 * 默认 App 配置
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'My App',
  version: '1.0.0',
  description: 'A new application built with LDesign',
  author: 'LDesign Team',
  license: 'MIT',
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retry: true,
    retryCount: 3,
    cache: true,
    cacheTime: 5 * 60 * 1000
  },
  theme: {
    primaryColor: '#722ED1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    darkMode: false
  },
  features: {
    devTools: true,
    mock: false,
    hotReload: true,
    errorBoundary: true,
    performance: false,
    analytics: false,
    pwa: false,
    offline: false
  },
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en', 'ja'],
    autoDetect: true,
    fallbackLocale: 'en',
    loadStrategy: 'lazy'
  },
  router: {
    mode: 'history',
    base: '/',
    strict: false,
    sensitive: false,
    scrollBehavior: 'auto'
  },
  build: {
    outDir: 'dist',
    publicPath: '/',
    sourcemap: true,
    minify: true,
    analyze: false
  },
  security: {
    csp: "default-src 'self'",
    https: false,
    hsts: false
  },
  log: {
    level: 'info',
    console: true,
    file: false
  }
}

/**
 * 默认 Package.json 配置
 */
export const DEFAULT_PACKAGE_CONFIG: PackageJsonConfig = {
  name: 'my-package',
  version: '1.0.0',
  description: 'A new package',
  main: './dist/index.js',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      import: './dist/index.js',
      require: './dist/index.cjs',
      types: './dist/index.d.ts'
    }
  },
  scripts: {
    build: 'tsup',
    dev: 'tsup --watch',
    test: 'vitest',
    'test:run': 'vitest run',
    lint: 'eslint src --ext .ts --fix',
    'type-check': 'tsc --noEmit'
  },
  keywords: [],
  author: 'LDesign Team',
  license: 'MIT',
  files: ['dist', 'README.md'],
  engines: {
    node: '>=18.0.0',
    pnpm: '>=8.0.0'
  },
  dependencies: {},
  devDependencies: {
    typescript: '^5.0.0',
    tsup: '^8.0.0',
    vitest: '^1.0.0',
    eslint: '^8.0.0'
  }
}

/**
 * 支持的配置文件名列表
 */
export const CONFIG_FILE_NAMES = {
  launcher: [
    'launcher.config.ts',
    'launcher.config.js',
    'launcher.config.mjs',
    'launcher.config.cjs',
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mjs',
    'vite.config.cjs'
  ],
  app: [
    'app.config.ts',
    'app.config.js',
    'app.config.mjs',
    'app.config.cjs'
  ],
  package: [
    'package.json'
  ]
} as const

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_EXTENSIONS = ['.ts', '.js', '.mjs', '.cjs', '.json'] as const

/**
 * 默认编码格式
 */
export const DEFAULT_ENCODING: BufferEncoding = 'utf8'

/**
 * 默认缩进
 */
export const DEFAULT_INDENT = 2

/**
 * 文件监听防抖延迟（毫秒）
 */
export const FILE_WATCH_DEBOUNCE_DELAY = 300

/**
 * API 路径前缀
 */
export const API_PREFIX = '/api'

/**
 * WebSocket 路径
 */
export const WEBSOCKET_PATH = '/ws'

/**
 * 上传文件大小限制
 */
export const UPLOAD_LIMIT = '10mb'

/**
 * 支持的主题色彩
 */
export const THEME_COLORS = [
  '#722ED1', // 紫色（默认）
  '#1677FF', // 蓝色
  '#00B96B', // 绿色
  '#FF7A00', // 橙色
  '#FF4D4F', // 红色
  '#722ED1', // 紫色
  '#13C2C2', // 青色
  '#52C41A', // 草绿色
  '#FAAD14', // 金色
  '#F759AB'  // 粉色
] as const

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'ru', label: 'Русский' }
] as const

/**
 * 框架选项
 */
export const FRAMEWORK_OPTIONS = [
  { value: 'vue', label: 'Vue 3', description: '渐进式 JavaScript 框架' },
  { value: 'react', label: 'React', description: '用于构建用户界面的 JavaScript 库' },
  { value: 'lit', label: 'Lit', description: '简单、快速的 Web Components' },
  { value: 'vanilla', label: 'Vanilla JS', description: '原生 JavaScript' }
] as const

/**
 * 构建目标选项
 */
export const BUILD_TARGET_OPTIONS = [
  { value: 'es2015', label: 'ES2015' },
  { value: 'es2017', label: 'ES2017' },
  { value: 'es2018', label: 'ES2018' },
  { value: 'es2019', label: 'ES2019' },
  { value: 'es2020', label: 'ES2020' },
  { value: 'es2021', label: 'ES2021' },
  { value: 'es2022', label: 'ES2022' },
  { value: 'esnext', label: 'ESNext' }
] as const
