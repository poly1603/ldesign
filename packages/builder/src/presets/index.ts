/**
 * 预设系统 - 为不同类型的库提供预配置
 */

import type { RollupOptions, Plugin, OutputOptions } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import vue from '@vitejs/plugin-vue'
// import vue2 from '@vitejs/plugin-vue2'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import postcss from 'rollup-plugin-postcss'
// import less from 'less'
import { stylePlugin } from '../plugins/style-plugin'
import type { ProjectAnalysis } from '../analyzer/ProjectAnalyzer'

// 预设配置接口
export interface PresetConfig {
  entry: string
  outputDir: {
    cjs: string
    es: string
    umd: string
  }
  external?: string[] | ((id: string) => boolean)
  globals?: Record<string, string>
  name?: string // UMD 全局变量名
  minify?: boolean
  sourcemap?: boolean
  dts?: boolean
  extractCss?: boolean
}

// 预设基类
export abstract class BasePreset {
  protected analysis: ProjectAnalysis
  protected config: PresetConfig

  constructor(analysis: ProjectAnalysis, config: PresetConfig) {
    this.analysis = analysis
    this.config = config
  }

  /**
   * 获取 Rollup 配置
   */
  abstract getRollupConfig(): RollupOptions[]

  /**
   * 获取基础插件
   */
  protected getBasePlugins(_format: 'cjs' | 'es' | 'umd'): Plugin[] {
    const plugins: Plugin[] = [
      nodeResolve({
        preferBuiltins: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
      }),
      commonjs(),
      json()
    ]

    // TypeScript 支持
    if (this.analysis.hasTypeScript) {
      plugins.push(
        typescript({
          tsconfig: './tsconfig.json',
          declaration: false,
          declarationMap: false,
          sourceMap: this.config.sourcemap
        })
      )
    }

    // Babel 转换（主要用于 JSX）
    if (this.analysis.hasJsx || this.analysis.hasTsx) {
      plugins.push(
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          presets: [
            '@babel/preset-env',
            '@babel/preset-typescript',
            '@babel/preset-react'
          ]
        })
      )
    }

    return plugins
  }

  /**
   * 获取输出配置
   */
  protected getOutputOptions(format: 'cjs' | 'es' | 'umd'): OutputOptions {
    const outputDir = this.config.outputDir[format]
    const base: OutputOptions = {
      format,
      dir: outputDir,
      preserveModules: format !== 'umd',
      preserveModulesRoot: 'src',
      sourcemap: this.config.sourcemap,
      exports: 'named'
    }

    if (format === 'umd') {
      base.name = this.config.name || this.analysis.packageName || 'Library'
      base.globals = this.config.globals || {}
    }

    if (format === 'cjs') {
      base.entryFileNames = '[name].cjs'
    }

    return base
  }

  /**
   * 获取外部依赖配置
   */
  protected getExternal(): string[] | ((id: string) => boolean) {
    if (this.config.external) {
      return this.config.external
    }

    // 默认排除所有依赖
    const deps = [
      ...this.analysis.dependencies,
      ...this.analysis.devDependencies
    ]
    
    return (id: string) => {
      // 排除 node_modules
      if (id.includes('node_modules')) return true
      // 排除包依赖
      return deps.some(dep => id.startsWith(dep))
    }
  }
}

/**
 * 纯样式库预设
 */
export class PureLessPreset extends BasePreset {
  getRollupConfig(): RollupOptions[] {
    return [{
      input: this.config.entry,
      external: this.getExternal(),
      plugins: [
        stylePlugin({
          outputDir: this.config.outputDir.es,
          extract: true,
          minify: this.config.minify || false,
          sourceMap: this.config.sourcemap || false,
          format: 'es'
        }),
        postcss({
          extract: true,
          minimize: this.config.minify,
          sourceMap: this.config.sourcemap
        })
      ],
      output: this.getOutputOptions('es')
    }]
  }
}

/**
 * TypeScript 工具库预设
 */
export class TsLibPreset extends BasePreset {
  getRollupConfig(): RollupOptions[] {
    const configs: RollupOptions[] = []

    // ES 模块
    configs.push({
      input: this.config.entry,
      external: this.getExternal(),
      plugins: [
        ...this.getBasePlugins('es'),
        // 处理样式（如果有）
        this.analysis.hasLess && stylePlugin({
          outputDir: this.config.outputDir.es,
          extract: this.config.extractCss !== false,
          minify: false,
          sourceMap: this.config.sourcemap || false,
          format: 'es'
        })
      ].filter(Boolean),
      output: this.getOutputOptions('es')
    })

    // CommonJS 模块
    configs.push({
      input: this.config.entry,
      external: this.getExternal(),
      plugins: [
        ...this.getBasePlugins('cjs'),
        this.analysis.hasLess && stylePlugin({
          outputDir: this.config.outputDir.cjs,
          extract: this.config.extractCss !== false,
          minify: false,
          sourceMap: this.config.sourcemap || false,
          format: 'cjs'
        })
      ].filter(Boolean),
      output: this.getOutputOptions('cjs')
    })

    // UMD 模块
    configs.push({
      input: this.config.entry,
      external: (_id: string) => {
        // UMD 需要打包所有依赖
        return false
      },
      plugins: [
        ...this.getBasePlugins('umd'),
        this.analysis.hasLess && stylePlugin({
          outputDir: this.config.outputDir.umd,
          extract: this.config.extractCss !== false,
          minify: this.config.minify !== false,
          sourceMap: this.config.sourcemap || false,
          format: 'umd'
        }),
        this.config.minify && terser()
      ].filter(Boolean),
      output: {
        ...this.getOutputOptions('umd'),
        file: `${this.config.outputDir.umd}/index.js`
      }
    })

    return configs
  }
}

/**
 * Vue2 组件库预设 (TODO: 需要正确的 Vue2 插件支持)
 */
export class Vue2ComponentPreset extends BasePreset {
  getRollupConfig(): RollupOptions[] {
    // 暂时返回空数组，等待 Vue2 插件支持
    console.warn('Vue2ComponentPreset is not fully implemented yet')
    return []
  }
}

/**
 * Vue3 组件库预设
 */
export class Vue3ComponentPreset extends BasePreset {
  getRollupConfig(): RollupOptions[] {
    const configs: RollupOptions[] = []

    // ES 模块
    configs.push({
      input: this.config.entry,
      external: this.getExternal(),
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('l-')
            }
          }
        } as any),
        vueJsx(),
        ...this.getBasePlugins('es'),
        stylePlugin({
          outputDir: this.config.outputDir.es,
          extract: this.config.extractCss !== false,
          minify: false,
          sourceMap: this.config.sourcemap || false,
          processVueStyles: true,
          format: 'es'
        })
      ],
      output: this.getOutputOptions('es')
    })

    // CommonJS 模块
    configs.push({
      input: this.config.entry,
      external: this.getExternal(),
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('l-')
            }
          }
        } as any),
        vueJsx(),
        ...this.getBasePlugins('cjs'),
        stylePlugin({
          outputDir: this.config.outputDir.cjs,
          extract: this.config.extractCss !== false,
          minify: false,
          sourceMap: this.config.sourcemap || false,
          processVueStyles: true,
          format: 'cjs'
        })
      ],
      output: this.getOutputOptions('cjs')
    })

    // UMD 模块
    configs.push({
      input: this.config.entry,
      external: (id: string) => {
        // 保留 Vue 作为外部依赖
        if (id === 'vue') return true
        return false
      },
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('l-')
            }
          }
        } as any),
        vueJsx(),
        ...this.getBasePlugins('umd'),
        stylePlugin({
          outputDir: this.config.outputDir.umd,
          extract: this.config.extractCss !== false,
          minify: this.config.minify !== false,
          sourceMap: this.config.sourcemap || false,
          processVueStyles: true,
          format: 'umd'
        }),
        this.config.minify && terser()
      ].filter(Boolean),
      output: {
        ...this.getOutputOptions('umd'),
        file: `${this.config.outputDir.umd}/index.js`,
        globals: {
          vue: 'Vue',
          ...this.config.globals
        }
      }
    })

    return configs
  }
}

/**
 * 预设工厂
 */
export class PresetFactory {
  static create(analysis: ProjectAnalysis, config: PresetConfig): BasePreset {
    const { projectType } = analysis

    switch (projectType) {
      case 'pure-less':
        return new PureLessPreset(analysis, config)
      case 'ts-lib':
        return new TsLibPreset(analysis, config)
      case 'vue2-component':
        return new Vue2ComponentPreset(analysis, config)
      case 'vue3-component':
        return new Vue3ComponentPreset(analysis, config)
      default:
        // 默认使用 TypeScript 库预设
        return new TsLibPreset(analysis, config)
    }
  }
}
