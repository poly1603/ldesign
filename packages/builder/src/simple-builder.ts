/**
 * 简化的智能打包器
 * 零配置，自动检测项目类型并生成合适的打包配置
 */

import { rollup } from 'rollup'
import type { RollupOptions, OutputOptions } from 'rollup'
import { join, resolve } from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import fg from 'fast-glob'

// 插件导入
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'
import terser from '@rollup/plugin-terser'
import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'

/**
 * 构建选项
 */
export interface BuildOptions {
  /** 项目根目录 */
  root?: string
  /** 源代码目录 */
  src?: string
  /** 输出目录 */
  outDir?: string
  /** 输出格式 */
  formats?: Array<'esm' | 'cjs' | 'umd'>
  /** 是否压缩 */
  minify?: boolean
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 外部依赖 */
  external?: string[]
  /** UMD 全局变量映射 */
  globals?: Record<string, string>
  /** 是否清理输出目录 */
  clean?: boolean
}

/**
 * 构建结果
 */
export interface Result {
  success: boolean
  duration: number
  errors: string[]
}

/**
 * 简化的智能打包器
 */
export class SimpleBuilder {
  private readonly root: string
  private readonly options: Required<BuildOptions>

  constructor(options: BuildOptions = {}) {
    this.root = resolve(options.root || process.cwd())
    this.options = {
      root: this.root,
      src: options.src || 'src',
      outDir: options.outDir || 'dist',
      formats: options.formats || ['esm', 'cjs', 'umd'],
      minify: options.minify ?? true,
      sourcemap: options.sourcemap ?? true,
      external: options.external || [],
      globals: options.globals || {},
      clean: options.clean ?? true
    }
  }

  /**
   * 执行构建
   */
  async build(): Promise<Result> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 开始智能打包...')

      // 1. 清理输出目录
      if (this.options.clean) {
        await this.cleanOutput()
      }

      // 2. 分析项目
      const projectInfo = await this.analyzeProject()
      console.log(`✅ 检测到项目特征: ${projectInfo.features.join(', ')}`)

      // 3. 获取入口文件
      const entries = await this.getEntries()
      console.log(`📦 找到入口文件: ${Object.keys(entries).length} 个`)

      // 4. 为每种格式执行打包
      for (const format of this.options.formats) {
        await this.buildFormat(format, entries, projectInfo)
      }

      const duration = Date.now() - startTime
      console.log(`\n🎉 构建完成! 用时: ${duration}ms`)

      return {
        success: true,
        duration,
        errors: []
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error('❌ 构建失败:', errorMessage)
      
      return {
        success: false,
        duration,
        errors: [errorMessage]
      }
    }
  }

  /**
   * 清理输出目录
   */
  private async cleanOutput(): Promise<void> {
    const outPath = join(this.root, this.options.outDir)
    if (existsSync(outPath)) {
      rmSync(outPath, { recursive: true, force: true })
      console.log('🗑️  清理输出目录')
    }
  }

  /**
   * 分析项目特征
   */
  private async analyzeProject() {
    const srcDir = join(this.root, this.options.src)
    const features: string[] = []

    // 检查 package.json
    const pkgPath = join(this.root, 'package.json')
    let pkg = {}
    if (existsSync(pkgPath)) {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    }

    const allDeps = {
      ...(pkg as any).dependencies,
      ...(pkg as any).devDependencies,
      ...(pkg as any).peerDependencies
    }

    // 检测技术栈
    if (allDeps.vue) features.push('Vue')
    if (allDeps.react) features.push('React')
    if (allDeps.typescript) features.push('TypeScript')

    // 检测文件类型
    const tsFiles = await fg(['**/*.{ts,tsx}'], { cwd: srcDir })
    if (tsFiles.length > 0) features.push('TypeScript Files')

    const vueFiles = await fg(['**/*.vue'], { cwd: srcDir })
    if (vueFiles.length > 0) features.push('Vue SFC')

    const jsxFiles = await fg(['**/*.{jsx,tsx}'], { cwd: srcDir })
    if (jsxFiles.length > 0) features.push('JSX')

    const cssFiles = await fg(['**/*.{css,less,scss,sass}'], { cwd: srcDir })
    if (cssFiles.length > 0) features.push('Styles')

    return {
      features,
      hasTypeScript: features.includes('TypeScript') || features.includes('TypeScript Files'),
      hasVue: features.includes('Vue') || features.includes('Vue SFC'),
      hasReact: features.includes('React'),
      hasJsx: features.includes('JSX'),
      pkg
    }
  }

  /**
   * 获取入口文件
   */
  private async getEntries(): Promise<Record<string, string>> {
    const srcDir = join(this.root, this.options.src)
    
    // 查找所有入口文件
    const files = await fg(['**/*.{js,ts,tsx,jsx,vue}'], {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
    })

    const entries: Record<string, string> = {}
    
    // 对于 UMD，优先使用 index 文件
    if (this.options.formats.includes('umd')) {
      const indexFile = this.findIndexFile(srcDir)
      if (indexFile) {
        entries.index = indexFile
        return entries
      }
    }

    // 对于其他格式，使用所有文件
    for (const file of files) {
      const name = file.replace(/\.(js|ts|tsx|jsx|vue)$/, '')
      entries[name] = join(srcDir, file)
    }

    return entries
  }

  /**
   * 查找主入口文件
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
   * 为指定格式执行构建
   */
  private async buildFormat(
    format: 'esm' | 'cjs' | 'umd',
    entries: Record<string, string>,
    projectInfo: any
  ): Promise<void> {
    console.log(`🔨 正在构建 ${format.toUpperCase()} 格式...`)

    const config = this.createRollupConfig(format, entries, projectInfo)
    const bundle = await rollup(config)

    const outputs = Array.isArray(config.output) ? config.output : [config.output!]
    for (const output of outputs) {
      await bundle.write(output)
    }

    await bundle.close()
    console.log(`✅ ${format.toUpperCase()} 格式构建完成`)
  }

  /**
   * 创建 Rollup 配置
   */
  private createRollupConfig(
    format: 'esm' | 'cjs' | 'umd',
    entries: Record<string, string>,
    projectInfo: any
  ): RollupOptions {
    const plugins: any[] = [
      nodeResolve({
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.vue', '.json']
      }),
      commonjs(),
      json(),
      // CSS/Less/Sass 支持
      postcss({
        extensions: ['.css', '.less', '.scss', '.sass'],
        extract: false, // 内联到 JS 中
        minimize: this.options.minify,
        use: [
          'less'
        ]
      })
    ]
    
    // Vue 支持 (需要在 TypeScript 之前)
    if (projectInfo.hasVue) {
      // 使用简化配置避免 TypeScript 编译错误
      plugins.push(vue())
    }

    // TypeScript/JSX 支持
    if (projectInfo.hasTypeScript || projectInfo.hasJsx) {
      plugins.push(esbuild({
        target: 'es2017',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.jsx': 'jsx'
        }
      }))
    }

    // 压缩
    if (this.options.minify && format === 'umd') {
      plugins.push(terser())
    }

    return {
      input: format === 'umd' ? entries.index || Object.values(entries)[0] : entries,
      output: this.createOutputOptions(format),
      plugins,
      external: this.createExternal()
    }
  }

  /**
   * 创建输出选项
   */
  private createOutputOptions(format: 'esm' | 'cjs' | 'umd'): OutputOptions {
    const outDir = join(this.root, this.options.outDir)

    if (format === 'umd') {
      return {
        format: 'umd',
        name: this.getLibraryName(),
        file: join(outDir, 'umd', 'index.umd.js'),
        sourcemap: this.options.sourcemap,
        globals: this.options.globals,
        exports: 'named'
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
   * 创建外部依赖配置
   */
  private createExternal(): string[] | ((id: string) => boolean) {
    const pkgPath = join(this.root, 'package.json')
    const userExternal = this.options.external

    if (!existsSync(pkgPath)) {
      return userExternal
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...userExternal
      ]

      return (id: string) => deps.some(dep => 
        id === dep || id.startsWith(`${dep}/`)
      )
    } catch {
      return userExternal
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
        
        // 转换为合法的全局变量名
        return name
          .replace(/^@/, '')
          .replace(/[/-]/g, '_')
          .replace(/_(\w)/g, (_: any, c: string) => c.toUpperCase())
          .replace(/^(\w)/, (c: string) => c.toUpperCase())
      }
    } catch {}
    
    return 'Library'
  }
}

/**
 * 快速构建函数
 */
export async function build(options?: BuildOptions): Promise<Result> {
  const builder = new SimpleBuilder(options)
  return await builder.build()
}

/**
 * 导出默认构建器
 */
export default SimpleBuilder
