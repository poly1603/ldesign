import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

// 环境变量控制是否启用优化
const isDev = process.env.NODE_ENV !== 'production'
const skipDts = process.env.SKIP_DTS === 'true'

export default defineConfig({
  // 明确的入口点配置，避免打包每个.ts文件
  entry: {
    // 主入口
    'index': 'src/index.ts',
    // CLI入口
    'cli/index': 'src/cli/index.ts',
    // 核心模块统一导出
    'core/index': 'src/core/index.ts',
    // CLI命令统一导出
    'cli/commands/index': 'src/cli/commands/index.ts',
    // 工具类统一导出
    'utils/index': 'src/utils/index.ts',
    // 类型定义统一导出
    'types/index': 'src/types/index.ts',
    // 常量统一导出
    'constants/index': 'src/constants/index.ts',
    // AI优化器（独立模块）
    'ai/optimizer': 'src/ai/optimizer.ts',
    // 基准测试报告器（独立模块）
    'benchmark/reporter': 'src/benchmark/reporter.ts',
    // 仪表板服务器（独立模块）
    'dashboard/server': 'src/dashboard/server.ts',
    // 插件预设（独立模块）
    'plugins/presets': 'src/plugins/presets.ts',
    // 市场管理（独立模块）
    'marketplace/index': 'src/marketplace/index.ts',
    // Vite优化器（独立模块）
    'plugins/vite-optimizer': 'src/plugins/vite-optimizer.ts'
  },
  format: ['cjs', 'esm'],
  dts: !skipDts, // 支持跳过类型声明生成以加快开发构建
  tsconfig: 'tsconfig.json',
  clean: !isDev, // 开发模式不清理以支持增量构建
  splitting: true, // 启用代码分割以减少重复代码
  sourcemap: isDev ? 'inline' : false, // 开发模式内联sourcemap，生产模式不生成
  minify: !isDev, // 只在生产模式压缩
  target: 'node16',
  outDir: 'dist',
  shims: true,
  // 将运行时依赖全部 external，减小产物体积
  external: [
    'vite',
    '@vitejs/plugin-vue',
    '@vitejs/plugin-vue2',
    '@vitejs/plugin-react',
    '@vitejs/plugin-legacy',
    '@sveltejs/vite-plugin-svelte',
    'cac',
    'chalk',
    'cli-progress',
    'commander',
    'fast-glob',
    'figlet',
    'fs-extra',
    'glob',
    'jiti',
    'node-fetch',
    'ora',
    'picocolors',
    'ws',
    'inquirer',
    'json5',
    'archiver',
    'yauzl',
    'tar',
    'svg2ttf',
    'svgicons2svgfont',
    'ttf2eot',
    'ttf2woff',
    'ttf2woff2',
    'open',
    // 测试相关依赖
    'vitest',
    '@vitest/ui',
    'jsdom',
    'happy-dom',
    '@testing-library/dom',
    '@testing-library/react',
    '@testing-library/vue',
    // Node.js 内置模块
    'fs',
    'path',
    'url',
    'util',
    'os',
    'crypto',
    'events',
    'stream',
    'http',
    'https',
    'child_process',
    // Optional Vue template engines - mark as external to avoid build errors
    'velocityjs',
    'dustjs-linkedin',
    'atpl',
    'liquor',
    'twig',
    'ejs',
    'eco',
    'jazz',
    'jqtpl',
    'hamljs',
    'hamlet',
    'whiskers',
    'haml-coffee',
    'hogan.js',
    'templayed',
    'handlebars',
    'underscore',
    'walrus',
    'mustache',
    'just',
    'ect',
    'mote',
    'toffee',
    'dot',
    'bracket-template',
    'ractive',
    'htmling',
    'babel-core',
    'plates',
    'vash',
    'slm',
    'marko',
    'teacup/lib/express',
    'coffee-script',
    'squirrelly',
    'twing'
  ],
  treeshake: true,
  // 优化内存使用，但不过度bundle大文件
  bundle: true,
  esbuildOptions(options) {
    options.conditions = ['node']
    options.chunkNames = 'chunks/[name]-[hash]'
    options.logLevel = isDev ? 'warning' : 'error' // 开发模式显示警告
    // 优化打包策略
    options.treeShaking = true
    // 避免过大的bundle，设置分割阈值
    options.mangleProps = undefined // 不混淆属性名以保证兼容性
    options.keepNames = isDev // 开发模式保持函数名以便调试
    // 减少不必要的警告
    options.ignoreAnnotations = false
    options.legalComments = 'none' // 不包含法律注释以减少输出
    // 优化解析性能
    options.resolveExtensions = ['.ts', '.js', '.mjs', '.json']
    // 平台特定优化
    options.platform = 'node'
  },
  // 使用 tsup 的 noDefaultExport 选项来避免混合导出警告
  noDefaultExport: false,
  // 减少控制台输出
  silent: false,
  // 优化构建性能
  skipNodeModulesBundle: true,
  // 启用并发构建（生产模式）
  ...(isDev ? {} : {
    // 生产模式启用额外优化
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true
  }),
  // 监听模式配置（开发时）
  watch: isDev ? {
    // 忽略不必要的文件以提升性能
    ignore: ['**/__tests__/**', '**/*.test.ts', '**/node_modules/**', '**/dist/**']
  } : false,
  // onSuccess 钩子用于构建后操作
  onSuccess: isDev ? undefined : 'echo "✅ Build completed successfully!"'
} as Options)
