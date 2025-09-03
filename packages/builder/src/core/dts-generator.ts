/**
 * DtsGenerator - TypeScript 类型定义生成器
 * 
 * 为项目中的所有 TypeScript 文件生成 .d.ts 类型定义文件
 * 保持原有的目录结构，确保类型定义与源代码对应
 * 
 * 功能特性：
 * - 自动扫描所有 .ts/.tsx 文件
 * - 生成完整的类型定义
 * - 保持目录结构
 * - 处理模块导出和导入
 * - 支持 Vue 组件类型定义
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { join, relative, dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import fg from 'fast-glob'

const execAsync = promisify(exec)

export class DtsGenerator {
  private readonly root: string

  /**
   * 构造函数
   * @param root - 项目根目录
   */
  constructor(root: string) {
    this.root = root
  }

  /**
   * 生成类型定义文件
   * 
   * @param srcDir - 源代码目录
   * @param outDir - 输出目录
   * @returns 生成结果
   */
  async generate(
    srcDir: string,
    outDir: string
  ): Promise<{ success: boolean; files: string[]; errors: string[] }> {
    const errors: string[] = []
    const generatedFiles: string[] = []

    try {
      // 1. 检查 TypeScript 是否可用
      const tscPath = await this.findTscPath()
      if (!tscPath) {
        errors.push('未找到 TypeScript 编译器')
        return { success: false, files: [], errors }
      }

      // 2. 创建临时 tsconfig.json 用于生成类型定义
      const tempTsConfigPath = await this.createTempTsConfig(srcDir, outDir)

      // 3. 使用 tsc 生成类型定义
      console.log('🔨 正在生成类型定义文件...')
      
      try {
        const { stderr } = await execAsync(
          `${tscPath} --project ${tempTsConfigPath}`,
          { cwd: this.root }
        )
        
        if (stderr && !stderr.includes('warning')) {
          console.warn('TypeScript 编译警告:', stderr)
        }
      } catch (error: any) {
        // tsc 可能会报错但仍然生成了文件
        if (error.stderr && !error.stderr.includes('error TS')) {
          console.warn('TypeScript 编译警告:', error.stderr)
        } else {
          throw error
        }
      }

      // 4. 扫描生成的文件
      const dtsFiles = await fg('**/*.d.ts', {
        cwd: outDir,
        absolute: false
      })

      generatedFiles.push(...dtsFiles)

      // 5. 生成额外的类型定义（如 Vue 组件）
      await this.generateVueTypes(srcDir, outDir)

      // 6. 生成主入口的类型定义
      await this.generateIndexDts(srcDir, outDir)

      // 7. 清理临时文件
      await this.cleanupTempFiles(tempTsConfigPath)

      console.log(`✅ 生成了 ${generatedFiles.length} 个类型定义文件`)

      return {
        success: true,
        files: generatedFiles,
        errors
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(errorMsg)
      console.error('❌ 生成类型定义失败:', errorMsg)
      
      return {
        success: false,
        files: generatedFiles,
        errors
      }
    }
  }

  /**
   * 查找 tsc 路径
   */
  private async findTscPath(): Promise<string | null> {
    // 优先使用项目本地的 TypeScript
    const localTsc = join(this.root, 'node_modules', '.bin', 'tsc')
    if (existsSync(localTsc)) {
      return localTsc
    }

    // 检查全局 TypeScript
    try {
      const { stdout } = await execAsync('where tsc', { cwd: this.root })
      return stdout.trim().split('\n')[0]
    } catch {
      try {
        const { stdout } = await execAsync('which tsc', { cwd: this.root })
        return stdout.trim()
      } catch {
        return null
      }
    }
  }

  /**
   * 创建临时 tsconfig.json
   */
  private async createTempTsConfig(srcDir: string, outDir: string): Promise<string> {
    const tempPath = join(this.root, 'tsconfig.dts.json')
    
    // 读取项目的 tsconfig.json（如果存在）
    const projectTsConfigPath = join(this.root, 'tsconfig.json')
    let baseConfig = {}
    
    if (existsSync(projectTsConfigPath)) {
      try {
        const content = readFileSync(projectTsConfigPath, 'utf-8')
        baseConfig = JSON.parse(content)
      } catch {
        console.warn('无法读取项目 tsconfig.json，使用默认配置')
      }
    }

    // 创建用于生成类型定义的配置
    const dtsConfig = {
      ...baseConfig,
      compilerOptions: {
        ...(baseConfig as any).compilerOptions,
        // 覆盖必要的选项
        declaration: true,
        declarationOnly: true,
        emitDeclarationOnly: true,
        declarationDir: outDir,
        outDir: outDir,
        rootDir: srcDir,
        skipLibCheck: true,
        noEmit: false,
        // 保留模块结构
        composite: false,
        incremental: false,
        // 类型相关
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        // 支持的文件类型
        resolveJsonModule: true,
        allowJs: false,
        // 目标
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable']
      },
      include: [
        `${relative(this.root, srcDir)}/**/*.ts`,
        `${relative(this.root, srcDir)}/**/*.tsx`,
        `${relative(this.root, srcDir)}/**/*.vue`
      ],
      exclude: [
        'node_modules',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx',
        '**/dist',
        '**/build'
      ]
    }

    // 写入临时配置文件
    writeFileSync(tempPath, JSON.stringify(dtsConfig, null, 2))
    
    return tempPath
  }

  /**
   * 生成 Vue 组件的类型定义
   */
  private async generateVueTypes(srcDir: string, outDir: string): Promise<void> {
    // 查找所有 Vue 文件
    const vueFiles = await fg('**/*.vue', {
      cwd: srcDir,
      absolute: false
    })

    for (const vueFile of vueFiles) {
      const dtsFile = vueFile.replace(/\.vue$/, '.vue.d.ts')
      const dtsPath = join(outDir, dtsFile)
      
      // 确保目录存在
      const dir = dirname(dtsPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      // 生成基本的 Vue 组件类型定义
      const componentName = this.getComponentName(vueFile)
      const dtsContent = this.generateVueComponentDts(componentName)
      
      writeFileSync(dtsPath, dtsContent)
    }
  }

  /**
   * 生成 Vue 组件的类型定义内容
   */
  private generateVueComponentDts(componentName: string): string {
    return `/**
 * ${componentName} Vue Component Type Definition
 * Auto-generated by @ldesign/builder
 */

import { DefineComponent } from 'vue'

declare const ${componentName}: DefineComponent<{}, {}, any>
export default ${componentName}
`
  }

  /**
   * 从文件路径获取组件名称
   */
  private getComponentName(filePath: string): string {
    const name = filePath
      .split('/')
      .pop()!
      .replace(/\.vue$/, '')
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
      .replace(/^(\w)/, c => c.toUpperCase())
    
    return name
  }

  /**
   * 生成主入口的类型定义
   */
  private async generateIndexDts(srcDir: string, outDir: string): Promise<void> {
    // 查找主入口文件
    const indexFiles = ['index.ts', 'index.tsx', 'main.ts', 'main.tsx']
    let indexFile: string | null = null
    
    for (const file of indexFiles) {
      const path = join(srcDir, file)
      if (existsSync(path)) {
        indexFile = file
        break
      }
    }

    if (!indexFile) {
      // 如果没有主入口文件，创建一个聚合导出
      await this.generateAggregateIndex(srcDir, outDir)
    }
  }

  /**
   * 生成聚合导出的 index.d.ts
   */
  private async generateAggregateIndex(srcDir: string, outDir: string): Promise<void> {
    const tsFiles = await fg('**/*.{ts,tsx}', {
      cwd: srcDir,
      absolute: false,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
    })

    if (tsFiles.length === 0) return

    let exports = '/**\n * Auto-generated type definitions\n * @ldesign/builder\n */\n\n'
    
    for (const file of tsFiles) {
      const modulePath = './' + file.replace(/\.(ts|tsx)$/, '')
      exports += `export * from '${modulePath}'\n`
    }

    const indexDtsPath = join(outDir, 'index.d.ts')
    writeFileSync(indexDtsPath, exports)
  }

  /**
   * 清理临时文件
   */
  private async cleanupTempFiles(tempTsConfigPath: string): Promise<void> {
    try {
      const { unlinkSync } = await import('fs')
      if (existsSync(tempTsConfigPath)) {
        unlinkSync(tempTsConfigPath)
      }
    } catch {
      // 忽略清理错误
    }
  }

  /**
   * 验证类型定义文件
   * 检查生成的类型定义是否有效
   */
  async validate(dtsDir: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    try {
      // 查找所有 .d.ts 文件
      const dtsFiles = await fg('**/*.d.ts', {
        cwd: dtsDir,
        absolute: true
      })

      if (dtsFiles.length === 0) {
        errors.push('未找到任何类型定义文件')
        return { valid: false, errors }
      }

      // 基本验证：检查文件是否为空或格式错误
      for (const file of dtsFiles) {
        const content = readFileSync(file, 'utf-8')
        
        if (content.trim().length === 0) {
          errors.push(`类型定义文件为空: ${relative(dtsDir, file)}`)
        }
        
        // 检查是否有基本的 TypeScript 语法
        if (!content.includes('export') && !content.includes('declare')) {
          errors.push(`类型定义文件可能无效: ${relative(dtsDir, file)}`)
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
      return { valid: false, errors }
    }
  }
}
