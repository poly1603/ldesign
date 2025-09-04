/**
 * Vite 配置管理器
 * @module ViteConfigManager
 * @description 提供 Vite 构建器的高级配置管理功能
 */

import type { InlineConfig, UserConfig } from 'vite'
import { ConfigManager } from '../../common/ConfigManager'
import type { ViteBuilderConfig } from '../../types'

/**
 * Vite 配置管理器
 * @class ViteConfigManager
 * @extends ConfigManager<ViteBuilderConfig>
 */
export class ViteConfigManager extends ConfigManager<ViteBuilderConfig> {
  /**
   * 默认配置
   */
  protected static defaultConfig: Partial<ViteBuilderConfig> = {
    root: process.cwd(),
    env: 'production',
    entry: 'index.html',  // Vite 默认使用 HTML 作为入口
    outDir: 'dist',
    assetsDir: 'assets',
    base: '/',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
    cleanOutDir: true,
    logLevel: 'info',
    clearScreen: true,
    // 开发服务器默认配置
    server: {
      port: 3000,
      host: true,
      open: false,
      https: false,
      cors: true,
      hmr: true,
      strictPort: false
    },
    // 预览服务器默认配置
    preview: {
      port: 4173,
      host: true,
      open: false,
      https: false,
      strictPort: false
    },
    // CSS 默认配置
    css: {
      extract: true,
      modules: false,
      sourceMap: true
    },
    // 构建优化默认配置
    optimization: {
      treeshake: true,
      sideEffects: true,
      usedExports: true,
      concatenateModules: true,
      splitChunks: true,
      runtimeChunk: false,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic'
    },
    // 依赖优化配置
    optimizeDeps: {
      include: [],
      exclude: [],
      force: false
    }
  }

  constructor(config: ViteBuilderConfig) {
    super(config, {
      defaults: ViteConfigManager.defaultConfig,
      validationRules: ViteConfigManager.createValidationRules(),
      transformers: ViteConfigManager.createTransformers(),
      required: ['root']
    })
  }

  /**
   * 创建验证规则
   */
  protected static createValidationRules() {
    return [
      {
        field: 'server.port',
        validator: (value: any) => {
          if (typeof value !== 'number') return '端口必须是数字'
          if (value < 0 || value > 65535) return '端口必须在 0-65535 之间'
          return true
        }
      },
      {
        field: 'preview.port',
        validator: (value: any) => {
          if (typeof value !== 'number') return '端口必须是数字'
          if (value < 0 || value > 65535) return '端口必须在 0-65535 之间'
          return true
        }
      },
      {
        field: 'target',
        validator: (value: any) => {
          const validTargets = ['es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'esnext']
          if (typeof value === 'string') {
            return validTargets.includes(value) || '无效的目标版本'
          }
          if (Array.isArray(value)) {
            return value.every(t => validTargets.includes(t)) || '无效的目标版本'
          }
          return '目标必须是字符串或字符串数组'
        }
      },
      {
        field: 'minify',
        validator: (value: any) => {
          const validValues = [true, false, 'terser', 'esbuild']
          return validValues.includes(value) || '无效的压缩选项'
        }
      },
      {
        field: 'logLevel',
        validator: (value: any) => {
          const validLevels = ['error', 'warn', 'info', 'silent']
          return validLevels.includes(value) || '无效的日志级别'
        }
      }
    ]
  }

  /**
   * 创建转换器
   */
  protected static createTransformers() {
    return [
      {
        field: 'base',
        transformer: (value: string) => {
          // 确保 base 以 / 开头和结尾
          if (!value) return '/'
          let base = value
          if (!base.startsWith('/')) base = '/' + base
          if (!base.endsWith('/')) base = base + '/'
          return base
        }
      },
      {
        field: 'outDir',
        transformer: (value: string, config: any) => {
          // 确保输出目录是相对路径
          if (!value) return 'dist'
          if (value.startsWith('/')) {
            return value.substring(1)
          }
          return value
        }
      },
      {
        field: 'server.host',
        transformer: (value: any) => {
          // 转换 host 配置
          if (value === true) return '0.0.0.0'
          if (value === false) return 'localhost'
          return value || 'localhost'
        }
      }
    ]
  }

  /**
   * 生成 Vite 内联配置
   */
  generateViteConfig(mode: 'development' | 'production' | 'preview' = 'production'): InlineConfig {
    const config = this.getConfig()
    const isDev = mode === 'development'
    const isPreview = mode === 'preview'

    const viteConfig: InlineConfig = {
      root: config.root,
      base: config.base,
      mode: this.getViteMode(),
      publicDir: config.publicDir || 'public',
      cacheDir: config.cacheDir || 'node_modules/.vite',
      envDir: config.envDir || '.',
      envPrefix: config.envPrefix || 'VITE_',
      logLevel: config.logLevel,
      clearScreen: config.clearScreen,
      define: this.processDefine(config),
      plugins: config.plugins || [],
      resolve: {
        alias: config.alias,
        dedupe: config.resolve?.dedupe,
        conditions: config.resolve?.conditions,
        mainFields: config.resolve?.mainFields,
        extensions: config.resolve?.extensions || ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
        preserveSymlinks: config.resolve?.preserveSymlinks
      },
      css: this.processCssConfig(config),
      json: {
        namedExports: true,
        stringify: false
      },
      esbuild: config.esbuild || {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        target: config.target as string || 'es2015'
      },
      assetsInclude: config.assetsInclude,
      optimizeDeps: config.optimizeDeps,
      ...config.viteConfig
    }

    // 开发服务器配置
    if (isDev) {
      viteConfig.server = this.processServerConfig(config.server)
    }

    // 预览服务器配置
    if (isPreview) {
      viteConfig.preview = this.processPreviewConfig(config.preview)
    }

    // 构建配置
    if (!isDev && !isPreview) {
      viteConfig.build = this.processBuildConfig(config)
    }

    // SSR 配置
    if (config.ssr) {
      viteConfig.ssr = this.processSSRConfig(config.ssr)
    }

    // Worker 配置
    if (config.worker) {
      viteConfig.worker = config.worker
    }

    return viteConfig
  }

  /**
   * 处理 define 配置
   */
  protected processDefine(config: ViteBuilderConfig): Record<string, any> {
    const define: Record<string, any> = {
      ...config.define
    }

    // 添加环境变量
    if (config.env) {
      define['process.env.NODE_ENV'] = JSON.stringify(config.env)
    }

    // 添加构建时间戳
    define['__BUILD_TIME__'] = JSON.stringify(new Date().toISOString())
    
    // 添加版本信息
    if (config.version) {
      define['__VERSION__'] = JSON.stringify(config.version)
    }

    // 添加特性标志
    if (config.features) {
      Object.entries(config.features).forEach(([key, value]) => {
        define[`__FEATURE_${key.toUpperCase()}__`] = JSON.stringify(value)
      })
    }

    return define
  }

  /**
   * 处理 CSS 配置
   */
  protected processCssConfig(config: ViteBuilderConfig): any {
    return {
      modules: config.css?.modules || false,
      postcss: config.css?.postcss,
      preprocessorOptions: config.css?.preprocessorOptions,
      devSourcemap: config.env === 'development' && config.css?.sourceMap
    }
  }

  /**
   * 处理服务器配置
   */
  protected processServerConfig(server?: ViteBuilderConfig['server']): any {
    if (!server) return {}

    return {
      host: server.host,
      port: server.port,
      strictPort: server.strictPort,
      https: server.https,
      open: server.open,
      proxy: server.proxy,
      cors: server.cors,
      headers: server.headers,
      hmr: server.hmr,
      watch: server.watch,
      middlewareMode: server.middlewareMode,
      fs: server.fs || {
        strict: true,
        allow: ['.'],
        deny: ['.env', '.env.*', '*.pem']
      },
      origin: server.origin
    }
  }

  /**
   * 处理预览服务器配置
   */
  protected processPreviewConfig(preview?: ViteBuilderConfig['preview']): any {
    if (!preview) return {}

    return {
      host: preview.host,
      port: preview.port,
      strictPort: preview.strictPort,
      https: preview.https,
      open: preview.open,
      proxy: preview.proxy,
      cors: preview.cors,
      headers: preview.headers
    }
  }

  /**
   * 处理构建配置
   */
  protected processBuildConfig(config: ViteBuilderConfig): any {
    const buildConfig: any = {
      target: config.target,
      outDir: config.outDir,
      assetsDir: config.assetsDir,
      assetsInlineLimit: config.build?.assetsInlineLimit || 4096,
      cssCodeSplit: config.build?.cssCodeSplit ?? true,
      cssTarget: config.build?.cssTarget || config.target,
      sourcemap: config.sourcemap,
      rollupOptions: {
        external: config.external,
        output: this.processOutputConfig(config),
        input: this.resolveInput(config),
        ...config.build?.rollupOptions
      },
      minify: config.minify,
      terserOptions: config.build?.terserOptions,
      write: config.build?.write ?? true,
      emptyOutDir: config.cleanOutDir,
      manifest: config.build?.manifest ?? false,
      ssrManifest: config.build?.ssrManifest ?? false,
      reportCompressedSize: config.build?.reportCompressedSize ?? true,
      chunkSizeWarningLimit: config.build?.chunkSizeWarningLimit || 500,
      watch: config.build?.watch || null
    }

    // 库模式配置
    if (config.lib) {
      buildConfig.lib = {
        entry: config.lib.entry,
        name: config.lib.name,
        formats: config.lib.formats || ['es', 'cjs'],
        fileName: config.lib.fileName || ((format) => {
          const ext = format === 'es' ? 'js' : format
          return `index.${ext}`
        })
      }
    }

    // CommonJS 选项
    if (config.build?.commonjsOptions) {
      buildConfig.commonjsOptions = config.build.commonjsOptions
    }

    // 动态导入 polyfill
    if (config.build?.dynamicImportVarsOptions) {
      buildConfig.dynamicImportVarsOptions = config.build.dynamicImportVarsOptions
    }

    // 模块预加载
    if (config.build?.modulePreload !== undefined) {
      buildConfig.modulePreload = config.build.modulePreload
    }

    return buildConfig
  }

  /**
   * 处理输出配置
   */
  protected processOutputConfig(config: ViteBuilderConfig): any {
    return {
      format: config.output?.format || 'es',
      exports: config.output?.exports || 'auto',
      preserveModules: config.output?.preserveModules,
      preserveModulesRoot: config.output?.preserveModulesRoot,
      entryFileNames: config.output?.entryFileNames || '[name].[hash].js',
      chunkFileNames: config.output?.chunkFileNames || 'chunks/[name].[hash].js',
      assetFileNames: config.output?.assetFileNames || 'assets/[name].[hash][extname]',
      manualChunks: this.processManualChunks(config.output?.manualChunks),
      inlineDynamicImports: config.output?.inlineDynamicImports,
      ...config.output
    }
  }

  /**
   * 处理手动分块配置
   */
  protected processManualChunks(manualChunks?: any): any {
    if (!manualChunks) return undefined
    
    // 如果是函数，直接返回
    if (typeof manualChunks === 'function') {
      return manualChunks
    }

    // 如果是对象，转换为函数
    if (typeof manualChunks === 'object') {
      return (id: string) => {
        for (const [chunk, modules] of Object.entries(manualChunks)) {
          if (Array.isArray(modules)) {
            if (modules.some(module => id.includes(module))) {
              return chunk
            }
          }
        }
      }
    }

    return manualChunks
  }

  /**
   * 处理 SSR 配置
   */
  protected processSSRConfig(ssr: ViteBuilderConfig['ssr']): any {
    if (!ssr) return undefined

    return {
      external: ssr.external,
      noExternal: ssr.noExternal,
      target: ssr.target || 'node',
      format: ssr.format || 'cjs'
    }
  }

  /**
   * 解析入口配置
   */
  protected resolveInput(config: ViteBuilderConfig): any {
    // 库模式下使用 lib.entry
    if (config.lib?.entry) {
      return config.lib.entry
    }
    
    // 非库模式下，Vite 使用 HTML 文件作为入口
    if (config.entry) {
      // 如果是字符串且不是 HTML 文件，可能是库模式
      if (typeof config.entry === 'string') {
        // 如果不是 HTML 文件但未配置库模式，给出警告
        if (!config.entry.endsWith('.html') && !config.lib) {
          console.warn('⚠️  Vite 通常使用 HTML 文件作为入口，当前配置可能需要库模式')
        }
        return config.entry
      }
      // 多页面应用支持
      if (typeof config.entry === 'object') {
        return config.entry
      }
    }
    
    // 默认查找项目根目录下的 index.html
    return 'index.html'
  }

  /**
   * 获取 Vite 模式
   */
  protected getViteMode(): string {
    const envMap: Record<string, string> = {
      development: 'development',
      production: 'production',
      test: 'test'
    }
    
    return envMap[this.config.env || 'production'] || 'production'
  }

  /**
   * 应用预设配置
   */
  applyPreset(preset: Partial<ViteBuilderConfig>): void {
    this.merge(preset)
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const config = this.getConfig()

    // 检查常见优化配置
    if (!config.build?.rollupOptions?.output?.manualChunks) {
      suggestions.push('考虑配置 manualChunks 以优化代码分割')
    }

    if (config.env === 'production' && !config.minify) {
      suggestions.push('生产环境建议启用代码压缩 (minify)')
    }

    if (!config.build?.reportCompressedSize) {
      suggestions.push('建议启用 reportCompressedSize 以查看压缩后的大小')
    }

    if (!config.optimizeDeps?.include?.length) {
      suggestions.push('考虑预构建常用依赖以提高开发服务器启动速度')
    }

    if (config.build?.chunkSizeWarningLimit && config.build.chunkSizeWarningLimit > 1000) {
      suggestions.push('chunk 大小警告限制较高，可能会产生过大的包')
    }

    return suggestions
  }

  /**
   * 验证配置兼容性
   */
  validateCompatibility(): { valid: boolean; issues: string[] } {
    const issues: string[] = []
    const config = this.getConfig()

    // 检查端口冲突
    if (config.server?.port === config.preview?.port) {
      issues.push('开发服务器和预览服务器使用相同端口')
    }

    // 检查路径配置
    if (config.outDir === config.root) {
      issues.push('输出目录不应与项目根目录相同')
    }

    // 检查库模式配置
    if (config.lib && !config.lib.entry) {
      issues.push('库模式需要指定入口文件')
    }

    // 检查 SSR 配置
    if (config.ssr && !config.ssr.entry) {
      issues.push('SSR 模式需要指定入口文件')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * 导出为 Vite 配置文件内容
   */
  exportAsViteConfig(): string {
    const viteConfig = this.generateViteConfig()
    
    return `import { defineConfig } from 'vite'

export default defineConfig(${JSON.stringify(viteConfig, null, 2)})
`
  }
}
