/**
 * Vue SFC 专用构建器（完整版本）
 * 支持 Vue 组件、TypeScript、LESS/CSS，生成正确的输出目录结构
 */

import { rollup } from 'rollup'
import type { RollupOptions, OutputOptions } from 'rollup'
import { join, resolve } from 'path'
import { readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import fg from 'fast-glob'

// 插件导入
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'
import terser from '@rollup/plugin-terser'
import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import dts from 'rollup-plugin-dts'

// LESS 支持
// import less from 'rollup-plugin-less'

// 自定义插件
import { vueTypeScriptPreprocessor } from './plugins/vue-typescript-preprocessor'

/**
 * Vue 构建选项
 */
export interface VueBuildOptions {
  /** 项目根目录 */
  root?: string
  /** 源代码目录 */
  src?: string
  /** 输出格式 */
  formats?: Array<'esm' | 'cjs' | 'umd' | 'dts'>
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
  /** 是否启用 Vue SFC 支持 */
  enableVue?: boolean
  /** 是否生成 DTS 声明文件 */
  generateDts?: boolean
}

/**
 * Vue 构建结果
 */
export interface VueBuildResult {
  success: boolean
  duration: number
  errors: string[]
  skippedVueFiles?: number
  processedTsFiles?: number
}

/**
 * Vue SFC 专用构建器（简化版本）
 */
export class VueBuilder {
  private readonly root: string
  private readonly options: Required<VueBuildOptions>

  constructor(options: VueBuildOptions = {}) {
    this.root = resolve(options.root || process.cwd())
    this.options = {
      root: this.root,
      src: options.src || 'src',
      formats: options.formats || ['esm', 'cjs', 'dts'],
      minify: options.minify ?? true,
      sourcemap: options.sourcemap ?? true,
      external: options.external || [],
      globals: options.globals || {},
      clean: options.clean ?? true,
      enableVue: options.enableVue ?? false, // 默认禁用 Vue，等待配置完善
      generateDts: options.generateDts ?? true
    }
  }

  /**
   * 执行构建
   */
  async build(): Promise<VueBuildResult> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 开始 Vue 完整构建...')

      // 1. 清理输出目录
      if (this.options.clean) {
        await this.cleanOutput()
      }

      // 2. 分析项目文件
      const analysis = await this.analyzeProject()
      console.log(`✅ 项目分析: TS文件${analysis.tsFiles.length}个, Vue文件${analysis.vueFiles.length}个, LESS文件${analysis.styleFiles.length}个`)
      console.log(`🔍 Vue支持: ${this.options.enableVue ? '启用' : '禁用'}`)

      // 3. 创建入口配置
      const entries = await this.createEntries(analysis)
      console.log(`📦 构建入口: ${Object.keys(entries).length} 个文件`)

      if (Object.keys(entries).length === 0) {
        throw new Error('没有找到可以构建的文件')
      }

      // 4. 为每种格式执行构建
      for (const format of this.options.formats) {
        await this.buildFormat(format, entries, analysis)
      }

      const duration = Date.now() - startTime
      console.log(`\n🎉 构建完成! 用时: ${duration}ms`)

      return {
        success: true,
        duration,
        errors: [],
        skippedVueFiles: this.options.enableVue ? 0 : analysis.vueFiles.length,
        processedTsFiles: Object.keys(entries).length
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
    const outputDirs = ['dist', 'esm', 'cjs', 'types']
    
    for (const dir of outputDirs) {
      const outPath = join(this.root, dir)
      if (existsSync(outPath)) {
        rmSync(outPath, { recursive: true, force: true })
      }
    }
    
    console.log('🗑️ 清理输出目录')
  }

  /**
   * 分析项目文件
   */
  private async analyzeProject() {
    const srcDir = join(this.root, this.options.src)
    
    const tsFiles = await fg(['**/*.{ts,tsx}'], {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
    })

    const vueFiles = await fg(['**/*.vue'], {
      cwd: srcDir
    })
    
    const styleFiles = await fg(['**/*.{css,less,scss,sass}'], {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*']
    })

    return {
      tsFiles,
      vueFiles,
      styleFiles,
      hasVue: vueFiles.length > 0,
      hasStyles: styleFiles.length > 0
    }
  }

  /**
   * 创建构建入口配置
   */
  private async createEntries(analysis: any): Promise<Record<string, string>> {
    const srcDir = join(this.root, this.options.src)
    const entries: Record<string, string> = {}
    
    // 1. 添加 TypeScript 文件（跳过有问题的文件）
    for (const file of analysis.tsFiles) {
      const filePath = join(srcDir, file)
      
      // 如果 Vue 支持禁用，跳过可能引用 Vue 文件的文件
      if (!this.options.enableVue && this.hasVueImports(filePath)) {
        console.log(`[Vue支持禁用] 跳过引用Vue的文件: ${file}`)
        continue
      }
      
      const name = file.replace(/\.(ts|tsx)$/, '')
      entries[name] = filePath
    }
    
    // 2. 如果启用 Vue 支持，添加 Vue 文件
    if (this.options.enableVue) {
      for (const file of analysis.vueFiles) {
        const name = file.replace(/\.vue$/, '')
        entries[name] = join(srcDir, file)
      }
    }
    
    return entries
  }
  
  /**
   * 检查文件是否引用 Vue 文件
   */
  private hasVueImports(filePath: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8')
      
      // 检查是否直接导入 .vue 文件
      if (/import.*['"]\..*\.vue['"]/g.test(content)) {
        return true
      }
      
      // 检查是否直接导出 .vue 文件
      if (/export.*['"]\..*\.vue['"]/g.test(content)) {
        return true
      }
      
      // 检查是否导入 components 目录
      if (/from\s+['"]\..*components.*['"]/g.test(content)) {
        return true
      }
      
      // 检查是否导出 components
      if (/export.*from.*['"]\..*components.*['"]/g.test(content)) {
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * 为指定格式执行构建
   */
  private async buildFormat(
    format: 'esm' | 'cjs' | 'umd' | 'dts',
    entries: Record<string, string>,
    analysis: any
  ): Promise<void> {
    console.log(`🔨 构建 ${format.toUpperCase()} 格式...`)

    // Vue项目的DTS特殊处理
    if (format === 'dts' && this.options.enableVue) {
      await this.generateVueDeclarations(entries, analysis)
      console.log(`✅ ${format.toUpperCase()} 格式构建完成`)
      return
    }

    const config = this.createRollupConfig(format, entries, analysis)
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
    format: 'esm' | 'cjs' | 'umd' | 'dts',
    entries: Record<string, string>,
    _analysis: any
  ): RollupOptions {
    // DTS 构建使用不同的配置
    if (format === 'dts') {
      if (this.options.enableVue) {
        // Vue项目使用手动生成声明文件
        throw new Error('Vue projects use manual DTS generation')
      }
      return this.createDtsConfig(entries)
    }
    
    const plugins: any[] = []
    
    // 模块解析 (首先)
    plugins.push(
      nodeResolve({
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.vue', '.json', '.css', '.less', '.scss']
      })
    )
    
    // CommonJS 支持
    plugins.push(commonjs())
    
    // JSON 支持
    plugins.push(json())
    
    // TypeScript 编译 (在 Vue 之前)
    plugins.push(
      esbuild({
        target: 'es2017',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        },
        minify: false // 由 terser 处理压缩
      })
    )
    
    // Vue SFC 支持 (在 TypeScript 之后)
    if (this.options.enableVue) {
      // 先预处理 Vue SFC 中的 TypeScript 类型导入
      plugins.push(
        vueTypeScriptPreprocessor({
          srcDir: this.options.src
        })
      )
      
      // 然后使用 Vue 插件处理 SFC
      plugins.push(
        vue() as any
      )
    }
    
    // LESS 处理 (暂时禁用以测试 Vue 构建)
    // plugins.push(
    //   less({
    //     output: false, // 内联到 JS
    //     option: {
    //       javascriptEnabled: true
    //     }
    //   })
    // )
    
    // CSS/PostCSS 处理
    plugins.push(
      postcss({
        extract: false, // 内联 CSS 到 JS 中
        minimize: this.options.minify && format === 'umd',
        sourceMap: this.options.sourcemap
      })
    )

    // 压缩（只在生产构建或 UMD 格式）
    if (this.options.minify && (format === 'umd' || process.env.NODE_ENV === 'production')) {
      plugins.push(terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: format === 'umd',
          drop_debugger: true
        }
      }))
    }

    return {
      input: format === 'umd' ? this.getSingleEntry(entries) : entries,
      output: this.createOutputOptions(format),
      plugins,
      external: format === 'umd' ? [] : this.createExternal()
    }
  }
  
  /**
   * 为Vue项目创建DTS配置
   */
  private createVueDtsConfig(entries: Record<string, string>): RollupOptions {
    // 只处理纯 TypeScript 文件（不导入Vue文件的）
    const pureTypeScriptEntries: Record<string, string> = {}
    
    for (const [name, path] of Object.entries(entries)) {
      if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        // 对于Vue项目，只包含纯类型文件和工具函数
        if (!this.hasDirectVueImports(path)) {
          pureTypeScriptEntries[name] = path
        }
      }
    }
    
    return {
      input: pureTypeScriptEntries,
      output: {
        dir: join(this.root, 'types'),
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: this.options.src,
        entryFileNames: '[name].d.ts'
      },
      plugins: [
        dts({
          respectExternal: true,
          compilerOptions: {
            preserveSymlinks: false,
            skipLibCheck: true
          }
        })
      ],
      external: this.createExternal()
    }
  }
  
  /**
   * 检查文件是否直接导入Vue文件（包括通过components目录的传递导入）
   */
  private hasDirectVueImports(filePath: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8')
      
      // 检查直接导入.vue文件
      if (/import.*['"]\..*\.vue['"]/g.test(content)) {
        return true
      }
      
      // 检查直接导出.vue文件
      if (/export.*['"]\..*\.vue['"]/g.test(content)) {
        return true
      }
      
      // 检查是否从 components 目录导入（可能包含Vue组件）
      if (/from\s+['"]\..*components.*['"]/g.test(content)) {
        return true
      }
      
      // 检查是否导出components目录
      if (/export.*from.*['"]\..*components.*['"]/g.test(content)) {
        return true
      }
      
      return false
    } catch {
      return false
    }
  }
  
  /**
   * 为Vue项目手动生成声明文件
   */
  private async generateVueDeclarations(entries: Record<string, string>, analysis: any): Promise<void> {
    const typesDir = join(this.root, 'types')
    
    // 确保 types 目录存在
    if (!existsSync(typesDir)) {
      mkdirSync(typesDir, { recursive: true })
    }
    
    // 1. 生成纯TypeScript文件的声明
    await this.generateTsDeclarations(entries, analysis)
    
    // 2. 生成Vue组件的声明文件
    await this.generateVueComponentDeclarations(entries)
    
    // 3. 生成主入口声明文件
    await this.generateMainDeclarations(analysis)
  }
  
  /**
   * 生成TypeScript声明文件
   */
  private async generateTsDeclarations(entries: Record<string, string>, _analysis: any): Promise<void> {
    // 只处理纯TypeScript文件（不引用Vue的）
    const pureTypeScriptEntries: Record<string, string> = {}
    
    for (const [name, path] of Object.entries(entries)) {
      if ((path.endsWith('.ts') || path.endsWith('.tsx')) && !this.hasDirectVueImports(path)) {
        pureTypeScriptEntries[name] = path
      }
    }
    
    if (Object.keys(pureTypeScriptEntries).length === 0) {
      return
    }
    
    const config: RollupOptions = {
      input: pureTypeScriptEntries,
      output: {
        dir: join(this.root, 'types'),
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: this.options.src,
        entryFileNames: '[name].d.ts'
      },
      plugins: [
        dts({
          respectExternal: true,
          compilerOptions: {
            preserveSymlinks: false,
            skipLibCheck: true
          }
        })
      ],
      external: this.createExternal()
    }
    
    const bundle = await rollup(config)
    await bundle.write(config.output as any)
    await bundle.close()
  }
  
  /**
   * 生成Vue组件声明文件
   */
  private async generateVueComponentDeclarations(entries: Record<string, string>): Promise<void> {
    for (const [name, path] of Object.entries(entries)) {
      if (path.endsWith('.vue')) {
        const componentDir = dirname(join(this.root, 'types', name))
        const componentFile = join(this.root, 'types', name + '.d.ts')
        
        // 确保目录存在
        if (!existsSync(componentDir)) {
          mkdirSync(componentDir, { recursive: true })
        }
        
        // 生成简化的Vue组件声明
        const dtsContent = `import { DefineComponent } from 'vue'
declare const _default: DefineComponent<{}, {}, any>
export default _default
`
        
        writeFileSync(componentFile, dtsContent)
      }
    }
  }
  
  /**
   * 生成主入口声明文件
   */
  private async generateMainDeclarations(analysis: any): Promise<void> {
    const mainIndexFile = join(this.root, 'types', 'index.d.ts')
    const componentsIndexFile = join(this.root, 'types', 'components', 'index.d.ts')
    
    // 确保目录存在
    if (!existsSync(dirname(componentsIndexFile))) {
      mkdirSync(dirname(componentsIndexFile), { recursive: true })
    }
    
    // 生成组件入口声明
    let componentsDeclaration = `// Vue 组件声明\n`
    
    for (const vueFile of analysis.vueFiles) {
      const componentName = vueFile.split('/').pop()?.replace('.vue', '') || ''
      const componentPath = './' + vueFile.replace('.vue', '')
      componentsDeclaration += `export { default as ${componentName} } from '${componentPath}'\n`
    }
    
    // 导出组件类型
    componentsDeclaration += `\n// 组件类型定义\n`
    componentsDeclaration += `export type { SelectProps, SelectOption } from './select/types'\n`
    componentsDeclaration += `export type { PopupProps, PopupPlacement } from './popup/types'\n`
    componentsDeclaration += `export type { DialogProps } from './dialog/types'\n`
    
    writeFileSync(componentsIndexFile, componentsDeclaration)
    
    // 生成主入口声明
    const mainDeclaration = `// 导出 Vue 组合式函数\nexport * from './hooks'\n\n// 导出类型定义\nexport * from './types'\n\n// 导出工具函数\nexport * from './utils'\n\n// 导出 UI 组件\nexport * from './components'\n`
    
    writeFileSync(mainIndexFile, mainDeclaration)
  }
  
  /**
   * 创建 DTS 配置
   */
  private createDtsConfig(entries: Record<string, string>): RollupOptions {
    // 如果启用了Vue支持，需要特殊处理
    if (this.options.enableVue) {
      return this.createVueDtsConfig(entries)
    }
    
    // DTS 构建只处理 TypeScript 文件，排除 Vue 文件和引用Vue的文件
    const tsOnlyEntries: Record<string, string> = {}
    for (const [name, path] of Object.entries(entries)) {
      // 只包含 TypeScript 文件，不包含 Vue 文件
      if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        // 跳过引用 Vue 的文件
        if (this.hasVueImports(path)) {
          console.log(`[DTS构建] 跳过引用Vue的文件: ${name}`)
          continue
        }
        tsOnlyEntries[name] = path
      }
    }
    
    return {
      input: tsOnlyEntries,
      output: {
        dir: join(this.root, 'types'),
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: this.options.src,
        entryFileNames: '[name].d.ts'
      },
      plugins: [
        dts({
          respectExternal: true,
          compilerOptions: {
            preserveSymlinks: false
          }
        })
      ],
      external: this.createExternal()
    }
  }

  /**
   * 获取单一入口（用于 UMD）
   */
  private getSingleEntry(entries: Record<string, string>): string {
    return Object.values(entries)[0]
  }

  /**
   * 创建输出选项
   */
  private createOutputOptions(format: 'esm' | 'cjs' | 'umd'): OutputOptions {
    if (format === 'umd') {
      return {
        format: 'umd',
        name: this.getLibraryName(),
        file: join(this.root, 'dist', 'index.umd.js'),
        sourcemap: this.options.sourcemap,
        globals: this.options.globals,
        exports: 'named'
      }
    }

    // ESM -> esm/ 目录, CJS -> cjs/ 目录
    const outDir = format === 'esm' ? 'esm' : 'cjs'
    const ext = format === 'esm' ? 'js' : 'cjs'
    
    return {
      format: format === 'esm' ? 'es' : 'cjs',
      dir: join(this.root, outDir),
      sourcemap: this.options.sourcemap,
      preserveModules: true,
      preserveModulesRoot: this.options.src,
      entryFileNames: `[name].${ext}`,
      chunkFileNames: `[name]-[hash].${ext}`,
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

      return (id: string) => {
        // 不外部化本项目的文件
        if (id.startsWith('.') || id.startsWith('/')) {
          return false
        }
        
        // 外部化依赖包
        return deps.some(dep => 
          id === dep || id.startsWith(`${dep}/`)
        )
      }
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
        
        return name
          .replace(/^@/, '')
          .replace(/[/-]/g, '_')
          .replace(/_(w)/g, (_: any, c: string) => c.toUpperCase())
          .replace(/^(w)/, (c: string) => c.toUpperCase())
      }
    } catch {}
    
    return 'Library'
  }
}

// 便捷函数
export async function buildVueProject(options?: VueBuildOptions): Promise<VueBuildResult> {
  const builder = new VueBuilder(options)
  return builder.build()
}
