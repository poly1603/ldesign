/**
 * 默认配置常量
 * 
 * 定义 ViteLauncher 的默认配置值
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ViteLauncherConfig, LauncherOptions } from '../types'

/**
 * 默认端口号
 */
export const DEFAULT_PORT = 3000

/**
 * 默认主机地址
 */
export const DEFAULT_HOST = 'localhost'

/**
 * 默认日志级别
 */
export const DEFAULT_LOG_LEVEL = 'info'

/**
 * 默认运行模式
 */
export const DEFAULT_MODE = 'development'

/**
 * 默认输出目录
 */
export const DEFAULT_OUT_DIR = 'dist'

/**
 * 默认构建目标
 */
export const DEFAULT_BUILD_TARGET = 'es2015'

/**
 * 默认配置文件名列表
 * 按优先级排序，优先级从高到低
 * launcher.config.* 文件优先于 vite.config.* 文件
 */
/**
 * LDesign 专用配置目录
 */
export const LDESIGN_DIR = '.ldesign'

/**
 * 默认配置文件名列表
 * 优先支持 .ldesign 目录下的 launcher.config.*，再回退到项目根
 */
export const DEFAULT_CONFIG_FILES = [
  // .ldesign 专用
  `${LDESIGN_DIR}/launcher.config.ts`,
  `${LDESIGN_DIR}/launcher.config.mjs`,
  `${LDESIGN_DIR}/launcher.config.js`,
  `${LDESIGN_DIR}/launcher.config.cjs`,
  // 项目根目录
  'launcher.config.ts',
  'launcher.config.mjs',
  'launcher.config.js',
  'launcher.config.cjs',
  // 兼容 vite 配置文件
  'vite.config.ts',
  'vite.config.mjs',
  'vite.config.js',
  'vite.config.cjs'
] as const

/**
 * 支持的环境名称
 */
export const SUPPORTED_ENVIRONMENT_NAMES = [
  'development',
  'production',
  'test',
  'staging',
  'preview'
] as const

/**
 * 生成环境特定配置文件名列表
 *
 * @param environment - 环境名称
 * @returns 环境特定配置文件名列表
 */
export function getEnvironmentConfigFiles(environment?: string): readonly string[] {
  if (!environment || !SUPPORTED_ENVIRONMENT_NAMES.includes(environment as any)) {
    return DEFAULT_CONFIG_FILES
  }

  const envConfigFiles = [
    // .ldesign 专用环境配置 - 新命名规则：launcher.config.xx.ts
    `${LDESIGN_DIR}/launcher.config.${environment}.ts`,
    `${LDESIGN_DIR}/launcher.config.${environment}.mjs`,
    `${LDESIGN_DIR}/launcher.config.${environment}.js`,
    `${LDESIGN_DIR}/launcher.config.${environment}.cjs`,
    // 项目根目录环境配置 - 新命名规则
    `launcher.config.${environment}.ts`,
    `launcher.config.${environment}.mjs`,
    `launcher.config.${environment}.js`,
    `launcher.config.${environment}.cjs`,
    // 兼容旧命名规则 - 向后兼容
    `${LDESIGN_DIR}/launcher.${environment}.config.ts`,
    `${LDESIGN_DIR}/launcher.${environment}.config.mjs`,
    `${LDESIGN_DIR}/launcher.${environment}.config.js`,
    `${LDESIGN_DIR}/launcher.${environment}.config.cjs`,
    `launcher.${environment}.config.ts`,
    `launcher.${environment}.config.mjs`,
    `launcher.${environment}.config.js`,
    `launcher.${environment}.config.cjs`,
    // 基础配置文件作为回退
    ...DEFAULT_CONFIG_FILES
  ] as const

  return envConfigFiles
}

/**
 * 默认的应用配置文件名列表（用于注入 import.meta.env.appConfig）
 */
export const DEFAULT_APP_CONFIG_FILES = [
  `${LDESIGN_DIR}/app.config.ts`,
  `${LDESIGN_DIR}/app.config.mjs`,
  `${LDESIGN_DIR}/app.config.js`,
  `${LDESIGN_DIR}/app.config.cjs`,
  `${LDESIGN_DIR}/app.config.json`
] as const

/**
 * 获取环境特定的应用配置文件列表
 *
 * @param environment - 环境名称
 * @returns 应用配置文件列表
 */
export function getEnvironmentAppConfigFiles(environment?: string): string[] {
  if (!environment) {
    return [...DEFAULT_APP_CONFIG_FILES]
  }

  // 环境特定的配置文件（优先级更高）
  const envAppConfigFiles = SUPPORTED_CONFIG_EXTENSIONS.map(ext =>
    `${LDESIGN_DIR}/app.config.${environment}${ext}`
  )

  // 返回环境特定配置文件 + 默认配置文件（作为回退）
  return [...envAppConfigFiles, ...DEFAULT_APP_CONFIG_FILES]
}

/**
 * 支持的配置文件扩展名
 */
export const SUPPORTED_CONFIG_EXTENSIONS = [
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.json'
] as const

/**
 * 默认的 Launcher 选项
 */
export const DEFAULT_LAUNCHER_OPTIONS: Required<LauncherOptions> = {
  config: {} as ViteLauncherConfig, // 避免循环依赖
  cwd: process.cwd(),
  debug: false,
  autoRestart: false, // 默认关闭自动重启，避免不必要的文件监听
  environment: 'development',
  listeners: {}
}

/**
 * 默认的 ViteLauncher 配置
 */
export const DEFAULT_VITE_LAUNCHER_CONFIG: ViteLauncherConfig = {
  launcher: {
    autoRestart: false, // 默认关闭自动重启，避免不必要的文件监听
    hooks: {}
  },
  root: process.cwd(),
  mode: DEFAULT_MODE,
  logLevel: DEFAULT_LOG_LEVEL,
  clearScreen: true,
  server: {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    open: false,
    cors: true
  },
  build: {
    outDir: DEFAULT_OUT_DIR,
    sourcemap: false,
    minify: true,
    emptyOutDir: true,
    target: DEFAULT_BUILD_TARGET,
    reportCompressedSize: true
  },
  preview: {
    host: DEFAULT_HOST,
    port: 4173,
    open: false,
    cors: true
  }
}

/**
 * 环境变量前缀
 */
export const ENV_PREFIX = 'VITE_'

/**
 * Launcher 环境变量前缀
 */
export const LAUNCHER_ENV_PREFIX = 'LAUNCHER_'

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_EXTENSIONS = [
  '.vue',
  '.jsx',
  '.tsx',
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.styl',
  '.stylus',
  '.json',
  '.html',
  '.htm'
] as const

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_FORMATS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.avif',
  '.ico',
  '.bmp',
  '.tiff'
] as const

/**
 * 支持的字体格式
 */
export const SUPPORTED_FONT_FORMATS = [
  '.woff',
  '.woff2',
  '.eot',
  '.ttf',
  '.otf'
] as const

/**
 * 默认的资源内联阈值（字节）
 */
export const DEFAULT_ASSET_INLINE_LIMIT = 4096

/**
 * 默认的代码块大小警告阈值（字节）
 */
export const DEFAULT_CHUNK_SIZE_WARNING_LIMIT = 500 * 1024

/**
 * 默认的构建超时时间（毫秒）
 */
export const DEFAULT_BUILD_TIMEOUT = 5 * 60 * 1000 // 5 minutes

/**
 * 默认的服务器启动超时时间（毫秒）
 */
export const DEFAULT_SERVER_TIMEOUT = 30 * 1000 // 30 seconds

/**
 * 默认的热更新延迟时间（毫秒）
 */
export const DEFAULT_HMR_DELAY = 50

/**
 * 默认的文件监听防抖时间（毫秒）
 */
export const DEFAULT_WATCH_DEBOUNCE = 100

/**
 * 支持的包管理器
 */
export const SUPPORTED_PACKAGE_MANAGERS = [
  'npm',
  'yarn',
  'pnpm',
  'bun'
] as const

/**
 * 默认的插件优先级
 */
export const DEFAULT_PLUGIN_PRIORITY = 100

/**
 * 最大插件数量限制
 */
export const MAX_PLUGIN_COUNT = 50

/**
 * 默认的缓存目录
 */
export const DEFAULT_CACHE_DIR = 'node_modules/.vite'

/**
 * 默认的临时目录
 */
export const DEFAULT_TEMP_DIR = 'node_modules/.tmp'

/**
 * 默认的日志文件名
 */
export const DEFAULT_LOG_FILE = 'launcher.log'

/**
 * 最大日志文件大小（字节）
 */
export const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * 默认的性能监控间隔（毫秒）
 */
export const DEFAULT_PERFORMANCE_MONITOR_INTERVAL = 1000

/**
 * 默认的内存使用警告阈值（字节）
 */
export const DEFAULT_MEMORY_WARNING_THRESHOLD = 512 * 1024 * 1024 // 512MB

/**
 * 默认的 CPU 使用警告阈值（百分比）
 */
export const DEFAULT_CPU_WARNING_THRESHOLD = 80

/**
 * 支持的压缩算法
 */
export const SUPPORTED_COMPRESSION_ALGORITHMS = [
  'gzip',
  'deflate',
  'br'
] as const

/**
 * 默认的压缩级别
 */
export const DEFAULT_COMPRESSION_LEVEL = 6

/**
 * 默认的压缩阈值（字节）
 */
export const DEFAULT_COMPRESSION_THRESHOLD = 1024

/**
 * HTTP 状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

/**
 * MIME 类型常量
 */
export const MIME_TYPES = {
  HTML: 'text/html',
  CSS: 'text/css',
  JS: 'application/javascript',
  JSON: 'application/json',
  XML: 'application/xml',
  PNG: 'image/png',
  JPG: 'image/jpeg',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  WOFF: 'font/woff',
  WOFF2: 'font/woff2',
  TTF: 'font/ttf',
  EOT: 'application/vnd.ms-fontobject'
} as const

/**
 * 正则表达式常量
 */
export const REGEX_PATTERNS = {
  /** 匹配版本号 */
  VERSION: /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+)?$/,
  /** 匹配端口号 */
  PORT: /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
  /** 匹配 IP 地址 */
  IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  /** 匹配域名 */
  DOMAIN: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  /** 匹配 URL */
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  /** 匹配文件路径 */
  FILE_PATH: /^[^<>:"|?*\x00-\x1f]+$/,
  /** 匹配环境变量名 */
  ENV_VAR: /^[A-Z_][A-Z0-9_]*$/
} as const
