/**
 * OutputConfigGenerator - 输出配置生成器
 * 
 * 根据用户指定格式（esm、cjs、umd等）生成 Rollup 输出配置
 * 
 * 目录结构策略：
 * - esm/cjs：保持 src 目录结构，全量导出
 * - umd：仅打包入口 index 文件，生成单文件
 */

import type { OutputOptions } from 'rollup'
import type { OutputFormat } from '@ldesign/kit'
import { join, dirname, relative, basename } from 'path'
import type { ProjectInfo } from '../types'

export class OutputConfigGenerator {
  private readonly root: string

  constructor(root: string) {
    this.root = root
  }

  /**
   * 生成输出配置
   * 
   * @param formats - 输出格式数组
   * @param outDir - 输出目录
   * @param info - 项目信息
   * @param entries - 入口文件映射
   * @returns Rollup 输出配置数组
   */
  async generate(
    formats: string[],
    outDir: string,
    info: ProjectInfo,
    entries: string[] | Record<string, string>
  ): Promise<OutputOptions[]> {
    const outputs: OutputOptions[] = []

    // 将 entries 统一为 Record 形式处理
    const entryMap = Array.isArray(entries) 
      ? { index: entries[0] }  // 单入口
      : entries                // 多入口

    // 读取 package.json 获取库名称
    const pkgName = await this.getPackageName()

    for (const format of formats) {
      const formatKey = format as OutputFormat

      if (formatKey === 'umd' || formatKey === 'iife') {
        // UMD/IIFE：生成单个打包文件
        outputs.push({
          format: formatKey,
          name: pkgName,
          file: join(this.root, outDir, `index.${this.getExtension(formatKey)}`),
          sourcemap: true,
          exports: 'named',
          globals: this.generateGlobals(info)
        })
      } else {
        // ESM/CJS：保持目录结构
        outputs.push({
          format: formatKey,
          dir: join(this.root, outDir, formatKey),
          sourcemap: true,
          exports: 'named',
          preserveModules: true,  // 保持原始模块结构
          preserveModulesRoot: 'src',  // 设置模块根目录
          entryFileNames: (chunkInfo) => {
            // 保持原始路径结构，仅改变扩展名
            const ext = this.getExtension(formatKey)
            const name = chunkInfo.name.replace(/\.[^/.]+$/, '')
            return `${name}.${ext}`
          },
          chunkFileNames: `[name].${this.getExtension(formatKey)}`,
          assetFileNames: '[name].[ext]'
        })
      }
    }

    return outputs
  }

  /**
   * 获取包名（用于 UMD global 名称）
   */
  private async getPackageName(): Promise<string> {
    try {
      const { readFileSync, existsSync } = await import('fs')
      const pkgPath = join(this.root, 'package.json')
      
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        const name = pkg.name || 'Library'
        
        // 转换为合法的全局变量名
        // @ldesign/builder -> LdesignBuilder
        return name
          .replace(/^@/, '')
          .replace(/[/-]/g, '_')
          .replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase())
          .replace(/^(\w)/, (c: string) => c.toUpperCase())
      }
    } catch (e) {
      console.warn('无法读取 package.json，使用默认库名')
    }
    return 'Library'
  }

  /**
   * 根据格式获取文件扩展名
   */
  private getExtension(format: OutputFormat): string {
    const extMap: Record<OutputFormat, string> = {
      es: 'js',
      esm: 'js',
      cjs: 'cjs',
      umd: 'umd.js',
      iife: 'iife.js',
      amd: 'amd.js',
      system: 'system.js'
    }
    return extMap[format] || 'js'
  }

  /**
   * 生成 UMD globals 配置
   * 为外部依赖生成全局变量名映射
   */
  private generateGlobals(info: ProjectInfo): Record<string, string> {
    const globals: Record<string, string> = {}

    // 常见库的全局变量映射
    const commonGlobals: Record<string, string> = {
      vue: 'Vue',
      'vue-demi': 'VueDemi',
      react: 'React',
      'react-dom': 'ReactDOM',
      jquery: '$',
      lodash: '_',
      axios: 'axios',
      moment: 'moment',
      dayjs: 'dayjs'
    }

    // 根据项目依赖自动添加
    for (const dep of info.deps || []) {
      if (commonGlobals[dep]) {
        globals[dep] = commonGlobals[dep]
      } else {
        // 自动生成驼峰格式的全局变量名
        globals[dep] = dep
          .replace(/[^a-zA-Z0-9]/g, ' ')
          .replace(/\s+(.)/g, (_: string, c: string) => c.toUpperCase())
          .replace(/^(.)/, (c: string) => c.toUpperCase())
      }
    }

    return globals
  }
}
