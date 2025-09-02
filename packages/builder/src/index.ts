/**
 * LDesign Builder - 智能前端库打包工具
 * 主入口文件
 */

import { PluginConfigurator } from './core/plugin-configurator'
import { ProjectScanner } from './core/project-scanner'
import { RollupBuilder } from './core/rollup-builder'
import { TypeGenerator } from './core/type-generator'
import type { InitializationOptions } from './core/project-initializer'
// 核心类型定义
import { ErrorHandler, Logger } from './utils/logger'
import chalk from 'chalk'

// CLI 功能暂时移除，专注于编程式 API
// export { runCli } from './cli'
// export { AnalyzeCommand } from './cli/commands/analyze'
// export { BuildCommand } from './cli/commands/build'
// export { InitCommand } from './cli/commands/init'
// export { WatchCommand } from './cli/commands/watch'

export { PluginConfigurator } from './core/plugin-configurator'
// 核心模块
export { ProjectScanner } from './core/project-scanner'
export { RollupBuilder } from './core/rollup-builder'
export { TypeGenerator } from './core/type-generator'
export { BuildValidator } from './core/build-validator'
export { DependencyAnalyzer } from './core/dependency-analyzer'
export { BuildCache } from './core/build-cache'
export { FormatDetector } from './core/format-detector'
export { ProjectInitializer } from './core/project-initializer'
export * from './types'

// 工具函数
export {
  ArrayUtils,
  AsyncUtils,
  FileUtils,
  ObjectUtils,
  PathUtils,
  StringUtils,
} from './utils'

export {
  ErrorHandler,
  Logger,
  ProgressBar,
  Timer,
} from './utils/logger'

// 配置加载相关函数
export {
  loadUserConfig,
  resolveConfigFile,
  mergeConfig,
  validateConfig,
} from './utils/config-loader'

// 版本信息
import packageJson from '../package.json' assert { type: 'json' }
export const version: string = packageJson.version

/**
 * 定义配置
 */
export function defineConfig(config: import('./types').BuildOptions): import('./types').BuildOptions {
  return config
}

/**
 * 智能化增强配置选项
 */
async function enhanceOptions(options: import('./types').BuildOptions): Promise<import('./types').BuildOptions> {

  const root = options.root || process.cwd()

  // 智能处理入口文件
  let input = options.input
  if (!input) {
    input = await smartDetectInput(root)
  }

  // 智能处理输出格式
  const formats = options.formats || ['esm', 'cjs', 'umd']

  // 智能处理外部依赖
  const external = await smartDetectExternal(root, options.external)

  // 智能处理全局变量映射
  const globals = await smartDetectGlobals(root, external, options.globals)

  // 调试信息
  const { Logger } = await import('./utils')
  const logger = new Logger('SmartConfig')
  logger.info('原始 formats 配置:', options.formats)
  logger.info('智能增强后的 formats:', formats)
  logger.info('智能检测到的外部依赖:', external)
  logger.info('智能生成的全局变量映射:', globals)

  // 默认启用的选项
  const enhanced: import('./types').BuildOptions = {
    ...options,
    root,
    input,
    formats,
    external,
    globals,
    outDir: options.outDir || 'dist',
    dts: options.dts !== false, // 默认生成类型文件
    clean: options.clean !== false, // 默认清理
    minify: options.minify !== false, // 默认压缩
    sourcemap: options.sourcemap !== false, // 默认生成 sourcemap
    lib: options.lib !== false, // 默认库模式
  }

  return enhanced
}

/**
 * 智能检测入口文件
 */
async function smartDetectInput(root: string): Promise<string> {
  const { resolve } = await import('node:path')
  const { existsSync } = await import('node:fs')

  // 自动检测入口文件
  const possibleEntries = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'index.ts',
    'index.js'
  ]

  for (const entry of possibleEntries) {
    const entryPath = resolve(root, entry)
    if (existsSync(entryPath)) {
      return entryPath
    }
  }

  return 'src/index.ts' // 默认值
}

/**
 * 智能检测外部依赖
 */
async function smartDetectExternal(root: string, userExternal?: string[] | ((id: string) => boolean)): Promise<string[]> {
  const { resolve } = await import('node:path')
  const { existsSync, readFileSync } = await import('node:fs')

  const external: string[] = []

  // 1. 添加用户指定的外部依赖
  if (Array.isArray(userExternal)) {
    external.push(...userExternal)
  }

  // 2. 从 package.json 读取依赖
  const packageJsonPath = resolve(root, 'package.json')
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      // 添加 peerDependencies
      if (packageJson.peerDependencies) {
        external.push(...Object.keys(packageJson.peerDependencies))
      }

      // 添加 dependencies 中的框架依赖和 @ldesign/* 包
      if (packageJson.dependencies) {
        const frameworkDeps = Object.keys(packageJson.dependencies).filter(dep =>
          isFrameworkDependency(dep)
        )
        external.push(...frameworkDeps)
      }
    } catch (error) {
      // 忽略 package.json 解析错误
    }
  }

  // 3. 自动添加 @ldesign/* 系列包
  external.push('@ldesign/cache', '@ldesign/device', '@ldesign/engine', '@ldesign/shared')

  // 4. 添加常见的框架依赖
  const commonFrameworks = [
    'vue', 'react', 'react-dom', 'angular', 'svelte',
    '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity', '@vue/shared',
    '@vueuse/core', '@vueuse/shared'
  ]
  external.push(...commonFrameworks)

  // 去重并返回
  return [...new Set(external)]
}

/**
 * 智能检测全局变量映射
 */
async function smartDetectGlobals(_root: string, external: string[], userGlobals?: Record<string, string>): Promise<Record<string, string>> {
  const globals: Record<string, string> = {}

  // 1. 添加用户指定的全局变量映射
  if (userGlobals) {
    Object.assign(globals, userGlobals)
  }

  // 2. 为外部依赖生成默认的全局变量映射
  for (const dep of external) {
    if (!globals[dep]) {
      globals[dep] = getDefaultGlobalName(dep)
    }
  }

  return globals
}

/**
 * 判断是否为框架依赖
 */
function isFrameworkDependency(dep: string): boolean {
  const frameworkPatterns = [
    /^vue$/,
    /^react$/,
    /^react-dom$/,
    /^@vue\//,
    /^@react\//,
    /^@angular\//,
    /^svelte/,
    /^@svelte\//,
    /^@vueuse\//,
    /^@ldesign\//,
  ]

  return frameworkPatterns.some(pattern => pattern.test(dep))
}

/**
 * 获取默认的全局变量名
 */
function getDefaultGlobalName(dep: string): string {
  // 预定义的全局变量映射
  const predefinedGlobals: Record<string, string> = {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
    '@vue/reactivity': 'Vue',
    '@vue/shared': 'Vue',
    '@vueuse/core': 'VueUse',
    '@vueuse/shared': 'VueUse',
    '@ldesign/cache': 'LDesignCache',
    '@ldesign/device': 'LDesignDevice',
    '@ldesign/engine': 'LDesignEngine',
    '@ldesign/shared': 'LDesignShared',
    '@ldesign/template': 'LDesignTemplate',
  }

  if (predefinedGlobals[dep]) {
    return predefinedGlobals[dep]
  }

  // 自动生成全局变量名
  return dep
    .replace(/[@\/\-]/g, '')
    .replace(/^./, c => c.toUpperCase())
    .replace(/[A-Z]/g, (match, offset) => offset > 0 ? match : match.toUpperCase())
}

/**
 * 显示构建信息
 */
function showBuildInfo(options: import('./types').BuildOptions): void {
  console.log()
  console.log(chalk.cyan.bold('📦 开始智能构建'))
  console.log(chalk.gray('─'.repeat(50)))
  console.log(`${chalk.bold('项目根目录:')} ${chalk.cyan(options.root || process.cwd())}`)
  console.log(`${chalk.bold('输出目录:')} ${chalk.cyan(options.outDir || 'dist')}`)
  console.log(`${chalk.bold('输出格式:')} ${chalk.yellow(options.formats?.join(', ') || 'esm, cjs')}`)
  console.log(`${chalk.bold('生成类型声明:')} ${options.dts ? chalk.green('是') : chalk.red('否')}`)
  console.log(`${chalk.bold('代码压缩:')} ${options.minify ? chalk.green('是') : chalk.red('否')}`)
  console.log(`${chalk.bold('Source Map:')} ${options.sourcemap ? chalk.green('是') : chalk.red('否')}`)
  console.log(`${chalk.bold('智能缓存:')} ${chalk.green('已启用')}`)
  console.log(chalk.gray('─'.repeat(50)))
  console.log()
}

/**
 * 快速构建函数
 */
export async function build(options: import('./types').BuildOptions) {
  const { Logger } = await import('./utils')
  const { ProjectScanner } = await import('./core/project-scanner')
  const { PluginConfigurator } = await import('./core/plugin-configurator')
  const { RollupBuilder } = await import('./core/rollup-builder')
  const { TypeGenerator } = await import('./core/type-generator')
  const { BuildValidator } = await import('./core/build-validator')
  const { FormatDetector } = await import('./core/format-detector')
  const { BuildCache } = await import('./core/build-cache')
  const { DependencyAnalyzer } = await import('./core/dependency-analyzer')

  const logger = new Logger('Builder')

  try {
    // 智能化配置处理
    const enhancedOptions = await enhanceOptions(options)

    // 扫描项目
    const scanner = new ProjectScanner()
    const scanResult = await scanner.scan(enhancedOptions.root || process.cwd(), {
      ignorePatterns: ['node_modules/**', '.git/**'],
      includePatterns: ['**/*.{ts,tsx,js,jsx,vue,css,less,scss,sass,styl,stylus}'],
    })

    // 智能格式检测（如果用户未指定格式）
    if (!options.formats || options.formats.length === 0) {
      const formatDetector = new FormatDetector()
      const detectionResult = await formatDetector.detect(scanResult, enhancedOptions)
      enhancedOptions.formats = detectionResult.primary.formats
      
      logger.info(`🎯 智能格式检测完成：${detectionResult.primary.formats.join(', ')}`)
      logger.info(`推荐理由：${detectionResult.primary.reasons.join('; ')}`)
    }

    // 初始化构建缓存
    const buildCache = new BuildCache(enhancedOptions.root || process.cwd())
    await buildCache.initialize(enhancedOptions)

    // 验证缓存
    const cacheResult = await buildCache.validateCache(scanResult)
    if (cacheResult.hitRate > 0) {
      logger.info(`📦 构建缓存命中率: ${cacheResult.hitRate.toFixed(1)}%`)
    }

    // 依赖分析日志
    const dependencyAnalyzer = new DependencyAnalyzer()
    const dependencyResult = await dependencyAnalyzer.analyze(scanResult)
    if (dependencyResult.circularDependencies.length > 0) {
      logger.warn(`⚠️ 发现 ${dependencyResult.circularDependencies.length} 个循环依赖`)
    }
    if (dependencyResult.orphanedFiles.length > 0) {
      logger.warn(`👻 发现 ${dependencyResult.orphanedFiles.length} 个孤儿文件`)
    }

    // 显示构建信息
    showBuildInfo(enhancedOptions)

    // 配置插件
    const configurator = new PluginConfigurator()
    const plugins = await configurator.configure(scanResult, enhancedOptions)

    // 创建构建器并执行构建
    const builder = new RollupBuilder()
    const result = await builder.build(scanResult, { plugins }, enhancedOptions)

    if (!result.success) {
      logger.error('构建失败')
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          logger.error(`${error.message}`)
          if (error.file) logger.error(`  文件: ${error.file}`)
          if (error.line) logger.error(`  行号: ${error.line}`)
        })
      }
      return result
    }

    // 生成类型文件
    let typeGenerationResult = null
    if (enhancedOptions.dts !== false) {
      const typeGenerator = new TypeGenerator()
      typeGenerationResult = await typeGenerator.generate(scanResult, enhancedOptions)

      if (!typeGenerationResult.success) {
        logger.error('类型文件生成失败')
        typeGenerationResult.errors.forEach(error => {
          logger.error(`${error}`)
        })
        // 类型生成失败不应该导致整个构建失败，但要记录错误
        result.warnings = result.warnings || []
        result.warnings.push(...typeGenerationResult.errors.map(error => ({ message: error })))
      }
    }

    // 验证构建产物
    const validator = new BuildValidator()
    const validationResult = await validator.validate(scanResult, enhancedOptions, result)

    if (!validationResult.success) {
      // 将验证错误添加到构建结果中
      result.warnings = result.warnings || []
      result.warnings.push(...validationResult.errors.map(error => ({ message: error })))
      result.warnings.push(...validationResult.warnings.map(warning => ({ message: warning })))
    }

    // 添加验证结果到构建结果中
    ; (result as any).validation = validationResult
    if (typeGenerationResult) {
      ; (result as any).typeGeneration = typeGenerationResult
    }

    logger.success('构建完成')
    return result
  }
  catch (error) {
    logger.error('构建失败:', error)
    if (error instanceof Error && error.stack) {
      logger.error('错误堆栈:', error.stack)
    }
    throw error
  }
}

/**
 * 快速监听函数
 */
export async function watch(options: import('./types').BuildOptions): Promise<void> {
  const { Logger } = await import('./utils')
  const { ProjectScanner } = await import('./core/project-scanner')
  const { PluginConfigurator } = await import('./core/plugin-configurator')
  const { RollupBuilder } = await import('./core/rollup-builder')

  const logger = new Logger('Builder')
  logger.info('启动监听模式...')

  // 扫描项目
  const scanner = new ProjectScanner()
  const scanResult = await scanner.scan(options.root || process.cwd(), {
    ignorePatterns: ['node_modules/**', '.git/**'],
    includePatterns: ['**/*.{ts,tsx,js,jsx,vue,css,less,scss,sass,styl,stylus}'],
  })

  // 配置插件
  const configurator = new PluginConfigurator()
  const plugins = await configurator.configure(scanResult, options)

  // 创建构建器
  const builder = new RollupBuilder()

  await builder.watch(scanResult, { plugins }, options, (result) => {
    if (result.success) {
      logger.info('重新构建完成')
    }
    else {
      logger.error('重新构建失败:', result.errors)
    }
  })
}

/**
 * 项目分析函数
 */
export async function analyze(input: string = process.cwd()) {
  const { Logger } = await import('./utils')
  const { ProjectScanner } = await import('./core/project-scanner')

  const logger = new Logger('Analyzer')

  try {
    const scanner = new ProjectScanner()
    const result = await scanner.scan(input, {})

    logger.info('项目分析完成')
    return result
  }
  catch (error) {
    logger.error('项目分析失败:', error)
    throw error
  }
}

/**
 * 初始化项目配置
 */
export async function init(options: {
  template?: 'library' | 'application' | 'component'
  type?: 'vue' | 'react' | 'typescript' | 'javascript'
  typescript?: boolean
  target?: 'browser' | 'node' | 'universal'
  name?: string
  outDir?: string
  force?: boolean
  projectPath?: string
} = {}) {
  const { Logger } = await import('./utils')

  const logger = new Logger('Init')

  try {
    const { ProjectInitializer } = await import('./core/project-initializer')
    const initializer = new ProjectInitializer()
    const projectPath = options.projectPath || process.cwd()
    
    const initOptions: InitializationOptions = {
      template: options.template || 'library',
      target: options.target || 'universal',
    }
    
    if (options.type !== undefined) {
      initOptions.type = options.type
    }
    
    if (options.typescript !== undefined) {
      initOptions.typescript = options.typescript
    }
    
    if (options.name !== undefined) {
      initOptions.name = options.name
    }
    
    if (options.outDir !== undefined) {
      initOptions.outDir = options.outDir
    }
    
    if (options.force !== undefined) {
      initOptions.force = options.force
    }
    
    const result = await initializer.initialize(projectPath, initOptions)
    
    if (result.success) {
      logger.success('项目初始化完成')
      result.messages.forEach(message => {
        console.log(message)
      })
      
      return result
    } else {
      result.errors.forEach(error => {
        logger.error(error)
      })
      throw new Error('初始化失败')
    }
  }
  catch (error) {
    logger.error('项目初始化失败:', error)
    throw error
  }
}

// 默认导出
export default {
  version,
  build,
  watch,
  analyze,
  init,
  ProjectScanner,
  PluginConfigurator,
  RollupBuilder,
  TypeGenerator,
  Logger,
  ErrorHandler,
}


