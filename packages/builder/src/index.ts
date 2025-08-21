/**
 * LDesign Builder - 智能前端库打包工具
 * 主入口文件
 */

import { PluginConfigurator } from './core/plugin-configurator'
import { ProjectScanner } from './core/project-scanner'
import { RollupBuilder } from './core/rollup-builder'
import { TypeGenerator } from './core/type-generator'
// 核心类型定义
import { ErrorHandler, Logger } from './utils/logger'

// CLI模块
export { runCli } from './cli'

export { AnalyzeCommand } from './cli/commands/analyze'
export { BuildCommand } from './cli/commands/build'
export { InitCommand } from './cli/commands/init'
export { WatchCommand } from './cli/commands/watch'

export { PluginConfigurator } from './core/plugin-configurator'
// 核心模块
export { ProjectScanner } from './core/project-scanner'
export { RollupBuilder } from './core/rollup-builder'
export { TypeGenerator } from './core/type-generator'
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

// 版本信息
export const version: string = require('../package.json').version

/**
 * 快速构建函数
 */
export async function build(options: import('./types').BuildOptions) {
  const { Logger } = await import('./utils')
  const { ProjectScanner } = await import('./core/project-scanner')
  const { PluginConfigurator } = await import('./core/plugin-configurator')
  const { RollupBuilder } = await import('./core/rollup-builder')
  const { TypeGenerator } = await import('./core/type-generator')

  const logger = new Logger('Builder')
  logger.info('开始构建项目...')

  try {
    // 扫描项目
    const scanner = new ProjectScanner()
    const scanResult = await scanner.scan(options.root || process.cwd(), {
      ignorePatterns: ['node_modules/**', '.git/**'],
      includePatterns: ['**/*.{ts,tsx,js,jsx,vue}'],
    })

    // 配置插件
    const configurator = new PluginConfigurator()
    const plugins = await configurator.configure(scanResult, options)

    // 创建构建器
    const builder = new RollupBuilder()

    // 执行构建
    const result = await builder.build(scanResult, { plugins }, options)

    // 生成类型文件
    if (options.dts) {
      const typeGenerator = new TypeGenerator()
      await typeGenerator.generate(scanResult, options)
    }

    logger.success('构建完成')
    return result
  }
  catch (error) {
    logger.error('构建失败:', error)
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
    includePatterns: ['**/*.{ts,tsx,js,jsx,vue}'],
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
  template?: 'vanilla' | 'vue' | 'react'
  typescript?: boolean
  output?: string
} = {}) {
  const { InitCommand } = await import('./cli/commands/init')
  const { Logger } = await import('./utils')

  const logger = new Logger('Init')
  const initCommand = new InitCommand()

  try {
    await initCommand.execute(options)
    logger.success('项目初始化完成')
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

// 轻量配置辅助，便于用户在 ldesign.config.ts 中编写配置
export function defineConfig(config: import('./types').BuildOptions) {
  return config
}
