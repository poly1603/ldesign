/**
 * @fileoverview 启动器常量定义
 * @author ViteLauncher Team
 * @since 1.0.0
 */

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  /** 默认开发服务器端口 */
  DEV_PORT: 5173,
  /** 默认预览服务器端口 */
  PREVIEW_PORT: 4173,
  /** 默认构建输出目录 */
  OUTPUT_DIR: 'dist',
  /** 默认资源目录 */
  ASSETS_DIR: 'assets',
  /** 默认源码目录 */
  SRC_DIR: 'src',
  /** 默认日志级别 */
  LOG_LEVEL: 'info' as const,
  /** 默认运行模式 */
  MODE: 'development' as const,
} as const

/**
 * 网络相关常量
 */
export const NETWORK_CONFIG = {
  /** 默认主机地址 */
  DEFAULT_HOST: 'localhost',
  /** 端口范围 */
  PORT_RANGE: {
    MIN: 3000,
    MAX: 9999,
  },
  /** 超时配置 */
  TIMEOUT: {
    /** 服务器启动超时 (ms) */
    SERVER_START: 30000,
    /** 构建超时 (ms) */
    BUILD: 300000,
    /** 依赖安装超时 (ms) */
    INSTALL: 180000,
  },
} as const

/**
 * 文件路径常量
 */
export const FILE_PATHS = {
  /** 配置文件名 */
  CONFIG_FILES: [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mjs',
    'vite.config.cjs',
  ] as const,
  /** 包管理器配置文件 */
  PACKAGE_FILES: [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
  ] as const,
  /** TypeScript 配置文件 */
  TS_CONFIG_FILES: [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
  ] as const,
} as const

/**
 * 框架检测模式
 */
export const FRAMEWORK_PATTERNS = {
  vue3: {
    dependencies: ['vue'],
    devDependencies: ['@vitejs/plugin-vue'],
    files: ['*.vue'],
    confidence: 0.9,
  },
  vue2: {
    dependencies: ['vue'],
    devDependencies: ['@vitejs/plugin-vue2'],
    files: ['*.vue'],
    confidence: 0.85,
  },
  react: {
    dependencies: ['react', 'react-dom'],
    devDependencies: ['@vitejs/plugin-react'],
    files: ['*.jsx', '*.tsx'],
    confidence: 0.9,
  },
  svelte: {
    dependencies: ['svelte'],
    devDependencies: ['@sveltejs/vite-plugin-svelte'],
    files: ['*.svelte'],
    confidence: 0.9,
  },
  lit: {
    dependencies: ['lit'],
    devDependencies: [],
    files: ['*.ts'],
    confidence: 0.7,
  },
  angular: {
    dependencies: ['@angular/core'],
    devDependencies: ['@angular/cli'],
    files: ['*.component.ts'],
    confidence: 0.9,
  },
} as const

/**
 * 构建目标常量
 */
export const BUILD_TARGETS = {
  /** ES 模块目标 */
  ES_MODULE: 'es2015',
  /** 现代浏览器目标 */
  MODERN: 'es2020',
  /** 兼容性目标 */
  LEGACY: 'es5',
} as const

/**
 * 文件扩展名常量
 */
export const FILE_EXTENSIONS = {
  /** JavaScript 文件扩展名 */
  JAVASCRIPT: ['.js', '.mjs', '.cjs'],
  /** TypeScript 文件扩展名 */
  TYPESCRIPT: ['.ts', '.tsx'],
  /** Vue 文件扩展名 */
  VUE: ['.vue'],
  /** React 文件扩展名 */
  REACT: ['.jsx', '.tsx'],
  /** 样式文件扩展名 */
  STYLES: ['.css', '.scss', '.sass', '.less', '.styl'],
  /** 资源文件扩展名 */
  ASSETS: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'],
} as const

/**
 * 模板常量
 */
export const TEMPLATES = {
  /** HTML 模板 */
  HTML: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.{{ext}}"></script>
  </body>
</html>`,
  
  /** Vite 配置模板 */
  VITE_CONFIG: `import { defineConfig } from 'vite'
{{plugins}}

export default defineConfig({
  plugins: [{{pluginList}}],
  server: {
    port: {{port}},
    open: true,
  },
  build: {
    outDir: '{{outDir}}',
    sourcemap: {{sourcemap}},
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
})`,
} as const

/**
 * 性能相关常量
 */
export const PERFORMANCE = {
  /** 文件大小限制 (bytes) */
  FILE_SIZE_LIMITS: {
    /** 单个源码文件大小限制 */
    SOURCE_FILE: 100 * 1024, // 100KB
    /** 资源文件大小限制 */
    ASSET_FILE: 1024 * 1024, // 1MB
    /** 构建输出文件大小限制 */
    BUILD_FILE: 2 * 1024 * 1024, // 2MB
  },
  /** 并发限制 */
  CONCURRENCY: {
    /** 最大并发文件操作数 */
    FILE_OPERATIONS: 10,
    /** 最大并发网络请求数 */
    NETWORK_REQUESTS: 5,
  },
} as const

/**
 * 调试相关常量
 */
export const DEBUG = {
  /** 调试标识符 */
  NAMESPACE: 'vite-launcher',
  /** 性能测量标识 */
  PERFORMANCE_MARK: 'vite-launcher-perf',
} as const