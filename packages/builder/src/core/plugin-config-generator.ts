/**
 * PluginConfigGenerator - 插件配置生成器
 * 
 * 根据 ProjectAnalyzer 的结果，自动生成适配多技术栈的 Rollup 插件列表。
 * 支持：
 * - Vue2/Vue3（包含 JSX/TSX）
 * - React（JSX/TSX）
 * - TypeScript、Less/Sass、JSON 等
 */

import type { Plugin as RollupPlugin } from 'rollup'
import vue from 'rollup-plugin-vue'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'
import less from 'rollup-plugin-less'
import stylus from 'rollup-plugin-stylus'
import terser from '@rollup/plugin-terser'
import vueJsx from 'unplugin-vue-jsx/rollup'
import type { ProjectInfo, SmartBuilderOptions } from '../types'

export class PluginConfigGenerator {
  constructor(_root: string) {
    // root parameter reserved for future use
  }

  /**
   * 生成插件列表
   */
  async generate(info: ProjectInfo, options: SmartBuilderOptions): Promise<RollupPlugin[]> {
    const plugins: RollupPlugin[] = []

    // 替换环境变量
    plugins.push(replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(options.mode || 'production')
    }) as RollupPlugin)

    // 解析第三方模块
    plugins.push(nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.jsx', '.vue'] }) as RollupPlugin)
    plugins.push(commonjs() as RollupPlugin)
    plugins.push(json() as RollupPlugin)

    // Vue 支持
    if (info.type === 'vue') {
      // 对于 Vue3 使用 rollup-plugin-vue + jsx
      plugins.push(vue({
        target: 'browser',
        preprocessStyles: true
      }) as unknown as RollupPlugin)

      // Vue JSX/TSX
      plugins.push(vueJsx() as unknown as RollupPlugin)
    }

    // React 支持（JSX/TSX 通过 esbuild 或 ts 插件处理）

    // TypeScript/JSX/TSX 转译（首选 esbuild，速度更快）
    plugins.push(esbuild({
      sourceMap: options.sourcemap !== false,
      minify: false,
      target: 'es2017',
      loaders: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.jsx': 'jsx'
      }
    }) as unknown as RollupPlugin)

    // 若项目显式使用 TS，附加 TS 类型校验与声明生成由 DtsGenerator 负责
    if (info.hasTypeScript) {
      plugins.push(typescript({ tsconfig: 'tsconfig.json', noEmitOnError: true }) as unknown as RollupPlugin)
    }

    // 样式处理：PostCSS + Less/Sass/Stylus
    plugins.push(postcss({ extract: true, minimize: false }))

    if (info.hasLess) plugins.push(less() as unknown as RollupPlugin)
    if (info.hasSass) plugins.push(stylus() as unknown as RollupPlugin)

    // 生产环境压缩
    if ((options.minify ?? true) && (options.mode ?? 'production') === 'production') {
      plugins.push(terser() as unknown as RollupPlugin)
    }

    return plugins
  }
}

