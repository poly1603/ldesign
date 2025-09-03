/**
 * 构建器工厂类
 * 提供便捷的构建器创建和预设配置
 */

import { ViteBuilder } from './vite-builder'
import { RollupBuilder } from './rollup-builder'
import type {
  ViteBuilderConfig,
  RollupBuilderConfig,
  PresetConfig,
  BuildEnvironment,
  OutputFormat
} from './types'

/**
 * 构建器工厂类
 * 提供统一的构建器创建接口
 */
export class BuilderFactory {
  private static presets: Map<string, PresetConfig> = new Map()

  /**
   * 创建 Vite 构建器
   * @param config 配置选项
   * @returns Vite 构建器实例
   */
  static createViteBuilder(config: ViteBuilderConfig = {}): ViteBuilder {
    return new ViteBuilder(config)
  }

  /**
   * 创建 Rollup 构建器
   * @param config 配置选项
   * @returns Rollup 构建器实例
   */
  static createRollupBuilder(config: RollupBuilderConfig): RollupBuilder {
    return new RollupBuilder(config)
  }

  /**
   * 使用预设创建 Vite 构建器
   * @param presetName 预设名称
   * @param overrides 覆盖配置
   * @returns Vite 构建器实例
   */
  static createViteBuilderWithPreset(
    presetName: string,
    overrides: Partial<ViteBuilderConfig> = {}
  ): ViteBuilder {
    const preset = this.getPreset(presetName)
    const config = this.mergeConfig(preset.config, overrides) as ViteBuilderConfig
    return new ViteBuilder(config)
  }

  /**
   * 使用预设创建 Rollup 构建器
   * @param presetName 预设名称
   * @param overrides 覆盖配置
   * @returns Rollup 构建器实例
   */
  static createRollupBuilderWithPreset(
    presetName: string,
    overrides: Partial<RollupBuilderConfig> = {}
  ): RollupBuilder {
    const preset = this.getPreset(presetName)
    const config = this.mergeConfig(preset.config, overrides) as RollupBuilderConfig
    return new RollupBuilder(config)
  }

  /**
   * 注册预设配置
   * @param preset 预设配置
   */
  static registerPreset(preset: PresetConfig): void {
    this.presets.set(preset.name, preset)
  }

  /**
   * 获取预设配置
   * @param name 预设名称
   * @returns 预设配置
   */
  static getPreset(name: string): PresetConfig {
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`Preset "${name}" not found`)
    }
    return preset
  }

  /**
   * 获取所有预设名称
   * @returns 预设名称数组
   */
  static getPresetNames(): string[] {
    return Array.from(this.presets.keys())
  }

  /**
   * 移除预设配置
   * @param name 预设名称
   */
  static removePreset(name: string): void {
    this.presets.delete(name)
  }

  /**
   * 合并配置
   * @param base 基础配置
   * @param overrides 覆盖配置
   * @returns 合并后的配置
   */
  private static mergeConfig(base: any, overrides: any): any {
    const result = { ...base }
    
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result[key] = this.mergeConfig(result[key] || {}, value)
        } else {
          result[key] = value
        }
      }
    }
    
    return result
  }
}

/**
 * 内置预设配置
 */
export const BuiltinPresets = {
  /**
   * Vue 应用预设
   */
  vueApp: {
    name: 'vue-app',
    description: 'Vue 3 应用开发预设',
    config: {
      entry: 'src/main.ts',
      outDir: 'dist',
      server: {
        port: 3000,
        open: true
      },
      css: {
        extract: true,
        modules: false
      }
    }
  } as PresetConfig,

  /**
   * React 应用预设
   */
  reactApp: {
    name: 'react-app',
    description: 'React 应用开发预设',
    config: {
      entry: 'src/index.tsx',
      outDir: 'build',
      server: {
        port: 3000,
        open: true
      }
    }
  } as PresetConfig,

  /**
   * 库开发预设
   */
  library: {
    name: 'library',
    description: '库开发预设',
    config: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'] as OutputFormat[]
      },
      outDir: 'dist'
    }
  } as PresetConfig,

  /**
   * TypeScript 库预设
   */
  tsLibrary: {
    name: 'ts-library',
    description: 'TypeScript 库开发预设',
    config: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'] as OutputFormat[]
      },
      outDir: 'dist',
      sourcemap: true
    }
  } as PresetConfig,

  /**
   * Node.js 应用预设
   */
  nodeApp: {
    name: 'node-app',
    description: 'Node.js 应用开发预设',
    config: {
      entry: 'src/index.ts',
      outDir: 'dist',
      target: 'node16',
      external: ['node:*']
    }
  } as PresetConfig,

  /**
   * Rollup 库预设
   */
  rollupLibrary: {
    name: 'rollup-library',
    description: 'Rollup 库开发预设',
    config: {
      input: 'src/index.ts',
      output: [
        {
          file: 'dist/index.js',
          format: 'es' as OutputFormat,
          sourcemap: true
        },
        {
          file: 'dist/index.cjs',
          format: 'cjs' as OutputFormat,
          sourcemap: true
        }
      ]
    }
  } as PresetConfig,

  /**
   * UMD 库预设
   */
  umdLibrary: {
    name: 'umd-library',
    description: 'UMD 库开发预设',
    config: {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.umd.js',
        format: 'umd' as OutputFormat,
        name: 'MyLibrary',
        sourcemap: true
      }
    }
  } as PresetConfig
}

// 注册内置预设
Object.values(BuiltinPresets).forEach(preset => {
  BuilderFactory.registerPreset(preset)
})

/**
 * 快速创建函数
 */
export const createViteBuilder = BuilderFactory.createViteBuilder
export const createRollupBuilder = BuilderFactory.createRollupBuilder
export const createViteBuilderWithPreset = BuilderFactory.createViteBuilderWithPreset
export const createRollupBuilderWithPreset = BuilderFactory.createRollupBuilderWithPreset
