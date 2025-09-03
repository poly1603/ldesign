/**
 * SmartBuilder - 零配置智能打包器
 * 
 * 简化版本，直接使用 Rollup API 实现
 * 自动检测项目类型，生成优化的打包配置
 * 支持 Vue2/Vue3、React、纯 JS/TS 库等多种项目类型
 */

import { rollup } from 'rollup'
import type { RollupOptions, OutputOptions } from 'rollup'
import { resolve, join } from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import fg from 'fast-glob'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'

// 简化的类型定义
export interface SmartBuilderOptions {
  /** 项目根目录 */
  root?: string
  /** 源代码目录（默认：src） */
  src?: string
  /** 输出目录（默认：dist） */
  outDir?: string
  /** 打包格式 */
  formats?: ('esm' | 'cjs' | 'umd')[]
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 是否压缩 */
  minify?: boolean
  /** 是否清理输出目录 */
  clean?: boolean
  /** 外部依赖 */
  external?: string[]
  /** UMD 全局变量映射 */
  globals?: Record<string, string>
}

export interface BuildResult {
  success: boolean
  duration: number
  outputs: Array<{
    fileName: string
    size: number
    format?: string
  }>
  errors?: string[]
}

/**
 * SmartBuilder 类
 */
export class SmartBuilder {
  private readonly root: string
  private readonly options: SmartBuilderOptions

  constructor(options: SmartBuilderOptions = {}) {
    this.root = resolve(options.root || process.cwd())
    this.options = {
      src: 'src',
      outDir: 'dist',
      formats: ['esm', 'cjs', 'umd'],
      sourcemap: true,
      minify: true,
      clean: true,
      external: [],
      globals: {},
      ...options,
      root: this.root
    }
  }

  /**
   * 执行打包
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now()
    console.log('🚀 开始打包...')

    try {
      // 清理输出目录
      if (this.options.clean) {
        const outPath = join(this.root, this.options.outDir!)
        if (existsSync(outPath)) {
          rmSync(outPath, { recursive: true, force: true })
        }
      }

      // 分析项目
      const { hasTS, hasVue, hasReact } = await this.analyzeProject()
      console.log(`✅ 项目分析完成 - TS: ${hasTS}, Vue: ${hasVue}, React: ${hasReact}`)

      // 获取入口文件
      const entries = await this.getEntries()
      console.log(`📦 找到 ${Object.keys(entries).length} 个入口文件`)

      // Build results tracking
      const outputs: Array<{ fileName: string; size: number; format?: string }> = []
      const formats = this.options.formats || ['esm', 'cjs', 'umd']

      // 为每种格式生成配置并打包
      for (const format of formats) {
        console.log(`🔨 正在打包 ${format.toUpperCase()} 格式...`)
        
        const config = this.createRollupConfig(entries, format, hasTS, hasVue)
        const bundle = await rollup(config)
        
        const outputs = Array.isArray(config.output) ? config.output : [config.output]
        for (const output of outputs) {
          await bundle.write(output)
        }
        
        await bundle.close()
        console.log(`✅ ${format.toUpperCase()} 格式打包完成`)
      }

      const duration = Date.now() - startTime
      console.log(`\n🎉 打包完成！用时 ${duration}ms`)

      return {
        success: true,
        duration,
        outputs
      }
    } catch (error) {
      console.error('❌ 打包失败:', error)
      return {
        success: false,
        duration: Date.now() - startTime,
        outputs: [],
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }

  /**
   * 分析项目类型
   */
  private async analyzeProject() {
    const pkgPath = join(this.root, 'package.json')
    let pkg: any = {}
    
    if (existsSync(pkgPath)) {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    }

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    }

    // 检查文件类型
    const srcDir = join(this.root, this.options.src!)
    const hasTS = !!allDeps.typescript || (await fg(['**/*.{ts,tsx}'], { cwd: srcDir })).length > 0
    const hasVue = !!allDeps.vue || (await fg(['**/*.vue'], { cwd: srcDir })).length > 0
    const hasReact = !!allDeps.react

    return { hasTS, hasVue, hasReact, pkg }
  }

  /**
   * 获取入口文件
   */
  private async getEntries(): Promise<Record<string, string>> {
    const srcDir = join(this.root, this.options.src!)
    
    // 对于 UMD，只使用 index 文件
    const hasUmd = this.options.formats?.includes('umd')
    if (hasUmd) {
      const indexFile = this.findIndexFile(srcDir)
      if (indexFile) {
        return { index: indexFile }
      }
    }

    // 获取所有源文件
    const files = await fg(['**/*.{js,ts,tsx,jsx,vue}'], {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
    })

    const entries: Record<string, string> = {}
    for (const file of files) {
      const name = file.replace(/\.(js|ts|tsx|jsx|vue)$/, '')
      entries[name] = join(srcDir, file)
    }

    return entries
  }

  /**
   * 查找 index 文件
   */
  private findIndexFile(srcDir: string): string | null {
    const candidates = [
      'index.ts', 'index.tsx', 'index.js', 'index.jsx',
      'main.ts', 'main.tsx', 'main.js', 'main.jsx'
    ]

    for (const file of candidates) {
      const path = join(srcDir, file)
      if (existsSync(path)) {
        return path
      }
    }

    return null
  }

  /**
   * 创建 Rollup 配置
   */
  private createRollupConfig(
    entries: Record<string, string>,
    format: 'esm' | 'cjs' | 'umd',
    hasTS: boolean,
    hasVue: boolean
  ): RollupOptions {
    const plugins: any[] = [
      nodeResolve({
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.vue']
      }),
      commonjs()
    ]

    // TypeScript 支持
    if (hasTS) {
      plugins.push(esbuild({
        target: 'es2017'
      }))
    }

    // 压缩
    if (this.options.minify && format !== 'esm') {
      plugins.push(terser())
    }

    // 外部依赖
    const external = this.generateExternal()

    // 输出配置
    const output: OutputOptions = this.createOutputConfig(format, entries)

    return {
      input: format === 'umd' ? entries.index || Object.values(entries)[0] : entries,
      output,
      plugins,
      external
    }
  }

  /**
   * 创建输出配置
   */
  private createOutputConfig(
    format: 'esm' | 'cjs' | 'umd',
    entries: Record<string, string>
  ): OutputOptions {
    const outDir = join(this.root, this.options.outDir!)

    if (format === 'umd') {
      return {
        format: 'umd',
        name: this.getLibraryName(),
        file: join(outDir, format, 'index.umd.js'),
        sourcemap: this.options.sourcemap,
        globals: this.options.globals
      }
    }

    const ext = format === 'esm' ? 'js' : 'cjs'
    
    return {
      format: format === 'esm' ? 'es' : 'cjs',
      dir: join(outDir, format),
      sourcemap: this.options.sourcemap,
      preserveModules: true,
      preserveModulesRoot: this.options.src,
      entryFileNames: `[name].${ext}`,
      exports: 'named'
    }
  }

  /**
   * 生成外部依赖配置
   */
  private generateExternal(): string[] | ((id: string) => boolean) {
    const pkgPath = join(this.root, 'package.json')
    if (!existsSync(pkgPath)) {
      return this.options.external || []
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...(this.options.external || [])
      ]

      return (id: string) => deps.some(dep => 
        id === dep || id.startsWith(`${dep}/`)
      )
    } catch {
      return this.options.external || []
    }
  }

  /**
   * 获取库名称
   */
  private getLibraryName(): string {
    try {
      const pkgPath = join(this.root, 'package.json')
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        const name = pkg.name || 'Library'
        return name
          .replace(/^@/, '')
          .replace(/[/-]/g, '_')
          .replace(/_(\w)/g, (_, c: string) => c.toUpperCase())
          .replace(/^(\w)/, (c: string) => c.toUpperCase())
      }
    } catch {}
    return 'Library'
  }
}

// 便捷函数
export async function quickBuild(options?: SmartBuilderOptions): Promise<BuildResult> {
  const builder = new SmartBuilder(options)
  return builder.build()
}
