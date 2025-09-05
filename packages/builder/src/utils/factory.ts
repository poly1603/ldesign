/**
 * 工厂函数 - 便捷创建构建器实例
 */

import { LibraryBuilder } from '../core/LibraryBuilder'
import type { BuilderOptions } from '../types/builder'
import type { BuilderConfig } from '../types/config'
import { LibraryType } from '../types/library'
import { createLogger } from './logger'

/**
 * 创建构建器实例的便捷函数
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  // 创建默认的日志记录器
  const logger = options.logger || createLogger({
    level: 'info',
    colors: true,
    prefix: '@ldesign/builder'
  })

  // 创建默认的错误处理器（暂时不使用）
  // const errorHandler = createErrorHandler({
  //   logger,
  //   showSuggestions: true
  // })

  // 合并选项
  const builderOptions: BuilderOptions = {
    config,
    logger,
    autoDetect: true,
    cache: true,
    performance: true,
    ...options
  }

  return new LibraryBuilder(builderOptions)
}

/**
 * 创建开发模式构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createDevBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const devConfig: BuilderConfig = {
    input: 'src/index.ts',
    mode: 'development',
    minify: false,
    output: {
      sourcemap: 'inline'
    },
    debug: true,
    ...config
  }

  return createBuilder(devConfig, options)
}

/**
 * 创建生产模式构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createProdBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const prodConfig: BuilderConfig = {
    input: 'src/index.ts',
    mode: 'production',
    minify: true,
    clean: true,
    output: {
      sourcemap: true
    },
    debug: false,
    ...config
  }

  return createBuilder(prodConfig, options)
}

/**
 * 创建 TypeScript 库构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createTypeScriptBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const tsConfig: BuilderConfig = {
    input: 'src/index.ts',
    libraryType: LibraryType.TYPESCRIPT,
    typescript: {
      declaration: true,
      isolatedDeclarations: true
    },
    output: {
      format: ['esm', 'cjs']
    },
    ...config
  }

  return createBuilder(tsConfig, options)
}

/**
 * 创建 Vue3 组件库构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createVue3Builder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const vueConfig: BuilderConfig = {
    input: 'src/index.ts',
    libraryType: LibraryType.VUE3,
    vue: {
      version: 3,
      onDemand: true
    },
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    output: {
      format: ['esm', 'cjs', 'umd']
    },
    ...config
  }

  return createBuilder(vueConfig, options)
}

/**
 * 创建样式库构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createStyleBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const styleConfig: BuilderConfig = {
    input: 'src/index.css',
    libraryType: LibraryType.STYLE,
    style: {
      extract: true,
      minimize: true,
      autoprefixer: true
    },
    output: {
      format: ['esm']
    },
    ...config
  }

  return createBuilder(styleConfig, options)
}

/**
 * 创建快速构建器（最小配置）
 * 
 * @param input 入口文件
 * @param output 输出目录
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createQuickBuilder(
  input: string,
  output?: string,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const quickConfig: BuilderConfig = {
    input,
    output: output ? { dir: output } : undefined
  }

  return createBuilder(quickConfig, options)
}

/**
 * 创建监听模式构建器
 * 
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export function createWatchBuilder(
  config?: BuilderConfig,
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder {
  const watchConfig: BuilderConfig = {
    input: 'src/index.ts',
    watch: {
      include: ['src/**/*'],
      exclude: ['node_modules/**/*', 'dist/**/*']
    },
    ...config
  }

  return createBuilder(watchConfig, options)
}

/**
 * 从 package.json 创建构建器
 * 
 * @param packageJsonPath package.json 文件路径
 * @param options 构建器选项
 * @returns 构建器实例
 */
export async function createBuilderFromPackage(
  packageJsonPath: string = './package.json',
  options: Omit<BuilderOptions, 'config'> = {}
): Promise<LibraryBuilder> {
  try {
    const { readFile } = await import('./file-system')
    const packageContent = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)

    // 从 package.json 推断配置
    const config: BuilderConfig = {
      input: packageJson.source || packageJson.main || 'src/index.ts',
      output: {
        dir: 'dist'
      }
    }

    // 如果有 builder 字段，使用它
    if (packageJson.builder) {
      Object.assign(config, packageJson.builder)
    }

    return createBuilder(config, options)
  } catch (error) {
    throw new Error(`从 package.json 创建构建器失败: ${(error as Error).message}`)
  }
}

/**
 * 批量创建构建器
 * 
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器实例数组
 */
export function createBuilders(
  configs: BuilderConfig[],
  options: Omit<BuilderOptions, 'config'> = {}
): LibraryBuilder[] {
  return configs.map(config => createBuilder(config, options))
}

/**
 * 创建构建器池
 * 
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器池
 */
export function createBuilderPool(
  configs: BuilderConfig[],
  options: Omit<BuilderOptions, 'config'> = {}
): {
  builders: LibraryBuilder[]
  buildAll: () => Promise<any[]>
  disposeAll: () => Promise<void>
} {
  const builders = createBuilders(configs, options)

  return {
    builders,

    async buildAll() {
      return Promise.all(builders.map(builder => builder.build()))
    },

    async disposeAll() {
      await Promise.all(builders.map(builder => builder.dispose()))
    }
  }
}
